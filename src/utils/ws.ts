import { DataContext } from "@/context/ApiContext";
import { useContext, useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import axiosInstance from "./axios";

export const wsHandler = () => {
  const { setChats, setUsers, user, chats } = useContext(DataContext);
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "";
  const { lastMessage } = useWebSocket(wsUrl, {
    share: false,
    shouldReconnect: () => true,
  });

  useEffect(() => {
    async function getChat(id: string) {
      try {
        const res = await axiosInstance.get("/chats/" + id);
        if (res.data.success) {
          return res.data.data;
        }
      } catch {}
    }

    async function handleMessage(res: any) {
      const existingChatIndex = chats.findIndex(
        (chat) => chat.id === res.data.chatId
      );

      if (existingChatIndex !== -1) {
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === res.data.chatId
              ? {
                  ...chat,
                  messages: chat.messages.some((msg) => msg.id === res.data.id)
                    ? chat.messages.map((msg) =>
                        msg.id === res.data.id ? res.data : msg
                      )
                    : [...chat.messages, res.data],
                  unSeenMessages:
                    res.data.sender === user?.id
                      ? chat.unSeenMessages
                      : chat.unSeenMessages + 1,
                }
              : chat
          )
        );
      } else {
        const newChat = await getChat(res.data.chatId);
        if (newChat) {
          setChats((prev) => [...prev, newChat]);
        }
      }
    }

    function handleSeen(res: any) {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id == res.data.chatId
            ? {
                ...chat,
                messages: chat.messages.map((msg) =>
                  msg.id == res.data.id ? { ...msg, seen: res.data.seen } : msg
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

    if (lastMessage !== null) {
      const res = JSON.parse(lastMessage.data);

      if (res.type === "lastSeen") {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === res.data.userId ? { ...u, ...res.data } : u
          )
        );
      } else if (res.type === "message") {
        handleMessage(res);
      } else if (res.type === "seen") {
        handleSeen(res);
      }
    }
  }, [lastMessage]);
};
