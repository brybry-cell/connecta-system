import Header from "../components/Header";
import SideNav from "../components/navi";
import ReportCard from "../components/ReportCard";
import ReportModal from "../components/ReportModal";
import Table from "../components/table";
import { useState, useEffect } from "react";

function History() {

  const [open, setOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [currentPage, setCurrentPage] = useState(1);
  const reportsPerPage = 10;


  useEffect(() => {

    const fetchReports = async () => {

      const uid = localStorage.getItem("uid");

      try {

        const res = await fetch(`http://localhost:5000/reports/${uid}`);
        const data = await res.json();

        const sorted = data.reverse();
        setReports(sorted);

      } catch (error) {
        console.error(error);
      }

    };

    fetchReports();

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
      statusFilter === "all" || report.status === statusFilter;

    return matchSearch && matchStatus;

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
    "Report ID",
    "Issue",
    "Location",
    "Status",
    "Date",
    "Action"
  ];

  const tableData = currentReports.map((report) => ([
    report.id,
    report.category,
    report.location,
    report.status,
    report.reportedAt,
    "Action",
    report // keep original report object
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

          <p className="text-gray-500">
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

          <div className="flex flex-col md:flex-row gap-4 mb-6">

            <input
              type="text"
              placeholder="Search by issue or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border rounded-lg px-4 py-2 w-full md:w-1/2"
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-lg px-4 py-2 w-full md:w-48"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="reviewing">Reviewing</option>
              <option value="ongoing">On-going</option>
              <option value="resolved">Resolved</option>
            </select>

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