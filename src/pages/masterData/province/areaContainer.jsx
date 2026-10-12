import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus } from "lucide-react";
import Tabs from "../../../components/common/tabs";
import Pagination from "../../../components/common/pagination";
import ConfirmDeleteModal from "../../../components/common/ConfirmDeleteModal";
import InlineSuccess from "../../../components/common/inlineSuccess";
import { ApiRequest } from "../../../services/apiRequest";

import ProvinceManagement from "./province";
import AreaManagement from "./areaManagement";
import AddProvince from "../../../components/masterData/area/province/addProvince";
import EditProvince from "../../../components/masterData/area/province/editProvince";
import AreaAddModal from "../../../components/masterData/area/addArea";
import AreaEditModal from "../../../components/masterData/area/editArea";
import DetailAreaModal from "../../../components/masterData/area/detailArea";
import DetailProvinceModal from "../../../components/masterData/area/province/detailProvince";

const AreaProvinceManagement = () => {
  const [activeTab, setActiveTab] = useState("province");
  const [search, setSearch] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  // const [totalPage, setTotalPage] = useState(1);
  const [allData, setAllData] = useState([]);

  // modal state
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [showDetail, setShowDetail] = useState(false);
  const [detailData, setDetailData] = useState(null);


  const limit = 10;

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = activeTab === "province" ? "/provinces" : "/areas/all";

      const res = await ApiRequest({
        url,
        method: "GET",
        params: { limit: 100 },
      });

      setAllData(res?.data || []);
      // setTotalPage(res?.meta?.total_page || 1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  /* =========================
     ACTION HANDLERS
  ========================= */

  const handleDeleteProvince = async () => {
    try {
      await ApiRequest({
        url: `/provinces/${selected.province_id}`,
        method: "DELETE",
      });

      setSuccessMsg("Province berhasil dihapus");
      setShowDelete(false);
      setSelected(null);
      fetchData();
    } catch (err) {
      console.error("DELETE PROVINCE ERROR:", err);
      alert("Gagal menghapus Province");
    }
  };

  const handleDeleteArea = async () => {
    try {
      await ApiRequest({
        url: `/areas/delete/${selected.area_id}`,
        method: "DELETE",
      });

      setSuccessMsg("Area berhasil dihapus");
      setShowDelete(false);
      setSelected(null);
      fetchData();
    } catch (err) {
      console.error("DELETE AREA ERROR:", err);
      alert("Gagal menghapus Area");
    }
  };

  const handleDetail = async (item) => {
    try {
      const url =
        activeTab === "province"
          ? `/provinces/${item.province_id}`
          : `/areas/detail/${item.area_id}`;

      const res = await ApiRequest({
        url,
        method: "GET",
      });

      setDetailData(res.data);
      setShowDetail(true);
    } catch (e) {
      console.error("FETCH DETAIL ERROR:", e);
    }
  };


  const filteredData = useMemo(() => {
    if (!search) return allData;

    const keyword = search.toLowerCase();

    return allData.filter((item) => {
      if (activeTab === "province") {
        return (
          item.name?.toLowerCase().includes(keyword) ||
          item.province_code?.toLowerCase().includes(keyword)
        );
      }

      return (
        item.name?.toLowerCase().includes(keyword) ||
        item.area_code?.toLowerCase().includes(keyword)
      );
    });
  }, [search, allData, activeTab]);

  const totalPage = Math.ceil(filteredData.length / limit);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredData.slice(start, start + limit);
  }, [filteredData, page]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div
      className="
      w-full
      max-w-[1400px]
      mx-auto

      px-4          /* HP */
      sm:px-4       /* tablet */
      lg:px-4       /* laptop */
      xl:px-4       /* desktop besar */
      2xl:px-4      /* layar besar */
    "
    >
      {/* SUCCESS */}
      {successMsg && (
        <InlineSuccess
          message={successMsg}
          onClose={() => setSuccessMsg("")}
        />
      )}

      {/* TITLE */}
      <h1 className="text-2xl font-bold text-[#002D62] mb-4">
        {activeTab === "province"
          ? "Province Management"
          : "Area Management"}
      </h1>

      {/* SEARCH + ADD */}
      <div className="
  flex flex-col gap-4
  sm:flex-row sm:justify-between sm:items-center
  mb-4
">
        <div className="
  flex items-center
  bg-white border-2 rounded-xl
  px-3 py-2
  w-full
  sm:w-1/2
  lg:w-1/3
">
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            placeholder={`Search ${activeTab}`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="outline-none w-full text-sm"
          />
        </div>

        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] text-white px-5 py-2.5 rounded-lg shadow"
        >
          <Plus size={16} />
          Add {activeTab === "province" ? "Province" : "Area"}
        </button>
      </div>

      {/* TABS */}
      <div className="mb-8">
        <Tabs
          tabs={[
            { key: "area", label: "Area" },
            { key: "province", label: "Province" },
          ]}
          active={activeTab}
          onChange={(t) => {
            setActiveTab(t);
            setSearch("");
            setPage(1);
          }}
        />
      </div>

      {/* TABLE */}
      {activeTab === "province" ? (
        <ProvinceManagement
          provinces={paginatedData}
          loading={loading}
          page={page}
          limit={limit}
          onDetail={handleDetail}
          onEdit={(p) => {
            setSelected(p);
            setShowEdit(true);
          }}
          onDelete={(p) => {
            setSelected(p);
            setShowDelete(true);
          }}
        />
      ) : (
        <AreaManagement
          areas={paginatedData}
          loading={loading}
          page={page}
          limit={limit}
          onDetail={handleDetail}
          onEdit={(a) => {
            setSelected(a);
            setShowEdit(true);
          }}
          onDelete={(a) => {
            setSelected(a);
            setShowDelete(true);
          }}
        />
      )}

      {/* PAGINATION */}
      {totalPage > 1 && (
        <Pagination
          current={page}
          total={totalPage}
          onChange={(p) => setPage(p)}
        />
      )}

      {/* ADD */}
      {showAdd && activeTab === "province" && (
        <AddProvince
          open={showAdd}
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            fetchData();
            setSuccessMsg("Province berhasil ditambahkan");
          }}
        />
      )}

      {/* ADD */}
      {showAdd && activeTab === "area" && (
        <AreaAddModal
          open={showAdd}
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            fetchData();
            setSuccessMsg("Area berhasil ditambahkan");
          }}
        />
      )}

      {/* DETAIL */}
      {showDetail && activeTab === "area" && (
        <DetailAreaModal
          open={showDetail}
          onClose={() => setShowDetail(false)}
          data={detailData}
        />
      )}

      {showDetail && activeTab === "province" && (
        <DetailProvinceModal
          open={showDetail}
          onClose={() => setShowDetail(false)}
          data={detailData}
        />
      )}


      {/* EDIT */}
      {showEdit && activeTab === "province" && selected && (
        <EditProvince
          open={showEdit}
          data={selected}
          onClose={() => setShowEdit(false)}
          onSuccess={() => {
            fetchData();
            setSuccessMsg("Province berhasil diperbarui");
          }}
        />
      )}

      {showEdit && activeTab === "area" && selected && (
        <AreaEditModal
          open={showEdit}
          area={selected}
          onClose={() => setShowEdit(false)}
          onSuccess={() => {
            fetchData();
            setSuccessMsg("Area berhasil diperbarui");
          }}
        />
      )}

      {/* DELETE */}
      {showDelete && (
        <ConfirmDeleteModal
          open={showDelete}
          onCancel={() => setShowDelete(false)}
          onConfirm={
            activeTab === "province"
              ? handleDeleteProvince
              : handleDeleteArea
          } title="Delete Province"
          description={`Yakin ingin menghapus province "${selected?.name}"?`}
        />
      )}
    </div>
  );
};

export default AreaProvinceManagement;
