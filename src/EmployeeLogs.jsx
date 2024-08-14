import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import Sidebar from "./Sidebar";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "./config/firebase";

const EmployeeLog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [employees, setEmployees] = useState({});
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);
  const [logs, setLogs] = useState([]);
  const [editLogId, setEditLogId] = useState(null);
  const [newTimeOut, setNewTimeOut] = useState("");

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const employeesCollection = collection(db, "accounts");
        const employeeSnapshot = await getDocs(employeesCollection);
        const employeeList = employeeSnapshot.docs.reduce((acc, doc) => {
          acc[doc.id] = doc.data();
          return acc;
        }, {});
        setEmployees(employeeList);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };

    fetchEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      const fetchLogs = async () => {
        try {
          const logsCollection = collection(
            db,
            "timelogs",
            selectedEmployeeId,
            "logs"
          );
          const logSnapshot = await getDocs(logsCollection);
          const logList = logSnapshot.docs.map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              employeeName: employees[selectedEmployeeId]?.name,
              timeIn: data.timeIn ? data.timeIn.toDate() : null,
              timeOut: data.timeOut ? data.timeOut.toDate() : null,
              breakStart: data.breakStart ? data.breakStart.toDate() : null,
              breakEnd: data.breakEnd ? data.breakEnd.toDate() : null,
              timerStart: data.timerStart ? data.timerStart.toDate() : null,
              date: data.timeIn
                ? new Date(data.timeIn.toDate().toDateString())
                : null,
            };
          });
          setLogs(logList);
        } catch (error) {
          console.error("Error fetching logs:", error);
        }
      };

      fetchLogs();
    }
  }, [selectedEmployeeId, employees]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleTimeOutChange = (event) => {
    setNewTimeOut(event.target.value);
  };

  const handleSaveTimeOut = async (id) => {
    if (!newTimeOut) {
      alert("Please select a time before saving.");
      return;
    }

    try {
      const logRef = doc(db, "timelogs", selectedEmployeeId, "logs", id);
      const [hours, minutes] = newTimeOut.split(":");
      const updatedTimeOut = new Date();
      updatedTimeOut.setHours(hours, minutes, 0, 0);

      await updateDoc(logRef, {
        timeOut: updatedTimeOut,
      });

      setLogs((prevLogs) =>
        prevLogs.map((log) =>
          log.id === id ? { ...log, timeOut: updatedTimeOut } : log
        )
      );
      setEditLogId(null);
      setNewTimeOut("");
    } catch (error) {
      console.error("Error updating time out:", error);
    }
  };

  const formatDate = (date) => {
    return date ? new Date(date).toLocaleDateString() : "";
  };

  const formatTime = (date) => {
    return date
      ? new Date(date).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        })
      : "";
  };

  const filteredLogs = logs.filter((log) => {
    const logName = log.employeeName ? log.employeeName.toLowerCase() : "";
    const logDate = log.date ? formatDate(log.date) : "";

    return (
      logName.includes(searchTerm.toLowerCase()) || logDate.includes(searchTerm)
    );
  });

  return (
    <div className="p-6 lg:ml-64 bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="p-6 bg-white shadow-lg rounded-lg mt-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Employee Logs</h2>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <select
                onChange={(e) => setSelectedEmployeeId(e.target.value)}
                className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
              >
                <option value="">Select Employee</option>
                {Object.keys(employees).map((employeeId) => (
                  <option key={employeeId} value={employeeId}>
                    {employees[employeeId]?.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500 w-full md:w-auto"
              />
              <FaSearch className="absolute top-3 left-2 text-gray-500" />
            </div>
          </div>
        </div>
        {selectedEmployeeId && (
          <div className="overflow-x-auto mt-6">
            <table className="min-w-full bg-white rounded-lg shadow-md">
              <thead className="bg-brown-500 text-white">
                <tr>
                  <th className="py-3 px-4 text-left">Name</th>
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Time In</th>
                  <th className="py-3 px-4 text-left">Time Out</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b">
                    <td className="py-3 px-4">{log.employeeName}</td>
                    <td className="py-3 px-4">{formatDate(log.date)}</td>
                    <td className="py-3 px-4">{formatTime(log.timeIn)}</td>
                    <td className="py-3 px-4">
                      {editLogId === log.id ? (
                        <div className="flex items-center">
                          <input
                            type="time"
                            value={
                              newTimeOut ||
                              (log.timeOut
                                ? new Date(log.timeOut)
                                    .toISOString()
                                    .split("T")[1]
                                    .substring(0, 5)
                                : "")
                            }
                            onChange={handleTimeOutChange}
                            required
                            className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
                          />
                          <button
                            onClick={() => handleSaveTimeOut(log.id)}
                            className="ml-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                          >
                            Save
                          </button>
                        </div>
                      ) : (
                        <div
                          className="cursor-pointer font-semibold underline"
                          onClick={() => {
                            setEditLogId(log.id);
                            setNewTimeOut(
                              log.timeOut
                                ? new Date(log.timeOut)
                                    .toISOString()
                                    .split("T")[1]
                                    .substring(0, 5)
                                : ""
                            );
                          }}
                        >
                          {log.timeOut
                            ? formatTime(log.timeOut)
                            : "Set Time Out"}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeLog;
