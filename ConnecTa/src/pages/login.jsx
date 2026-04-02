import InputField from "../components/inputfield";
import Button from "../components/button";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";
import { useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import hideIcon from "../assets/eye.png";
import unhideIcon from "../assets/not.png";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleLogin = async () => {
    setError("");
    setMessage("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setLoading(true);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;

      const residentRef = doc(db, "residents", user.uid);
      const residentSnap = await getDoc(residentRef);

      if (!residentSnap.exists()) {
        setError("User record not found.");
        return;
      }

      const residentData = residentSnap.data();

      if (!residentData.isverified) {
        setError("Your account is not yet verified by the barangay.");
        return;
      }

      localStorage.setItem("uid", user.uid);

      setMessage("Login successful!");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);

    } catch (error) {
      if (error.code === "auth/invalid-email") {
        setError("Invalid email format.");
      } else if (error.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (error.code === "auth/wrong-password") {
        setError("Incorrect password.");
      } else {
        setError("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[url('/src/assets/background.png')] bg-cover bg-center bg-no-repeat flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white/15 backdrop-blur-xl border border-blue-400/40 rounded-2xl shadow-xl p-6 sm:p-7">

        {/* Email */}
        <div className="mb-4 max-w-sm mx-auto">
          <InputField
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            text="Email"
          />
        </div>

        {/* Password */}
        <div className="mb-2 relative max-w-sm mx-auto">
          <InputField
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            text="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-10 text-blue-400 hover:text-blue-200"
          >
            <img
              src={showPassword ? hideIcon : unhideIcon}
              alt="toggle password"
              className="w-5 h-5"
            />
          </button>
        </div>

        {/* Forgot Password */}
        <div className="text-left mb-4 max-w-sm mx-auto">
          <Link
            to="/forgotpassword"
            className="text-sm text-blue-300 hover:text-blue-200 hover:underline transition"
          >
            Forgot your password?
          </Link>
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-red-300 text-sm text-center mb-3">
            {error}
          </p>
        )}



        {/* Button */}
        <div className="max-w-sm mx-auto">
          <Button
            text={loading ? "Logging in..." : "Login"}
            onClick={handleLogin}
            disabled={loading}
            className={`w-full h-11 font-semibold rounded-lg transition ${
              loading
                ? "bg-gray-500 cursor-not-allowed text-white"
                : "bg-gradient-to-r from-blue-500 to-green-400 text-white hover:opacity-90"
            }`}
          />
        </div>

                {/* Success Message */}
        {message && (
          <p className="text-green-300 text-sm text-center mb-3">
            {message}
          </p>
        )}

        {/* Signup */}
        <p className="text-center text-gray-200 mt-5 text-sm">
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