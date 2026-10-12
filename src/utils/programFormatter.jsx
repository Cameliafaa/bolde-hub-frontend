// utils/programFormatter.js

export const formatToSummaryProgram = (item) => ({
  program_id: item.program_id,
  program_type: item.program_type || "Program",
  program_name: `${item.program_type || ""} - ${item.name}`,
  area:
    item.program_areas?.length > 0
      ? item.program_areas.map((a) => `Area ${a.area_id}`).join(", ")
      : "All Area",
});
