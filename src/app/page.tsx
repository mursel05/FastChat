"use client";
import Answering from "@/components/Answering";
import Calling from "@/components/Calling";
import ChatHeader from "@/components/ChatHeader";
import Chats from "@/components/Chats";
import Messages from "@/components/Messages";
import SendMessage from "@/components/SendMessage";
import Settings from "@/components/Settings";
import { DataContext } from "@/context/ApiContext";
import useEffects from "@/utils/useEffects";
import { wsHandler } from "@/utils/ws";
import { useContext, useEffect, useState } from "react";

const Home = () => {
  const { currentChat, open, call } = useContext(DataContext);
  const [isLaptop, setIsLaptop] = useState(true);
  wsHandler();
  useEffects();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 640px)");
    setIsLaptop(mediaQuery.matches);
  }, []);

  return (
    <div className="flex h-screen">
      {(isLaptop || !(open || currentChat)) && <Chats />}
      <div className="flex flex-col flex-1 bg-[var(--iceberg-blue)] bg-[url('/images/bg-image.png')]">
        {open == "call" ? (
          call === "calling" ? (
            <Calling />
          ) : (
            <Answering />
          )
        ) : open == "settings" ? (
          <Settings />
        ) : (
          currentChat && (
            <>
              <ChatHeader />
              <div className="px-40 max-lg:px-4 pb-8 flex flex-col gap-2 bg-[var(--iceberg-blue)] bg-[url('/images/bg-image.png')] h-[calc(100%-72px)] relative">
                <Messages />
                <SendMessage />
              </div>
            </>
          )
        )}
      </div>
    </div>
  );
};

export default Home;
