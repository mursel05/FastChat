import { DataContext } from "@/context/ApiContext";
import axiosInstance from "@/utils/axios";
import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";
import { FileIcon, defaultStyles } from "react-file-icon";
import { v4 as uuidv4 } from "uuid";

const SendMessage = () => {
  const { currentChat, messagesRef, setChats, user } = useContext(DataContext);
  const [text, setText] = useState("");
  const [showText, setShowText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();
  const [showFile, setShowFile] = useState<File>();

  async function sendText() {
    try {
      if (text) {
        const tempId = uuidv4();
        if (user && currentChat) {
          setChats((prev) =>
            prev.map((chat) =>
              chat.id == currentChat?.id
                ? {
                    ...chat,
                    messages: [
                      ...chat.messages,
                      {
                        id: tempId,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        chatId: currentChat?.id,
                        sender: user?.id,
                        message: text,
                        mediaUrl: "",
                        messageType: "text",
                        deleteMessage: [],
                        seen: [],
                        reactions: [],
                        sent: false,
                      },
                    ],
                  }
                : chat
            )
          );
        }
        await axiosInstance.post("/messages", {
          id: tempId,
          chatId: currentChat?.id,
          message: text,
          mediaUrl: "",
          messageType: "text",
        });
        messagesRef.current?.scrollTo({
          top: messagesRef.current?.scrollHeight,
          behavior: "smooth",
        });
        setText("");
      }
    } catch (error) {}
  }

  async function uploadFile(tempId: string) {
    try {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await axiosInstance.post("/files", formData);
        if (res.data.success) {
          const response = await axiosInstance.post("/messages", {
            id: tempId,
            chatId: currentChat?.id,
            message: text,
            mediaUrl: res.data.data.filePath,
            messageType: res.data.data.fileType,
          });
          if (response.data.success) {
            setFile(undefined);
            setText("");
          }
        }
      }
    } catch (error) {}
  }

  async function sendFile() {
    const tempId = uuidv4();
    uploadFile(tempId);
    if (user && currentChat && file) {
      setChats((prev) =>
        prev.map((chat) =>
          chat.id == currentChat?.id
            ? {
                ...chat,
                messages: [
                  ...chat.messages,
                  {
                    id: tempId,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    chatId: currentChat?.id,
                    sender: user?.id,
                    message: text,
                    mediaUrl: "",
                    messageType: file.name.split(".")[1],
                    deleteMessage: [],
                    seen: [],
                    reactions: [],
                    sent: false,
                  },
                ],
              }
            : chat
        )
      );
    }
    messagesRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
    setShowText("");
    setShowFile(undefined);
  }

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter") {
        if (file) {
          sendFile();
        } else {
          sendText();
        }
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [text]);

  if (showFile) {
    return (
      <div className="flex justify-center w-full relative">
        <div className="bg-white p-3 rounded-xl flex flex-col gap-2 absolute bottom-0">
          <div className="flex items-center justify-between gap-2">
            <div className="cursor-pointer hover:bg-[var(--light-grey)] rounded-full p-2">
              <Image
                src="/icons/dismis.png"
                alt="dismis"
                width={24}
                height={24}
                className="cursor-pointer"
                onClick={() => {
                  setFile(undefined);
                  setShowFile(undefined);
                }}
              />
            </div>
            <button
              onClick={sendFile}
              className="text-white bg-[var(--light-green)] text-[16px] font-[400] rounded-3xl px-3 py-1">
              SEND
            </button>
          </div>
          {file?.type.includes("image") ? (
            <Image
              src={URL.createObjectURL(file)}
              alt="dismis"
              width={200}
              height={200}
              className="w-full h-full max-w-[600px] max-h-[600px] self-center"
            />
          ) : file?.type.includes("audio") ? (
            <audio src={URL.createObjectURL(file)} controls></audio>
          ) : file?.type.includes("video") ? (
            <video src={URL.createObjectURL(file)} controls></video>
          ) : (
            <div className="w-[100px] h-[100px] self-center mb-5">
              <FileIcon
                extension={file?.name.split(".")[1]}
                {...defaultStyles[
                  file?.type.split("/")[1] as keyof typeof defaultStyles
                ]}
              />
            </div>
          )}
          <input
            type="text"
            className="border-[var(--light-blue-grey)] p-2 outline-none border rounded-xl text-[var(--navy-grey)] text-[16px] font-[400]"
            placeholder="Caption"
            value={showText}
            onChange={(e) => {
              setText(e.target.value);
              setShowText(e.target.value);
            }}
          />
        </div>
      </div>
    );
  } else {
    return (
      <div className="bg-white flex items-center px-2 py-2 rounded-xl gap-2">
        <input
          type="file"
          className="hidden"
          ref={fileRef}
          onChange={(e) => {
            if (e.target.files) {
              setFile(e.target.files[0]);
              setShowFile(e.target.files[0]);
            }
          }}
        />
        <div
          onClick={() => fileRef.current?.click()}
          className="cursor-pointer hover:bg-[var(--light-grey)] rounded-full p-2">
          <Image src="/icons/file.png" width={24} height={24} alt="file" />
        </div>
        <input
          autoFocus
          type="text"
          className="w-full outline-none text-[var(--navy-grey)] text-[16px] font-[400]"
          placeholder="Message"
          value={showText}
          onChange={(e) => {
            setText(e.target.value);
            setShowText(e.target.value);
          }}
        />
        <div
          onClick={sendText}
          className="cursor-pointer hover:bg-[var(--light-grey)] rounded-full p-2">
          <Image src="/icons/send.png" width={24} height={24} alt="send" />
        </div>
      </div>
    );
  }
};

export default SendMessage;
