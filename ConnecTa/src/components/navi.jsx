import { Link, useLocation, useNavigate } from "react-router-dom";

import defhistory from "../assets/default-history.png";
import defdashboard from "../assets/default-dashboard.png";
import defreport from "../assets/default-report.png";
import defsettings from "../assets/default-settings.png";

import clickhistory from "../assets/clicked-history.png";
import clickdashboard from "../assets/clicked-dashboard.png";
import clickreport from "../assets/clicked-report.png";
import clicksettings from "../assets/clicked-settings.png";

import logoutIcon from "../assets/logout.png";

function Navi({ open, setOpen }) {
  const location = useLocation();
  const navigate = useNavigate();

  const navItem = (name, path, defaultIcon, activeIcon) => {
    const isActive = location.pathname === path;

    return (
      <Link
        to={path}
        onClick={() => setOpen(false)}
        className={`group flex items-center gap-3 mx-3 px-4 py-3 rounded-xl transition-all duration-200
        ${
          isActive
            ? "bg-blue-50 text-[#007CCF] font-semibold shadow-sm"
            : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
        }`}
      >
        <img
          src={isActive ? activeIcon : defaultIcon}
          alt={name}
          className="w-5 h-5 transition"
        />

        <span className="text-sm font-medium tracking-tight capitalize">
          {name}
        </span>

        {/* ACTIVE INDICATOR */}
        {isActive && (
          <div className="ml-auto w-2 h-2 bg-[#007CCF] rounded-full"></div>
        )}
      </Link>
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <>
      {/* MOBILE OVERLAY */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <nav
        className={`fixed top-[64px]
h-[calc(100vh-72px)] left-0
        h-[calc(100vh-64px)] w-[260px]
        bg-white border-r border-gray-200
        z-40 transform transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0
        flex flex-col justify-between`}
      >

        {/* TOP */}
        <div>

          {/* MOBILE CLOSE */}
          <div className="md:hidden flex justify-end p-4">
            <button
              onClick={() => setOpen(false)}
              className="text-xl text-gray-500 hover:text-[#007CCF] transition"
            >
              ✕
            </button>
          </div>

          {/* NAV ITEMS */}
          <div className="flex flex-col mt-2 space-y-1">

            {navItem("dashboard", "/dashboard", defdashboard, clickdashboard)}
            {navItem("report", "/report", defreport, clickreport)}
            {navItem("history", "/history", defhistory, clickhistory)}
            {navItem("settings", "/settings", defsettings, clicksettings)}

          </div>
        </div>

        {/* BOTTOM */}
        <div className="mb-6">

          <div className="mx-4 border-t border-gray-200 mb-4"></div>

          <button
            onClick={handleLogout}
            className="group flex items-center gap-3 mx-3 px-4 py-3 rounded-xl 
            text-gray-500 hover:text-red-500 hover:bg-red-50 transition w-[calc(100%-24px)]"
          >
            <img
              src={logoutIcon}
              alt="logout"
              className="w-5 h-5 transition"
            />

            <span className="text-sm font-medium tracking-tight">
              Logout
            </span>
          </button>

        </div>

      </nav>
    </>
  );
}

export default Navi;