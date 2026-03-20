import Card from "../components/card";
import InputField from "../components/inputfield";
import Button from "../components/button";
import bgImage from "../assets/nobg.png";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { uploadToCloudinary } from "../utils/cloudinary";
import button from "../components/button";

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
      !contact ||
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
    } try {

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

      // Clear inputs
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
    <div className="min-h-screen bg-[url('/src/assets/background.png')] bg-cover bg-center flex items-center justify-center px-4 py-8">

        {/* Signup Card */}
        <div className="w-full max-w-xl bg-white/15 backdrop-blur-xl border border-blue-400/40 rounded-2xl shadow-xl p-8">

          <h1 className="text-3xl font-semibold text-white text-center mb-6 tracking-wide">
            Create Account
          </h1>

          {/* First + Last Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <InputField 
            type="text" 
            placeholder="Juan" 
            text="First Name" 
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}/>
            <InputField 
            type="text" 
            placeholder="Doe" 
            text="Last Name" 
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}/>
          </div>

          {/* Email + Contact */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <InputField 
            type="email" 
            placeholder="Enter your email" 
            text="Email" 
            value={email}
            onChange = {(e) => setEmail(e.target.value)}/>
<InputField 
  type="tel"
  placeholder="09XXXXXXXXX"
  text="Contact Number"
  value={contact}
  onChange={(e) => {
    let value = e.target.value.replace(/[^0-9]/g, "");

    // Auto convert 639 → 09
    if (value.startsWith("639")) {
      value = "0" + value.slice(2);
    }

    // Force starting with 09
    if (value.length === 1 && value !== "0") return;
    if (value.length === 2 && value !== "09") return;

    // Limit to 11 digits
    if (value.length > 11) return;

    setContact(value);
  }}
/>
          </div>

          {/* Address */}
          <div className="mb-4">
            <InputField
              type="text"
              placeholder="House No., Street, Barangay, City"
              text="Address"
              value={address}
              onChange = {(e) => setAddress(e.target.value)}
            />
            <p className="text-gray-200 text-xs mt-1">
  Example: 123 Mabini St., Brgy. San Isidro, Cebu City
</p>
          </div>
        

          {/* Password Row */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">

  {/* Password */}
  <div className="relative">
    <InputField
      type={showPassword ? "text" : "password"}
      placeholder="Min 8 characters"
      text="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-10 text-sm text-blue-500 hover:text-blue-200"
    >
      {showPassword ? "Hide" : "Show"}
    </button>
  </div>

  {/* Confirm Password */}
<div className="relative">
    <InputField
      type={showConfirmPassword ? "text" : "password"}
      placeholder="Confirm password"
      text="Confirm"
      value={confirmPassword}
      onChange={(e) => setConfirmPassword(e.target.value)}
    />

    <button
      type="button"
      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
      className="absolute right-3 top-10 text-sm text-blue-500"
    >
      {showConfirmPassword ? "Hide" : "Show"}
    </button>
  </div>

</div>

<div className="mb-6">
  <InputField
    type="file"
    text="Proof of Residency"
    onChange={(e) => {
      const file = e.target.files[0];
      setProof(file);

      if (file) {
        setPreview(URL.createObjectURL(file));
      }
    }}
  />

<div className="bg-white/10 rounded-lg p-3 mt-3">
<p className="text-white text-xs mt-2 font-semibold">
  Accepted documents:
</p>

<ul className="text-white text-xs list-disc list-inside opacity-90">
  <li>Water Bill</li>
  <li>Electric Bill</li>
  <li>WiFi / Internet Bill</li>
  <li>Barangay Clearance</li>
  <li>Valid ID with address</li>
</ul>

<p className="text-gray-200 text-xs mt-1">
  (JPG or PNG • Max 5MB)
</p>

<p className="text-yellow-300 text-xs mt-1 font-medium">
  Make sure your name and address are clearly visible.
</p>
</div>
  {/* 👇 SMALL PREVIEW UI */}
  {preview && (
    <div className="flex items-center gap-3 mt-3">

      <img
        src={preview}
        alt="Proof Preview"
        className="w-20 h-20 object-cover rounded-lg border border-white"
      />

      <div className="flex flex-col">
        <p className="text-white text-xs">{proof?.name}</p>

        <button
          type="button"
          onClick={removeImage}
          className="text-red-300 text-xs hover:text-red-400 text-left"
        >
          Remove
        </button>
      </div>

    </div>
  )}
</div>
          {/* Button */}
<Button
  text={loading ? "Creating Account..." : "Sign Up"}
  onClick={handleSignup}
  disabled={loading}
  className="w-full h-12 bg-gradient-to-r from-blue-500 to-green-400 text-white font-semibold rounded-lg hover:scale-105 transition duration-300 shadow-lg"
/>

          <p className="text-center text-gray-200 mt-5 text-sm">
            Have an account?{" "}
            <Link
              to="/"
              className="text-blue-300 hover:text-blue-200 hover:underline transition"
            >
              Login
            </Link>
          </p>


        </div>

        {showPopup && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">

    <Card
      title="Registration Successful"
      description="Thank you for registering. We will send you an email confirmation once your account is verified."
      className="w-[350px] text-center"
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