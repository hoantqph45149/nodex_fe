export const formatPostDate = (createdAt) => {
  const currentDate = new Date();
  const createdAtDate = new Date(createdAt);
  const timeDifferenceInSeconds = Math.floor(
    (currentDate - createdAtDate) / 1000
  );
  const timeDifferenceInMinutes = Math.floor(timeDifferenceInSeconds / 60);
  const timeDifferenceInHours = Math.floor(timeDifferenceInMinutes / 60);
  const timeDifferenceInDays = Math.floor(timeDifferenceInHours / 24);
  if (timeDifferenceInDays > 1) {
    return createdAtDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } else if (timeDifferenceInDays === 1) {
    return "1d";
  } else if (timeDifferenceInHours >= 1) {
    return `${timeDifferenceInHours}h`;
  } else if (timeDifferenceInMinutes >= 1) {
    return `${timeDifferenceInMinutes}m`;
  } else {
    return "Just now";
  }
};
export const formatMemberSinceDate = (createdAt) => {
  const date = new Date(createdAt);
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `Joined ${month} ${year}`;
};

export function shouldShowTimeSeparator(currentMsg, prevMsg) {
  if (!prevMsg) return true;

  const current = new Date(currentMsg.createdAt);
  const prev = new Date(prevMsg.createdAt);

  const diff = current - prev;

  const THIRTY_MIN = 30 * 60 * 1000;

  const isDifferentDay =
    current.toDateString() !== prev.toDateString();

  return diff > THIRTY_MIN || isDifferentDay;
}

export function shouldShowMessageTime(message, nextMsg) {
  if (!nextMsg) return true;

  const sameSender =
    message.senderId?._id === nextMsg.senderId?._id;

  const diff =
    new Date(nextMsg.createdAt) - new Date(message.createdAt);

  const FIVE_MIN = 5 * 60 * 1000;

  return !sameSender || diff > FIVE_MIN;
}

 export function formatTimeHeader(date) {
  const d = new Date(date);
  const today = new Date();

  const isToday = d.toDateString() === today.toDateString();

  const time = d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (isToday) return `${time} Hôm nay`;

  return `${time} ${d.toLocaleDateString()}`;
}