import React, { useEffect, useState } from "react";
import { X, Trash2, Plus } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";
import CustomDropdown from "../../common/customDropdown";

const AddApprovalMenu = ({ open, onClose, onSuccess }) => {
  const [users, setUsers] = useState([]);
  const [menus, setMenus] = useState([]);

  const [selectedMenu, setSelectedMenu] = useState("");
  const [selectedSubMenu, setSelectedSubMenu] = useState("");

  const [menuData, setMenuData] = useState({
    name: "",
    code: "",
    url_path: "",
  });

  const [flows, setFlows] = useState([
    { user_id: "", step_order: 1, description: "" },
  ]);

  // ==========================
  // FETCH USERS LIST
  // ==========================
  const fetchUsers = async () => {
    try {
      const res = await ApiRequest({
        url: "/users/all",
        method: "GET",
      });

      if (Array.isArray(res.data)) {
        const formatted = res.data.map((u) => ({
          id: u.user_id,
          name: u.full_name,
        }));
        setUsers(formatted);
      }
    } catch (err) {
      console.error("Error loading users:", err);
      setUsers([]);
    }
  };

  // ==========================
  // FETCH MENUS + SUBMENUS
  // ==========================
  const fetchMenus = async () => {
    try {
      const res = await ApiRequest({
        url: "/menu/access/all",
        method: "GET",
      });

      if (res.status === "success") {
        setMenus(res.data);
      }
    } catch (err) {
      console.error("Error loading menus:", err);
      setMenus([]);
    }
  };

  useEffect(() => {
    if (open) {
      fetchUsers();
      fetchMenus();
    }
  }, [open]);

  // ==========================
  // HANDLE MENU CHANGE
  // ==========================
  const handleMenuChange = (menuId) => {
    setSelectedMenu(menuId);
    setSelectedSubMenu("");

    const found = menus.find((m) => m.menu_id == menuId);

    setMenuData({
      ...menuData,
      name: found?.name || "",
      code: found?.name.toUpperCase().replace(/\s+/g, "_"),
      url_path: found?.url || "",
    });
  };

  // ==========================
  // HANDLE SUB MENU CHANGE
  // ==========================
  const handleSubMenuChange = (subId) => {
    setSelectedSubMenu(subId);

    const parent = menus.find((m) => m.menu_id == selectedMenu);
    const sub = parent?.sub_menus?.find((sm) => sm.sub_menu_id == subId);

    setMenuData({
      ...menuData,
      name: sub?.name || "",
      code: sub?.name.toUpperCase().replace(/\s+/g, "_"),
      url_path: sub?.url || parent?.url,
    });
  };

  // ==========================
  // ADD NEW APPROVAL FLOW
  // ==========================
  const addFlowRow = () => {
    setFlows([
      ...flows,
      { user_id: "", step_order: flows.length + 1, description: "" },
    ]);
  };

  // ==========================
  // DELETE FLOW ROW
  // ==========================
  const deleteFlowRow = (index) => {
    const updated = flows.filter((_, i) => i !== index);
    const fixedSteps = updated.map((f, i) => ({
      ...f,
      step_order: i + 1,
    }));
    setFlows(fixedSteps);
  };

  // ==========================
  // CREATE MENU
  // ==========================
  const createMenu = async () => {
    try {
      const res = await ApiRequest({
        url: "/approval/menu/create",
        method: "POST",
        data: {
          name: menuData.name,
          code: menuData.code,
          url_path: menuData.url_path,
        },
      });

      if (res.status === "success") return res.data.approval_menu_id;
      return null;
    } catch (err) {
      console.error("Error create menu:", err);
      return null;
    }
  };

  // ==========================
  // CREATE APPROVAL FLOW
  // ==========================
  const createFlows = async (menu_id) => {
    try {
      const payload = {
        flows: flows.map((f) => ({
          user_id: Number(f.user_id),
          step_order: Number(f.step_order),
          description: f.description || "",
        })),
      };

      const res = await ApiRequest({
        url: `/approval/flow/create/${menu_id}`,
        method: "POST",
        data: payload,
      });

      return res.status === "success";
    } catch (err) {
      console.error("Error create flows:", err);
      return false;
    }
  };

  const formattedMenus = menus.map(m => ({
    id: m.menu_id,
    name: m.name,
    raw: m
  }));

  const formattedSubMenus = menus
    .find((m) => m.menu_id == selectedMenu)
    ?.sub_menus?.map(sm => ({
      id: sm.sub_menu_id,
      name: sm.name,
      raw: sm
    })) || [];


  // ==========================
  // SAVE BOTH MENU + FLOWS
  // ==========================
  const handleSave = async () => {
    if (!selectedMenu) {
      alert("Please select a menu");
      return;
    }

    const menu_id = await createMenu();
    if (!menu_id) return;

    const success = await createFlows(menu_id);
    if (success) {
      onSuccess?.();
      onClose();
    }
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
          <h2 className="text-lg sm:text-xl font-semibold">
            Add Approval Menu
          </h2>

          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        {/* MENU & SUB MENU DROPDOWN */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {/* MENU */}
            <CustomDropdown
              label="Main Menu"
              placeholder="Select Menu"
              options={formattedMenus}
              value={formattedMenus.find(m => m.id == selectedMenu)}
              onChange={(opt) => handleMenuChange(opt.id)}
            />

            {/* SUB MENU */}
            <CustomDropdown
              label="Sub Menu"
              placeholder="Select Sub Menu"
              options={formattedSubMenus}
              value={formattedSubMenus.find(sm => sm.id == selectedSubMenu)}
              onChange={(opt) => handleSubMenuChange(opt.id)}
            />
          </div>

          {/* AUTO-FILLED MENU INFO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <input
              type="text"
              className="border p-2 py-4 rounded-2xl"
              value={menuData.name}
              readOnly
            />

            <input
              type="text"
              className="border p-2 py-4 rounded-2xl"
              value={menuData.code}
              readOnly
            />

            <input
              type="text"
              className="border p-2 py-4 rounded-2xl col-span-2"
              value={menuData.url_path}
              readOnly
            />
          </div>

          {/* APPROVAL FLOW SECTION */}
          <div className="flex justify-between text-base font-semibold mb-3 gap-2 ">
            {/* <h3 className="  flex items-center "> */}
            User Approval Flow
            <button
              onClick={addFlowRow}
              className="border border-gray-300 text-green-600 px-3 py-2 rounded flex items-center gap-1"
            >
              <Plus size={14} />
            </button>
            {/* </h3> */}
          </div>

          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 w-20">Step</th>
                  <th className="p-3 w-48">User</th>
                  {/* <th className="p-3">Description</th> */}
                  <th className="p-3 w-14 text-center">Delete</th>
                </tr>
              </thead>

              <tbody>
                {flows.map((f, index) => (
                  <tr className="border-t" key={index}>
                    <td className="p-3 text-center">
                      <input
                        // type="number"
                        className="border p-1 py-4 text-center rounded-2xl w-16"
                        value={f.step_order}
                        onChange={(e) =>
                          setFlows(
                            flows.map((x, i) =>
                              i === index
                                ? { ...x, step_order: Number(e.target.value) }
                                : x
                            )
                          )
                        }
                      />
                    </td>

                    <td className="p-3">
                      <CustomDropdown
                        placeholder="Select User"
                        options={users} // users = [{ id, name }]
                        value={{
                          id: f.user_id,
                          name: users.find((u) => u.id === f.user_id)?.name || ""
                        }}
                        onChange={(opt) =>
                          setFlows(
                            flows.map((x, i) =>
                              i === index
                                ? { ...x, user_id: opt.id, user_name: opt.name }
                                : x
                            )
                          )
                        }
                      />
                    </td>

                    {/* <td className="p-3">
                    <input
                      type="text"
                      className="border p-1 py-4 rounded-2xl w-full"
                      value={f.description}
                      onChange={(e) =>
                        setFlows(
                          flows.map((x, i) =>
                            i === index
                              ? { ...x, description: e.target.value }
                              : x
                          )
                        )
                      }
                    />
                  </td> */}

                    <td className="text-center">
                      <button
                        onClick={() => deleteFlowRow(index)}
                        className="text-red-600"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* BUTTON */}
        <div className="pt-4 mt-4 border-t flex justify-end gap-3">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] text-white font-medium px-5 py-2.5 rounded-lg shadow hover:shadow-md transition"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddApprovalMenu;
