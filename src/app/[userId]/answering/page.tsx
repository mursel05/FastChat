"use client";
import Answering from "@/components/Answering";
import VideoHeader from "@/components/VideoHeader";
import Chats from "@/components/Chats";
import { DataContext } from "@/context/ApiContext";
import useEffects from "@/utils/useEffects";
import { wsHandler } from "@/utils/ws";
import { useParams } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import { UserType } from "@/models/user";

const Page = () => {
  const { currentChat, chats, setCurrentChat, users } = useContext(DataContext);
  const [isLaptop, setIsLaptop] = useState(true);
  const { userId } = useParams();
  const [callingUser, setCallingUser] = useState<UserType>();

  wsHandler();
  useEffects();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 640px)");
    setIsLaptop(mediaQuery.matches);
  }, []);

  useEffect(() => {
    if (userId && chats.length > 0 && users.length > 0) {
      const chat = chats.find((chat) => chat.id === userId);
      if (chat) {
        setCurrentChat(chat);
      }
    }
  }, [userId, chats, users]);

  useEffect(() => {
    if (userId) {
      const user = users.find((user) => user.id === userId);
      setCallingUser(user);
    }
  }, [userId, users]);

  return (
    <div className="flex h-screen">
      {(isLaptop || !currentChat) && <Chats />}
      <div className="flex flex-col flex-1 bg-[var(--iceberg-blue)] bg-[url('/images/bg-image.png')]">
        <VideoHeader callingUser={callingUser} />
        <Answering callingUser={callingUser} />
      </div>
    </div>
  );
};

export default Page;
