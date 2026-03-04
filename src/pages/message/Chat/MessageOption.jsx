import { memo, useEffect, useRef } from "react";
import {
  FiCopy,
  FiCornerUpLeft,
  FiMoreHorizontal,
  FiRotateCcw,
  FiTrash2,
} from "react-icons/fi";

function MessageOptions({
  message,
  messageOptionsId,
  setMessageOptionsId,
  handleReplyMessage,
  handleCopyMessage,
  handleRecallMessage,
  handleDeleteMessage,
  authUser,
}) {
  const wrapperRef = useRef(null);

  const isOpen = messageOptionsId === message._id;

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setMessageOptionsId(null);
      }
    }

    function handleEsc(e) {
      if (e.key === "Escape") {
        setMessageOptionsId(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, setMessageOptionsId]);

  return (
    <div ref={wrapperRef} className="relative flex items-center">
      {/* More button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setMessageOptionsId(isOpen ? null : message._id);
        }}
        className="
          p-2
          rounded-full
          text-gray-400
          hover:bg-gray-700
          hover:text-white
          transition
          opacity-70
          sm:opacity-0
          sm:group-hover:opacity-100
        "
      >
        <FiMoreHorizontal className="w-4 h-4" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div
          className={`
            absolute
            top-8
            z-50
            min-w-[130px]
            max-w-[85vw]
            bg-gray-800
            border border-gray-600
            rounded-xl
            shadow-xl
            py-1
            animate-[fadeIn_0.15s_ease-out]
            ${message.senderId._id === authUser._id ? "right-0" : "left-0"}
          `}
        >
          <button
            onClick={() => handleReplyMessage(message)}
            className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2 transition"
          >
            <FiCornerUpLeft className="w-4 h-4" />
            <span>Reply</span>
          </button>

          <button
            onClick={() => handleCopyMessage(message.content)}
            className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2 transition"
          >
            <FiCopy className="w-4 h-4" />
            <span>Copy</span>
          </button>

          {message.senderId._id === authUser._id && !message.recalled && (
            <button
              onClick={() => handleRecallMessage(message._id)}
              className="w-full px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center gap-2 transition"
            >
              <FiRotateCcw className="w-4 h-4" />
              <span>Recall</span>
            </button>
          )}

          <button
            onClick={() => handleDeleteMessage(message._id)}
            className="w-full px-3 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center gap-2 transition"
          >
            <FiTrash2 className="w-4 h-4" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(MessageOptions);
