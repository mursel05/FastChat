import { DataContext } from "@/context/ApiContext";
import axiosInstance from "@/utils/axios";
import Image from "next/image";
import { useContext, useState } from "react";

const ChatHeader = () => {
  const {
    currentUser,
    setCurrentChat,
    currentChat,
    setChats,
    call,
    startCall,
    setOpen,
  } = useContext(DataContext);
  const [isOpen, setIsOpen] = useState(false);

  const formatLastSeen = (lastSeen: string) => {
    if (lastSeen === "online") return "online";

    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffMs = now.getTime() - lastSeenDate.getTime();
    const diffSeconds = Math.floor(diffMs / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);

    if (diffSeconds < 60) {
      return `last seen ${diffSeconds} second${
        diffSeconds !== 1 ? "s" : ""
      } ago`;
    } else if (diffMinutes < 60) {
      return `last seen ${diffMinutes} minute${
        diffMinutes !== 1 ? "s" : ""
      } ago`;
    } else if (diffHours < 24) {
      return `last seen ${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
    } else {
      return `last seen on ${lastSeenDate.toLocaleDateString()}`;
    }
  };

  async function deleteChat() {
    try {
      const res = await axiosInstance.delete("/chats/" + currentChat?.id);
      if (res.data.success) {
        setCurrentChat(undefined);
        setChats((prevChats) =>
          prevChats.filter((chat) => chat.id !== currentChat?.id)
        );
      }
    } catch {}
  }

  return (
    <div className="relative flex items-center gap-4 py-3 px-4 border-l border-[var(--light-blue-grey)] bg-white">
      <Image
        src={currentUser?.photo || "/images/no-profile.jpg"}
        width={100}
        height={100}
        alt="user"
        className="rounded-full w-[3rem] h-[3rem] object-cover"
      />
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center justify-between">
          <span className="text-[1rem] font-[600] max-lg:text-[0.9rem] leading-[1.15rem]">
            {(currentUser?.surname ?? "") + " " + (currentUser?.name ?? "")}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[var(--navy-grey)] text-[0.9rem] font-[400] leading-[1.15rem] max-lg:text-[0.85rem]">
            {formatLastSeen(currentUser?.lastSeen ?? "")}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="cursor-pointer hover:bg-[var(--light-grey)] rounded-full p-2 max-lg:p-0 max-lg:hover:bg-[unset]">
          <div></div>
          <Image
            src="/icons/search.png"
            width={35}
            height={35}
            alt="search"
            className="min-w-6 h-6"
          />
        </div>
        <div
          className="cursor-pointer hover:bg-[var(--light-grey)] rounded-full p-2 max-lg:p-0 max-lg:hover:bg-[unset]"
          onClick={() => (call ? setOpen("call") : startCall(currentUser?.id))}>
          <Image
            src="/icons/call.png"
            width={35}
            height={35}
            alt="phone"
            className="min-w-6 h-6"
          />
        </div>
        <div
          className="cursor-pointer hover:bg-[var(--light-grey)] rounded-full p-2 max-lg:p-0 max-lg:hover:bg-[unset]"
          onClick={() => setIsOpen(!isOpen)}>
          <Image
            src="/icons/more.png"
            width={35}
            height={35}
            alt="more"
            className="min-w-6 h-6"
          />
        </div>
      </div>
      <div
        className="max-h-0 overflow-hidden transition-all duration-300 ease-in-out z-50 absolute right-[2rem] max-lg:right-[1rem] top-[3.5rem] bg-white rounded-md flex flex-col border-[var(--light-blue-grey)]"
        style={{
          maxHeight: isOpen ? "200px" : "0",
          borderWidth: isOpen ? "1px" : "0",
        }}>
        <div
          className="flex items-center gap-2 py-2 px-4 hover:bg-[var(--light-grey)] rounded-md cursor-pointer"
          onClick={deleteChat}>
          <Image
            src="/icons/delete.png"
            width={15}
            height={15}
            alt="delete"
            className="w-4 h-4"
          />
          <p className="font-[400] text-[#707991] text-[0.9rem]">Delete</p>
        </div>
        <div
          className="flex items-center gap-2 py-2 px-4 hover:bg-[var(--light-grey)] rounded-md cursor-pointer"
          onClick={() => setCurrentChat(undefined)}>
          <Image
            src="/icons/close.png"
            width={15}
            height={15}
            alt="close"
            className="w-4 h-4"
          />
          <p className="font-[400] text-[#707991] text-[0.9rem]">Close</p>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
