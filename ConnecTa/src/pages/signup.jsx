import Card from "../components/card";
import InputField from "../components/inputfield";
import Button from "../components/button";
import bgImage from "../assets/nobg.png";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { uploadToCloudinary } from "../utils/cloudinary";
import button from "../components/button";
import hideIcon from "../assets/eye.png";
import unhideIcon from "../assets/not.png";

function Signup() {

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [proof, setProof] = useState(null);
  const [preview, setPreview] = useState(null);
  const [showPopup, setShowPopUp] = useState(false);

  const navigate = useNavigate();

  const removeImage = () => {
    setProof(null);
    setPreview(null);
  };

  const handleSignup = async () => {

    if (
      !firstname ||
      !lastname ||
      !email ||
      !address ||
      !password ||
      !confirmPassword ||
      !proof
    ) {
      alert("Please fill in all fields and upload proof of residency.")
      return;
    }

    if (password != confirmPassword) {
      alert("Password do not match");
      return;
    }

    if (password.length < 8) {
      alert("Password must be at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      let proofURL = "";

      if (proof) {
        proofURL = await uploadToCloudinary(proof);
      }

      const response = await fetch("https://connecta-backend-u4tw.onrender.com/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          firstname,
          lastname,
          email,
          contact,
          address,
          password,
          proofOfResidency: proofURL
        })
      });

      const data = await response.json();

      if (response.ok) {
        setShowPopUp(true);

        setFirstname("");
        setLastname("");
        setEmail("");
        setContact("");
        setAddress("");
        setPassword("");
        setConfirmPassword("");
      } else {
        alert(data.error);
      }

    } catch (error) {
      alert("Server error");
    }

    setLoading(false);
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="min-h-screen bg-[url('/src/assets/background.png')] bg-cover bg-center flex items-center justify-center px-4 py-6">

      <div className="w-full max-w-lg bg-white/15 backdrop-blur-xl border border-blue-400/40 rounded-2xl shadow-xl p-6">

        {/* Name */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 max-w-md mx-auto">
          <InputField type="text" placeholder="Juan" text="First Name" value={firstname} onChange={(e) => setFirstname(e.target.value)} />
          <InputField type="text" placeholder="Doe" text="Last Name" value={lastname} onChange={(e) => setLastname(e.target.value)} />
        </div>

        {/* Email */}
        <div className="mb-4 max-w-md mx-auto">
          <InputField type="email" placeholder="example@gmail.com" text="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        {/* Address */}
        <div className="mb-4 max-w-md mx-auto">
          <InputField
            type="text"
            placeholder="House No., Street, Barangay, City"
            text="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          <p className="text-gray-200 text-xs mt-1">
            Example: 123 Mabini St., Brgy. San Isidro, Cebu City
          </p>
        </div>

        {/* Password */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5 max-w-md mx-auto">

          <div className="relative">
            <InputField
              type={showPassword ? "text" : "password"}
              placeholder="Min 8 characters"
              text="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-10">
              <img src={showPassword ? hideIcon : unhideIcon} className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <InputField
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              text="Confirm"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-10">
              <img src={showConfirmPassword ? hideIcon : unhideIcon} className="w-5 h-5" />
            </button>
          </div>

        </div>

        {/* Proof */}
        <div className="mb-6 max-w-md mx-auto">
          <InputField
            type="file"
            text="Proof of Residency"
            onChange={(e) => {
              const file = e.target.files[0];
              setProof(file);
              if (file) setPreview(URL.createObjectURL(file));
            }}
          />

          <div className="bg-white/10 rounded-lg p-3 mt-3 text-xs">
            <p className="text-white font-semibold">Accepted documents:</p>
            <ul className="list-disc list-inside text-white opacity-90">
              <li>Water Bill</li>
              <li>Electric Bill</li>
              <li>WiFi / Internet Bill</li>
              <li>Barangay Clearance</li>
              <li>Valid ID with address</li>
            </ul>
            <p className="text-gray-200 mt-1">(JPG or PNG • Max 5MB)</p>
            <p className="text-yellow-300 mt-1 font-medium">
              Make sure your name and address are clearly visible.
            </p>
          </div>

          {preview && (
            <div className="flex items-center gap-3 mt-3">
              <img src={preview} className="w-20 h-20 object-cover rounded-lg border border-white" />
              <div>
                <p className="text-white text-xs">{proof?.name}</p>
                <button onClick={removeImage} className="text-red-300 text-xs">
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Button */}
        <div className="max-w-md mx-auto">
          <Button
            text={loading ? "Creating Account..." : "Sign Up"}
            onClick={handleSignup}
            disabled={loading}
            className={`w-full h-11 font-semibold rounded-lg transition ${
              loading
                ? "bg-gray-500 cursor-not-allowed text-white"
                : "bg-gradient-to-r from-blue-500 to-green-400 text-white hover:opacity-90"
            }`}
          />
        </div>

        <p className="text-center text-gray-200 mt-5 text-sm">
          Have an account?{" "}
          <Link to="/" className="text-blue-300 hover:underline">
            Login
          </Link>
        </p>

      </div>

      {showPopup && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <Card
            title="Registration Successful"
            description="We will notify you once your account is verified."
            className="w-[90%] max-w-sm text-center"
          >
            <button
              onClick={() => navigate("/")}
              className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
            >
              Login
            </button>
          </Card>
        </div>
      )}
    </div>
  );
}

export default Signup;