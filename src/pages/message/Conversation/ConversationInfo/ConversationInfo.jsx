import { useEffect, useState } from "react";
import { getConversationName } from "../../../../utils/conversation/ConversationName";
import getFollowStatus from "../../../../utils/user/GetFollowStatus";

import AvatarChat from "../../../../components/common/AvatarChat";
import useAddMembers from "../hook/useAddMembers";
import useLeaveConversation from "../hook/useLeaveConversation";
import useSnoozeConversation from "../hook/useSnoozeConversation";
import useUpdateGroup from "../hook/useUpdateGroup";
import AddMemberModal from "./AddMemberModal";
import ConversationHeader from "./ConversationHeader";
import ConversationMembers from "./ConversationMembers";
import ConversationNotifications from "./ConversationNotifications";
import EditGroupModal from "./EditGroupModal";

export default function ConversationInfo({
  onBack,
  conversation,
  user,
  authUser,
  setSelectedConversationId,
  setShowConversationInfo,
}) {
  const [search, setSearch] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState(conversation?.name || "");
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [isMuted, setMuted] = useState(false);

  const { mutate: UpdateGroup, isPending: isPendingUpdate } = useUpdateGroup(
    conversation?._id,
  );
  const { mutate: AddMembers, isPending: isPendingAdd } = useAddMembers(
    conversation?._id,
  );

  const { mutate: MuteConversation } = useSnoozeConversation(
    conversation?._id,
    authUser,
  );

  const { mutate: LeaveConversation, isPending: isPendingLeave } =
    useLeaveConversation(conversation?._id);

  const { fullName, username } = getConversationName(conversation, authUser);

  useEffect(() => {
    if (conversation?.participants.length > 0) {
      const { isMuted } = conversation.participants.find(
        (p) => p.user._id === authUser._id,
      );
      setMuted(isMuted);
    }
  }, [conversation?.participants]);

  const statusFlow = user
    ? getFollowStatus(authUser, user)
    : getFollowStatus(
        authUser,
        conversation?.participants.find((p) => p.user._id !== authUser._id)
          ?.user,
      );

  const toggleSelectUser = (user) => {
    setSelectedUsers((prev) =>
      prev.some((u) => u._id === user._id)
        ? prev.filter((u) => u._id !== user._id)
        : [...prev, user],
    );
  };

  const handleLeave = () => {
    LeaveConversation();
    setSelectedConversationId(null);
    setShowConversationInfo(false);
  };

  const handleMute = () => {
    MuteConversation({ formData: { mute: !isMuted } });
  };

  const handleUpdateGroup = () => {
    const formData = new FormData();
    if (groupAvatar) formData.append("media", groupAvatar);
    if (groupName !== conversation?.name) formData.append("name", groupName);
    UpdateGroup({ formData });
  };

  const handleAddMembers = () => {
    const newUserIds = selectedUsers.map((user) => user._id);
    AddMembers({ formData: { newUserIds } });
  };

  return (
    <div className="flex flex-col h-full">
      <ConversationHeader onBack={onBack} conversation={conversation} />

      <div className="flex-1 overflow-y-auto p-4 text-gray-300 space-y-6 divide-y divide-gray-700">
        {/* Info user/group */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AvatarChat
              conversation={conversation ? conversation : null}
              user={user ? user : null}
              authUser={authUser}
            />
            <div className="flex flex-col">
              <h3 className="text-white font-semibold">{fullName}</h3>
              {!conversation?.isGroup && (
                <p className="text-sm text-gray-400">@{username}</p>
              )}
            </div>
          </div>

          {/* Nút action */}
          {conversation?.isGroup ? (
            <button
              className="px-3 py-1 text-sm rounded bg-gray-700 hover:bg-gray-600 text-gray-200"
              onClick={() =>
                document.getElementById("edit_group_modal")?.showModal()
              }
            >
              Edit
            </button>
          ) : statusFlow === "follow" ? (
            <button className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm">
              Follow
            </button>
          ) : statusFlow === "unfollow" ? (
            <button className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm">
              Unfollow
            </button>
          ) : (
            statusFlow === "following" && (
              <button className="btn bg-white text-black hover:bg-white hover:opacity-90 rounded-full btn-sm">
                Following
              </button>
            )
          )}
        </div>

        {/* Members list */}
        {conversation?.isGroup && (
          <div className="pt-4">
            <ConversationMembers
              conversation={conversation}
              authUser={authUser}
            />
          </div>
        )}

        <ConversationNotifications
          isMuted={isMuted}
          handleLeave={handleLeave}
          handleMute={handleMute}
          isPendingLeave={isPendingLeave}
          authUser={authUser}
          conversation={conversation}
        />
      </div>

      <EditGroupModal
        conversation={conversation}
        authUser={authUser}
        groupName={groupName}
        setGroupName={setGroupName}
        groupAvatar={groupAvatar}
        setGroupAvatar={setGroupAvatar}
        handleUpdateGroup={handleUpdateGroup}
        isPending={isPendingUpdate}
      />

      <AddMemberModal
        conversation={conversation}
        authUser={authUser}
        search={search}
        setSearch={setSearch}
        selectedUsers={selectedUsers}
        toggleSelectUser={toggleSelectUser}
        handleAddMembers={handleAddMembers}
        isPending={isPendingAdd}
      />
    </div>
  );
}
