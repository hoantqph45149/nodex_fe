import { useState, useEffect, useRef } from "react";
import { FiSearch } from "react-icons/fi";

import Posts from "../../components/common/Posts";
import CreatePost from "./CreatePost";
import useUserSearch from "../../hooks/useUserSearch";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [feedType, setFeedType] = useState("forYou");

  const searchRef = useRef(null);

  const {
    data,
    isPending: isSearching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserSearch(debouncedSearch);

  const users = data?.pages?.flatMap((p) => p?.users || []) || [];

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  };

  // debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // click outside → clear search
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="flex-[4_4_0] mr-auto border-r border-gray-700 min-h-screen">
      {/* SEARCH */}
      <div
        className="lg:hidden sticky top-0 z-20 bg-black border-b border-gray-700"
        ref={searchRef}
      >
        <div className="relative w-full">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="
        w-full
        pl-11 pr-10
        py-2.5
        bg-black
        text-white
        text-sm
        placeholder-gray-400
        outline-none
      "
          />

          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            >
              ✕
            </button>
          )}

          {/* SEARCH RESULTS */}
          {searchTerm && (
            <div
              onScroll={handleScroll}
              className="
          absolute
          top-full
          left-0
          w-full
          bg-black
          border-y border-gray-700
          shadow-lg
          max-h-72
          overflow-y-auto
          rounded-b-md
        "
            >
              {isSearching && (
                <div className="flex justify-center p-4">
                  <LoadingSpinner size="small" />
                </div>
              )}

              {users?.map((user) => (
                <Link
                  key={user._id}
                  onClick={() => setSearchTerm("")}
                  to={`/profile/${user.username}`}
                  className="
              flex gap-3 items-center
              p-3
              hover:bg-gray-800
              transition
            "
                >
                  <img
                    src={user.profileImg || "/avatar-placeholder.png"}
                    className="w-8 h-8 rounded-full"
                  />

                  <div className="flex flex-col">
                    <span className="font-semibold text-sm text-white">
                      {user.fullName}
                    </span>

                    <span className="text-xs text-gray-400">
                      @{user.username}
                    </span>
                  </div>
                </Link>
              ))}

              {isFetchingNextPage && (
                <div className="flex justify-center p-3">
                  <LoadingSpinner size="small" />
                </div>
              )}

              {!isSearching && users?.length === 0 && (
                <div className="p-3 text-sm text-gray-400">No users found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FEED SWITCH */}
      <div className="flex w-full border-b border-gray-700">
        <div
          className="flex justify-center flex-1 p-3 hover:bg-secondary transition cursor-pointer relative"
          onClick={() => setFeedType("forYou")}
        >
          For you
          {feedType === "forYou" && (
            <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary"></div>
          )}
        </div>

        <div
          className="flex justify-center flex-1 p-3 hover:bg-secondary transition cursor-pointer relative"
          onClick={() => setFeedType("following")}
        >
          Following
          {feedType === "following" && (
            <div className="absolute bottom-0 w-10 h-1 rounded-full bg-primary"></div>
          )}
        </div>
      </div>

      {/* CREATE POST */}
      <CreatePost />

      {/* POSTS */}
      <Posts feedType={feedType} />
    </div>
  );
};

export default HomePage;
