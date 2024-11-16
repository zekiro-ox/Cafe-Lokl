import React, { createContext, useContext, useState } from "react";

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [currentLogId, setCurrentLogId] = useState(null);

  return (
    <SessionContext.Provider
      value={{
        isSessionActive,
        setIsSessionActive,
        currentLogId,
        setCurrentLogId,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  return useContext(SessionContext);
};
