import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaSignOutAlt, FaPlay, FaPause, FaStop } from "react-icons/fa";
import { db } from "./config/firebase";
import {
  getDocs,
  query,
  where,
  collection,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  onSnapshot,
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
            navigate("/employee-login");
          }
        } else {
          console.error("Stored email or document ID is missing");
          navigate("/employee-login");
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

  const fetchAttendanceRecords = (docId) => {
    const logsCollection = collection(db, "timelogs", docId, "logs");
    const unsubscribe = onSnapshot(
      logsCollection,
      (snapshot) => {
        const logsData = snapshot.docs.map((doc) => {
          const data = doc.data();
          const timerStart = data.timerStart
            ? data.timerStart.toDate().getTime()
            : null;
          const now = new Date().getTime();
          const elapsed = timerStart
            ? Math.floor((now - timerStart) / 1000)
            : 0;

          return {
            id: doc.id,
            ...data,
            elapsed,
          };
        });

        // Sort logsData by timeIn in descending order
        logsData.sort((a, b) => {
          const timeA = a.timeIn ? a.timeIn.toDate().getTime() : 0;
          const timeB = b.timeIn ? b.timeIn.toDate().getTime() : 0;
          return timeB - timeA; // Sort in descending order
        });

        setAttendanceRecords(logsData);
      },
      (error) => {
        console.error("Error fetching attendance records:", error);
      }
    );

    return () => unsubscribe();
  };

  const handleLogout = async () => {
    if (status === "Clocked In" || status === "On Break") {
      try {
        const docId = localStorage.getItem("employeeDocId");
        const logRef = doc(db, "timelogs", docId, "logs", currentLogId);

        await updateDoc(logRef, {
          status: status === "Clocked In" ? "Clocked Out" : status,
          timeOut:
            status === "Clocked In" ? Timestamp.fromDate(new Date()) : null,
        });

        setAttendanceRecords((prevRecords) =>
          prevRecords.map((record) =>
            record.id === currentLogId
              ? {
                  ...record,
                  status: status === "Clocked In" ? "Clocked Out" : status,
                  timeOut: status === "Clocked In" ? new Date() : null,
                }
              : record
          )
        );
        setStatus("Clocked Out");
        stopTimer();
      } catch (error) {
        console.error("Error updating log before logout:", error);
      }
    }

    localStorage.removeItem(" rememberedEmployeeEmail");
    localStorage.removeItem("employeeDocId");
    navigate("/employee-login");
  };

  const handleTimeIn = async () => {
    if (status === "Clocked Out") {
      try {
        const docId = localStorage.getItem("employeeDocId");
        const logRef = await addDoc(collection(db, "timelogs", docId, "logs"), {
          status: "Clocked In",
          timeIn: Timestamp.fromDate(new Date()),
          timeOut: null,
          breakStart: null,
          breakEnd: null,
          timerStart: new Date(),
        });

        // Set the current log ID for future updates
        setCurrentLogId(logRef.id);
        setStatus("Clocked In");
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

        if (!currentLogId) {
          console.error("No current log ID set. Cannot update Break Start.");
          return;
        }

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

        if (!currentLogId) {
          console.error("No current log ID set. Cannot update Break End.");
          return;
        }

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

        if (!currentLogId) {
          console.error("No current log ID set. Cannot update Time Out.");
          return;
        }

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
        setCurrentLogId(null);
      } catch (error) {
        console.error("Error recording Time Out:", error);
      }
    }
  };

  const handleDone = () => {
    const docId = localStorage.getItem("employeeDocId");
    if (docId) {
      fetchAttendanceRecords(docId); // Refresh attendance records
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
    const hrs = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const mins = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const secs = String(seconds % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  };

  const formatDate = (timestamp) => {
    return timestamp && timestamp.seconds
      ? new Date(timestamp.seconds * 1000).toLocaleDateString()
      : "";
  };

  const formatTimeOnly = (timestamp) => {
    return timestamp && timestamp.seconds
      ? new Date(timestamp.seconds * 1000).toLocaleTimeString()
      : "";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-brown-500 p-4 flex justify-between items-center">
        <div className="text-white text-xl font-bold">Dashboard</div>
        <div className="text-white font-semibold italic text-lg">
          Welcome, {employeeName}
        </div>
        <button
          onClick={handleLogout}
          className="text-white hover:text-brown-300 flex items-center space-x-2"
        >
          <FaSignOutAlt />
        </button>
      </nav>

      <div className="container mx-auto p-4">
        <div className="flex flex-wrap justify-center sm:justify-between space-x-4 mb-4">
          <button
            onClick={handleTimeIn}
            className="bg-green-500 text-white py-2 px-4 rounded-md flex items-center space-x-2 hover:bg-green-600 disabled:opacity-50"
            disabled={status !== "Clocked Out"}
          >
            <FaPlay className="text-lg" />
            <span className="hidden sm:inline">Time In</span>
          </button>
          <button
            onClick={handleBreakStart}
            className="bg-yellow-500 text-white py-2 px-4 rounded-md flex items-center space-x-2 hover:bg-yellow-600 disabled:opacity-50"
            disabled={status !== "Clocked In"}
          >
            <FaPause className="text-lg" />
            <span className="hidden sm:inline">Break Start</span>
          </button>
          <button
            onClick={handleBreakEnd}
            className="bg-yellow-500 text-white py-2 px-4 rounded-md flex items-center space-x-2 hover:bg-yellow-600 disabled:opacity-50"
            disabled={status !== "On Break"}
          >
            <FaPlay className="text-lg" />
            <span className="hidden sm:inline">Break End</span>
          </button>
          <button
            onClick={handleTimeOut}
            className="bg-red-500 text-white py-2 px-4 rounded-md flex items-center space-x-2 hover:bg-red-600 disabled:opacity-50"
            disabled={status === "Clocked Out"}
          >
            <FaStop className="text-lg" />
            <span className="hidden sm:inline">Time Out</span>
          </button>
          <button
            onClick={handleDone}
            className="bg-blue-500 text-white py-2 px-4 rounded-md flex items-center space-x-2 hover:bg-blue-600"
          >
            <span className="hidden sm:inline">Done</span>
          </button>
        </div>

        <div className="text-center text-2xl font-bold mb-4">
          Timer: {formatTime(timer)}
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-left">Date</th>
                <th className="py-2 px-4 border-b text-left">Time In</th>
                <th className="py-2 px-4 border-b text-left">Break Start</th>
                <th className="py-2 px-4 border-b text-left">Break End</th>
                <th className="py-2 px-4 border-b text-left">Time Out</th>
                <th className="py-2 px-4 border-b text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {attendanceRecords.map((record) => (
                <tr key={record.id}>
                  <td className="py-2 px-4 border-b">
                    {formatDate(record.timeIn)}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {formatTimeOnly(record.timeIn)}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {formatTimeOnly(record.breakStart)}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {formatTimeOnly(record.breakEnd)}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {formatTimeOnly(record.timeOut)}
                  </td>
                  <td className="py-2 px-4 border-b">{record.status}</td>
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
