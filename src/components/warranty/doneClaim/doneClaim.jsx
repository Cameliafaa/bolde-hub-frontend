import { useState } from "react";
import DragDropImage from "../../common/dragImage";

const DoneClaimModal = ({ onClose, onSubmit }) => {
  const [note, setNote] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = () => {
    if (!note) {
      alert("Notes wajib diisi");
      return;
    }

    onSubmit({ note, image });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-lg rounded-2xl p-6 space-y-5">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-[#002D62]">
            Done Claim
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        {/* NOTE */}
        <div>
          <label className="text-gray-500 font-semibold mb-2 block">
            Notes
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border rounded-xl p-4 min-h-[100px]"
            placeholder="Masukkan catatan penyelesaian claim"
          />
        </div>

        {/* IMAGE */}
        <DragDropImage onChange={(file) => setImage(file)} />

        {/* ACTION */}
        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl bg-[#002D62] text-white"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoneClaimModal;