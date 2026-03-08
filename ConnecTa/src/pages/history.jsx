import Header from "../components/Header";
import SideNav from "../components/navi";
import { useState } from "react";

function History() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Header />
      <SideNav open={open} setOpen={setOpen} />

      <div className="md:ml-[260px] px-6 py-6 bg-gray-50 min-h-screen">

        {/* Mobile Hamburger */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setOpen(true)}
            className="text-2xl text-[#007CCF]"
          >
            ☰
          </button>
        </div>

        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            History
          </h1>
          <p className="text-gray-500 mt-1">
            View all previous reports and activities.
          </p>
        </div>

        {/* Example Content Card */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <p className="text-gray-600">
            No history records available yet.
          </p>
        </div>

      </div>
    </>
  );
}

export default History;