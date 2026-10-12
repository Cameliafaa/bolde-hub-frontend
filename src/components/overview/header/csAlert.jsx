import React from "react";

const CSAlert = ({ variant = "mobile" }) => {
    if (variant === "mobile") {
        return (
            <div
                className="
      bg-brand-primary text-brand-first bg-opacity-40
          px-4 py-3
          rounded-xl border border-surface-border
          w-full text-center
        "
            >
                <div className="flex flex-col items-center gap-1">
                    <div className="flex items-center gap-2">
                        <span className="text-lg">📞</span>
                        <p className="text-xs font-medium">
                            Customer Service:
                            <a
                                href="https://wa.me/6281296033377"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold ml-1 hover:underline"
                            >
                                0812-9603-3377
                            </a>
                            <span> (Senin - Jumat)</span>
                        </p>
                    </div>
                    <span className="text-xs text-text-secondary">
                        (08.30 – 17.30 WIB)
                    </span>
                </div>
            </div>
        );
    }

    if (variant === "tablet") {
        return (
            <div
                className="
      bg-brand-primary text-brand-first bg-opacity-40
          px-4 sm:px-6 py-3
          rounded-xl border border-brand-border
          w-full sm:w-auto text-center
        "
            >
                <div className="flex items-center gap-2">
                    <span className="text-lg">📞</span>
                    <p className="text-xs sm:text-sm font-medium">
                        Customer Service:
                        <a
                            href="https://wa.me/6281296033377"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold ml-1 hover:underline"
                        >
                            0812-9603-3377
                        </a>
                        <span> (Senin - Jumat)</span>
                    </p>
                    <span className="text-xs text-brand-muted">
                        (08.30 – 17.30 WIB)
                    </span>
                </div>
            </div>
        );
    }

    // DESKTOP
    return (
        <div
            className="
      bg-brand-primary text-brand-first bg-opacity-40
      px-5 py-2.5
      rounded-xl border border-brand-border
      text-sm
      max-w-[520px]
      w-full
    "
        >
            <div className="flex items-center justify-center gap-2 flex-wrap">

                <span className="text-sm">📞</span>

                <span className="font-medium">
                    Customer Service:
                </span>

                <a
                    href="https://wa.me/6281296033377"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold hover:underline"
                >
                    0812-9603-3377
                </a>

                <span className="text-brand-muted">
                    (Senin–Jumat 08.30–17.30)
                </span>

            </div>
        </div>
    );
};

export default CSAlert;
