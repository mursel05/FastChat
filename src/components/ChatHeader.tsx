import { DataContext } from "@/context/ApiContext";
import Image from "next/image";
import { useContext } from "react";

const ChatHeader = () => {
  const { currentUser } = useContext(DataContext);

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

  return (
    <div className="flex items-center gap-4 py-3 px-4 border-l border-[var(--light-blue-grey)] bg-white">
      <Image
        src="/images/no-profile.jpg"
        width={48}
        height={48}
        alt="user"
        className="rounded-full ml-2"
      />
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-[600]">
            {(currentUser?.surname ?? "") + " " + (currentUser?.name ?? "")}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[var(--navy-grey)] text-[14px] font-[400] leading-[18px]">
            {formatLastSeen(currentUser?.lastSeen ?? "")}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="cursor-pointer hover:bg-[var(--light-grey)] rounded-full p-2">
          <Image src="/icons/search.png" width={35} height={35} alt="search" />
        </div>
        <div className="cursor-pointer hover:bg-[var(--light-grey)] rounded-full p-2">
          <Image src="/icons/call.png" width={35} height={35} alt="phone" />
        </div>
        <div className="cursor-pointer hover:bg-[var(--light-grey)] rounded-full p-2">
          <Image src="/icons/more.png" width={35} height={35} alt="more" />
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
