import { DataContext } from "@/context/ApiContext";
import { UserType } from "@/models/user";
import axiosInstance from "@/utils/axios";
import React, { useContext, useEffect, useState } from "react";

const Calling = () => {
  const { answerCall, endCall, callingUserId } = useContext(DataContext);
  const [callingUser, setCallingUser] = useState<UserType | null>(null);

  useEffect(() => {
    async function getUser() {
      try {
        const res = await axiosInstance.get(`users/id/${callingUserId}`);
        if (res.data.success) {
          setCallingUser(res.data.data);
        }
      } catch {}
    }

    getUser();
  }, [callingUserId]);

  return (
    <div>
      <h2>Incoming Call from {callingUser?.name}</h2>
      <button onClick={answerCall}>Answer</button>
      <button onClick={endCall}>End</button>
    </div>
  );
};

export default Calling;
