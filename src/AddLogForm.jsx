import React, { useState } from "react";

const AddLogForm = ({ onAddLog }) => {
  const [name, setName] = useState("");
  const [date, setDate] = useState("");
  const [timeIn, setTimeIn] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddLog({
      id: Date.now(),
      name,
      date,
      timeIn: convertTo12HourFormat(timeIn),
      timeOut: "",
    });
    setName("");
    setDate("");
    setTimeIn("");
  };

  const convertTo12HourFormat = (time) => {
    const [hours, minutes] = time.split(":");
    const period = hours >= 12 ? "PM" : "AM";
    const adjustedHours = hours % 12 || 12;
    return `${adjustedHours}:${minutes} ${period}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col">
        <label className="mb-2 font-semibold">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-2 font-semibold">Date</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
      <div className="flex flex-col">
        <label className="mb-2 font-semibold">Time In</label>
        <input
          type="time"
          value={timeIn}
          onChange={(e) => setTimeIn(e.target.value)}
          required
          className="p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brown-500"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-2 bg-brown-500 text-white rounded-lg hover:bg-brown-600"
      >
        Add Log
      </button>
    </form>
  );
};

export default AddLogForm;
