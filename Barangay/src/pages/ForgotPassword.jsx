import InputField from "../components/inputfield";
import Button from "../components/button";
import { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const auth = getAuth();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleReset = async () => {
    // Clear previous messages
    setMessage("");
    setError("");

    // Trim email to remove whitespace
    const trimmedEmail = email.trim();

    // Validate email input
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setError("Please enter a valid email address (e.g., name@example.com).");
      return;
    }

    try {
      setLoading(true);

      await sendPasswordResetEmail(auth, trimmedEmail);

      // Success message - always show success even if email doesn't exist (security best practice)
      setMessage("Password reset link has been sent to your email. Please check your inbox.");
      
      // Clear email field after successful request
      setEmail("");
      
    } catch (err) {
      // Handle specific Firebase errors
      console.error("Password reset error:", err);
      
      switch (err.code) {
        case 'auth/user-not-found':
          // For security, don't reveal if email exists or not
          // Still show success message to prevent email enumeration
          setMessage("If this email is registered, a password reset link has been sent.");
          setEmail("");
          break;
          
        case 'auth/invalid-email':
          setError("Invalid email address format. Please check and try again.");
          break;
          
        case 'auth/too-many-requests':
          setError("Too many reset attempts. Please wait a few minutes before trying again.");
          break;
          
        case 'auth/network-request-failed':
          setError("Network error. Please check your internet connection and try again.");
          break;
          
        case 'auth/internal-error':
          setError("An internal error occurred. Please try again later.");
          break;
          
        default:
          setError("Unable to send reset link. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[url('/src/assets/background.png')] bg-cover bg-center bg-no-repeat flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-white/15 backdrop-blur-xl border border-blue-400/40 rounded-2xl shadow-xl p-6 sm:p-7">

        {/* Title */}
        <h1 className="text-2xl font-bold text-white text-center mb-3">
          Forgot Password
        </h1>

        {/* Description */}
        <p className="text-gray-200 text-center mb-5 text-sm">
          Enter your email and we'll send you a link to reset your password.
        </p>

        {/* Email Input */}
        <div className="mb-4 max-w-sm mx-auto">
          <InputField
            type="email"
            placeholder="example@gmail.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              // Clear errors when user starts typing
              if (error) setError("");
              if (message) setMessage("");
            }}
            text="Email"
            disabled={loading}
          />
        </div>

        {/* Success Message */}
        {message && (
          <div className="mb-3 p-3 bg-green-500/20 border border-green-500 rounded-lg animate-fadeIn">
            <p className="text-green-300 text-sm text-center">
              {message}
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-3 p-3 bg-red-500/20 border border-red-500 rounded-lg animate-shake">
            <p className="text-red-300 text-sm text-center">
              {error}
            </p>
          </div>
        )}

        {/* Button */}
        <div className="max-w-sm mx-auto">
          <Button
            text={loading ? "Sending..." : "Send Reset Link"}
            onClick={handleReset}
            disabled={loading || !email.trim()}
            className={`w-full h-11 font-semibold rounded-lg transition-all duration-200 ${
              loading || !email.trim()
                ? "bg-gray-500 cursor-not-allowed text-white opacity-50"
                : "bg-gradient-to-r from-blue-500 to-green-400 text-white hover:opacity-90 hover:shadow-lg"
            }`}
          />
        </div>

        {/* Back to Login */}
        <p className="text-center text-gray-200 mt-5 text-sm">
          Remember your password?{" "}
          <Link
            to="/"
            className="text-blue-300 hover:text-blue-200 hover:underline transition-colors"
          >
            Back to Login
          </Link>
        </p>
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
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}

export default ForgotPassword;