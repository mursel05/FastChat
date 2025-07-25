import { DataContext } from "@/context/ApiContext";
import { useContext, useEffect } from "react";
import axiosInstance from "./axios";

export const wsHandler = () => {
  const {
    setChats,
    setUsers,
    user,
    chats,
    pcRef,
    setCall,
    setOpen,
    lastMessage,
    setCallingUserId,
    setOffer,
    localVideoRef,
    remoteVideoRef,
    setCallingUserCamera,
    setCallingUserMicrophone,
  } = useContext(DataContext);

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

    async function handleCallOffer(res: any) {
      setOpen("call");
      setCall("calling");
      setCallingUserId(res.data.userId);
      setOffer(res.data.offer);
    }

    async function handleCallAnswer(res: any) {
      setCall("answering");
      if (pcRef.current)
        await pcRef.current.setRemoteDescription(res.data.answer);
    }

    async function handleCallCandidate(res: any) {
      if (pcRef.current)
        if (pcRef.current)
          await pcRef.current.addIceCandidate(res.data.candidate);
    }

    async function handleCallEnd() {
      setCall("");
      setOpen("");
      setCallingUserId("");
      if (localVideoRef.current?.srcObject) {
        const localStream = localVideoRef.current.srcObject as MediaStream;
        localStream.getTracks().forEach((track) => {
          track.stop();
        });
        localVideoRef.current.srcObject = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
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
      } else if (res.type === "callOffer") {
        handleCallOffer(res);
      } else if (res.type === "callAnswer") {
        handleCallAnswer(res);
      } else if (res.type === "callCandidate") {
        handleCallCandidate(res);
      } else if (res.type === "callEnd") {
        handleCallEnd();
      } else if (res.type === "callCamera") {
        setCallingUserCamera(res.data.allowCamera);
      } else if (res.type === "callMicrophone") {
        setCallingUserMicrophone(res.data.allowMicrophone);
      }
    }
  }, [lastMessage]);
};
