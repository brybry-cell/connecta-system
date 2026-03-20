import InputField from "../components/inputfield";
import Button from "../components/button";
import { useNavigate } from "react-router-dom";
import "./login.css";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {

    try {
const userCredential = await signInWithEmailAndPassword(
  auth,
  email.trim().toLowerCase(),
  password
);

      const user = userCredential.user;

      // check Firestore role
      const userRef = doc(db, "residents", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        alert("Account not found");
        return;
      }

const userData = userSnap.data();

// 🔥 GET ROLES FROM BACKEND
const res = await fetch("https://connecta-backend-u4tw.onrender.com/admin/settings/roles");
const roleData = await res.json();

// CHECK IF ROLE EXISTS
const matchedRole = roleData?.roles?.find(
  (r) => r.name.toLowerCase() === userData.role.toLowerCase()
);

if (!matchedRole) {
  alert("Access denied. No role assigned.");
  return;
}

// GET PERMISSIONS
const permissions = matchedRole?.permissions || [];

// SAVE USER WITH PERMISSIONS
const fullUser = {
  uid: user.uid,
  role: userData.role,
  permissions
};

localStorage.setItem("user", JSON.stringify(fullUser));


      navigate("/dashboard");

    } catch (error) {

  console.log("Firebase error:", error);

  switch (error.code) {

    case "auth/user-not-found":
      alert("No account found with this email.");
      break;

    case "auth/wrong-password":
      alert("Incorrect password.");
      break;

    case "auth/invalid-email":
      alert("Invalid email format.");
      break;

    case "auth/too-many-requests":
      alert("Too many login attempts. Try again later.");
      break;

    case "auth/network-request-failed":
      alert("Network error. Check your internet connection.");
      break;

    default:
      alert("Login failed: " + error.message);
  }

}

  };

  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="min-h-screen bg-[url('./src/assets/updatebg.png')] bg-cover bg-center bg-no-repeat flex items-center justify-center px-4">

      <div className="w-full max-w-xl bg-white/15 backdrop-blur-xl border border-blue-400/40 rounded-2xl shadow-xl p-8">

        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Login
        </h1>

        <div className="mb-5">
          <InputField
            type="email"
            placeholder="Enter your email"
            text="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

<div className="mb-6 relative">
  <InputField
    type={showPassword ? "text" : "password"}
    placeholder="Enter your password"
    text="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
  />

  {/* Toggle Button */}
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-10 text-sm text-blue-500 hover:text-blue-200"
  >
    {showPassword ? "Hide" : "Show"}
  </button>
</div>

        <Button
          text="Login"
          onClick={handleLogin}
          className="w-full h-12 bg-gradient-to-r from-blue-500 to-green-400 text-white font-semibold rounded-lg hover:scale-105 transition duration-300 shadow-lg"
        />

      </div>
    </div>
  );
}

export default Login;