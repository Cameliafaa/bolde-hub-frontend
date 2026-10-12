import React, { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DelayedIcon from "../../assets/images/req-delayed.png";
import OnGoing from "../../assets/images/req-ongoing.png";
import Done from "../../assets/images/req-done.png";
import ActionMenu from "../../components/common/actionMenu";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";
import { ApiRequest } from "../../services/apiRequest";
import { fetchAllStores } from "../../services/store/storeServices";
import { getProductMap } from "../../services/product/productService";
import { fetchAllUsers } from "../../services/users/userService";
import ClaimModal from "../../components/warranty/warrantyModal/warrantyModal";
import InlineSuccess from "../../components/common/inlineSuccess";
import Pagination from "../../components/common/pagination";

/* ================= MAIN ================= */

const WarrantyClaims = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("All Claims");
  const [claims, setClaims] = useState([]);

  const [areaMap, setAreaMap] = useState({});
  const [storeMap, setStoreMap] = useState({});
  const [productMap, setProductMap] = useState({});
  const [userMap, setUserMap] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // "add" | "edit"
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const tabs = ["All Claims", "Approved", "Rejected", "Done"];

  /* ================= INIT ================= */

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    const maps = await fetchMasters();
    setAreaMap(maps.areaMap);
    setStoreMap(maps.storeMap);
    setProductMap(maps.productMap);
    setUserMap(maps.userMap);
    await fetchClaims(maps);
  };

  /* ================= MASTER DATA ================= */

  const fetchMasters = async () => {
    const [areaRes, stores, products, users] = await Promise.all([
      ApiRequest({ url: "/areas/all", params: { limit: 100 } }),
      fetchAllStores(),
      getProductMap(),
      fetchAllUsers(),
    ]);

    return {
      areaMap: Object.fromEntries(
        (areaRes.data || []).map((a) => [a.area_id, a.name]),
      ),
      storeMap: Object.fromEntries(stores.map((s) => [s.id, s.name])),
      productMap: products,
      userMap: Object.fromEntries(
        users.map((u) => [
          u.user_id,
          {
            name: u.full_name || u.username || `User ${u.user_id}`,
            avatar: u.image_url || null,
          },
        ]),
      ),
    };
  };

  /* ================= CLAIM LIST ================= */

  const fetchClaims = async (maps) => {
    const res = await ApiRequest({
      url: "/warranty-claims/all",
      method: "GET",
    });

    if (res?.status !== "success") return;

    const mapped = res.data.map((item) => {
      const user = maps.userMap[item.created_by];

      return {
        claim_id: item.warranty_claim_id,

        area_id: item.area_id,
        store_id: item.store_id,
        category_id: item.category_id,
        product_id: item.product_id,

        store_name: maps.storeMap[item.store_id] || "-",
        store_area: maps.areaMap[item.area_id] || "-",
        category_name: maps.productMap[item.product_id]?.category_name || "-",
        product_name: maps.productMap[item.product_id]?.product_name || "-",

        unit_quantity: item.unit_quantity,
        unit_name: item.unit_name || "PCS",

        serial_number: item.serial_number || "",
        problem_desc: item.problem_desc || "",

        status: item.status.toLowerCase(),
        created_at: item.created_at,

        claimant: {
          name: user?.name || `User ${item.created_by}`,
          avatar:
            user?.avatar ||
            `https://ui-avatars.com/api/?name=${user?.name || "User"}`,
        },
      };
    });

    setClaims(mapped);
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  /* ================= FILTER ================= */

  const visibleClaims = useMemo(() => {
    let filtered = claims;

    if (activeTab !== "All Claims") {
      filtered = claims.filter((c) => c.status === activeTab.toLowerCase());
    }

    if (activeTab === "All Claims") {
      const statusPriority = {
        waiting: 1,
        approved: 2,
        rejected: 3,
      };

      return [...filtered].sort((a, b) => {
        // 1️⃣ Sort by status priority
        if (statusPriority[a.status] !== statusPriority[b.status]) {
          return statusPriority[a.status] - statusPriority[b.status];
        }

        // 2️⃣ If same status → newest first
        return new Date(b.created_at) - new Date(a.created_at);
      });
    }

    // Tab lain tetap newest first
    return [...filtered].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    );
  }, [claims, activeTab]);

  const totalPages = Math.ceil(visibleClaims.length / itemsPerPage);

  const paginatedClaims = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return visibleClaims.slice(start, end);
  }, [visibleClaims, currentPage]);

  /* ================= ACTIONS ================= */

  const handleEdit = async (claim) => {
    const res = await ApiRequest({
      url: `/warranty-claims/detail/${claim.claim_id}`,
      method: "GET",
    });

    if (res?.status !== "success") {
      alert("Gagal ambil detail claim");
      return;
    }

    const d = res.data;

    const normalized = {
      claim_id: d.warranty_claim_id,

      area_id: d.area_id,
      area_name: areaMap[d.area_id], // ✅ AMBIL DARI MAP

      store_id: d.store_id,
      store_name: storeMap[d.store_id], // ✅

      category_id: d.category_id,
      category_name: productMap[d.product_id]?.category_name,

      product_id: d.product_id,
      product_name: productMap[d.product_id]?.product_name,

      unit_quantity: d.unit_quantity,
      unit_name: d.unit_name || "PCS",

      serial_number: d.serial_number || "",
      problem_desc: d.problem_desc || "",
    };

    setSelectedClaim(normalized);
    setModalMode("edit");
    setShowClaimModal(true);
  };

  const handleDelete = (claim) => {
    setSelectedClaim(claim);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    await ApiRequest({
      url: `/warranty-claims/delete/${selectedClaim.claim_id}`,
      method: "DELETE",
    });
    setShowDeleteModal(false);
    setSelectedClaim(null);
    init();
    setToastMessage("Claim berhasil dihapus");
  };

  /* ================= UTILS ================= */

  const mapStatus = (status) => {
    if (status === "waiting") return "Waiting";
    if (status === "approved") return "Approved";
    if (status === "rejected") return "Rejected";
    if (status === "done") return "Done";
    return "-";
  };

  const statusStyle = {
    waiting: "bg-yellow-50 text-yellow-700",
    approved: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-700",
    done: "bg-blue-50 text-blue-700",
  };

  /* ================= RENDER ================= */

  return (
    <div
      className="
      relative
      w-full
      max-w-[1400px]
      mx-auto
      px-4
    "
    >
      {/* HEADER */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center mb-6">
        {/* TABS */}
        <div className="flex bg-surface-background rounded-full p-1 w-full sm:w-fit overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-4 sm:px-8 py-2.5
                text-xs sm:text-sm font-semibold
                rounded-full whitespace-nowrap transition
                ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-brand-gradientFrom to-brand-gradientTo text-white shadow-md"
                    : "text-gray-600 hover:text-brand-gradientTo"
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* ADD CLAIM */}
        <button
          onClick={() => {
            setModalMode("add");
            setSelectedClaim(null);
            setShowClaimModal(true);
          }}
          className="
      self-end sm:self-auto
      flex items-center gap-2
      bg-gradient-to-r from-brand-gradientFrom to-brand-gradientTo
      text-surface-background font-semibold
      px-4 sm:px-5
      py-2
      rounded-xl shadow-md
      text-sm
          "
        >
          <Plus size={18} /> Add Claim
        </button>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <SummaryCard
          icon={OnGoing}
          count={claims.filter((c) => c.status === "waiting").length}
          title="Waiting"
          subtitle="Task on process"
          color="text-status-warning"
        />
        <SummaryCard
          icon={OnGoing}
          count={claims.filter((c) => c.status === "approved").length}
          title="Approved"
          subtitle="Task is delayed"
          color="text-status-expired"
        />
        <SummaryCard
          icon={DelayedIcon} // atau ganti icon khusus rejected kalau ada
          count={claims.filter((c) => c.status === "rejected").length}
          title="Rejected"
          subtitle="Task is rejected"
          color="text-status-danger"
        />

        <SummaryCard
          icon={Done}
          count={claims.filter((c) => c.status === "done").length}
          title="Done"
          subtitle="Task Done"
          color="text-status-success"
        />
      </div>

      {/* LIST */}
      {paginatedClaims.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-lg font-semibold text-text-primary">
            Belum ada Claim
          </p>
          <p className="text-sm text-text-secondary mt-2">
            Klik{" "}
            <span className="font-semibold text-brand-gradientTo">
              Add Claim
            </span>{" "}
            untuk mengajukan claim
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <InlineSuccess
            message={toastMessage}
            onClose={() => setToastMessage("")}
          />

          {paginatedClaims.map((c) => (
            <div
              key={c.claim_id}
              onClick={() => navigate(`/warranty-claims/detail/${c.claim_id}`)}
              className="
                bg-white rounded-2xl border shadow-sm
                p-4 sm:px-6 sm:py-4
                hover:shadow-md cursor-pointer
                flex flex-col gap-4
                sm:flex-row sm:items-center sm:justify-between
              "
            >
              {/* Nama Toko */}
              <div className="sm:w-1/">
                <p className="text-xs text-text-secondary mb-1">Nama Toko</p>
                <p className="font-medium text-brand-grandientTo truncate text-sm">
                  {c.store_name}
                </p>
              </div>

              {/* Produk */}
              <div className="sm:w-1/5">
                <p className="text-xs text-text-secondary mb-1">Nama Produk</p>
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-status-info">
                  {c.product_name}
                </span>
              </div>

              {/* Claimant */}
              <div className="hidden sm:block sm:w-1/5">
                <p className="text-xs text-text-secondary mb-1">Claimant</p>
                <img
                  src={c.claimant.avatar}
                  alt={c.claimant.name}
                  className="w-7 h-7 rounded-full"
                />
              </div>

              {/* Area */}
              <div className="hidden sm:block sm:w-1/5">
                <p className="text-xs text-text-secondary mb-1">Area Toko</p>
                <span className="font-medium text-brand-gradientTo text-sm">
                  {c.store_area}
                </span>
              </div>

              {/* Status + Checkbox */}
              <div className="flex items-center justify-between sm:justify-end gap-4 sm:w-1/5">
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${statusStyle[c.status]}`}
                >
                  {mapStatus(c.status)}
                </span>

                {/* ACTION MENU */}
                <div
                  onClick={(e) => e.stopPropagation()} // 🔥 PENTING
                >
                  <ActionMenu
                    onEdit={() => handleEdit(c)}
                    onDelete={() => handleDelete(c)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ClaimModal
        open={showClaimModal}
        mode={modalMode}
        claim={selectedClaim}
        onClose={() => {
          setShowClaimModal(false);
          setSelectedClaim(null);
        }}
        onSuccess={() => {
          init();
          setToastMessage(
            modalMode === "edit"
              ? "Claim berhasil diupdate"
              : "Claim berhasil ditambahkan",
          );
        }}
      />

      <ConfirmDeleteModal
        open={showDeleteModal}
        onCancel={() => {
          setShowDeleteModal(false);
          setSelectedClaim(null);
        }}
        onConfirm={confirmDelete}
      />

      {totalPages > 1 && (
        <Pagination
          current={currentPage}
          total={totalPages}
          onChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  );
};

/* ================= COMPONENTS ================= */

const SummaryCard = ({ icon, count, title, subtitle, color }) => (
  <div className="bg-surface-background rounded-2xl shadow-sm border py-6 text-center">
    <div className="relative w-14 h-14 mx-auto mb-2">
      <img src={icon} className="w-full h-full object-contain" />
      <span
        className={`absolute inset-0 flex items-center justify-center font-bold text-lg ${color}`}
      >
        {count}
      </span>
    </div>
    <h3 className="font-semibold text-sm sm:text-base">{title}</h3>
    <p className="text-xs text-text-secondarys mt-1">
      {count} {subtitle}
    </p>
  </div>
);

export default WarrantyClaims;
