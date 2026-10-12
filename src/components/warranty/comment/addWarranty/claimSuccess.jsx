import React, { useEffect, useState } from "react";

const ClaimSuccess = ({ onClose }) => (
  <div className="text-center py-20">
    <h2 className="text-2xl font-semibold mb-4">
      Claim berhasil dikirim 🎉
    </h2>
    <p className="text-gray-500 mb-8">
      Tim kami akan segera memproses klaim Anda
    </p>
    <button onClick={onClose} className="bg-[#002D62] text-white px-8 py-3 rounded-xl">
      Close
    </button>
  </div>
);

export default ClaimSuccess;
