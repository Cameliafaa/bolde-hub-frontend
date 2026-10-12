import React, { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import EditIcon from "../../assets/images/icons/editIcon.png";
import DeleteIcon from "../../assets/images/icons/deleteIcon.png";
import { ApiRequest } from "../../services/apiRequest";
import usePermission from "../../utils/usePermission";

const Certificate = () => {
  const BASE_URL = process.env.REACT_APP_API_BASE_URL;
  const [search, setSearch] = useState("");
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);

  const { can_create, can_delete, can_update } = usePermission();

  const formatDate = (isoString) => {
    if (!isoString || isoString === "0001-01-01T00:00:00Z") return "-";

    const date = new Date(isoString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}.${minutes}`;
  };

  const fetchCertificate = async () => {
    setLoading(true);
    try {
      const res = await ApiRequest({
        url: "/certificates/all",
        method: "GET",
      });

      if (res.status === "success" && Array.isArray(res.data)) {
        const formatted = res.data.map((item) => ({
          id: item.certificate_id,
          name: item.development?.title,
          certificateCode: item.certificate_code || "-",
          image: item.certificate_url,
          createdAt: formatDate(item.created_at),
          updateAt: formatDate(item.updated_at),
        }));
        setCertificates(formatted);
      } else {
        setCertificates([]);
      }
    } catch (err) {
      console.error("Gagal memuat data posisi:", err.message);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificate();
  }, []);

  const filtered = certificates.filter(
    (item) =>
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.certificateCode.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div
      className="w-full px-4 mx-auto  max-w-[1400px] /* HP */ sm:px-4 tablet lg:px-4 laptop xl:px-4 desktop besar 2xl:px-4 layar"
    >
      <h1 className="mb-6 text-2xl font-bold text-[#002D62]">Certificate</h1>

      <div
        className="flex flex-col gap-4 mb-6  sm:flex-row sm:justify-between sm:items-center"
      >
        <div
          className="flex items-center w-full px-4 py-2 bg-white shadow-sm  rounded-xl sm:w-1/2 lg:w-1/3"
        >
          <Search size={18} className="mr-2 text-gray-400" />
          <input
            type="text"
            placeholder="Position Search"
            className="w-full text-sm text-gray-700 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {can_create && (
          <button className="flex items-center gap-2 px-5 font-medium text-white transition rounded-lg shadow bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] py-2.5 hover:shadow-md">
            <Plus size={16} /> Add Position
          </button>
        )}
      </div>

      <div className="hidden overflow-hidden bg-white border border-blue-200 shadow-sm sm:block rounded-2xl">
        <table className="min-w-full text-sm">
          <thead className="text-left text-gray-700 bg-gray-100">
            <tr>
              <th className="px-6 py-3 font-medium">No</th>
              <th className="px-6 py-3 font-medium">Certficate Name</th>
              <th className="px-6 py-3 font-medium">Certficate Code</th>
              <th className="px-6 py-3 font-medium">Image</th>
              <th className="px-6 py-3 font-medium">Create At</th>
              <th className="px-6 py-3 font-medium">Update At</th>
              <th className="px-6 py-3 font-medium text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={7}
                  className="py-6 italic text-center text-gray-400 animate-pulse"
                >
                  Loading Certificate...
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((item, i) => (
                <tr key={item.id} className="border-t hover:bg-gray-50">
                  <td className="px-6 py-3">{i + 1}</td>
                  <td className="px-6 py-3 font-medium">{item.name}</td>
                  <td className="px-6 py-3 font-medium">
                    {item.certificateCode}
                  </td>
                  <td className="px-6 py-3 font-medium">
                    {item.image.endsWith(".pdf") ? (
                      <a
                        href={item.image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline hover:text-blue-800"
                      >
                        Preview PDF
                      </a>
                    ) : (
                      <img
                        src={item.image}
                        className="object-cover w-16 h-16"
                      />
                    )}
                  </td>
                  <td className="px-6 py-3">{item.createAt}</td>
                  <td className="px-6 py-3">{item.updateAt}</td>
                  <td className="flex justify-center gap-3 px-6 py-3 text-center">
                    {can_update && (
                      <button className="text-blue-600 hover:text-blue-800">
                        <img
                          src={EditIcon}
                          alt="edit"
                          className="object-contain w-5 h-5"
                        />
                      </button>
                    )}
                    {can_delete && (
                      <button className="text-red-600 hover:text-red-800">
                        <img
                          src={DeleteIcon}
                          alt="delete"
                          className="object-contain w-5 h-5"
                        />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="py-6 italic text-center text-gray-400"
                >
                  No certificate data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-4 sm:hidden">
        {loading ? (
          <p className="py-10 text-center text-gray-400">
            Loading Certificate...
          </p>
        ) : filtered.length ? (
          filtered.map((item, i) => (
            <div
              key={item.id}
              className="p-4 bg-white border shadow-sm rounded-2xl"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-gray-400">#{i + 1}</p>

                <div className="flex gap-3">
                  {can_update && (
                    <button>
                      <img src={EditIcon} className="w-4 h-4" />
                    </button>
                  )}
                  {can_delete && (
                    <button>
                      <img src={DeleteIcon} className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="font-semibold text-[#002D62]">{item.name}</p>

              <p className="mt-1 text-xs text-gray-500">
                Code: {item.certificateCode}
              </p>

              <div className="mt-3">
                {item.image?.endsWith(".pdf") ? (
                  <a
                    href={item.image}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 underline"
                  >
                    Preview PDF
                  </a>
                ) : (
                  <img
                    src={item.image}
                    className="object-cover w-full h-40 rounded-lg"
                  />
                )}
              </div>

              <p className="mt-3 text-xs text-gray-400">
                Created: {item.createdAt}
              </p>
              <p className="text-xs text-gray-400">Updated: {item.updateAt}</p>
            </div>
          ))
        ) : (
          <p className="py-10 text-center text-gray-400">
            No certificate data found
          </p>
        )}
      </div>
    </div>
  );
};

export default Certificate;
