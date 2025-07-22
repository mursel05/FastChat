"use client";
import { ChatType } from "@/models/chat";
import { UserType } from "@/models/user";
import { createContext, useRef, useState } from "react";
import { ReactNode } from "react";
import useWebSocket from "react-use-websocket";

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
  open: "",
  setOpen: (open: any) => {},
  pcRef: { current: null as RTCPeerConnection | null },
  call: "",
  setCall: (call: string) => {},
  localVideoRef: { current: null as HTMLVideoElement | null },
  remoteVideoRef: { current: null as HTMLVideoElement | null },
  lastMessage: null as MessageEvent | null,
  sendMessage: (message: string) => {},
  callingUserId: "",
  setCallingUserId: (userId: string) => {},
  startCall: async (userId: string | undefined) => {},
  answerCall: async () => {},
  endCall: () => {},
  offer: undefined as RTCSessionDescriptionInit | undefined,
  setOffer: (offer: RTCSessionDescriptionInit | undefined) => {},
});

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [chats, setChats] = useState<ChatType[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [user, setUser] = useState<UserType>();
  const [currentChat, setCurrentChat] = useState<ChatType>();
  const [currentUser, setCurrentUser] = useState<UserType>();
  const [open, setOpen] = useState<string>("");
  const messagesRef = useRef<HTMLDivElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const [call, setCall] = useState<string>("");
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL;
  const { lastMessage, sendMessage } = useWebSocket(wsUrl as string, {
    share: false,
    shouldReconnect: () => true,
  });
  const [callingUserId, setCallingUserId] = useState<string>("");
  const [offer, setOffer] = useState<RTCSessionDescriptionInit>();

  const startCall = async (userId: string | undefined) => {
    setOpen("call");
    setCall("answering");
    setCallingUserId(userId || "");
    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    localVideoRef.current!.srcObject = localStream;

    const pc = new RTCPeerConnection();
    pcRef.current = pc;
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendMessage(
          JSON.stringify({
            type: "callCandidate",
            data: { candidate: event.candidate, userId },
          })
        );
      }
    };
    pc.ontrack = (event) => {
      remoteVideoRef.current!.srcObject = event.streams[0];
    };

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);

    sendMessage(
      JSON.stringify({
        type: "callOffer",
        data: { offer, userId },
      })
    );
  };

  const answerCall = async () => {
    setCall("answering");
    const pc = new RTCPeerConnection();
    pcRef.current = pc;

    const localStream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    localVideoRef.current!.srcObject = localStream;
    localStream.getTracks().forEach((track) => pc.addTrack(track, localStream));

    pc.onicecandidate = (event) => {
      if (event.candidate)
        sendMessage(
          JSON.stringify({
            type: "callCandidate",
            data: { candidate: event.candidate, userId: callingUserId },
          })
        );
    };
    pc.ontrack = (event) => {
      remoteVideoRef.current!.srcObject = event.streams[0];
    };

    await pc.setRemoteDescription(offer as RTCSessionDescriptionInit);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    sendMessage(
      JSON.stringify({
        type: "callAnswer",
        data: { answer, userId: callingUserId },
      })
    );
  };

  const endCall = () => {
    setCall("");
    setOpen("");
    if (localVideoRef.current?.srcObject) {
      const localStream = localVideoRef.current.srcObject as MediaStream;
      localStream.getTracks().forEach((track) => {
        track.stop();
      });
      localVideoRef.current.srcObject = null;
    }
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    sendMessage(
      JSON.stringify({
        type: "callEnd",
        data: { userId: callingUserId },
      })
    );
    setCallingUserId("");
  };

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
    open,
    setOpen,
    pcRef,
    call,
    setCall,
    localVideoRef,
    remoteVideoRef,
    lastMessage,
    sendMessage,
    callingUserId,
    setCallingUserId,
    startCall,
    answerCall,
    endCall,
    offer,
    setOffer,
  };

  return (
    <DataContext.Provider value={contextData}>{children}</DataContext.Provider>
  );
};
