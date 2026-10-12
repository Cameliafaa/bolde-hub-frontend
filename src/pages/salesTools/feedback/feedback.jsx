import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Feedback = () => {
    const navigate = useNavigate();
    const [rating, setRating] = useState(0);
    const [hover, setHover] = useState(0);
    const [name, setName] = useState("John Carter");
    const [area, setArea] = useState("Area Sales");
    const [message, setMessage] = useState("");

    const stars = [1, 2, 3, 4, 5];

    const handleSubmit = () => {
        alert("Feedback submitted!\nName: " + name + "\nRating: " + rating);
    };

    return (
        <div>
            {/* Back button */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#0F4C81] transition mb-6"
            >
                <ArrowLeft size={16} /> Back to detail
            </button>

            {/* Breadcrumb */}
            <h2 className="text-lg text-gray-500 mb-6">
                <span className="text-[#002D62] font-semibold">Sales Tools KIT</span> ›{" "}
                <span className="text-[#002D62] font-bold">Feedback</span>
            </h2>

            {/* White Card */}
            <div className="bg-white rounded-3xl shadow-lg p-10 max-w-6xl">

                {/* NAME + AREA */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                        <label className="text-sm font-semibold text-gray-700">
                            Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full mt-1 px-4 py-3 border rounded-xl outline-none text-sm 
              focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-semibold text-gray-700">
                            Area
                        </label>
                        <input
                            type="text"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            className="w-full mt-1 px-4 py-3 border rounded-xl outline-none text-sm bg-gray-50 text-gray-500"
                            disabled
                        />
                    </div>
                </div>

                {/* Rating */}
                <div className="mb-8">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Your service rating
                    </label>

                    <div className="flex items-center gap-1">
                        {stars.map((star) => (
                            <svg
                                key={star}
                                onClick={() => setRating(star)}
                                onMouseEnter={() => setHover(star)}
                                onMouseLeave={() => setHover(0)}
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill={(hover || rating) >= star ? "#F7C948" : "#E5E7EB"}
                                className="w-8 h-8 cursor-pointer transition-all"
                            >
                                <path d="M12 17.27L18.18 21 16.54 13.97 22 9.24l-7.19-.62L12 2 9.19 8.62 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                        ))}
                    </div>
                </div>

                {/* Feedback box */}
                <div className="mb-10">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">
                        Additional feedback
                    </label>

                    <textarea
                        placeholder="If you have more to add, please type it here..."
                        className="w-full h-32 p-4 text-sm border rounded-xl outline-none 
                                    focus:ring-2 focus:ring-[#0F4C81] focus:border-transparent"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSubmit}
                        className="bg-gradient-to-b from-[#0F4C81] to-[#09345B] text-white 
                                    px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition font-semibold"
                    >
                        Submit feedback
                    </button>
                </div>

            </div>
        </div>
    );
};

export default Feedback;
