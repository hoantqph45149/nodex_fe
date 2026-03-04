import { FiArrowLeft } from "react-icons/fi";

export default function ConversationHeader({ onBack, conversation }) {
  return (
    <div
      className="
  sticky top-0 z-20
  flex items-center
  px-4 sm:px-6
  py-3
  border-b border-gray-800
  bg-gray-950/95 backdrop-blur
"
    >
      <button
        onClick={onBack}
        className="
      flex items-center justify-center
      w-9 h-9 sm:w-10 sm:h-10
      mr-3
      rounded-full
      hover:bg-gray-800
      active:scale-95
      transition
      focus:outline-none
      focus:ring-2 focus:ring-gray-600
    "
      >
        <FiArrowLeft className="w-5 h-5 text-gray-300" />
      </button>

      <h2 className="text-base sm:text-lg font-semibold text-white tracking-tight">
        {conversation?.isGroup ? "Group info" : "Conversation info"}
      </h2>
    </div>
  );
}
