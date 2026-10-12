import { ApiRequest } from "../apiRequest";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

/* ==================================================
   1️⃣ Get Selling Achieve Special by ID
================================================== */
const getSellingAchieveSpecialById = async (id) => {
  const res = await ApiRequest({
    url: `/program-selling-achieve-specials/${id}`,
    method: "GET",
  });

  return res?.data?.data || res?.data;
};

/* ==================================================
   2️⃣ Get Special Details by Program ID
================================================== */
const getSellingAchieveSpecialDetails = async (programId) => {
  const res = await ApiRequest({
    url: `/program-selling-achieve-special-details`,
    method: "GET",
    params: { program_id: programId },
  });

  return res?.data?.data || res?.data || [];
};

/* ==================================================
   3️⃣ Get Provinces Master
================================================== */
const getAllProvinces = async () => {
  const res = await ApiRequest({
    url: `/provinces`,
    method: "GET",
    params: { limit: 100 },
  });

  return res?.data?.data || res?.data || [];
};

/* ==================================================
   4️⃣ Generate Template Excel (KHUSUS)
================================================== */
const generateTemplateExcelSpecial = async ({
  templatePath,
  programCode,
  rows,
}) => {
  const template = await fetch(templatePath);

  if (!template.ok) {
    throw new Error("Template file not found in public/templates");
  }

  const buffer = await template.arrayBuffer();

  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);

  const worksheet = workbook.getWorksheet(1);

  // hapus contoh row lama, sisakan header
  if (worksheet.rowCount >= 2) {
    worksheet.spliceRows(2, worksheet.rowCount - 1);
  }

  let rowStart = 2;

  rows.forEach((item, index) => {
    const row = worksheet.getRow(rowStart + index);

    row.getCell(1).value = index + 1; // No.
    row.getCell(2).value = item.store_name || ""; // Nama Toko
    row.getCell(3).value = item.province_name || ""; // Provinsi
    row.getCell(4).value = item.target || 0; // Target(Rp)
    row.getCell(5).value = ""; // Achv (Rp) tetap kosong untuk diisi user

    row.eachCell((cell, colNumber) => {
      cell.font = { bold: false };

      cell.alignment = {
        vertical: "middle",
        horizontal: colNumber === 2 || colNumber === 3 ? "left" : "center",
      };
    });

    row.commit();
  });

  const blob = await workbook.xlsx.writeBuffer();

  saveAs(new Blob([blob]), `Template-${programCode}.xlsx`);
};

/* ==================================================
   5️⃣ MAIN FUNCTION (PUBLIC)
================================================== */
export const downloadSellingAchieveSpecialTemplate = async (
  sellingAchieveSpecialId,
) => {
  try {
    // master special
    const selling = await getSellingAchieveSpecialById(sellingAchieveSpecialId);

    const programId = selling?.program_id;
    const programCode = selling?.program?.program_code;

    if (!programId) {
      throw new Error("Program ID not found");
    }

    // ambil detail special + master province
    const [details, provinces] = await Promise.all([
      getSellingAchieveSpecialDetails(programId),
      getAllProvinces(),
    ]);

    const provinceMap = {};
    provinces.forEach((province) => {
      provinceMap[province.province_id] = province.name;
    });

    // mapping row seperti summary detail
    const rows = details.map((item) => {
      const provinceId =
        item.province_id ||
        item.store?.province_id ||
        item.province?.province_id;

      return {
        store_name: item.store?.store_name || "",
        province_name: provinceMap[provinceId] || item.province?.name || "",
        target: item.target || 0,
      };
    });

    await generateTemplateExcelSpecial({
      templatePath: "/templates/TEMPLATE SUMMARY PROGRAM 2.xlsx",
      programCode: programCode || "SPECIAL",
      rows,
    });
  } catch (err) {
    console.error("❌ downloadSellingAchieveSpecialTemplate error:", err);
    throw err;
  }
};
