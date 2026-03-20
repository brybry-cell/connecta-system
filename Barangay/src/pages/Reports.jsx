import { useState, useEffect } from "react";
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

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [reports, setReports] = useState([]);
  const [myCases, setMyCases] = useState([]);

  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [reviewMessage, setReviewMessage] = useState("");
  const [resolveMessage, setResolveMessage] = useState("");
  const [files, setFiles] = useState([]);

  const adminId = localStorage.getItem("adminUID");

  /* FETCH ALL REPORTS */
  const fetchReports = async () => {

const res = await fetch(`https://connecta-backend-u4tw.onrender.com/admin/reports?search=${search}&adminId=${adminId}`);
    const data = await res.json();

    const sorted = data.sort((a, b) => {
  return new Date(b.reportedAt) - new Date(a.reportedAt);
});

setReports(sorted);

  };

  /* FETCH MY CASES */
  const fetchMyCases = async () => {

    if (!adminId) return;

    const res = await fetch(`https://connecta-backend-u4tw.onrender.com/admin/my-cases/${adminId}`);
    const data = await res.json();

const statusPriority = {
  reviewing: 1,
  ongoing: 2,
  resolved: 3
};

const sorted = data.sort((a, b) => {

  // 🔥 PRIORITY SORT FIRST
  const priorityA = statusPriority[a.status] || 99;
  const priorityB = statusPriority[b.status] || 99;

  if (priorityA !== priorityB) {
    return priorityA - priorityB;
  }

  // 🔥 THEN SORT BY NEWEST
  return b.createdAt - a.createdAt;

});

setMyCases(sorted);
  };

  useEffect(() => {
    fetchReports();
  }, [search]);

  useEffect(() => {
    fetchMyCases();
  }, []);



const handleview = async (report) => {

  // ✅ assign first
  await fetch(`https://connecta-backend-u4tw.onrender.com/admin/assign-report/${report.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ adminId }),
  });

  // ✅ then GET updated my-cases (with assignedName)
  const res = await fetch(
    `https://connecta-backend-u4tw.onrender.com/admin/my-cases/${adminId}`
  );

  const updated = await res.json();

  const latest = updated.find(r => r.id === report.id);

  // ✅ THIS IS THE KEY
  setSelectedReport(latest);

  setIsModalOpen(true);

  fetchReports();   // refresh overall (it will disappear)
  fetchMyCases();   // refresh my cases
};

  /* SEND REVIEW MESSAGE */
  const sendReview = async () => {

    await fetch(`https://connecta-backend-u4tw.onrender.com/admin/review-report/${selectedReport.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: reviewMessage,
      }),
    });

    setReviewMessage("");

    fetchReports();
    fetchMyCases();

    setIsModalOpen(false);
  };

  /* RESOLVE REPORT */
  const resolveReport = async () => {

    const media = [];

    for (let file of files) {

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "connecta_upload");

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/djh0ademo/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      media.push(data.secure_url);
    }

    await fetch(`https://connecta-backend-u4tw.onrender.com/admin/resolve-report/${selectedReport.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: resolveMessage,
        media,
      }),
    });

    setResolveMessage("");
    setFiles([]);

    fetchReports();
    fetchMyCases();

    setIsModalOpen(false);
  };

  /* FORMAT TABLE DATA */
const [statusFilter, setStatusFilter] = useState("all");


  const [pageOverall, setPageOverall] = useState(1);
const [pageMyCase, setPageMyCase] = useState(1);

const perPage = 10;

const paginate = (data, page) => {
  const start = (page - 1) * perPage;
  return data.slice(start, start + perPage);
};

const totalPages = (data) => Math.max(1, Math.ceil(data.length / perPage));

const myCaseTable = paginate(
  myCases
  .filter((r) => statusFilter === "all" || r.status === statusFilter)
  .map((r) => ([
<span className="font-bold">
  {r.residentName
    .split(" ")
    .map(name => name.charAt(0).toUpperCase() + name.slice(1))
    .join(" ")
  }
</span>,
    r.category,
<span className={`px-2 py-1 rounded text-xs font-semibold
${r.status === "pending" && "bg-yellow-100 text-yellow-700"}
${r.status === "reviewing" && "bg-blue-100 text-blue-700"}
${r.status === "ongoing" && "bg-orange-100 text-orange-700"}
${r.status === "resolved" && "bg-green-100 text-green-700"}
`}>
  {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
</span>,
    r.description,
    r
  ])),
  pageMyCase
);

const overallTable = paginate(
  reports
    .filter((r) => r.status === "pending") // 🔥 ONLY PENDING
    .filter((r) => !r.assignedTo) // 🔥 NOT ASSIGNED
    .map((r) => ([
<span className="font-bold">
  {r.residentName
    .split(" ")
    .map(name => name.charAt(0).toUpperCase() + name.slice(1))
    .join(" ")
  }
</span>,
      r.category,
<span className={`px-2 py-1 rounded text-xs font-semibold
${r.status === "pending" && "bg-yellow-100 text-yellow-700"}
${r.status === "reviewing" && "bg-blue-100 text-blue-700"}
${r.status === "ongoing" && "bg-orange-100 text-orange-700"}
${r.status === "resolved" && "bg-green-100 text-green-700"}
`}>
  {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
</span>,      
r.description,
      r
    ])),
  pageOverall
);

const [ongoingMessage, setOngoingMessage] = useState("");
const sendOngoingUpdate = async () => {

  if (!ongoingMessage.trim()) {
    alert("Message cannot be empty");
    return;
  }

  if (files.length > 0) {
    alert("Please remove media. Media is only allowed for resolved reports.");
    return;
  }

  console.log("Sending message:", ongoingMessage);
  console.log("Report ID:", selectedReport.id);

  const res = await fetch(`https://connecta-backend-u4tw.onrender.com/admin/update-ongoing/${selectedReport.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: ongoingMessage,
    }),
  });

  const data = await res.json();

  console.log("Server response:", data);

  if (!res.ok) {
    alert("Update failed");
    return;
  }

  // 🔥 REFETCH UPDATED REPORT (IMPORTANT)
  const updatedRes = await fetch(
    `https://connecta-backend-u4tw.onrender.com/admin/my-cases/${adminId}`
  );

  const updatedData = await updatedRes.json();

  const latest = updatedData.find(r => r.id === selectedReport.id);

  setSelectedReport(latest); // ✅ update modal data

  setOngoingMessage("");

  fetchReports();
  fetchMyCases();

  // OPTIONAL: keep modal open to see live change
  // setIsModalOpen(false);
};
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

        {/* TITLE */}
        <h1 className="text-3xl font-bold text-[#007CCF] mb-6">
          Reports Management
        </h1>

        {/* SEARCH */}
        <div className="flex justify-end mb-6">
<Search
  value={search}
  onChange={(e) => setSearch(e.target.value)}
  onFilter={(status) => setStatusFilter(status)}
  filterOptions={["all", "pending", "reviewing", "ongoing", "resolved"]}

/>
        </div>

        {/* OVERALL REPORTS */}
        <div className="mb-12">

          <h2 className="text-lg font-semibold mb-2 text-gray-700">
            Overall Reports
          </h2>

          <Table
            columns={columns}
            data={overallTable}
            onView={(row) => handleview(row[4])}
          />

<div className="flex justify-center items-center gap-3 mt-4">
  <button
    className="bg-blue-600 text-white px-4 py-1 rounded-lg disabled:opacity-50"
    onClick={() => setPageOverall(p => p - 1)}
    disabled={pageOverall === 1}
  >
    Prev
  </button>

  <span className="text-sm font-medium">
    Page {pageOverall} of {totalPages(
  reports.filter(r => r.status === "pending" && !r.assignedTo)
)}
  </span>

  <button
    className="bg-blue-600 text-white px-4 py-1 rounded-lg disabled:opacity-50"
    onClick={() => setPageOverall(p => p + 1)}
    disabled={pageOverall === totalPages(reports.filter(r => !r.assignedTo))}
  >
    Next
  </button>
</div>
        </div>

        {/* MY CASE */}
        <div>

          <h2 className="text-lg font-semibold mb-2 text-gray-700">
            My Case
          </h2>

          <Table
            columns={columns}
            data={myCaseTable}
onView={async (row) => {
  const report = row[4];

  const res = await fetch(`https://connecta-backend-u4tw.onrender.com/admin/my-cases/${adminId}`);
  const updated = await res.json();

  const latest = updated.find(r => r.id === report.id);

  setSelectedReport(latest); // ✅ HAS assignedName
  setIsModalOpen(true);
}}
          />

          <div className="flex justify-center items-center gap-3 mt-4">
  <button
    className="bg-blue-600 text-white px-4 py-1 rounded-lg disabled:opacity-50"
    onClick={() => setPageMyCase(p => p - 1)}
    disabled={pageMyCase === 1}
  >
    Prev
  </button>

  <span className="text-sm font-medium">
    Page {pageMyCase} of {totalPages(myCases)}
  </span>

  <button
    className="bg-blue-600 text-white px-4 py-1 rounded-lg disabled:opacity-50"
    onClick={() => setPageMyCase(p => p + 1)}
    disabled={pageMyCase === totalPages(myCases)}
  >
    Next
  </button>
</div>

        </div>

      </div>

      {/* MODAL */}
{/* MODAL */}
<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title="Report Details"
>

{selectedReport && (

<div className="space-y-6">

{/* MEDIA SECTION */}
<div>

<h3 className="text-sm font-semibold text-gray-600 mb-2">
Evidence Media
</h3>

<div className="grid grid-cols-2 md:grid-cols-3 gap-3">

{(() => {

const media = selectedReport.proofofReport;
if (!media) return null;

const mediaList = Array.isArray(media) ? media : [media];

return mediaList.map((url, i) => (

url?.includes(".mp4") ?

<video
key={i}
src={url}
controls
className="w-full max-h-[250px] object-contain bg-black rounded-lg"/>

:

<img
key={i}
src={url}
className="w-full max-h-[250px] object-contain bg-black rounded-lg"/>

));

})()}

</div>

</div>


{/* REPORT INFORMATION */}
<div className="bg-gray-50 rounded-lg p-4 border">

  <h3 className="text-sm font-semibold text-gray-600 mb-3">
    Report Information
  </h3>

  <div className="space-y-4 text-sm">

    {/* DATE */}
    <p className="font-semibold text-gray-800">
      {new Date(selectedReport.createdAt).toLocaleString()}
    </p>

    {/* ISSUE + STATUS */}
    <div className="grid grid-cols-2 gap-4">
      <p>
        <span className="text-gray-500">Issue Type: </span>
        <span className="font-semibold">{selectedReport.category}</span>
      </p>

      <p>
        <span className="text-gray-500">Status: </span>
        <span className={`px-2 py-1 rounded text-xs font-semibold
          ${selectedReport.status === "pending" && "bg-yellow-100 text-yellow-700"}
          ${selectedReport.status === "reviewing" && "bg-blue-100 text-blue-700"}
          ${selectedReport.status === "ongoing" && "bg-orange-100 text-orange-700"}
          ${selectedReport.status === "resolved" && "bg-green-100 text-green-700"}
        `}>
          {selectedReport.status}
        </span>
      </p>
    </div>

    {/* NAME + EMAIL */}
    <div className="grid grid-cols-2 gap-4">
      <p>
        <span className="text-gray-500">Name: </span>
        <span className="font-semibold">
          {selectedReport.residentName
            ?.replace(/\b\w/g, c => c.toUpperCase())}
        </span>
      </p>

      <p>
        <span className="text-gray-500">Email: </span>
        <span className="font-semibold">{selectedReport.email}</span>
      </p>
    </div>

    {/* CONTACT */}
    <p>
      <span className="text-gray-500">Contact Number: </span>
      <span className="font-semibold">{selectedReport.contact}</span>
    </p>

    {/* ASSIGNED TO */}
    <p>
      <span className="text-gray-500">Assigned To: </span>
     <span className="font-semibold">
  {selectedReport.assignedName
    ? selectedReport.assignedName
        .replace(/\b\w/g, c => c.toUpperCase())
    : "Not assigned"}
</span>
    </p>

    {/* DESCRIPTION */}
    <p>
      <span className="text-gray-500">Description: </span>
      <span>{selectedReport.description}</span>
    </p>

  </div>

</div>

{/* REVIEWING SECTION */}
{selectedReport.status === "reviewing" && (

<div className="space-y-3">

<h3 className="text-sm font-semibold text-gray-600">
Send Update to Resident
</h3>

<textarea
className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
placeholder="Write a message to the resident..."
rows="3"
value={reviewMessage}
onChange={(e) => setReviewMessage(e.target.value)}
/>

<div className="flex justify-end">

<button
onClick={sendReview}
className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm shadow"
>
Send Update
</button>

</div>

</div>

)}


{/* ONGOING SECTION */}
{selectedReport.status === "ongoing" && (

<div className="space-y-6">

  {/* ================= Ongoing Update ================= */}
  <div className="space-y-3">

    <h3 className="text-sm font-semibold text-gray-600">
      Ongoing Update
    </h3>

    <textarea
      className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
      placeholder="Write update for the resident..."
      rows="3"
      value={ongoingMessage}
      onChange={(e) => setOngoingMessage(e.target.value)}
    />

    <p className="text-xs text-gray-500">
      Note: Media upload is only allowed when resolving the report.
    </p>

    <div className="flex justify-end">
      <button
        onClick={sendOngoingUpdate}
        className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2 rounded-lg text-sm shadow"
      >
        Send Update
      </button>
    </div>

  </div>


  {/* ================= RESOLVE REPORT ================= */}
  <div className="space-y-3 border-t pt-4">

    <h3 className="text-sm font-semibold text-gray-600">
      Resolve Report (Final Action)
    </h3>

    <textarea
      className="w-full border rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      placeholder="Write resolution message..."
      rows="3"
      value={resolveMessage}
      onChange={(e) => setResolveMessage(e.target.value)}
    />

    <div>
      <label className="block text-sm font-medium mb-1">
        Upload Proof of Action
      </label>

      <input
        type="file"
        multiple
        accept="image/*,video/*"
        className="text-sm"
        onChange={(e) => setFiles([...e.target.files])}
      />
    </div>

    <div className="flex justify-end">
      <button
        onClick={resolveReport}
        className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg text-sm shadow"
      >
        Mark as Resolved
      </button>
    </div>

  </div>

</div>

)}

</div>

)}

</Modal>
    </>
  );
}

export default Reports;