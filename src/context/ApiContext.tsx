"use client";
import { ChatType } from "@/models/chat";
import { UserType } from "@/models/user";
import { createContext, useRef, useState } from "react";
import { ReactNode } from "react";

export const DataContext = createContext({
  chats: [] as ChatType[],
  setChats: (chats: (prev: ChatType[]) => ChatType[]) => {},
  users: [] as UserType[],
  setUsers: (users: (prev: UserType[]) => UserType[]) => {},
  user: undefined as UserType | undefined,
  setUser: (user: UserType) => {},
  currentChat: undefined as ChatType | undefined,
  setCurrentChat: (chat: ChatType | undefined) => {},
  currentUser: undefined as UserType | undefined,
  setCurrentUser: (user: UserType) => {},
  messagesRef: { current: null as HTMLDivElement | null },
  openSettings: false as Boolean,
  setOpenSettings: (open: any) => {},
});

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [chats, setChats] = useState<ChatType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [user, setUser] = useState<UserType>();
  const [currentChat, setCurrentChat] = useState<ChatType>();
  const [currentUser, setCurrentUser] = useState<UserType>();
  const [openSettings, setOpenSettings] = useState<Boolean>(false);
  const messagesRef = useRef<HTMLDivElement | null>(null);

  const contextData = {
    chats,
    setChats,
    users,
    setUsers,
    user,
    setUser,
    currentChat,
    setCurrentChat,
    currentUser,
    setCurrentUser,
    messagesRef,
    openSettings,
    setOpenSettings,
  };

  return (
    <DataContext.Provider value={contextData}>{children}</DataContext.Provider>
  );
};
