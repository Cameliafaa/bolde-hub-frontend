export const normalizeStatusKey = (name = "") => {
  return name.toLowerCase().trim().replace(/\s+/g, "_");
};

export const normalizeTask = (task) => {
  const firstImage =
    task.images && task.images.length > 0
      ? task.images[0].image_url?.replace(/\\/g, "/")
      : "";

  return {
    id: String(task.task_id),
    task_id: task.task_id,
    title: task.title,
    description: task.description,
    priority: task.priority,
    due_date: task.due_date,
    start_date: task.start_date,
    report_type: task.report_type,
    report_period: task.report_period,
    summary: task.summary,
    status: task.status,
    status_name_id: task.status_name_id,
    category_name: task.task_category?.name || "-",
    images: task.images || [],
    previewImage: firstImage,
    raw: task,
  };
};

export const buildColumnsFromStatuses = (statuses = []) => {
  const columns = {};

  statuses.forEach((status) => {
    const key = normalizeStatusKey(status.name);
    columns[key] = {
      status_name_id: status.status_name_id,
      name: status.name,
      sequence: status.sequence,
      items: [],
    };
  });

  return columns;
};

export const groupTasksByStatuses = (tasks = [], statuses = []) => {
  const columns = buildColumnsFromStatuses(statuses);

  const statusIdMap = {};
  statuses.forEach((status) => {
    statusIdMap[status.status_name_id] = normalizeStatusKey(status.name);
  });

  tasks.forEach((task) => {
    const normalized = normalizeTask(task);
    const columnKey = statusIdMap[task.status_name_id];

    if (columnKey && columns[columnKey]) {
      columns[columnKey].items.push(normalized);
    }
  });

  return columns;
};

export const buildDashboardSummary = (tasks = [], statuses = []) => {
  const doneStatus = statuses.find(
    (item) => item.name?.toLowerCase().trim() === "done",
  );

  const totalTask = tasks.length;
  const manualReport = tasks.filter((t) => t.report_type === "manual").length;
  const autoReport = tasks.filter((t) => t.report_type === "auto").length;
  const done = doneStatus
    ? tasks.filter((t) => t.status_name_id === doneStatus.status_name_id).length
    : 0;

  return {
    totalTask,
    manualReport,
    autoReport,
    done,
  };
};
