import React, { useState, useEffect } from "react";
import { ArrowLeft, Download, Calendar } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiRequest } from "../../services/apiRequest";

// ===== ASSETS (HEADER, FOOTER, TTD) =====
import HeaderImageUrl from "../../assets/images/kopSurat/Header.png";
// import FooterImageUrl from "../../assets/images/kopSurat/Footer.png";
import RicoSign from "../../assets/images/ttd/rico.png";
import AirlanggaSign from "../../assets/images/ttd/airlangga.png";

// ===== PDFMAKE =====
import pdfMake from "pdfmake/build/pdfmake.js";
import pdfFonts from "pdfmake/build/vfs_fonts.js";

pdfMake.vfs = pdfFonts.vfs;

const LetterDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [program, setProgram] = useState(null);
  const [channelsList, setChannelsList] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [userAreaId, setUserAreaId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState(null);
  const [zoom, setZoom] = useState(1);

  // Convert image → base64
  const toBase64 = (url) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      fetch(url)
        .then((res) => res.blob())
        .then((blob) => reader.readAsDataURL(blob));
      reader.onloadend = () => resolve(reader.result);
    });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const res = await ApiRequest({
          url: "/profile/me",
          method: "GET",
        });

        if (res.status === "success") {
          setUserAreaId(res.data.area_id);
        }
      } catch (e) {
        console.error("Failed fetch user area:", e);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const res = await ApiRequest({
          url: "/areas/all",
          method: "GET",
        });

        if (res.status === "success") setAreaList(res.data);
      } catch (e) {
        console.error("Failed fetch area list", e);
      }
    };

    fetchAreas();
  }, []);

  const getAreaName = (id) =>
    areaList.find((a) => a.area_id === id)?.name || `Area ${id}`;

  // === FETCH DATA ===
  useEffect(() => {
    const fetchProgramDetail = async () => {
      try {
        const token = localStorage.getItem("token");

        const [programRes, channelRes] = await Promise.all([
          ApiRequest({
            url: `/programs/detail/${id}`,
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }),
          ApiRequest({
            url: `/channels/all`,
            method: "GET",
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (programRes.status === "success" && programRes.data) {
          const d = programRes.data;
          setProgram({
            ...d.program,
            items: d.program_items || [],
            channels: d.program_channels || [],
            program_areas: d.program_areas || [],
          });
        }

        if (channelRes.status === "success") setChannelsList(channelRes.data);
      } catch (err) {
        console.error("Gagal ambil detail surat:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgramDetail();
  }, [id]);

  useEffect(() => {
    if (program) {
      generatePreviewPDF();
    }
  }, [program]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );

  if (!program)
    return (
      <div className="flex items-center justify-center h-screen">
        Data program tidak ditemukan.
      </div>
    );

  const getChannelName = (id) =>
    channelsList.find((c) => c.channel_id === id)?.name || `Channel ${id}`;

  const validChannels = program.channels
    .map((c) => getChannelName(c.channel_id))
    .filter(Boolean);

  // Dates
  const created = new Date(program.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const startDate = new Date(program.period_start).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const endDate = new Date(program.period_end).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // =============================================================
  //  🔥 GENERATE PDF PREVIEW (iframe)
  // =============================================================
  const generatePreviewPDF = async () => {
    const headerBase64 = await toBase64(HeaderImageUrl);
    // const footerBase64 = await toBase64(FooterImageUrl);
    const ricoBase64 = await toBase64(RicoSign);
    const airlanggaBase64 = await toBase64(AirlanggaSign);

    const docDefinition = {
      pageSize: "A4",
      pageMargins: [40, 130, 40, 100],
      defaultStyle: {
        fontSize: 10, // 🔥 kecilkan semua teks
      },
      header: {
        image: headerBase64,
        width: 595,
        height: 120,
      },

      // footer: {
      //   image: footerBase64,
      //   width: 520,
      //   alignment: "center",
      //   margin: [0, 20, 0, 10],
      // },

      footer: function (currentPage, pageCount) {
        return {
          columns: [
            {
              text: `${pageCount}`,
              // text: `Halaman ${currentPage} dari ${pageCount}`,
              alignment: "right",
              margin: [0, 0, 40, 20],
              fontSize: 9,
            },
          ],
        };
      },

      content: [
        {
          text: "SURAT EDARAN",
          alignment: "center",
          fontSize: 14,
          bold: true,
          // decoration: "underline",
          margin: [0, 0, 0, 20],
        },

        {
          text: `Tangerang, ${created}`,
          alignment: "right",
          margin: [0, 0, 0, 20],
          fontSize: 10,
        },

        {
          columns: [
            { width: 80, text: "Nomor", bold: true },
            { text: `: ${program.program_code}` },
          ],
        },
        {
          columns: [
            { width: 80, text: "Perihal", bold: true },
            { text: `: Program ${program.name}` },
          ],
        },
        {
          columns: [
            { width: 80, text: "Sifat", bold: true },
            { text: ": Diedarkan Umum" },
          ],
          margin: [0, 0, 0, 10],
        },

        {
          text: [
            "Kepada Yth,\n",
            { text: "Bapak / Ibu Mitra Usaha BOLDe", bold: true },
          ],
          margin: [0, 0, 0, 15],
        },

        { text: "Salam Cuan!", margin: [0, 0, 0, 0] },

        { text: "Berikut ini kami sampaikan program bulan sebagai berikut:\n" },

        // TABEL PROGRAM
        {
          table: {
            headerRows: 1,
            widths: ["*", 60, "*"],
            body: [
              [
                { text: "Nama Barang", bold: true },
                { text: "QTY", alignment: "center", bold: true },
                { text: "Terms & Conditions", bold: true },
                // { text: "QTY Bonus", alignment: "center", bold: true },
              ],
              ...program.items.map((it) => [
                it.sku_name,
                { text: it.qty, alignment: "center" },
                it.description || it.bonus,
                // { text: it.qty_bonus, alignment: "center" },
              ]),
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => "#000",
            vLineColor: () => "#000",
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 6,
            paddingBottom: () => 6,
          },
          margin: [0, 10, 0, 20],
        },

        {
          text: "Syarat & Ketentuan Program:",
          bold: true,
          margin: [0, 0, 0, 10],
        },

        {
          ol: [
            `Program berlaku ${startDate} hingga ${endDate}`,
            `Program berlaku khusus ${
              validChannels.length === channelsList.length
                ? "ALL CHANNEL"
                : validChannels.join(", ")
            }`,
            `Return membatalkan semua program`,
            `Berlaku dalam 1 invoice yang sama`,
          ],
        },
        {
          text: "\nDemikian pemberitahuan kami, atas kerjasamanya selama ini kami ucapkan terima kasih, dan kami berharap kerja sama ini dapat terus berlanjut di masa mendatang.\n\n",
        },

        { text: "Hormat Kami,", margin: [0, 0, 0, 0] },

        {
          columns: [
            {
              width: "50%",
              stack: [
                { image: ricoBase64, width: 80, alignment: "center" },
                { text: "Rico Tandiwijaya", alignment: "center", bold: true },
              ],
            },
            {
              width: "50%",
              stack: [
                { image: airlanggaBase64, width: 80, alignment: "center" },
                { text: "Airlangga Gusti", alignment: "center", bold: true },
              ],
            },
          ],
        },
      ],
    };

    const pdfDocGenerator = pdfMake.createPdf(docDefinition);

    pdfDocGenerator.getDataUrl((dataUrl) => {
      setPdfPreviewUrl(dataUrl);
    });
  };

  // =============================================================
  //  🔥 DOWNLOAD PDF NORMAL
  // =============================================================
  const handleDownloadPDF = async () => {
    const headerBase64 = await toBase64(HeaderImageUrl);
    // const footerBase64 = await toBase64(FooterImageUrl);
    const ricoBase64 = await toBase64(RicoSign);
    const airlanggaBase64 = await toBase64(AirlanggaSign);

    const docDefinition = {
      pageSize: "A4",
      pageMargins: [40, 130, 40, 100],
      defaultStyle: {
        fontSize: 10, // 🔥 kecilkan semua teks
      },
      header: {
        image: headerBase64,
        width: 595,
        height: 120,
      },

      // footer: {
      //   image: footerBase64,
      //   width: 520,
      //   alignment: "center",
      //   margin: [0, 20, 0, 10],
      // },

      footer: function (currentPage, pageCount) {
        return {
          columns: [
            {
              text: `${pageCount}`,
              // text: `Halaman ${currentPage} dari ${pageCount}`,
              alignment: "right",
              margin: [0, 0, 40, 20],
              fontSize: 9,
            },
          ],
        };
      },

      content: [
        {
          text: "SURAT EDARAN",
          alignment: "center",
          fontSize: 14,
          bold: true,
          // decoration: "underline",
          margin: [0, 0, 0, 20],
        },

        {
          text: `Tangerang, ${created}`,
          alignment: "right",
          margin: [0, 0, 0, 20],
        },

        {
          columns: [
            { width: 80, text: "Nomor", bold: true },
            { text: `: ${program.program_code}` },
          ],
        },
        {
          columns: [
            { width: 80, text: "Perihal", bold: true },
            { text: `: Program ${program.name}` },
          ],
        },
        {
          columns: [
            { width: 80, text: "Sifat", bold: true },
            { text: ": Diedarkan Umum" },
          ],
          margin: [0, 0, 0, 10],
        },

        {
          text: [
            "Kepada Yth,\n",
            { text: "Bapak / Ibu Mitra Usaha BOLDe", bold: true },
          ],
          margin: [0, 0, 0, 15],
        },

        { text: "Salam Cuan!", margin: [0, 0, 0, 0] },

        { text: "Berikut ini kami sampaikan program bulan sebagai berikut:\n" },

        // TABEL PROGRAM
        {
          table: {
            headerRows: 1,
            widths: ["*", 60, "*"],
            body: [
              [
                { text: "Nama Barang / SKU", bold: true },
                { text: "QTY", alignment: "center", bold: true },
                { text: "Bonus", bold: true },
                // { text: "QTY Bonus", alignment: "center", bold: true },
              ],
              ...program.items.map((it) => [
                it.sku_name,
                { text: it.qty, alignment: "center" },
                it.description || it.bonus,
                // { text: it.qty_bonus, alignment: "center" },
              ]),
            ],
          },
          layout: {
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => "#000",
            vLineColor: () => "#000",
            paddingLeft: () => 6,
            paddingRight: () => 6,
            paddingTop: () => 6,
            paddingBottom: () => 6,
          },
          margin: [0, 10, 0, 20],
        },

        {
          text: "Syarat & Ketentuan Program:",
          bold: true,
          margin: [0, 0, 0, 10],
        },

        {
          ol: [
            `Program berlaku ${startDate} hingga ${endDate}`,
            `Program berlaku khusus ${
              validChannels.length === channelsList.length
                ? "ALL CHANNEL"
                : validChannels.join(", ")
            }`,
            `Return membatalkan semua program`,
            `Berlaku dalam 1 invoice yang sama`,
          ],
        },

        {
          text: "\nDemikian pemberitahuan kami, atas kerjasamanya selama ini kami ucapkan terima kasih, dan kami berharap kerja sama ini dapat terus berlanjut di masa mendatang.\n\n",
        },

        { text: "Hormat Kami,", margin: [0, 0, 0, 0] },

        {
          columns: [
            {
              width: "50%",
              stack: [
                { image: ricoBase64, width: 80, alignment: "center" },
                { text: "Rico Tandiwijaya", alignment: "center", bold: true },
              ],
            },
            {
              width: "50%",
              stack: [
                { image: airlanggaBase64, width: 80, alignment: "center" },
                { text: "Airlangga Gusti", alignment: "center", bold: true },
              ],
            },
          ],
        },
      ],
    };

    pdfMake.createPdf(docDefinition).download(`${program.name}.pdf`);
  };

  // =============================================================

  return (
    <div className="min-h-screen px-5 py-1 sm:px-3 lg:px-3">
      {/* BACK */}
      <div
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-4 text-text-secondary"
      >
        <ArrowLeft
          size={18}
          className="transition cursor-pointer hover:text-brand-first"
        />

        <p className="text-xs font-medium transition cursor-pointer sm:text-sm lg:text-sm md:text-sm hover:text-brand-first">
          Back to Circular Letter
        </p>
      </div>

      {/* TITLE */}
      <h1 className="mb-6 text-xl font-semibold sm:text-2xl lg:text-3xl text-brand-first">
        {program.name}
      </h1>

      <div
        className={`
        grid
        grid-cols-1
        gap-6
        ${program.image_url ? "lg:grid-cols-3" : "lg:grid-cols-1"}
      `}
      >
        {/* =====================================================
          IMAGE PANEL
          HANYA MUNCUL JIKA ADA IMAGE
      ====================================================== */}
        {program.image_url && (
          <div className="p-4 border shadow-sm bg-surface-card rounded-3xl sm:p-6 border-surface-border">
            {/* ACTION */}
            <div className="flex items-center justify-end pb-4 mb-4 border-b border-surface-border">
              <button
                onClick={() => {
                  const downloadUrl =
                    `${process.env.REACT_APP_API_BASE_URL}/download?url=` +
                    encodeURIComponent(program.image_url);

                  window.location.href = downloadUrl;
                }}
                className="flex items-center gap-2 text-sm font-medium transition text-text-secondary hover:text-brand-first"
              >
                <span>Download</span>
                <Download size={18} />
              </button>
            </div>

            {/* IMAGE */}
            <div className="flex items-center justify-center p-3 rounded-2xl">
              <img
                src={program.image_url}
                alt={program.name}
                className="object-contain w-full h-[400px] sm:h-[500px] lg:h-[600px]"
              />
            </div>
          </div>
        )}

        {/* =====================================================
          PDF PANEL
      ====================================================== */}
        <div
          className={`
          p-4
          border
          shadow-sm
          bg-surface-card
          rounded-3xl
          border-surface-border
          sm:p-6

          ${program.image_url ? "lg:col-span-2" : "lg:col-span-1"}
        `}
        >
          {/* ACTION */}
          <div className="flex items-center justify-end pb-4 mb-4 border-b border-surface-border">
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 text-sm font-medium transition text-text-secondary hover:text-brand-first"
            >
              <span>Download PDF</span>
              <Download size={18} />
            </button>
          </div>

          {/* PDF PREVIEW */}
          {pdfPreviewUrl ? (
            <iframe
              src={`${pdfPreviewUrl}#toolbar=0&navpanes=0&scrollbar=0`}
              title={`PDF ${program.name}`}
              className="w-full border h-[60vh] sm:h-[70vh] lg:h-[80vh] rounded-xl border-surface-border"
            />
          ) : (
            <p className="text-sm text-text-light">Loading preview PDF...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LetterDetail;
