import { EditorContent } from "@tiptap/react";
import { AtSign, Paperclip, X } from "lucide-react";
import { useRef, useState } from "react";

const CommentComposer = ({
    editor,
    user,
    onSubmit,
    submitting,
    files = [],
    setFiles,
}) => {
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);


    const avatar =
        user?.image_url ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user?.full_name || "User"
        )}`;

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index));
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles((prev) => [...prev, ...droppedFiles]);
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };
    

    return (
        <div className="mt-8">
            {/* HEADER */}
            <div className="flex items-center gap-3 mb-3">
                <img src={avatar} className="w-10 h-10 rounded-full object-cover" />
                <p className="font-semibold text-gray-900">
                    {user?.full_name || "User"}
                </p>
            </div>

            {/* BOX */}
            <div
                onClick={() => editor.chain().focus().run()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="
    border border-gray-200 rounded-2xl
    p-4 bg-white
    cursor-text
    transition
    hover:border-[#002D62]
  "
            >
                {/* EDITOR */}
                <EditorContent
                    editor={editor}
                    className="
    min-h-[120px]
    text-sm text-gray-800
    prose-mirror-reset
    outline-none
    focus:outline-none
    focus-visible:outline-none
    focus-visible:ring-0
  "
                />

                {/* ATTACH PREVIEW */}
                {files.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-3">
                        {files.map((file, i) => {
                            const isImage = file.type.startsWith("image/");
                            const previewUrl = isImage
                                ? URL.createObjectURL(file)
                                : null;
                            return (
                        <div
                            key={i}
                            className="relative group border rounded-xl overflow-hidden
                     bg-gray-50 flex items-center"
                        >
                            {/* IMAGE PREVIEW */}
                            {isImage ? (
                                <img
                                    src={previewUrl}
                                    alt={file.name}
                                    className="w-28 h-20 object-cover"
                                    onLoad={() => URL.revokeObjectURL(previewUrl)}
                                />
                            ) : (
                                <div className="px-4 py-2 max-w-[180px] truncate text-sm">
                                    {file.name}
                                </div>
                            )}

                            {/* REMOVE */}
                            <button
                                onClick={() => removeFile(i)}
                                className="absolute top-1 right-1
                       bg-white rounded-full p-1
                       shadow hover:bg-gray-100"
                            >
                                <X size={14} />
                            </button>
                        </div>
                        );
                        })}
                    </div>
                )}

                {/* FOOTER */}
                <div className="flex justify-between items-center mt-4">
                    {/* TOOLBAR */}
                    <div className="flex gap-4 text-gray-500 items-center">
                        <AtSign size={18} />

                        {/* ATTACH */}
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="hover:text-black"
                        >
                            <Paperclip size={18} />
                        </button>

                        <button
                            onClick={() => editor.chain().focus().toggleBold().run()}
                            className="font-bold"
                        >
                            B
                        </button>

                        <button
                            onClick={() => editor.chain().focus().toggleItalic().run()}
                            className="italic"
                        >
                            I
                        </button>

                        <button
                            onClick={() => editor.chain().focus().toggleUnderline().run()}
                            className="underline"
                        >
                            U
                        </button>

                        {/* HIDDEN INPUT */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            hidden
                            onChange={(e) =>
                                setFiles((prev) => [...prev, ...Array.from(e.target.files)])
                            }
                        />
                    </div>

                    {/* ACTION */}
                    <button
                        onClick={onSubmit}
                        disabled={submitting}
                        className="bg-[#002D62]
                       text-white px-6 py-2 rounded-full
                       text-sm font-semibold"
                    >
                        {submitting ? "Sending..." : "Send"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommentComposer;
