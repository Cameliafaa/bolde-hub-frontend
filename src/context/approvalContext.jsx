import { createContext, useContext } from "react";

export const ApprovalContext = createContext({
  requiresApproval: false,
  approvalMenuId: null,
  approvalFlow: [],
});

export const useApproval = () => useContext(ApprovalContext);
