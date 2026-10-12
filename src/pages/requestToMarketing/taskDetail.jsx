import React, { useEffect, useState } from "react";
import { ArrowLeft, Calendar } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiRequest } from "../../services/apiRequest";

import DelegationIcon from "../../assets/images/icons/delegation.png";
import DelegationModal from "../../components/requestToMarketing/delegation/delegation";
import RequestComments from "../../components/requestToMarketing/comment/addcomment";
import CommentHistory from "../../components/requestToMarketing/comment/commentHistory";
import PDFPreviewCard from "../../components/common/pdfPreviewCard";
import { fetchAllAreas } from "../../services/area/area";
import { fetchAllProvinces } from "../../services/province/province";
import { fetchAllChannels } from "../../services/channel/channel";
import { fetchAllStores } from "../../services/store/storeServices";

const ADMIN_USER_ID = 47;

const TaskDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [task, setTask] = useState(null);
  const [usersMap, setUsersMap] = useState({});
  const [comments, setComments] = useState([]);
  const [delegatedUsers, setDelegatedUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showDelegation, setShowDelegation] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showParticipantModal, setShowParticipantModal] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const [locationInfo, setLocationInfo] = useState({
    areaName: "-",
    provinceName: "-",
    channelName: "-",
    storeName: "-",
  });

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getAvatar = (name = "User") =>
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;

  const getDisplayStatus = (status, endDate) => {
    const today = new Date();
    const dueDate = endDate ? new Date(endDate) : null;

    if (status === "done") return "Done";
    if (status === "rejected") return "Rejected";
    if (dueDate && today > dueDate) return "Delayed";
    if (status === "on_process_marketing") return "On Process Marketing";
    if (status === "on_process_finance") return "On Process Finance";
    if (status === "on_process_purchasing") return "On Process Purchasing";

    return "On Going";
  };

  const getStatusClass = (status) => {
    if (status === "Rejected") return "bg-red-100 text-red-700";
    if (status === "Delayed") return "bg-red-100 text-red-600";
    if (status === "Done") return "bg-green-100 text-green-600";
    if (status === "On Process Marketing") return "bg-blue-100 text-blue-700";
    if (status === "On Process Finance") return "bg-orange-100 text-orange-700";
    if (status === "On Process Purchasing")
      return "bg-purple-100 text-purple-700";

    return "bg-yellow-100 text-yellow-700";
  };

  const fetchCurrentUser = async () => {
    const res = await ApiRequest({
      url: "/profile/me",
      method: "GET",
    });

    setCurrentUser(res.data);
  };

  const fetchUsers = async () => {
    try {
      let page = 1;
      const limit = 100;
      let allUsers = [];
      let keepFetching = true;

      while (keepFetching) {
        const res = await ApiRequest({
          url: `/users/all?page=${page}&limit=${limit}`,
          method: "GET",
        });

        const data = res.data || [];
        allUsers = [...allUsers, ...data];

        if (data.length < limit) {
          keepFetching = false;
        } else {
          page += 1;
        }
      }

      const map = {};

      allUsers.forEach((u) => {
        map[String(u.user_id)] = {
          id: u.user_id,
          name: u.full_name || u.name,
          avatar:
            u.image_url ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              u.full_name || u.name || "User",
            )}`,
        };
      });

      setUsersMap(map);
    } catch (err) {
      console.error("Failed fetch users:", err);
      setUsersMap({});
    }
  };

  const fetchLocationInfo = async (requestData) => {
    try {
      const [areas, provinces, channels, stores] = await Promise.all([
        fetchAllAreas(),
        fetchAllProvinces(),
        fetchAllChannels(),
        fetchAllStores(),
      ]);

      const province = provinces.find(
        (p) =>
          Number(p.id || p.province_id) === Number(requestData.province_id),
      );

      const area = areas.find(
        (a) =>
          Number(a.id || a.area_id) ===
          Number(requestData.area_id || province?.area_id),
      );

      const channel = channels.find(
        (c) => Number(c.id || c.channel_id) === Number(requestData.channel_id),
      );

      const store = stores.find(
        (s) => Number(s.id || s.store_id) === Number(requestData.store_id),
      );

      setLocationInfo({
        areaName: area?.name || "-",
        provinceName: province?.name || "-",
        channelName: channel?.name || "-",
        storeName: store?.name || "-",
      });
    } catch (err) {
      console.error("Failed fetch location info:", err);
    }
  };

  const fetchDetail = async (showPageLoading = false) => {
    if (showPageLoading) {
      setLoading(true);
    }

    try {
      const res = await ApiRequest({
        url: `/requests/detail/${id}`,
        method: "GET",
      });

      const r = res.data.request;
      const employees = res.data.employees || [];

      setTask({
        id: r.request_id,
        name: r.name,
        tag: r.tag,
        tagId: r.tag_id,
        submissionType:
          r.submission_type ||
          r.submissionType ||
          (r.tag_id ? "New" : "Revision"),

        description: r.description,
        notes: r.notes,

        startDate: r.start_date,
        endDate: r.end_date,
        createdAt: r.created_at,

        asmId: r.asm_id,
        asmName: r.asm_name || r.asm?.full_name || r.asm?.name,

        createdBy: r.created_by,
        createdByName:
          r.created_by_name ||
          r.creator_name ||
          r.created_by_user?.full_name ||
          r.created_by_user?.name ||
          r.creator?.full_name ||
          r.creator?.name,

        areaId: r.area_id,
        provinceId: r.province_id,
        channelId: r.channel_id,
        storeId: r.store_id,

        document_url: r.document_url || null,
        document_name: r.document_url ? r.document_url.split("/").pop() : null,

        status: r.status,
      });

      setDelegatedUsers(employees);
      fetchLocationInfo(r);
    } catch (err) {
      console.error("Failed fetch detail:", err);
    } finally {
      if (showPageLoading) {
        setLoading(false);
      }
    }
  };

  const fetchComments = async () => {
    try {
      const res = await ApiRequest({
        url: `/requests/${id}/comments`,
        method: "GET",
      });

      setComments(res.data || []);
    } catch {
      setComments([]);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  useEffect(() => {
    if (Object.keys(usersMap).length > 0) {
      fetchDetail(true);
      fetchComments();
    }
  }, [usersMap, id]);

  if (loading || !task) return <p>Loading...</p>;

  const displayStatus = getDisplayStatus(task.status, task.endDate);

  const isDelegatedUser =
    currentUser &&
    delegatedUsers.some(
      (u) => Number(u.user_id) === Number(currentUser.user_id),
    );

  const isPrivileged =
    currentUser &&
    (Number(currentUser.user_id) === ADMIN_USER_ID ||
      Number(currentUser.user_role_id) === 12);

  const canDelegate = isPrivileged || isDelegatedUser;

  const assignorId = task.asmId || task.createdBy;
  const finalAssignor = usersMap[String(assignorId)] || null;

  const delegatedUserDetails = delegatedUsers
    .map((e) => {
      const userId = e.user_id;
      return usersMap[String(userId)] || null;
    })
    .filter(Boolean);

  const handleChangeStatus = async (status) => {
    const formData = new FormData();
    formData.append("status", status);

    await ApiRequest({
      url: `/requests/update/${task.id}`,
      method: "PUT",
      data: formData,
      isFormData: true,
    });

    setShowStatusDropdown(false);
    fetchDetail();
  };

  const DetailItem = ({ label, value }) => (
    <div>
      <p className="mb-1 text-sm text-gray-400">{label}</p>
      <p className="text-sm font-medium text-gray-800 whitespace-pre-line">
        {value || "-"}
      </p>
    </div>
  );

  return (
    <div className="relative w-full px-4 mx-auto max-w-[1400px]">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <ArrowLeft
          size={18}
          className="cursor-pointer text-brand-first"
          onClick={() => navigate(-1)}
        />
        <p className="text-sm text-brand-first">Back to Request To Marketing</p>
      </div>

      <h1 className="mb-4 text-xl font-semibold sm:text-2xl lg:text-3xl sm:mb-6">
        {task.name}
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="p-4 space-y-5 bg-white shadow-sm rounded-3xl sm:p-6">
          {canDelegate && (
            <button
              onClick={() => setShowDelegation(true)}
              className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-semibold bg-[#9ED57D] rounded-xl sm:w-fit"
            >
              <img src={DelegationIcon} className="w-4 h-4" alt="" />
              Delegation Project
            </button>
          )}

          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <DetailItem label="Tag" value={task.tag} />

            <DetailItem label="Submission Type" value={task.submissionType} />

            <DetailItem label="Area" value={locationInfo.areaName} />

            <DetailItem label="Province" value={locationInfo.provinceName} />

            <DetailItem label="Channel" value={locationInfo.channelName} />

            <DetailItem label="Store" value={locationInfo.storeName} />

            <DetailItem label="Additional Notes" value={task.notes} />

            <DetailItem
              label="Date"
              value={`${formatDate(task.startDate)} - ${formatDate(task.endDate)}`}
            />
          </div>

          <div>
            <p className="mb-2 text-sm text-gray-400">Assignor</p>

            <div className="flex items-center gap-3">
              <img
                src={finalAssignor.avatar}
                className="object-cover w-8 h-8 rounded-full sm:w-9 sm:h-9"
                alt={finalAssignor.name}
              />

              <p className="text-sm font-medium">{finalAssignor.name}</p>
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm text-gray-400">Participant</p>

            {delegatedUserDetails.length === 0 ? (
              <p className="text-sm text-gray-500">-</p>
            ) : (
              <div
                className="flex items-center cursor-pointer"
                onClick={() => setShowParticipantModal(true)}
              >
                {delegatedUserDetails.map((user, index) => (
                  <img
                    key={user.id}
                    src={user.avatar}
                    className={`w-9 h-9 rounded-full border-2 border-white object-cover ${
                      index !== 0 ? "-ml-3" : ""
                    }`}
                    title={user.name}
                    alt={user.name}
                  />
                ))}
              </div>
            )}
          </div>

          {showParticipantModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="relative w-full max-w-lg p-6 bg-white rounded-3xl">
                <h3 className="mb-4 text-xl font-semibold text-gray-700">
                  Participant
                </h3>

                <div className="space-y-3">
                  {delegatedUserDetails.map((user) => (
                    <div key={user.id} className="flex items-center gap-3">
                      <img
                        src={user.avatar}
                        className="object-cover w-10 h-10 rounded-full"
                        alt={user.name}
                      />
                      <p className="text-sm font-medium text-gray-700">
                        {user.name}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowParticipantModal(false)}
                  className="absolute text-gray-400 top-4 right-4 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={16} />
            Created {formatDate(task.createdAt)}
          </div>
        </div>

        <div className="p-4 bg-white shadow-sm rounded-3xl lg:col-span-2 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="mb-3 text-base font-semibold sm:text-lg sm:mb-4">
              Task Description
            </h2>

            {isPrivileged && (
              <div className="relative">
                <button
                  disabled={
                    displayStatus === "Done" || displayStatus === "Rejected"
                  }
                  onClick={() => {
                    if (
                      displayStatus !== "Done" &&
                      displayStatus !== "Rejected"
                    ) {
                      setShowStatusDropdown(!showStatusDropdown);
                    }
                  }}
                  className={`
                    px-4 py-2 rounded-full text-sm font-semibold
                    flex items-center gap-2
                    ${getStatusClass(displayStatus)}
                    ${
                      displayStatus === "Done" || displayStatus === "Rejected"
                        ? "cursor-default"
                        : ""
                    }
                  `}
                >
                  {displayStatus}

                  {displayStatus !== "Done" && displayStatus !== "Rejected" && (
                    <svg
                      className={`w-4 h-4 transition ${
                        showStatusDropdown ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  )}
                </button>

                {displayStatus !== "Done" &&
                  displayStatus !== "Rejected" &&
                  showStatusDropdown && (
                    <div className="absolute right-0 z-50 w-64 mt-3 overflow-hidden bg-white border border-gray-100 rounded-2xl shadow-[0_12px_35px_rgba(15,23,42,0.12)]">
                      <div className="px-4 py-3 text-xs font-semibold tracking-wide text-gray-400 uppercase border-b">
                        Change Status
                      </div>

                      {[
                        {
                          label: "On Process Marketing",
                          value: "on_process_marketing",
                        },
                        {
                          label: "On Process Finance",
                          value: "on_process_finance",
                        },
                        {
                          label: "On Process Purchasing",
                          value: "on_process_purchasing",
                        },
                        {
                          label: "Rejected",
                          value: "rejected",
                          danger: true,
                        },
                      ].map((item) => (
                        <button
                          key={item.value}
                          onClick={() => handleChangeStatus(item.value)}
                          className={`flex items-center justify-between w-full px-4 py-3 text-sm font-medium transition
    ${
      item.danger
        ? "text-red-600 hover:bg-red-50"
        : "text-gray-700 hover:bg-gray-50"
    }`}
                        >
                          <span>{item.label}</span>

                          {task.status === item.value && (
                            <span
                              className={`w-2 h-2 rounded-full ${
                                item.danger ? "bg-red-500" : "bg-blue-500"
                              }`}
                            />
                          )}
                        </button>
                      ))}

                      <div className="border-t border-gray-100" />

                      <button
                        onClick={() => handleChangeStatus("done")}
                        className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-green-700 transition hover:bg-green-50"
                      >
                        <span>Done</span>

                        {task.status === "done" && (
                          <span className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                      </button>
                    </div>
                  )}
              </div>
            )}
          </div>

          <div className="p-3 mb-6 text-sm border rounded-2xl sm:p-4">
            {task.description}
          </div>

          {task.document_url && (
            <>
              <h3 className="mb-4 text-lg font-semibold">Attachment</h3>
              <PDFPreviewCard
                fileUrl={task.document_url}
                fileName={task.document_name}
              />
            </>
          )}

          <h3 className="mt-6 mb-4 text-lg font-semibold">Project History</h3>

          <CommentHistory
            comments={comments}
            usersMap={usersMap}
            creator={{
              name: finalAssignor.name,
              image: finalAssignor.avatar,
              created_at: task.createdAt,
            }}
          />

          <RequestComments requestId={id} onSuccess={fetchComments} />
        </div>
      </div>

      <DelegationModal
        open={showDelegation}
        onClose={() => setShowDelegation(false)}
        requestId={id}
        onSuccess={() => {
          fetchDetail(false);
        }}
      />
    </div>
  );
};

export default TaskDetail;
