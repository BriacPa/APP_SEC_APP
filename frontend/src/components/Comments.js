import axiosInstance from "../utils/axiosInstance";
import { useState, useEffect } from "react";

const Comments = (user,setUser) => {
    const [CommentsV, setCommentsV] = useState([]);

    const fetchComments = async () => {
            axiosInstance.get('user/comments', { withCredentials: true })
                .then((res) => {
                    setCommentsV(res.data);
                })
                .catch((err) => {
                    console.error(err);
                });
    }

    useEffect(() => {
        fetchComments();
    }
    , []); // Fetch comments only once when the component mounts

    

    const deleteComment = (commentId) => async () => {
        await axiosInstance.delete(`/comment/del/${commentId}`, { withCredentials: true });
        fetchComments();
    };
    
    return (
        <div>
    <h1>Comments</h1>
    {CommentsV.map((comment) => (
        <div key={comment._id}>
            <p>
                Article :{' '}
                <a href={`/article/?title=${comment.article.title}`}>
                    {`${comment.article.title}`}
                </a> 
                {' '}- "{comment.body}" at {new Date(comment.createdAt).toLocaleString()}
            </p>
            <button onClick={() => deleteComment(comment._id)}>Delete</button>
        </div>
    ))}
</div>

    );
    
}

export default Comments;