import { memo, useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import Typing from "../../../../components/common/Typing";
import Message from "./Message";
import { useAuthContext } from "../../../../contexts/AuthContext";
import {
  formatTimeHeader,
  shouldShowMessageTime,
  shouldShowTimeSeparator,
} from "../../../../utils/date";

function ChatMessages({
  messages,
  loadMoreMessages,
  hasMoreMessages,
  isLoadingMore,
  conversation,
  messageOptionsId,
  setMessageOptionsId,
  replyingTo,
  setReplyingTo,
  handleRecallMessage,
  handleDeleteMessage,
  handleReplyMessage,
  handleCopyMessage,
  typing,
}) {
  const { authUser } = useAuthContext();

  const containerRef = useRef(null);
  const lastMessageRef = useRef(null);

  const prevScrollHeight = useRef(0);
  const firstLoad = useRef(true);
  const isLoadingMoreRef = useRef(false);

  // reset khi đổi conversation
  useEffect(() => {
    firstLoad.current = true;
  }, [conversation._id]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // nếu đang loadMore → giữ vị trí scroll
    if (isLoadingMoreRef.current) {
      const newHeight = container.scrollHeight;
      container.scrollTop = newHeight - prevScrollHeight.current;

      prevScrollHeight.current = 0;
      isLoadingMoreRef.current = false;
      return;
    }

    // message mới → scroll xuống
    lastMessageRef.current?.scrollIntoView({
      behavior: firstLoad.current ? "auto" : "smooth",
    });

    firstLoad.current = false;
  }, [messages]);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const isNearTop = container.scrollTop <= 60;

    if (isNearTop && hasMoreMessages && !isLoadingMore) {
      prevScrollHeight.current = container.scrollHeight;
      isLoadingMoreRef.current = true;
      loadMoreMessages();
    }
  };

  const findMessageById = (messageReplyTo) =>
    messages.find((msg) => msg._id === messageReplyTo._id);

  return (
    <>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 h-full overflow-y-auto px-4 sm:px-6 py-4 bg-gray-950 [overflow-anchor:none]"
      >
        <div className="space-y-5">
          {messages.map((message, index) => {
            const prevMsg = messages[index - 1];
            const nextMsg = messages[index + 1];

            const showTime = shouldShowTimeSeparator(message, prevMsg);
            const showMessageTime = shouldShowMessageTime(message, nextMsg);

            const isOwnMessage = message?.senderId?._id === authUser._id;

            const deleteFor = message?.deletedFor?.includes(
              authUser._id.toString(),
            );

            if (deleteFor) return null;

            const isLast = index === messages.length - 1;

            return (
              <div key={message._id} ref={isLast ? lastMessageRef : null}>
                {showTime && (
                  <div className="flex justify-center my-4">
                    <span className="text-xs text-gray-400">
                      {formatTimeHeader(message.createdAt)}
                    </span>
                  </div>
                )}

                <Message
                  message={message}
                  showMessageTime={showMessageTime}
                  isOwnMessage={isOwnMessage}
                  messageOptionsId={messageOptionsId}
                  setMessageOptionsId={setMessageOptionsId}
                  handleReplyMessage={handleReplyMessage}
                  handleCopyMessage={handleCopyMessage}
                  handleRecallMessage={handleRecallMessage}
                  handleDeleteMessage={handleDeleteMessage}
                  authUser={authUser}
                  findMessageById={findMessageById}
                />
              </div>
            );
          })}

          {isLoadingMore && (
            <div className="text-center text-xs text-gray-500">
              Loading messages...
            </div>
          )}
        </div>

        {/* Seen / Sent */}
        {messages.length > 0 && (
          <div className="flex justify-end mt-3">
            {(() => {
              const lastMsg = messages[messages.length - 1];

              const seenUsers = lastMsg.seenBy.filter(
                (u) => u !== authUser._id,
              );

              if (seenUsers.length === 0) {
                return (
                  <span className="text-[11px] text-gray-500">
                    {new Date(lastMsg.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    • Sent
                  </span>
                );
              }

              if (!conversation.isGroup) {
                return (
                  <span className="text-[11px] text-gray-400 animate-fade-in">
                    Seen{" "}
                    {new Date(lastMsg.updatedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                );
              }

              return (
                <div className="flex -space-x-2 animate-fade-in">
                  {seenUsers.slice(0, 5).map((user) => (
                    <img
                      key={user._id}
                      src={user.profileImg || "/avatar-placeholder.png"}
                      alt={user.fullName}
                      title={user.fullName}
                      className="w-5 h-5 rounded-full border border-gray-900"
                    />
                  ))}
                </div>
              );
            })()}
          </div>
        )}

        {typing?.isTyping && (
          <div className="mt-2">
            <Typing typingUsers={typing.user} />
          </div>
        )}
      </div>

      {/* Reply Box */}
      {replyingTo && (
        <div className="px-4 sm:px-6 py-3 border-t border-gray-800 bg-gray-900">
          <div className="flex justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-blue-400 mb-1 font-medium">
                Replying to{" "}
                {replyingTo.senderId._id === authUser._id
                  ? "yourself"
                  : replyingTo.senderId.fullName ||
                    replyingTo.senderId.username}
              </p>

              {replyingTo.content && (
                <p className="text-sm text-gray-300 truncate">
                  {replyingTo.content}
                </p>
              )}
            </div>

            <button
              onClick={() => setReplyingTo(null)}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-800 transition"
            >
              <FiX className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default memo(ChatMessages);
