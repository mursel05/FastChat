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
    user
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
    <div className="h-full relative flex w-full justify-center items-center">
      <div className="relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          className="w-[50rem] max-lg:w-[20rem] h-full object-cover rounded-lg"
          style={{
            display: callingUserCamera ? "block" : "none",
          }}
        />
        {!callingUserMicrophone && (
          <div className="absolute bottom-4 max-lg:bottom-2 left-4 max-lg:left-2 transform rounded-full bg-white/40 p-2">
            <Image
              src="/icons/call-microphone.png"
              alt="Mute"
              width={24}
              height={24}
              className="w-6 h-6 max-lg:w-4 max-lg:h-4"
            />
            <div className="top-0 left-1/2 -translate-x-1/2 w-[0.1rem] h-full bg-black absolute rotate-45 rounded-xl"></div>
          </div>
        )}
        {!callingUserCamera && (
          <div className="flex items-center justify-center bg-[rgba(0,0,0,0.5)] h-[20rem] max-lg:h-[10rem] w-[30rem] max-lg:w-[15rem] rounded-lg">
            <Image
              src={user?.photo || "/images/no-profile.jpg"}
              width={100}
              height={100}
              alt="user"
              className="rounded-full w-[5rem] h-[5rem] object-cover max-lg:w-[3rem] max-lg:h-[3rem]"
            />
          </div>
        )}
      </div>
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
            className="w-[10rem] max-lg:w-[5rem] flex items-center justify-center bg-[rgba(0,0,0,0.5)]"
            style={{ height: localVideoRef.current?.clientHeight }}>
            <Image
              src={callingUser?.photo || "/images/no-profile.jpg"}
              width={100}
              height={100}
              alt="user"
              className="rounded-full w-[3rem] h-[3rem] object-cover max-lg:w-[2rem] max-lg:h-[2rem]"
            />
          </div>
        )}
        <video
          ref={localVideoRef}
          autoPlay
          muted
          className="w-[10rem] max-lg:w-[5rem]"
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
