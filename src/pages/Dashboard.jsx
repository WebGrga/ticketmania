import { useEffect, useState } from "react";
import { auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { collection, onSnapshot, query, where } from "firebase/firestore";

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTickets: 0,
    openTickets: 0,
    closedTickets: 0,
    totalXP: 0,
    avgXP: 0, // Average XP per ticket
  });
  const [loading, setLoading] = useState(true);

  // Fetch user-specific ticket stats in real-time
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "tickets"),
      where("createdBy", "==", user.uid)
    );
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const tickets = snapshot.docs.map((doc) => doc.data());
        const totalTickets = tickets.length;
        const openTickets = tickets.filter((t) => t.status === "Open").length;
        const closedTickets = tickets.filter(
          (t) => t.status === "Closed"
        ).length;
        const totalXP = tickets.reduce((sum, t) => sum + (t.xp || 0), 0);
        const avgXP =
          totalTickets > 0 ? (totalXP / totalTickets).toFixed(1) : 0; // Rounded to 1 decimal

        setStats({
          totalTickets,
          openTickets,
          closedTickets,
          totalXP,
          avgXP,
        });
        setLoading(false);
      },
      (error) => {
        console.error("Error fetching stats:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96 text-center">
        <h1 className="text-2xl font-bold">🎟️ TicketMania Dashboard</h1>
        <p className="mt-2">Welcome, {user?.displayName || "User"}!</p>

        {/* Stats Section */}
        <div className="mt-6 bg-gray-700 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">📊 Your Stats</h2>
          {loading ? (
            <p className="text-gray-400">Loading stats...</p>
          ) : (
            <div className="flex flex-col gap-2 text-left">
              <p>
                <span className="font-bold">📋 Total Tickets:</span>{" "}
                {stats.totalTickets}
              </p>
              <p>
                <span className="font-bold">📖 Open Tickets:</span>{" "}
                {stats.openTickets}
              </p>
              <p>
                <span className="font-bold">✅ Closed Tickets:</span>{" "}
                {stats.closedTickets}
              </p>
              <p>
                <span className="font-bold">⭐ Total XP Earned:</span>{" "}
                {stats.totalXP}
              </p>
              <p>
                <span className="font-bold">📈 Avg XP per Ticket:</span>{" "}
                {stats.avgXP}
              </p>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex flex-col gap-4 mt-6">
          <button
            onClick={() => navigate("/create-ticket")}
            className="bg-green-600 px-4 py-2 rounded hover:bg-green-700 transition"
          >
            ➕ Create Ticket
          </button>
          <button
            onClick={() => navigate("/tickets")}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 transition"
          >
            📜 View Tickets
          </button>
          <button
            onClick={handleLogout}
            className="bg-red-600 px-4 py-2 rounded hover:bg-red-700 transition"
          >
            🔒 Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
