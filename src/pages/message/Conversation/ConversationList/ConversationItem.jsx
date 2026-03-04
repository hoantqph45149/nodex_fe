import AvatarChat from "../../../../components/common/AvatarChat";
import isConversationMuted from "../../../../utils/conversation/ConversationMuted";
import { getConversationName } from "../../../../utils/conversation/ConversationName";
import formatConversationTime from "../../../../utils/conversation/formatConversationTime";
import getLastMessagePreview from "../../../../utils/conversation/GetLastMessagePreview";
import { IoIosNotificationsOff } from "react-icons/io";

export default function ConversationItem({
  conversation,
  authUser,
  selectedConversationId,
  onSelect,
}) {
  return (
    <div
      onClick={() => onSelect(conversation._id)}
      className={`
    group
    px-4 sm:px-5 py-3
    cursor-pointer
    transition-all duration-200
    border-l-4
    ${
      selectedConversationId === conversation._id
        ? "border-white bg-gray-800"
        : "border-transparent hover:bg-gray-800/60"
    }
  `}
    >
      <div className="flex items-center gap-3">
        <AvatarChat
          conversation={conversation}
          user={null}
          authUser={authUser}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3
              className={`
            truncate text-sm sm:text-base font-semibold
            ${conversation.unreadCount > 0 ? "text-white" : "text-gray-200"}
          `}
            >
              {getConversationName(conversation, authUser).fullName}
            </h3>

            <span className="shrink-0 text-[11px] sm:text-xs text-gray-500">
              {formatConversationTime(conversation?.updatedAt)}
            </span>
          </div>

          <p className="text-xs sm:text-sm text-gray-400 truncate mt-1">
            @{getConversationName(conversation, authUser).username}
          </p>

          <div className="flex items-center justify-between mt-1 gap-2">
            <p
              className={`
            text-xs sm:text-sm truncate
            ${
              conversation.unreadCount > 0
                ? "text-gray-200 font-medium"
                : "text-gray-500"
            }
          `}
            >
              {getLastMessagePreview(conversation.lastMessage, authUser)}
            </p>

            {conversation.unreadCount > 0 &&
            !isConversationMuted(conversation, authUser._id) ? (
              <div
                className="
            shrink-0
            min-w-[22px] h-[22px]
            px-1
            bg-blue-500
            rounded-full
            flex items-center justify-center
            text-[11px]
            text-white
            font-bold
          "
              >
                {conversation.unreadCount > 99
                  ? "99+"
                  : conversation.unreadCount}
              </div>
            ) : isConversationMuted(conversation, authUser._id) ? (
              <IoIosNotificationsOff className="shrink-0 text-gray-500 text-sm" />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
