import React, { useState } from "react";
import { X } from "lucide-react";

const CommentHistory = ({ comments = [], creator, usersMap = {} }) => {
  const [previewImage, setPreviewImage] = useState(null);

  const formatDateTime = (date) => {
    if (!date) return "-";

    const d = new Date(date);

    return new Intl.DateTimeFormat("id-ID", {
      timeZone: "UTC",
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  };

  const getCommentUser = (comment) => {
    const userId =
      comment.user_id ||
      comment.created_by ||
      comment.updated_by ||
      comment.user?.user_id;

    return (
      usersMap[String(userId)] || {
        name:
          comment.user?.full_name ||
          comment.user?.name ||
          comment.full_name ||
          comment.created_by_name ||
          "Unknown User",
        avatar:
          comment.user?.image_url ||
          comment.user?.avatar ||
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            comment.user?.full_name ||
              comment.user?.name ||
              comment.full_name ||
              "User",
          )}`,
      }
    );
  };

  const getCommentUserDetail = (comment, mappedUser) => {
    return {
      name:
        mappedUser?.name ||
        comment.user?.full_name ||
        comment.user?.name ||
        "Unknown User",

      avatar:
        mappedUser?.avatar ||
        comment.user?.image_url ||
        comment.user?.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          mappedUser?.name || comment.user?.full_name || "User",
        )}`,

      position:
        mappedUser?.position ||
        mappedUser?.position_name ||
        mappedUser?.role_name ||
        comment.user?.position_name ||
        comment.user?.position ||
        comment.user?.role_name ||
        comment.user?.role ||
        comment.position_name ||
        comment.role_name ||
        "",

      area:
        mappedUser?.areaName ||
        mappedUser?.area_name ||
        comment.user?.area_name ||
        comment.area_name ||
        "",

      province:
        mappedUser?.provinceName ||
        mappedUser?.province_name ||
        comment.user?.province_name ||
        comment.province_name ||
        "",

      channel:
        mappedUser?.channelName ||
        mappedUser?.channel_name ||
        comment.user?.channel_name ||
        comment.channel_name ||
        "",

      store:
        mappedUser?.storeName ||
        mappedUser?.store_name ||
        comment.user?.store_name ||
        comment.store_name ||
        "",
    };
  };

  const renderMetaLine = (...items) => {
    const text = items.filter((item) => item && item !== "-").join(" • ");
    if (!text) return null;

    return <p className="text-xs text-gray-400">{text}</p>;
  };

  return (
    <>
      <div className="mt-6 space-y-6">
        {/* DEFAULT HISTORY */}
        {creator && (
          <div className="flex gap-3">
            <img
              src={creator.image || "https://ui-avatars.com/api/?name=Unknown"}
              className="object-cover rounded-full w-9 h-9"
              alt={creator.name || "Creator"}
            />

            <div>
              <p className="text-sm font-semibold text-gray-800">
                {creator.name || "Unknown"}
              </p>

              {renderMetaLine(creator.positionName || creator.position)}
              {renderMetaLine(creator.areaName, creator.provinceName)}
              {renderMetaLine(creator.channelName, creator.storeName)}

              <p className="mt-1 text-sm text-gray-600">
                Telah menambahkan tugas baru
              </p>

              {creator.created_at && (
                <p className="mt-1 text-xs text-gray-400">
                  {formatDateTime(creator.created_at)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* NO COMMENT */}
        {(!Array.isArray(comments) || comments.length === 0) && (
          <p className="text-sm text-gray-400">Belum ada komentar</p>
        )}

        {/* COMMENT LIST */}
        {Array.isArray(comments) &&
          comments.map((c) => {
            const mappedUser = getCommentUser(c);
            const user = getCommentUserDetail(c, mappedUser);

            const commentDate =
              c.created_at || c.createdAt || c.updated_at || c.updatedAt;

            return (
              <div key={c.request_comment_id || c.id} className="flex gap-3">
                <img
                  src={user.avatar}
                  className="object-cover rounded-full w-9 h-9"
                  alt={user.name}
                />

                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    {user.name}
                  </p>

                  {renderMetaLine(user.position)}
                  {renderMetaLine(user.area, user.province)}
                  {renderMetaLine(user.channel, user.store)}

                  <div
                    className="mt-1 text-sm text-gray-700"
                    dangerouslySetInnerHTML={{
                      __html: c.comment_html || c.comment || "",
                    }}
                  />

                  {commentDate && (
                    <p className="mt-1 text-xs text-gray-400">
                      {formatDateTime(commentDate)}
                    </p>
                  )}

                  {Array.isArray(c.images) && c.images.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mt-3 sm:grid-cols-3">
                      {c.images.map((img) => {
                        const downloadUrl = `${process.env.REACT_APP_API_BASE_URL}/download?url=${encodeURIComponent(
                          img.image_url,
                        )}`;

                        return (
                          <div
                            key={img.request_comment_image_id}
                            className="relative overflow-hidden group rounded-xl"
                          >
                            <img
                              src={img.image_url}
                              className="object-cover w-full cursor-pointer aspect-square"
                              onClick={() => setPreviewImage(img.image_url)}
                              alt="Comment attachment"
                            />

                            <div className="absolute inset-0 flex items-center justify-center gap-3 transition opacity-0 bg-black/40 group-hover:opacity-100">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewImage(img.image_url);
                                }}
                                className="px-3 py-1 text-xs font-semibold text-black bg-white rounded-full"
                              >
                                Preview
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  window.location.href = downloadUrl;
                                }}
                                className="px-3 py-1 text-xs font-semibold text-white rounded-full bg-[#002D62]"
                              >
                                Download
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
      </div>

      {/* IMAGE PREVIEW */}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setPreviewImage(null)}
          />

          <div className="relative z-10 w-full max-w-4xl mx-4">
            <img
              src={previewImage}
              className="object-contain w-full bg-white max-h-[80vh] rounded-2xl"
              alt="Preview"
            />

            <button
              onClick={() => setPreviewImage(null)}
              className="absolute p-2 bg-white rounded-full shadow -top-4 -right-4 hover:bg-gray-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CommentHistory;
