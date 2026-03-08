import Card from "../components/card";
import InputField from "../components/inputfield";
import Button from "../components/button";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState("");

const handleLogin = async () => {

  try {

    setLoading(true);

    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = userCredential.user;

    // check firestore resident document
    const residentRef = doc(db, "residents", user.uid);
    const residentSnap = await getDoc(residentRef);

    if (!residentSnap.exists()) {
      alert("User record not found.");
      return;
    }

    const residentData = residentSnap.data();

    if (!residentData.isverified) {
      alert("Your account is not yet verified by the barangay.");
      return;
    }

    localStorage.setItem("uid", user.uid);

    alert("Login Successfully!");

    navigate("/dashboard");

  } catch (error) {

    alert("Invalid email or password");

  }

  setLoading(false);
};
  return (
    <div className="min-h-screen bg-[url('/src/assets/background.png')] bg-cover bg-center bg-no-repeat flex items-center justify-center px-4">
      
      {/* Glass Card */}
        <div className="w-full max-w-xl bg-white/15 backdrop-blur-xl border border-blue-400/40 rounded-2xl shadow-xl p-8">
        
        {/* Title */}
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Login
        </h1>

        {/* Email */}
        <div className="mb-5">
          <InputField
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            text="Email"
          />
        </div>

        {/* Password */}
        <div className="mb-6">
          <InputField
            type="password"
            placeholder="Enter your password"
            text="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Button */}
<Button
  text={loading ? "Logging in..." : "Login"}
  onClick={handleLogin}
  disabled={loading}
  className="w-full h-12 bg-gradient-to-r from-blue-500 to-green-400 text-white font-semibold rounded-lg"
/>
        {/* Signup */}
        <p className="text-center text-gray-200 mt-6 text-sm">
          Don’t have an account?{" "}
          <Link
            to="/signup"
            className="text-blue-300 hover:text-blue-200 hover:underline transition"
          >
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default Login;