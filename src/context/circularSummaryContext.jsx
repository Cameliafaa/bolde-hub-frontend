import { createContext, useContext, useState } from "react";

const CircularSummaryContext = createContext(null);

export const CircularSummaryProvider = ({ children }) => {
  const [summary, setSummary] = useState({
    total_active: 0,
    expiring_7_days: 0,
    expiring_1_day: 0,
  });

  return (
    <CircularSummaryContext.Provider value={{ summary, setSummary }}>
      {children}
    </CircularSummaryContext.Provider>
  );
};

export const useCircularSummary = () => {
  const ctx = useContext(CircularSummaryContext);
  if (!ctx) {
    throw new Error(
      "useCircularSummary must be used inside CircularSummaryProvider"
    );
  }
  return ctx;
};
