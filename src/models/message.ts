type SeenType = {
  userId: string;
  seenAt: Date;
};

type ReactionType = {
  userId: string;
  reactionType: string;
};

export type MessageType = {
  id: string;
  chatId: string;
  sender: string;
  message: string;
  mediaUrl: string;
  createdAt: string;
  updatedAt: string;
  seen: SeenType[];
  reactions: ReactionType[];
  messageType: string;
  deleteMessage: string[];
  sent: boolean;
};
