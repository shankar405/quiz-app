import { useEffect, useState, useRef } from "react";
import { startMatch } from "../api/api";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";

export default function MatchPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Searching...");
  
  // Ref to prevent overlapping requests (if server is slow)
  const isPolling = useRef(false);

  useEffect(() => {
    // 1. CLEAR SESSION ON MOUNT (Correct placement)
    localStorage.removeItem("session");
    
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      navigate("/"); // Redirect if no user
      return;
    }

    const username = user.username;
    let interval;

    const findMatch = async () => {
      // Prevent double calls
      if (isPolling.current) return;
      isPolling.current = true;

      try {
        const res = await startMatch(username);

        if (res.data.message === "waiting") {
          setStatus("Waiting for opponent...");
        } else {
          // MATCH FOUND 🔥
          clearInterval(interval); // Stop polling immediately
          localStorage.setItem("session", JSON.stringify(res.data));
          navigate("/quiz");
        }
      } catch (err) {
        console.error("Matchmaking Error:", err);
        setStatus("Retrying...");
      } finally {
        isPolling.current = false;
      }
    };

    // call immediately
    findMatch();

    // POLL EVERY 2 SECONDS (1s is too aggressive for some networks)
    interval = setInterval(findMatch, 2000);

    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-700 to-indigo-800 flex items-center justify-center text-white">
      <Card>
        <h2 className="text-xl text-center animate-pulse">{status}</h2>
      </Card>
    </div>
  );
}