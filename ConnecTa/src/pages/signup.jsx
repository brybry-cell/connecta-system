import Card from "../components/card";
import InputField from "../components/inputfield";
import Button from "../components/button";
import bgImage from "../assets/nobg.png";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { uploadToCloudinary } from "../utils/cloudinary";

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
    const response = await fetch("http://localhost:5000/signup", {
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
            placeholder="09XXXXXXXX" 
            text="Contact" 
            value={contact}
            onChange = {(e) => setContact(e.target.value)}/>
          </div>

          {/* Address */}
          <div className="mb-4">
            <InputField
              type="text"
              placeholder="House no., Street, City"
              text="Address"
              value={address}
              onChange = {(e) => setAddress(e.target.value)}
            />
          </div>

          {/* Password Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
            <InputField
              type="password"
              placeholder="Min 8 characters"
              text="Password"
              value = {password}
              onChange = {(e) => setPassword(e.target.value)}
            />
            <InputField
              type="password"
              placeholder="Confirm password"
              text="Confirm"
              value={confirmPassword}
              onChange = {(e) => setConfirmPassword(e.target.value)}
            />
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