import { useState } from "react";
import CircularLetter from "./circularLetter";

const CircularLetterLogic = () => {
  const [circularSummary, setCircularSummary] = useState(null);

  return (
    <>
      {/* PAGE INI KHUSUS UNTUK LOGIC */}
      <CircularLetter onSummaryChange={setCircularSummary} />
    </>
  );
};

export default CircularLetterLogic;
