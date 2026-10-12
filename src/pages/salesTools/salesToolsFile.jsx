// src/pages/salesToolsKit/salesToolsFile.jsx
import React, { useEffect, useState } from "react";
import { ArrowLeft, Download, EllipsisVertical } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { ApiRequest } from "../../services/apiRequest";
import PdfIcon from "../../assets/images/doc/pdf.png";
import ImgIcon from "../../assets/images/doc/img.png";
import DocIcon from "../../assets/images/doc/docs.png";
import XslIcon from "../../assets/images/doc/xsl.png";
import PptIcon from "../../assets/images/doc/ppt.png";
import AddFileModal from "../../components/salesToolsKit/addFile";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";
import DeleteIcon from "../../assets/images/icons/deleteIcon.png";

const SalesToolsFile = () => {
  const { categoryId, folderId } = useParams();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(true);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const [dragActive, setDragActive] = useState(false);

  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);

  const [search, setSearch] = useState("");

  const filteredFiles = files.filter((file) =>
    file.file_name?.toLowerCase().includes(search.toLowerCase()),
  );

  // =============================
  // GLOBAL DRAG & DROP
  // =============================
  useEffect(() => {
    const handleDragOver = (e) => {
      e.preventDefault();
      setDragActive(true);
    };

    const handleDragLeave = (e) => {
      e.preventDefault();
      setDragActive(false);
    };

    const handleDrop = async (e) => {
      e.preventDefault();
      if (uploading) return;
      setDragActive(false);

      const file = e.dataTransfer.files?.[0];
      if (!file) return;

      setUploading(true);
      await handleFileUpload(file);
    };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  const downloadFile = (file) => {
    try {
      let url = (file.file_url || file.file_path || "").replace(/\\/g, "/");
      if (!url) return;

      // force download via temporary <a>
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", file.file_name || "file");
      link.setAttribute("target", "_blank");

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  // =============================
  // LOAD FILES + FOLDER NAME
  // =============================
  const loadFiles = async () => {
    try {
      // --- FILES ---
      const fileRes = await ApiRequest({
        url: `/files/by-category/${categoryId}`,
        method: "GET",
      });

      let allFiles = Array.isArray(fileRes?.data?.data)
        ? fileRes.data.data
        : Array.isArray(fileRes?.data)
          ? fileRes.data
          : [];

      const filtered = allFiles.filter((f) => f.folder_id === Number(folderId));
      setFiles(filtered);

      // --- FOLDER ---
      const folderRes = await ApiRequest({
        url: `/folders/by-category/${categoryId}`,
        method: "GET",
      });

      let folderList = Array.isArray(folderRes?.data?.data)
        ? folderRes.data.data
        : Array.isArray(folderRes?.data)
          ? folderRes.data
          : [];

      const foundFolder = folderList.find(
        (f) => f.folder_id === Number(folderId),
      );

      setFolderName(foundFolder?.name || "Folder");
    } catch (err) {
      console.error("❌ Error load files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, [categoryId, folderId]);

  // =============================
  // UPLOAD FILE
  // =============================
  const handleFileUpload = async (file) => {
    setUploading(true);

    try {
      const form = new FormData();

      form.append("item_category_id", String(categoryId));
      form.append("folder_id", String(folderId));
      form.append("file", file);

      await ApiRequest({
        url: "/files/upload",
        method: "POST",
        data: form,
        isFormData: true,
      });

      await loadFiles();
      setShowUploadModal(false);
    } catch (err) {
      console.error("❌ Upload Error:", err);
      alert("File upload failed!");
    } finally {
      setUploading(false);
    }
  };

  // =============================
  // OPEN FILE
  // =============================
  const openFile = (file) => {
    const url = file.file_url || file.file_path;

    if (!url) {
      alert("File URL tidak ditemukan.");
      return;
    }

    const ext = url.split(".").pop()?.toLowerCase();

    // PDF → native browser preview
    if (ext === "pdf") {
      window.open(url, "_blank", "noopener,noreferrer");
      return;
    }

    // EXCEL → OPEN VIA EXCEL VIEWER
    if (["xls", "xlsx"].includes(ext)) {
      const useLocalExcel = process.env.REACT_APP_USE_LOCAL_EXCEL === "true";

      const localExcelPath =
        process.env.REACT_APP_LOCAL_EXCEL_PATH || "/temp-excel/sample3.xlsx";

      const excelUrl = useLocalExcel ? localExcelPath : url;
      const viewerUrl = `/excel-viewer?file=${encodeURIComponent(excelUrl)}`;

      window.open(viewerUrl, "_blank", "noopener,noreferrer");

      return;
    }

    // fallback
    window.open(url, "_blank", "noopener,noreferrer");
  };

  // =============================
  // DELETE FILE
  // =============================
  const handleDeleteFile = async () => {
    try {
      await ApiRequest({
        url: `/files/delete/${selectedFileId}`,
        method: "DELETE",
      });

      setOpenDeleteModal(false);
      setSelectedFileId(null);

      await loadFiles();
    } catch (err) {
      console.error("❌ Delete Error:", err);
      alert("Gagal menghapus file.");
    }
  };

  const getFileIcon = (file) => {
    const url = file.file_url || file.file_path || "";
    const ext = url.split(".").pop()?.toLowerCase();

    if (!ext) return PdfIcon;

    const imageExt = ["jpg", "jpeg", "png", "gif", "webp"];
    const excelExt = ["xls", "xlsx"];
    const wordExt = ["doc", "docx"];
    const pptExt = ["ppt", "pptx"];

    if (ext === "pdf") return PdfIcon;
    if (imageExt.includes(ext)) return ImgIcon;
    if (excelExt.includes(ext)) return XslIcon;
    if (wordExt.includes(ext)) return DocIcon;
    if (pptExt.includes(ext)) return PptIcon;

    return PdfIcon;
  };

  if (loading)
    return (
      <div className="mt-20 text-center text-text-secondary">Loading...</div>
    );

  return (
    <div className="relative w-full px-4 mx-auto max-w-[1400px] /* HP */ sm:px-4 tablet lg:px-4 laptop xl:px-4 desktop besar 2xl:px-4 layar">
      {/* 🔵 FULLSCREEN DRAG HIGHLIGHT */}
      {(dragActive || uploading) && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center border-4 bg-status-drag backdrop-blur-sm border-status-drag rounded-xl">
          {/* SPINNER */}
          <div className="w-12 h-12 mb-4 border-4 rounded-full border-status-drag border-t-status-drag animate-spin" />

          {/* TEXT */}
          <p className="text-base text-lg font-semibold text-blue-700 /* HP */ sm:text-lg tablet+">
            {uploading ? "Uploading file..." : "Drop your file here"}
          </p>

          <p className="mt-1 text-sm text-base text-blue-600 /* HP */ sm:text-lg tablet+">
            {uploading ? "Please wait" : "Release to upload"}
          </p>
        </div>
      )}

      <div
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-5 text-text-secondary"
      >
        <ArrowLeft
          size={18}
          onClick={() => navigate(-1)}
          className="transition cursor-pointer hover:text-brand-first"
        />
        <p className="text-xs font-medium transition cursor-pointer sm:text-sm lg:text-sm md:text-sm hover:text-brand-first">
          Back to Sales Tools Kit Folder
        </p>
      </div>

      <div className="flex justify-between">
        <h2 className="mb-6 text-base font-semibold text-brand-first /* HP */ sm:text-lg tablet lg:text-xl desktop">
          Sales Tools KIT › <span className="font-bold">{folderName}</span>
        </h2>

        {/* <button
          onClick={() => setShowUploadModal(true)}
          className="px-5 py-3 mb-10 text-white shadow-md bg-[#002D62] hover:bg-[#09345B] rounded-xl"
        >
          + Upload File
        </button> */}
      </div>

      <div className="mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search file name..."
          className="w-full max-w-md px-4 py-3 text-sm border border-text-secondary rounded-xl /* HP */ sm:text-base tablet+ focus:outline-none focus:ring-2 focus:ring-brand-first"
        />
      </div>

      {/* LIST FILES */}
      {filteredFiles.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-10 border-2 border-dashed border-text-secondary rounded-2xl py-60 text-text-secondary">
          <p className="mb-2 text-base font-semibold /* HP */ sm:text-lg tablet+">
            {search ? "File not found" : "Drag and Drop Your File"}
          </p>

          <p className="text-xs /* HP */ sm:text-sm tablet+">
            {search
              ? "Try different keyword"
              : "or drop file anywhere on this page"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredFiles.map((file) => (
            <div
              key={file.file_id}
              className="relative flex items-center justify-between px-5 py-5 border shadow-sm bg-surface-background rounded-xl border-surafce-border"
            >
              <div
                className="flex items-center gap-3 cursor-pointer"
                onClick={() => openFile(file)}
              >
                <img src={getFileIcon(file)} className="w-6 h-6" />
                <span className="text-xs font-medium text-brand-first /* HP */ sm:text-sm tablet lg:text-base desktop">
                  {file.file_name}
                </span>
              </div>

              <div className="relative">
                <EllipsisVertical
                  size={20}
                  className="cursor-pointer text-text-secondary hover:text-text-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenu(
                      openMenu === file.file_id ? null : file.file_id,
                    );
                  }}
                />

                {openMenu === file.file_id && (
                  <div className="absolute right-0 z-50 flex justify-center w-32 py-2 border shadow-lg top-10 bg-surface-card border-surface-border rounded-xl">
                    <button
                      onClick={() => {
                        downloadFile(file);
                        setOpenMenu(null);
                      }}
                      className="px-4 py-2"
                    >
                      <Download size={20} />
                    </button>

                    <div className="mx-2 w-[1px] h-9 bg-text-secondary"></div>

                    <button
                      onClick={() => {
                        setSelectedFileId(file.file_id);
                        setOpenDeleteModal(true);
                        setOpenMenu(null);
                      }}
                      className="px-4 py-2"
                    >
                      <img
                        src={DeleteIcon}
                        alt="delete"
                        className="object-contain w-5 h-5"
                      />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AddFileModal
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSubmit={handleFileUpload}
        loading={uploading}
        categoryId={categoryId}
        folderId={folderId}
      />

      <ConfirmDeleteModal
        open={openDeleteModal}
        onCancel={() => {
          setSelectedFileId(null);
          setOpenDeleteModal(false);
        }}
        onConfirm={handleDeleteFile}
      />
    </div>
  );
};

export default SalesToolsFile;
