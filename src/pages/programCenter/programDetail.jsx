import React, { useState, useEffect, useRef } from "react";
import { ArrowLeft, Download, Calendar } from "lucide-react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ApiRequest } from "../../services/apiRequest";
import ProgramApproval from "../../components/programCenter/programApproval/programApproval";
import html2pdf from "html2pdf.js";
import WarningIcon from "../../assets/images/icons/icon-exp-7d.png";
import UpdateIcon from "../../assets/images/icons/editIcon.png";
import { canViewWaitingProgram } from "../../utils/approvalUtils";

// SIGNATURE IMAGES
import RicoSign from "../../assets/images/ttd/rico.png";
import AirlanggaSign from "../../assets/images/ttd/airlangga.png";
import WilmanSign from "../../assets/images/ttd/wilman.png";
import HaryonoSign from "../../assets/images/ttd/haryono.png";

// PDFMAKE + HTML CONVERTER
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
import htmlToPdfmake from "html-to-pdfmake";
import EditProgramModal from "../../components/programCenter/editProgram/editProgram";
import ExtendProgramModal from "../../components/programCenter/extendProgram/extendProgram";
import ExtendSuccessModal from "../../components/programCenter/extendProgram/extendSuccessModal";

pdfMake.vfs = pdfFonts.vfs;

const ProgramDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const pdfRef = useRef();
  const location = useLocation();

  const [program, setProgram] = useState(null);
  const [areasList, setAreasList] = useState([]);
  const [channelsList, setChannelsList] = useState([]);
  const [approvers, setApprovers] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [letter, setLetter] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploader, setUploader] = useState(null);
  const [category, setCategory] = useState(null);

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openExtendModal, setOpenExtendModal] = useState(false);

  const [showExtendSuccess, setShowExtendSuccess] = useState(false);
  const [newProgram, setNewProgram] = useState(null);

  const [sellingAchieveId, setSellingAchieveId] = useState(null);

  const APPROVERS_ORDER = [112, 9, 10]; // Airlangga → Wilman → Haryono

  // Helper: image URL → base64 (buat pdfMake)
  const toBase64 = (url) =>
    new Promise((resolve, reject) => {
      fetch(url)
        .then((res) => res.blob())
        .then((blob) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        })
        .catch(reject);
    });

  // === FETCH PROGRAM DETAIL ===
  const fetchProgramDetail = async () => {
    try {
      const token = localStorage.getItem("token");
      const [programRes, categoryRes, areaRes, channelRes, profileRes] =
        await Promise.all([
          ApiRequest({
            url: `/programs/detail/${id}`,
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }),
          ApiRequest({
            url: "/program-categories/all",
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }),
          ApiRequest({
            url: "/areas/all?page=1&limit=100",
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }),
          ApiRequest({
            url: "/channels/all?page=1&limit=100",
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }),
          // ApiRequest({
          //   url: "/provinces?page=1&limit=100",
          //   method: "GET",
          //   headers: { Authorization: `Bearer ${token}` },
          // }),
          // ApiRequest({
          //   url: "/stores?page=1&limit=100",
          //   method: "GET",
          //   headers: { Authorization: `Bearer ${token}` },
          // }),
          ApiRequest({
            url: `/profile/me`,
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

      if (categoryRes.status === "success") setCategory(categoryRes.data);
      if (profileRes.status === "success") setUserProfile(profileRes.data);
      if (areaRes.status === "success") setAreasList(areaRes.data);
      if (channelRes.status === "success") setChannelsList(channelRes.data);
      // if (provinceRes.status === "success") setChannelsList(channelRes.data);
      // if (channelRes.status === "success") setChannelsList(channelRes.data);

      if (programRes.status === "success" && programRes.data) {
        const d = programRes.data.program;
        const approvals = [...(programRes.data.program_approvals || [])].sort(
          (a, b) =>
            APPROVERS_ORDER.indexOf(a.user_id) -
            APPROVERS_ORDER.indexOf(b.user_id),
        );

        setProgram({
          ...d,
          approvals,
          program_categories: categoryRes.data.program_categories || [],
          areas: programRes.data.program_areas || [],
          channels: programRes.data.program_channels || [],
          items: programRes.data.program_items || [],

          provinces: programRes.data.program_provinces || [],
          stores: programRes.data.program_stores || [],
          program_types: programRes.data.program_types || [], // <— WAJIB
          program_letters: programRes.data.program_letters || [],
        });

        // uploader
        if (d.user_id) {
          const userRes = await ApiRequest({
            url: `/users/detail/${d.user_id}`,
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          });
          if (userRes.status === "success") {
            setUploader({
              id: d.user_id,
              name:
                userRes.data?.name || userRes.data?.full_name || "Unknown User",
              image:
                userRes.data?.image_url ||
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  userRes.data?.name || "Uploader",
                )}&background=random`,
            });
          }
        }

        if (programRes.data.program_letters?.length > 0) {
          setLetter(programRes.data.program_letters[0]);
        }
      }
    } catch (err) {
      console.error("Gagal ambil detail program:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgramDetail();
  }, [id]);

  useEffect(() => {
    if (!program?.program_id) return;

    const fetchSellingAchieveId = async () => {
      try {
        const res = await ApiRequest({
          url: `/program-selling-achieves?program_id=${program.program_id}`,
          method: "GET",
        });

        if (res?.status === "success" && res.data?.length > 0) {
          setSellingAchieveId(res.data[0].program_selling_achieve_id);
        }
      } catch (err) {
        console.error("Gagal ambil selling achieve id:", err);
      }
    };

    fetchSellingAchieveId();
  }, [program?.program_id]);

  // === FETCH APPROVERS DETAIL ===
  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        if (!program?.approvals?.length) return;
        const token = localStorage.getItem("token");

        const results = await Promise.all(
          program.approvals.map((a) =>
            ApiRequest({
              url: `/users/detail/${a.user_id}`,
              method: "GET",
              headers: { Authorization: `Bearer ${token}` },
            }),
          ),
        );

        const users = results
          .filter((r) => r.status === "success")
          .map((r, i) => ({
            ...r.data,
            status: (program.approvals[i].status || "").toLowerCase(),
          }));

        setApprovers(users);
      } catch (err) {
        console.error("Gagal ambil approvers:", err);
      }
    };

    fetchApprovers();
  }, [program]);

  // === APPROVAL LOGIC ===
  const currentUserApprovalIndex = program?.approvals?.findIndex(
    (a) => a.user_id === userProfile?.user_id,
  );

  const canApprove =
    currentUserApprovalIndex !== -1 &&
    (
      program?.approvals?.[currentUserApprovalIndex]?.status || ""
    ).toLowerCase() === "pending" &&
    (currentUserApprovalIndex === 0 ||
      program.approvals
        .slice(0, currentUserApprovalIndex)
        .every((a) => (a.status || "").toLowerCase() === "approved"));

  const approvalsStatus = program?.approvals?.map((a) =>
    (a.status || "").toLowerCase(),
  );

  const hasRejected = approvalsStatus?.includes("rejected");
  const allApproved =
    approvalsStatus?.length > 0 &&
    approvalsStatus?.every((s) => s === "approved");

  // let displayStatus = "Waiting Approval";
  // if (hasRejected) displayStatus = "Rejected";
  // else if (allApproved) displayStatus = "Approved";
  // else if (program?.status === "active") displayStatus = "Active";

  // === STATUS LOGIC ===
  let displayStatus = "Waiting Approval";

  if (program) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endDateOnly = new Date(program.period_end);
    endDateOnly.setHours(0, 0, 0, 0);

    const daysLeft = Math.floor((endDateOnly - today) / (1000 * 60 * 60 * 24));

    const canExtend =
      daysLeft >= 0 &&
      daysLeft <= 7 &&
      program.is_extended === false &&
      program.user_id === userProfile?.user_id;

    if (hasRejected) {
      displayStatus = "Rejected";
    } else if (allApproved) {
      if (today > endDateOnly) {
        displayStatus = "Expired";
      } else {
        displayStatus = "Active";
      }
    }
  }

  // === HELPERS ===
  const getValidCategory = () => {
    if (!program?.program_category_id) return null;

    return category.find(
      (cat) => cat.program_category_id === program.program_category_id,
    );
  };
  const validCategory = getValidCategory();

  const getValidAreas = () => {
    if (!program?.areas?.length) return [];

    return program.areas
      .map((pa) => areasList.find((a) => a.area_id === pa.area_id))
      .filter(Boolean); // 🔥 buang area yg sudah dihapus
  };
  const validAreas = getValidAreas();

  // const getAreaName = (id) =>
  //   areasList.find((a) => a.area_id === id)?.name || `Area ${id}`;

  const getValidChannels = () => {
    if (!program?.channels?.length) return [];

    return program.channels
      .map((pc) => channelsList.find((c) => c.channel_id === pc.channel_id))
      .filter(Boolean); // 🔥 buang channel yg sudah dihapus
  };

  const validChannels = getValidChannels();

  const getChannelName = (id) =>
    channelsList.find((c) => c.channel_id === id)?.name || `Channel ${id}`;

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Loading program details...</p>
      </div>
    );

  if (!program)
    return (
      <div className="flex items-center justify-center h-screen">
        <p>Program not found</p>
      </div>
    );

  const formatRupiahCell = (value) => `
  <div style="display:flex; justify-content:space-between; width:100%;">
    <span>Rp</span>
    <span>${value?.toLocaleString("id-ID") || "-"}</span>
  </div>
`;

  const formatPercentCell = (value) => `
  <div style="text-align:right;">
    ${
      value !== undefined && value !== null
        ? value.toLocaleString("id-ID") + "%"
        : "-"
    }
  </div>
`;

  const start = new Date(program.period_start);
  const end = new Date(program.period_end);
  const created = new Date(program.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const Signatures = {
    "Rico TandiWijaya": RicoSign,
    "Airlangga Gusti": AirlanggaSign,
    "Wilman Hilmani": WilmanSign,
    "Haryono Chandra": HaryonoSign,
  };

  const SignatureTitles = {
    "Rico TandiWijaya": "SPV Marketing",
    "Airlangga Gusti": "Digital Marketing Manager",
    "Wilman Hilmani": "General Manager Marketing",
    "Haryono Chandra": "Direktur Marketing & Sales",
  };

  const calculateAmount = (item) => {
    const price = Number(item?.price || 0);
    const qty = Number(item?.qty || 0);

    return price * qty;
  };

  // === HTML template proposal (tanpa kop surat) ===
  const pdfHTML = `
  <div style="width:170mm; min-height:250mm; padding:30px 40px; font-size:13px; color:#000;">
    <h2 style="text-align:center; font-weight:bold;">PROPOSAL PENGAJUAN PROGRAM MARKETING</h2>
    <p style="text-align:right; padding:20px;">Tangerang, ${created}</p>

    <table style="margin-bottom:20px;">
      <tr><td style="width:90px;">Nomor</td><td>: ${program.program_code}</td></tr>
      <tr><td>Perihal</td><td>: Pengajuan Program ${program.name}</td></tr>
    </table>

    <p>Kepada Yth,<br>Bapak Haryono Chandra<br>Sales & Marketing Director<br>PT BOLDe Inovasi Global<br>di Tempat</p>
    <p><br>Dengan hormat,</p>
    <div>${letter.opening_text_html || ""}</div>

    <p><br><b>Nama Program:<br></b> ${program.name}</p>
    <p><br><b>Periode Program:<br></b> ${start.toLocaleDateString(
      "id-ID",
    )} - ${end.toLocaleDateString("id-ID")}</p>
<p><br><b>Channel:<br></b> ${
    validChannels.length === channelsList.length
      ? "ALL"
      : validChannels.map((c) => c.name).join(", ")
  }</p>
<p><br><b>Area:<br></b> ${
    validAreas.length === areasList.length
      ? "ALL"
      : validAreas.map((a) => a.name).join(", ")
  }</p>

    <h4 style="margin-top:20px;"><b>Ketentuan Program:</b></h4>
    Terlampir
    
    <h4 style="margin-top:25px;"><b>Analisa Cost & Benefit:</b></h4>
    <table style="width:100%; border-collapse:collapse; font-size:12px; margin-top:10px;">
      <thead style="background-color:#b91c1c; color:white;">
        <tr><th style="border:1px solid #000; padding:5px;">Komponen</th><th style="border:1px solid #000; padding:5px;">After Program</th></tr>
      </thead>
      <tbody>
<tr>
  <td style="border:1px solid #000; padding:5px;">
    Pertumbuhan Omzet (Sell-In) per Bulan
  </td>
  <td style="border:1px solid #000; padding:5px;">
    ${formatRupiahCell(program.monthly_turnover)}
  </td>
</tr>

<tr>
  <td style="border:1px solid #000; padding:5px;">
    Estimasi Margin Kotor (${program.margin_percentage}%)
  </td>
  <td style="border:1px solid #000; padding:5px;">
    ${formatRupiahCell(program.gross_margin_estimate)}
  </td>
</tr>

<tr>
  <td style="border:1px solid #000; padding:5px;">
    Budget Program
  </td>
  <td style="border:1px solid #000; padding:5px;">
    ${formatRupiahCell(program.budget_program)}
  </td>
</tr>

<tr>
  <td style="border:1px solid #000; padding:5px;">
    Target Program
  </td>
  <td style="border:1px solid #000; padding:5px;">
    ${formatRupiahCell(program.target_program)}
  </td>
</tr>

<tr>
  <td style="border:1px solid #000; padding:5px;">
    % Budget
  </td>
  <td style="border:1px solid #000; padding:5px;">
    ${formatPercentCell(program.budget_percent)}
  </td>
</tr>
      </tbody>
    </table>

    <h4 style="margin-top:30px;"><b>Kesimpulan:</b></h4>
    <div>${letter.conclusion_text_html || ""}</div>

    <div><br>${letter.closing_text_html || ""}</div>

    <h4 style="margin-top:30px;">Hormat Kami,</h4>
    <h4>Menyetujui</h4>

    ${
      allApproved || program?.status === "active"
        ? `
<!-- SIGNATURES_BLOCK_START -->
<div style="
  margin-top:40px;
  display:flex;
  justify-content:space-between;
  width:100%;
  text-align:center;
">
  
  <div style="width:24%; display:flex; flex-direction:column; align-items:center;">
    <img src="${Signatures["Rico TandiWijaya"]}" style="width:90px;height:55px;object-fit:contain;" />
    <div style="margin-top:8px;font-weight:bold;">Rico Tandiwijaya</div>
    <div style="font-size:12px;margin-top:2px;">${SignatureTitles["Rico TandiWijaya"]}</div>
  </div>

  <div style="width:24%; display:flex; flex-direction:column; align-items:center;">
    <img src="${Signatures["Airlangga Gusti"]}" style="width:90px;height:55px;object-fit:contain;" />
    <div style="margin-top:8px;font-weight:bold;">Airlangga Gusti</div>
    <div style="font-size:12px;margin-top:2px;">${SignatureTitles["Airlangga Gusti"]}</div>
  </div>

  <div style="width:24%; display:flex; flex-direction:column; align-items:center;">
    <img src="${Signatures["Wilman Hilmani"]}" style="width:90px;height:55px;object-fit:contain;" />
    <div style="margin-top:8px;font-weight:bold;">Wilman Hilmani</div>
    <div style="font-size:12px;margin-top:2px;">${SignatureTitles["Wilman Hilmani"]}</div>
  </div>

  <div style="width:24%; display:flex; flex-direction:column; align-items:center;">
    <img src="${Signatures["Haryono Chandra"]}" style="width:90px;height:55px;object-fit:contain;" />
    <div style="margin-top:8px;font-weight:bold;">Haryono Chandra</div>
    <div style="font-size:12px;margin-top:2px;">${SignatureTitles["Haryono Chandra"]}</div>
  </div>

</div>
<!-- SIGNATURES_BLOCK_END -->
    `
        : `
    <p style="margin-top:40px; font-style:italic; color:gray;">
      (Tanda tangan akan muncul setelah seluruh approval disetujui)
    </p>
    `
    }
  </div>`;

  const lampiranHTML = `
  <div style="width:297mm; min-height:210mm; padding:20px 30px; font-size:11.5px;">
    <h3 style="text-align:center; font-weight:bold; margin-bottom:10px;">LAMPIRAN ITEM PROGRAM</h3>
    <table style="width:100%; border-collapse:collapse;">
      <thead>
        <tr style="background-color:#b91c1c; color:white;">
          <th style="border:1px solid #000; padding:5px;">No</th>
          <th style="border:1px solid #000; padding:5px;">Nama Barang / SKU</th>
          <th style="border:1px solid #000; padding:5px;">Harga</th>
          <th style="border:1px solid #000; padding:5px;">QTY</th>
          <th style="border:1px solid #000; padding:5px;">Amount</th>
          <th style="border:1px solid #000; padding:5px;">Syarat / Mekanisme</th>
          <th style="border:1px solid #000; padding:5px;">QTY Bonus</th>
          <th style="border:1px solid #000; padding:5px;">Nilai Bonus</th>
          <th style="border:1px solid #000; padding:5px;">Total Bonus</th>
          <th style="border:1px solid #000; padding:5px;">Budget%</th>
          <th style="border:1px solid #000; padding:5px;">Target Selling Qty</th>
          <th style="border:1px solid #000; padding:5px;">Target Selling (Rp)</th>
          <th style="border:1px solid #000; padding:5px;">Total Budget</th>
          <th style="border:1px solid #000; padding:5px;">% Budget</th>
          <th style="border:1px solid #000; padding:5px;">Periode</th>
          <th style="border:1px solid #000; padding:5px;">Channel</th>
        </tr>
      </thead>

      <tbody>
        ${
          program.items
            ?.map(
              (it, i) => `
          <tr>
            <td style="border:1px solid #000; padding:4px; text-align:center;">${
              i + 1
            }</td>
            <td style="border:1px solid #000; padding:4px;">${
              it.sku_name || "-"
            }</td>
            <td style="border:1px solid #000; padding:4px; text-align:right;">Rp${it.price?.toLocaleString(
              "id-ID",
            )}</td>
            <td style="border:1px solid #000; padding:4px; text-align:center;">${
              it.qty
            }</td>
<td style="border:1px solid #000; padding:4px; text-align:right;">
  Rp${calculateAmount(it).toLocaleString("id-ID")}
</td>
          </td>
            <td style="border:1px solid #000; padding:4px;">${
              it.description || it.bonus || "-"
            }</td>
            <td style="border:1px solid #000; padding:4px; text-align:center;">${
              it.qty_bonus
            }</td>
            <td style="border:1px solid #000; padding:4px; text-align:right;">Rp${it.value_bonus?.toLocaleString(
              "id-ID",
            )}</td>
            <td style="border:1px solid #000; padding:4px; text-align:right;">Rp${it.total_bonus?.toLocaleString(
              "id-ID",
            )}</td>
            <td style="border:1px solid #000; padding:4px; text-align:center;">${it.budget_percent}%</td>
            <td style="border:1px solid #000; padding:4px; text-align:center;"> ${it.target_selling_qty?.toLocaleString(
              "id-ID",
            )}</td>
            <td style="border:1px solid #000; padding:4px; text-align:center;"> Rp${it.target_selling_price?.toLocaleString(
              "id-ID",
            )}</td>
            <td style="border:1px solid #000; padding:4px; text-align:center;"> ${it.total_budget?.toLocaleString(
              "id-ID",
            )}</td>
            <td style="border:1px solid #000; padding:4px; text-align:center;">${it.budget_selling_percent}%</td>
            <td style="border:1px solid #000; padding:4px; text-align:center;">
${new Date(program.period_start).toLocaleDateString("id-ID")}
  -
  ${new Date(program.period_end).toLocaleDateString("id-ID")}</td>
<td style="border:1px solid #000; padding:4px; text-align:center;">${
                validChannels.length === channelsList.length
                  ? "ALL"
                  : validChannels.map((c) => c.name).join(", ")
              }</td>
          </tr>`,
            )
            .join("") || ""
        }
      </tbody>
    </table>
  </div>`;

  // Helper: buang blok tanda tangan HTML ketika dikonversi ke pdfMake,
  // supaya tidak error img & tidak dobel dengan versi pdfMake.
  const stripSignatureBlock = (html) =>
    html.replace(
      /<!-- SIGNATURES_BLOCK_START -->[\s\S]*?<!-- SIGNATURES_BLOCK_END -->/,
      "",
    );

  const deepFindTable = (node) => {
    if (!node) return null;

    if (node.table) return node;

    if (Array.isArray(node)) {
      for (const child of node) {
        const found = deepFindTable(child);
        if (found) return found;
      }
    }

    if (typeof node === "object") {
      for (const key of Object.keys(node)) {
        const found = deepFindTable(node[key]);
        if (found) return found;
      }
    }

    return null;
  };

  // ===============================
  // ===== FINAL PDF GENERATOR =====
  // ===============================
  const handleGeneratePDF = async () => {
    if (!program) return;

    // Load signatures
    const [ricoBase64, airlanggaBase64, wilmanBase64, haryonoBase64] =
      await Promise.all([
        toBase64(RicoSign),
        toBase64(AirlanggaSign),
        toBase64(WilmanSign),
        toBase64(HaryonoSign),
      ]);

    const startDate = new Date(program.period_start).toLocaleDateString(
      "id-ID",
    );
    const endDate = new Date(program.period_end).toLocaleDateString("id-ID");
    const created = new Date(program.created_at).toLocaleDateString("id-ID");

    // Convert Lampiran HTML → pdfmake ops
    const lampiranOps = htmlToPdfmake(lampiranHTML, { window });

    // Cari tabel di dalam lampiran (deep search)
    const lampiranTableNode = deepFindTable(lampiranOps);

    if (!lampiranTableNode) {
      alert("Tabel lampiran tidak ditemukan!");
      return;
    }

    // =============================
    // FIX TABLE WIDTH + HEADER
    // =============================
    lampiranTableNode.table.widths = [
      10, // No
      50, // Nama Barang / SKU
      45, // Harga
      15, // QTY
      45, // Amount
      70, // Syarat / Mekanisme
      25, // QTY Bonus
      40, // Nilai Bonus
      45, // Total Bonus
      25, // Budget%
      30, // Target Selling Qty
      55, // Target Selling Rp
      45, // Total Budget
      30, // % Budget
      40, // Periode
      40, // Channel
    ];

    lampiranTableNode.table.body[0] = lampiranTableNode.table.body[0].map(
      (c) => ({
        text: c.text || c,
        bold: true,
        fontSize: 7,
        color: "white",
        alignment: "center",
      }),
    );

    lampiranTableNode.layout = {
      fillColor: (row) => (row === 0 ? "#b91c1c" : null),
      hLineWidth: () => 1,
      vLineWidth: () => 1,
      hLineColor: () => "#000",
      vLineColor: () => "#000",
      paddingLeft: () => 5,
      paddingRight: () => 5,
      paddingTop: () => 5,
      paddingBottom: () => 5,
    };

    // =============================
    //          DOCUMENT
    // =============================
    const docDefinition = {
      pageSize: "A4",
      pageMargins: [40, 40, 40, 40],

      content: [
        // ===========================
        // PAGE 1 — PROPOSAL (PORTRAIT)
        // ===========================
        {
          text: "PROPOSAL PENGAJUAN PROGRAM MARKETING",
          alignment: "center",
          bold: true,
          fontSize: 16,
          margin: [0, 0, 0, 20],
        },

        {
          text: `Tangerang, ${created}`,
          alignment: "right",
          margin: [0, 0, 0, 20],
        },

        {
          table: {
            widths: [80, "*"],
            body: [
              ["Nomor", `: ${program.program_code}`],
              ["Perihal", `: Pengajuan Program ${program.name}`],
            ],
          },
          layout: "noBorders",
          margin: [0, 0, 0, 20],
        },

        {
          text: "Kepada Yth,\nBapak Haryono Chandra\nSales & Marketing Director\nPT BOLDE Inovasi Global\nDi Tempat\n",
          margin: [0, 0, 0, 10],
        },
        { text: "Dengan hormat,", margin: [0, 0, 0, 0] },

        {
          text: letter.opening_text_html?.replace(/<[^>]+>/g, "") || "",
          margin: [0, 0, 0, 10],
        },

        { text: `Nama Program:` },
        { text: `${program.name}`, bold: true },
        { text: `\nPeriode Program:` },
        { text: `${startDate} - ${endDate}`, bold: true },
        { text: "\nChannel: " },
        {
          text:
            validChannels.length === channelsList.length
              ? "ALL"
              : validChannels.map((c) => c.name).join(", "),
          bold: true,
        },
        { text: "\nArea: " },
        {
          text:
            validAreas.length === areasList.length
              ? "ALL"
              : validAreas.map((a) => a.name).join(", "),
          bold: true,
        },
        {
          text: "\nAnalisa Cost & Benefit:",
          bold: true,
          margin: [0, 0, 0, 10],
        },

        {
          table: {
            widths: ["*", "*"],
            body: [
              ["Komponen", "After Program"],
              [
                "Pertumbuhan Omzet (Sell-In) per Bulan",
                `Rp ${program.monthly_turnover?.toLocaleString("id-ID")}`,
              ],
              [
                `Estimasi Margin Kotor (${program.margin_percentage}%)`,
                `Rp ${program.gross_margin_estimate?.toLocaleString("id-ID")}`,
              ],
              [
                "Budget Program",
                `Rp ${program.budget_program?.toLocaleString("id-ID")}`,
              ],
              [
                "Target Program",
                `Rp ${program.target_program?.toLocaleString("id-ID")}`,
              ],
              [
                "% Budget",
                `Rp ${program.budget_percent?.toLocaleString("id-ID")}`,
              ],
            ],
          },
          layout: { fillColor: (row) => (row === 0 ? "#b91c1c" : null) },
        },

        { text: "Kesimpulan:", bold: true, margin: [0, 10, 0, 0] },
        { text: letter.conclusion_text_html?.replace(/<[^>]+>/g, "") || "" },
        {
          text: letter.closing_text_html?.replace(/<[^>]+>/g, ""),
          margin: [0, 10],
        },

        { text: "\n\n\nHormat Kami,", bold: true, margin: [0, 20, 0, 0] },
        { text: "Menyetujui", bold: true },

        allApproved
          ? {
              columns: [
                {
                  width: "25%",
                  stack: [
                    { image: ricoBase64, width: 70, alignment: "center" },
                    {
                      text: "Rico Tandiwijaya",
                      alignment: "center",
                      bold: true,
                    },
                    {
                      text: SignatureTitles["Rico TandiWijaya"],
                      alignment: "center",
                      fontSize: 10,
                    },
                  ],
                },
                {
                  width: "25%",
                  stack: [
                    { image: airlanggaBase64, width: 70, alignment: "center" },
                    {
                      text: "Airlangga Gusti",
                      alignment: "center",
                      bold: true,
                    },
                    {
                      text: SignatureTitles["Airlangga Gusti"],
                      alignment: "center",
                      fontSize: 10,
                    },
                  ],
                },
                {
                  width: "25%",
                  stack: [
                    { image: wilmanBase64, width: 70, alignment: "center" },
                    { text: "Wilman Hilmani", alignment: "center", bold: true },
                    {
                      text: SignatureTitles["Wilman Hilmani"],
                      alignment: "center",
                      fontSize: 10,
                    },
                  ],
                },
                {
                  width: "25%",
                  stack: [
                    { image: haryonoBase64, width: 70, alignment: "center" },
                    {
                      text: "Haryono Chandra",
                      alignment: "center",
                      bold: true,
                    },
                    {
                      text: SignatureTitles["Haryono Chandra"],
                      alignment: "center",
                      fontSize: 10,
                    },
                  ],
                },
              ],
              margin: [0, 20, 0, 0],
            }
          : {
              text: "(Tanda tangan muncul setelah semua approval)",
              italics: true,
              margin: [0, 20],
            },

        // ============================
        // PAGE 2 — LAMPIRAN (LANDSCAPE)
        // ============================
        { text: "", pageBreak: "before", pageOrientation: "landscape" },

        {
          text: "LAMPIRAN ITEM PROGRAM",
          alignment: "center",
          bold: true,
          fontSize: 14,
          margin: [0, 0, 0, 15],
        },

        {
          stack: [
            {
              table: lampiranTableNode.table,
              layout: lampiranTableNode.layout,
            },
          ],
          alignment: "center",
          margin: [0, 0, 0, 0],
        },
      ],
    };

    pdfMake.createPdf(docDefinition).download(`${program.name}_Proposal.pdf`);
  };

  const originalStart = program.period_start;
  const finalEnd = program.extendHistory?.length
    ? program.extendHistory[program.extendHistory.length - 1].period_end
    : program.period_end;

  const fetchNewProgramDetail = async (programId) => {
    try {
      const res = await ApiRequest({
        url: `/programs/detail/${programId}`, // ✅ FIX
        method: "GET",
      });

      if (res?.status === "success") {
        setNewProgram(res.data.program); // 🔥 ini yg bikin tanggal muncul
      }
    } catch (err) {
      console.warn("Fetch program baru gagal, tapi extend sukses", err);
    }
  };

  const handleExtendSuccess = (newProgramId) => {
    setOpenExtendModal(false); // 1️⃣ tutup modal extend (UNMOUNT)
    setShowExtendSuccess(true); // 2️⃣ tampilkan success
    setNewProgram({ program_id: newProgramId });
    fetchNewProgramDetail(newProgramId);
  };

  // const originalStart = program.extendHistory?.length
  //   ? program.extendHistory[0].period_start
  //   : program.period_start;

  const handleBack = () => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab") || "Active";

    navigate(`/program-center?tab=${encodeURIComponent(tab)}`);
  };

  return (
    <div className="min-h-screen px-5 py-1 sm:px-3 lg:px-3">
      {/* HEADER */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <ArrowLeft
          size={18}
          className="cursor-pointer text-brand-first"
          onClick={handleBack}
        />
        <p className="text-sm text-brand-first">Back to Program Center</p>
      </div>

      <div className="flex items-center gap-2 mb-1">
        <h1 className="mr-3 text-3xl font-bold">{program.name}</h1>

        {program.user_id === userProfile?.user_id && (
          <img
            src={UpdateIcon}
            alt="update"
            className="transition cursor-pointer w-7 h-7 hover:opacity-80"
            onClick={() => setOpenEditModal(true)}
          />
        )}
      </div>

      <p className="mb-6 text-sm break-words text-text-secondary line-clamp-3 sm:line-clamp-none">
        {program.program_code}
      </p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* === LEFT PANEL === */}
        <div className="p-6 bg-white border shadow-sm rounded-3xl border-surface-border">
          {/* EXTENDED INFO — Muncul kalau program pernah extend */}
          {/* {program.extended_count > 0 && (
            <div className="w-full p-3 mb-6 border border-blue-300 rounded-lg shadow-sm bg-blue-50">

              <p className="text-sm font-semibold text-blue-800">
                Program Extend
              </p>

              {program.last_extended_at && (
                <p className="mt-1 text-xs text-blue-700">
                  Extend terakhir:{" "}
                  {new Date(program.last_extended_at).toLocaleDateString("id-ID")}
                </p>
              )}

              {program.extendHistory &&
                program.extendHistory.length > 0 &&
                program.extendHistory[program.extendHistory.length - 1].extend_note && (
                  <p className="mt-1 text-xs italic text-blue-600">
                    Catatan:{" "}
                    {
                      program.extendHistory[
                        program.extendHistory.length - 1
                      ].extend_note
                    }
                  </p>
                )}

            </div>
          )} */}

          {/* EXPIRY WARNING BANNER */}
          {(() => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const endDateOnly = new Date(program.period_end);
            endDateOnly.setHours(0, 0, 0, 0);

            const daysLeft = Math.floor(
              (endDateOnly - today) / (1000 * 60 * 60 * 24),
            );

            const canExtend = (() => {
              if (!program) return false;

              const today = new Date();
              today.setHours(0, 0, 0, 0);

              const end = new Date(program.period_end);
              end.setHours(0, 0, 0, 0);

              const daysLeft = Math.floor((end - today) / 86400000);

              return daysLeft >= 0 && daysLeft <= 7;
            })();

            // Muncul hanya kalau program ada di H-7 sampai H
            if (daysLeft <= 7 && daysLeft >= 0) {
              return (
                <div className="flex items-center justify-between w-full p-3 mb-6 rounded-lg shadow-sm bg-[#E4CD62]">
                  {/* LEFT SIDE */}
                  <div className="flex items-center gap-2">
                    <img
                      src={WarningIcon}
                      alt="warning"
                      className="object-contain w-7 h-7"
                    />

                    <p className="font-semibold text-[#6B5D1F] text-[13px]">
                      Expired in {daysLeft} days
                    </p>
                  </div>

                  {/* RIGHT — EXTEND BUTTON (Only uploader can see this) */}
                  {/* EXTEND ACTION */}
                  <div>
                    {canExtend && (
                      <button
                        onClick={() => setOpenExtendModal(true)}
                        className="px-5 py-2 text-xs font-semibold bg-white border text-[#6B5D1F] rounded-2xl border-[#d1b84f]"
                      >
                        Extend
                      </button>
                    )}
                  </div>
                </div>
              );
            }

            return null;
          })()}

          <h2 className="mb-2 text-sm text-text-secondary">Category Program</h2>
          <p className="mb-6 text-sm">{validCategory?.name || "-"}</p>

          <h2 className="mb-2 text-sm text-text-secondary">Channel</h2>
          <p className="mb-6 text-sm">
            {validChannels.length === channelsList.length
              ? "ALL"
              : validChannels.map((c) => c.name).join(", ")}
          </p>

          {/* UPLOADED BY */}
          {uploader && (
            <div className="pt-4 mt-4 border-t">
              <p className="mb-2 text-sm text-text-secondary">Uploaded by</p>
              <div className="flex items-center gap-2">
                <img
                  src={uploader.image}
                  alt={uploader.name}
                  className="object-cover w-8 h-8 border rounded-full"
                />
                <p className="text-sm font-medium text-text-primary">
                  {uploader.name}
                </p>
              </div>
            </div>
          )}

          {/* APPROVED BY LIST */}
          <div className="pt-4 mt-6 border-t">
            <p className="mb-2 text-sm text-text-secondary">Approved by</p>
            {approvers.length > 0 ? (
              <div className="flex flex-col gap-2">
                {approvers
                  .sort(
                    (a, b) =>
                      APPROVERS_ORDER.indexOf(a.user_id) -
                      APPROVERS_ORDER.indexOf(b.user_id),
                  )
                  .map((p, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <img
                        src={
                          p.image_url && p.image_url.trim() !== ""
                            ? p.image_url
                            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                p.full_name,
                              )}&background=E0E7FF&color=1E3A8A`
                        }
                        alt={p.full_name}
                        className="object-cover border rounded-full w-7 h-7"
                      />
                      <span className="font-medium text-text-primary">
                        {p.full_name}
                      </span>
                      <span
                        className={`text-xs ${
                          p.status === "approved"
                            ? "text-status-success"
                            : p.status === "rejected"
                              ? "text-status-danger"
                              : "text-text-secondary"
                        }`}
                      >
                        {p.status === "pending"
                          ? "Menunggu"
                          : p.status === "approved"
                            ? "Disetujui"
                            : "Ditolak"}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm italic text-text-secondary">
                No approval data
              </p>
            )}
          </div>

          {/* PERIODE TOTAL */}
          <div className="mt-6">
            <p className="mb-1 text-sm text-text-secondary">Periode Total</p>

            <p className="text-sm font-medium text-text-primary">
              {new Date(originalStart).toLocaleDateString("id-ID")} -{" "}
              {new Date(finalEnd).toLocaleDateString("id-ID")}
            </p>
          </div>

          {/* DURASI PROGRAM */}
          {(() => {
            const today = new Date();
            const startDateOnly = new Date(
              start.getFullYear(),
              start.getMonth(),
              start.getDate(),
            );
            const endDateOnly = new Date(
              end.getFullYear(),
              end.getMonth(),
              end.getDate(),
            );
            const todayOnly = new Date(
              today.getFullYear(),
              today.getMonth(),
              today.getDate(),
            );

            // Cap hari terakhir dihitung sampai end date
            const effectiveEnd =
              todayOnly > endDateOnly ? endDateOnly : todayOnly;

            let diffStart =
              Math.floor(
                (effectiveEnd - startDateOnly) / (1000 * 60 * 60 * 24),
              ) + 1;

            // Jika sedang sebelum start date, jangan negatif
            if (diffStart < 0) diffStart = 0;

            return (
              <div className="mt-2">
                {diffStart > 0 && (
                  <p className="mb-2 text-sm italic text-text-secondary">
                    The program has been running for {diffStart} days
                  </p>
                )}
              </div>
            );
          })()}

          {/* EXTEND HISTORY */}
          {/* RIWAYAT PERIODE */}
          {/* <div className="pt-4 mt-6 border-t">
            <p className="mb-2 text-sm text-gray-500">Riwayat Periode</p>

            <div className="p-3 border rounded-lg bg-gray-50">
              <p className="text-xs text-gray-500">Periode #1 (Awal)</p>

              <p className="text-sm font-medium">
                {new Date(program.period_start).toLocaleDateString("id-ID")} -{" "}
                {new Date(
                  program.extendHistory?.[0]?.initial_period_end || program.period_end
                ).toLocaleDateString("id-ID")}
              </p>
            </div>

            {program.extendHistory?.map((ex, idx) => (
              <div
                key={idx}
                className="p-3 mt-2 border border-yellow-300 rounded-lg bg-yellow-50"
              >
                <p className="text-xs font-semibold text-yellow-700">
                  Periode #{idx + 2} (Extend)
                </p>

                <p className="text-sm font-medium">
                  {new Date(
                    program.extendHistory[idx].period_start
                  ).toLocaleDateString("id-ID")}{" "}
                  -{" "}
                  {new Date(ex.period_end).toLocaleDateString("id-ID")}
                </p>

                {ex.extend_note && (
                  <p className="mt-1 text-xs italic text-gray-600">
                    {ex.extend_note}
                  </p>
                )}
              </div>
            ))}
          </div> */}

          <div className="flex items-center gap-2 mt-6 text-sm text-text-secondary">
            <Calendar size={16} />
            <p>Created {created}</p>
          </div>
        </div>

        {/* === RIGHT PANEL === */}
        <div className="flex flex-col p-6 bg-white border shadow-sm rounded-3xl md:col-span-2">
          <div className="flex items-center justify-between pb-4 mb-4 border-b">
            <h2 className="mb-6 text-sm font-semibold break-words text-text-primary line-clamp-3 sm:line-clamp-none ">
              {program.program_code}
            </h2>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                {program.is_extended && program.is_approval_reset && (
                  <span className="px-3 py-1 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
                    Program Extend
                  </span>
                )}
              </div>

              {/* APPROVAL DROPDOWN / BADGE */}
              {canApprove ? (
                <ProgramApproval
                  programId={program.program_id}
                  currentUser={userProfile}
                  onRefresh={fetchProgramDetail}
                />
              ) : (
                <div>
                  <button
                    onClick={() =>
                      navigate(`/summary/regular/${sellingAchieveId}`)
                    }
                    disabled={!sellingAchieveId}
                    className="px-3 py-2 mr-2 text-xs font-semibold bg-black rounded-full text-surface-background"
                  >
                    View Detail
                  </button>

                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full ${
                      displayStatus === "Approved"
                        ? "bg-green-100 text-status-success"
                        : displayStatus === "Rejected"
                          ? "bg-red-100 text-status-danger"
                          : displayStatus === "Active"
                            ? "bg-blue-100 text-brand-first"
                            : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {displayStatus}
                  </span>
                </div>
              )}

              {/* DOWNLOAD */}
              <Download
                size={18}
                className="text-gray-500 cursor-pointer hover:text-text-primary"
                onClick={handleGeneratePDF}
              />
            </div>
          </div>

          {/* PREVIEW: render html apa adanya (bisa scroll kanan-kiri) */}
          <div
            ref={pdfRef}
            className="p-4 space-y-8 overflow-x-auto overflow-y-auto border rounded-lg h-[80vh] border-text-light"
          >
            <div dangerouslySetInnerHTML={{ __html: pdfHTML }} />
            <div dangerouslySetInnerHTML={{ __html: lampiranHTML }} />
          </div>
        </div>
      </div>

      {openEditModal && (
        <EditProgramModal
          program={program}
          onClose={() => setOpenEditModal(false)}
          onSuccess={fetchProgramDetail}
        />
      )}

      {openExtendModal && (
        <ExtendProgramModal
          open={openExtendModal}
          onClose={() => setOpenExtendModal(false)}
          programId={program.program_id}
          program={program}
          onSuccess={handleExtendSuccess}
        />
      )}

      <ExtendSuccessModal
        open={showExtendSuccess}
        onClose={() => setShowExtendSuccess(false)}
        periodStart={newProgram?.period_start}
        periodEnd={newProgram?.period_end}
        onViewProgram={() =>
          navigate(`/program-detail/${newProgram.program_id}`)
        }
      />
    </div>
  );
};

export default ProgramDetail;
