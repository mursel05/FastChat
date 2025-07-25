import { useContext, useEffect } from "react";
import Message from "./Message";
import { DataContext } from "@/context/ApiContext";

const Messages = () => {
  const { currentChat, messagesRef } = useContext(DataContext);
  return (
    <div
      ref={messagesRef}
      className="flex flex-col gap-5 py-5 overflow-y-auto scrollbar-hide h-full">
      {currentChat?.messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}
    </div>
  );
};

export default Messages;
