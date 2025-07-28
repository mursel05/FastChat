import { UserType } from "@/models/user";
import Image from "next/image";

interface ChatHeaderProps {
  callingUser: UserType | undefined;
}

const ChatHeader = ({ callingUser }: ChatHeaderProps) => {
  return (
    <div className="z-50 w-full relative">
      <div className="absolute w-full flex items-center gap-4 py-3 px-4 border-l border-[var(--light-blue-grey)] bg-black/40">
        <Image
          src={callingUser?.photo || "/images/no-profile.jpg"}
          width={100}
          height={100}
          alt="user"
          className="rounded-full w-[3rem] h-[3rem] object-cover"
        />
        <div className="flex flex-col gap-1 w-full">
          <div className="flex items-center justify-between">
            <span className="text-[1rem] font-[600] max-lg:text-[0.9rem] leading-[1.15rem] text-white">
              {(callingUser?.surname ?? "") + " " + (callingUser?.name ?? "")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHeader;
