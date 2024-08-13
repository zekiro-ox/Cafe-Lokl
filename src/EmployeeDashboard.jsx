import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt } from "react-icons/fa";
import { db } from "./config/firebase";
import {
  getDocs,
  query,
  where,
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  Timestamp,
} from "firebase/firestore";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [employeeName, setEmployeeName] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [status, setStatus] = useState("Clocked Out");
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentLogId, setCurrentLogId] = useState(null);

  const timerRef = useRef(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const storedEmail = localStorage.getItem("rememberedEmployeeEmail");
        const docId = localStorage.getItem("employeeDocId");

        if (storedEmail && docId) {
          const q = query(
            collection(db, "accounts"),
            where("email", "==", storedEmail)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            const employeeDoc = querySnapshot.docs[0];
            const employeeData = employeeDoc.data();
            setEmployeeName(employeeData.name);
            await fetchAttendanceRecords(docId);
          } else {
            console.error("Employee data not found for email:", storedEmail);
            navigate("/employee-login");
          }
        } else {
          console.error("Stored email or document ID is missing");
          navigate("/employee-login"); // Redirect to login if missing
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    };

    fetchEmployeeData();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [navigate]);

  const fetchAttendanceRecords = async (docId) => {
    try {
      const logsCollection = collection(db, "timelogs", docId, "logs");
      const logsSnapshot = await getDocs(logsCollection);
      const logsData = logsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setAttendanceRecords(logsData);
    } catch (error) {
      console.error("Error fetching attendance records:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("rememberedEmployeeEmail");
    localStorage.removeItem("employeeDocId");
    navigate("/employee-login");
  };

  const handleTimeIn = async () => {
    if (status === "Clocked Out" || status === "On Break") {
      try {
        const docId = localStorage.getItem("employeeDocId");

        const logRef = await addDoc(collection(db, "timelogs", docId, "logs"), {
          status: "Clocked In",
          timeIn: Timestamp.fromDate(new Date()),
          timeOut: null,
          breakStart: null,
          breakEnd: null,
        });

        setAttendanceRecords((prevRecords) => [
          ...prevRecords,
          { id: logRef.id, status: "Clocked In", timeIn: new Date() },
        ]);
        setStatus("Clocked In");
        setCurrentLogId(logRef.id);

        startTimer();
      } catch (error) {
        console.error("Error recording Time In:", error);
      }
    }
  };

  const handleBreakStart = async () => {
    if (status === "Clocked In") {
      try {
        const docId = localStorage.getItem("employeeDocId");

        const logRef = doc(db, "timelogs", docId, "logs", currentLogId);
        await updateDoc(logRef, {
          status: "On Break",
          breakStart: Timestamp.fromDate(new Date()),
        });

        setAttendanceRecords((prevRecords) =>
          prevRecords.map((record) =>
            record.id === currentLogId
              ? { ...record, status: "On Break", breakStart: new Date() }
              : record
          )
        );
        setStatus("On Break");

        stopTimer();
      } catch (error) {
        console.error("Error recording Break Start:", error);
      }
    }
  };

  const handleBreakEnd = async () => {
    if (status === "On Break") {
      try {
        const docId = localStorage.getItem("employeeDocId");

        const logRef = doc(db, "timelogs", docId, "logs", currentLogId);
        await updateDoc(logRef, {
          status: "Clocked In",
          breakEnd: Timestamp.fromDate(new Date()),
        });

        setAttendanceRecords((prevRecords) =>
          prevRecords.map((record) =>
            record.id === currentLogId
              ? { ...record, status: "Clocked In", breakEnd: new Date() }
              : record
          )
        );
        setStatus("Clocked In");

        startTimer();
      } catch (error) {
        console.error("Error recording Break End:", error);
      }
    }
  };

  const handleTimeOut = async () => {
    if (status === "Clocked In" || status === "On Break") {
      try {
        const docId = localStorage.getItem("employeeDocId");

        const logRef = doc(db, "timelogs", docId, "logs", currentLogId);
        await updateDoc(logRef, {
          status: "Clocked Out",
          timeOut: Timestamp.fromDate(new Date()),
        });

        setAttendanceRecords((prevRecords) =>
          prevRecords.map((record) =>
            record.id === currentLogId
              ? { ...record, status: "Clocked Out", timeOut: new Date() }
              : record
          )
        );
        setStatus("Clocked Out");

        stopTimer();
      } catch (error) {
        console.error("Error recording Time Out:", error);
      }
    }
  };

  const startTimer = () => {
    setIsTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTimer((prevTimer) => prevTimer + 1);
    }, 1000);
  };

  const stopTimer = () => {
    setIsTimerRunning(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}:${mins}:${secs}`;
  };

  const formatDate = (timestamp) => {
    return timestamp ? new Date(timestamp.seconds * 1000).toLocaleString() : "";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-brown-500 p-4 flex justify-between">
        <div className="text-white font-semibold">Employee Dashboard</div>
        <div className="text-white font-semibold">Welcome, {employeeName}</div>
        <button
          onClick={handleLogout}
          className="text-white hover:text-brown-300"
        >
          <FaSignOutAlt />
        </button>
      </nav>
      <div className="container mx-auto p-4">
        <div className="flex justify-between mb-4">
          <button
            onClick={handleTimeIn}
            className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
            disabled={status !== "Clocked Out"}
          >
            Time In
          </button>
          <button
            onClick={handleBreakStart}
            className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600"
            disabled={status !== "Clocked In"}
          >
            Break Start
          </button>
          <button
            onClick={handleBreakEnd}
            className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600"
            disabled={status !== "On Break"}
          >
            Break End
          </button>
          <button
            onClick={handleTimeOut}
            className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
            disabled={status === "Clocked Out"}
          >
            Time Out
          </button>
        </div>

        <div className="flex justify-center mb-4">
          <div className="bg-white p-4 rounded-md shadow-md">
            <div className="text-2xl font-semibold">
              Timer: {formatTime(timer)}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-md shadow-md">
          <h2 className="text-xl font-semibold mb-4">Attendance Records</h2>
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Status</th>
                <th className="py-2 px-4 border-b">Time In</th>
                <th className="py-2 px-4 border-b">Break Start</th>
                <th className="py-2 px-4 border-b">Break End</th>
                <th className="py-2 px-4 border-b">Time Out</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record) => (
                <tr key={record.id}>
                  <td className="py-2 px-4 border-b">{record.status}</td>
                  <td className="py-2 px-4 border-b">
                    {formatDate(record.timeIn)}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {formatDate(record.breakStart)}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {formatDate(record.breakEnd)}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {formatDate(record.timeOut)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
