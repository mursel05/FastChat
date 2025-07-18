import Image from "next/image";
import SearchBar from "./SearchBar";
import UserChatModal from "./UserChatModal";
import { useContext, useState, useEffect } from "react";
import { ChatType } from "@/models/chat";
import { DataContext } from "@/context/ApiContext";
import axiosInstance from "@/utils/axios";
import { UserType } from "@/models/user";
import UserModal from "./UserModal";

const Chats = () => {
  const { chats, currentChat, setOpenSettings } = useContext(DataContext);
  const [email, setEmail] = useState<string>("");
  const [searchUsers, setSearchUsers] = useState<UserType[]>([]);

  useEffect(() => {
    async function getUser() {
      try {
        const res = await axiosInstance.get(`/users/${email}`);
        setSearchUsers(res.data.data);
      } catch (error) {}
    }
    email && getUser();
  }, [email]);

  useEffect(() => {
    setEmail("");
  }, [currentChat]);

  return (
    <div className="flex flex-col w-max">
      <div className="flex items-center gap-7 py-4 px-6">
        <div
          className="cursor-pointer hover:bg-[var(--light-grey)] rounded-full p-2"
          onClick={() => setOpenSettings((prev: Boolean) => !prev)}>
          <Image src="/icons/menu.png" width={24} height={24} alt="menu" />
        </div>
        <SearchBar email={email} setEmail={setEmail} />
      </div>
      <div className="flex flex-col">
        {email
          ? searchUsers.map((user: UserType) => (
              <UserModal key={user.id} user={user} />
            ))
          : chats.map((chat: ChatType) => (
              <UserChatModal key={chat.id} chat={chat} />
            ))}
      </div>
    </div>
  );
};

export default Chats;
