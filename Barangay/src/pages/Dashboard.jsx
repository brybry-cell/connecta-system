import Header from "../components/header";
import SideNav from "../components/navi";
import { useState } from "react";
function Dashboard() {
    const [open, setOpen] = useState(false);

    return(
        <>
        <Header/>
        <SideNav open={open} setOpen={setOpen}/>
                {/* Mobile Hamburger */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setOpen(true)}
            className="text-2xl text-[#007CCF]"
          >
            ☰
          </button>
        </div>
        <h1>This is dashboard</h1>
        </>
    )
}

export default Dashboard;