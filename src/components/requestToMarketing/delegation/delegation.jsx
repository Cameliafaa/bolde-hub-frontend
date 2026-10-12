import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";
import MultiSelectDropdown from "../../common/multiSelectDropdown";
import CustomDropdown from "../../common/customDropdown";
import { fetchAllUsers } from "../../../services/users/userService";
import StepDelegationSuccess from "./success";

const DelegationModal = ({ open, onClose, requestId, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [division, setDivision] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    ApiRequest({
      url: "/roles/all?limit=100",
      method: "GET",
    }).then((res) => {
      if (res.status === "success") {
        setRoles(res.data || []);
      }
    });
  }, []);

  /* ================= FETCH USERS ================= */
  useEffect(() => {
    if (!open) return;
    fetchUsers();
  }, [open]);

  const fetchUsers = async () => {
    const allUsers = await fetchAllUsers(50);

    setUsers(allUsers.filter((u) => u.is_active));
  };
  const ALLOWED_ROLE_IDS = [33, 34, 35];

  /* ================= DIVISION ================= */
  const divisionOptions = roles
    .filter((r) => ALLOWED_ROLE_IDS.includes(r.user_role_id))
    .map((r) => ({
      id: r.user_role_id,
      name: r.name,
    }));

  /* ================= EMPLOYEE ================= */
  const employeeOptions = users
    .filter((u) => u.role_id === division?.id)
    .map((u) => ({
      id: u.user_id,
      name: u.full_name,
    }));

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (!employees.length || loading) return;

    const payload = {
      user_ids: employees.map((e) => e.id),
    };

    try {
      setLoading(true);

      const res = await ApiRequest({
        url: `/requests/${requestId}/employees`,
        method: "POST",
        data: payload,
      });

      if (res.status === "success") {
        setShowSuccess(true);
        setDivision(null);
        setEmployees([]);

        // kasih delay supaya success modal tampil dulu
        setTimeout(() => {
          onSuccess?.();
        }, 300);
      }
    } catch (err) {
      console.error("Delegation error:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999]">
      {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-overlay backdrop-blur-sm animate-fadeIn"
      />

      {/* Modal Container */}
      <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center">
        <div className="relative w-full p-5 overflow-y-auto bg-white shadow-2xl h-[92vh] sm:h-auto max-h-[95vh] sm:max-w-xl lg:max-w-2xl rounded-t-3xl sm:rounded-3xl sm:p-8 lg:p-10 animate-slideUp">
          {/* MOBILE DRAG HANDLE */}
          <div className="flex justify-center mb-4 sm:hidden">
            <div className="w-12 rounded-full h-1.5 bg-surface-border" />
          </div>

          {!showSuccess ? (
            <>
              {/* CLOSE */}
              <button
                onClick={onClose}
                className="absolute p-2 bg-gray-100 rounded-full right-6 top-6 hover:bg-text-light"
              >
                <X size={20} />
              </button>

              <h2 className="mb-6 text-lg font-semibold sm:text-xl lg:text-2xl">
                Delegation Project
              </h2>

              {/* DIVISION */}
              <CustomDropdown
                label="Delegation to"
                value={division}
                onChange={(val) => {
                  setDivision(val);
                  setEmployees([]);
                }}
                options={divisionOptions}
                placeholder="Select Division"
                searchable
                clearable
                onClear={() => {
                  setDivision(null);
                  setEmployees([]);
                }}
              />

              {/* EMPLOYEE */}
              <div className="mt-4">
                <MultiSelectDropdown
                  label="Employee"
                  values={employees}
                  onChange={setEmployees}
                  options={employeeOptions}
                  disabled={!division}
                  placeholder="Select Employee"
                />
              </div>

              {/* ACTION */}
              <div className="flex justify-end mt-8">
                <button
                  onClick={handleSubmit}
                  disabled={!employees.length || loading}
                  className="w-full px-6 py-3 font-semibold text-white shadow-lg sm:px-10 bg-[#002D62] rounded-2xl sm:w-auto"
                >
                  {loading ? "Sending..." : "Send"}
                </button>
              </div>
            </>
          ) : (
            <StepDelegationSuccess
              open={showSuccess}
              onClose={() => {
                setShowSuccess(false);
                onClose();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DelegationModal;
