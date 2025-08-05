import { DataContext } from "@/context/ApiContext";
import axiosInstance from "@/utils/axios";
import Image from "next/image";
import { useContext, useEffect, useRef, useState } from "react";
import { FileIcon, defaultStyles } from "react-file-icon";
import Swal from "sweetalert2";
import { v4 as uuidv4 } from "uuid";

const SendMessage = () => {
  const { currentChat, messagesRef, setChats, user } = useContext(DataContext);
  const [text, setText] = useState("");
  const [showText, setShowText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File>();
  const [showFile, setShowFile] = useState<File>();
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  function getFileExtension() {
    if (file) {
      const parts = file.name.split(".");
      return parts.length > 1 ? parts.pop()?.toLowerCase() : "";
    }
  }

  useEffect(() => {
    if (!isRecording && audioChunks.length > 0) {
      const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
      const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, {
        type: "audio/webm",
      });

      setFile(audioFile);
      setShowFile(audioFile);
      setAudioChunks([]);
    }
  }, [isRecording, audioChunks]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

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
                        fileName: "",
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
          fileName: "",
          messageType: "text",
        });
        messagesRef.current?.scrollTo({
          top: messagesRef.current?.scrollHeight,
          behavior: "smooth",
        });
        setText("");
        setShowText("");
      }
    } catch (error) {}
  }

  async function uploadFile(tempId: string) {
    try {
      if (file) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await axiosInstance.post(
          "/files/" + currentChat?.id,
          formData
        );
        if (res.data.success) {
          const response = await axiosInstance.post("/messages", {
            id: tempId,
            chatId: currentChat?.id,
            message: text,
            mediaUrl: res.data.data.filePath,
            fileName: res.data.data.fileName,
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
                    mediaUrl: URL.createObjectURL(file),
                    fileName: getFileExtension() || "",
                    messageType: file.type,
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

  useEffect(() => {
    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
      if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
      }
    };
  }, []);

  const [audioLevels, setAudioLevels] = useState<number[]>(
    new Array(30).fill(0)
  );
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();

  const startRecording = async () => {
    try {
      setIsRecording(true);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);

      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();

      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.8;

      source.connect(analyser);
      analyserRef.current = analyser;

      const updateAudioLevels = () => {
        if (analyserRef.current) {
          const dataArray = new Uint8Array(
            analyserRef.current.frequencyBinCount
          );
          analyserRef.current.getByteFrequencyData(dataArray);

          const levels = [];
          for (let i = 0; i < 30; i++) {
            const index = Math.floor((i / 30) * dataArray.length);
            levels.push(dataArray[index] || 0);
          }

          setAudioLevels(levels);
        }

        animationFrameRef.current = requestAnimationFrame(updateAudioLevels);
      };

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setAudioChunks((prev) => [...prev, event.data]);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((track) => track.stop());
        audioContext.close();
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        setAudioLevels(new Array(30).fill(0));
      };

      setMediaRecorder(recorder);
      recorder.start();
      setRecordingTime(0);

      updateAudioLevels();

      recordingInterval.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch {
      Swal.fire({
        title: "Could not access microphone",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);

      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
        recordingInterval.current = null;
      }

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (recordingInterval.current) {
        clearInterval(recordingInterval.current);
      }
      if (mediaRecorder && isRecording) {
        mediaRecorder.stop();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  if (showFile) {
    return (
      <div className="flex justify-center w-full relative">
        <div className="bg-white p-3 rounded-xl flex flex-col gap-2 absolute bottom-0">
          <div className="flex items-center justify-between gap-2">
            <div
              className="cursor-pointer hover:bg-[var(--light-grey)] rounded-full p-2"
              onClick={() => {
                setFile(undefined);
                setShowFile(undefined);
              }}>
              <Image
                src="/icons/dismis.png"
                alt="dismis"
                width={24}
                height={24}
                className="cursor-pointer w-6 h-6"
              />
            </div>
            <button
              onClick={sendFile}
              className="text-white bg-[var(--light-green)] text-[1rem] font-[400] rounded-3xl px-3 py-1">
              SEND
            </button>
          </div>
          {file?.type.includes("image") ? (
            <Image
              src={URL.createObjectURL(file)}
              alt="dismis"
              width={200}
              height={200}
              className="w-full h-full max-w-[37.5rem] max-h-[37.5rem] self-center"
            />
          ) : file?.type.includes("audio") ? (
            <audio src={URL.createObjectURL(file)} controls></audio>
          ) : file?.type.includes("video") ? (
            <video
              src={URL.createObjectURL(file)}
              controls
              className="max-h-[30rem]"></video>
          ) : (
            <div className="w-[6.25rem] h-[6.25rem] self-center mb-5">
              <FileIcon
                extension={getFileExtension()}
                {...defaultStyles[
                  getFileExtension() as keyof typeof defaultStyles
                ]}
              />
            </div>
          )}
          <input
            type="text"
            className="border-[var(--light-blue-grey)] p-2 outline-none border rounded-xl text-[var(--navy-grey)] text-[1rem] font-[400]"
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
        {isRecording ? (
          <div className="p-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
          </div>
        ) : (
          <div
            onClick={() => fileRef.current?.click()}
            className="cursor-pointer hover:bg-[var(--light-grey)] rounded-full p-2">
            <Image
              src="/icons/file.png"
              width={24}
              height={24}
              alt="file"
              className="w-6 h-6 object-contain"
            />
          </div>
        )}
        {isRecording ? (
          <div className="p-1">
            <span className="text-[var(--navy-grey)] text-[1rem] font-[400]">
              {formatTime(recordingTime)}
            </span>
          </div>
        ) : (
          <div
            onClick={startRecording}
            className="cursor-pointer hover:bg-[var(--light-grey)] rounded-full p-2">
            <Image
              src="/icons/microphone.png"
              width={24}
              height={24}
              alt="microphone"
              className="w-6 h-6 object-contain"
            />
          </div>
        )}
        {!isRecording ? (
          <input
            autoFocus
            type="text"
            className="w-full outline-none text-[var(--navy-grey)] text-[1rem] font-[400]"
            placeholder="Message"
            value={showText}
            onChange={(e) => {
              setText(e.target.value);
              setShowText(e.target.value);
            }}
          />
        ) : (
          <div className="w-full flex gap-[0.125rem] items-center justify-center h-6">
            {audioLevels.map((level, index) => {
              const height = Math.max(4, (level / 255) * 20 + 4);
              return (
                <div
                  key={index}
                  className="w-1 bg-[#8AACD7] rounded-xl transition-all duration-75"
                  style={{ height: `${height}px` }}
                />
              );
            })}
          </div>
        )}
        {isRecording ? (
          <div
            onClick={stopRecording}
            className="cursor-pointer hover:bg-[var(--light-grey)] rounded-full p-2">
            <Image
              src="/icons/stop.png"
              width={24}
              height={24}
              alt="stop"
              className="w-6 h-6 object-contain"
            />
          </div>
        ) : (
          <div
            onClick={sendText}
            className="cursor-pointer hover:bg-[var(--light-grey)] rounded-full p-2">
            <Image
              src="/icons/send.png"
              width={24}
              height={24}
              alt="send"
              className="w-6 h-6 object-contain"
            />
          </div>
        )}
      </div>
    );
  }
};

export default SendMessage;
