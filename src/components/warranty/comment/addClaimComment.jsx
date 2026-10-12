import React, { useEffect, useState } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import CommentComposer from "../../requestToMarketing/comment/commentComposer";
import { ApiRequest } from "../../../services/apiRequest";

const ClaimComments = ({ onSuccess, claimId }) => {
  const [profile, setProfile] = useState(null);
  const [files, setFiles] = useState([]);
  const [sending, setSending] = useState(false);

  const editor = useEditor({
    extensions: [StarterKit, Underline],
    content: "",
  });

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await ApiRequest({
        url: "/profile/me",
        method: "GET",
      });

      if (res?.status !== "success") return;

      const u = res.data;

      setProfile({
        user_id: u.user_id,
        full_name: u.full_name || u.username || "User",
        image_url:
          u.image_url ||
          `https://ui-avatars.com/api/?name=${u.full_name || u.username}`,
      });
    } catch (err) {
      console.error("Failed fetch profile:", err);
    }
  };

  fetchProfile();
}, []);

  /* ================= SUBMIT (DUMMY) ================= */

  const submitComment = async () => {
    if (!editor || !profile) return;

    const text = editor.getText();
    if (!text.trim() && files.length === 0) return;

    setSending(true);

    try {
      const formData = new FormData();

      // TEXT COMMENT
      formData.append("comment", editor.getHTML());

      // MULTIPLE IMAGES (key harus sama: images)
      files.forEach((file) => {
        formData.append("images", file);
      });

      const res = await ApiRequest({
        url: `/warranty-claims/${claimId}/comments`,
        method: "POST",
        data: formData,
        isFormData: true, // 🔥 PENTING
      });

      if (res?.status !== "success") {
        throw new Error("Failed submit comment");
      }

      // RESET UI
      editor.commands.clearContent();
      setFiles([]);

      // REFRESH HISTORY
      onSuccess?.({
        user: profile,
        comment_html: editor.getHTML(),
        images: res.data?.images || [],
        created_at: new Date().toISOString(),
      });
    } catch (err) {
      console.error("Submit comment error:", err);
      alert("Gagal mengirim komentar");
    } finally {
      setSending(false);
    }
  };

  if (!profile || !editor) {
    return (
      <p className="text-sm text-gray-400 mt-6">
        Preparing comment editor...
      </p>
    );
  }

  return (
    <CommentComposer
      editor={editor}
      user={profile}
      onSubmit={submitComment}
      submitting={sending}
      files={files}
      setFiles={setFiles}
    />
  );
};

export default ClaimComments;
