import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlay, FaPause, FaStop } from "react-icons/fa";
import { db } from "./config/firebase";
import {
  getDoc,
  collection,
  addDoc,
  updateDoc,
  doc,
  Timestamp,
  onSnapshot,
} from "firebase/firestore";
// Import the modal
import EmployeeSidebar from "./EmployeeSidebar"; // Import the sidebar// Import the UpcomingOrders component

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [employeeName, setEmployeeName] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [status, setStatus] = useState("Clocked Out");
  const [timer, setTimer] = useState(0);
  const [currentLogId, setCurrentLogId] = useState(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  // Store user ID
  const timerRef = useRef(null);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      try {
        const docId = localStorage.getItem("employeeDocId");

        if (docId) {
          const employeeDocRef = doc(db, "accounts", docId);
          const employeeDoc = await getDoc(employeeDocRef);

          if (employeeDoc.exists()) {
            const employeeData = employeeDoc.data();
            const fullName = `${employeeData.firstName} ${employeeData.lastName}`;
            setEmployeeName(fullName);
            fetchAttendanceRecords(docId);
          } else {
            console.error("Employee data not found for document ID:", docId);
            navigate("/employee-login");
          }
        } else {
          console.error("Document ID is missing");
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

        logsData.sort((a, b) => {
          const timeA = a.timeIn ? a.timeIn.toDate().getTime() : 0;
          const timeB = b.timeIn ? b.timeIn.toDate().getTime() : 0;
          return timeB - timeA;
        });

        setAttendanceRecords(logsData);
      },
      (error) => {
        console.error("Error fetching attendance records:", error);
      }
    );

    return () => unsubscribe();
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
      setTimer(0); // Reset the timer to 0
      stopTimer(); // Ensure the timer is stopped
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
    <div className="flex bg-gray-100 min-h-screen">
      {/* Sidebar */}
      <EmployeeSidebar />
      {/* Main Content */}
      <div className="flex-1 p-4 sm:ml-64">
        <div className="container mx-auto">
          <h2 className="text-2xl font-bold mb-4">Welcome, {employeeName}</h2>
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
            <table className="min-w-full bg-white rounded-lg shadow-md">
              <thead className="bg-brown-500 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Time In</th>
                  <th className="py-3 px-4 text-left">Break Start</th>
                  <th className="py-3 px-4 text-left">Break End</th>
                  <th className="py-3 px-4 text-left">Time Out</th>
                  <th className="py-3 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {attendanceRecords.map((record, index) => (
                  <tr
                    key={index}
                    className={`border-b ${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    }`}
                  >
                    <td className="py-3 px-4">{formatDate(record.timeIn)}</td>
                    <td className="py-3 px-4">
                      {formatTimeOnly(record.timeIn)}
                    </td>
                    <td className="py-3 px-4">
                      {formatTimeOnly(record.breakStart)}
                    </td>
                    <td className="py-3 px-4">
                      {formatTimeOnly(record.breakEnd)}
                    </td>
                    <td className="py-3 px-4">
                      {formatTimeOnly(record.timeOut)}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          record.status === "Clocked In"
                            ? "bg-green-100 text-green-600"
                            : record.status === "On Break"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
