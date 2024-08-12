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
  setDoc,
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
            fetchAttendanceRecords(docId);
          } else {
            console.error("Employee data not found for email:", storedEmail);
          }
        } else {
          console.error("Stored email or document ID is missing");
          navigate("/employee-login"); // Redirect to login if missing
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    };

    const fetchAttendanceRecords = async (docId) => {
      try {
        const logsCollectionRef = collection(db, "timelogs", docId, "logs");
        const querySnapshot = await getDocs(logsCollectionRef);

        const records = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setAttendanceRecords(records);
      } catch (error) {
        console.error("Error fetching attendance records:", error);
      }
    };

    fetchEmployeeData();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("rememberedEmployeeEmail");
    localStorage.removeItem("employeeDocId");
    navigate("/employee-login");
  };

  const handleTimeIn = async () => {
    if (status === "Clocked Out" || status === "On Break") {
      try {
        const docId = localStorage.getItem("employeeDocId");

        if (docId === currentUser.uid) {
          // Ensure docId matches the authenticated user’s UID
          const logRef = await addDoc(
            collection(db, "timelogs", docId, "logs"),
            {
              status: "Clocked In",
              timeIn: new Date(),
              timeOut: null,
              breakStart: null,
              breakEnd: null,
            }
          );

          setAttendanceRecords((prevRecords) => [
            ...prevRecords,
            { id: logRef.id, status: "Clocked In", timeIn: new Date() },
          ]);
          setStatus("Clocked In");
          setCurrentLogId(logRef.id);

          startTimer();
        } else {
          console.error("User ID does not match authenticated user.");
        }
      } catch (error) {
        console.error("Error recording Time In:", error);
      }
    }
  };

  const handleBreakStart = async () => {
    if (status === "Clocked In") {
      try {
        const docId = localStorage.getItem("employeeDocId");

        // Update the current log in the logs subcollection
        const logRef = doc(db, "timelogs", docId, "logs", currentLogId);
        await updateDoc(logRef, {
          status: "On Break",
          breakStart: new Date(),
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

        // Update the current log in the logs subcollection
        const logRef = doc(db, "timelogs", docId, "logs", currentLogId);
        await updateDoc(logRef, {
          status: "Clocked In",
          breakEnd: new Date(),
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

        // Update the current log in the logs subcollection
        const logRef = doc(db, "timelogs", docId, "logs", currentLogId);
        await updateDoc(logRef, {
          status: "Clocked Out",
          timeOut: new Date(),
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

        <div className="mb-4">
          <p>Status: {status}</p>
          {isTimerRunning && <p>Timer: {formatTime(timer)}</p>}
        </div>

        <h2 className="text-lg font-semibold mb-4">Attendance Records</h2>
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="border px-4 py-2">Status</th>
              <th className="border px-4 py-2">Time In</th>
              <th className="border px-4 py-2">Break Start</th>
              <th className="border px-4 py-2">Break End</th>
              <th className="border px-4 py-2">Time Out</th>
            </tr>
          </thead>
          <tbody>
            {attendanceRecords.map((record) => (
              <tr key={record.id}>
                <td className="border px-4 py-2">{record.status}</td>
                <td className="border px-4 py-2">
                  {record.timeIn ? record.timeIn.toDate().toLocaleString() : ""}
                </td>
                <td className="border px-4 py-2">
                  {record.breakStart
                    ? record.breakStart.toDate().toLocaleString()
                    : ""}
                </td>
                <td className="border px-4 py-2">
                  {record.breakEnd
                    ? record.breakEnd.toDate().toLocaleString()
                    : ""}
                </td>
                <td className="border px-4 py-2">
                  {record.timeOut
                    ? record.timeOut.toDate().toLocaleString()
                    : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
