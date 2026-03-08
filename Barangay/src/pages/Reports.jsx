import { useState } from "react";
import Header from "../components/header";
import SideNav from "../components/navi";
import Table from "../components/table";
import Modal from "../components/modal";
import Search from "../components/search";

function Reports() {
  const columns = [
    "Resident Name",
    "Type of Report",
    "Status",
    "Description",
    "Action",
  ];

  const data = [
    ["Bryce Obien", "Illegal dumping", "Pending", "Our neighbor throws trash...", "Action"],
    ["Reign Vidal", "Clogged Drainage", "On-going", "Drainage near our house...", "Action"],
    ["Kerby Albios", "Water Disruption", "Resolving", "No water access...", "Action"],
  ];

  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleview = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");


  return (
    <>
      <Header />
      <SideNav open={open} setOpen={setOpen} />

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
          Reports Management
        </h1>

<div className="flex justify-end mb-6">
  <Search 
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
</div>

        {/* OVERALL REPORTS */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold mb-2 text-gray-700">
            Overall Reports
          </h2>
          <Table columns={columns} data={data} onView = {handleview}/>
        </div>

        {/* MY CASE */}
        <div>
          <h2 className="text-lg font-semibold mb-2 text-gray-700">
            My Case
          </h2>
          <Table columns={columns} data={data} onView = {handleview}/>
        </div>
      </div>

      <Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Report Details"
>
  {selectedReport && (
    <div className="space-y-2 text-sm">
      <p><strong>User ID:</strong> {selectedReport[0]}</p>
      <p><strong>Name:</strong> {selectedReport[1]}</p>
      <p><strong>Type:</strong> {selectedReport[2]}</p>
      <p><strong>Status:</strong> {selectedReport[3]}</p>
      <p><strong>Description:</strong> {selectedReport[4]}</p>
    </div>
  )}
</Modal>
    </>
  );
}

export default Reports;