import { useState } from "react";
import { Input } from "../components/Input";
import { Button } from "../components/Button";
import { BackendURL } from "../config";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

export function SignUp() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BackendURL}/api/v1/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg = err?.error?.message || err?.message || "Signup failed";
        throw new Error(msg);
      }

      const data = await res.json();
      const token = data.token ?? data.data?.token;
      if (!token) {
        throw new Error("No token returned from server");
      }
      localStorage.setItem("token", token);
      toast.success("Signup successful!");
      setTimeout(() => navigate("/dashboard"), 1000);
    } catch (err) {
      console.error(err);
      toast.error(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-200 flex justify-center items-center">
      <ToastContainer />
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
