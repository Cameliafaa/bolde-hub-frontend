// src/utils/excelViewer/excelViewer.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";

import { Download, Minus, Plus, RotateCcw, Maximize2, Eye } from "lucide-react";

import { useSearchParams } from "react-router-dom";

const DEFAULT_COL_WIDTH = 64;
const DEFAULT_ROW_HEIGHT = 24;

const TABLE_HEADER_BLUE = "#0B78C8";
const TABLE_HEADER_BORDER = "#075A96";

const ExcelViewer = () => {
  const [params] = useSearchParams();
  const fileUrl = params.get("file");

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [workbook, setWorkbook] = useState(null);
  const [activeSheet, setActiveSheet] = useState("");

  const [zoom, setZoom] = useState(0.7);
  const [selectedCell, setSelectedCell] = useState(null);

  const containerRef = useRef(null);

  // =========================================================
  // LOAD WORKBOOK
  // =========================================================
  useEffect(() => {
    let aborted = false;

    if (!fileUrl) {
      setErr("File URL tidak ditemukan.");
      setLoading(false);
      return;
    }

    const loadExcel = async () => {
      try {
        setLoading(true);
        setErr("");

        const response = await fetch(fileUrl);

        if (!response.ok) {
          throw new Error(`Fetch failed: ${response.status}`);
        }

        const buffer = await response.arrayBuffer();

        const wb = XLSX.read(buffer, {
          type: "array",
          cellStyles: true,
          cellDates: true,
          cellNF: true,
          cellText: true,
          sheetStubs: true,
        });

        if (aborted) return;

        setWorkbook(wb);
        setActiveSheet(wb.SheetNames?.[0] || "");
        setSelectedCell(null);
      } catch (error) {
        console.error("Excel load error:", error);

        if (!aborted) {
          setErr(error?.message || "Gagal membuka file Excel");
        }
      } finally {
        if (!aborted) {
          setLoading(false);
        }
      }
    };

    loadExcel();

    return () => {
      aborted = true;
    };
  }, [fileUrl]);

  // =========================================================
  // ACTIVE SHEET
  // =========================================================
  const sheet = workbook?.Sheets?.[activeSheet] || null;

  // =========================================================
  // SHEET RANGE
  // =========================================================
  const sheetRange = useMemo(() => {
    if (!sheet) {
      return {
        s: { r: 0, c: 0 },
        e: { r: 0, c: 0 },
      };
    }

    let range;

    try {
      range = XLSX.utils.decode_range(sheet["!ref"] || "A1:A1");
    } catch {
      range = {
        s: { r: 0, c: 0 },
        e: { r: 0, c: 0 },
      };
    }

    // Paksa mulai dari A1 supaya posisi workbook asli tidak bergeser.
    range.s.r = 0;
    range.s.c = 0;

    const merges = sheet["!merges"] || [];

    merges.forEach((merge) => {
      range.e.r = Math.max(range.e.r, merge.e.r);
      range.e.c = Math.max(range.e.c, merge.e.c);
    });

    return range;
  }, [sheet]);

  const rowCount = sheetRange.e.r + 1;
  const colCount = sheetRange.e.c + 1;

  // =========================================================
  // MERGE MAP
  // =========================================================
  const { mergeStartMap, mergeCoveredSet } = useMemo(() => {
    const startMap = new Map();
    const covered = new Set();

    const merges = sheet?.["!merges"] || [];

    merges.forEach((merge) => {
      const startKey = `${merge.s.r},${merge.s.c}`;

      startMap.set(startKey, merge);

      for (let r = merge.s.r; r <= merge.e.r; r++) {
        for (let c = merge.s.c; c <= merge.e.c; c++) {
          if (r === merge.s.r && c === merge.s.c) continue;

          covered.add(`${r},${c}`);
        }
      }
    });

    return {
      mergeStartMap: startMap,
      mergeCoveredSet: covered,
    };
  }, [sheet]);

  // =========================================================
  // COLUMN WIDTH
  // =========================================================
  const getColumnWidth = (columnIndex) => {
    const info = sheet?.["!cols"]?.[columnIndex];

    if (!info) return DEFAULT_COL_WIDTH;

    if (info.hidden) return 0;

    if (typeof info.wpx === "number") {
      return Math.max(info.wpx, 1);
    }

    if (typeof info.width === "number") {
      return Math.max(info.width * 7 + 5, 1);
    }

    if (typeof info.wch === "number") {
      return Math.max(info.wch * 7 + 5, 1);
    }

    return DEFAULT_COL_WIDTH;
  };

  // =========================================================
  // ROW HEIGHT
  // =========================================================
  const getRowHeight = (rowIndex) => {
    const info = sheet?.["!rows"]?.[rowIndex];

    if (!info) return DEFAULT_ROW_HEIGHT;

    if (info.hidden) return 0;

    if (typeof info.hpx === "number") {
      return Math.max(info.hpx, 1);
    }

    if (typeof info.hpt === "number") {
      return Math.max(info.hpt * 1.333333, 1);
    }

    return DEFAULT_ROW_HEIGHT;
  };

  // =========================================================
  // CELL
  // =========================================================
  const getCell = (rowIndex, columnIndex) => {
    if (!sheet) return undefined;

    const address = XLSX.utils.encode_cell({
      r: rowIndex,
      c: columnIndex,
    });

    return sheet[address];
  };

  const getCellText = (cell) => {
    if (!cell) return "";

    if (cell.w !== undefined && cell.w !== null) {
      return String(cell.w);
    }

    if (cell.v === undefined || cell.v === null) {
      return "";
    }

    if (cell.v instanceof Date) {
      return cell.v.toLocaleDateString("id-ID");
    }

    if (cell.t === "b") {
      return cell.v ? "TRUE" : "FALSE";
    }

    try {
      if (cell.z) {
        return XLSX.SSF.format(cell.z, cell.v);
      }
    } catch {
      // fallback
    }

    return String(cell.v);
  };

  // =========================================================
  // NORMALIZE
  // =========================================================
  const normalize = (value) =>
    String(value ?? "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

  // =========================================================
  // GET ROW VALUES
  // =========================================================
  const getRowValues = (rowIndex) => {
    return Array.from({ length: colCount }).map((_, columnIndex) =>
      getCellText(getCell(rowIndex, columnIndex)),
    );
  };

  // =========================================================
  // TABLE HEADER DETECTION
  // =========================================================
  const isTableHeaderRow = (rowIndex) => {
    const values = getRowValues(rowIndex).map(normalize).filter(Boolean);

    if (values.length < 2) return false;

    const headerKeywords = [
      "kode",
      "kode produk",

      "nama barang",
      "nama barang / sku",
      "nama barang/sku",
      "nama barang /sku",
      "nama barang/ sku",

      "kategori",
      "tipe",

      "qty",

      "isi",
      "isi / dus",
      "isi/dus",
      "isi per dus",

      "harga list",
      "harga",

      "srp",

      "nett grosir",
      "net grosir",

      "nett retail",
      "net retail",

      "nett price",
      "net price",

      "diskon",
      "discount",

      "keterangan",
      "description",
    ];

    let matches = 0;

    values.forEach((cell) => {
      const matched = headerKeywords.some(
        (keyword) => cell === keyword || cell.includes(keyword),
      );

      if (matched) matches++;
    });

    return matches >= 2;
  };

  // =========================================================
  // FIRST TABLE HEADER ROW
  // =========================================================
  const firstHeaderRowIndex = useMemo(() => {
    if (!sheet) return -1;

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const values = Array.from({ length: colCount }).map((_, columnIndex) =>
        getCellText(getCell(rowIndex, columnIndex)),
      );

      const normalizedValues = values.map(normalize).filter(Boolean);

      if (normalizedValues.length < 2) continue;

      const headerKeywords = [
        "kode",
        "kode produk",
        "nama barang",
        "nama barang / sku",
        "nama barang/sku",
        "kategori",
        "tipe",
        "qty",
        "isi / dus",
        "isi/dus",
        "isi per dus",
        "srp",
        "nett grosir",
        "nett retail",
        "nett price",
        "keterangan",
        "diskon",
      ];

      const matches = normalizedValues.filter((cell) =>
        headerKeywords.some(
          (keyword) => cell === keyword || cell.includes(keyword),
        ),
      ).length;

      if (matches >= 2) {
        return rowIndex;
      }
    }

    return -1;
  }, [sheet, rowCount, colCount]);

  // =========================================================
  // TITLE DETECTION
  // =========================================================
  const isTitleRow = (rowIndex) => {
    if (isTableHeaderRow(rowIndex)) return false;

    const values = getRowValues(rowIndex);

    const filledValues = values.filter((value) => normalize(value) !== "");

    if (filledValues.length === 0) return false;

    const fullText = normalize(filledValues.join(" "));

    const titleKeywords = [
      "price list",
      "pricelist",
      "price list cookware",
      "tabel pricelist",
      "tabel price list",
    ];

    return titleKeywords.some((keyword) => fullText.includes(keyword));
  };

  // =========================================================
  // FIRST NON EMPTY COLUMN IN ROW
  // =========================================================
  const getFirstFilledColumn = (rowIndex) => {
    for (let columnIndex = 0; columnIndex < colCount; columnIndex++) {
      if (getColumnWidth(columnIndex) <= 0) continue;

      const text = getCellText(getCell(rowIndex, columnIndex));

      if (normalize(text) !== "") {
        return columnIndex;
      }
    }

    return 0;
  };

  // =========================================================
  // TABLE BOUNDS
  // =========================================================
  const tableBounds = useMemo(() => {
    if (!sheet) {
      return {
        startCol: 0,
        endCol: Math.max(colCount - 1, 0),
      };
    }

    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      const values = Array.from({ length: colCount }).map((_, columnIndex) =>
        getCellText(getCell(rowIndex, columnIndex)),
      );

      const normalizedValues = values.map(normalize);

      const keywords = [
        "kode",
        "kode produk",
        "nama barang",
        "nama barang / sku",
        "kategori",
        "tipe",
        "srp",
        "qty",
        "keterangan",
        "nett grosir",
        "nett retail",
        "nett price",
        "isi / dus",
      ];

      const matches = normalizedValues.filter((value) =>
        keywords.some(
          (keyword) => value === keyword || value.includes(keyword),
        ),
      ).length;

      if (matches >= 2) {
        let startCol = 0;
        let endCol = colCount - 1;

        for (let c = 0; c < colCount; c++) {
          if (normalize(values[c]) !== "") {
            startCol = c;
            break;
          }
        }

        for (let c = colCount - 1; c >= 0; c--) {
          if (normalize(values[c]) !== "") {
            endCol = c;
            break;
          }
        }

        return {
          startCol,
          endCol,
        };
      }
    }

    return {
      startCol: 0,
      endCol: Math.max(colCount - 1, 0),
    };
  }, [sheet, rowCount, colCount]);

  // =========================================================
  // ZOOM
  // =========================================================
  const zoomIn = () => {
    setZoom((current) => Math.min(2, Math.round((current + 0.1) * 10) / 10));
  };

  const zoomOut = () => {
    setZoom((current) => Math.max(0.4, Math.round((current - 0.1) * 10) / 10));
  };

  const resetZoom = () => {
    setZoom(0.7);
  };

  // =========================================================
  // FULLSCREEN
  // =========================================================
  const openFullscreen = async () => {
    const element = containerRef.current;

    if (!element) return;

    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen?.();
      } else {
        await element.requestFullscreen?.();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  // =========================================================
  // LOADING
  // =========================================================
  if (loading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen bg-[#f8f9fa]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-gray-200 rounded-full border-[3px] border-t-[#1a73e8] animate-spin" />

          <div className="text-sm text-[#5f6368]">Loading spreadsheet...</div>
        </div>
      </div>
    );
  }

  // =========================================================
  // ERROR
  // =========================================================
  if (err) {
    return (
      <div className="flex items-center justify-center w-screen h-screen p-5 bg-[#f8f9fa]">
        <div className="w-full max-w-lg p-6 bg-white border border-gray-200 shadow-sm rounded-xl">
          <div className="mb-2 text-base font-semibold text-gray-800">
            Gagal membuka file
          </div>

          <div className="mb-4 text-sm text-gray-600">{err}</div>

          <div className="text-xs leading-5 text-gray-500">
            Pastikan URL file bisa diakses browser dan file Excel valid.
          </div>
        </div>
      </div>
    );
  }

  const fileName = getFileName(fileUrl);

  return (
    <div
      ref={containerRef}
      className="flex flex-col w-screen h-screen overflow-hidden bg-white"
    >
      {/* =====================================================
          TOP TOOLBAR
      ===================================================== */}
      <div className="flex items-center flex-shrink-0 gap-3 px-4 bg-white border-b h-14 border-[#dadce0]">
        <div className="flex items-center min-w-0 gap-3">
          <div className="flex items-center justify-center flex-shrink-0 w-8 h-8 rounded bg-[#e6f4ea]">
            <span className="text-sm font-bold text-[#188038]">X</span>
          </div>

          <div className="min-w-0">
            <div className="overflow-hidden text-sm font-medium max-w-[320px] text-[#202124] text-ellipsis whitespace-nowrap">
              {fileName}
            </div>

            <div className="flex items-center gap-1 mt-[1px] text-[11px] text-[#5f6368]">
              <Eye size={12} />
              <span>View only</span>
            </div>
          </div>
        </div>

        <div className="w-px ml-2 h-7 bg-[#dadce0]" />

        {/* ZOOM */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={zoomOut}
            className="flex items-center justify-center w-8 h-8 rounded hover:bg-[#f1f3f4]"
          >
            <Minus size={16} />
          </button>

          <div className="text-xs text-center w-14 text-[#3c4043]">
            {Math.round(zoom * 100)}%
          </div>

          <button
            type="button"
            onClick={zoomIn}
            className="flex items-center justify-center w-8 h-8 rounded hover:bg-[#f1f3f4]"
          >
            <Plus size={16} />
          </button>

          <button
            type="button"
            onClick={resetZoom}
            className="flex items-center justify-center w-8 h-8 rounded hover:bg-[#f1f3f4]"
          >
            <RotateCcw size={15} />
          </button>
        </div>

        <div className="flex-1" />

        {/* FULLSCREEN */}
        <button
          type="button"
          onClick={openFullscreen}
          className="flex items-center justify-center rounded-full w-9 h-9 hover:bg-[#f1f3f4]"
          title="Fullscreen"
        >
          <Maximize2 size={18} />
        </button>

        {/* DOWNLOAD */}
        <a
          href={fileUrl}
          download
          className="flex items-center justify-center rounded-full w-9 h-9 hover:bg-[#f1f3f4]"
          title="Download"
        >
          <Download size={19} />
        </a>
      </div>

      {/* =====================================================
          FORMULA BAR
      ===================================================== */}
      <div className="flex items-center flex-shrink-0 h-8 bg-white border-b border-[#dadce0]">
        <div className="flex items-center justify-center h-full text-xs font-medium border-r w-[70px] text-[#5f6368] border-[#dadce0]">
          {selectedCell
            ? `${toExcelCol(selectedCell.col)}${selectedCell.row + 1}`
            : ""}
        </div>

        <div className="px-3 text-xs font-semibold text-[#5f6368]">fx</div>

        <div className="flex-1 px-2 overflow-hidden text-xs text-[#3c4043] text-ellipsis whitespace-nowrap">
          {selectedCell
            ? getCellText(getCell(selectedCell.row, selectedCell.col))
            : ""}
        </div>
      </div>

      {/* =====================================================
          SHEET VIEW
      ===================================================== */}
      <div className="relative flex-1 overflow-auto bg-white">
        <div
          className="inline-block"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: "top left",
          }}
        >
          <table
            className="border-separate border-spacing-0"
            style={{
              tableLayout: "fixed",
              borderCollapse: "separate",
            }}
          >
            {/* =================================================
                COLUMN LETTERS
            ================================================= */}
            <thead>
              <tr>
                <th
                  className="sticky top-0 left-0 z-50"
                  style={{
                    width: 48,
                    minWidth: 48,
                    height: 24,
                    background: "#f8f9fa",
                    borderRight: "1px solid #dadce0",
                    borderBottom: "1px solid #dadce0",
                  }}
                />

                {Array.from({ length: colCount }).map((_, columnIndex) => {
                  const width = getColumnWidth(columnIndex);
                  const hidden = width <= 0;
                  const selected = selectedCell?.col === columnIndex;

                  if (hidden) {
                    return (
                      <th
                        key={columnIndex}
                        style={{
                          width: 0,
                          minWidth: 0,
                          maxWidth: 0,
                          padding: 0,
                          border: 0,
                        }}
                      />
                    );
                  }

                  return (
                    <th
                      key={columnIndex}
                      className="sticky top-0 z-40 text-xs font-normal text-center select-none"
                      style={{
                        width,
                        minWidth: width,
                        maxWidth: width,
                        height: 24,

                        background: selected ? "#d3e3fd" : "#f8f9fa",

                        color: selected ? "#174ea6" : "#5f6368",

                        borderRight: "1px solid #dadce0",

                        borderBottom: selected
                          ? "2px solid #1a73e8"
                          : "1px solid #dadce0",

                        padding: 0,
                      }}
                    >
                      {toExcelCol(columnIndex)}
                    </th>
                  );
                })}
              </tr>
            </thead>

            {/* =================================================
                CELLS
            ================================================= */}
            <tbody>
              {Array.from({ length: rowCount }).map((_, rowIndex) => {
                const rowHeight = getRowHeight(rowIndex);

                if (rowHeight <= 0) return null;

                const rowSelected = selectedCell?.row === rowIndex;

                const headerRow = isTableHeaderRow(rowIndex);

                const titleRow = isTitleRow(rowIndex);

                const beforeHeaderRow =
                  firstHeaderRowIndex !== -1 && rowIndex < firstHeaderRowIndex;

                // Semua row sebelum header jadi center satu blok
                const infoRow = beforeHeaderRow;

                const infoStartCol = infoRow
                  ? getFirstFilledColumn(rowIndex)
                  : -1;

                const infoEndCol = infoRow
                  ? Math.max(tableBounds.endCol, infoStartCol)
                  : -1;

                return (
                  <tr
                    key={rowIndex}
                    style={{
                      height: titleRow
                        ? Math.max(rowHeight, 38)
                        : headerRow
                          ? Math.max(rowHeight, 34)
                          : beforeHeaderRow
                            ? Math.max(rowHeight, 28)
                            : rowHeight,
                    }}
                  >
                    {/* ROW NUMBER */}
                    <td
                      className="sticky left-0 z-30 text-xs text-center select-none"
                      style={{
                        width: 48,
                        minWidth: 48,
                        height: rowHeight,

                        background: rowSelected ? "#d3e3fd" : "#f8f9fa",

                        color: rowSelected ? "#174ea6" : "#5f6368",

                        borderRight: rowSelected
                          ? "2px solid #1a73e8"
                          : "1px solid #dadce0",

                        borderBottom: "1px solid #dadce0",

                        padding: 0,
                      }}
                    >
                      {rowIndex + 1}
                    </td>

                    {Array.from({ length: colCount }).map((_, columnIndex) => {
                      const colWidth = getColumnWidth(columnIndex);

                      if (colWidth <= 0) return null;

                      // =================================================
                      // VISUAL MERGE UNTUK SEMUA ROW SEBELUM HEADER
                      // =================================================
                      if (
                        infoRow &&
                        columnIndex > infoStartCol &&
                        columnIndex <= infoEndCol
                      ) {
                        return null;
                      }

                      const key = `${rowIndex},${columnIndex}`;

                      if (mergeCoveredSet.has(key)) {
                        return null;
                      }

                      const merge = mergeStartMap.get(key);

                      let rowSpan = merge ? merge.e.r - merge.s.r + 1 : 1;

                      let colSpan = merge ? merge.e.c - merge.s.c + 1 : 1;

                      // Kalau row sebelum header:
                      // buat melebar sampai akhir tabel.
                      if (infoRow && columnIndex === infoStartCol) {
                        colSpan = infoEndCol - infoStartCol + 1;

                        rowSpan = 1;
                      }

                      const cell = getCell(rowIndex, columnIndex);

                      const text = getCellText(cell);

                      const cellStyle = convertExcelStyleToCss(cell?.s);

                      const selected =
                        selectedCell?.row === rowIndex &&
                        selectedCell?.col === columnIndex;

                      // =================================================
                      // BEFORE HEADER STYLE
                      // =================================================
                      const beforeHeaderStyle = beforeHeaderRow
                        ? {
                            backgroundColor: "#ffffff",

                            color: "#111827",

                            fontWeight: 700,

                            fontSize: "17px",

                            textAlign: "center",

                            verticalAlign: "middle",

                            whiteSpace: "nowrap",

                            padding: titleRow ? "7px 12px" : "4px 10px",
                          }
                        : {};

                      // =================================================
                      // HEADER STYLE
                      // =================================================
                      const isInsideTableHeader =
                        headerRow &&
                        columnIndex >= tableBounds.startCol &&
                        columnIndex <= tableBounds.endCol;

                      const headerStyle = isInsideTableHeader
                        ? {
                            backgroundColor: TABLE_HEADER_BLUE,

                            color: "#ffffff",

                            fontWeight: 700,

                            fontSize: "12px",

                            textAlign: "center",

                            verticalAlign: "middle",

                            whiteSpace: "pre-wrap",

                            borderTop: `1px solid ${TABLE_HEADER_BORDER}`,

                            borderBottom: `1px solid ${TABLE_HEADER_BORDER}`,

                            borderLeft: `1px solid ${TABLE_HEADER_BORDER}`,

                            borderRight: `1px solid ${TABLE_HEADER_BORDER}`,

                            padding: "6px 7px",
                          }
                        : {};

                      const finalStyle = {
                        position: "relative",

                        width: colWidth,
                        minWidth: colWidth,

                        height: titleRow
                          ? Math.max(rowHeight, 38)
                          : headerRow
                            ? Math.max(rowHeight, 34)
                            : beforeHeaderRow
                              ? Math.max(rowHeight, 28)
                              : rowHeight,

                        boxSizing: "border-box",

                        borderRight: "1px solid #e0e0e0",

                        borderBottom: "1px solid #e0e0e0",

                        padding: "2px 5px",

                        overflow: "hidden",

                        background: "#ffffff",

                        color: "#000000",

                        fontFamily: "Arial, sans-serif",

                        fontSize: "11pt",

                        verticalAlign: "middle",

                        cursor: "default",

                        // style dari file Excel
                        ...cellStyle,

                        // custom viewer style
                        ...beforeHeaderStyle,
                        ...headerStyle,
                      };

                      return (
                        <td
                          key={key}
                          rowSpan={rowSpan}
                          colSpan={colSpan}
                          onClick={() =>
                            setSelectedCell({
                              row: rowIndex,
                              col: columnIndex,
                            })
                          }
                          title={text}
                          style={finalStyle}
                        >
                          <div
                            style={{
                              width: "100%",
                              height: "100%",

                              display: "flex",

                              alignItems: verticalToFlex(
                                finalStyle.verticalAlign,
                              ),

                              justifyContent: horizontalToFlex(
                                finalStyle.textAlign,
                              ),

                              whiteSpace: finalStyle.whiteSpace || "nowrap",

                              overflow: "hidden",

                              textOverflow: "clip",

                              lineHeight: titleRow ? 1.35 : 1.2,

                              textAlign: finalStyle.textAlign || "left",
                            }}
                          >
                            {text}
                          </div>

                          {selected && (
                            <div
                              style={{
                                position: "absolute",
                                inset: -1,

                                border: "2px solid #1a73e8",

                                pointerEvents: "none",

                                zIndex: 20,
                              }}
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* =====================================================
          SHEET TABS
      ===================================================== */}
      <div className="flex items-center flex-shrink-0 px-2 overflow-x-auto border-t h-11 bg-[#f8f9fa] border-[#dadce0]">
        <div className="flex items-center h-full gap-1">
          {(workbook?.SheetNames || []).map((sheetName) => {
            const active = activeSheet === sheetName;

            return (
              <button
                key={sheetName}
                type="button"
                onClick={() => {
                  setActiveSheet(sheetName);
                  setSelectedCell(null);
                }}
                className={`relative h-full px-4 text-xs whitespace-nowrap transition-colors ${
                  active
                    ? "text-[#188038] font-semibold bg-white"
                    : "text-[#5f6368] hover:bg-[#eeeeee]"
                }`}
              >
                {sheetName}

                {active && (
                  <div className="absolute bottom-0 rounded-t left-2 right-2 h-[3px] bg-[#188038]" />
                )}
              </button>
            );
          })}
        </div>

        <div className="flex-1 min-w-8" />

        <div className="px-3 text-[11px] text-[#80868b] whitespace-nowrap">
          View only
        </div>
      </div>
    </div>
  );
};

export default ExcelViewer;

// =========================================================
// EXCEL COLUMN NAME
// =========================================================
function toExcelCol(index) {
  let result = "";
  let value = index;

  while (value >= 0) {
    result = String.fromCharCode((value % 26) + 65) + result;

    value = Math.floor(value / 26) - 1;
  }

  return result;
}

// =========================================================
// FILE NAME
// =========================================================
function getFileName(url) {
  if (!url) {
    return "Excel Preview";
  }

  try {
    const parsed = new URL(url, window.location.origin);

    return (
      decodeURIComponent(parsed.pathname.split("/").filter(Boolean).pop()) ||
      "Excel Preview"
    );
  } catch {
    return (
      String(url).split("?")[0].split("/").filter(Boolean).pop() ||
      "Excel Preview"
    );
  }
}

// =========================================================
// EXCEL STYLE -> CSS
// =========================================================
function convertExcelStyleToCss(style) {
  if (!style) return {};

  const css = {};

  // FONT
  if (style.font) {
    const font = style.font;

    if (font.name) {
      css.fontFamily = `"${font.name}", Arial, sans-serif`;
    }

    if (font.sz) {
      css.fontSize = `${font.sz}pt`;
    }

    if (font.bold) {
      css.fontWeight = 700;
    }

    if (font.italic) {
      css.fontStyle = "italic";
    }

    const decorations = [];

    if (font.underline) {
      decorations.push("underline");
    }

    if (font.strike) {
      decorations.push("line-through");
    }

    if (decorations.length) {
      css.textDecoration = decorations.join(" ");
    }

    const fontColor = getExcelColor(font.color);

    if (fontColor) {
      css.color = fontColor;
    }
  }

  // FILL
  if (style.fill) {
    const fill = style.fill.fgColor || style.fill.patternFg;

    const fillColor = getExcelColor(fill);

    if (fillColor && fillColor !== "transparent") {
      css.backgroundColor = fillColor;
    }
  }

  // ALIGNMENT
  if (style.alignment) {
    const alignment = style.alignment;

    if (alignment.horizontal) {
      switch (alignment.horizontal) {
        case "center":
        case "centerContinuous":
          css.textAlign = "center";
          break;

        case "right":
          css.textAlign = "right";
          break;

        case "left":
          css.textAlign = "left";
          break;

        case "justify":
          css.textAlign = "justify";
          break;

        default:
          break;
      }
    }

    if (alignment.vertical) {
      switch (alignment.vertical) {
        case "top":
          css.verticalAlign = "top";
          break;

        case "bottom":
          css.verticalAlign = "bottom";
          break;

        default:
          css.verticalAlign = "middle";
      }
    }

    if (alignment.wrapText) {
      css.whiteSpace = "pre-wrap";
      css.overflowWrap = "break-word";
    }

    if (typeof alignment.indent === "number" && alignment.indent > 0) {
      css.paddingLeft = `${5 + alignment.indent * 10}px`;
    }

    if (typeof alignment.textRotation === "number") {
      const rotation = alignment.textRotation;

      if (rotation > 0 && rotation <= 90) {
        css.transform = `rotate(-${rotation}deg)`;
      }
    }
  }

  // BORDER
  if (style.border) {
    const border = style.border;

    if (border.top) {
      css.borderTop = excelBorderToCss(border.top);
    }

    if (border.right) {
      css.borderRight = excelBorderToCss(border.right);
    }

    if (border.bottom) {
      css.borderBottom = excelBorderToCss(border.bottom);
    }

    if (border.left) {
      css.borderLeft = excelBorderToCss(border.left);
    }
  }

  return css;
}

// =========================================================
// BORDER
// =========================================================
function excelBorderToCss(border) {
  if (!border || !border.style) {
    return undefined;
  }

  let width = 1;
  let style = "solid";

  switch (border.style) {
    case "medium":
    case "mediumDashed":
    case "mediumDashDot":
    case "mediumDashDotDot":
      width = 2;
      break;

    case "thick":
      width = 3;
      break;

    case "double":
      return `3px double ${getExcelColor(border.color) || "#000"}`;

    case "dashed":
    case "mediumDashed":
      style = "dashed";
      break;

    case "dotted":
      style = "dotted";
      break;

    default:
      style = "solid";
  }

  const color = getExcelColor(border.color) || "#000000";

  return `${width}px ${style} ${color}`;
}

// =========================================================
// COLOR
// =========================================================
function getExcelColor(color) {
  if (!color) return null;

  if (color.rgb) {
    let rgb = String(color.rgb).replace("#", "");

    if (rgb.length === 8) {
      rgb = rgb.substring(2);
    }

    if (rgb.length === 6) {
      return `#${rgb}`;
    }
  }

  if (typeof color.indexed === "number") {
    return EXCEL_INDEXED_COLORS[color.indexed] || null;
  }

  if (typeof color.theme === "number") {
    return EXCEL_THEME_FALLBACK[color.theme] || null;
  }

  return null;
}

// =========================================================
// FLEX ALIGNMENT
// =========================================================
function horizontalToFlex(alignment) {
  switch (alignment) {
    case "center":
      return "center";

    case "right":
      return "flex-end";

    case "justify":
      return "space-between";

    default:
      return "flex-start";
  }
}

function verticalToFlex(alignment) {
  switch (alignment) {
    case "top":
      return "flex-start";

    case "bottom":
      return "flex-end";

    default:
      return "center";
  }
}

// =========================================================
// BASIC EXCEL COLORS
// =========================================================
const EXCEL_INDEXED_COLORS = {
  0: "#000000",
  1: "#FFFFFF",
  2: "#FF0000",
  3: "#00FF00",
  4: "#0000FF",
  5: "#FFFF00",
  6: "#FF00FF",
  7: "#00FFFF",
  8: "#000000",
  9: "#FFFFFF",
  10: "#FF0000",
  11: "#00FF00",
  12: "#0000FF",
  13: "#FFFF00",
  14: "#FF00FF",
  15: "#00FFFF",
  16: "#800000",
  17: "#008000",
  18: "#000080",
  19: "#808000",
  20: "#800080",
  21: "#008080",
  22: "#C0C0C0",
  23: "#808080",
};

const EXCEL_THEME_FALLBACK = {
  0: "#FFFFFF",
  1: "#000000",
  2: "#E7E6E6",
  3: "#44546A",
  4: "#4472C4",
  5: "#ED7D31",
  6: "#A5A5A5",
  7: "#FFC000",
  8: "#5B9BD5",
  9: "#70AD47",
};
