import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

import logo from "../assets/nobg.png";
import profile from "../assets/profile.png";

function Header() {

  const [name, setName] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const uid = localStorage.getItem("uid");
    if (!uid) return;

    const userRef = doc(db, "residents", uid);

    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();

        setName(`${data.firstname} ${data.lastname}`);
        setRole(data.role || "Resident");
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-[#1976d2]">

      <div className="flex items-center justify-between px-4 sm:px-6 md:px-8 py-3 max-w-[1400px] mx-auto">

        {/* LEFT */}
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="Logo"
            className="w-[40px] h-[40px] sm:w-[45px] sm:h-[45px]"
          />

          <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-[#2EE850] to-[#007CCF] bg-clip-text text-transparent">
            ConnecTa
          </h1>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-3 sm:gap-4">

          <img
            src={profile}
            alt="Profile"
            className="w-9 h-9 sm:w-[45px] sm:h-[45px] rounded-full object-cover border border-gray-300"
          />

          <div className="flex flex-col leading-tight">
            <p className="text-[#007CCF] font-bold text-sm sm:text-base">
              {name || "Loading..."}
            </p>
            <p className="text-gray-500 text-xs sm:text-sm capitalize">
              {role}
            </p>
          </div>

        </div>

      </div>
    </header>
  );
}

export default Header;