const Tabs = ({ tabs, active, onChange }) => {
  return (
    <div className="inline-flex bg-[#EEF4FB] rounded-full p-1">
      {tabs.map((tab) => {
        const isActive = active === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`px-8 py-3 rounded-full text-sm font-semibold transition-all
              ${
                isActive
                  ? "bg-gradient-to-r from-[#5DA9E9] to-[#1E5FA3] text-white shadow"
                  : "text-[#1E5FA3] hover:text-[#0F4C81]"
              }
            `}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

export default Tabs;
