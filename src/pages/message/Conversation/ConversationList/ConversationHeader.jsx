import { RiMailAddLine } from "react-icons/ri";

export default function ConversationHeader({ onOpenGroup }) {
  return (
    <div className="px-4 sm:px-5 py-4 sticky top-0 z-10 bg-gray-900/95 backdrop-blur border-b border-gray-800">
      <div className="flex items-center justify-between">
        <h1 className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight text-white">
          Messages
        </h1>

        <button
          onClick={onOpenGroup}
          className="
        flex items-center justify-center
        w-9 h-9 sm:w-10 sm:h-10
        rounded-full
        hover:bg-gray-800
        active:scale-95
        transition
        focus:outline-none
        focus:ring-2 focus:ring-gray-600
      "
        >
          <RiMailAddLine className="w-5 h-5 text-gray-300" />
        </button>
      </div>
    </div>
  );
}
