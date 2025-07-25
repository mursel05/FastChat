import { DataContext } from "@/context/ApiContext";
import { UserType } from "@/models/user";
import axiosInstance from "@/utils/axios";
import Image from "next/image";
import React, { useContext, useEffect, useState } from "react";

const Answering = () => {
  const {
    localVideoRef,
    remoteVideoRef,
    endCall,
    toggleCamera,
    toggleMicrophone,
    allowCamera,
    allowMicrophone,
    callingUserCamera,
    callingUserMicrophone,
    callingUserId,
  } = useContext(DataContext);
  const [callingUser, setCallingUser] = useState<UserType | null>(null);

  useEffect(() => {
    async function getUser() {
      try {
        const res = await axiosInstance.get(`/users/id/${callingUserId}`);
        if (res.data.success) {
          setCallingUser(res.data.data);
        }
      } catch {}
    }

    getUser();
  }, [callingUserId]);

  return (
    <div className="h-screen relative flex w-full justify-center">
      <div className="h-full relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          className="h-full"
          style={{ display: callingUserCamera ? "block" : "none" }}
        />
        {!callingUserMicrophone && (
          <div className="absolute bottom-4 left-8 transform rounded-full bg-white/40 p-2">
            <Image
              src="/icons/call-microphone.png"
              alt="Mute"
              width={24}
              height={24}
              className="w-6 h-6"
            />
            <div className="top-0 left-1/2 -translate-x-1/2 w-[0.1rem] h-full bg-black absolute rotate-45 rounded-xl"></div>
          </div>
        )}
      </div>
      {!callingUserCamera && (
        <div className="w-full h-full flex items-center justify-center bg-[rgba(0,0,0,0.5)]">
          <Image
            src={callingUser?.photo || "/images/no-profile.jpg"}
            width={100}
            height={100}
            alt="user"
            className="rounded-full w-[3rem] h-[3rem] object-cover"
          />
        </div>
      )}
      <div className="absolute bottom-4 right-1/2 transform translate-x-1/2 flex gap-4">
        <button
          className="bg-white p-2 rounded-full relative hover:bg-gray-200"
          onClick={toggleCamera}>
          <Image
            src="/icons/video-call.png"
            alt="Video Call"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          {!allowCamera && (
            <div className="top-0 left-1/2 -translate-x-1/2 w-[0.1rem] h-full bg-black absolute rotate-45 rounded-xl"></div>
          )}
        </button>
        <button
          className="bg-white p-2 rounded-full relative hover:bg-gray-200"
          onClick={toggleMicrophone}>
          <Image
            src="/icons/microphone-call.png"
            alt="Microphone Call"
            width={24}
            height={24}
            className="w-6 h-6"
          />
          {!allowMicrophone && (
            <div className="top-0 left-1/2 -translate-x-1/2 w-[0.1rem] h-full bg-black absolute rotate-45 rounded-xl"></div>
          )}
        </button>
        <button
          onClick={endCall}
          className="bg-red-500 p-2 rounded-full hover:bg-red-600">
          <Image
            src="/icons/end-call.png"
            alt="End Call"
            width={24}
            height={24}
            className="w-6 h-6"
          />
        </button>
      </div>
      <div className="absolute bottom-4 right-4 z-50 rounded-xl overflow-hidden">
        {!allowCamera && (
          <div
            className="w-[10rem] flex items-center justify-center bg-[rgba(0,0,0,0.5)]"
            style={{ height: localVideoRef.current?.clientHeight }}>
            <Image
              src={callingUser?.photo || "/images/no-profile.jpg"}
              width={100}
              height={100}
              alt="user"
              className="rounded-full w-[3rem] h-[3rem] object-cover"
            />
          </div>
        )}
        <video
          ref={localVideoRef}
          autoPlay
          muted
          className="w-[10rem]"
          style={{
            opacity: allowCamera ? 1 : 0,
            position: allowCamera ? "static" : "absolute",
          }}
        />
      </div>
    </div>
  );
};

export default Answering;
