import Header from "../components/header";
import SideNavi from "../components/navi";
import { useState } from "react";
function SystemSettings() {
    const [open, setOpen] = useState(false);
    return(
        <>
        <Header/>
        <SideNavi open={open} setOpen={setOpen}/>
        <div className="md:ml-[260px] bg-gray-50 min-h-screen">

        {/* MOBILE HAMBURGER */}
        <div className="md:hidden px-6 pt-6">
          <button
            onClick={() => setOpen(true)}
            className="text-2xl text-[#007CCF]"
          >
            ☰
          </button>
        </div>
        </div>
        <h1>This is SystemSettings</h1>
        </>
    )
}

export default SystemSettings;