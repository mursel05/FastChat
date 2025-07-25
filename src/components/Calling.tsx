import { DataContext } from "@/context/ApiContext";
import { UserType } from "@/models/user";
import axiosInstance from "@/utils/axios";
import Image from "next/image";
import React, { useContext, useEffect, useState } from "react";

const Calling = () => {
  const { answerCall, endCall, callingUserId } = useContext(DataContext);
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
    <div className="w-full h-full flex items-center justify-center">
      <div className="bg-white p-4 rounded-lg flex flex-col items-center gap-4">
        <Image
          src={callingUser?.photo || "/images/no-profile.jpg"}
          width={100}
          height={100}
          alt="user"
          className="rounded-full w-[5rem] h-[5rem] object-cover"
        />
        <span>{callingUser?.name}</span>
        <span className="text-gray-500">is calling you...</span>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={answerCall}
            className="bg-green-500 p-2 rounded-full hover:bg-green-600">
            <Image
              src="/icons/end-call.png"
              alt="End Call"
              width={24}
              height={24}
              className="w-6 h-6 transform -rotate-[135deg]"
            />
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
      </div>
    </div>
  );
};

export default Calling;
