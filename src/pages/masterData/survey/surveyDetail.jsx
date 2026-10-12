import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiRequest } from "../../../services/apiRequest";
import ResponseDetailModal from "../../../components/masterData/survey/responseDetail";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import Pagination from "../../../components/common/pagination";
import { fetchAllSurveyResponses } from "../../../services/survey/surveyServices";

const SurveyDetail = () => {
  const { surveyId } = useParams();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("summary");
  const [summary, setSummary] = useState(null);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [responses, setResponses] = useState([]);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [responseAnswers, setResponseAnswers] = useState({});

  const [page, setPage] = useState(1);
  const limit = 10;
  const totalPage = Math.ceil(responses.length / limit);

  const start = (page - 1) * limit;
  const paginatedResponses = responses.slice(start, start + limit);

  const [textPage, setTextPage] = useState({});
  const TEXT_PER_PAGE = 5;

  const getPage = (questionId) => textPage[questionId] || 1;

  const setPages = (questionId, page) => {
    setTextPage((prev) => ({
      ...prev,
      [questionId]: page,
    }));
  };

  useEffect(() => {
    setPage(1);
  }, [activeTab]);

  useEffect(() => {}, [summary, insights, responses]);

  const fetchResponseAnswers = async (responseList) => {
    const map = {};

    await Promise.all(
      responseList.map(async (r) => {
        try {
          const res = await ApiRequest({
            url: `/survey-responses/${r.response_id}`,
          });

          const answers = res?.data?.answers || [];

          map[r.response_id] = {};
          answers.forEach((a) => {
            map[r.response_id][a.question_id] = a.answer;
          });
        } catch (err) {
          console.error("FAILED FETCH RESPONSE DETAIL", r.response_id, err);
        }
      }),
    );

    setResponseAnswers(map);
  };

  /* ================= FETCH ================= */
  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, insightRes, allResponses] = await Promise.all([
        ApiRequest({ url: `/dashboard/surveys/${surveyId}/summary` }),
        ApiRequest({ url: `/dashboard/surveys/${surveyId}/insights` }),
        fetchAllSurveyResponses(surveyId), // 🔥 PENTING
      ]);

      setSummary(summaryRes?.data ?? null);

      const insightData = Array.isArray(insightRes)
        ? insightRes
        : (insightRes?.data ?? []);

      setInsights(insightData);
      setResponses(allResponses);

      await fetchResponseAnswers(allResponses);
    } catch (e) {
      console.error("FETCH SURVEY DETAIL ERROR:", e);
      setSummary(null);
      setInsights([]);
      setResponses([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (surveyId) fetchData();
  }, [surveyId]);

  if (loading) return null;

  const handleExportExcel = () => {
    if (!responses.length) return;

    // HEADER
    const headers = [
      "Responses Time",
      "Username",
      ...insights.map((q) => q.question),
    ];

    // ROWS
    const rows = responses.map((r) => {
      const responseTime = r.submitted_at
        ? new Date(r.submitted_at).toLocaleString("id-ID")
        : "-";

      const answerCols = insights.map(
        (q) => responseAnswers?.[r.response_id]?.[q.question_id] || "-",
      );

      return [responseTime, r.username, ...answerCols];
    });

    // CREATE WORKSHEET
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);

    // 🔒 Freeze header
    worksheet["!freeze"] = { xSplit: 0, ySplit: 1 };

    // 📏 Auto column width
    worksheet["!cols"] = [
      { wch: 18 }, // Responses Time
      { wch: 15 }, // Username
      { wch: 30 }, // Nama Toko
      { wch: 15 }, // Target
      { wch: 25 }, // Provinsi
    ];

    headers.forEach((_, idx) => {
      const cell = XLSX.utils.encode_cell({ r: 0, c: idx });
      if (!worksheet[cell]) return;

      worksheet[cell].s = {
        font: { bold: true },
        alignment: { vertical: "center" },
      };
    });

    for (let i = 1; i <= rows.length; i++) {
      const cell = XLSX.utils.encode_cell({ r: i, c: 3 }); // kolom Target
      if (worksheet[cell]) {
        worksheet[cell].t = "n";
        worksheet[cell].z = '"Rp" #,##0';
      }
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Survey Responses");

    // EXPORT
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    saveAs(blob, `survey_${surveyId}_responses.xlsx`);
  };

  return (
    <div>
      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-4 font-medium text-[#0F4C81]"
      >
        <ArrowLeft size={18} /> Back to detail
      </button>

      <h1 className="mb-8 font-bold text-[40px]">Survey Detail</h1>

      {/* TABS */}
      <div className="flex gap-2 p-1 mb-10 bg-white rounded-full w-fit">
        <Tab
          active={activeTab === "summary"}
          onClick={() => setActiveTab("summary")}
        >
          Summary
        </Tab>
        <Tab
          active={activeTab === "responses"}
          onClick={() => setActiveTab("responses")}
        >
          Responses
        </Tab>
      </div>

      {/* ================= SUMMARY ================= */}
      {activeTab === "summary" && summary !== null && (
        <>
          {/* INSIGHT CARDS */}
          <div className="grid grid-cols-5 gap-6 mb-12">
            <Card title="Views" value={summary.views} />
            <Card title="Start" value={summary.start} />
            <Card title="Submission" value={summary.submission} />
            <Card
              title="Completion rate"
              value={`${summary.completion_rate}%`}
            />
            <Card title="Time to complete" value={summary.time_to_complete} />
          </div>

          {/* QUESTIONS */}
          <div className="space-y-10">
            {insights.map((q, idx) => (
              <div
                key={q.question_id}
                className="p-8 bg-white shadow rounded-3xl"
              >
                <p className="mb-6 font-semibold">
                  {idx + 1}. {q.question}
                </p>

                {/* MULTIPLE CHOICE */}
                {q.type === "choice" &&
                  q.options?.map((opt) => (
                    <div key={opt.label} className="mb-4">
                      <div className="flex justify-between mb-1 text-sm">
                        <span>{opt.label}</span>
                        <span>{opt.percentage}%</span>
                      </div>
                      <div className="w-full h-3 bg-gray-100 rounded-full">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600"
                          style={{ width: `${opt.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}

                {/* TEXT ANSWER */}
                {/* TEXT ANSWER */}
                {q.type === "text" &&
                  (() => {
                    const page = getPage(q.question_id);
                    const start = (page - 1) * TEXT_PER_PAGE;
                    const end = page * TEXT_PER_PAGE;
                    const pagedAnswers = q.answers?.slice(start, end) || [];
                    const totalPages = Math.ceil(
                      (q.answers?.length || 0) / TEXT_PER_PAGE,
                    );

                    return (
                      <div className="p-5 space-y-3 text-sm bg-[#FAFAFA] rounded-xl">
                        {pagedAnswers.map((a, i) => (
                          <p key={i}>• {a.answer}</p>
                        ))}

                        {/* PAGINATION */}
                        {totalPages > 1 && (
                          <div className="flex items-center justify-end gap-3 pt-3">
                            <button
                              disabled={page === 1}
                              onClick={() => setPages(q.question_id, page - 1)}
                              className="px-3 py-1 text-xs border rounded disabled:opacity-40"
                            >
                              Prev
                            </button>

                            <span className="text-xs text-gray-500">
                              {page} / {totalPages}
                            </span>

                            <button
                              disabled={page === totalPages}
                              onClick={() => setPages(q.question_id, page + 1)}
                              className="px-3 py-1 text-xs border rounded disabled:opacity-40"
                            >
                              Next
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                <p className="mt-4 text-xs text-gray-400">
                  {q.total} out of {q.total} people answered this question.
                </p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ================= RESPONSES ================= */}
      {activeTab === "responses" && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={handleExportExcel}
              className="px-5 py-2 font-semibold text-white rounded-lg bg-[#0F4C81]"
            >
              Export Excel
            </button>
          </div>
          <div className="overflow-auto bg-white shadow rounded-2xl">
            <table className="min-w-full text-sm border-collapse">
              <thead className="text-gray-600 bg-[#F1F5F9]">
                <tr>
                  <th className="px-4 py-3 text-center">
                    <input type="checkbox" />
                  </th>

                  <th className="px-6 py-3 text-left">Responses Time</th>
                  <th className="px-6 py-3 text-left">Username</th>

                  {/* DYNAMIC QUESTION HEADERS */}
                  {insights.map((q) => (
                    <th
                      key={q.question_id}
                      className="px-6 py-3 text-left whitespace-nowrap"
                    >
                      {q.question.length > 20
                        ? q.question.slice(0, 20) + "..."
                        : q.question}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paginatedResponses.map((r) => (
                  <tr key={r.response_id} className="border-t">
                    <td className="px-4 py-3 text-center">
                      <input type="checkbox" />
                    </td>

                    {/* RESPONSE TIME */}
                    <td className="px-6 py-3">
                      {r.submitted_at
                        ? new Date(r.submitted_at).toLocaleDateString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }) +
                          " " +
                          new Date(r.submitted_at).toLocaleTimeString("id-ID", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "-"}
                    </td>

                    {/* USERNAME */}
                    <td className="px-6 py-3">{r.username}</td>

                    {/* ANSWERS PER QUESTION */}
                    {insights.map((q) => (
                      <td
                        key={q.question_id}
                        className="px-6 py-3 text-gray-600"
                      >
                        {responseAnswers?.[r.response_id]?.[q.question_id] ||
                          "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalPage > 1 && (
            <Pagination
              current={page}
              total={totalPage}
              onChange={(p) => setPage(p)}
            />
          )}
        </>
      )}

      {selectedResponse && (
        <ResponseDetailModal
          response={selectedResponse}
          onClose={() => setSelectedResponse(null)}
        />
      )}
    </div>
  );
};

/* ================= SMALL COMPONENTS ================= */

const Card = ({ title, value }) => (
  <div className="p-6 text-center bg-white shadow rounded-3xl">
    <p className="mb-2 text-sm text-gray-500">{title}</p>
    <p className="font-bold text-[42px]">{value}</p>
  </div>
);

const Tab = ({ active, children, onClick }) => (
  <button
    onClick={onClick}
    className={`px-8 py-2 rounded-full font-semibold ${
      active ? "bg-[#0F4C81] text-white" : "text-[#0F4C81]"
    }`}
  >
    {children}
  </button>
);

export default SurveyDetail;
