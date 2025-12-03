import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../api/api";
import Button from "../components/Button";
import Card from "../components/Card";

export default function UsernamePage() {
  const [username, setUsername] = useState("");
  const navigate = useNavigate();

  const handleStart = async () => {
    const res = await createUser(username);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    navigate("/match");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <Card>
        <h1 className="text-2xl font-bold mb-4 text-center">Enter Username</h1>

        <input
          className="w-full px-4 py-2 rounded bg-gray-800 text-white mb-4"
          placeholder="john123"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <Button onClick={handleStart}>Continue</Button>
      </Card>
    </div>
  );
}
