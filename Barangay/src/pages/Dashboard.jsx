import Header from "../components/header";
import SideNav from "../components/navi";
import { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Modal from "../components/modal";
import PDFExportModal from "../components/PDFExportModal";
import { generatePDF } from "../utils/pdfGenerator";

import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line
} from "recharts";

function Dashboard() {

  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const dashboardRef = useRef(null);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  
  // Error states
  const [error, setError] = useState("");

  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);

  const [filter, setFilter] = useState("weekly");

  const [stats, setStats] = useState({});
  const [categoryData, setCategoryData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [comments, setComments] = useState([]);
  const [topStaff, setTopStaff] = useState([]);
  const [topCategory, setTopCategory] = useState([]);
  const [questionsList, setQuestionsList] = useState([]);

  const [openModal, setOpenModal] = useState(null);
  const [modalData, setModalData] = useState(null);
  const [showPDFModal, setShowPDFModal] = useState(false);

  useEffect(() => {

    const fetchData = async () => {
      setIsLoading(true);
      setError("");
      
      try {
        const reportsSnap = await getDocs(collection(db, "reports"));
        const reportsDocs = reportsSnap.docs;

        const usersSnap = await getDocs(collection(db, "residents"));
        const users = usersSnap.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        }));

        const feedbackSnap = await getDocs(collection(db, "feedbacks"));
        const feedbacks = feedbackSnap.docs.map(doc => doc.data());

        // ✅ UID → FULL NAME
        const userMap = {};
        users.forEach(u => {
          userMap[u.uid] = `${u.firstname} ${u.lastname}`;
        });

        const reports = reportsDocs.map(doc => doc.data());

        const now = new Date();

        const filteredReports = reports.filter(r => {
          const diff = (now - new Date(r.createdAt)) / (1000 * 60 * 60 * 24);

          if (filter === "weekly") return diff <= 7;
          if (filter === "monthly") return diff <= 30;
          if (filter === "quarterly") return diff <= 90;
          if (filter === "yearly") return diff <= 365;

          return true;
        });

        // ================= STATS =================
        const total = filteredReports.length;
        const pending = filteredReports.filter(r => r.status === "pending").length;
        const ongoing = filteredReports.filter(r => r.status === "ongoing").length;
        const resolved = filteredReports.filter(r => r.status === "resolved").length;
        const residents = users.filter(u => u.role === "resident").length;

        const resolutionRate =
          total > 0 ? ((resolved / total) * 100).toFixed(1) : 0;

        setStats({ total, pending, ongoing, resolved, residents, resolutionRate });

        // ================= CATEGORY =================
        const categoryMap = {};
        filteredReports.forEach(r => {
          categoryMap[r.category] = (categoryMap[r.category] || 0) + 1;
        });

        const sortedCategories = Object.entries(categoryMap)
          .sort((a, b) => b[1] - a[1]);

        setTopCategory(sortedCategories);

        setCategoryData(
          sortedCategories.map(([name, value]) => ({ name, value }))
        );

        // ================= TREND =================
        const trendMap = {};
        filteredReports.forEach(r => {
          const d = new Date(r.createdAt).toLocaleDateString();
          trendMap[d] = (trendMap[d] || 0) + 1;
        });

        setTrendData(
          Object.entries(trendMap).map(([date, count]) => ({ date, count }))
        );

        // ================= GET QUESTIONS =================
        const settingsSnap = await getDocs(collection(db, "system_settings"));
        let questionsListTemp = [];

        settingsSnap.forEach(doc => {
          if (doc.id === "feedback") {
            questionsListTemp = doc.data().questions || [];
          }
        });
        setQuestionsList(questionsListTemp);

        // ================= COMMENTS =================
        const commentsList = feedbacks.map(f => f.responses?.comment).filter(Boolean);
        setComments(commentsList);

        // ================= RATINGS =================
        const questionMap = {};
        let totalRating = 0;
        let totalCount = 0;

        feedbacks.forEach(f => {
          const responses = f.responses || {};

          Object.keys(responses).forEach(key => {
            if (key !== "comment") {
              const val = Number(responses[key]);

              if (!isNaN(val)) {
                questionMap[key] = questionMap[key] || { total: 0, count: 0 };
                questionMap[key].total += val;
                questionMap[key].count += 1;

                totalRating += val;
                totalCount++;
              }
            }
          });
        });

        const questionRatings = Object.entries(questionMap).map(([q, data]) => {
          const index = parseInt(q.replace("q", "")) - 1;

          return {
            question: questionsListTemp[index] || q,
            avg: (data.total / data.count).toFixed(2)
          };
        });

        const overallAverage =
          totalCount > 0 ? (totalRating / totalCount).toFixed(2) : 0;

        setRatings(questionRatings);
        setAverageRating(overallAverage);

        // ================= TOP STAFF =================
        const staffMap = {};

        filteredReports.forEach(r => {
          if (r.assignedTo && r.status === "resolved") {
            staffMap[r.assignedTo] = (staffMap[r.assignedTo] || 0) + 1;
          }
        });

        const sortedStaff = Object.entries(staffMap)
          .map(([uid, count]) => ({
            name: userMap[uid] || uid,
            count
          }))
          .sort((a, b) => b.count - a.count);

        setTopStaff(sortedStaff);
        
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setError("Failed to load dashboard data. Please refresh the page.");
        setTimeout(() => setError(""), 3000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

  }, [filter]);

  const handleExportPDF = async (selectedSections) => {
    setIsExporting(true);
    setExportProgress(0);
    setError("");
    
    try {
      // Prepare data for PDF
      const exportData = {
        ...selectedSections,
        filter: filter.charAt(0).toUpperCase() + filter.slice(1),
        topStaffData: topStaff,
        topCategoryData: topCategory,
        commentsData: comments,
        ratingsData: {
          questionRatings: ratings,
          overallRating: averageRating
        }
      };
      
      // Simulate progress updates (optional)
      const progressInterval = setInterval(() => {
        setExportProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);
      
      await generatePDF(exportData, dashboardRef);
      
      clearInterval(progressInterval);
      setExportProgress(100);
      
      // Reset after a short delay
      setTimeout(() => {
        setIsExporting(false);
        setExportProgress(0);
      }, 1000);
      
    } catch (error) {
      console.error("Error generating PDF:", error);
      setIsExporting(false);
      setExportProgress(0);
      setError("Failed to generate PDF. Please try again.");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleOpenModal = (type, data) => {
    // Ensure data is an array before setting
    if (data && Array.isArray(data)) {
      setModalData(data);
    } else {
      setModalData([]);
    }
    setOpenModal(type);
  };

  const handleCloseModal = () => {
    setOpenModal(null);
    setModalData(null);
  };

  // Truncate text function
  const truncateText = (text, limit = 100) => {
    if (!text) return '';
    if (text.length <= limit) return text;
    return text.substring(0, limit) + '...';
  };

  // Loading spinner overlay (like the resident dashboard)
  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-sm tracking-wide">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <SideNav open={open} setOpen={setOpen} />

      <div ref={dashboardRef} className="md:ml-[260px] bg-gray-50 min-h-screen px-6 py-7">

        {/* MOBILE */}
        <div className="md:hidden mb-4">
          <button onClick={() => setOpen(true)} className="text-2xl text-[#007CCF]">☰</button>
        </div>

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-[#007CCF]">Dashboard</h1>

          <div className="flex gap-2">
            {["weekly","monthly","quarterly","yearly"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                disabled={isLoading}
                className={`px-4 py-1 rounded-full text-sm transition ${
                  filter === f
                    ? "bg-[#007CCF] text-white"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {f}
              </button>
            ))}

            <button
              onClick={() => setShowPDFModal(true)}
              disabled={isLoading || isExporting}
              className="bg-green-600 text-white px-4 py-1 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Export PDF
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-700 text-sm text-center animate-shake">
            {error}
          </div>
        )}

        {/* Dashboard Content */}
        <>
          {/* KPI Section with ID for PDF */}
          <div id="kpi-section" className="grid md:grid-cols-3 gap-5 mb-6">
            <Card title="Total Reports" value={stats.total}/>
            <Card title="Pending" value={stats.pending}/>
            <Card title="Ongoing" value={stats.ongoing}/>
            <Card title="Resolved" value={stats.resolved}/>
            <Card title="Residents" value={stats.residents}/>
            <Card title="Resolution Rate" value={`${stats.resolutionRate}%`}/>
          </div>

          {/* CHARTS with IDs for PDF - UPDATED COLORS */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">

            <div id="categories-chart" className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-600 mb-4">Categories</h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={categoryData}>
                  <XAxis dataKey="name"/>
                  <YAxis/>
                  <Tooltip/>
                  <Bar dataKey="value" fill="#007CCF" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div id="trend-chart" className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-600 mb-4">Trend</h2>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={trendData}>
                  <XAxis dataKey="date"/>
                  <YAxis/>
                  <Tooltip/>
                  <Line dataKey="count" stroke="#007CCF" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

          </div>

          {/* TOP STAFF + TOP CATEGORY */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">

            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-600 mb-4">Top Staff</h2>
              <div className="space-y-2">
                {topStaff.slice(0, 3).map((s, i) => (
                  <div key={i} className="flex justify-between text-sm mb-2">
                    <span>{s.name}</span>
                    <span className="font-semibold">{s.count}</span>
                  </div>
                ))}
                {topStaff.length > 3 && (
                  <button
                    onClick={() => handleOpenModal('staff', topStaff)}
                    className="text-[#007CCF] text-sm hover:underline mt-2"
                  >
                    Click to see more ({topStaff.length - 3} more)
                  </button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-600 mb-4">Top Category</h2>
              <div className="space-y-2">
                {topCategory.slice(0, 3).map((item, i) => {
                  // Handle both array and object formats
                  const name = Array.isArray(item) ? item[0] : item.name;
                  const count = Array.isArray(item) ? item[1] : item.value;
                  return (
                    <div key={i} className="flex justify-between text-sm mb-2">
                      <span>{name}</span>
                      <span className="font-semibold">{count}</span>
                    </div>
                  );
                })}
                {topCategory.length > 3 && (
                  <button
                    onClick={() => handleOpenModal('category', topCategory)}
                    className="text-[#007CCF] text-sm hover:underline mt-2"
                  >
                    Click to see more ({topCategory.length - 3} more)
                  </button>
                )}
              </div>
            </div>

          </div>

          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-600 mb-4">Feedback & Ratings</h2>

            {/* COMMENTS */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-3">
                User Comments
              </h3>

              <div className="space-y-3">
                {comments.slice(0, 3).map((c, i) => (
                  <div
                    key={i}
                    className="bg-gray-50 rounded-xl p-3 shadow-sm border border-gray-100"
                  >
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {truncateText(c, 100)}
                    </p>
                  </div>
                ))}
                {comments.length > 3 && (
                  <button
                    onClick={() => handleOpenModal('comments', comments)}
                    className="text-[#007CCF] text-sm hover:underline mt-2"
                  >
                    Click to see more ({comments.length - 3} more)
                  </button>
                )}
              </div>
            </div>

            {/* RATINGS */}
            <div className="grid md:grid-cols-2 gap-6">

              {/* QUESTION RATINGS */}
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-500 mb-4">
                  Question Ratings
                </h3>

                <div className="space-y-3">
                  {ratings.slice(0, 3).map((r, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-600">{r.question}</span>
                        <span className="font-semibold text-[#007CCF]">
                          {r.avg}
                        </span>
                      </div>

                      {/* progress bar */}
                      <div className="w-full bg-gray-200 h-2 rounded-full">
                        <div
                          className="h-2 rounded-full bg-[#007CCF]"
                          style={{ width: `${(r.avg / 5) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                  {ratings.length > 3 && (
                    <button
                      onClick={() => handleOpenModal('ratings', ratings)}
                      className="text-[#007CCF] text-sm hover:underline mt-2"
                    >
                      Click to see more ({ratings.length - 3} more)
                    </button>
                  )}
                </div>
              </div>

              {/* OVERALL RATING */}
              <div className="bg-gradient-to-br from-[#007CCF] to-blue-500 text-white rounded-2xl p-5 flex flex-col justify-center items-center shadow-md">
                
                <p className="text-sm opacity-80 mb-1">
                  Overall Rating
                </p>

                <h2 className="text-4xl font-bold">
                  {averageRating}
                </h2>

                <p className="text-xs opacity-80 mt-2 text-center">
                  Based on all feedback responses
                </p>

                {/* stars */}
                <div className="flex mt-3">
                  {[1,2,3,4,5].map((star) => (
                    <span key={star} className="text-lg">
                      {averageRating >= star ? "★" : "☆"}
                    </span>
                  ))}
                </div>

              </div>

            </div>

          </div>
        </>

      </div>

      {/* PDF Export Modal */}
      <PDFExportModal
        isOpen={showPDFModal}
        onClose={() => setShowPDFModal(false)}
        onExport={handleExportPDF}
      />

      {/* PDF Export Loading Overlay */}
      {isExporting && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-4">
            <div className="w-14 h-14 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white text-sm tracking-wide">Generating PDF...</p>
            {exportProgress > 0 && exportProgress < 100 && (
              <div className="w-48 mt-2">
                <div className="w-full bg-white/30 rounded-full h-2">
                  <div
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${exportProgress}%` }}
                  ></div>
                </div>
                <p className="text-white text-xs text-center mt-2">{exportProgress}% complete</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Other Modals */}
      <Modal
        isOpen={openModal === 'staff'}
        onClose={handleCloseModal}
        title="Top Staff"
      >
        <div className="space-y-3">
          {modalData && Array.isArray(modalData) && modalData.map((s, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="text-gray-700">{s.name}</span>
              <span className="font-semibold text-[#007CCF]">{s.count} resolved</span>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        isOpen={openModal === 'category'}
        onClose={handleCloseModal}
        title="Top Categories"
      >
        <div className="space-y-3">
          {modalData && Array.isArray(modalData) && modalData.map((item, i) => {
            // Handle both array and object formats
            const name = Array.isArray(item) ? item[0] : item.name;
            const count = Array.isArray(item) ? item[1] : item.value;
            return (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-200">
                <span className="text-gray-700">{name}</span>
                <span className="font-semibold text-[#007CCF]">{count} reports</span>
              </div>
            );
          })}
        </div>
      </Modal>

      <Modal
        isOpen={openModal === 'comments'}
        onClose={handleCloseModal}
        title="All User Comments"
      >
        <div className="space-y-4">
          {modalData && Array.isArray(modalData) && modalData.map((c, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-gray-700 leading-relaxed">{c}</p>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        isOpen={openModal === 'ratings'}
        onClose={handleCloseModal}
        title="All Question Ratings"
      >
        <div className="space-y-4">
          {modalData && Array.isArray(modalData) && modalData.map((r, i) => (
            <div key={i} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <div className="flex justify-between mb-2">
                <span className="font-medium text-gray-700">{r.question}</span>
                <span className="font-bold text-[#007CCF]">{r.avg} / 5</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full">
                <div
                  className="h-2 rounded-full bg-[#007CCF]"
                  style={{ width: `${(r.avg / 5) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
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
      `}</style>
    </>
  );
}

// Card Component
function Card({ title, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
      <p className="text-xs text-gray-500">{title}</p>
      <h2 className="text-2xl font-bold text-[#007CCF]">{value || 0}</h2>
    </div>
  );
}

export default Dashboard;