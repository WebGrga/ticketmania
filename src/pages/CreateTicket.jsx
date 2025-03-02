import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CreateTicket = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("Low");
  const [errors, setErrors] = useState({}); // Validation errors
  const [showConfirm, setShowConfirm] = useState(false); // Confirmation dialog state
  const navigate = useNavigate();
  const { user } = useAuth();

  // XP Points System based on priority
  const getXP = (priority) => {
    switch (priority) {
      case "Low":
        return 10;
      case "Medium":
        return 25;
      case "High":
        return 50;
      default:
        return 10;
    }
  };

  // Validation function
  const validateForm = () => {
    const newErrors = {};
    if (title.trim().length < 5) {
      newErrors.title = "Title must be at least 5 characters long.";
    }
    if (description.trim().length < 10) {
      newErrors.description =
        "Description must be at least 10 characters long.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to create a ticket.");
      return;
    }

    if (validateForm()) {
      setShowConfirm(true); // Show confirmation dialog if validation passes
    }
  };

  // Confirm ticket creation
  const confirmTicket = async () => {
    try {
      await addDoc(collection(db, "tickets"), {
        title,
        description,
        priority,
        status: "Open",
        xp: getXP(priority),
        createdBy: user.uid,
        createdByEmail: user.email,
        createdAt: serverTimestamp(),
      });
      setShowConfirm(false); // Close dialog
      navigate("/tickets"); // Redirect after submission
    } catch (error) {
      console.error("Error creating ticket:", error);
      alert("Failed to create ticket: " + error.message);
    }
  };

  // Cancel confirmation
  const cancelConfirm = () => {
    setShowConfirm(false);
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96">
        <h1 className="text-2xl font-bold mb-4">🎟️ Create a Ticket</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <input
              type="text"
              placeholder="Ticket Title"
              className="p-2 bg-gray-700 rounded text-white w-full"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            {errors.title && (
              <p className="text-red-500 text-sm mt-1">{errors.title}</p>
            )}
          </div>

          <div>
            <textarea
              placeholder="Description"
              className="p-2 bg-gray-700 rounded text-white w-full"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          <select
            className="p-2 bg-gray-700 rounded text-white"
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
          >
            <option value="Low">Low Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="High">High Priority</option>
          </select>

          <button
            type="submit"
            className="bg-green-600 p-2 rounded hover:bg-green-700 transition"
          >
            Submit Ticket
          </button>
        </form>

        {/* Confirmation Dialog */}
        {showConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-96 text-center">
              <h2 className="text-xl font-bold mb-4">
                Confirm Ticket Creation
              </h2>
              <p>
                <strong>Title:</strong> {title}
              </p>
              <p>
                <strong>Description:</strong> {description}
              </p>
              <p>
                <strong>Priority:</strong> {priority}
              </p>
              <p>
                <strong>XP:</strong> {getXP(priority)}
              </p>
              <div className="flex gap-4 mt-4 justify-center">
                <button
                  onClick={confirmTicket}
                  className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition"
                >
                  Confirm
                </button>
                <button
                  onClick={cancelConfirm}
                  className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreateTicket;
