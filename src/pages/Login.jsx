import { useState } from "react";
import { auth, googleProvider } from "../firebase";
import { signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/dashboard");
    } catch (error) {
      console.error("Google Sign-In Error:", error.message);
    }
  };

  // Handle Email/Password Login
  const handleEmailSignIn = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login Error:", error.message);
      alert(error.message);
    }
  };

  // Handle Email/Password Sign-Up
  const handleSignUp = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;

      // Optional: Set a display name (for new users)
      await updateProfile(newUser, {
        displayName: email.split("@")[0], // Default name from email
      });

      navigate("/dashboard"); // Redirect after successful signup
    } catch (error) {
      console.error("Signup Error:", error.message);
      alert(error.message);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96 text-center">
        <h1 className="text-2xl font-bold">🎟️ TicketMania {isRegistering ? "Sign Up" : "Login"}</h1>

        <button onClick={handleGoogleSignIn} className="bg-blue-600 w-full px-4 py-2 mt-4 rounded hover:bg-blue-700 transition">
          Sign in with Google
        </button>

        <p className="mt-4 text-gray-400">OR</p>

        <form className="mt-4 flex flex-col gap-2" onSubmit={isRegistering ? handleSignUp : handleEmailSignIn}>
          <input
            type="email"
            placeholder="Email"
            className="p-2 bg-gray-700 rounded text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="p-2 bg-gray-700 rounded text-black"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="bg-green-600 w-full px-4 py-2 rounded hover:bg-green-700 transition">
            {isRegistering ? "Sign Up" : "Login"}
          </button>
        </form>

        <button 
          onClick={() => setIsRegistering(!isRegistering)} 
          className="mt-2 text-sm text-gray-300 underline"
        >
          {isRegistering ? "Already have an account? Login" : "Create an account"}
        </button>
      </div>
    </div>
  );
};

export default Login;
