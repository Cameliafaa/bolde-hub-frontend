import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import FolderIcon from "../../assets/images/folder.png";
import { ApiRequest } from "../../services/apiRequest";
import AddFolderModal from "../../components/salesToolsKit/folder/addFolder";
import EditFolderModal from "../../components/salesToolsKit/folder/editFolder";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";
import usePermission from "../../utils/usePermission";
import { List, LayoutGrid } from "lucide-react";
import ActionMenu from "../../components/common/actionMenu";

const SalesToolsCategory = () => {
    const { categoryId } = useParams();
    const navigate = useNavigate();

    const [folders, setFolders] = useState([]);
    const [categoryName, setCategoryName] = useState("");
    const [loading, setLoading] = useState(true);

    const [showAddModal, setShowAddModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [newFolderDesc, setNewFolderDesc] = useState("");
    const [newFolderIcon, setNewFolderIcon] = useState(null);

    const [viewMode, setViewMode] = useState(
        localStorage.getItem("sales_tools_view") || "list"
    );

    // ===================== EDIT STATE =====================
    const [editFolder, setEditFolder] = useState(null);
    const [editName, setEditName] = useState("");
    const [editDesc, setEditDesc] = useState("");
    const [editIconFile, setEditIconFile] = useState(null);
    const [editIconPreview, setEditIconPreview] = useState(null);
    const [editing, setEditing] = useState(false);

    const [adding, setAdding] = useState(false);
    const [search, setSearch] = useState("");

    const filteredFolders = folders.filter((folder) =>
        folder.name?.toLowerCase().includes(search.toLowerCase())
    );


    // DELETE
    const [deleteTarget, setDeleteTarget] = useState(null);

    const { can_create, can_delete, can_update } = usePermission();

    useEffect(() => {
        localStorage.setItem("sales_tools_view", viewMode);
    }, [viewMode]);

    // ======================================================
    // LOAD FOLDERS
    // ======================================================
    const loadFolders = async () => {
        setLoading(true);
        try {
            const categoriesRes = await ApiRequest({
                url: "/item-categories/all",
                method: "GET"
            });

            const cat = categoriesRes.data?.find(
                c => c.item_category_id === Number(categoryId)
            );
            setCategoryName(cat?.name || "Unknown Category");

            const folderRes = await ApiRequest({
                url: `/folders/by-category/${categoryId}`,
                method: "GET"
            });

            setFolders(folderRes.data || []);
        } catch (err) {
            console.error("Load folder error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFolders();
    }, [categoryId]);


    // ======================================================
    // CREATE FOLDER
    // ======================================================
    const handleCreateFolder = async () => {
        if (!newFolderName.trim()) return alert("Folder name required!");

        setAdding(true);

        try {
            const formData = new FormData();
            formData.append("item_category_id", Number(categoryId));
            formData.append("name", newFolderName);
            formData.append("description", newFolderDesc);

            if (newFolderIcon instanceof File) {
                formData.append("icon", newFolderIcon);
            }

            const res = await ApiRequest({
                url: "/folders/create",
                method: "POST",
                data: formData,
                isFormData: true, // 🔥 FIX PENTING
            });

            await loadFolders();

            // Reset state
            setShowAddModal(false);
            setNewFolderName("");
            setNewFolderDesc("");
            setNewFolderIcon(null);

        } catch (err) {
            console.error("Create error:", err);
        } finally {
            setAdding(false);
        }
    };


    // ======================================================
    // UPDATE FOLDER
    // ======================================================
    const handleUpdateFolder = async () => {
        if (!editFolder) return;
        setEditing(true);

        try {
            const formData = new FormData();
            formData.append("item_category_id", Number(categoryId));
            formData.append("name", editName);
            formData.append("description", editDesc);

            if (editIconFile instanceof File) {
                formData.append("icon", editIconFile);
            }

            const res = await ApiRequest({
                url: `/folders/update/${editFolder.folder_id}`,
                method: "PUT",
                data: formData,
                isFormData: true, // 🔥 FIX SUPER PENTING
            });

            await loadFolders();

            // close modal
            setEditFolder(null);
            setEditIconFile(null);

        } catch (err) {
            console.error("Update error:", err);
        } finally {
            setEditing(false);
        }
    };


    // ======================================================
    // DELETE FOLDER
    // ======================================================
    const handleDeleteFolder = async () => {
        if (!deleteTarget) return;

        try {
            const res = await ApiRequest({
                url: `/folders/delete/${deleteTarget.folder_id}`,
                method: "DELETE"
            });

            await loadFolders();
            setDeleteTarget(null);

        } catch (err) {
            console.error("Delete error:", err);
        }
    };


    // ======================================================
    // UI
    // ======================================================

    if (loading) {
        return <div className="text-center mt-20 text-gray-500">Loading...</div>;
    }

    return (
        <div
            className="
      w-full
      max-w-[1400px]
      
    mx-0    /* ✅ TABLET FULL */
    max-w-none /* laptop & desktop tetap */

    lg:mx-auto
      px-4          /* HP */
      sm:px-4       /* tablet */
      lg:px-4       /* laptop */
      xl:px-4       /* desktop besar */
      2xl:px-4      /* layar besar */
    "
        >
            {/* BACK */}
            <div onClick={() => navigate(-1)}
                className="flex items-center gap-2 mb-5 text-text-secondary">
                <ArrowLeft
                    size={18}
                    onClick={() => navigate(-1)}
                    className="cursor-pointer hover:text-brand-first transition"
                />
                <p className="text-xs sm:text-sm lg:text-sm md:text-sm font-medium hover:text-brand-first cursor-pointer transition">
                    Back to Sales Tools Kit Menus
                </p>
            </div>

            {/* HEADER */}
            <div
                className="
    flex flex-col gap-4
    sm:flex-row sm:items-center sm:justify-between
    mb-6
  "
            >
                <h2 className="
  text-[#002D62]
  font-semibold
  text-base        /* HP */
  sm:text-lg       /* tablet+ */
">
                    Sales Tools KIT › <span className="font-bold">{categoryName}</span>
                </h2>

                <div className="flex items-center w-full justify-end sm:w-auto gap-4">
                    {/* Toggle view di sini */}
                    <div className="flex items-center bg-surface-border rounded-lg p-1">
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 rounded-md transition
      ${viewMode === "list"
                                    ? "bg-surface-background shadow text-brand-first"
                                    : "text-text-secondary hover:text-brand-first"
                                }`}
                            title="List view"
                        >
                            <List size={18} />
                        </button>

                        <button
                            onClick={() => setViewMode("card")}
                            className={`p-2 rounded-md transition
      ${viewMode === "card"
                                    ? "bg-surface-background shadow text-brand-first"
                                    : "text-text-secondary hover:text-brand-first"
                                }`}
                            title="Card view"
                        >
                            <LayoutGrid size={18} />
                        </button>
                    </div>

                    {can_create && (
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="
    px-4 py-2           /* HP */
    sm:px-5 sm:py-2.5   /* tablet+ */
    text-sm sm:text-base
    bg-brand-first
    text-surface-background
    rounded-xl
    shadow-md
    w-fit
  "                        >
                            + Add Folder
                        </button>
                    )}
                </div>
            </div>

            <div className="mb-4">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search file name..."
                    className="
      w-full max-w-md
      px-4 py-3
      border border-text-secondary
      rounded-xl
  text-sm           /* HP */
  sm:text-base      /* tablet+ */
      focus:outline-none
      focus:ring-2 focus:ring-brand-first
    "
                />
            </div>


            {/* EMPTY STATE */}
            {filteredFolders.length === 0 && (
                <div
                    className="flex flex-col items-center justify-center
  min-h-[60vh] text-text-secondary"
                >
                    <p
                        className="
    font-semibold
    mb-2

    text-base        /* HP */
    sm:text-lg       /* tablet+ */
  "
                    >
                        {search ? "File not found" : "No Folder"}
                    </p>

                    <p
                        className="
    text-xs          /* HP */
    sm:text-sm       /* tablet+ */
  "
                    >
                        {search ? "Try different keyword" : "Create a folder to start adding files"}
                    </p>
                    {/* <p className="text-lg font-semibold mb-2">
                        No Folder
                    </p>
                    <p className="text-sm mb-4">
                        Create a folder to start adding files
                    </p> */}
                </div>
            )}

            {/* FOLDER LIST */}
            {viewMode === "list" && filteredFolders.length > 0 && (
                <div className="space-y-3">
                    {filteredFolders.map(folder => {
                        const iconURL = folder.icon_url
                            ? folder.icon_url.replace(/\\/g, "/")
                            : FolderIcon;

                        return (
                            <div
                                key={folder.folder_id}
                                className="relative flex items-center justify-between bg-surface-background   px-4 py-3        /* HP */
  sm:px-5 sm:py-5  rounded-xl border shadow-sm"
                            >
                                {/* LEFT */}
                                <div
                                    onClick={() =>
                                        navigate(`/sales-tools/files/${categoryId}/${folder.folder_id}`)
                                    }
                                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                                >
                                    <img src={iconURL} className="w-6 h-6 object-contain flex-shrink-0" />
                                    <span
                                        title={folder.name}
                                        className="text-sm text-text-primary truncate">{folder.name}</span>

                                    {/* TOOLTIP */}
                                    <div
                                        className="
      absolute
      left-0
      top-full
      mt-1
      hidden group-hover:block
      bg-overlay
      text-surface-background
      text-xs
      px-2 py-1
      rounded
      z-50
      max-w-xs
      break-words
    "
                                    >
                                        {folder.name}
                                    </div>
                                </div>

                                {/* MENU */}
                                <ActionMenu
                                    onEdit={() => {
                                        setEditFolder(folder);
                                        setEditName(folder.name);
                                        setEditDesc(folder.description);
                                        setEditIconPreview(folder.icon_url || null);
                                        setEditIconFile(null);
                                    }}
                                    onDelete={() => {
                                        setDeleteTarget(folder);
                                    }}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {viewMode === "card" && folders.length > 0 && (
                <div className="
  grid
  grid-cols-2        /* HP */
  sm:grid-cols-3     /* tablet */
  lg:grid-cols-4     /* desktop */
  gap-4 sm:gap-6
">                    {folders.map((folder) => {
                    const iconURL = folder.icon_url
                        ? folder.icon_url.replace(/\\/g, "/")
                        : FolderIcon;

                    return (
                        <div
                            key={folder.folder_id}
                            onClick={() =>
                                navigate(`/sales-tools/files/${categoryId}/${folder.folder_id}`)
                            }
                            className="cursor-pointer bg-surface-background border rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-md transition flex flex-col items-center text-center"
                        >
                            <img
                                src={iconURL}
                                alt={folder.name}
                                className="w-10 h-10 sm:w-14 sm:h-14 mb-3 sm:mb-4 object-contain"
                            />
                            <p className="font-semibold text-text-primary">{folder.name}</p>
                        </div>
                    );
                })}
                </div>
            )}

            {/* ADD MODAL */}
            <AddFolderModal
                show={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSubmit={handleCreateFolder}
                name={newFolderName}
                desc={newFolderDesc}
                setName={setNewFolderName}
                setDesc={setNewFolderDesc}
                iconFile={newFolderIcon}
                setIconFile={setNewFolderIcon}
                loading={adding}
            />

            {/* EDIT MODAL */}
            <EditFolderModal
                open={!!editFolder}
                onClose={() => setEditFolder(null)}
                name={editName}
                desc={editDesc}
                iconFile={editIconFile}
                iconPreview={editIconPreview}
                setName={setEditName}
                setDesc={setEditDesc}
                setIconFile={setEditIconFile}
                setIconPreview={setEditIconPreview}
                onSubmit={handleUpdateFolder}
                loading={editing}
            />

            {/* DELETE */}
            <ConfirmDeleteModal
                open={!!deleteTarget}
                onCancel={() => setDeleteTarget(null)}
                onConfirm={handleDeleteFolder}
            />
        </div>
    );
};

export default SalesToolsCategory;
