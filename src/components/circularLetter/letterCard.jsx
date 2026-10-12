import React from "react";
import { useNavigate } from "react-router-dom";

const LetterCard = ({ id, skuName, terms, typeName, productCategoryName }) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4 p-4 transition border shadow-sm bg-surface-card border-surface-border rounded-2xl hover:shadow-md sm:p-5 lg:flex-row lg:items-center lg:justify-between">
      {/* ================= LEFT CONTENT ================= */}
      <div className="flex flex-col gap-3 text-sm  text-text-primary lg:grid lg:grid-cols-[0.75fr_0.9fr_1.25fr_1.55fr] lg:gap-4 lg:flex-1">
        {" "}
        {/* Product Category */}
        <div className="min-w-0">
          <p className="mb-1 text-xs text-text-light">Product Category</p>

          <p className="font-medium truncate">{productCategoryName || "-"}</p>
        </div>
        {/* Category */}
        <div className="min-w-0">
          <p className="mb-1 text-xs text-text-light">Category</p>

          <p className="font-medium truncate">{typeName || "-"}</p>
        </div>
        {/* SKU */}
        <div className="min-w-0">
          <p className="mb-1 text-xs text-text-light">SKU Name</p>

          <p className="font-medium leading-snug line-clamp-2 min-h-[40px]">
            {skuName || "-"}
          </p>
        </div>
        {/* Terms */}
        <div className="min-w-0">
          <p className="mb-1 text-xs text-text-light">Terms & Conditions</p>

          <p className="font-medium leading-snug text-text-secondary line-clamp-2 min-h-[40px]">
            {terms || "-"}
          </p>
        </div>
      </div>

      {/* ================= BUTTON ================= */}
      <div className="w-full shrink-0 lg:w-auto">
        <button
          onClick={() => navigate(`/circular/${id}`)}
          className="w-full px-5 py-2 text-xs font-semibold text-white transition shadow-sm lg:w-auto bg-brand-first hover:bg-brand-secondary sm:text-sm rounded-xl"
        >
          View Detail
        </button>
      </div>
    </div>
  );
};

export default LetterCard;
