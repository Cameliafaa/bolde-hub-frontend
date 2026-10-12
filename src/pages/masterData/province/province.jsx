import EditIcon from "../../../assets/images/icons/editIcon.png";
import DeleteIcon from "../../../assets/images/icons/deleteIcon.png";
import DetailIcon from "../../../assets/images/icons/detailIcon.png"


const ProvinceManagement = ({
  provinces = [],
  loading = false,
  onEdit,
  onDelete,
  onDetail,
  page = 1,
  limit = 10
}) => {
  return (
    <div>
      <div className="hidden sm:block bg-white rounded-3xl shadow-md overflow-auto border border-gray-100">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-[#E9EEF6]">
            <tr>
              <th className="px-4 py-3">No</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Province</th>
              <th className="px-4 py-3 text-center">Allocation (%)</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-10">Loading...</td>
              </tr>
            ) : provinces.length ? (
              provinces.map((p, i) => (
                <tr key={p.province_id} className="border-t">
                  <td className="px-6 py-3 text-center align-middle">
                    {(page - 1) * limit + i + 1}
                  </td>
                  <td className="px-4 py-3">{p.province_code}</td>
                  <td className="px-4 py-3">{p.name}</td>
                  <td className="px-4 py-3 text-center font-medium text-[#002D62]">
                    {p.allocation_percent ?? 0}%
                  </td>
                  <td className="px-4 py-3 text-center">
                    {/* <button onClick={() => onDetail(p)}>
                      <img src={DetailIcon} className="w-5 inline mr-3" />
                    </button> */}
                    <button onClick={() => onEdit(p)}>
                      <img src={EditIcon} className="w-5 inline mr-3" />
                    </button>
                    <button onClick={() => onDelete(p)}>
                      <img src={DeleteIcon} className="w-5 inline" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-10 text-gray-400">
                  No Province Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden space-y-4">
        {loading ? (
          <p className="text-center text-gray-400 py-10">Loading...</p>
        ) : provinces.length ? (
          provinces.map((p, i) => (
            <div
              key={p.province_id}
              className="bg-white rounded-2xl border shadow-sm p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs text-gray-400">
                  #{(page - 1) * limit + i + 1}
                </p>

                <div className="flex gap-3">
                  {/* <button onClick={() => onDetail(p)}>
                    <img src={DetailIcon} className="w-5 h-5" />
                  </button> */}
                  <button onClick={() => onEdit(p)}>
                    <img src={EditIcon} className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(p)}>
                    <img src={DeleteIcon} className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="font-semibold text-[#002D62]">
                {p.name}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Code: {p.province_code}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                Allocation: {p.allocation_percent ?? 0}%
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 py-10">
            No Province Found
          </p>
        )}
      </div>

    </div>
  );
};

export default ProvinceManagement;
