import AvatarChat from "../../../../components/common/AvatarChat";

export default function SearchResults({
  searchResults,
  conversations,
  authUser,
  handleSelectUser,
  handleSelectGroup,
}) {
  if (!searchResults?.users?.length && !searchResults?.groups?.length)
    return null;

  return (
    <div className="px-4 sm:px-5 py-3 border-b border-gray-800">
      <p className="text-xs sm:text-sm text-gray-400 mb-3 tracking-wide uppercase">
        Search Results
      </p>

      {/* Users */}
      {searchResults.users?.length > 0 && (
        <div className="space-y-1">
          <p className="text-[11px] text-gray-500 uppercase mb-1">Users</p>

          {searchResults.users.map((user) => {
            const isExisting = conversations.some((conv) =>
              conv.participants.some((p) => p.user._id === user._id),
            );

            return (
              <div
                key={user._id}
                onClick={() => handleSelectUser(user)}
                className="
              flex items-center gap-3
              px-3 py-2
              rounded-lg
              cursor-pointer
              transition
              hover:bg-gray-800/70
              active:scale-[0.98]
            "
              >
                <AvatarChat
                  conversation={null}
                  user={user}
                  authUser={authUser}
                />

                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium text-sm truncate">
                    @{user.username}
                  </p>
                  <p className="text-gray-400 text-xs truncate">
                    {user.fullName}
                  </p>
                </div>

                {isExisting && (
                  <span
                    className="
                text-[11px]
                px-2 py-0.5
                bg-green-500/10
                text-green-400
                rounded-full
                font-medium
              "
                  >
                    Recent
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Groups */}
      {searchResults.groups?.length > 0 && (
        <div className="space-y-1 mt-4">
          <p className="text-[11px] text-gray-500 uppercase mb-1">Groups</p>

          {searchResults.groups.map((group) => (
            <div
              key={group._id}
              onClick={() => handleSelectGroup(group)}
              className="
            flex items-center gap-3
            px-3 py-2
            rounded-lg
            cursor-pointer
            transition
            hover:bg-gray-800/70
            active:scale-[0.98]
          "
            >
              <AvatarChat
                conversation={group}
                user={null}
                authUser={authUser}
              />

              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">
                  {group.name}
                </p>
                <p className="text-gray-400 text-xs truncate">
                  {group.participants.length} members
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {searchResults.users?.length === 0 &&
        searchResults.groups?.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-4">
            No results found.
          </div>
        )}
    </div>
  );
}
