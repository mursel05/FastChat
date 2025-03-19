import { DataContext } from "@/context/ApiContext";
import { ChatType } from "@/models/chat";
import { UserType } from "@/models/user";
import axiosInstance from "@/utils/axios";
import Image from "next/image";
import { useContext } from "react";

interface UserModalProps {
  user: UserType;
}

const UserModal: React.FC<UserModalProps> = ({ user }) => {
  const { setChats, setCurrentChat, chats, setUsers } = useContext(DataContext);

  async function createChat() {
    const res = await axiosInstance.post("/chats", {
      isGroup: false,
      chatName: "",
      chatPhoto: "",
      persons: [user.id],
    });
    if (res.data.success) {
      setChats((prev) => [...prev, res.data.data]);
      setCurrentChat(res.data.data);
      setUsers((prev) => [...prev, user]);
    }
  }

  function openChat() {
    const currentChat = chats.find((chat) =>
      chat.persons.some((p) => p.userId === user.id)
    );
    if (currentChat) {
      setCurrentChat(currentChat);
    } else {
      createChat();
    }
  }

  return (
    <div
      onClick={openChat}
      className="flex items-center gap-4 py-3 px-4 hover:bg-[var(--light-grey)] cursor-pointer">
      <Image
        src={user?.photo || "/images/no-profile.jpg"}
        width={48}
        height={48}
        alt="user"
        className="rounded-full"
      />
      <div className="flex flex-col gap-1 w-full">
        <div className="flex items-center justify-between">
          <span className="text-[16px] font-[600]">{user?.name}</span>
        </div>
      </div>
    </div>
  );
};

export default UserModal;
