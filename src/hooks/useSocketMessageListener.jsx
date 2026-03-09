import { useEffect } from "react";
import toast from "react-hot-toast";
import MessageToast from "../components/common/MessageToast";
import isConversationMuted from "../utils/conversation/ConversationMuted";

export default function useSocketMessageListener({
  socket,
  authUser,
  queryClient,
  selectedConversationId,
}) {
  const playBeep = () => {
    const beep = new Audio("/sounds/notification1.wav");
    beep.play();
  };

  useEffect(() => {
    if (!socket || !authUser?._id) return;

    // ---- NEW MESSAGE ----
    const handleNewMessage = (message, conversation) => {
      const isSelf = message.senderId === authUser._id;
      if (isSelf) return;
      if (
        message.conversationId._id !== selectedConversationId &&
        !isConversationMuted(message.conversationId, authUser._id)
      ) {
        toast.custom((t) => (
          <MessageToast
            t={t}
            sender={message.senderId.fullName}
            groupName={
              message.conversationId.isGroup
                ? message.conversationId.name
                : null
            }
            avatar={
              message.conversationId.isGroup
                ? message.conversationId.avatar
                : message.senderId.profileImg
            }
            message={message.content}
            conversationId={message.conversationId._id}
          />
        ));
        playBeep();
      }
      queryClient.setQueryData(["conversations"], (old = []) => {
        const updatedConversations = [...old];
        const index = updatedConversations.findIndex(
          (c) => c._id === message.conversationId._id,
        );
        let updatedConv;
        if (index !== -1) {
          updatedConv = {
            ...updatedConversations[index],
            lastMessage: message,
            unreadCount:
              message.conversationId._id === selectedConversationId
                ? 0
                : (updatedConversations[index].unreadCount || 0) + 1,
            updatedAt: message.createdAt,
          };
          updatedConversations.splice(index, 1);
        } else {
          updatedConv = {
            ...conversation,
            lastMessage: message,
            unreadCount: 1,
            updatedAt: message.createdAt,
          };
        }

        return [updatedConv, ...updatedConversations];
      });

      queryClient.setQueryData(
        ["messages", message.conversationId._id],
        (old) => {
          if (!old) return old;

          const exists = old.pages[0].data.some(
            (msg) => msg._id === message._id,
          );

          if (exists) return old;

          return {
            ...old,
            pages: old.pages.map((page, index) =>
              index === 0
                ? {
                    ...page,
                    data: [message, ...page.data],
                  }
                : page,
            ),
          };
        },
      );
    };

    socket.on("new_message", handleNewMessage);

    return () => {
      socket.off("new_message", handleNewMessage);
    };
  }, [socket, authUser?._id, queryClient, selectedConversationId]);
}
