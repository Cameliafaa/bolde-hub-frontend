import React, { useEffect, useState } from "react";
import { X, Trash2, Plus } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";
import CustomDropdown from "../../common/customDropdown";

const ApprovalEditModal = ({ open, onClose, menu, onSuccess }) => {
  const [flows, setFlows] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragIndex, setDragIndex] = useState(null);

  const [newFlow, setNewFlow] = useState({
    user_id: "",
    user_name: "",
    step_order: "",
    description: "",
  });

  // ============================================================
  // FETCH DETAIL APPROVAL
  // ============================================================
  const fetchDetail = async () => {
    if (!menu?.id) return;
    setLoading(true);

    try {
      const res = await ApiRequest({
        url: `/approval/menu/detail/${menu.id}`,
        method: "GET",
      });

      if (res.status === "success") {
        setFlows(res.data.flows || []);
      } else {
        setFlows([]);
      }
    } catch (err) {
      console.error("Error load approval detail:", err);
      setFlows([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FETCH USERS DROPDOWN
  // ============================================================
  const fetchUsers = async () => {
    try {
      const res = await ApiRequest({
        url: "/users/all",
        method: "GET",
      });

      if (res.status === "success" && Array.isArray(res.data)) {
        const formatted = res.data.map((u) => ({
          id: u.user_id,
          name: u.full_name,
        }));
        setUsers(formatted);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Error fetch users:", err);
      setUsers([]);
    }
  };

  useEffect(() => {
    if (open) {
      fetchDetail();
      fetchUsers();
    }
  }, [open]);

  // ============================================================
  // ADD NEW FLOW
  // ============================================================
  const handleAddFlow = () => {
    if (!newFlow.user_id || !newFlow.step_order) return;

    setFlows([
      ...flows,
      {
        approval_flow_id: null, // new data (belum ada di backend)
        user_id: newFlow.user_id,
        user_name: newFlow.user_name,
        step_order: Number(newFlow.step_order),
        description: newFlow.description || "",
      },
    ]);

    setNewFlow({ user_id: "", user_name: "", step_order: "", description: "" });
  };

  // ============================================================
  // DELETE FLOW
  // ============================================================
  const handleDelete = async (flowId) => {
    // Jika row baru (blm ke backend)
    if (!flowId) {
      setFlows(flows.filter((f) => f.approval_flow_id !== flowId));
      return;
    }

    try {
      await ApiRequest({
        url: `/approval/flow/delete/${flowId}`,
        method: "DELETE",
      });

      setFlows(flows.filter((f) => f.approval_flow_id !== flowId));
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  // ============================================================
  // SAVE (CREATE ONLY, NO UPDATE)
  // ============================================================
  const handleSave = async () => {
    try {
      // Ambil hanya row baru
      const newRows = flows.filter((f) => !f.approval_flow_id);

      if (newRows.length === 0) {
        onClose();
        return;
      }

      const payload = {
        flows: newRows.map((f) => ({
          user_id: f.user_id,
          step_order: f.step_order,
          description: f.description || "",
        })),
      };

      const res = await ApiRequest({
        url: `/approval/flow/create/${menu.id}`,
        method: "POST",
        data: payload,
      });

      if (res.status === "success") {
        onSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error("Error saving:", err);
    }
  };

  // ============================================================
  // DRAG & DROP STEP ORDER
  // ============================================================
  const handleDragStart = (idx) => setDragIndex(idx);
  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (idx) => {
    if (dragIndex === idx) return;

    const updated = [...flows];
    const moved = updated[dragIndex];

    updated.splice(dragIndex, 1);
    updated.splice(idx, 0, moved);

    const reordered = updated.map((f, i) => ({
      ...f,
      step_order: i + 1,
    }));

    setFlows(reordered);
    setDragIndex(null);
  };

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
        <div
          className="
    flex items-center justify-between
    mb-4
    sticky top-0
    bg-white
    z-20
    pb-3
    border-b
  "
        >
          <h2 className="text-base sm:text-xl font-semibold">
            Edit User Approval – {menu?.name}
          </h2>

          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* =================== TABLE =================== */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="border rounded-lg">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 w-20 text-center">Step</th>
                  <th className="p-3 w-48">User</th>
                  <th className="p-3 w-14 text-center">Delete</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={3} className="text-center py-6">Loading...</td>
                  </tr>
                ) : flows.length > 0 ? (
                  flows
                    .sort((a, b) => a.step_order - b.step_order)
                    .map((f, index) => (
                      <tr
                        key={f.approval_flow_id ?? `new-${index}`}
                        className="border-t hover:bg-gray-50 cursor-move"
                        draggable
                        onDragStart={() => handleDragStart(index)}
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(index)}
                      >
                        {/* STEP */}
                        <td className="p-3 text-center">
                          <input
                            className="border p-3 text-center rounded-2xl w-16"
                            value={f.step_order}
                            onChange={(e) =>
                              setFlows(
                                flows.map((x) =>
                                  x === f
                                    ? { ...x, step_order: Number(e.target.value) }
                                    : x
                                )
                              )
                            }
                          />
                        </td>

                        {/* USER */}
                        <td className="p-3">
                          <CustomDropdown
                            placeholder="Select User"
                            options={users}
                            value={{ id: f.user_id }}
                            onChange={(opt) =>
                              setFlows(
                                flows.map((x) =>
                                  x === f
                                    ? { ...x, user_id: opt.id, user_name: opt.name }
                                    : x
                                )
                              )
                            }
                          />
                        </td>

                        {/* DELETE */}
                        <td className="text-center">
                          <button
                            onClick={() => handleDelete(f.approval_flow_id)}
                            className="text-red-600"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
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

          {/* =================== ADD NEW USER =================== */}
          <h3 className="text-md font-semibold mt-4 mb-2">Add Approval Step</h3>
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 mb-4">
            {/* STEP */}
            <input
              className="border p-2 h-[60px] text-center rounded-2xl"
              placeholder="Step"
              value={newFlow.step_order}
              onChange={(e) =>
                setNewFlow({ ...newFlow, step_order: e.target.value })
              }
            />

            {/* USER */}
            <div className="col-span-4">
              <CustomDropdown
                placeholder="Select User"
                options={users}
                value={{ id: newFlow.user_id }}
                onChange={(opt) =>
                  setNewFlow({
                    ...newFlow,
                    user_id: opt.id,
                    user_name: opt.name,
                  })
                }
              />
            </div>

            {/* ADD */}
            <div>
              <button
                onClick={handleAddFlow}
                className="text-green-600 rounded-xl p-4 border border-gray-250 flex items-center justify-center"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

        </div>


        {/* =================== FOOTER =================== */}
        <div className="pt-4 mt-4 border-t flex justify-end gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] text-white font-medium px-5 py-2.5 rounded-lg shadow hover:shadow-md transition"
          >
            Save
          </button>
        </div>

      </div>
    </div>
  );
};

export default ApprovalEditModal;
