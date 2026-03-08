import Header from "../components/header";
import SideNavi from "../components/navi";
import { useState, useEffect } from "react";
import Table from "../components/table";
import Modal from "../components/modal";
import Search from "../components/search";

function User() {

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [pendingResidents, setPendingResidents] = useState([]);
  const [allResidents, setAllResidents] = useState([]);
  const [staffs, setStaffs] = useState([]);

  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    "Resident Name",
    "Contact Number",
    "Email",
    "Address",
    "Proof of Residency",
    "Action"
  ];

  /* ---------------- FETCH PENDING RESIDENTS ---------------- */

  useEffect(() => {
    fetch("http://localhost:5000/pending-residents")
      .then(res => res.json())
      .then(data => {

        const formatted = data.map(r => [
          r.firstname + " " + r.lastname,
          r.contact,
          r.email,
          r.address,
          r.proofOfResidency,
          "Action",
          r.uid
        ]);

        setPendingResidents(formatted);
      });
  }, []);

  /* ---------------- FETCH VERIFIED RESIDENTS ---------------- */

  useEffect(() => {
    fetch("http://localhost:5000/residents")
      .then(res => res.json())
      .then(data => {

        const formatted = data.map(r => [
          r.firstname + " " + r.lastname,
          r.contact,
          r.email,
          r.address,
          r.proofOfResidency,
          "Action",
          r.uid
        ]);

        setAllResidents(formatted);
      });
  }, []);

  /* ---------------- FETCH STAFFS ---------------- */

  useEffect(() => {
    fetch("http://localhost:5000/staffs")
      .then(res => res.json())
      .then(data => {

        const formatted = data.map(r => [
          r.firstname + " " + r.lastname,
          r.contact,
          r.email,
          r.address,
          r.proofOfResidency,
          "Action",
          r.uid
        ]);

        setStaffs(formatted);
      });
  }, []);

  /* ---------------- VIEW MODAL ---------------- */

  const handleview = (report) => {
    setSelectedReport(report);
    setIsModalOpen(true);
  };

  /* ---------------- APPROVE RESIDENT ---------------- */

  const approveResident = async (uid) => {

    await fetch(`http://localhost:5000/approve-resident/${uid}`, {
      method: "PUT"
    });

    alert("Resident Approved");

    setIsModalOpen(false);

    window.location.reload();
  };

  /* ---------------- SIMPLE PAGINATION ---------------- */

  const [pagePending, setPagePending] = useState(1);
  const [pageResidents, setPageResidents] = useState(1);
  const [pageStaffs, setPageStaffs] = useState(1);

  const perPage = 10;

  const paginate = (data, page) => {
    const start = (page - 1) * perPage;
    return data.slice(start, start + perPage);
  };

  return (
    <>
      <Header />
      <SideNavi open={open} setOpen={setOpen} />

      <div className="md:ml-[260px] bg-gray-50 min-h-screen p-6">

        {/* PAGE TITLE */}

        <h1 className="text-2xl font-bold text-[#007CCF] mb-6">
          User Management
        </h1>

        {/* SEARCH */}

        <div className="flex justify-end mb-6">
          <Search
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* ---------------- PENDING RESIDENTS ---------------- */}

        <div className="mb-14">

          <h2 className="text-lg font-semibold text-gray-700">
            Residents Pending Verification
          </h2>

          <Table
            columns={columns}
            data={paginate(pendingResidents, pagePending)}
            onView={handleview}
          />

        </div>

        {/* ---------------- VERIFIED RESIDENTS ---------------- */}

        <div className="mb-14">

          <h2 className="text-lg font-semibold text-gray-700">
            Residents
          </h2>

          <Table
            columns={columns}
            data={paginate(allResidents, pageResidents)}
            onView={handleview}
          />

        </div>

        {/* ---------------- STAFFS ---------------- */}

        <div className="mb-14">

          <h2 className="text-lg font-semibold text-gray-700">
            Barangay Staffs
          </h2>

          <Table
            columns={columns}
            data={paginate(staffs, pageStaffs)}
            onView={handleview}
          />

        </div>

      </div>

      {/* ---------------- MODAL ---------------- */}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Resident Verification"
      >

        {selectedReport && (

          <div className="grid grid-cols-2 gap-8">

            <div className="flex items-center justify-center">
              <img
                src={selectedReport[4]}
                alt="Proof"
                className="w-full max-h-[400px] object-contain rounded-lg border"
              />
            </div>

            <div className="space-y-4">

              <div>
                <label className="text-sm font-medium">Full Name</label>
                <input
                  value={selectedReport[0]}
                  readOnly
                  className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Contact</label>
                <input
                  value={selectedReport[1]}
                  readOnly
                  className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  value={selectedReport[2]}
                  readOnly
                  className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Address</label>
                <input
                  value={selectedReport[3]}
                  readOnly
                  className="w-full border rounded-lg px-3 py-2 bg-gray-100"
                />
              </div>

              <div className="flex gap-4 pt-4">

                <button
                  className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700"
                  onClick={() => approveResident(selectedReport[6])}
                >
                  Approve
                </button>

                <button className="bg-red-500 text-white px-5 py-2 rounded-lg hover:bg-red-600">
                  Reject
                </button>

              </div>

            </div>

          </div>

        )}

      </Modal>
    </>
  );
}

export default User;