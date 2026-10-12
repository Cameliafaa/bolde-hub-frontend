import React, { useState, useEffect } from "react";
import { ApprovalContext } from "./approvalContext";
import { ApiRequest } from "../services/apiRequest";
import { useLocation } from "react-router-dom";

const ApprovalProvider = ({ children }) => {
  const { pathname } = useLocation();

  const [requiresApproval, setRequiresApproval] = useState(false);
  const [approvalMenuId, setApprovalMenuId] = useState(null);
  const [approvalFlow, setApprovalFlow] = useState([]);

  useEffect(() => {
    const loadApproval = async () => {
      const token = localStorage.getItem("token");

      // ⛔ Jika token belum ada → jangan load API approval
      if (!token) {
        console.warn("ApprovalProvider SKIPPED — token belum ada.");
        return;
      }

      try {
        // === 1. Get Approval Menu ===
        const resMenu = await ApiRequest({
          url: "/approval/menu/all",
          method: "GET",
        });

        const menus = resMenu?.data || [];

        const match = menus.find((m) => m.url_path === pathname);

        if (!match) {
          setRequiresApproval(false);
          setApprovalFlow([]);
          return;
        }

        setRequiresApproval(true);
        setApprovalMenuId(match.approval_menu_id);

        // === 2. Get Approval Flow ===
        const resFlow = await ApiRequest({
          url: `/approval/flow/all/${match.approval_menu_id}`,
          method: "GET",
        });

        const flows = resFlow?.data || [];

        setApprovalFlow(
          flows
            .sort((a, b) => a.step_order - b.step_order)
            .map((f) => ({
              id: f.user_id,
              name: f.description,
              step: f.step_order,
            }))
        );
      } catch (err) {
        console.error("ApprovalProvider Error:", err);
      }
    };

    loadApproval();
  }, [pathname]);

  return (
    <ApprovalContext.Provider
      value={{
        requiresApproval,
        approvalMenuId,
        approvalFlow,
      }}
    >
      {children}
    </ApprovalContext.Provider>
  );
};

export default ApprovalProvider;
