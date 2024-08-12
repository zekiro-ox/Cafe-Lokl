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
  setDoc,
} from "firebase/firestore";

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const [employeeName, setEmployeeName] = useState("");
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [status, setStatus] = useState("Clocked Out");
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [currentRecordId, setCurrentRecordId] = useState(null);

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
        }
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    };

    const fetchAttendanceRecords = async (docId) => {
      try {
        const q = query(
          collection(db, "timelogs"),
          where("employeeDocId", "==", docId)
        );
        const querySnapshot = await getDocs(q);

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
    if (status === "Clocked Out") {
      const employeeDocId = localStorage.getItem("employeeDocId");
      if (!employeeDocId) {
        console.error("Employee document ID is not available.");
        return;
      }

      const currentDate = new Date();
      const dateString = `${currentDate.getFullYear()}-${(
        currentDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${currentDate
        .getDate()
        .toString()
        .padStart(2, "0")}`;

      console.log("employeeDocId:", employeeDocId);
      console.log("dateString:", dateString);

      const collectionRef = collection(
        db,
        "timelogs",
        employeeDocId,
        dateString
      );

      const newRecord = {
        employeeDocId,
        timeIn: new Date(),
        status: "Clocked In",
      };

      const docRef = doc(collectionRef, "record");
      await setDoc(docRef, newRecord, { merge: true });

      setCurrentRecordId(docRef.id);
      setStatus("Clocked In");
      startTimer();
    }
  };

  const handleTimeOut = async () => {
    if (status === "Clocked In") {
      const employeeDocId = localStorage.getItem("employeeDocId");
      const currentDate = new Date();
      const dateString = `${currentDate.getFullYear()}-${(
        currentDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${currentDate
        .getDate()
        .toString()
        .padStart(2, "0")}`;

      const collectionRef = collection(
        db,
        "timelogs",
        employeeDocId,
        dateString
      );
      const docRef = doc(collectionRef, "record");

      await updateDoc(docRef, {
        timeOut: new Date(),
        status: "Clocked Out",
      });

      setStatus("Clocked Out");
      stopTimer();
    }
  };

  const handleBreakStart = async () => {
    if (status === "Clocked In") {
      const employeeDocId = localStorage.getItem("employeeDocId");
      const currentDate = new Date();
      const dateString = `${currentDate.getFullYear()}-${(
        currentDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${currentDate
        .getDate()
        .toString()
        .padStart(2, "0")}`;

      const collectionRef = collection(
        db,
        "timelogs",
        employeeDocId,
        dateString
      );
      const docRef = doc(collectionRef, "record");

      await updateDoc(docRef, {
        breakStart: new Date(),
        status: "On Break",
      });

      setStatus("On Break");
    }
  };

  const handleBreakEnd = async () => {
    if (status === "On Break") {
      const employeeDocId = localStorage.getItem("employeeDocId");
      const currentDate = new Date();
      const dateString = `${currentDate.getFullYear()}-${(
        currentDate.getMonth() + 1
      )
        .toString()
        .padStart(2, "0")}-${currentDate
        .getDate()
        .toString()
        .padStart(2, "0")}`;

      const collectionRef = collection(
        db,
        "timelogs",
        employeeDocId,
        dateString
      );
      const docRef = doc(collectionRef, "record");

      await updateDoc(docRef, {
        breakEnd: new Date(),
        status: "Clocked In",
      });

      setStatus("Clocked In");
    }
  };

  const startTimer = () => {
    if (!isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
      setIsTimerRunning(true);
    }
  };

  const stopTimer = () => {
    if (isTimerRunning) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setIsTimerRunning(false);
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-brown-500 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Employee Dashboard</h1>
          <div>
            <span className="mr-4">{employeeName}</span>
            <button
              onClick={handleLogout}
              className="text-white hover:text-gray-200"
            >
              <FaSignOutAlt className="inline-block mr-1" />
              Logout
            </button>
          </div>
        </div>
      </nav>
      <div className="container mx-auto p-4">
        <div className="mb-4">
          <button
            onClick={handleTimeIn}
            className="bg-green-500 text-white px-4 py-2 rounded mr-2"
          >
            Time In
          </button>
          <button
            onClick={handleBreakStart}
            className="bg-yellow-500 text-white px-4 py-2 rounded mr-2"
          >
            Break Start
          </button>
          <button
            onClick={handleBreakEnd}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            Break End
          </button>
          <button
            onClick={handleTimeOut}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Time Out
          </button>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Current Status: {status}</h2>
          <p className="text-sm">Elapsed Time: {formatTime(timer)}</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold mb-2">Attendance Records</h2>
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Time In</th>
                <th className="py-2 px-4 border-b">Time Out</th>
                <th className="py-2 px-4 border-b">Break Start</th>
                <th className="py-2 px-4 border-b">Break End</th>
                <th className="py-2 px-4 border-b">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record) => (
                <tr key={record.id}>
                  <td className="py-2 px-4 border-b">
                    {record.timeIn
                      ? new Date(record.timeIn.seconds * 1000).toLocaleString()
                      : "-"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {record.timeOut
                      ? new Date(record.timeOut.seconds * 1000).toLocaleString()
                      : "-"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {record.breakStart
                      ? new Date(
                          record.breakStart.seconds * 1000
                        ).toLocaleString()
                      : "-"}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {record.breakEnd
                      ? new Date(
                          record.breakEnd.seconds * 1000
                        ).toLocaleString()
                      : "-"}
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
