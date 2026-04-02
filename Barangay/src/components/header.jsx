import { useEffect, useState, useRef } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";
import  accountIcon from "../assets/information.png"
import logo from "../assets/nobg.png";
import profile from "../assets/profile.png";
import logoutIcon from "../assets/logout.png";

function Header() {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [openDropdown, setOpenDropdown] = useState(false);
  const [profileImage, setProfileImage] = useState("");

  const dropdownRef = useRef();
  const navigate = useNavigate();

useEffect(() => {
  const uid = localStorage.getItem("uid");
  if (!uid) return;

  const fetchUser = async () => {
    const res = await fetch(`https://connecta-backend-u4tw.onrender.com/resident/${uid}`);
    const data = await res.json();

    const capitalize = (str) =>
      str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

    setProfileImage(data.profileImage || "");
    setName(`${capitalize(data.firstname)} ${capitalize(data.lastname)}`);
    setRole(data.role || "Resident");
  };

  fetchUser();
}, []);

  /* CLOSE DROPDOWN OUTSIDE */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ACTIONS */
  const goToAccount = () => {
    navigate("/settings?modal=account");
    setOpenDropdown(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 h-[64px] bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-full max-w-[1400px] mx-auto px-6 md:px-10">

        {/* LEFT */}
        <div className="flex items-center gap-3">
          <img src={logo} alt="Logo" className="w-10 h-10" />
          <h1 className="text-xl font-semibold tracking-tight 
                         bg-gradient-to-r from-[#2EE850] to-[#007CCF] 
                         bg-clip-text text-transparent">
            ConnecTa
          </h1>
        </div>

        {/* RIGHT */}
        <div ref={dropdownRef} className="relative">

          {/* USER BUTTON */}
          <button
            onClick={() => setOpenDropdown(!openDropdown)}
            className="flex items-center gap-3 px-3 py-2 rounded-xl 
                       hover:bg-gray-100 transition"
          >
            <img
              src={profileImage || profile}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover border border-gray-300"
            />

            <div className="hidden sm:flex flex-col text-left leading-tight">
              <p className="text-sm font-semibold text-gray-800">
                {name || "Loading..."}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {role}
              </p>
            </div>

            {/* CHEVRON */}
            <svg
              className={`w-4 h-4 text-gray-500 transition-transform ${
                openDropdown ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* DROPDOWN */}
          <div
            className={`absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl 
            border border-gray-100 overflow-hidden transform transition-all duration-200 origin-top-right
            ${
              openDropdown
                ? "scale-100 opacity-100"
                : "scale-95 opacity-0 pointer-events-none"
            }`}
          >

            {/* USER INFO */}
            <div className="px-4 py-3 border-b bg-gray-50">
              <p className="text-sm font-semibold text-gray-800">
                {name || "Loading..."}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {role}
              </p>
            </div>

            {/* MENU */}
            <div className="py-1">

              {/* ACCOUNT */}
              <button
                onClick={goToAccount}
                className="w-full flex items-center gap-2 px-4 py-3 text-sm 
                           text-gray-700 hover:bg-blue-50 transition"
              >
                <img
                  src={accountIcon}
                  alt="logout"
                  className="w-5 h-5"
                />
                <span className="font-medium tracking-tight">
                  Logout
                </span>              </button>

              {/* LOGOUT (same style as sidebar) */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm
                           text-gray-500 hover:text-red-500 hover:bg-red-50 transition"
              >
                <img
                  src={logoutIcon}
                  alt="logout"
                  className="w-5 h-5"
                />
                <span className="font-medium tracking-tight">
                  Logout
                </span>
              </button>

            </div>

          </div>

        </div>
      </div>
    </header>
  );
}

export default Header;