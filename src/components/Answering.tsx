import { DataContext } from "@/context/ApiContext";
import React, { useContext } from "react";

const Answering = () => {
  const { localVideoRef, remoteVideoRef, endCall } = useContext(DataContext);

  return (
    <div>
      <video ref={localVideoRef} autoPlay muted style={{ width: 200 }} />
      <video ref={remoteVideoRef} autoPlay style={{ width: 200 }} />
      <button onClick={endCall}>End Call</button>
    </div>
  );
};

export default Answering;
