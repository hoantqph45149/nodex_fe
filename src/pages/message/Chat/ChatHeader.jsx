import { memo } from "react";
import { FiInfo, FiArrowLeft } from "react-icons/fi";
import AvatarChat from "../../../components/common/AvatarChat";
import { getConversationName } from "../../../utils/conversation/ConversationName";

function ChatHeader({ conversation, user, authUser, onBack, onShowInfo }) {
  const { fullName } = getConversationName(conversation, authUser);
  const displayName = conversation ? fullName : user?.fullName;

  return (
    <div className="border-b border-gray-700 bg-gray-900 px-3 py-3 sm:px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          {onBack && (
            <button
              onClick={onBack}
              className="sm:hidden p-2 -ml-1 rounded-full hover:bg-gray-800 transition shrink-0"
            >
              <FiArrowLeft className="w-5 h-5 text-gray-300" />
            </button>
          )}

          <div className="shrink-0">
            <AvatarChat
              conversation={conversation}
              user={user}
              authUser={authUser}
            />
          </div>

          <div className="flex flex-col min-w-0">
            <h2 className="text-white font-semibold text-sm sm:text-base truncate">
              {displayName}
            </h2>

            {user && !conversation?.isGroup && (
              <p className="text-xs text-gray-400 truncate">
                @{user?.username}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={onShowInfo}
          className="p-2 rounded-full hover:bg-gray-800 transition shrink-0"
        >
          <FiInfo className="w-5 h-5 text-gray-300" />
        </button>
      </div>
    </div>
  );
}

export default memo(ChatHeader);
