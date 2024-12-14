import axiosInstance from "../utils/axiosInstance";
import { useState, useEffect } from "react";

const Comments = ({ user, setUser }) => {
    const [CommentsV, setCommentsV] = useState([]);

    const fetchComments = async () => {
        axiosInstance.get('user/comments', { withCredentials: true })
            .then((res) => {
                setCommentsV(res.data);
            })
            .catch((err) => {
            });
    }

    useEffect(() => {
        fetchComments();
    }, []);

    const deleteComment = (commentId) => async () => {
        console.log('Deleting comment:', commentId);
        await axiosInstance.delete(`/comment/del?id=${commentId}`, { withCredentials: true });

        fetchComments();
    };

    return (
        <div className="container mt-4">
            <h1 className="mb-4">Comments</h1>
            {CommentsV.map((comment) => (
                <div key={comment._id} className="card mb-3">
                    <div className="card-body">
                        <p className="card-text">
                            Article:{" "}
                            {comment.article ? (
                                <a href={`/articles/open/?title=${comment.article.title}`}>
                                    {comment.article.title}
                                </a>
                            ) : (
                                "Unknown Article"
                            )}
                            {" "} - "{comment.body}" at {new Date(comment.createdAt).toLocaleString()}
                        </p>
                        <button onClick={deleteComment(comment._id)} className="btn btn-danger btn-sm">
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Comments;
