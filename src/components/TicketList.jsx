import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

function TicketList() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "tickets"), (snapshot) => {
      const ticketData = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTickets(ticketData);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-game-secondary">Adventure Board</h2>
      <div className="mt-4 space-y-4">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="p-4 bg-white rounded-lg shadow-lg border-l-4 border-game-primary"
          >
            <h3 className="text-xl font-bold">{ticket.title}</h3>
            <p>{ticket.description}</p>
            <span
              className={`inline-block mt-2 px-2 py-1 rounded text-white ${
                ticket.priority === "high" ? "bg-red-500" : ticket.priority === "medium" ? "bg-yellow-500" : "bg-green-500"
              }`}
            >
              {ticket.priority}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
export default TicketList;