import { useEffect, useState } from "react";
import { startMatch } from "../api/api";
import { useNavigate } from "react-router-dom";
import Card from "../components/Card";

export default function MatchPage() {
  const navigate = useNavigate();
    localStorage.removeItem("session");
  const user = JSON.parse(localStorage.getItem("user"));
  const username = user.username;

  const [status, setStatus] = useState("Searching...");

  useEffect(() => {
    let interval;

    const findMatch = async () => {
      const res = await startMatch(username);

      if (res.data.message === "waiting") {
        setStatus("Waiting for opponent...");
      } else {
        // MATCH FOUND 🔥
        localStorage.setItem("session", JSON.stringify(res.data));
        navigate("/quiz");
      }
    };

    // call immediately
    findMatch();

    // POLL EVERY 1 SECOND 🔥
    interval = setInterval(findMatch, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-r from-purple-700 to-indigo-800 flex items-center justify-center text-white">
      <Card>
        <h2 className="text-xl text-center">{status}</h2>
      </Card>
    </div>
  );
}
