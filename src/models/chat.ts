import { MessageType } from "./message";

type PersonType = {
  userId: string;
  role: string;
  joinedAt: Date;
  deleteChat: boolean;
};

export type ChatType = {
  id: string;
  isGroup: boolean;
  chatName: string;
  chatPhoto: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  persons: PersonType[];
  messages: MessageType[];
  unSeenMessages: number;
};
