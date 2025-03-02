import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const TicketDetails = () => {
  const { ticketId } = useParams(); // Get ticketId from URL
  const [ticket, setTicket] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch ticket details
  useEffect(() => {
    const fetchTicket = async () => {
      const ticketDoc = await getDoc(doc(db, "tickets", ticketId));
      if (ticketDoc.exists()) {
        setTicket({ id: ticketDoc.id, ...ticketDoc.data() });
      } else {
        navigate("/tickets"); // Redirect if ticket not found
      }
    };
    fetchTicket();
  }, [ticketId, navigate]);

  // Fetch comments in real-time
  useEffect(() => {
    const q = query(
      collection(db, "tickets", ticketId, "comments"),
      orderBy("createdAt", "asc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setComments(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [ticketId]);

  // Add a comment
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    try {
      await addDoc(collection(db, "tickets", ticketId, "comments"), {
        text: newComment,
        createdBy: user.uid,
        createdByEmail: user.email,
        createdAt: serverTimestamp(),
      });
      setNewComment(""); // Clear input
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  // Back to Ticket List
  const handleBack = () => {
    navigate("/tickets");
  };

  if (!ticket)
    return (
      <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
        Loading...
      </div>
    );

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-3/4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">🎟️ {ticket.title}</h1>
          <button
            onClick={handleBack}
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500 transition"
          >
            ← Back to Tickets
          </button>
        </div>

        {/* Ticket Details */}
        <div className="bg-gray-700 p-4 rounded mb-4">
          <p>
            <strong>Description:</strong> {ticket.description}
          </p>
          <p>
            <strong>Priority:</strong> {ticket.priority}
          </p>
          <p>
            <strong>Status:</strong> {ticket.status}
          </p>
          <p>
            <strong>XP:</strong> {ticket.xp}
          </p>
          <p>
            <strong>Created by:</strong> {ticket.createdByEmail}
          </p>
        </div>

        {/* Chat/Comments Section */}
        <div className="bg-gray-700 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">💬 Comments</h2>
          <div className="max-h-64 overflow-y-auto mb-4">
            {comments.length === 0 ? (
              <p className="text-gray-400">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="p-2 bg-gray-600 rounded mb-2">
                  <p>{comment.text}</p>
                  <p className="text-sm text-gray-400">
                    {comment.createdByEmail} -{" "}
                    {comment.createdAt?.toDate().toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Comment Input */}
          <form onSubmit={handleAddComment} className="flex gap-2">
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="p-2 bg-gray-600 rounded text-white w-full"
              disabled={!user}
            />
            <button
              type="submit"
              className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition"
              disabled={!newComment.trim() || !user}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;
