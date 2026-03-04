import { memo, useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import Typing from "../../../../components/common/Typing";
import Message from "./Message";
import { useAuthContext } from "../../../../contexts/AuthContext";

function ChatMessages({
  messages,
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
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const findMessageById = (messageReplyTo) =>
    messages.find((msg) => msg._id === messageReplyTo._id);

  return (
    <>
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 bg-gray-950">
        <div className="space-y-5">
          {messages.map((message) => {
            const isOwnMessage = message?.senderId?._id === authUser._id;
            const deleteFor = message?.deletedFor?.includes(
              authUser._id.toString(),
            );

            if (deleteFor) return null;

            return (
              <Message
                key={message._id}
                message={message}
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
            );
          })}

          <div ref={messagesEndRef} />
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

              {replyingTo.media?.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {replyingTo.media.map((file, idx) => {
                    if (file.type.startsWith("image")) {
                      return (
                        <img
                          key={idx}
                          src={file.url}
                          alt="img"
                          className="h-14 w-14 object-cover rounded-md"
                        />
                      );
                    }

                    if (file.type.startsWith("video")) {
                      return (
                        <video
                          key={idx}
                          src={file.url}
                          className="h-14 w-14 object-cover rounded-md"
                          muted
                        />
                      );
                    }

                    return (
                      <a
                        key={idx}
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 text-xs underline"
                      >
                        📎 {file.name || "File"}
                      </a>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              onClick={() => setReplyingTo(null)}
              className="
            w-8 h-8
            flex items-center justify-center
            rounded-full
            hover:bg-gray-800
            transition
          "
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
