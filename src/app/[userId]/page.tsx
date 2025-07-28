"use client";
import ChatHeader from "@/components/ChatHeader";
import Chats from "@/components/Chats";
import Messages from "@/components/Messages";
import SendMessage from "@/components/SendMessage";
import { DataContext } from "@/context/ApiContext";
import useEffects from "@/utils/useEffects";
import { wsHandler } from "@/utils/ws";
import { useParams, useRouter } from "next/navigation";
import { useContext, useEffect, useState } from "react";

const Page = () => {
  const { currentChat, chats, setCurrentChat, users } = useContext(DataContext);
  const [isLaptop, setIsLaptop] = useState(true);
  const { userId: chatId } = useParams();
  const router = useRouter();

  wsHandler();
  useEffects();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 640px)");
    setIsLaptop(mediaQuery.matches);
  }, []);

  useEffect(() => {
    if (chatId && chats.length > 0 && users.length > 0) {
      const chat = chats.find((chat) => chat.id === chatId);
      if (chat) {
        setCurrentChat(chat);
      } else {
        router.push("/");
      }
    }
  }, [chatId, chats, users]);

  return (
    <div className="flex" style={{ height: isLaptop ? "100vh" : "100svh" }}>
      {(isLaptop || !currentChat) && <Chats />}
      <div className="flex flex-col flex-1 bg-[var(--iceberg-blue)] bg-[url('/images/bg-image.png')]">
        {currentChat && (
          <>
            <ChatHeader />
            <div className="px-40 max-lg:px-4 pb-8 flex flex-col gap-2 bg-[var(--iceberg-blue)] bg-[url('/images/bg-image.png')] h-[calc(100%-4.5rem)] relative">
              <Messages />
              <SendMessage />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Page;
