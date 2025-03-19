import { useContext, useEffect } from "react";
import Message from "./Message";
import { DataContext } from "@/context/ApiContext";

const Messages = () => {
  const { currentChat, messagesRef } = useContext(DataContext);
  return (
    <div
      ref={messagesRef}
      className="flex flex-col gap-5 py-5 overflow-y-auto scrollbar-hide h-full">
      {/* <span className="self-center bg-[var(--blue-grey)] text-white font-[400] text-[16px] w-min px-3 py-[2px] rounded-3xl">
        Today
      </span> */}
      {currentChat?.messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </div>
  );
};

export default Messages;
