import { useChat } from "../../../context/chats";
import { useSocket } from "../../../context/socket";
import { useVideoCall } from "../../../context/videoCall";
import {
  useCallback,
  useEffect,
  useState
} from "react";
import {
  Mic,
  MicOff,
  Phone,
  Video,
  VideoOff
} from "lucide-react";

const VideoCalling = ({
  peer,
  setGotVideoCall,
  sendStreams,
  moveToTop,
  chats
}) => {
  const socket = useSocket();

  const {
    currChat : { _id },
    profileImage,
    setUnreadNotifications 
  } = useChat();

  const {
    onVideoCall,
    setOnVideoCall,
    videoCallStatus,
    setVideoCallStatus,
    setVideoCallRequested
  } = useVideoCall();

  const mediaConstraints = {
		video : {
			width: { min: 640, ideal: 3040, max: 3040 },
			height: { min: 480, ideal: 1080, max: 1080 },
		},
		audio : true,
  }

  const [localStream, setLocalStream] = useState(null);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [remoteMuted, setRemoteMuted] = useState(true);

  const makeVideoCall = useCallback(async () => {
		setVideoCallStatus("Ringing")
		const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
		const offer = await peer.createOffer();
		socket.emit("makeCall",{reciver: _id, offer});
		setLocalStream(stream);
		setOnVideoCall(true);
  }, [_id])

  useEffect(() => {
		peer.peer.addEventListener("track", ({streams}) => {
			setVideoCallStatus("connected");
			document.querySelector("#remoteStream").srcObject = streams[0];
		});
	}, []);

  const answerVideoCall = useCallback(async ({offer, reciver}) => {
		setGotVideoCall(reciver);
		const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
		setLocalStream(stream);
		const answer = await peer.createAnswer(offer);
		socket.emit("answerCall",{reciver: _id, answer});
    setRemoteMuted(false);
  },[_id]);

  const answerResponseEvent = useCallback(async ({answer}) => {
		await peer.setAnswer(answer);
		sendStreams();
  },[]);

  const handleNegoNeeded = useCallback(async () => {
		const offer = await peer.createOffer();
		socket.emit("negotiationNeeded", { reciver: _id, offer});
  }, [_id, socket]);

  useEffect(() => {
		peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
		return () => peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(async ({ offer }) => {
		const answer = await peer.createAnswer(offer);
		socket.emit("negotiationDone", { reciver: _id, answer});
  },[
		socket,
		_id
	]);

  const handleNegoNeedFinal = useCallback(async ({ answer }) => {
		await peer.setAnswer(answer);
		// socket.emit("requestStream", { reciver: _id });
  }, [_id, socket]);

  useEffect(() => {
    if (videoCallStatus == "Ringing") socket.emit("requestStream", { reciver: _id });
  },[videoCallStatus])

  const leaveCall = useCallback(() => {
		if (localStream) localStream.getTracks().forEach(track => track.stop());
		setLocalStream(null);
		setOnVideoCall(false);
		setGotVideoCall(null);
		setVideoCallStatus(null);
  },[localStream]);

  const videoCallRequestEvent = useCallback(({ reciver }) => {
		setVideoCallRequested(prev => {
			let temp = prev.map((val, ind) => chats[ind]._id == reciver ? true : val)
			const ind = chats.findIndex(chat => chat._id == reciver);
			moveToTop(chats,ind);
			moveToTop(temp, ind);
			setUnreadNotifications(prev => {
				moveToTop(prev, ind);
				return prev;
			})
			return temp;
		});
  },[]);

  const handleCallRejected = useCallback(({ chatId }) => {
    setVideoCallRequested(prev => prev.map((val,ind) => chats[ind]._id == chatId ? false : val));
  },[]);

  const handleStreamRequest = useCallback(() => {
    console.log("Got Stream Request");
    sendStreams();
  },[]);

  useEffect(() => {
		document.addEventListener("beforunload", leaveCall);
		return () => document.removeEventListener("beforunload", leaveCall);
  },[])

  useEffect(() => {
		socket.on("callRequested", videoCallRequestEvent);
		socket.on("videoCallAccepted", makeVideoCall)
		socket.on("callRejected", handleCallRejected);
		socket.on("reciveCall", answerVideoCall)
		socket.on("reciveAnswer", answerResponseEvent)
		socket.on("negotiationNeeded", handleNegoNeedIncomming);
		socket.on("negotiationFinal",handleNegoNeedFinal);
		socket.on("leaveCall", leaveCall);
    socket.on("requestingStream", handleStreamRequest);
		return () => {
			socket.off("callRequested", videoCallRequestEvent);
			socket.off("videoCallAccepted", makeVideoCall)
			socket.off("callRejected", handleCallRejected);
			socket.off("reciveCall", answerVideoCall)
			socket.off("reciveAnswer", answerResponseEvent)
			socket.off("negotiationNeeded", handleNegoNeedIncomming);
			socket.off("negotiationFinal", handleNegoNeedFinal);
			socket.off("leaveCall", leaveCall);
      socket.off("requestingStream", handleStreamRequest);
		}
  },[
		socket,
		videoCallRequestEvent,
		makeVideoCall,
		handleCallRejected,
		answerVideoCall,
		answerResponseEvent,
		handleNegoNeedIncomming,
		handleNegoNeedFinal,
		leaveCall
	])

  useEffect(() => {
		document.querySelector("#localStream").srcObject = localStream;
		if (!localStream) return;
		const videoTrack = localStream.getTracks().find(track => track.kind == "video");
		if (videoTrack) setVideo(videoTrack.enabled);
		const audioTrack = localStream.getTracks().find(track => track.kind == "audio");
		if (audioTrack) setAudio(audioTrack.enabled);
  },[localStream]);

  const toggleVideo = () => {
		// const videoTrack = localStream.getTracks().find(track => track.kind == "video");
		// videoTrack.enabled = !videoTrack.enabled;
		// setVideo(videoTrack.enabled);
		// peer.peer.getSenders().find(sender => sender.track.kind == "video").replaceTrack(videoTrack);
    socket.emit("toggleVideo", { reciver: _id });
    setVideo(prev => !prev);
  }

  const handleToggleVideo = useCallback(() => {
    if (videoCallStatus == "connected") setVideoCallStatus("Video Off");
    else if (videoCallStatus == "Video Off") setVideoCallStatus("connected");
  },[videoCallStatus])

  const toggleAudio = () => {
		// const audioTrack = localStream.getTracks().find(track => track.kind == "audio");
		// audioTrack.enabled = !audioTrack.enabled;
		// setAudio(audioTrack.enabled);
		// peer.peer.getSenders().find(sender => sender.track.kind == "audio").replaceTrack(audioTrack);
    socket.emit("toggleAudio", { reciver: _id });
    setAudio(prev => !prev);
  }

  const handleToggleAudio = useCallback(() => {
    setRemoteMuted(prev => !prev);
  },[setRemoteMuted])

  useEffect(() => {
    if (onVideoCall) {
      sendStreams();
      // socket.emit("requestStream", { reciver: _id });
    }
  },[onVideoCall])

  // useEffect(() => {
  //   while (!document.querySelector("#remoteStream").srcObject) {
  //     if (onVideoCall) socket.emit("requestStream", { reciver: _id });
  //   }
  // }, [])

  useEffect(() => {
    socket.on("toggleVideo", handleToggleVideo);
    socket.on("toggleAudio", handleToggleAudio);
    return () => {
      socket.off("toggleVideo", handleToggleVideo);
      socket.off("toggleAudio", handleToggleAudio);
    }
  },[socket, handleToggleVideo, handleToggleAudio])

  return (
    <div className={`${onVideoCall ? "" : "hidden"} flex-grow w-full overflow-hidden p-2 relative`}>
      <div className={`h-full w-full ${(videoCallStatus && (videoCallStatus != "connected")) ? "flex" : "hidden"} flex-col gap-2 justify-center items-center`}>
        <div className="h-1/4 aspect-square flex justify-center items-center relative">
          <img
            src={profileImage}
            className="aspect-square rounded-full h-full animate-connecting-lg"
          />
          <p className="text-lg font-semibold absolute -bottom-12">{videoCallStatus}...</p>
        </div>
      </div>
      <video
        // key={remoteMuted}
        id="remoteStream"
        autoPlay
        playsInline
        muted={remoteMuted}
        className={`${videoCallStatus == "connected" ? "" : "hidden" } top-0 left-0 h-full w-full object-cover`}
      />
      <video
        id="localStream"
        autoPlay
        playsInline
        muted
        className="h-1/5 w-1/5 absolute bottom-[1%] right-[-3%]"
      />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 flex gap-10 pb-5">
        <div className="cursor-pointer p-2 rounded-full bg-[#C1EDCC] hover:opacity-50">
          <Video
            size={36}
            onClick={toggleVideo}
            className={`${video ? "" : "hidden"}`}
          />
          <VideoOff
            size={36}
            onClick={toggleVideo}
            className={`${video ? "hidden" : ""}`}
          />
        </div>
        <div className="cursor-pointer p-2 rounded-full bg-[#C1EDCC] hover:opacity-50">
          <Mic
            size={36}
            onClick={toggleAudio}
            className={`${audio ? "" : "hidden"}`}
          />
          <MicOff
            size={36}
            onClick={toggleAudio}
            className={`${audio ? "hidden" : ""}`}
          />
        </div>
        <div className="cursor-pointer p-2 rounded-full bg-[#C1EDCC] hover:opacity-50">
          <Phone
            size={36}
            color="red"
            onClick={() => {
              if (!localStream) socket.emit("rejectCall", {reciver: _id});
              else {
                peer.disconnect();
                socket.emit("leaveCall", {reciver: _id});
              }
              leaveCall();
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default VideoCalling;