import { DataContext } from "@/context/ApiContext";
import { MessageType } from "@/models/message";
import axiosInstance from "@/utils/axios";
import Image from "next/image";
import { useCallback, useContext, useRef } from "react";
import { defaultStyles, FileIcon } from "react-file-icon";
import { saveAs } from "file-saver";

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const { currentUser, user, messagesRef } = useContext(DataContext);
  const observerRef = useRef<IntersectionObserver | null>(null);

  async function handleSeen(messageId: string) {
    try {
      await axiosInstance.post("/messages/seen-message", {
        messageId,
      });
    } catch (error) {}
  }

  const messageRefCallback = useCallback(
    (node: HTMLDivElement | null) => {
      if (!observerRef.current) {
        observerRef.current = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (
                entry.isIntersecting &&
                !message.seen.some((s) => s.userId === user?.id)
              ) {
                handleSeen(message.id);
              }
            });
          },
          {
            root: messagesRef.current,
          }
        );
      }
      if (node) {
        observerRef.current.observe(node);
      }
    },
    [messagesRef]
  );

  async function downloadFileWithProgress(
    url: string | URL | Request,
    filename: string | undefined,
    onProgress: (arg0: number) => void
  ) {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Network response was not ok");

    const contentLength = response.headers.get("Content-Length");
    if (!contentLength) throw new Error("Content-Length is missing");

    const total = parseInt(contentLength, 10);
    let loaded = 0;

    const reader = response.body?.getReader();
    const chunks = [];

    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        onProgress(Math.round((loaded / total) * 100));
      }
    }

    const blob = new Blob(chunks);
    saveAs(blob, filename);
  }

  // Usage

  if (currentUser) {
    return message.sender == currentUser?.id ? (
      <div
        ref={messageRefCallback}
        className="py-1 px-3 bg-white rounded-lg max-w-[60%] flex flex-col w-max relative"
        data-message-id={message.id}>
        {message.messageType != "text" &&
          (message.messageType.split("/")[0] == "image" ? (
            <Image
              src={message.mediaUrl}
              alt="user"
              width={600}
              height={600}
              onClick={() => saveAs(message.mediaUrl)}
              className="cursor-pointer"
            />
          ) : message.messageType.split("/")[0] == "video" ? (
            <video
              src={message.mediaUrl}
              controls
              width="300"
              height="300"
              onClick={() => saveAs(message.mediaUrl)}
              className="cursor-pointer"></video>
          ) : message.messageType.split("/")[0] == "audio" ? (
            <audio
              src={message.mediaUrl}
              controls
              onClick={() => saveAs(message.mediaUrl)}
              className="cursor-pointer"></audio>
          ) : (
            <div
              className="w-[100px] h-[100px] self-center mb-5 cursor-pointer"
              onClick={async () => {
                try {
                  const startTime = new Date().getTime();

                  // Fetch file
                  const response = await fetch(message.mediaUrl);
                  if (!response.ok) throw new Error("Failed to fetch file");

                  const blob = await response.blob(); // Convert response to Blob

                  const endTime = new Date().getTime();
                  const timeTaken = endTime - startTime;

                  saveAs(blob, "downloaded-file"); // Trigger file download
                  console.log(`Time taken to download: ${timeTaken}ms`);
                } catch (error) {
                  console.error("Download failed:", error);
                }
              }}>
              <FileIcon
                extension={message.messageType.split("/")[1]}
                {...defaultStyles[
                  message.messageType.split(
                    "/"
                  )[1] as keyof typeof defaultStyles
                ]}
              />
            </div>
          ))}
        <span className="font-[400] text-[16px]">{message.message}</span>
        <div className="self-end flex gap-2 items-center">
          {/* <span>❤️</span> */}
          <span className="text-[12px] font-[400] mt-1">
            {new Date(message.createdAt).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: false,
            })}
          </span>
        </div>
      </div>
    ) : (
      <div className="py-2 px-3 bg-[var(--light-green)] rounded-lg max-w-[60%] flex flex-col self-end w-max relative">
        {message.messageType != "text" &&
          (message.messageType.split("/")[0] == "image" ? (
            <Image
              src={message.mediaUrl}
              alt="user"
              width={600}
              height={600}
              onClick={() => saveAs(message.mediaUrl)}
              className="cursor-pointer"
            />
          ) : message.messageType.split("/")[0] == "video" ? (
            <video
              src={message.mediaUrl}
              controls
              width="300"
              height="300"
              onClick={() => saveAs(message.mediaUrl)}
              className="cursor-pointer"></video>
          ) : message.messageType.split("/")[0] == "audio" ? (
            <audio
              src={message.mediaUrl}
              controls
              onClick={() => saveAs(message.mediaUrl)}
              className="cursor-pointer"></audio>
          ) : (
            <div
              className="w-[100px] h-[100px] self-center mb-5 cursor-pointer"
              onClick={() =>
                downloadFileWithProgress(
                  message.mediaUrl,
                  "file.exe",
                  (progress) => {
                    console.log(`Download progress: ${progress}%`);
                  }
                )
              }>
              <FileIcon
                extension={message.messageType.split("/")[1]}
                {...defaultStyles[
                  message.messageType.split(
                    "/"
                  )[1] as keyof typeof defaultStyles
                ]}
              />
            </div>
          ))}
        <span className="font-[400] text-[16px]">{message.message}</span>
        <div className="self-end flex gap-2 items-center">
          {/* <span>❤️</span> */}
          <span className="text-[12px] font-[400] mt-1 text-white">
            {new Date(message.createdAt).toLocaleTimeString("en-US", {
              hour: "numeric",
              minute: "numeric",
              hour12: false,
            })}
          </span>
          <div
            className={`w-6 h-2 rounded-full ${
              !message.sent
                ? "bg-[var(--dark-grey)]"
                : message.seen.some((item) => item.userId == currentUser.id)
                ? "bg-[var(--dark-blue)] animate-seen"
                : "bg-[var(--dark-green)]"
            } flex items-center mt-1`}>
            <div
              className={`w-3 h-3 rounded-full ${
                !message.sent
                  ? "bg-[var(--dark-grey)]"
                  : message.seen.some((item) => item.userId == currentUser.id)
                  ? "bg-[var(--dark-blue)]"
                  : "bg-[var(--dark-green)]"
              }`}></div>
          </div>
        </div>
      </div>
    );
  }
};

export default Message;
