import { useState } from "react";
import "./navi.css";
import { Link, useLocation } from "react-router-dom";

import defdashboard from "../assets/default-dashboard.png";
import defreports from "../assets/defreport.png";
import defnews from "../assets/defnews.png";
import defusers from "../assets/defusers.png";
import defsystem from "../assets/defsystem.png";
import defsettings from "../assets/defsettings.png";

import clickdashboard from "../assets/clicked-dashboard.png";
import clickreports from "../assets/clickreport.png";
import clicknews from "../assets/clicknews.png";
import clickusers from "../assets/clickuser.png";
import clicksystem from "../assets/clicksystem.png";
import clicksettings from "../assets/clicked-settings.png";

import logoutIcon from "../assets/logout.png";
import Button from "../components/button";

function Navi({ open, setOpen }) {
  const location = useLocation();
const navItem = (name, path, defaultIcon, activeIcon) => {
  const isActive = location.pathname === path;

  return (
    <Link
      to={path}
      onClick={() => setOpen(false)}
      className={`group flex items-center gap-3 mx-3 px-4 py-3 rounded-xl transition-all duration-200
      ${
        isActive
  ? "bg-blue-50 text-[#007CCF] font-semibold"
  : "text-gray-600 hover:bg-gray-100"
      }`}
    >
<img
  src={isActive ? activeIcon : defaultIcon}
  alt={name}
  className={`w-5 h-5 transition duration-200
    ${isActive 
      ? "opacity-100" 
      : "opacity-60 group-hover:opacity-100"}`}
 />
      <span className="text-sm font-medium capitalize tracking-wide">
        {name}
      </span>
    </Link>
  );
};

return (
  <>
    {/* MOBILE OVERLAY */}
    {open && (
      <div
        className="fixed inset-0 bg-black/40 z-30 md:hidden"
        onClick={() => setOpen(false)}
      />
    )}

    {/* SIDEBAR */}
    <nav
      className={`fixed top-16 left-0
      h-[calc(100vh-64px)] w-[260px]
      bg-white border-r border-gray-200 shadow-lg
      z-40 transform transition-transform duration-300
      ${open ? "translate-x-0" : "-translate-x-full"}
      md:translate-x-0
      flex flex-col justify-between`}
    >

      {/* TOP SECTION */}
      <div>

        {/* MOBILE CLOSE */}
        <div className="md:hidden flex justify-end p-4">
          <button
            onClick={() => setOpen(false)}
            className="text-2xl text-[#007CCF]"
          >
            ✕
          </button>
        </div>

<div className="flex items-center justify-center mt-0 md:mt-4">
  <Button
    text="+ Add New Post"
    onClick={() => alert("Clicked")}
    className="bg-[#007CCF] text-white px-5 py-2.5 rounded-lg hover:bg-[#005fa3] transition"
  />
</div>
        <div className="flex flex-col mt-4">
          {navItem("dashboard", "/dashboard", defdashboard, clickdashboard)}
          {navItem("Reports", "/reports", defreports, clickreports)}
          {navItem("News", "/news", defnews, clicknews)}
          {navItem("Users", "/Users", defusers, clickusers)}
          {navItem("settings", "/settings", defsettings, clicksettings)}
          {navItem("System settings", "/systemsettings", defsystem, clicksystem)}

        </div>

      </div>

      {/* BOTTOM LOGOUT */}
<div className="mb-6">
  <div className="mx-3 border-t border-gray-200 mb-4"></div>

  <Link
    to="/"
    className="group flex items-center gap-3 mx-3 px-4 py-3 rounded-xl 
               text-gray-500 hover:text-red-500 hover:bg-red-50 
               transition"
  >
    <img
      src={logoutIcon}
      alt="logout"
      className="w-5 h-5 group-hover:opacity-80 transition"
    />
    <span className="text-sm font-medium tracking-wide">
      Logout
    </span>
  </Link>
</div>

    </nav>
  </>
);
}

export default Navi;