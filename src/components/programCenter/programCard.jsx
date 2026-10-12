import React from "react";
import { useNavigate } from "react-router-dom";
import usePermission from "../../utils/usePermission";
import DeleteIcon from "../../assets/images/icons/deleteIcon.png";

const ProgramCard = ({
  id,
  name,
  no,
  area,
  uploader_name,
  uploader_image,
  activeTab,
  onDelete,
}) => {
  const navigate = useNavigate();
  const { can_delete } = usePermission(); // ✅ MENU LEVEL

  return (
    <div className="flex flex-col gap-4 p-4 transition border shadow-sm bg-surface-card border-surface-border rounded-2xl hover:shadow-md sm:p-5 lg:flex-row lg:items-center lg:justify-between">
      {/* LEFT */}
      <div className="flex flex-col gap-3 text-sm text-text-primary lg:grid lg:grid-cols-4 lg:gap-6 lg:flex-1">
        <div>
          <p className="mb-1 text-xs text-text-light">Program Name</p>
          <p className="font-medium truncate">{name}</p>
        </div>

        <div className="col-span-2">
          <p className="mb-1 text-xs text-text-light">No Program</p>
          <p className="font-medium truncate">{no}</p>
        </div>

        <div>
          <p className="mb-1 text-xs text-text-light">Area</p>
          <p className="font-medium truncate">{area}</p>
        </div>

        {/* <div className="flex items-center gap-2">
          <img
            src={
              uploader_image ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                uploader_name || "Uploader"
              )}`
            }
            className="w-8 h-8 border rounded-full"
          />
          <span className="text-xs">{uploader_name}</span>
        </div> */}
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            const detailUrl = `/program-detail/${id}?tab=${encodeURIComponent(
              activeTab || "Active",
            )}`;

            if (activeTab === "Waiting Approve") {
              window.open(detailUrl, "_blank", "noopener,noreferrer");
              return;
            }

            navigate(detailUrl);
          }}
          className="w-full px-5 py-2 text-xs font-semibold text-white transition shadow-md lg:w-auto bg-brand-first hover:bg-brand-secondary sm:text-sm rounded-xl"
        >
          View Detail
        </button>

        {can_delete && (
          <button
            onClick={() => onDelete({ program_id: id, name })}
            className="rounded-lg hover:bg-red-50"
            title="Delete Program"
          >
            <img
              src={DeleteIcon}
              className="inline-block object-contain w-5 h-5"
              alt="delete"
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default ProgramCard;
