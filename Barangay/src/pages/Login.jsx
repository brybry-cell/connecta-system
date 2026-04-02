import InputField from "../components/inputfield";
import Button from "../components/button";
import { useNavigate, Link } from "react-router-dom";
import "./login.css";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase";
import { doc, getDoc } from "firebase/firestore";
import hideIcon from "../assets/eye.png";
import unhideIcon from "../assets/not.png";

function Login() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: ""
  });

  // Validation function with proper error messages
  const validateForm = () => {
    let isValid = true;
    const newFieldErrors = { email: "", password: "" };

    // Email validation
    if (!email.trim()) {
      newFieldErrors.email = "Email address is required";
      isValid = false;
    } else if (!/^[^\s@]+@([^\s@]+\.)+[^\s@]+$/.test(email)) {
      newFieldErrors.email = "Please enter a valid email address (e.g., name@example.com)";
      isValid = false;
    }

    // Password validation
    if (!password) {
      newFieldErrors.password = "Password is required";
      isValid = false;
    } else if (password.length < 6) {
      newFieldErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setFieldErrors(newFieldErrors);
    return isValid;
  };

  // Get user-friendly error message based on error code
  const getErrorMessage = (errorCode) => {
    switch (errorCode) {
      case "auth/invalid-credential":
        return "Invalid email or password. Please check your credentials and try again.";
      
      case "auth/user-not-found":
        return "No account found with this email address. Please check your email or sign up for a new account.";
      
      case "auth/wrong-password":
        return "Incorrect password. Please try again or click 'Forgot Password' to reset it.";
      
      case "auth/invalid-email":
        return "The email address format is invalid. Please enter a valid email (e.g., name@example.com).";
      
      case "auth/user-disabled":
        return "This account has been disabled. Please contact support for assistance.";
      
      case "auth/too-many-requests":
        return "Too many failed login attempts. Please wait a few minutes before trying again.";
      
      case "auth/network-request-failed":
        return "Unable to connect to the server. Please check your internet connection and try again.";
      
      case "auth/operation-not-allowed":
        return "Email/password sign-in is currently disabled. Please contact support or use another sign-in method.";
      
      case "auth/email-already-in-use":
        return "This email is already registered. Please sign in or reset your password.";
      
      case "auth/internal-error":
        return "An internal error occurred. Please try again later.";
      
      default:
        console.error("Unhandled error code:", errorCode);
        return "Login failed. Please check your credentials and try again. If the problem persists, contact support.";
    }
  };

  const handleLogin = async () => {
    // Clear previous messages
    setError("");
    setMessage("");
    setFieldErrors({ email: "", password: "" });
    
    // Validate form before proceeding
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Trim and lowercase email for consistency
      const formattedEmail = email.trim().toLowerCase();
      const formattedPassword = password;

      console.log("Attempting login for:", formattedEmail);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        formattedEmail,
        formattedPassword
      );

      const user = userCredential.user;
      console.log("Login successful for user:", user.uid);

      // ✅ Use the updated endpoint that returns combined permissions
      const userRes = await fetch(`https://connecta-backend-u4tw.onrender.com/resident/${user.uid}`);
      
      if (!userRes.ok) {
        throw new Error("Failed to fetch user data");
      }
      
      const userData = await userRes.json();
      console.log("User data retrieved:", userData);
      
      if (!userData.isverified && userData.role === "resident") {
        setError("Your account is pending verification. Please wait for admin approval.");
        setIsLoading(false);
        return;
      }

      // ✅ Use the combined permissions from the backend
      const allPermissions = userData.permissions || [];
      const rolePermissions = userData.rolePermissions || [];
      const customPermissions = userData.customPermissions || [];

      console.log("Combined permissions:", allPermissions);
      console.log("Role permissions:", rolePermissions);
      console.log("Custom permissions:", customPermissions);

      // Save user with combined permissions
      const fullUser = {
        uid: user.uid,
        email: user.email,
        role: userData.role,
        permissions: allPermissions, // This now includes both role and custom permissions
        rolePermissions: rolePermissions,
        customPermissions: customPermissions,
        displayName: userData.displayName || `${userData.firstname} ${userData.lastname}`,
        profileImage: userData.profileImage || "",
        createdAt: userData.createdAt
      };

      localStorage.setItem("user", JSON.stringify(fullUser));
      localStorage.setItem("uid", user.uid);
      localStorage.setItem("role", userData.role);
      localStorage.setItem("permissions", JSON.stringify(allPermissions));
      localStorage.setItem("rolePermissions", JSON.stringify(rolePermissions));
      localStorage.setItem("customPermissions", JSON.stringify(customPermissions));

      setMessage("Login successful! Redirecting to dashboard...");

      setTimeout(() => {
        navigate("/dashboard");
      }, 1500);

    } catch (error) {
      console.error("Login error:", error);
      
      // Get user-friendly error message
      const errorMessage = getErrorMessage(error.code);
      setError(errorMessage);
      
      // Set field-specific error if applicable
      if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
        setFieldErrors({
          email: "",
          password: "Invalid email or password"
        });
      } else if (error.code === "auth/user-not-found" || error.code === "auth/invalid-email") {
        setFieldErrors({
          email: "Account not found",
          password: ""
        });
      }
      
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !isLoading) {
      handleLogin();
    }
  };

  return (
    <div className="min-h-screen bg-[url('/src/assets/background.png')] bg-cover bg-center bg-no-repeat flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white/15 backdrop-blur-xl border border-blue-400/40 rounded-2xl shadow-xl p-6 sm:p-7">

        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Welcome Back
        </h1>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-100 text-sm text-center animate-shake">
            <span className="font-semibold">⚠️ </span>
            {error}
          </div>
        )}

        {/* Success Message */}
        {message && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-100 text-sm text-center animate-fadeIn">
            <span className="font-semibold">✓ </span>
            {message}
          </div>
        )}

        <div className="mb-4 max-w-sm mx-auto">
          <InputField
            type="email"
            placeholder="Enter your email address"
            text="Email Address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
              setFieldErrors({ ...fieldErrors, email: "" });
            }}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            error={fieldErrors.email}
          />
        </div>

        <div className="mb-2 relative max-w-sm mx-auto">
          <InputField
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            text="Password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
              setFieldErrors({ ...fieldErrors, password: "" });
            }}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            error={fieldErrors.password}
          />

          {/* Toggle Password Button */}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            className="absolute right-3 top-10 text-blue-400 hover:text-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            <img
              src={showPassword ? hideIcon : unhideIcon}
              alt="toggle password visibility"
              className="w-5 h-5"
            />
          </button>
        </div>

        {/* Forgot Password Link */}
        <div className="text-left mb-6 max-w-sm mx-auto">
          <Link
            to="/forgotpassword"
            className="text-sm text-blue-300 hover:text-blue-200 hover:underline transition"
          >
            Forgot your password?
          </Link>
        </div>

        {/* Login Button */}
        <div className="max-w-sm mx-auto">
          <Button
            text={isLoading ? "Logging in..." : "Sign In"}
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full h-11 font-semibold rounded-lg transition flex items-center justify-center gap-2 ${
              isLoading
                ? "bg-gray-500 cursor-not-allowed text-white"
                : "bg-gradient-to-r from-blue-500 to-green-400 text-white hover:opacity-90 hover:shadow-lg"
            }`}
          >
            {isLoading && (
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {isLoading ? "Logging in..." : "Sign In"}
          </Button>
        </div>

      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default Login;