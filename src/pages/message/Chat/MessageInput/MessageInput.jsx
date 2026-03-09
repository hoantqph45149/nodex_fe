import { useQueryClient } from "@tanstack/react-query";
import { memo, useEffect, useRef, useState } from "react";
import { FiCalendar, FiPaperclip, FiSend, FiSmile } from "react-icons/fi";
import FilePreview from "./FilePreview";
import { useAttachments } from "../hook/useAttachments";
import EmojiPicker from "emoji-picker-react";

function MessageInput({
  handleSendMessage,
  replyingTo,
  setReplyingTo,
  socket,
  conversationId,
  authUser,
}) {
  const queryClient = useQueryClient();
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);
  const emojiRef = useRef(null); // ref cho popup emoji
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  const [showEmoji, setShowEmoji] = useState(false);

  const { attachments, addFiles, removeFile, setAttachments } =
    useAttachments();

  // click outside emoji -> đóng
  useEffect(() => {
    function handleClickOutside(e) {
      if (emojiRef.current && !emojiRef.current.contains(e.target)) {
        setShowEmoji(false);
      }
    }
    if (showEmoji) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmoji]);

  // focus input khi gõ phím
  useEffect(() => {
    const handleKeyDown = (e) => {
      const active = document.activeElement;
      if (
        active &&
        (active.tagName === "INPUT" || active.tagName === "TEXTAREA")
      )
        return;
      if (e.key.length === 1 || e.key === "Backspace")
        inputRef.current?.focus();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // paste file
  useEffect(() => {
    const handlePaste = (e) => {
      if (e.clipboardData?.files?.length) addFiles(e.clipboardData.files);
    };
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [addFiles]);

  // typing event
  useEffect(() => {
    if (!socket || !conversationId) return;
    if (isTyping) {
      socket.emit("typing", { conversationId, user: authUser });
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("stopTyping", { conversationId, user: authUser });
        setIsTyping(false);
      }, 2000);
    }
    return () => {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [isTyping, socket, conversationId, authUser]);

  const handleSend = () => {
    if (!newMessage.trim() && attachments.length === 0) return;
    const tempId = Date.now().toString();

    const optimisticMsg = {
      _id: tempId,
      senderId: authUser,
      content: newMessage.trim(),
      media: attachments.map((file) => ({
        url: URL.createObjectURL(file),
        fileName: file.name,
        type: file.type.startsWith("image")
          ? "image"
          : file.type.startsWith("video")
            ? "video"
            : "file",
        status: "uploading",
      })),
      createdAt: new Date().toISOString(),
      seender: authUser,
      seenBy: [],
      status: "uploading",
    };

    queryClient.setQueryData(["messages", conversationId], (old) => {
      if (!old) return old;

      return {
        ...old,
        pages: old.pages.map((page, index) =>
          index === 0
            ? {
                ...page,
                data: [optimisticMsg, ...page.data],
              }
            : page,
        ),
      };
    });

    handleSendMessage({
      text: newMessage.trim(),
      files: attachments,
      optimisticMsg,
    });

    setNewMessage("");
    setAttachments([]);
    socket.emit("stopTyping", { conversationId, user: authUser });
    setIsTyping(false);
  };

  return (
    <div className="relative bg-gray-900 px-3 py-3 sm:px-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-full hover:bg-gray-800 transition shrink-0"
        >
          <FiPaperclip className="w-5 h-5 text-blue-400" />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          hidden
          multiple
          accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.zip,.rar"
          onChange={(e) => e.target.files && addFiles(e.target.files)}
        />

        <button className="p-2 rounded-full hover:bg-gray-800 transition shrink-0">
          <FiCalendar className="w-5 h-5 text-blue-400" />
        </button>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setShowEmoji((prev) => !prev)}
            className="p-2 rounded-full hover:bg-gray-800 transition"
          >
            <FiSmile className="w-5 h-5 text-blue-400" />
          </button>

          {showEmoji && (
            <div
              ref={emojiRef}
              className="
            absolute
            bottom-12
            left-0
            sm:left-auto
            sm:right-0
            z-50
            bg-gray-900
            rounded-xl
            shadow-xl
            overflow-hidden
          "
            >
              <EmojiPicker
                onEmojiClick={(emojiData) =>
                  setNewMessage((prev) => prev + emojiData.emoji)
                }
              />
            </div>
          )}
        </div>

        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              if (!isTyping) setIsTyping(true);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
              if (e.key === "Escape") setReplyingTo(null);
            }}
            placeholder={replyingTo ? "Reply to message..." : "Aa"}
            className="
          w-full
          px-4
          py-2
          pr-10
          bg-gray-800
          text-white
          rounded-full
          text-sm
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
          placeholder-gray-400
        "
          />

          {/* Send Button */}
          <button
            type="submit"
            onClick={handleSend}
            disabled={!newMessage.trim() && attachments.length === 0}
            className={`
          absolute
          right-2
          top-1/2
          -translate-y-1/2
          p-1.5
          rounded-full
          transition
          ${
            newMessage.trim() || attachments.length > 0
              ? "hover:bg-gray-700 text-blue-400"
              : "text-gray-600 cursor-not-allowed"
          }
        `}
          >
            <FiSend className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Attachments Preview */}
      {attachments.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 max-h-40 overflow-y-auto pr-1">
          {attachments.map((file, i) => (
            <FilePreview
              key={i}
              file={file}
              index={i}
              removeFile={removeFile}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default memo(MessageInput);
