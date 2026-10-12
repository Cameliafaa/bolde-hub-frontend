import React, { useEffect, useState } from "react";

const Header = () => {
  const [name, setName] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("userData");

    if (userData) {
      const stored = JSON.parse(userData);
      setName(stored?.full_name || "");
    }
  }, []);
  return (
    <header className="mb-6">
      <h1
        className="
    font-semibold text-[#002D62]
    text-base        /* HP */
    sm:text-lg       /* tablet */
    lg:text-xl       /* laptop */
    xl:text-2xl      /* layar besar */
    leading-tight
    whitespace-nowrap
  "
      >
        Hello {name}<span className="ml-1">👋</span>
      </h1>
    </header>
  );
};

export default Header;
