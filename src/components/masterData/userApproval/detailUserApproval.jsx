import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";

const ApprovalDetailModal = ({ open, onClose, menu }) => {
  const [flows, setFlows] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDetail = async () => {
    if (!menu?.id) return;

    setLoading(true);
    try {
      const res = await ApiRequest({
        url: `/approval/menu/detail/${menu.id}`,
        method: "GET",
      });

      if (res.status === "success") {
        setFlows(res.data.flows);
      }
    } catch (err) {
      console.error("Error fetch detail:", err);
      setFlows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchDetail();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
      <div
        className="
    bg-white
    w-full
    sm:max-w-lg

    rounded-t-3xl sm:rounded-2xl
    shadow-xl
    relative

    p-6 sm:p-8

    max-h-[95vh]
    overflow-y-auto

    animate-slideUpMobile
    sm:animate-none
  "
      >

        <button onClick={onClose} className="absolute right-4 top-4">
          <X size={20} />
        </button>

        <h2 className="text-lg sm:text-xl font-semibold mb-4">
          User Approval – {menu?.name}
        </h2>

        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3">Step</th>
                <th className="p-3">User</th>
                {/* <th className="p-3">Description</th> */}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr><td colSpan={3} className="text-center py-6">Loading...</td></tr>
              ) : flows.length > 0 ? (
                flows
                  .sort((a, b) => a.step_order - b.step_order)
                  .map((f) => (
                    <tr key={f.approval_flow_id} className="border-t">
                      <td className="p-3 text-center">{f.step_order}</td>
                      <td className="p-3 text-center">{f.user_name}</td>
                      {/* <td className="p-3 text-center">{f.description}</td> */}
                    </tr>
                  ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center py-6 text-gray-500">
                    No approver found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* <div className="mt-4 flex justify-end">
          <button onClick={onClose} className="bg-[#002D62] text-white px-4 py-2 rounded-lg">
            Close
          </button>
        </div> */}

      </div>
    </div>
  );
};

export default ApprovalDetailModal;
