import { Link } from "react-router-dom";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import RightPanelSkeleton from "../skeletons/RightPanelSkeleton";
import LoadingSpinner from "./LoadingSpinner";
import useFollow from "../../hooks/useFollow";
import { fetchWithAuth } from "../../services/fetchInstance";
import useUserSearch from "../../hooks/useUserSearch";
import { FiSearch } from "react-icons/fi";

const RightPanel = ({ conversations = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const { follow, isPending } = useFollow();

  // suggested users
  const { data: suggestedUsers, isLoading } = useQuery({
    queryKey: ["suggestedUsers"],
    queryFn: async () => {
      const res = await fetchWithAuth("/api/users/suggested");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data;
    },
  });

  // search users
  const {
    data,
    isPending: isSearching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUserSearch(searchTerm);

  const users = data?.pages?.flatMap((p) => p?.users || []) || [];

  const handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  };

  return (
    <div className="hidden lg:block mb-4 mx-2 w-72">
      <div className="bg-[#16181C] p-4 rounded-md sticky top-2 space-y-4">
        {/* SEARCH INPUT */}
        <div className="px-3 py-2">
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
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="
        w-full
        pl-11 pr-10
        py-2.5
        bg-gray-800/80
        text-white
        rounded-full
        text-sm
        placeholder-gray-400
        outline-none
        border border-transparent
        focus:border-white
        focus:ring-2 focus:ring-blue-500/30
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

        {/* SEARCH RESULTS */}
        {searchTerm && (
          <div onScroll={handleScroll} className="max-h-72 overflow-y-auto">
            {isSearching && (
              <div className="flex justify-center p-4">
                <LoadingSpinner size="small" />
              </div>
            )}

            {!isSearching && users.length > 0 && (
              <div className="space-y-2">
                {users.map((user) => {
                  const isExisting = conversations.some((conv) =>
                    conv.participants.some((p) => p.user._id === user._id),
                  );

                  return (
                    <Link
                      onClick={() => setSearchTerm("")}
                      to={`/profile/${user.username}`}
                      key={user._id}
                      className="flex items-center justify-between gap-3 px-2 py-2 rounded-lg hover:bg-gray-800/70"
                    >
                      <div className="flex gap-2 items-center">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                          <img
                            src={user.profileImg || "/avatar-placeholder.png"}
                          />
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">
                            @{user.username}
                          </span>

                          <span className="text-xs text-gray-400 truncate">
                            {user.fullName}
                          </span>
                        </div>
                      </div>

                      {isExisting && (
                        <span className="text-[11px] px-2 py-0.5 bg-green-500/10 text-green-400 rounded-full">
                          Recent
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
            {isFetchingNextPage && (
              <div className="flex justify-center p-3">
                <LoadingSpinner size="small" />
              </div>
            )}
            {!isSearching && users.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-4">
                No users found
              </p>
            )}
          </div>
        )}

        {/* SUGGESTED USERS */}
        <>
          <p className="font-bold">Who to follow</p>

          <div className="flex flex-col gap-4">
            {isLoading && (
              <>
                <RightPanelSkeleton />
                <RightPanelSkeleton />
                <RightPanelSkeleton />
              </>
            )}

            {!isLoading &&
              suggestedUsers?.map((user) => (
                <Link
                  to={`/profile/${user.username}`}
                  className="flex items-center justify-between gap-4"
                  key={user._id}
                >
                  <div className="flex gap-2 items-center">
                    <div className="w-8 rounded-full overflow-hidden">
                      <img src={user.profileImg || "/avatar-placeholder.png"} />
                    </div>

                    <div className="flex flex-col">
                      <span className="font-semibold truncate w-28">
                        {user.fullName}
                      </span>

                      <span className="text-sm text-slate-500">
                        @{user.username}
                      </span>
                    </div>
                  </div>

                  <button
                    className="btn bg-white text-black hover:opacity-90 rounded-full btn-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      follow(user._id);
                    }}
                  >
                    {isPending ? <LoadingSpinner size="sm" /> : "Follow"}
                  </button>
                </Link>
              ))}
          </div>
        </>
      </div>
    </div>
  );
};

export default RightPanel;
