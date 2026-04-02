import { useState, useEffect } from "react";
import Header from "../components/header";
import SideNav from "../components/navi";
import Table from "../components/table";
import Modal from "../components/modal";
import Search from "../components/search";
import arrowleft from "../assets/arrowleft.png";
import arrowright from "../assets/arrowright.png";

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
  const [activeTab, setActiveTab] = useState("overall");

  const [reports, setReports] = useState([]);
  const [myCases, setMyCases] = useState([]);

  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [reviewMessage, setReviewMessage] = useState("");
  const [resolveMessage, setResolveMessage] = useState("");
  const [ongoingMessage, setOngoingMessage] = useState("");
  const [files, setFiles] = useState([]);

  const adminId = localStorage.getItem("uid");

  // Loading States
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingMyCases, setLoadingMyCases] = useState(true);
  const [assigningReport, setAssigningReport] = useState(false);
  const [sendingReview, setSendingReview] = useState(false);
  const [sendingOngoing, setSendingOngoing] = useState(false);
  const [resolvingReport, setResolvingReport] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Error States
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const API_URL = "https://connecta-backend-u4tw.onrender.com";

  /* FETCH ALL REPORTS */
  const fetchReports = async () => {
    setLoadingReports(true);
    setError("");
    
    try {
      const res = await fetch(`${API_URL}/admin/reports?search=${search}&adminId=${adminId}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch reports: ${res.status}`);
      }
      
      const data = await res.json();
      
      const sorted = data.sort((a, b) => {
        return new Date(b.reportedAt) - new Date(a.reportedAt);
      });
      
      setReports(sorted);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load reports. Please refresh the page.");
    } finally {
      setLoadingReports(false);
    }
  };

  /* FETCH MY CASES */
  const fetchMyCases = async () => {
    if (!adminId) {
      setLoadingMyCases(false);
      return;
    }
    
    setLoadingMyCases(true);
    setError("");
    
    try {
      const res = await fetch(`${API_URL}/admin/my-cases/${adminId}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch cases: ${res.status}`);
      }
      
      const data = await res.json();
      
      const statusPriority = {
        reviewing: 1,
        ongoing: 2,
        resolved: 3
      };
      
      const sorted = data.sort((a, b) => {
        const priorityA = statusPriority[a.status] || 99;
        const priorityB = statusPriority[b.status] || 99;
        
        if (priorityA !== priorityB) {
          return priorityA - priorityB;
        }
        
        return b.createdAt - a.createdAt;
      });
      
      setMyCases(sorted);
    } catch (err) {
      console.error("Error fetching my cases:", err);
      setError("Failed to load your cases.");
    } finally {
      setLoadingMyCases(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [search]);

  useEffect(() => {
    fetchMyCases();
  }, []);

  const handleview = async (report) => {
    if (assigningReport) return;
    
    setAssigningReport(true);
    setError("");
    
    try {
      const resAssign = await fetch(
        `${API_URL}/admin/assign-report/${report.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ adminId }),
        }
      );
      
      if (!resAssign.ok) {
        throw new Error("Failed to assign report");
      }
      
      const assignData = await resAssign.json();
      console.log("ASSIGN RESPONSE:", assignData);
      
      const check = await fetch(
        `${API_URL}/admin/my-cases/${adminId}`
      );
      
      if (!check.ok) {
        throw new Error("Failed to fetch updated cases");
      }
      
      const checkData = await check.json();
      const latest = checkData.find(r => r.id === report.id);
      
      setSelectedReport(latest);
      setIsModalOpen(true);
      
      await fetchReports();
      await fetchMyCases();
      
      setSuccessMessage("Report assigned successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      console.error("Error assigning report:", err);
      setError("Failed to assign report. Please try again.");
    } finally {
      setAssigningReport(false);
    }
  };

  /* SEND REVIEW MESSAGE - NO EMAIL */
  const sendReview = async () => {
    if (!reviewMessage.trim()) {
      setError("Please enter a message before sending.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    setSendingReview(true);
    setError("");
    
    try {
      const res = await fetch(`${API_URL}/admin/review-report/${selectedReport.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: reviewMessage,
        }),
      });
      
      const responseData = await res.json();
      console.log("Review response:", responseData);
      
      if (!res.ok) {
        throw new Error(responseData.error || "Failed to send review");
      }
      
      setReviewMessage("");
      await fetchReports();
      await fetchMyCases();
      
      const updatedRes = await fetch(
        `${API_URL}/admin/my-cases/${adminId}`
      );
      const updatedData = await updatedRes.json();
      const latest = updatedData.find(r => r.id === selectedReport.id);
      setSelectedReport(latest);
      
      setSuccessMessage("Review sent successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      console.error("Error sending review:", err);
      setError("Failed to send review. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSendingReview(false);
    }
  };

  /* SEND ONGOING UPDATE - NO EMAIL */
  const sendOngoingUpdate = async () => {
    if (!ongoingMessage.trim()) {
      setError("Please enter a message before sending.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    if (files.length > 0) {
      setError("Media is only allowed for resolved reports. Please remove media to send ongoing update.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    setSendingOngoing(true);
    setError("");
    
    try {
      const res = await fetch(`${API_URL}/admin/update-ongoing/${selectedReport.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: ongoingMessage,
        }),
      });
      
      const responseData = await res.json();
      console.log("Ongoing update response:", responseData);
      
      if (!res.ok) {
        throw new Error(responseData.error || "Failed to send update");
      }
      
      const updatedRes = await fetch(
        `${API_URL}/admin/my-cases/${adminId}`
      );
      
      const updatedData = await updatedRes.json();
      const latest = updatedData.find(r => r.id === selectedReport.id);
      setSelectedReport(latest);
      
      setOngoingMessage("");
      await fetchReports();
      await fetchMyCases();
      
      setSuccessMessage("Update sent successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      console.error("Error sending ongoing update:", err);
      setError("Failed to send update. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSendingOngoing(false);
    }
  };

  /* RESOLVE REPORT - NO EMAIL */
  const resolveReport = async () => {
    if (!resolveMessage.trim()) {
      setError("Please enter a resolution message before resolving.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    setResolvingReport(true);
    setError("");
    
    try {
      const media = [];
      
      if (files.length > 0) {
        setUploadingFiles(true);
        
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
          
          if (!res.ok) {
            throw new Error("Failed to upload file to Cloudinary");
          }
          
          const data = await res.json();
          media.push(data.secure_url);
        }
        
        setUploadingFiles(false);
      }
      
      const res = await fetch(`${API_URL}/admin/resolve-report/${selectedReport.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: resolveMessage,
          media,
        }),
      });
      
      const responseData = await res.json();
      console.log("Resolve response:", responseData);
      
      if (!res.ok) {
        throw new Error(responseData.error || "Failed to resolve report");
      }
      
      setResolveMessage("");
      setFiles([]);
      await fetchReports();
      await fetchMyCases();
      setIsModalOpen(false);
      
      setSuccessMessage("Report resolved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      console.error("Error resolving report:", err);
      setError(err.message || "Failed to resolve report. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setResolvingReport(false);
      setUploadingFiles(false);
    }
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

  const filteredOverallReports = reports.filter((r) => r.status === "pending" && !r.assignedTo);
  const filteredMyCases = myCases.filter((r) => statusFilter === "all" || r.status === statusFilter);

  const myCaseTable = paginate(
    filteredMyCases.map((r) => ([
      <span className="font-bold" key={`name-${r.id}`}>
        {r.residentName
          .split(" ")
          .map(name => name.charAt(0).toUpperCase() + name.slice(1))
          .join(" ")
        }
      </span>,
      r.category,
      <span key={`status-${r.id}`} className={`px-2 py-1 rounded text-xs font-semibold
        ${r.status === "pending" && "bg-yellow-100 text-yellow-700"}
        ${r.status === "reviewing" && "bg-blue-100 text-blue-700"}
        ${r.status === "ongoing" && "bg-orange-100 text-orange-700"}
        ${r.status === "resolved" && "bg-green-100 text-green-700"}
      `}>
        {r.status.charAt(0).toUpperCase() + r.status.slice(1)}
      </span>,
      <span key={`desc-${r.id}`} className="max-w-[200px] truncate block">
        {r.description}
      </span>,
      r
    ])),
    pageMyCase
  );

  const overallTable = paginate(
    filteredOverallReports.map((r) => ([
      <span key={`name-${r.id}`} className="font-bold">
        {r.residentName
          .split(" ")
          .map(name => name.charAt(0).toUpperCase() + name.slice(1))
          .join(" ")
        }
      </span>,
      r.category,
      <span key={`status-${r.id}`} className={`px-2 py-1 rounded text-xs font-semibold
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

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => 
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );
    
    if (validFiles.length !== selectedFiles.length) {
      setError("Only image and video files are allowed");
      setTimeout(() => setError(""), 3000);
    }
    
    if (files.length + validFiles.length > 5) {
      setError("Maximum 5 files allowed");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    setFiles([...files, ...validFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  return (
    <>
      <Header />
      <SideNav open={open} setOpen={setOpen} />

      <div className="md:ml-[260px] bg-gray-50 min-h-screen px-6 py-8">

        <div className="md:hidden mb-4">
          <button
            onClick={() => setOpen(true)}
            className="text-2xl text-[#007CCF]"
          >
            ☰
          </button>
        </div>

        <h1 className="text-3xl font-bold text-[#007CCF] mb-6">
          Reports Management
        </h1>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-700 text-sm text-center animate-fadeIn">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-700 text-sm text-center animate-shake">
            {error}
          </div>
        )}

        <div className="border-b border-gray-200 mb-6">
          <div className="flex gap-6">
            <button
              onClick={() => {
                setActiveTab("overall");
                setPageOverall(1);
              }}
              className={`pb-3 px-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === "overall"
                  ? "text-[#007CCF] border-b-2 border-[#007CCF]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Overall Reports
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                activeTab === "overall"
                  ? "bg-[#007CCF]/10 text-[#007CCF]"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {filteredOverallReports.length}
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab("mycase");
                setPageMyCase(1);
              }}
              className={`pb-3 px-2 text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                activeTab === "mycase"
                  ? "text-[#007CCF] border-b-2 border-[#007CCF]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              My Cases
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                activeTab === "mycase"
                  ? "bg-[#007CCF]/10 text-[#007CCF]"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {filteredMyCases.length}
              </span>
            </button>
          </div>
        </div>

        <div className="flex justify-end mb-6">
          <Search
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onFilter={(status) => setStatusFilter(status)}
            filterOptions={["all", "pending", "reviewing", "ongoing", "resolved"]}
          />
        </div>

        {activeTab === "overall" && (
          <div>
            {loadingReports ? (
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#007CCF]"></div>
                <p className="text-gray-500 mt-2">Loading reports...</p>
              </div>
            ) : (
              <>
                {filteredOverallReports.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 text-center">
                    <p className="text-gray-500">No pending reports available</p>
                  </div>
                ) : (
                  <>
                    <Table
                      columns={columns}
                      data={overallTable}
                      onView={(row) => handleview(row[4])}
                      viewLoading={assigningReport}
                    />

                    <div className="flex justify-center items-center gap-4 mt-4">
                      <button
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        onClick={() => setPageOverall(p => p - 1)}
                        disabled={pageOverall === 1 || loadingReports}
                      >
                        <img src={arrowleft} alt="Previous" className="w-6 h-6" />
                      </button>

                      <span className="text-sm font-medium text-gray-600">
                        Page {pageOverall} of {totalPages(filteredOverallReports)}
                      </span>

                      <button
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        onClick={() => setPageOverall(p => p + 1)}
                        disabled={pageOverall === totalPages(filteredOverallReports) || loadingReports}
                      >
                        <img src={arrowright} alt="Next" className="w-6 h-6" />
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

        {activeTab === "mycase" && (
          <div>
            {loadingMyCases ? (
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#007CCF]"></div>
                <p className="text-gray-500 mt-2">Loading your cases...</p>
              </div>
            ) : (
              <>
                {filteredMyCases.length === 0 ? (
                  <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 text-center">
                    <p className="text-gray-500">No cases assigned to you</p>
                  </div>
                ) : (
                  <>
                    <Table
                      columns={columns}
                      data={myCaseTable}
                      onView={async (row) => {
                        const report = row[4];
                        const res = await fetch(`${API_URL}/admin/my-cases/${adminId}`);
                        const updated = await res.json();
                        const latest = updated.find(r => r.id === report.id);
                        setSelectedReport(latest);
                        setIsModalOpen(true);
                      }}
                    />

                    <div className="flex justify-center items-center gap-4 mt-4">
                      <button
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        onClick={() => setPageMyCase(p => p - 1)}
                        disabled={pageMyCase === 1 || loadingMyCases}
                      >
                        <img src={arrowleft} alt="Previous" className="w-6 h-6" />
                      </button>

                      <span className="text-sm font-medium text-gray-600">
                        Page {pageMyCase} of {totalPages(filteredMyCases)}
                      </span>

                      <button
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        onClick={() => setPageMyCase(p => p + 1)}
                        disabled={pageMyCase === totalPages(filteredMyCases) || loadingMyCases}
                      >
                        <img src={arrowright} alt="Next" className="w-6 h-6" />
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        )}

      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Report Details"
      >
        {selectedReport && (
          <div className="space-y-6">
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
                        className="w-full max-h-[250px] object-contain bg-black rounded-lg"
                      />
                      :
                      <img
                        key={i}
                        src={url}
                        alt={`Evidence ${i + 1}`}
                        className="w-full max-h-[250px] object-contain bg-black rounded-lg"
                      />
                  ));
                })()}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500">Issue Type</p>
                  <p className="font-semibold text-gray-800">
                    {selectedReport.category}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold
                  ${selectedReport.status === "pending" && "bg-yellow-100 text-yellow-700"}
                  ${selectedReport.status === "reviewing" && "bg-blue-100 text-blue-700"}
                  ${selectedReport.status === "ongoing" && "bg-orange-100 text-orange-700"}
                  ${selectedReport.status === "resolved" && "bg-green-100 text-green-700"}
                `}>
                  {selectedReport.status.charAt(0).toUpperCase() + selectedReport.status.slice(1)}
                </span>
              </div>

              <div>
                <p className="text-xs text-gray-500 mb-1">Description</p>
                <p className="bg-gray-50 p-3 rounded-lg text-sm leading-relaxed">
                  {selectedReport.description}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-5">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-700">
                    Report Information
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Date</p>
                  <p className="font-semibold text-gray-800">
                    {selectedReport?.createdAt
                      ? new Date(selectedReport.createdAt).toLocaleString()
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-xs">Email</p>
                  <p className="font-semibold">{selectedReport.email}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-xs">Resident</p>
                  <p className="font-semibold">
                    {selectedReport.residentName?.replace(/\b\w/g, c => c.toUpperCase())}
                  </p>
                </div>

                <div>
                  <p className="text-gray-500 text-xs">Contact</p>
                  <p className="font-semibold">{selectedReport.contact}</p>
                </div>

                <div>
                  <p className="text-gray-500 text-xs">Assigned To</p>
                  <p className="font-semibold">
                    {selectedReport.assignedName || "Not assigned"}
                  </p>
                </div>
              </div>
            </div>

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
                  disabled={sendingReview}
                />
                <div className="flex justify-end">
                  <button
                    onClick={sendReview}
                    disabled={!reviewMessage.trim() || sendingReview}
                    className={`px-5 py-2 rounded-lg text-sm shadow flex items-center gap-2
                      ${!reviewMessage.trim() || sendingReview
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"}
                    `}
                  >
                    {sendingReview && (
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {sendingReview ? "Sending..." : "Send Update"}
                  </button>
                </div>
              </div>
            )}

            {selectedReport.status === "ongoing" && (
              <div className="space-y-6">
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
                    disabled={sendingOngoing}
                  />
                  <p className="text-xs text-gray-500">
                    Note: Media upload is only allowed when resolving the report.
                  </p>
                  <div className="flex justify-end">
                    <button
                      onClick={sendOngoingUpdate}
                      disabled={!ongoingMessage.trim() || sendingOngoing}
                      className={`px-5 py-2 rounded-lg text-sm shadow flex items-center gap-2
                        ${!ongoingMessage.trim() || sendingOngoing
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-orange-600 hover:bg-orange-700 text-white"}
                      `}
                    >
                      {sendingOngoing && (
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                      {sendingOngoing ? "Sending..." : "Send Update"}
                    </button>
                  </div>
                </div>

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
                    disabled={resolvingReport}
                  />


                  <div className="flex justify-end">
                    <button
                      onClick={resolveReport}
                      disabled={!resolveMessage.trim() || resolvingReport || uploadingFiles}
                      className={`px-5 py-2 rounded-lg text-sm shadow flex items-center gap-2
                        ${!resolveMessage.trim() || resolvingReport || uploadingFiles
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-green-600 hover:bg-green-700 text-white"}
                      `}
                    >
                      {(resolvingReport || uploadingFiles) && (
                        <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      )}
                      {uploadingFiles ? "Uploading Files..." : resolvingReport ? "Resolving..." : "Mark as Resolved"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
}

export default Reports;