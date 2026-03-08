import logo from "../assets/nobg.png";
import profile from "../assets/profile.png";

function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b-2 border-[#1976d2]">

      <div className="flex items-center justify-between 
                      px-8 py-3 
                      max-w-[1400px] mx-auto">

        {/* LEFT SIDE */}
        <div className="flex items-center gap-2">
          <img
            src={logo}
            alt="Logo"
            className="w-[45px] h-[45px] object-contain"
          />

          <h1 className="text-[25px] font-bold 
                         bg-gradient-to-r 
                         from-[#2EE850] 
                         to-[#007CCF] 
                         bg-clip-text 
                         text-transparent">
            ConnecTa
          </h1>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">

          <img
            src={profile}
            alt="Profile"
            className="w-[45px] h-[45px] rounded-full object-cover border border-gray-300"
          />

          <div className="flex flex-col">
            <p className="text-[#007CCF] font-bold text-sm">
              Bryce Obien
            </p>
            <p className="text-gray-500 text-xs">
              Resident
            </p>
          </div>

        </div>

      </div>
    </header>
  );
}

export default Header;