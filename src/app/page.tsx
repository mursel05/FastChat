"use client";
import Chats from "@/components/Chats";
import useEffects from "@/utils/useEffects";
import { wsHandler } from "@/utils/ws";
import { useEffect, useState } from "react";

const Home = () => {
  const [isLaptop, setIsLaptop] = useState(true);
  wsHandler();
  useEffects();

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 640px)");
    setIsLaptop(mediaQuery.matches);
  }, []);

  return (
    <div className="flex" style={{ height: isLaptop ? "100vh" : "100svh" }}>
      <Chats />
      <div className="flex flex-col flex-1 bg-[var(--iceberg-blue)] bg-[url('/images/bg-image.png')]"></div>
    </div>
  );
};

export default Home;
