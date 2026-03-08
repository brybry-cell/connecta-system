import Header from "../components/Header";
import SideNav from "../components/navi";
import { useState } from "react";
import profile from "../assets/profile.png";

function Settings() {
  const [open, setOpen] = useState(false);

  const SettingItem = ({ label, danger }) => (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-xl 
      transition cursor-pointer group
      ${danger ? "hover:bg-red-50" : "hover:bg-blue-50"}`}
    >
      {/* Left Side */}
      <div className="flex items-center gap-4">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center
          ${danger ? "bg-red-100" : "bg-blue-100"}`}
        >
          <img
            src={profile}
            alt="icon"
            className="w-4 h-4 rounded-full object-cover"
          />
        </div>

        <span
          className={`text-sm font-medium transition
          ${
            danger
              ? "text-red-500 group-hover:text-red-600"
              : "text-gray-700 group-hover:text-[#007CCF]"
          }`}
        >
          {label}
        </span>
      </div>

      {/* Arrow */}
      <span
        className={`text-lg transition
        ${
          danger
            ? "text-red-400 group-hover:text-red-600"
            : "text-gray-400 group-hover:text-[#007CCF]"
        }`}
      >
        ›
      </span>
    </div>
  );

  const SectionTitle = ({ title }) => (
    <h3 className="text-xs uppercase tracking-wider text-gray-500 mt-8 mb-3 px-2">
      {title}
    </h3>
  );

  return (
    <>
      <Header />
      <SideNav open={open} setOpen={setOpen} />

      <div className="md:ml-[260px] bg-gray-50 min-h-screen px-6 py-8">

        {/* Mobile Hamburger */}
        <div className="md:hidden mb-6">
          <button
            onClick={() => setOpen(true)}
            className="text-2xl text-[#007CCF]"
          >
            ☰
          </button>
        </div>

        {/* Wider Responsive Container */}
        <div className="max-w-md sm:max-w-lg md:max-w-2xl lg:max-w-3xl mx-auto">

          <div className="bg-white rounded-2xl shadow-xl border border-blue-200 p-6">

            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search Settings"
                  className="w-full h-11 pl-5 pr-4 rounded-xl border border-gray-300 
                             focus:ring-2 focus:ring-[#007CCF] focus:border-[#007CCF] 
                             outline-none text-sm transition"
                />
              </div>
            </div>

            {/* ACCOUNT */}
            <SectionTitle title="Account" />
            <SettingItem label="Account Information" />
            <SettingItem label="Change Password" />

            {/* SUPPORT */}
            <SectionTitle title="Support" />
            <SettingItem label="Help & Support" />

            {/* PRIVACY */}
            <SectionTitle title="Privacy" />
            <SettingItem label="Privacy & Security" />
            <SettingItem label="Delete Account" danger />

            {/* ABOUT */}
            <SectionTitle title="About" />
            <SettingItem label="About" />

          </div>
        </div>
      </div>
    </>
  );
}

export default Settings;