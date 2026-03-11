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

    const res = await fetch(`http://localhost:5000/admin/reports?search=${search}`);
    const data = await res.json();

    setReports(data);

  };

  /* FETCH MY CASES */
  const fetchMyCases = async () => {

    if (!adminId) return;

    const res = await fetch(`http://localhost:5000/admin/my-cases/${adminId}`);
    const data = await res.json();

    setMyCases(data);

  };

  useEffect(() => {
    fetchReports();
  }, [search]);

  useEffect(() => {
    fetchMyCases();
  }, []);

  /* VIEW REPORT */
  const handleview = async (report) => {

    await fetch(`http://localhost:5000/admin/assign-report/${report.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ adminId }),
    });

    setSelectedReport(report);
    setIsModalOpen(true);

    fetchReports();
    fetchMyCases();
  };

  /* SEND REVIEW MESSAGE */
  const sendReview = async () => {

    await fetch(`http://localhost:5000/admin/review-report/${selectedReport.id}`, {
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

    await fetch(`http://localhost:5000/admin/resolve-report/${selectedReport.id}`, {
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

const overallTable = reports
  .filter((r) => !r.assignedTo)   // show only unassigned reports
  .map((r) => ([
    r.residentName,
    r.category,
    r.status,
    r.description,
    r
  ]));

  const myCaseTable = myCases.map((r) => ([
    r.residentName,
    r.category,
    r.status,
    r.description,
    r
  ]));

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
        <h1 className="text-2xl font-bold text-[#007CCF] mb-6">
          Reports Management
        </h1>

        {/* SEARCH */}
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

          <Table
            columns={columns}
            data={overallTable}
            onView={(row) => handleview(row[4])}
          />

        </div>

        {/* MY CASE */}
        <div>

          <h2 className="text-lg font-semibold mb-2 text-gray-700">
            My Case
          </h2>

          <Table
            columns={columns}
            data={myCaseTable}
            onView={(row) => {
              setSelectedReport(row[4]);
              setIsModalOpen(true);
            }}
          />

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
className="w-full h-32 object-cover rounded-lg shadow"
/>

:

<img
key={i}
src={url}
className="w-full h-32 object-cover rounded-lg shadow"
/>

));

})()}

</div>

</div>


{/* REPORT INFORMATION */}
<div className="bg-gray-50 rounded-lg p-4 border">

<h3 className="text-sm font-semibold text-gray-600 mb-3">
Report Information
</h3>

<div className="grid md:grid-cols-2 gap-3 text-sm">

<p><span className="font-semibold">Report By:</span> {selectedReport.residentName}</p>

<p><span className="font-semibold">Issue Type:</span> {selectedReport.category}</p>

<p><span className="font-semibold">Date & Time:</span> {selectedReport.reportedAt}</p>

<p>
<span className="font-semibold">Status:</span>{" "}
<span className={`px-2 py-1 rounded text-xs font-semibold
${selectedReport.status === "pending" && "bg-yellow-100 text-yellow-700"}
${selectedReport.status === "reviewing" && "bg-blue-100 text-blue-700"}
${selectedReport.status === "ongoing" && "bg-orange-100 text-orange-700"}
${selectedReport.status === "resolved" && "bg-green-100 text-green-700"}
`}>
{selectedReport.status}
</span>
</p>

<p className="md:col-span-2">
<span className="font-semibold">Description:</span> {selectedReport.description}
</p>

<p><span className="font-semibold">Email:</span> {selectedReport.email}</p>

<p><span className="font-semibold">Contact Number:</span> {selectedReport.contact}</p>

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

<div className="space-y-4">

<h3 className="text-sm font-semibold text-gray-600">
Resolve Report
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

)}

</div>

)}

</Modal>
    </>
  );
}

export default Reports;