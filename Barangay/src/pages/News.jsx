import { useState } from "react";
import Header from "../components/header";
import SideNavi from "../components/navi";
import Table from "../components/table";
import Modal from "../components/modal";
import Search from "../components/search";

function News() {
  const [open, setOpen] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState("");

  // NEWS TABLE COLUMNS
  const columns = [
    "Title",
    "Category",
    "Date",
    "Status",
    "Action",
  ];

  // SAMPLE NEWS DATA
  const data = [
    ["Clean-up Drive", "Environment", "Feb 20, 2026", "Published", "Action"],
    ["Water Interruption", "Advisory", "Feb 18, 2026", "Scheduled", "Action"],
    ["Barangay Assembly", "Event", "Feb 15, 2026", "Completed", "Action"],
  ];

  const handleView = (news) => {
    setSelectedNews(news);
    setIsModalOpen(true);
  };

  return (
    <>
      <Header />
      <SideNavi open={open} setOpen={setOpen} />

      <div className="md:ml-[260px] bg-gray-50 min-h-screen px-6 py-8">

        {/* MOBILE MENU */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setOpen(true)}
            className="text-2xl text-[#007CCF]"
          >
            ☰
          </button>
        </div>

        {/* PAGE TITLE */}
        <h1 className="text-2xl font-bold text-[#007CCF] mb-6">
          News Management
        </h1>

        {/* SEARCH */}
        <div className="flex justify-end mb-6">
          <Search
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* NEWS TABLE */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-700">
            Barangay News & Announcements
          </h2>
          <Table columns={columns} data={data} onView={handleView} />
        </div>
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="News Details"
      >
        {selectedNews && (
          <div className="space-y-2 text-sm">
            <p><strong>Title:</strong> {selectedNews[0]}</p>
            <p><strong>Category:</strong> {selectedNews[1]}</p>
            <p><strong>Date:</strong> {selectedNews[2]}</p>
            <p><strong>Status:</strong> {selectedNews[3]}</p>
          </div>
        )}
      </Modal>
    </>
  );
}

export default News;