import { DataContext } from "@/context/ApiContext";
import { ChatType } from "@/models/chat";
import { UserType } from "@/models/user";
import axiosInstance from "@/utils/axios";
import Image from "next/image";
import { useContext, useEffect, useState } from "react";

interface UserChatModalProps {
  chat: ChatType;
}

const UserChatModal: React.FC<UserChatModalProps> = ({ chat }) => {
  const { users, user, setUsers, setCurrentChat, setOpen } =
    useContext(DataContext);
  const [otherUser, setOtherUser] = useState<UserType | undefined>();

  useEffect(() => {
    async function getUser(otherUserId: string) {
      try {
        const res = await axiosInstance.get(`/users/id/${otherUserId}`);
        if (res.data.success) {
          setUsers((prev) => [...prev, res.data.data]);
          setOtherUser(res.data.data);
        }
      } catch (error) {}
    }
    const otherUserId =
      chat.persons[0].userId === user?.id
        ? chat.persons[1].userId
        : chat.persons[0].userId;
    const existingUser = users.find((u) => u.id === otherUserId);
    setOtherUser(existingUser);
    if (!existingUser) {
      getUser(otherUserId);
    }
  }, []);

  function openChat() {
    setOpen("");
    setCurrentChat(chat);
  }

  return (
    <div
      onClick={openChat}
      className="flex items-center gap-4 py-3 px-4 hover:bg-[var(--light-grey)] cursor-pointer">
      <Image
        src={otherUser?.photo || "/images/no-profile.jpg"}
        width={100}
        height={100}
        alt="user"
        className="rounded-full w-[3rem] h-[3rem] object-cover"
      />
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center justify-between">
          <span className="text-[1rem] font-[600]">{otherUser?.name}</span>
          {chat.messages[chat.messages.length - 1] && (
            <span className="text-[var(--navy-grey)] text-[0.75rem] font-[400]">
              {new Date(
                chat.messages[chat.messages.length - 1].createdAt
              ).getDate() == new Date().getDate()
                ? new Date(
                    chat.messages[chat.messages.length - 1].createdAt
                  ).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "numeric",
                    hour12: false,
                  })
                : new Date(
                    chat.messages[chat.messages.length - 1].createdAt
                  ).toLocaleDateString("en-CA")}
            </span>
          )}
        </div>
        {chat.messages[chat.messages.length - 1] && (
          <div className="flex items-center justify-between">
            <span className="text-[var(--navy-grey)] text-[1rem] font-[400] truncate max-w-[15.625rem]">
              {chat.messages[chat.messages.length - 1].message}
            </span>
            {chat.unSeenMessages ? (
              <div className="bg-[var(--light-green)] text-[0.75rem] font-[400] rounded-full text-white w-5 h-5 flex items-center justify-center">
                <span>{chat.unSeenMessages}</span>
              </div>
            ) : (
              ""
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserChatModal;
