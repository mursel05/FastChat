import { DataContext } from "@/context/ApiContext";
import { useContext, useEffect } from "react";
import useWebSocket from "react-use-websocket";

export const wsHandler = () => {
  const { setChats, setUsers, user, chats } = useContext(DataContext);
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "";
  const { lastMessage } = useWebSocket(wsUrl, {
    share: false,
    shouldReconnect: () => true,
  });

  useEffect(() => {
    if (lastMessage !== null) {
      const res = JSON.parse(lastMessage.data);
      if (res.type == "lastSeen") {
        setUsers((prev) =>
          prev.map((u) => (u.id == res.data.userId ? { ...u, ...res.data } : u))
        );
      } else if (res.type == "message") {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id == res.data.chatId
              ? {
                  ...chat,
                  messages: chat.messages.map((msg) =>
                    msg.id == res.data.id ? res.data : msg
                  ),
                  unSeenMessages:
                    res.data.sender == user?.id
                      ? chat.unSeenMessages
                      : chat.unSeenMessages + 1,
                }
              : chat
          )
        );
      } else if (res.type == "seen") {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id == res.data.chatId
              ? {
                  ...chat,
                  messages: chat.messages.map((msg) =>
                    msg.id == res.data.id
                      ? { ...msg, seen: res.data.seen }
                      : msg
                  ),
                  unSeenMessages:
                    res.data.sender == user?.id
                      ? chat.unSeenMessages
                      : chat.unSeenMessages - 1,
                }
              : chat
          )
        );
      }
    }
  }, [lastMessage]);
};
