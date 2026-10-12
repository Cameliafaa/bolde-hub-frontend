import React, { useEffect, useState } from "react";
import { ApiRequest } from "../../../services/apiRequest";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import CommentComposer from "./commentComposer";

const RequestComments = ({ requestId, onSuccess }) => {
    const [profile, setProfile] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const editor = useEditor({
        extensions: [StarterKit, Underline],
        content: "",
    });

    const fetchProfile = async () => {
        try {
            const res = await ApiRequest({
                url: "/profile/me",
                method: "GET",
            });

            // 🔥 BENAR
            setProfile(res.data);
        } catch (err) {
            console.error("fetchProfile error", err);
        }
    };

    const submitComment = async () => {
        if (!editor || !profile) return;

        const text = editor.getText().trim();
        const html = editor.getHTML().trim();

        // ❗ validasi aman
        if (!text && files.length === 0) return;

        setSending(true);

        try {
            const fd = new FormData();

            // 🔥 backend butuh comment TIDAK BOLEH KOSONG
            fd.append("comment", text || "-");
            fd.append("comment_html", html);

            files.forEach((f) => fd.append("images[]", f));

            await ApiRequest({
                url: `/requests/${requestId}/comments`,
                method: "POST",
                data: fd,
                isFormData: true,
            });

            editor.commands.clearContent();
            setFiles([]);
            onSuccess?.();
        } catch (err) {
            console.error(
                "SEND COMMENT ERROR:",
                err?.response?.data || err
            );
        } finally {
            setSending(false);
        }
    };

    useEffect(() => {
        fetchProfile().finally(() => setLoading(false));
    }, [requestId]);

    return (
        <div className="mt-8">
            {/* <h3 className="font-semibold mb-4">Comments</h3> */}

            {/* LOADING */}
            {loading && (
                <p className="text-sm text-gray-400">Loading comments...</p>
            )}

            {/* PROFILE BELUM ADA */}
            {!loading && !profile && (
                <p className="text-sm text-gray-400">Loading profile...</p>
            )}

            {/* EDITOR BELUM READY */}
            {!loading && profile && !editor && (
                <p className="text-sm text-gray-400">Preparing editor...</p>
            )}

            {/* ✅ COMPOSER */}
            {!loading && profile && editor && (
                <CommentComposer
                    editor={editor}
                    user={profile}
                    onSubmit={submitComment}
                    submitting={sending}
                    files={files}
                    setFiles={setFiles}
                />
            )}
        </div>
    );
};

export default RequestComments;
