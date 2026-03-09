import { useState } from "react";
import MessageOptions from "../MessageOption";
import MediaRenderer from "./MediaRenderer";
import PreviewModal from "../../../../components/common/PreviewModal";
import { FaReply } from "react-icons/fa";

function ReplyPreview({ message, authUser, findMessageById }) {
  if (!message.replyTo) return null;

  const repliedMsg = findMessageById(message.replyTo);
  if (!repliedMsg) return null;

  const currentSender = message.senderId;
  const repliedSender = repliedMsg.senderId;
  const isOwn = repliedSender._id === authUser._id;

  const renderLabel = () => {
    if (currentSender._id === authUser._id) {
      return repliedSender._id === authUser._id ? (
        <span>Bạn trả lời chính mình</span>
      ) : (
        <span>
          Bạn trả lời{" "}
          {repliedSender.fullName || repliedSender.username || "Người dùng"}
        </span>
      );
    }
    return repliedSender._id === currentSender._id ? (
      <span>
        {currentSender.fullName || currentSender.username} trả lời chính mình
      </span>
    ) : (
      <span>
        {currentSender.fullName || currentSender.username} trả lời{" "}
        {isOwn
          ? "Bạn"
          : repliedSender.fullName || repliedSender.username || "Người dùng"}
      </span>
    );
  };

  return (
    <div className="mb-1 px-2 py-1 bg-gray-700 rounded text-xs text-gray-300 border-l-2 border-blue-400 w-fit max-w-xs overflow-hidden">
      <div className="flex items-center gap-1 text-xs text-gray-400">
        <FaReply className="w-3 h-3" />
        {renderLabel()}
      </div>

      {repliedMsg.content && (
        <span className="block truncate">{repliedMsg.content}</span>
      )}

      {repliedMsg.media?.length > 0 && (
        <div className="flex gap-1 mt-1">
          {repliedMsg.media.slice(0, 2).map((m, i) => {
            if (m.type === "image")
              return (
                <img
                  key={i}
                  src={m.url}
                  alt=""
                  className="w-8 h-8 object-cover rounded"
                />
              );
            if (m.type === "video")
              return (
                <div
                  key={i}
                  className="w-8 h-8 flex items-center justify-center bg-gray-600 rounded text-[10px]"
                >
                  🎥
                </div>
              );
            if (m.type === "file")
              return (
                <div
                  key={i}
                  className="w-8 h-8 flex items-center justify-center bg-gray-600 rounded text-[10px]"
                >
                  📎
                </div>
              );
            return null;
          })}
          {repliedMsg.media.length > 2 && (
            <div className="w-8 h-8 flex items-center justify-center bg-gray-600 rounded text-[10px]">
              +{repliedMsg.media.length - 2}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  message,
  showMessageTime,
  isOwnMessage,
  setPreviewMedia,
}) {
  return (
    <div
      className={`px-3 py-2 rounded-2xl flex flex-col space-y-2 w-fit ${
        isOwnMessage ? "bg-blue-400 text-white" : "bg-gray-700 text-white"
      } ${message.recalled ? "opacity-60 italic" : ""}`}
    >
      {message.content && (
        <p className="text-sm break-words whitespace-pre-wrap max-w-full">
          {message.content}
        </p>
      )}
      {message.media?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {message.media.map((m) => (
            <MediaRenderer
              key={m._id || m.publicId}
              media={m}
              onPreview={setPreviewMedia}
            />
          ))}
        </div>
      )}
      {showMessageTime && (
        <span
          className={`text-[11px] ${isOwnMessage ? "text-right text-white" : "text-left text-gray-400"} mt-1 block`}
        >
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      )}
    </div>
  );
}

export default function Message({
  message,
  showMessageTime,
  isOwnMessage,
  messageOptionsId,
  setMessageOptionsId,
  handleReplyMessage,
  handleCopyMessage,
  handleRecallMessage,
  handleDeleteMessage,
  authUser,
  findMessageById,
}) {
  const [previewMedia, setPreviewMedia] = useState(null);

  return (
    <>
      <div
        className={`flex group ${
          isOwnMessage ? "justify-end" : "justify-start"
        } relative w-full`}
      >
        <div className="flex items-start space-x-2 w-fit max-w-[80%] sm:max-w-[70%] md:max-w-[60%] lg:max-w-[50%]">
          {isOwnMessage ? (
            <>
              <MessageOptions
                message={message}
                messageOptionsId={messageOptionsId}
                setMessageOptionsId={setMessageOptionsId}
                handleReplyMessage={handleReplyMessage}
                handleCopyMessage={handleCopyMessage}
                handleRecallMessage={handleRecallMessage}
                handleDeleteMessage={handleDeleteMessage}
                authUser={authUser}
              />
              <div className="flex flex-col items-end w-fit">
                <ReplyPreview
                  message={message}
                  authUser={authUser}
                  findMessageById={findMessageById}
                />
                <MessageBubble
                  message={message}
                  showMessageTime={showMessageTime}
                  isOwnMessage={true}
                  setPreviewMedia={setPreviewMedia}
                />
              </div>
            </>
          ) : (
            <>
              <div className="avatar">
                <div className="w-5 rounded-full">
                  <img
                    src={
                      message.senderId.profileImg || "/avatar-placeholder.png"
                    }
                    alt={message.senderId.fullName}
                  />
                  s
                </div>
              </div>
              <div className="flex flex-col w-fit">
                <ReplyPreview
                  message={message}
                  authUser={authUser}
                  findMessageById={findMessageById}
                />
                <MessageBubble
                  message={message}
                  showMessageTime={showMessageTime}
                  isOwnMessage={false}
                  setPreviewMedia={setPreviewMedia}
                />
              </div>
              <MessageOptions
                message={message}
                messageOptionsId={messageOptionsId}
                setMessageOptionsId={setMessageOptionsId}
                handleReplyMessage={handleReplyMessage}
                handleCopyMessage={handleCopyMessage}
                handleRecallMessage={handleRecallMessage}
                handleDeleteMessage={handleDeleteMessage}
                authUser={authUser}
              />
            </>
          )}
        </div>
      </div>

      <PreviewModal
        previewMedia={previewMedia}
        setPreviewMedia={setPreviewMedia}
      />
    </>
  );
}
