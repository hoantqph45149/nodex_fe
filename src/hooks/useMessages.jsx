import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useSocketContext } from "../contexts/SocketContext";
import { fetchWithAuth } from "../services/fetchInstance";

const API_URL = "/api";

export default function useMessages({
  selectedConversation,
  setSelectedConversationId,
  selectedUser,
  setSelectedUser,
  setReplyingTo,
  replyingTo,
  authUser,
}) {
  const { socket } = useSocketContext();
  const queryClient = useQueryClient();
  const conversationId = selectedConversation?._id;
  const lastmessage = selectedConversation?.lastMessage;

  useEffect(() => {
    if (!socket || !conversationId) return;

    socket.emit("joinRoom", conversationId);

    const handleMessagesSeen = ({ user }) => {
      console.log("user", user);
      queryClient.setQueryData(["messages", conversationId], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((msg) =>
              msg.seenBy.some((u) => u._id === user._id)
                ? msg
                : { ...msg, seenBy: [...msg.seenBy, user] },
            ),
          })),
        };
      });
    };

    socket.on("messages_seen", handleMessagesSeen);

    return () => {
      socket.emit("leaveRoom", conversationId);
      socket.off("messages_seen", handleMessagesSeen);
    };
  }, [conversationId, socket]);

  // 🟢 Lấy danh sách tin nhắn
  const { data, fetchNextPage, hasNextPage, refetch, isFetchingNextPage } =
    useInfiniteQuery({
      queryKey: ["messages", conversationId],

      queryFn: async ({ pageParam = null }) => {
        const url = pageParam
          ? `${API_URL}/messages/${conversationId}?cursor=${pageParam}`
          : `${API_URL}/messages/${conversationId}`;

        const res = await fetchWithAuth(url);
        if (!res.ok) throw new Error("Failed to fetch messages");

        return res.json();
      },

      getNextPageParam: (lastPage) => {
        if (!lastPage.hasMore) return undefined;
        return lastPage.nextCursor;
      },

      enabled: !!conversationId,
    });

  // flatten pages
  const messages = data?.pages?.flatMap((page) => page.data).reverse() || [];

  // 🟡 Đánh dấu đã đọc khi vào phòng
  const markAsSeen = useMutation({
    mutationFn: () =>
      fetchWithAuth(`${API_URL}/messages/${conversationId}/seen`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }),
    onSuccess: () => {
      queryClient.setQueryData(["conversations"], (old = []) =>
        old.map((conv) =>
          conv._id === conversationId ? { ...conv, unreadCount: 0 } : conv,
        ),
      );
    },
    onError: (error) => {
      console.error("Mark as seen error:", error.message);
    },
  });

  useEffect(() => {
    if (conversationId && lastmessage?.senderId?._id !== authUser?._id) {
      markAsSeen.mutate();
    }
  }, [conversationId, messages.length]);

  // 📤 Gửi tin nhắn
  const sendMessage = useMutation({
    mutationFn: async ({ text, files, optimisticMsg }) => {
      if (!selectedUser && !conversationId) {
        throw new Error("No user or conversation selected");
      }

      const receiver = selectedConversation
        ? selectedConversation.participants.find(
            (p) => p.user._id !== authUser?._id,
          )?.user
        : null;

      // FormData
      const formData = new FormData();
      formData.append("content", text);
      formData.append("replyTo", replyingTo?._id || "");

      if (files && files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          formData.append("media", files[i]);
        }
      }

      if (selectedConversation?.isGroup) {
        formData.append("conversationId", conversationId);
      } else {
        formData.append(
          "receiverId",
          selectedUser ? selectedUser._id : receiver._id,
        );
      }

      const res = await fetchWithAuth(`${API_URL}/messages/${conversationId}`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Failed to send message");
      return res.json();
    },

    // 💡 nhận cả data và biến (variables)
    onSuccess: (res, variables) => {
      const { data } = res;

      queryClient.setQueryData(
        ["messages", data.message.conversationId._id],
        (old) => {
          if (!old) return old;

          return {
            ...old,
            pages: old.pages.map((page, index) =>
              index === 0
                ? {
                    ...page,
                    data: page.data.map((msg) =>
                      msg._id === variables.optimisticMsg._id
                        ? data.message
                        : msg,
                    ),
                  }
                : page,
            ),
          };
        },
      );

      setReplyingTo(null);
    },

    onError: (error, variables) => {
      // mark message fail
      queryClient.setQueryData(["messages", conversationId], (old = []) =>
        old.map((msg) =>
          msg._id === variables.optimisticMsg._id
            ? { ...msg, status: "error" }
            : msg,
        ),
      );

      toast.error("Failed to send message: " + error.message);
    },
  });

  // 🔄 Thu hồi tin nhắn
  const recallMessage = useMutation({
    mutationFn: (messageId) =>
      fetchWithAuth(`${API_URL}/messages/completely/${messageId}`, {
        method: "DELETE",
      }),

    onSuccess: (_, messageId) => {
      queryClient.setQueryData(["messages", conversationId], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.map((msg) =>
              msg._id === messageId
                ? { ...msg, recalled: true, content: "Message recalled" }
                : msg,
            ),
          })),
        };
      });
    },

    onError: (error) => {
      toast.error("Failed to recall message: " + error.message);
    },
  });

  // 🗑️ Xóa tin nhắn với người khá
  //
  const deleteMessage = useMutation({
    mutationFn: (messageId) =>
      fetchWithAuth(`${API_URL}/messages/${messageId}`, {
        method: "DELETE",
      }),

    onSuccess: (_, messageId) => {
      queryClient.setQueryData(["messages", conversationId], (old) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page) => ({
            ...page,
            data: page.data.filter((msg) => msg._id !== messageId),
          })),
        };
      });

      toast.success("Message deleted");
    },

    onError: (error) => {
      toast.error("Failed to delete message: " + error.message);
    },
  });

  return {
    messages,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    handleSendMessage: sendMessage.mutate,
    handleRecallMessage: recallMessage.mutate,
    handleDeleteMessage: deleteMessage.mutate,
    refetchMessages: refetch,
  };
}
