import React, { useEffect, useMemo, useState } from "react";
import { X, Users, ClipboardList } from "lucide-react";
import MultiSelectDropdown from "../common/multiSelectDropdown";
import CustomDropdown from "../common/customDropdown";
import { fetchAllUsers } from "../../services/users/userService";
import { ApiRequest } from "../../services/apiRequest";

const categoryOptions = [
  { id: 1, name: "General" },
  { id: 2, name: "Advertising" },
  { id: 3, name: "Campaign" },
  { id: 4, name: "Branding" },
  { id: 5, name: "Internal" },
  { id: 6, name: "Event" },
];

const priorityOptions = [
  { id: "high", name: "High" },
  { id: "medium", name: "Medium" },
  { id: "low", name: "Low" },
];

const DIVISION_GROUPS = [
  {
    id: "event_activation",
    name: "Event Activation",
    roleIds: [35, 48, 49],
  },
  {
    id: "product_marketing",
    name: "Product Marketing",
    roleIds: [34, 47, 50],
  },
  {
    id: "digital_marketing",
    name: "Digital Marketing",
    roleIds: [33, 46, 51],
  },
];

const getUserLabel = (user) => {
  return user?.name || user?.full_name || user?.username || `User #${user?.id}`;
};

export default function CreateTaskModal({
  form,
  setForm,
  onClose,
  onSubmit,
  currentRole,
  mode = "create",
}) {
  const [assignUserOptions, setAssignUserOptions] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [division, setDivision] = useState(null);

  const fieldClass =
    "w-full p-4 text-sm bg-white border border-gray-200 shadow-sm outline-none rounded-2xl text-slate-800 placeholder:text-gray-400 focus:border-[#0B3A78]";
  const labelClass = "block mb-2 font-semibold text-gray-600";

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoadingUsers(true);

      const users = await fetchAllUsers();

      const mapped = users
        .filter((user) => user.is_active)
        .map((user) => ({
          id: user.user_id,
          user_id: user.user_id,
          name: user.full_name || user.username || `User #${user.user_id}`,
          role_id: user.role_id,
          role: user?.role?.name || user?.user_roles?.name || "-",
          image: user.image_url,
        }));

      setAssignUserOptions(mapped);
    } catch (err) {
      console.error("Failed load users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  const selectedCategory = useMemo(() => {
    return (
      categoryOptions.find(
        (item) => Number(item.id) === Number(form.category_id),
      ) || { id: "" }
    );
  }, [form.category_id]);

  const selectedPriority = useMemo(() => {
    return (
      priorityOptions.find(
        (item) => item.id === String(form.priority || "").toLowerCase(),
      ) || { id: "" }
    );
  }, [form.priority]);

  const divisionOptions = useMemo(() => {
    return DIVISION_GROUPS.map((division) => ({
      id: division.id,
      name: division.name,
      roleIds: division.roleIds,
    }));
  }, []);

  const filteredAssignUserOptions = useMemo(() => {
    if (!division?.roleIds?.length) return [];

    return assignUserOptions.filter((user) =>
      division.roleIds.map(Number).includes(Number(user.role_id)),
    );
  }, [assignUserOptions, division]);

  const resetAssignedUsers = () => {
    setForm((prev) => ({
      ...prev,
      pic: [],
      user_jobs: [],
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleChangeAssignedUsers = (selectedUsers) => {
    setForm((prev) => {
      const existingJobs = Array.isArray(prev.user_jobs) ? prev.user_jobs : [];

      const nextJobs = selectedUsers.map((user) => {
        const userId = Number(user.id || user.user_id);

        const existing = existingJobs.find(
          (job) => Number(job.user_id) === userId,
        );

        if (existing) return existing;

        return {
          user_id: userId,
          title: `Pekerjaan ${getUserLabel(user)}`,
          description:
            prev.target_action || prev.description || prev.objective || "",
        };
      });

      return {
        ...prev,
        pic: selectedUsers,
        user_jobs: nextJobs,
      };
    });
  };

  const updateUserJob = (userId, key, value) => {
    setForm((prev) => ({
      ...prev,
      user_jobs: (prev.user_jobs || []).map((job) =>
        Number(job.user_id) === Number(userId)
          ? {
              ...job,
              [key]: value,
            }
          : job,
      ),
    }));
  };

  const modalTitle =
    mode === "edit"
      ? "Edit Tugas"
      : currentRole === "staff"
        ? "Ajukan Tugas"
        : "Buat Tugas";

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-[9999] bg-slate-950/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl overflow-y-auto bg-white shadow-2xl max-h-[90vh] rounded-[32px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 px-6 py-5 bg-white border-b border-slate-100">
          <div>
            <h2 className="text-2xl font-extrabold text-[#0B3A78]">
              {modalTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="p-5 border rounded-[28px] border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-12 h-12 text-white rounded-2xl bg-gradient-to-br from-[#0B3A78] to-[#2E90FA]">
                <ClipboardList size={22} />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Detail Tugas
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <CustomDropdown
                label="Kategori Tugas"
                placeholder="Pilih Kategori"
                value={selectedCategory}
                onChange={(selected) => {
                  setForm((prev) => ({
                    ...prev,
                    category_id: Number(selected.id) || 1,
                  }));
                }}
                options={categoryOptions}
                searchable
                searchOnField
              />

              <div>
                <label className={labelClass}>Nama Tugas</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Contoh: Branding Pilar dan Rak Display"
                  className={fieldClass}
                />
              </div>

              <CustomDropdown
                label="Prioritas"
                placeholder="Pilih Prioritas"
                value={selectedPriority}
                onChange={(selected) => {
                  setForm((prev) => ({
                    ...prev,
                    priority: selected.id,
                  }));
                }}
                options={priorityOptions}
                searchable
                searchOnField
              />

              <CustomDropdown
                label="Division"
                placeholder="Pilih Division"
                value={division}
                onChange={(selected) => {
                  setDivision(selected);
                  resetAssignedUsers();
                }}
                options={divisionOptions}
                searchable
                searchOnField
                clearable
                onClear={() => {
                  setDivision(null);
                  resetAssignedUsers();
                }}
              />

              <MultiSelectDropdown
                label="Ditugaskan Kepada"
                placeholder={
                  division ? "Pilih Karyawan" : "Pilih Division dulu"
                }
                values={Array.isArray(form.pic) ? form.pic : []}
                onChange={handleChangeAssignedUsers}
                options={filteredAssignUserOptions}
                loading={loadingUsers}
                disabled={!division}
                searchable
              />

              <div>
                <label className={labelClass}>Tanggal Mulai</label>
                <input
                  type="date"
                  name="start_date"
                  value={form.start_date}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>

              <div>
                <label className={labelClass}>Tanggal Selesai</label>
                <input
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleChange}
                  className={fieldClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Tujuan Tugas</label>

                <textarea
                  name="objective"
                  value={form.objective}
                  onChange={handleChange}
                  placeholder="Jelaskan tujuan utama tugas..."
                  rows={2}
                  className={`${fieldClass} resize-none`}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Target Pekerjaan</label>

                <textarea
                  name="target_action"
                  value={form.target_action}
                  onChange={handleChange}
                  placeholder="Jelaskan target atau hasil yang diharapkan..."
                  rows={2}
                  className={`${fieldClass} resize-none`}
                />
              </div>

              <div className="md:col-span-2">
                <label className={labelClass}>Deskripsi Tugas</label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Tambahkan detail tugas..."
                  rows={2}
                  className={`${fieldClass} resize-none`}
                />
              </div>
            </div>
          </div>

          <div className="p-5 mt-5 bg-white border rounded-[28px] border-slate-200">
            <div className="flex items-center gap-3 mb-5">
              <div className="flex items-center justify-center w-12 h-12 text-white rounded-2xl bg-gradient-to-br from-[#16A34A] to-[#4ADE80]">
                <Users size={22} />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Pembagian Pekerjaan
                </h3>
              </div>
            </div>

            {form.user_jobs?.length > 0 ? (
              <div className="space-y-4">
                {form.user_jobs.map((job) => {
                  const user = form.pic?.find(
                    (item) =>
                      Number(item.id || item.user_id) === Number(job.user_id),
                  );

                  return (
                    <div
                      key={job.user_id}
                      className="p-4 border rounded-3xl border-slate-200 bg-slate-50"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <div>
                          <p className="text-sm font-extrabold text-slate-900">
                            {getUserLabel(user)}
                          </p>
                          <p className="text-xs text-slate-400">
                            user_id: {job.user_id}
                          </p>
                        </div>

                        <span className="px-3 py-1 text-xs font-bold text-green-700 rounded-full bg-green-50">
                          Ditugaskan
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <div>
                          <label className="block mb-2 text-xs font-bold uppercase text-slate-400">
                            Nama Pekerjaan
                          </label>

                          <input
                            value={job.title || ""}
                            onChange={(e) =>
                              updateUserJob(
                                job.user_id,
                                "title",
                                e.target.value,
                              )
                            }
                            placeholder="Contoh: Membuat Desain Branding"
                            className={fieldClass}
                          />
                        </div>

                        <div>
                          <label className="block mb-2 text-xs font-bold uppercase text-slate-400">
                            Deskripsi Pekerjaan
                          </label>

                          <textarea
                            value={job.description || ""}
                            onChange={(e) =>
                              updateUserJob(
                                job.user_id,
                                "description",
                                e.target.value,
                              )
                            }
                            rows={2}
                            placeholder="Jelaskan tanggung jawab karyawan..."
                            className={`${fieldClass} resize-none`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-10 text-sm text-center rounded-3xl bg-slate-50 text-slate-400">
                Pilih anggota tim terlebih dahulu untuk menentukan pembagian
                pekerjaan.
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-5 mt-6 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 text-sm font-bold border rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={onSubmit}
              className="px-5 py-3 text-sm font-bold text-white rounded-2xl bg-[#0B3A78] hover:bg-[#1357B7]"
            >
              {mode === "edit" ? "Perbarui Tugas" : "Simpan Tugas"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
