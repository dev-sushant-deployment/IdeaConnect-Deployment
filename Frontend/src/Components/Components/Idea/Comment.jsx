import { RiSendPlaneFill } from "@remixicon/react";
import { getData, headers } from "../../dataLoaders";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { useSocket } from "../../../context/socket";

const Comment = ({ comments, setComments, ideaId, userId, title, ideaOf, username, userProfileImage }) => {
  const socket = useSocket();

  const descriptionDivHeight = 272;
  const [comment, setComment] = useState("");
  const [scrollable, setScrollable] = useState(false);
  const addComment = async (e) => {
    e.stopPropagation();
    const { data : { data : { success, newComment } } } = await axios.post(`http://localhost:3000/api/v1/comments/add`,{ ideaId, comment }, headers);
    if (success) {
      setComments(prev => [newComment, ...prev]);
      console.log("sending comment notification", userId, ideaId, title, ideaOf, userProfileImage, username);
      socket.emit("commentedNotification", { userId, idea: {
        _id: ideaId,
        title,
        ideaOf
      }, username, profileImage: userProfileImage});
    }
    setComment("");
  }
  const commentsEleRef = useRef();
  const addCommentEleRef = useRef();
  const handleScroll = () => {
    const { scrollTop, clientHeight } = commentsEleRef.current;
    const addCommentEle = addCommentEleRef.current;
    addCommentEle.style.top = `${scrollTop + clientHeight - addCommentEle.clientHeight}px`;
  }
  useEffect(() => {
    const addCommentEle = addCommentEleRef.current;
    addCommentEle.style.top = `${272 - addCommentEle.clientHeight}px`;
    const { clientHeight } = commentsEleRef.current;
    if (descriptionDivHeight <= clientHeight) setScrollable(true);
  }, [comments]);
  return (
    <>
    <div className={`${scrollable ? "relative overflow-y-scroll" : ""}`} ref={commentsEleRef} onScroll={handleScroll}>
      {comments.map(({ profileImage, username, comment }) => (
        <div className="flex flex-col justify-center px-2 py-1 gap-1 items-start text-white border-b-2 border-b-white">
          <div className="flex justify-start items-start gap-2">
            <img
              src={profileImage}
              className="h-7 w-7 rounded-full object-cover border-2 border-white"
              alt="Profile Image"
            />
            <p>{comment}</p>
          </div>
          <p className="w-full text-right">{username}</p>
        </div>
      )
      )}
      <div className="w-full absolute flex px-2 py-1 gap-1 bg-black" ref={addCommentEleRef}>
        <input
          type="text"
          placeholder="Add Comment..."
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onClick={(e) => e.stopPropagation()}
          className="flex-grow rounded-full h-1/6 bg-gray-600 text-white px-2 py-1 w-full"
        />
        <button onClick={addComment}>
          <RiSendPlaneFill size={24}/>
        </button>
      </div>
    </div>
    </>
  )
}

export default Comment;

export const SeeComments = ({ ideaId, setComments, noOfComments, seeingComments, setSeeingComments, className }) => {
  const getComments = async () => {
    if (seeingComments) setSeeingComments(false);
    else {
      const data = await getData(`/comments/${ideaId}`, "get", false);
      console.log("comments comments",data);
      setComments(data.comments);
      setSeeingComments(true);
    }
  }
  return (
    <div
      onClick={getComments}
      className={`flex gap-1 justify-center items-center cursor-pointer ${className}`}
    >
      <img
        className="h-4 w-4"
        src="../../../../images/comment.svg"
      />
      <p>{noOfComments}</p>
    </div>
  )
}