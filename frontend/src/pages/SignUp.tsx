import { useState } from "react";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { BackendURL } from "../config";

export function SignUp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BackendURL}/api/v1/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const errorMessage = await res.text();
        throw new Error(`Signup failed: ${errorMessage}`);
      }

      const data = await res.json();
      console.log("Signup successful:", data);

      localStorage.setItem("token", data.token);
      alert("Signup successful!");

    } catch (err) {
      console.error(err);
      alert("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-200 flex justify-center items-center">
      <div className="bg-white rounded border min-w-64 p-6 shadow-md space-y-4">
        <Input
          placeholder="User Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex justify-center">
          <Button
            title="Sign Up"
            size="md"
            variant="primary"
            onClick={handleSignUp}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
}
