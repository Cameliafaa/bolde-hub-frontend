import EditIcon from "../../../assets/images/icons/editIcon.png";
import DeleteIcon from "../../../assets/images/icons/deleteIcon.png";

const CategoryManagement = ({ categories, loading, onEdit, onDelete }) => {
  return (
    <div>
      <div className="hidden sm:block bg-white rounded-3xl shadow-md overflow-auto border border-gray-100">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-[#E9EEF6]">
            <tr>
              <th className="px-4 py-3">No</th>
              <th className="px-4 py-3">Code</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Description</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-10">Loading...</td>
              </tr>
            ) : categories.length ? (
              categories.map((c, i) => (
                <tr key={c.category_id} className="border-t">
                  <td className="px-4 py-3 text-center">{i + 1}</td>
                  <td className="px-4 py-3">{c.category_code}</td>
                  <td className="px-4 py-3">{c.category_name}</td>
                  <td className="px-4 py-3">{c.description || "-"}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => onEdit(c)}>
                      <img src={EditIcon} className="w-5 inline mr-3" />
                    </button>
                    <button onClick={() => onDelete(c)}>
                      <img src={DeleteIcon} className="w-5 inline" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-10 text-gray-400">
                  No Category Found
                </td>
              </tr>
            )}
          </tbody>
        </table>


      </div>
      <div className="sm:hidden space-y-4">
        {loading ? (
          <p className="text-center text-gray-400 py-10">Loading...</p>
        ) : categories.length ? (
          categories.map((c, i) => (
            <div
              key={c.category_id}
              className="bg-white rounded-2xl border shadow-sm p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs text-gray-400">#{i + 1}</p>

                <div className="flex gap-3">
                  <button onClick={() => onEdit(c)}>
                    <img src={EditIcon} className="w-4 h-4" />
                  </button>
                  <button onClick={() => onDelete(c)}>
                    <img src={DeleteIcon} className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="font-semibold text-[#002D62] mb-1">
                {c.category_name}
              </p>

              <p className="text-xs text-gray-500">
                Code: {c.category_code}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {c.description || "-"}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-400 py-10">
            No Category Found
          </p>
        )}
      </div>
    </div>
  );
};

export default CategoryManagement;
