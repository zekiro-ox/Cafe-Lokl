import React, { useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import Sidebar from "./Sidebar";
import AddLogForm from "./AddLogForm";

const EmployeeLog = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [logs, setLogs] = useState([
    {
      id: 1,
      name: "John Doe",
      date: "2023-06-01",
      timeIn: "08:00 AM",
      timeOut: "",
    },
    {
      id: 2,
      name: "Jane Smith",
      date: "2023-06-01",
      timeIn: "09:00 AM",
      timeOut: "",
    },
    // Add more mock data here
  ]);
  const [isFormVisible, setFormVisible] = useState(false);
  const [editLogId, setEditLogId] = useState(null);
  const [newTimeOut, setNewTimeOut] = useState("");

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleAddLog = (newLog) => {
    setLogs((prevLogs) => [...prevLogs, newLog]);
    setFormVisible(false);
  };

  const handleTimeOutChange = (id, newTimeOut) => {
    setNewTimeOut(newTimeOut);
  };

  const handleSaveTimeOut = (id) => {
    if (!newTimeOut) {
      alert("Please select a time before saving.");
      return;
    }

    setLogs((prevLogs) =>
      prevLogs.map((log) =>
        log.id === id
          ? { ...log, timeOut: formatTimeTo12Hour(newTimeOut) }
          : log
      )
    );
    setEditLogId(null);
    setNewTimeOut("");
  };

  const formatTimeTo12Hour = (time) => {
    const [hours, minutes] = time.split(":");
    let hour = parseInt(hours, 10);
    const meridiem = hour >= 12 ? "PM" : "AM";
    hour = hour % 12 || 12;
    return `${hour}:${minutes} ${meridiem}`;
  };

  const filteredLogs = logs.filter(
    (log) =>
      log.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.date.includes(searchTerm)
  );

  return (
    <div className="p-6 lg:ml-64 bg-gray-100 min-h-screen">
      <Sidebar />
      <div className="p-6 bg-white shadow-lg rounded-lg mt-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
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
            <button
              onClick={() => setFormVisible(!isFormVisible)}
              className="flex items-center px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600 md:px-6 md:py-3 md:text-lg"
            >
              <FaPlus className="mr-2" /> {isFormVisible ? "Cancel" : "Add Log"}
            </button>
          </div>
        </div>
        {isFormVisible && <AddLogForm onAddLog={handleAddLog} />}
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
                  <td className="py-3 px-4">{log.name}</td>
                  <td className="py-3 px-4">{log.date}</td>
                  <td className="py-3 px-4">{log.timeIn}</td>
                  <td className="py-3 px-4">
                    {editLogId === log.id ? (
                      <div className="flex items-center">
                        <input
                          type="time"
                          value={
                            newTimeOut ||
                            (log.timeOut ? log.timeOut.split(" ")[0] : "")
                          }
                          onChange={(e) =>
                            handleTimeOutChange(log.id, e.target.value)
                          }
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
                            log.timeOut ? log.timeOut.split(" ")[0] : ""
                          );
                        }}
                      >
                        {log.timeOut || "Set Time Out"}
                      </div>
                    )}
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

export default EmployeeLog;
