import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Calendar } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import DelegationIcon from "../../assets/images/icons/delegation.png";
import ClaimComments from "../../components/warranty/comment/addClaimComment.jsx";
import CommentHistory from "../../components/requestToMarketing/comment/commentHistory.jsx";
import DoneClaimModal from "../../components/warranty/doneClaim/doneClaim.jsx";
import { ApiRequest } from "../../services/apiRequest.js";
import { fetchAllStores } from "../../services/store/storeServices.jsx";
import { getProductMap } from "../../services/product/productService.jsx";
import { fetchAllUsers } from "../../services/users/userService.jsx";

const WarrantyDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showDelegation, setShowDelegation] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [delegatedUsers, setDelegatedUsers] = useState([]);
  const [comments, setComments] = useState([]);
  const [approvalStatus, setApprovalStatus] = useState("waiting");
  const [showDoneModal, setShowDoneModal] = useState(false);
  const [openApproval, setOpenApproval] = useState(false);
  const [claim, setClaim] = useState(null);
  const [loading, setLoading] = useState(true);

  const [areaMap, setAreaMap] = useState({});
  const [storeMap, setStoreMap] = useState({});
  const [productMap, setProductMap] = useState({});
  const [userMap, setUserMap] = useState({});

  useEffect(() => {
    fetchClaimDetail();
    fetchMasters(); // background
  }, [id]);

  const fetchClaimDetail = async () => {
    try {
      setLoading(true);

      const res = await ApiRequest({
        url: `/warranty-claims/detail/${id}`,
        method: "GET",
      });

      if (res?.status !== "success") {
        console.warn("STATUS BUKAN SUCCESS:", res);
        return;
      }

      const item = res.data;

      setComments(item.comments || []);
      setClaim({
        claim_id: item.warranty_claim_id,
        store_id: item.store_id,
        area_id: item.area_id,
        product_id: item.product_id,
        quantity: item.unit_quantity,

        serial_number:
          item.serial_number && item.serial_number !== 0
            ? String(item.serial_number)
            : "-",

        issue: item.problem_desc,
        created_at: item.created_at,
        purchase_receipt_image: item.receipt_file,
        product_condition_image: item.product_file,
        handover_image: item.other_file,
        status: item.status.toLowerCase(),
        created_by: item.created_by,
      });
      setApprovalStatus(item.status.toLowerCase());
    } catch (err) {
      console.error("fetchClaimDetail error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMasters = async () => {
    try {
      const [areaRes, stores, products, users] = await Promise.all([
        ApiRequest({ url: "/areas/all", params: { limit: 100 } }),
        fetchAllStores(),
        getProductMap(),
        fetchAllUsers(200),
      ]);

      setAreaMap(
        Object.fromEntries(
          (areaRes.data || []).map((a) => [a.area_id, a.name]),
        ),
      );

      setStoreMap(Object.fromEntries(stores.map((s) => [s.id, s.name])));

      setProductMap(products);

      setUserMap(
        Object.fromEntries(
          users.map((u) => [
            u.user_id,
            {
              name: u.full_name || u.username,
              avatar: u.image_url,
            },
          ]),
        ),
      );
    } catch (err) {
      console.error("fetchMasters error:", err);
    }
  };

  const computedClaim = useMemo(() => {
    if (!claim) return null;

    const user = userMap[claim.created_by];

    return {
      ...claim,
      store_name: storeMap[claim.store_id] || "-",
      store_area: areaMap[claim.area_id] || "-",
      product_name: productMap[claim.product_id]?.product_name || "-",
      claimant: {
        name: user?.name || `User ${claim.created_by}`,
        avatar:
          user?.avatar ||
          `https://ui-avatars.com/api/?name=${user?.name || "User"}`,
      },
    };
  }, [claim, storeMap, areaMap, productMap, userMap]);

  const mappedComments = useMemo(() => {
    return comments.map((c) => ({
      request_comment_id: c.warranty_comment_id,
      created_at: c.created_at,

      comment_html: c.comment || c.comment_html || "",

      user: {
        full_name: userMap[c.user_id]?.name || "User",
        image_url:
          userMap[c.user_id]?.avatar || "https://ui-avatars.com/api/?name=User",
      },

      images: Array.isArray(c.images)
        ? c.images.map((img) => ({
            request_comment_image_id: img.warranty_comment_image_id,
            image_url: img.image_url,
          }))
        : [],
    }));
  }, [comments, userMap]);

  if (loading || !computedClaim) {
    return (
      <div className="py-24 text-center text-gray-400">
        Loading claim detail...
      </div>
    );
  }

  const isDelegatedUser =
    currentUser &&
    delegatedUsers.some((u) => u.user_id === currentUser.user_id);

  const isPrivileged =
    currentUser &&
    (currentUser.user_id === 47 || // Zerlinda
      currentUser.user_role_id === 12); // Super Admin

  const canDelegate = isPrivileged || isDelegatedUser;

  const updateClaimStatus = async (newStatus) => {
    try {
      const formData = new FormData();
      formData.append("status", newStatus);

      const res = await ApiRequest({
        url: `/warranty-claims/update/${id}`,
        method: "PUT",
        data: formData,
        isFormData: true, // 🔥 WAJIB
      });

      await fetchClaimDetail();
    } catch (err) {
      console.error("Update claim status error:", err);
    }
  };

  return (
    <div className="relative w-full px-4 mx-auto  max-w-[1400px]">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <ArrowLeft
          size={18}
          className="cursor-pointer text-brand-first"
          onClick={() => navigate(-1)}
        />
        <p className="text-sm text-brand-first">Back to Warranty Detail</p>
      </div>

      {/* TITLE */}
      <h1 className="mb-4 text-xl font-semibold  sm:text-2xl lg:text-3xl sm:mb-6">
        {computedClaim.store_name}
      </h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* LEFT */}
        <div className="p-4 space-y-4 bg-white shadow-sm  rounded-3xl sm:p-6 sm:space-y-6">
          <button
            onClick={() => setShowDelegation(true)}
            className="flex items-center justify-center w-full gap-2 px-4 py-2 text-sm font-semibold  bg-[#9ED57D] rounded-xl sm:w-fit"
          >
            <img src={DelegationIcon} className="w-4 h-4" />
            Delegation Project
          </button>

          {/* PRODUK */}
          <div>
            <p className="mb-1 text-sm text-gray-400">Nama Produk</p>
            <p className="font-medium">{computedClaim.product_name}</p>
          </div>

          {/* AREA */}
          <div>
            <p className="mb-1 text-sm text-gray-400">Area Toko</p>
            <p className="font-medium">{computedClaim.store_area}</p>
          </div>

          {/* JUMLAH */}
          <div>
            <p className="mb-1 text-sm text-gray-400">Jumlah Unit</p>
            <p className="font-medium">{computedClaim.quantity} Unit</p>
          </div>

          {/* SERIAL */}
          <div>
            <p className="mb-1 text-sm text-gray-400">Nomor Seri</p>
            <p className="font-medium">{computedClaim.serial_number}</p>
          </div>

          {/* CLAIMANT */}
          <div>
            <p className="mb-2 text-sm text-gray-400">Claimant</p>
            <div className="flex items-center gap-3">
              <img
                src={computedClaim.claimant.avatar}
                alt={computedClaim.claimant.name}
                className="w-8 h-8 rounded-full sm:w-9 sm:h-9"
              />
              <p className="text-sm font-medium">
                {computedClaim.claimant.name}
              </p>
            </div>
          </div>

          {/* CREATED */}
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar size={16} />
            Created{" "}
            {new Date(computedClaim.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>

        {/* RIGHT */}
        <div className="p-4 bg-white shadow-sm  rounded-3xl lg:col-span-2 sm:p-6">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h2 className="text-base font-semibold sm:text-lg">Kendala</h2>

            {/* STATUS / APPROVAL */}
            {approvalStatus === "waiting" ? (
              <div className="relative">
                {/* BUTTON */}
                <button
                  onClick={() => setOpenApproval(!openApproval)}
                  className="flex items-center gap-1 px-5 py-2 text-sm font-semibold rounded-full  bg-[#FFF2B3] text-[#B26A00]"
                >
                  Waiting Approval
                  <svg
                    className={`w-4 h-4 transition ${openApproval ? "rotate-180" : ""}`}
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
                </button>

                {/* DROPDOWN */}
                {openApproval && (
                  <div className="absolute right-0 z-30 w-56 mt-2 overflow-hidden bg-white border border-gray-100 shadow-xl  rounded-2xl">
                    <button
                      onClick={async () => {
                        await updateClaimStatus("Approved");
                        setOpenApproval(false);
                      }}
                      className="w-full px-6 py-3 text-base font-semibold text-left text-green-600  hover:bg-gray-50"
                    >
                      Approved Claim
                    </button>
                    <button
                      onClick={async () => {
                        await updateClaimStatus("Rejected");
                        setOpenApproval(false);
                      }}
                      className="w-full px-6 py-3 text-base font-semibold text-left text-red-500  hover:bg-gray-50"
                    >
                      Rejected Claim
                    </button>

                    <button
                      onClick={() => {
                        setShowDoneModal(true);
                        setOpenApproval(false);
                      }}
                      className="w-full px-6 py-3 text-base font-semibold text-left text-blue-600  hover:bg-gray-50"
                    >
                      Done Claim
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-semibold
        ${
          approvalStatus === "approved"
            ? "bg-green-100 text-green-700"
            : approvalStatus === "rejected"
              ? "bg-red-100 text-red-700"
              : "bg-blue-100 text-blue-700"
        }
      `}
              >
                {approvalStatus === "approved"
                  ? "Approved"
                  : approvalStatus === "rejected"
                    ? "Rejected"
                    : "Done"}
              </span>
            )}
          </div>

          <div className="p-3 mb-6 text-sm border rounded-2xl sm:p-4">
            {computedClaim.issue}
          </div>

          <h3 className="mb-4 text-lg font-semibold">Attachment</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <ImageCard
              label="Foto Nota Pembelian"
              src={computedClaim.purchase_receipt_image}
            />
            <ImageCard
              label="Foto Kelengkapan Produk"
              src={computedClaim.product_condition_image}
            />
            <ImageCard
              label="Foto Serah Terima Pengganti"
              src={computedClaim.handover_image}
            />
          </div>

          <h3 className="mt-8 mb-4 text-lg font-semibold">Claim History</h3>

          <CommentHistory
            comments={mappedComments}
            creator={{
              name: computedClaim.claimant.name,
              image: computedClaim.claimant.avatar,
              created_at: computedClaim.created_at,
            }}
          />

          <ClaimComments
            claimId={id}
            onSuccess={async () => {
              await fetchClaimDetail(); // 🔥 AUTO REFRESH
            }}
          />
        </div>
      </div>

      {showDoneModal && (
        <DoneClaimModal
          onClose={() => setShowDoneModal(false)}
          onSubmit={async ({ note, image }) => {
            try {
              // kalau mau kirim note/image sekalian, bisa ditambah form-data
              await updateClaimStatus("Done");
            } finally {
              setShowDoneModal(false);
            }
          }}
        />
      )}
    </div>
  );
};

/* ================= COMPONENT ================= */

const ImageCard = ({ label, src }) => (
  <div>
    <p className="mb-2 text-xs text-gray-400">{label}</p>
    {src ? (
      <img
        src={src}
        alt={label}
        className="object-cover w-full h-40 border rounded-2xl"
      />
    ) : (
      <div className="flex items-center justify-center w-full h-40 text-sm text-gray-400 border rounded-2xl">
        Tidak ada gambar
      </div>
    )}
  </div>
);

export default WarrantyDetail;
