import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const TicketList = () => {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [editTicketId, setEditTicketId] = useState(null);
  const [editForm, setEditForm] = useState({
    title: "",
    description: "",
    priority: "",
    status: "",
  });
  const { user } = useAuth();
  const navigate = useNavigate();
  const ticketsPerPage = 5;

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, "tickets"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTickets(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });

    return () => unsubscribe();
  }, [user]);

  const filteredTickets = tickets.filter((ticket) => {
    const matchesFilter = filter === "All" || ticket.status === filter;
    const matchesSearch =
      ticket.title.toLowerCase().includes(search.toLowerCase()) ||
      ticket.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(
    indexOfFirstTicket,
    indexOfLastTicket
  );
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  const handleDelete = async (ticketId) => {
    if (window.confirm("Are you sure you want to delete this ticket?")) {
      try {
        await deleteDoc(doc(db, "tickets", ticketId));
      } catch (error) {
        console.error("Error deleting ticket:", error);
      }
    }
  };

  const handleEdit = (ticket) => {
    setEditTicketId(ticket.id);
    setEditForm({
      title: ticket.title,
      description: ticket.description,
      priority: ticket.priority,
      status: ticket.status,
    });
  };

  const handleSaveEdit = async (ticketId) => {
    try {
      await updateDoc(doc(db, "tickets", ticketId), {
        title: editForm.title,
        description: editForm.description,
        priority: editForm.priority,
        status: editForm.status,
      });
      setEditTicketId(null);
    } catch (error) {
      console.error("Error updating ticket:", error);
    }
  };

  const handleClose = async (ticketId) => {
    if (window.confirm("Are you sure you want to close this ticket?")) {
      try {
        await updateDoc(doc(db, "tickets", ticketId), {
          status: "Closed",
        });
      } catch (error) {
        console.error("Error closing ticket:", error);
      }
    }
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleBack = () => {
    navigate("/dashboard");
  };

  // Navigate to ticket details
  const handleTicketClick = (ticketId) => {
    navigate(`/tickets/${ticketId}`);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-3/4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">🎟️ All Tickets</h1>
          <button
            onClick={handleBack}
            className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500 transition"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="flex gap-4 mb-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 bg-gray-700 rounded text-white"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Closed">Closed</option>
          </select>
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 bg-gray-700 rounded text-white w-full"
          />
        </div>

        <div className="space-y-4">
          {currentTickets.length === 0 ? (
            <p className="text-gray-400">No tickets found.</p>
          ) : (
            currentTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 bg-gray-700 rounded cursor-pointer hover:bg-gray-600"
                onClick={() => handleTicketClick(ticket.id)} // Clickable ticket
              >
                {editTicketId === ticket.id ? (
                  <div
                    className="flex flex-col gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {" "}
                    {/* Prevent click propagation */}
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) =>
                        setEditForm({ ...editForm, title: e.target.value })
                      }
                      className="p-2 bg-gray-600 rounded text-white"
                    />
                    <textarea
                      value={editForm.description}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          description: e.target.value,
                        })
                      }
                      className="p-2 bg-gray-600 rounded text-white"
                    />
                    <select
                      value={editForm.priority}
                      onChange={(e) =>
                        setEditForm({ ...editForm, priority: e.target.value })
                      }
                      className="p-2 bg-gray-600 rounded text-white"
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                    <select
                      value={editForm.status}
                      onChange={(e) =>
                        setEditForm({ ...editForm, status: e.target.value })
                      }
                      className="p-2 bg-gray-600 rounded text-white"
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Closed">Closed</option>
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSaveEdit(ticket.id)}
                        className="bg-green-600 px-4 py-2 rounded hover:bg-green-700"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditTicketId(null)}
                        className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <h2 className="text-xl font-bold">{ticket.title}</h2>
                    <p>{ticket.description}</p>
                    <p className="text-sm">
                      Priority:{" "}
                      <span className="font-bold">{ticket.priority}</span>
                    </p>
                    <p className="text-sm">
                      Status: <span className="font-bold">{ticket.status}</span>
                    </p>
                    <p className="text-sm">
                      XP: <span className="font-bold">{ticket.xp}</span>
                    </p>
                    <p className="text-sm text-gray-400">
                      Created by: {ticket.createdByEmail}
                    </p>
                    {user.uid === ticket.createdBy && (
                      <div
                        className="flex gap-2 mt-2"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {" "}
                        {/* Prevent click propagation */}
                        <button
                          onClick={() => handleEdit(ticket)}
                          className="bg-yellow-600 px-2 py-1 rounded hover:bg-yellow-700"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(ticket.id)}
                          className="bg-red-600 px-2 py-1 rounded hover:bg-red-700"
                        >
                          Delete
                        </button>
                        {ticket.status !== "Closed" && (
                          <button
                            onClick={() => handleClose(ticket.id)}
                            className="bg-blue-600 px-2 py-1 rounded hover:bg-blue-700"
                          >
                            Close
                          </button>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="bg-gray-700 px-4 py-2 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="self-center">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="bg-gray-700 px-4 py-2 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TicketList;
