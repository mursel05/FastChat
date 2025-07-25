import { DataContext } from "@/context/ApiContext";
import { MessageType } from "@/models/message";
import axiosInstance from "@/utils/axios";
import Image from "next/image";
import { useCallback, useContext, useRef, useState } from "react";
import { defaultStyles, FileIcon } from "react-file-icon";
import { saveAs } from "file-saver";
import Swal from "sweetalert2";

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const { currentUser, user, messagesRef } = useContext(DataContext);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [percent, setPercent] = useState(0);
  const [controller, setController] = useState<AbortController | null>(null);

  async function handleSeen(messageId: string) {
    try {
      await axiosInstance.post("/messages/seen-message", {
        messageId,
      });
    } catch (error) {}
  }

  function getFileExtension() {
    const parts = message.fileName.split(".");
    return parts.length > 1 ? parts.pop()?.toLowerCase() : "";
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

  async function downloadFileWithProgress(url: string | URL | Request) {
    const abortController = new AbortController();
    setController(abortController);

    try {
      const response = await fetch(url, { signal: abortController.signal });

      if (!response.ok) {
        Swal.fire({
          title: "No internet connection",
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      const contentLength = response.headers.get("Content-Length");
      if (!contentLength) return;

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
          setPercent(Math.round((loaded / total) * 100));
        }
      }

      const blob = new Blob(chunks);
      saveAs(blob, message.fileName);
    } catch (error: any) {
      if (error.name !== "AbortError") {
        Swal.fire({
          title: "Download failed",
          icon: "error",
          confirmButtonText: "OK",
        });
      }
    } finally {
      setPercent(0);
      setController(null);
    }
  }

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
              className="cursor-pointer max-w-[18.75rem] max-h-[18.75rem] object-contain rounded-lg"
            />
          ) : message.messageType.split("/")[0] == "video" ? (
            <video
              src={message.mediaUrl}
              controls
              width="300"
              height="300"
              className="cursor-pointer"></video>
          ) : message.messageType.split("/")[0] == "audio" ? (
            <audio
              src={message.mediaUrl}
              controls
              className="cursor-pointer"></audio>
          ) : (
            <div className="w-[6.25rem] h-[6.25rem] self-center mb-5 relative">
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full p-[0.5625rem]"
                style={{
                  background: `conic-gradient(#22c55e ${percent}%, transparent ${percent}%)`,
                }}>
                <div
                  className="z-40 absolute w-[1.875rem] h-[1.875rem] bg-black/50 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer"
                  onClick={() => {
                    if (controller) {
                      controller.abort();
                      setController(null);
                      setPercent(0);
                    } else {
                      downloadFileWithProgress(message.mediaUrl);
                    }
                  }}></div>
                <div className="z-30 absolute w-[1.875rem] h-[1.875rem] bg-white rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"></div>
                {controller ? (
                  <Image
                    src="/icons/cancel.png"
                    alt="file"
                    width={20}
                    height={20}
                    className="z-50 relative cursor-pointer w-[1.25rem] h-[1.25rem]"
                    onClick={() => {
                      if (controller) {
                        controller.abort();
                        setController(null);
                        setPercent(0);
                      }
                    }}
                  />
                ) : (
                  <Image
                    src="/icons/download.png"
                    alt="file"
                    width={20}
                    height={20}
                    className="z-50 relative cursor-pointer w-[1.25rem] h-[1.25rem]"
                    onClick={() => downloadFileWithProgress(message.mediaUrl)}
                  />
                )}
              </div>
              <FileIcon
                extension={getFileExtension()}
                {...defaultStyles[
                  getFileExtension() as keyof typeof defaultStyles
                ]}
              />
            </div>
          ))}
        <span className="font-[400] text-[1rem]">{message.message}</span>
        <div className="self-end flex gap-2 items-center">
          {/* <span>❤️</span> */}
          <span className="text-[0.75rem] font-[400] mt-1">
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
              onClick={() => saveAs(message.mediaUrl, message.fileName)}
              className="cursor-pointer max-w-[18.75rem] max-h-[18.75rem] object-contain rounded-lg"
            />
          ) : message.messageType.split("/")[0] == "video" ? (
            <video
              src={message.mediaUrl}
              controls
              width="300"
              height="300"
              className="cursor-pointer"></video>
          ) : message.messageType.split("/")[0] == "audio" ? (
            <audio
              src={message.mediaUrl}
              controls
              className="cursor-pointer"></audio>
          ) : (
            <div className="w-[6.25rem] h-[6.25rem] self-center mb-5 relative">
              <div
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full p-[0.5625rem]"
                style={{
                  background: `conic-gradient(#22c55e ${percent}%, transparent ${percent}%)`,
                }}>
                <div
                  className="z-40 absolute w-[1.875rem] h-[1.875rem] bg-black/50 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer"
                  onClick={() => {
                    if (controller) {
                      controller.abort();
                      setController(null);
                      setPercent(0);
                    } else {
                      downloadFileWithProgress(message.mediaUrl);
                    }
                  }}></div>
                <div className="z-30 absolute w-[1.875rem] h-[1.875rem] bg-white rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"></div>
                {controller ? (
                  <Image
                    src="/icons/cancel.png"
                    alt="file"
                    width={20}
                    height={20}
                    className="z-50 relative cursor-pointer w-[1.25rem] h-[1.25rem]"
                    onClick={() => {
                      if (controller) {
                        controller.abort();
                        setController(null);
                        setPercent(0);
                      }
                    }}
                  />
                ) : (
                  <Image
                    src="/icons/download.png"
                    alt="file"
                    width={20}
                    height={20}
                    className="z-50 relative cursor-pointer w-[1.25rem] h-[1.25rem]"
                    onClick={() => downloadFileWithProgress(message.mediaUrl)}
                  />
                )}
              </div>
              <FileIcon
                extension={getFileExtension()}
                {...defaultStyles[
                  getFileExtension() as keyof typeof defaultStyles
                ]}
              />
            </div>
          ))}
        <span className="font-[400] text-[1rem]">{message.message}</span>
        <div className="self-end flex gap-2 items-center">
          {/* <span>❤️</span> */}
          <span className="text-[0.75rem] font-[400] mt-1 text-white">
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
