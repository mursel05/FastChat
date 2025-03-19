"use client";
import ChatHeader from "@/components/ChatHeader";
import Chats from "@/components/Chats";
import Messages from "@/components/Messages";
import SendMessage from "@/components/SendMessage";
import { DataContext } from "@/context/ApiContext";
import useEffects from "@/utils/useEffects";
import { wsHandler } from "@/utils/ws";
import { useContext } from "react";

const Home = () => {
  const { currentChat } = useContext(DataContext);
  wsHandler();
  useEffects();

  return (
    <div className="flex h-screen">
      <Chats />
      <div className="flex flex-col flex-1 bg-[var(--iceberg-blue)] bg-[url('/images/bg-image.png')]">
        {currentChat && (
          <>
            <ChatHeader />
            <div className="px-40 pb-8 flex flex-col gap-2 bg-[var(--iceberg-blue)] bg-[url('/images/bg-image.png')] h-[calc(100%-72px)] relative">
              <Messages />
              <SendMessage />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
