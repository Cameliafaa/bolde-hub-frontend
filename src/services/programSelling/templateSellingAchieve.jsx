import { ApiRequest } from "../apiRequest";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/* ==================================================
   1️⃣ Get Selling Achieve by ID
================================================== */
const getSellingAchieveById = async (id) => {
  const res = await ApiRequest({
    url: `/program-selling-achieves/${id}`,
    method: "GET",
  });

  return res?.data?.data || res?.data;
};

/* ==================================================
   2️⃣ Get Program Detail
================================================== */
const getProgramDetail = async (programId) => {
  const res = await ApiRequest({
    url: `/programs/detail/${programId}`,
    method: "GET",
  });

  return res?.data?.data || res?.data;
};

/* ==================================================
   3️⃣ Get Master Provinces
================================================== */
const getProvinces = async () => {
  const res = await ApiRequest({
    url: `/provinces`,
    method: "GET",
    params: { limit: 100 },
  });

  return res?.data?.data || res?.data || [];
};

/* ==================================================
   4️⃣ Generate Template Excel
================================================== */
const generateTemplateExcel = async ({
  templatePath,
  programCode,
  skuList,
  provinceList,
  skuTargetMap,
}) => {
  const template = await fetch(templatePath);
  const buffer = await template.arrayBuffer();

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.getWorksheet(1);

  // HAPUS semua row lama dari template
  if (worksheet.rowCount > 1) {
    worksheet.spliceRows(2, worksheet.rowCount - 1);
  }
  worksheet.getColumn(4).numFmt = "dd/mm/yyyy";
  worksheet.getColumn(4).width = 15;

  let rowStart = 2; // karena header ada di row 1
  const today = new Date();

  provinceList.forEach((province) => {
    const row = worksheet.getRow(rowStart);
    row.font = {
      name: "Calibri",
      size: 11,
    };

    // A = Province
    row.getCell(1).value = province.name;

    // B = Region
    row.getCell(2).value = province.area?.name || "";

    // C = Allocation Percent
    const percent = province.allocation_percent || 0;
    row.getCell(3).value = percent / 100;
    row.getCell(3).numFmt = "0%";

    // D = Date
    row.getCell(4).value = today;

    // SKU mulai kolom 4
    skuList.forEach((sku, index) => {
      const baseCol = 5 + index * 4;

      row.getCell(baseCol).value = sku; // SKU Name
      const skuTarget = skuTargetMap[sku] || 0;
      const targetQty = Math.round((skuTarget * percent) / 100);

      const targetCell = row.getCell(baseCol + 1);
      targetCell.value = targetQty;
      targetCell.numFmt = "0"; // force number format
      row.getCell(baseCol + 2).value = ""; // Actual
      row.getCell(baseCol + 3).value = ""; // Actual
    });
    row.commit();
    rowStart++;
  });

  const blob = await workbook.xlsx.writeBuffer();

  saveAs(new Blob([blob]), `Template-${programCode}.xlsx`);
};

/* ==================================================
   5️⃣ MAIN FUNCTION (PUBLIC)
================================================== */
export const downloadSellingAchieveTemplate = async (sellingAchieveId) => {
  try {
    // 1️⃣ Get selling achieve
    const selling = await getSellingAchieveById(sellingAchieveId);

    const programId = selling?.program_id;

    if (!programId) {
      throw new Error("Program ID not found");
    }

    // 2️⃣ Get program detail
    const program = await getProgramDetail(programId);

    const skuList = program?.program_items?.map((item) => item.sku_name) || [];

    const skuTargetMap = {};
    program?.program_items?.forEach((item) => {
      skuTargetMap[item.sku_name] = item.target_selling_qty || 0;
    });
    const provinceIds =
      program?.program_provinces?.map((p) => p.province_id) || [];

    const masterProvinces = await getProvinces();

    let provinceList =
      provinceIds.length > 0
        ? masterProvinces.filter((p) => provinceIds.includes(p.province_id))
        : masterProvinces;

    // 🔥 SORT BY REGION
    provinceList = provinceList.sort((a, b) => {
      const regionA = a.area?.name || "";
      const regionB = b.area?.name || "";
      return regionA.localeCompare(regionB);
    });

    // 4️⃣ Generate template
    await generateTemplateExcel({
      templatePath: "/templates/TEMPLATE SUMMARY PROGRAM 1.xlsx",
      programCode: program?.program?.program_code,
      skuList,
      provinceList,
      skuTargetMap,
    });
  } catch (err) {
    console.error("❌ downloadSellingAchieveTemplate error:", err);
    throw err;
  }
};
