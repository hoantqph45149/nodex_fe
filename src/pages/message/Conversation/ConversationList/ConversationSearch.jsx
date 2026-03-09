import { FiSearch } from "react-icons/fi";

export default function ConversationSearch({ searchTerm, setSearchTerm }) {
  return (
    <div className="px-3 py-3">
      <div className="relative group">
        <FiSearch
          className="
        absolute left-4 top-1/2 -translate-y-1/2
        w-4 h-4
        text-gray-400
        group-focus-within:text-white
        transition-colors
      "
        />

        <input
          type="text"
          placeholder="Search users or conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="
        w-full
        pl-11 pr-10
        py-2.5 sm:py-3
        bg-gray-800/80
        text-white
        rounded-full
        text-sm sm:text-base
        placeholder-gray-400
        outline-none
        border border-transparent
        focus:border-white
        transition-all duration-200
      "
        />

        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="
          absolute right-3 top-1/2 -translate-y-1/2
          text-gray-400 hover:text-white
          text-sm
          transition-colors
        "
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}
