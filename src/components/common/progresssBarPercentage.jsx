const ProgressBar = ({ value }) => {
  const getProgressBackground = (val) => {
    if (val < 50) {
      return "linear-gradient(90deg, #ef4444 0%, #f87171 100%)";
    }

    if (val < 80) {
      return "linear-gradient(90deg, #ef4444 0%, #f97316 45%, #facc15 100%)";
    }

    return "linear-gradient(90deg, #ef4444 0%, #f97316 35%, #facc15 65%, #22c55e 100%)";
  };

  const getTextColor = (val) => {
    if (val === 0) return "text-red-500";
    if (val < 50) return "text-red-500";
    if (val < 80) return "text-yellow-500";
    return "text-green-600";
  };

  return (
    <div className="flex items-center gap-3">
      <div className="w-full h-3 overflow-hidden bg-gray-200 rounded-full">
        <div
          className="h-full transition-all duration-700 ease-in-out rounded-full"
          style={{
            width: `${value}%`,
            background: getProgressBackground(value),
          }}
        />
      </div>

      <span className={`text-sm font-semibold ${getTextColor(value)}`}>
        {value}%
      </span>
    </div>
  );
};

export default ProgressBar;
