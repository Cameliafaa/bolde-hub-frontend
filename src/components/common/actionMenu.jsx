import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";
import EditIcon from "../../assets/images/icons/editIcon.png";
import DeleteIcon from "../../assets/images/icons/deleteIcon.png";

const ActionMenu = ({ onEdit, onDelete }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close jika klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-full hover:bg-gray-100"
      >
        <MoreVertical size={20} />
      </button>

      {open && (
        <div
          className="
      absolute right-0 top-10
      flex justify-center
      w-32
      bg-surface-card
      border border-surface-border
      shadow-lg
      rounded-xl
      py-2
      z-50
    "
        >          
        <button
          onClick={() => {
            setOpen(false);
            onEdit();
          }}
        >
            <img
              src={EditIcon}
              alt="edit"
              className="w-5 h-5 object-contain"
            />          </button>

          <div className="w-[1px] h-6 bg-text-secondary mx-2"></div>

          <button
            onClick={() => {
              setOpen(false);
              onDelete();
            }}
          >
            <img
              src={DeleteIcon}
              alt="delete"
              className="w-5 h-5 object-contain"
            />          
            </button>
        </div>
      )}
    </div>
  );
};

export default ActionMenu;
