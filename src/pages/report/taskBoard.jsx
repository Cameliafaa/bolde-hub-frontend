import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { groupTasksByStatuses } from "../../utils/report/reportAutomationUtils";
import AddTaskModal from "../../components/report/taskBoard/addTask";
import InlineSuccess from "../../components/common/inlineSuccess";
import DoneValidationModal from "../../components/report/taskBoard/addImageValidation";
import { ArrowLeft } from "lucide-react";

const initialForm = {
  title: "",
  description: "",
  status: "task",
  user_id: "",
  status_name_id: 2,
  task_category_id: "",
  priority: "",
  position_order: 1,
  report_type: "manual",
  report_period: "weekly",
  report_date: "",
  period_start: "",
  period_end: "",
  due_date: "",
  start_date: "",
  total_manual_report: 0,
  total_auto_report: 0,
  summary: "",
  status_automation: "pending",
};

const ReportAutomationTaskBoard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [columns, setColumns] = useState({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [taskCategories, setTaskCategories] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [draggingCard, setDraggingCard] = useState(null);
  const [showDoneValidationModal, setShowDoneValidationModal] = useState(false);
  const [pendingMove, setPendingMove] = useState(null);
  const [doneImage, setDoneImage] = useState(null);
  const [uploadingDoneValidation, setUploadingDoneValidation] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const rawUser = localStorage.getItem("userData");
  const currentUser = rawUser ? JSON.parse(rawUser) : {};

  const currentUserId = currentUser?.id;

  const fetchTaskCategories = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/task-category`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await res.json();

      if (result.status === "success") {
        setTaskCategories(result.data);
      }
    } catch (err) {
      console.error("Error fetch category:", err);
    }
  };

  useEffect(() => {
    fetchTaskCategories();
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [currentUserId]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const [tasksRes, statusRes] = await Promise.all([
        fetch(`${process.env.REACT_APP_API_BASE_URL}/tasks`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch(`${process.env.REACT_APP_API_BASE_URL}/status-name`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      const tasksText = await tasksRes.text();
      const statusText = await statusRes.text();

      if (!tasksRes.ok) {
        throw new Error(`Gagal mengambil data tasks (${tasksRes.status})`);
      }

      if (!statusRes.ok) {
        throw new Error(
          `Gagal mengambil data status-name (${statusRes.status})`,
        );
      }

      const tasksResult = JSON.parse(tasksText);
      const statusResult = JSON.parse(statusText);

      const allTasks = tasksResult?.data || [];

      const tasks = currentUserId
        ? allTasks.filter((task) => {
            return (
              Number(task.user_id) === Number(currentUserId) ||
              Number(task.created_by) === Number(currentUserId)
            );
          })
        : allTasks;
      const statuses = statusResult?.data || [];
      setColumns(groupTasksByStatuses(tasks, statuses));
    } catch (err) {
      console.error("fetchAllData error:", err);
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const getStatusValueFromColumn = (columnName) => {
    const lower = String(columnName || "").toLowerCase();

    if (lower === "task") return "task";
    if (lower === "in progress") return "in progress";
    if (lower === "on hold") return "on hold";
    if (lower === "done") return "done";

    return lower;
  };

  const updateTaskStatus = async (taskId, targetColumn) => {
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("status_name_id", targetColumn.status_name_id);
      formData.append("status", getStatusValueFromColumn(targetColumn.name));

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      const resultText = await response.text();

      if (!response.ok) {
        throw new Error(
          `Gagal update status (${response.status}) - ${resultText}`,
        );
      }

      return true;
    } catch (error) {
      console.error("updateTaskStatus error:", error);
      setError(error.message || "Gagal update status task");
      return false;
    }
  };

  const moveCardToColumn = async (card, sourceColumnKey, targetColumnKey) => {
    if (!card) return;
    if (sourceColumnKey === targetColumnKey) return;

    const sourceColumn = columns[sourceColumnKey];
    const targetColumn = columns[targetColumnKey];

    if (!sourceColumn || !targetColumn) return;

    const sourceStatus = String(sourceColumn.name || "").toLowerCase();
    const targetStatus = String(targetColumn.name || "").toLowerCase();

    // Done tidak boleh digeser kemanapun
    if (sourceStatus === "done") {
      setError("Task yang sudah Done tidak bisa dipindahkan lagi");
      return;
    }

    // Tidak boleh balik ke Task
    if (targetStatus === "task" && sourceStatus !== "task") {
      return;
    }

    // Perpindahan yang diizinkan
    const allowedMoves = {
      task: ["in progress", "on hold", "done"],
      "in progress": ["on hold", "done"],
      "on hold": ["in progress", "done"],
    };

    if (!allowedMoves[sourceStatus]?.includes(targetStatus)) {
      setError(
        `Task dari ${sourceColumn.name} tidak bisa dipindahkan ke ${targetColumn.name}`,
      );
      return;
    }

    const isDoneColumn =
      targetStatus === "done" || Number(targetColumn.status_name_id) === 4;

    if (isDoneColumn) {
      setPendingMove({
        card,
        sourceColumnKey,
        targetColumnKey,
        targetColumn,
      });
      setDoneImage(null);
      setShowDoneValidationModal(true);
      return;
    }

    const updatedCard = {
      ...card,
      status_name_id: targetColumn.status_name_id,
      status: getStatusValueFromColumn(targetColumn.name),
    };

    const previousColumns = columns;

    const newColumns = {
      ...columns,
      [sourceColumnKey]: {
        ...sourceColumn,
        items: sourceColumn.items.filter((item) => item.id !== card.id),
      },
      [targetColumnKey]: {
        ...targetColumn,
        items: [...targetColumn.items, updatedCard],
      },
    };

    setColumns(newColumns);

    const success = await updateTaskStatus(card.id, targetColumn);

    if (!success) {
      setColumns(previousColumns);
      return;
    }

    setSuccessMsg(
      `Task "${card.title}" berhasil dipindahkan ke ${targetColumn.name}`,
    );
  };

  const uploadTaskImages = async (taskId, file) => {
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("images", file); // tetap pakai key "images"

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/tasks/${taskId}/images`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) throw new Error("Upload gagal");

      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  const handleConfirmMoveToDone = async () => {
    if (!pendingMove) return;

    if (!doneImage) {
      setError("Image validasi wajib diupload sebelum task dipindah ke Done");
      return;
    }

    try {
      setUploadingDoneValidation(true);
      setError("");

      const { card, sourceColumnKey, targetColumnKey, targetColumn } =
        pendingMove;
      const sourceColumn = columns[sourceColumnKey];

      const updatedCard = {
        ...card,
        status_name_id: targetColumn.status_name_id,
        status:
          targetColumn.name?.toLowerCase() === "task"
            ? "task"
            : targetColumn.name?.toLowerCase(),
      };

      const previousColumns = columns;

      const optimisticColumns = {
        ...columns,
        [sourceColumnKey]: {
          ...sourceColumn,
          items: sourceColumn.items.filter((item) => item.id !== card.id),
        },
        [targetColumnKey]: {
          ...targetColumn,
          items: [...targetColumn.items, updatedCard],
        },
      };

      setColumns(optimisticColumns);

      const uploadSuccess = await uploadTaskImages(card.id, doneImage);

      if (!uploadSuccess) {
        setColumns(previousColumns);
        return;
      }

      const statusSuccess = await updateTaskStatus(card.id, targetColumn);

      if (!statusSuccess) {
        setColumns(previousColumns);
        return;
      }

      setSuccessMsg(`Task "${card.title}" berhasil dipindahkan ke Done`);
      setShowDoneValidationModal(false);
      setPendingMove(null);
      setDoneImage(null);
      fetchAllData();
    } catch (error) {
      console.error(error);
      setError("Gagal memproses validasi Done");
    } finally {
      setUploadingDoneValidation(false);
    }
  };

  const handleCloseDoneValidationModal = () => {
    setShowDoneValidationModal(false);
    setPendingMove(null);
    setDoneImage(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOpenAddModal = (column) => {
    setForm({
      ...initialForm,
      user_id: currentUserId,
      status_name_id: column.status_name_id,
      status: getStatusValueFromColumn(column.name),
    });
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setForm(initialForm);
  };

  const handleSubmitTask = async (finalData) => {
    try {
      setSubmitting(true);
      setError("");

      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("title", finalData.title);
      formData.append("description", finalData.description);
      formData.append("status", finalData.status);
      formData.append("user_id", finalData.user_id || currentUserId);
      formData.append("status_name_id", finalData.status_name_id);
      formData.append("task_category_id", finalData.task_category_id);
      formData.append("priority", finalData.priority);
      formData.append("position_order", finalData.position_order);

      formData.append("report_type", "manual");
      formData.append("report_period", "");

      formData.append("due_date", finalData.due_date);
      formData.append("start_date", finalData.start_date);

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/tasks`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        },
      );

      if (!response.ok) throw new Error("Gagal tambah task");

      // ✅ SUCCESS DI SINI
      setSuccessMsg("Task berhasil ditambahkan");

      handleCloseAddModal();
      fetchAllData();
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal menambah task");
    } finally {
      setSubmitting(false);
    }
  };

  const getCardImageUrl = (card) => {
    const image = card.images?.[0];

    if (!image) return null;

    const imagePath =
      image.image_url ||
      image.file_url ||
      image.path ||
      image.url ||
      image.filename;

    if (!imagePath) return null;

    if (imagePath.startsWith("http")) return imagePath;

    return `${process.env.REACT_APP_API_BASE_URL}/${imagePath}`;
  };

  return (
    <div>
      {/* <div style={styles.topBar}>
        <button
          style={styles.backButton}
          className="justify-end"
          onClick={() => navigate("/report")}
        >
          ← Back to Dashboard
        </button>
      </div> */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <ArrowLeft
          size={18}
          className="cursor-pointer text-brand-first"
          onClick={() => navigate(-1)}
        />
        <p className="text-sm text-brand-first">Back to Report</p>
      </div>

      <div>
        <h1 className="text-xl font-semibold sm:text-2xl text-brand-first">
          Task Board
        </h1>

        <p className="mt-1 mb-5 text-sm text-text-light">
          Kelola, pantau, dan update progress task harian tim kamu secara
          realtime.
        </p>
      </div>

      <InlineSuccess message={successMsg} onClose={() => setSuccessMsg("")} />

      {loading ? (
        <div style={styles.stateBox}>Loading task board...</div>
      ) : error ? (
        <div style={styles.errorBox}>{error}</div>
      ) : (
        <div style={styles.boardWrap}>
          {Object.entries(columns)
            .sort((a, b) => a[1].sequence - b[1].sequence)
            .map(([columnKey, column]) => (
              <div
                key={columnKey}
                style={{
                  ...styles.column,
                  background:
                    draggingCard && draggingCard.sourceColumnKey !== columnKey
                      ? "#1B5E9E"
                      : "#0F4C81",
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
                onDrop={async (e) => {
                  e.preventDefault();

                  if (!draggingCard) return;

                  await moveCardToColumn(
                    draggingCard.card,
                    draggingCard.sourceColumnKey,
                    columnKey,
                  );

                  setDraggingCard(null);
                }}
              >
                <div style={styles.columnHeader}>
                  <div style={styles.columnHeaderLeft}>
                    {column.name?.toLowerCase() === "task" && (
                      <span style={styles.columnBadgeTask}>Task</span>
                    )}

                    {column.name?.toLowerCase() === "in progress" && (
                      <span style={styles.columnBadgeProgress}>
                        In Progress
                      </span>
                    )}

                    {column.name?.toLowerCase() === "on hold" && (
                      <span style={styles.columnBadgeProgress}>On Hold</span>
                    )}

                    {column.name?.toLowerCase() === "done" && (
                      <span style={styles.columnBadgeDone}>Done</span>
                    )}
                  </div>

                  {/* <span style={{ color: "#94A3B8", fontWeight: 900 }}>•••</span> */}
                </div>

                <div style={styles.cardList}>
                  {column.items.length > 0 &&
                    column.items.map((card) => (
                      <div
                        key={card.id}
                        style={{
                          ...styles.card,
                          cursor:
                            column.name?.toLowerCase() === "done"
                              ? "not-allowed"
                              : "grab",
                          opacity: draggingCard?.card?.id === card.id ? 0.6 : 1,
                        }}
                        onClick={() => setSelectedCard(card)}
                        draggable={column.name?.toLowerCase() !== "done"}
                        onDragStart={(e) => {
                          if (column.name?.toLowerCase() === "done") {
                            e.preventDefault();
                            return;
                          }

                          setDraggingCard({
                            card,
                            sourceColumnKey: columnKey,
                          });
                        }}
                        onDragEnd={() => {
                          setDraggingCard(null);
                        }}
                      >
                        {/* <div style={styles.previewBox}>
                          {card.previewImage ? (
                            <img
                              src={card.previewImage}
                              alt={card.title}
                              style={styles.previewImage}
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          ) : (
                            <div style={styles.noImage}>No Image</div>
                          )}
                        </div> */}

                        <div
                          style={{
                            ...styles.tag,
                            background:
                              card.category_name?.toLowerCase() === "design"
                                ? "#ec4899"
                                : "#3b82f6",
                          }}
                        >
                          {card.category_name}
                        </div>

                        {/* <div style={styles.cardMeta}>
                          <span>📁 {card.category_name}</span>
                          <span>🖼 {card.images.length}</span>
                        </div> */}

                        <div style={styles.cardTitleText}>{card.title}</div>
                        <div style={styles.cardDesc}>
                          {card.description || "-"}
                        </div>

                        <div style={styles.cardMeta}>
                          <span>📅 {formatDate(card.due_date)}</span>
                          <span>⚡ {card.priority}</span>
                        </div>
                      </div>
                    ))}
                  {column.items.length === 0 && (
                    <div style={styles.emptyColumnBox}>
                      <p style={styles.emptyColumnText}>
                        Belum ada task di status {column.name}
                      </p>
                    </div>
                  )}
                  {column.name?.toLowerCase() === "task" && (
                    <button
                      style={styles.addCardButton}
                      onClick={() => handleOpenAddModal(column)}
                    >
                      + Add a card
                    </button>
                  )}{" "}
                </div>
              </div>
            ))}
        </div>
      )}

      {selectedCard && (
        <div style={styles.modalOverlay} onClick={() => setSelectedCard(null)}>
          <div style={styles.detailModal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>{selectedCard.title}</h2>
              <button
                style={styles.closeButton}
                onClick={() => setSelectedCard(null)}
              >
                ×
              </button>
            </div>

            <div style={styles.detailBadge}>
              {selectedCard.category_name || "-"}
            </div>

            <div style={styles.detailRow}>
              <strong>Description</strong>
              <p>{selectedCard.description || "-"}</p>
            </div>

            <div style={styles.detailGrid}>
              <div>
                <strong>Status</strong>
                <p>{selectedCard.status || "-"}</p>
              </div>
              <div>
                <strong>Priority</strong>
                <p>{selectedCard.priority || "-"}</p>
              </div>
              <div>
                <strong>Due Date</strong>
                <p>{formatDate(selectedCard.due_date)}</p>
              </div>
              <div>
                <strong>Start Date</strong>
                <p>{formatDate(selectedCard.start_date)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <AddTaskModal
        show={showAddModal}
        onClose={handleCloseAddModal}
        onSubmit={handleSubmitTask}
        form={form}
        setForm={setForm}
        initialForm={initialForm}
        submitting={submitting}
        taskCategories={taskCategories}
      />

      <DoneValidationModal
        show={showDoneValidationModal}
        onClose={handleCloseDoneValidationModal}
        onConfirm={handleConfirmMoveToDone}
        file={doneImage}
        setFile={setDoneImage}
        submitting={uploadingDoneValidation}
        taskTitle={pendingMove?.card?.title || ""}
      />
    </div>
  );
};

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const styles = {
  page: {
    minHeight: "100vh",
    background: "#EEF3F8",
    padding: 20,
  },
  topBar: {
    display: "flex",
    justifyContent: "flex-start",
    marginBottom: 18,
  },
  backButton: {
    background: "#0B2F63",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "12px 18px",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 16,
    boxShadow: "0 4px 14px rgba(11,47,99,0.18)",
  },
  boardHeader: {
    marginBottom: 18,
  },
  boardTitle: {
    color: "#0B3A78",
    margin: 0,
    fontSize: 34,
    fontWeight: 800,
    letterSpacing: "-0.5px",
  },
  stateBox: {
    background: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    border: "1px solid #E5EAF0",
    color: "#5B6472",
  },
  errorBox: {
    background: "#FEE2E2",
    color: "#991B1B",
    borderRadius: 18,
    padding: 18,
  },
  boardWrap: {
    display: "flex",
    gap: 20,
    overflowX: "auto",
    paddingBottom: 20,
    alignItems: "flex-start",
  },
  column: {
    minWidth: 320,
    maxWidth: 320,
    background: "#F8FBFF",
    borderRadius: 24,
    padding: 16,
    border: "1px solid #DCE8F6",
    boxShadow: "0 8px 24px rgba(11, 58, 120, 0.08)",
  },
  columnHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontWeight: 800,
    fontSize: 17,
    marginBottom: 14,
    color: "#274C77",
    padding: "2px 2px 8px 2px",
  },
  columnHeaderLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  columnBadgeTask: {
    background: "#E8F4FF",
    color: "#0B3A78",
    padding: "7px 14px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 800,
  },

  columnBadgeProgress: {
    background: "#FFF4CC",
    color: "#9A6A00",
    padding: "7px 14px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 800,
  },

  columnBadgeHold: {
    background: "#FFE9D5",
    color: "#B45309",
    padding: "7px 14px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 800,
  },
  columnBadgeDone: {
    background: "#DCFCE7",
    color: "#15803D",
    padding: "7px 14px",
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 800,
  },
  cardList: {
    display: "flex",
    flexDirection: "column",
    gap: 14,
    minHeight: 120,
  },
  addCardButton: {
    background: "#FFFFFF",
    border: "1px dashed #7DB7E8",
    color: "#0B3A78",
    textAlign: "left",
    padding: "14px 16px",
    cursor: "pointer",
    fontSize: 16,
    fontWeight: 700,
    borderRadius: 18,
  },
  card: {
    background: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    border: "1px solid #E6ECF3",
    boxShadow: "0 8px 22px rgba(11, 58, 120, 0.08)",
  },
  tag: {
    display: "inline-block",
    color: "#fff",
    fontSize: 12,
    fontWeight: 800,
    padding: "6px 12px",
    borderRadius: 999,
    marginBottom: 12,
  },
  cardTitleText: {
    fontSize: 18,
    fontWeight: 800,
    lineHeight: "24px",
    color: "#1E2A3A",
  },
  cardDesc: {
    paddingTop: 8,
    fontSize: 15,
    lineHeight: "22px",
    color: "#6B7280",
    minHeight: 44,
  },
  cardMeta: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    color: "#6B7280",
    fontSize: 14,
    marginTop: 14,
    paddingTop: 12,
    borderTop: "1px solid #EEF2F7",
  },
  emptyColumnBox: {
    minHeight: 120,
    borderRadius: 18,
    border: "1px dashed rgba(255,255,255,0.35)",
    background: "rgba(255,255,255,0.08)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    textAlign: "center",
  },
  emptyColumnText: {
    margin: 0,
    color: "rgba(255,255,255,0.78)",
    fontSize: 14,
    fontWeight: 600,
    lineHeight: "20px",
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: 20,
  },

  detailModal: {
    width: "100%",
    maxWidth: 560,
    background: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    boxShadow: "0 24px 70px rgba(15, 23, 42, 0.25)",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },

  modalTitle: {
    margin: 0,
    fontSize: 24,
    fontWeight: 800,
    color: "#0B3A78",
  },

  closeButton: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    border: "none",
    background: "#EEF2F7",
    color: "#0B3A78",
    fontSize: 24,
    cursor: "pointer",
  },

  detailBadge: {
    display: "inline-block",
    background: "#ec4899",
    color: "#fff",
    fontSize: 13,
    fontWeight: 800,
    padding: "7px 14px",
    borderRadius: 999,
    marginBottom: 18,
  },

  detailRow: {
    marginBottom: 20,
    color: "#374151",
    lineHeight: "24px",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 18,
    color: "#374151",
  },
};

export default ReportAutomationTaskBoard;
