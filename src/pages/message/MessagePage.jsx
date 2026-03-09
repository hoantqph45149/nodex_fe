import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useConversationContext } from "../../contexts/ConversationContext";
import { useSocketContext } from "../../contexts/SocketContext";
import useConversations from "../../hooks/useConversation";
import useMessages from "../../hooks/useMessages";
import useSocketTypingListener from "../../hooks/useSocketTypingListener";
import ChatHeader from "./Chat/ChatHeader";
import ChatMessage from "./Chat/ChatMessage/ChatMessage";
import MessageInput from "./Chat/MessageInput/MessageInput";
import ConversationInfo from "./Conversation/ConversationInfo/ConversationInfo";
import ConversationList from "./Conversation/ConversationList/ConversationList";
import { useLocation } from "react-router-dom";
import { fetchWithAuth } from "../../services/fetchInstance";
import { useAuthContext } from "../../contexts/AuthContext";

export default function MessagePage() {
  const {
    selectedConversationId,
    setSelectedConversationId,
    selectedUser,
    setSelectedUser,
  } = useConversationContext();
  const { authUser } = useAuthContext();
  const { socket } = useSocketContext();
  const queryClient = useQueryClient();
  const location = useLocation();

  const [showConversationInfo, setShowConversationInfo] = useState(false);
  const [messageOptionsId, setMessageOptionsId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [typing, setTyping] = useState({
    isTyping: false,
    conversationId: null,
    user: null,
  });

  useEffect(() => {
    if (!location.pathname.startsWith("/messages")) {
      setSelectedConversationId(null);
      setSelectedUser(null);
    }
  }, [location.pathname]);

  const { conversations, isLoading: conversationsLoading } = useConversations();

  const selectedConversation = useMemo(
    () => conversations.find((c) => c._id === selectedConversationId) || null,
    [conversations, selectedConversationId],
  );

  const {
    messages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    handleSendMessage,
    handleRecallMessage,
    handleDeleteMessage,
  } = useMessages({
    selectedConversation,
    setSelectedConversationId,
    selectedUser,
    setSelectedUser,
    setReplyingTo,
    replyingTo,
    authUser,
  });

  const handleReplyMessage = useCallback((message) => {
    setReplyingTo(message);
    setMessageOptionsId(null);
  }, []);

  const handleCopyMessage = useCallback((content) => {
    navigator.clipboard.writeText(content);
    setMessageOptionsId(null);
  }, []);

  useSocketTypingListener({
    socket,
    conversationId: selectedConversation?._id,
    setTyping,
    authUser,
  });
  return (
    <div className="flex h-screen overflow-hidden bg-gray-900 text-white">
      {/* Sidebar */}
      <div
        className={`
    w-full
    lg:w-[320px]
    bg-gray-900
    border-r border-gray-800
    ${selectedConversation || selectedUser ? "hidden lg:block" : "block"}
  `}
      >
        <ConversationList
          conversations={conversations}
          queryClient={queryClient}
          selectedConversationId={selectedConversationId}
          setSelectedConversationId={setSelectedConversationId}
          setSelectedUser={setSelectedUser}
          authUser={authUser}
          setShowConversationInfo={setShowConversationInfo}
          conversationsLoading={conversationsLoading}
        />
      </div>

      {/* Main Chat Area */}
      <div
        className={`
      flex-1 
      min-w-0
      flex 
      flex-col 
    bg-gray-950
      ${!selectedConversation && !selectedUser ? "hidden lg:flex" : "flex"}
    `}
      >
        {showConversationInfo ? (
          <ConversationInfo
            onBack={() => setShowConversationInfo(false)}
            conversation={selectedConversation}
            user={selectedUser}
            authUser={authUser}
            setSelectedConversationId={setSelectedConversationId}
            setShowConversationInfo={setShowConversationInfo}
          />
        ) : selectedConversation || selectedUser ? (
          <>
            {/* Header */}
            <div className="shrink-0 border-b border-gray-800">
              <ChatHeader
                conversation={selectedConversation}
                user={selectedUser}
                authUser={authUser}
                onBack={() => {
                  setSelectedConversationId(null);
                  setSelectedUser(null);
                }}
                onShowInfo={() => setShowConversationInfo(true)}
              />
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 lg:px-6 py-4">
              <ChatMessage
                messages={messages}
                loadMoreMessages={fetchNextPage}
                hasMoreMessages={hasNextPage}
                isLoadingMore={isFetchingNextPage}
                conversation={selectedConversation}
                messageOptionsId={messageOptionsId}
                setMessageOptionsId={setMessageOptionsId}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                handleRecallMessage={handleRecallMessage}
                handleDeleteMessage={handleDeleteMessage}
                handleReplyMessage={handleReplyMessage}
                handleCopyMessage={handleCopyMessage}
                typing={typing}
              />
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-gray-800 px-3 sm:px-6 py-3 bg-gray-900">
              <MessageInput
                handleSendMessage={handleSendMessage}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                socket={socket}
                conversationId={selectedConversation?._id}
                authUser={authUser}
              />
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-gray-500 px-6">
              <h2 className="text-lg sm:text-xl font-semibold pb-2">
                Select a conversation
              </h2>
              <p className="text-sm sm:text-base">
                Choose a conversation or search a user to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
