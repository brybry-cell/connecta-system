import Header from "../components/Header";
import SideNav from "../components/navi";
import ReportCard from "../components/ReportCard";
import ReportModal from "../components/ReportModal";
import Table from "../components/table";
import { useState, useEffect } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "../firebase";

function History() {

  const [open, setOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 10;

  
const [selectedDate, setSelectedDate] = useState("");
const [loading, setLoading] = useState(true);
useEffect(() => {
  const uid = localStorage.getItem("uid");
  if (!uid) return;

  const q = query(
    collection(db, "reports"),
    where("reportedBy", "==", uid),
    orderBy("createdAt", "desc")
  );

const unsubscribe = onSnapshot(q, async (snapshot) => {

  const data = await Promise.all(
    snapshot.docs.map(async (doc) => {

      const report = doc.data();

      // 🔥 fetch resident info
      const res = await fetch(`https://connecta-backend-u4tw.onrender.com/resident/${report.reportedBy}`);
      const user = await res.json();

      return {
        id: doc.id,
        ...report,
        residentName: `${user.firstname} ${user.lastname}`, // ensure correct
        email: user.email,
        contact: user.contact
      };

    })
  );


  setReports(data);
  setLoading(false);
});

  return () => unsubscribe();
}, []);




  /* -------------------------------- */
  /* Recent Reports (Cards) */
  /* -------------------------------- */

  const recentReports = reports.slice(0, 10);



  /* -------------------------------- */
  /* Filtering */
  /* -------------------------------- */

const filteredReports = reports.filter((report) => {

  const matchSearch =
    report.category.toLowerCase().includes(search.toLowerCase()) ||
    report.location.toLowerCase().includes(search.toLowerCase());

  const matchStatus =
    statusFilter === "all" ||
    report.status?.toLowerCase() === statusFilter;

const matchDate = (() => {
  if (!selectedDate) return true;

  const reportDate = new Date(report.createdAt);
  const selected = new Date(selectedDate);

  return reportDate.toDateString() === selected.toDateString();
})();

  return matchSearch && matchStatus && matchDate;

});



  /* -------------------------------- */
  /* Pagination */
  /* -------------------------------- */

  const indexOfLast = currentPage * reportsPerPage;
  const indexOfFirst = indexOfLast - reportsPerPage;

  const currentReports = filteredReports.slice(indexOfFirst, indexOfLast);

  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);



  /* -------------------------------- */
  /* Convert Reports -> Table Rows */
  /* -------------------------------- */

const tableColumns = [
  "Resident Name",
  "Issue",
  "Location",
  "Status",
  "Date",
  "Action"

];

const tableData = currentReports.map((report) => ([
report.residentName?.replace(/\b\w/g, c => c.toUpperCase()),  report.category,
  report.location,
  report.status.charAt(0).toUpperCase() + report.status.slice(1),
  new Date(report.createdAt).toLocaleString(),
  "Action",
  report
]));


  /* -------------------------------- */
  /* Table Handlers */
  /* -------------------------------- */

  const handleView = (row) => {

    const reportObject = row[row.length - 1];
    setSelectedReport(reportObject);

  };

  const handleDelete = (row) => {

    const reportObject = row[row.length - 1];
    console.log("Delete report:", reportObject.id);

  };




if (loading) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-14 h-14 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white text-sm tracking-wide">Loading...</p>
      </div>
    </div>
  );
}
  return (
    <>
      <Header />
      <SideNav open={open} setOpen={setOpen} />

      <div className="md:ml-[260px] px-6 py-6 bg-gray-50 min-h-screen">


        {/* Mobile Menu */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setOpen(true)}
            className="text-2xl text-[#007CCF]"
          >
            ☰
          </button>
        </div>


        {/* Title */}
        <div className="mb-8">

<h1 className="text-3xl font-bold text-gray-800">
  History
</h1>

<p className="text-gray-500 mt-1">
  View all your submitted reports.
</p>

        </div>



        {/* ================================= */}
        {/* RECENT REPORTS (CARDS) */}
        {/* ================================= */}

        <div className="mb-10">

          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Recent Reports
          </h2>

          {recentReports.length === 0 ? (

            <div className="bg-white rounded-xl p-6 shadow">
              No reports found.
            </div>

          ) : (

            <div className="grid md:grid-cols-3 gap-6">

              {recentReports.map((report) => (

                <ReportCard
                  key={report.id}
                  report={report}
                  onView={() => setSelectedReport(report)}
                />

              ))}

            </div>

          )}

        </div>



        {/* ================================= */}
        {/* ALL REPORTS TABLE */}
        {/* ================================= */}

        <div className="bg-white rounded-xl shadow p-6">

          <h2 className="text-xl font-semibold text-gray-700 mb-6">
            All Reports
          </h2>


          {/* Search + Filter */}
{/* Search */}
<div className="mb-4">
  <input
    type="text"
    placeholder="Search by issue or location..."
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    className="border rounded-xl px-4 py-3 w-full text-sm"
  />
</div>

{/* Status + Date */}
<div className="flex gap-3 mb-6">

  <select
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
    className="border rounded-xl px-4 py-3 w-1/2 text-sm"
  >
    <option value="all">All Status</option>
    <option value="pending">Pending</option>
    <option value="reviewing">Reviewing</option>
    <option value="ongoing">On-going</option>
    <option value="resolved">Resolved</option>
  </select>

  <input
    type="date"
    value={selectedDate}
    onChange={(e) => setSelectedDate(e.target.value)}
    className="border rounded-xl px-4 py-3 w-1/2 text-sm"
  />

</div>

          {/* Table Component */}

          <Table
            columns={tableColumns}
            data={tableData}
            onView={handleView}
            onDelete={handleDelete}
          />


          {/* Pagination */}

          <div className="flex justify-center mt-6 gap-2">

            {[...Array(totalPages)].map((_, index) => (

              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === index + 1
                    ? "bg-[#007CCF] text-white"
                    : "bg-gray-100"
                }`}
              >
                {index + 1}
              </button>

            ))}

          </div>

        </div>



        {/* Modal */}

        {selectedReport && (
          <ReportModal
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
          />
        )}

      </div>
    </>
  );
}

export default History;