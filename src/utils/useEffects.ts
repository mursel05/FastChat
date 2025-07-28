import { DataContext } from "@/context/ApiContext";
import { useContext, useEffect } from "react";
import axiosInstance from "./axios";
import { useParams, useRouter } from "next/navigation";

const useEffects = () => {
  const {
    user,
    setUser,
    chats,
    setChats,
    currentChat,
    setCurrentChat,
    users,
    currentUser,
    setCurrentUser,
    messagesRef,
    call,
  } = useContext(DataContext);
  const router = useRouter();
  const { userId } = useParams();

  useEffect(() => {
    async function getUser() {
      try {
        const res = await axiosInstance.get("/users");
        if (res.data.success) {
          setUser(res.data.data);
        }
      } catch (error) {}
    }
    async function getChats() {
      try {
        const res = await axiosInstance.get("/chats");
        if (res.data.success) {
          setChats(res.data.data);
        }
      } catch (error) {}
    }

    getUser();
    getChats();
  }, []);

  useEffect(() => {
    const foundChat = chats.find((c) => c.id === currentChat?.id);
    if (foundChat) {
      setCurrentChat(foundChat);
    }
  }, [chats.find((c) => c.id === currentChat?.id)?.messages]);

  useEffect(() => {
    const firstUnseenMessage = document
      .querySelector(
        `[data-message-id="${
          currentChat?.messages.find(
            (m) =>
              !m.seen.some((s) => s.userId === user?.id) &&
              m.sender !== user?.id
          )?.id
        }"]`
      )
      ?.getBoundingClientRect();

    if (firstUnseenMessage) {
      messagesRef.current?.scrollTo({
        top: firstUnseenMessage?.top - firstUnseenMessage?.height - 20,
        behavior: "smooth",
      });
    } else {
      messagesRef.current?.scrollTo({
        top: messagesRef.current?.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messagesRef.current]);

  useEffect(() => {
    const currentUserId =
      currentChat?.persons[0].userId === user?.id
        ? currentChat?.persons[1].userId
        : currentChat?.persons[0].userId;
    const existingUser = users.find((u) => u.id === currentUserId);
    if (existingUser) {
      setCurrentUser(existingUser);
    }
  }, [users.find((u) => u.id === currentUser?.id), currentChat]);
};

export default useEffects;
