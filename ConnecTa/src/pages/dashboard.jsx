import Header from "../components/Header";
import SideNav from "../components/navi";
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import Card from "../components/card";
import Button from "../components/button";
import Preview from "../components/PostPreview";
import Modal from "../components/modal";
import { useNavigate } from "react-router-dom";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";

function Dashboard() {

  const [open, setOpen] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [uid, setUid] = useState(null);
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [residentName, setResidentName] = useState("");

  const [totalReports, setTotalReports] = useState(0);
  const [pendingReports, setPendingReports] = useState(0);

  const [newsPosts, setNewsPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  // Loading states
  const [loading, setLoading] = useState(true);
  const [fetchingReports, setFetchingReports] = useState(true);
  const [fetchingNews, setFetchingNews] = useState(true);
  const [fetchingTerms, setFetchingTerms] = useState(true);
  const [acceptingTerms, setAcceptingTerms] = useState(false);
  
  // Error states
  const [error, setError] = useState("");
  const [termsContent, setTermsContent] = useState("");

  const navigate = useNavigate();

  const capitalize = (str) =>
    str
      ? str
          .split(" ")
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(" ")
      : "";

  /* ------------------------------ */
  /* FORMAT TIME */
  /* ------------------------------ */
  const formatTime = (dateString) => {
    // Handle both timestamp numbers and date strings
    let postDate;
    if (typeof dateString === 'number') {
      postDate = new Date(dateString);
    } else {
      postDate = new Date(dateString);
    }
    
    const now = new Date();
    const diff = Math.floor((now - postDate) / 1000);

    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return postDate.toLocaleString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
  };

  const fetchTerms = async () => {
    setFetchingTerms(true);
    try {
      const res = await fetch("https://connecta-backend-u4tw.onrender.com/admin/settings/terms");
      
      if (!res.ok) {
        throw new Error(`Failed to fetch terms: ${res.status}`);
      }
      
      const data = await res.json();
      if (data?.content) {
        setTermsContent(data.content);
      }
    } catch (err) {
      console.error("Error fetching terms:", err);
      setError("Failed to load terms and conditions. Please try again later.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setFetchingTerms(false);
    }
  };

  const fetchUserReports = async (userId) => {
    setFetchingReports(true);
    try {
      const reportRes = await fetch(`https://connecta-backend-u4tw.onrender.com/reports/${userId}`);
      
      if (!reportRes.ok) {
        throw new Error(`Failed to fetch reports: ${reportRes.status}`);
      }
      
      const reportData = await reportRes.json();
      setTotalReports(reportData.length);
      
      const pending = reportData.filter(r =>
        ["pending", "reviewing", "ongoing"].includes(r.status)
      );
      setPendingReports(pending.length);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load your reports. Please refresh the page.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setFetchingReports(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError("");
      
      try {
        const uid = localStorage.getItem("uid");
        if (!uid) {
          setLoading(false);
          return;
        }

        // USER INFO
        const userRef = doc(db, "residents", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const data = userSnap.data();
          setResidentName(
            `${capitalize(data.firstname)} ${capitalize(data.lastname)}`
          );
          if (!data.acceptedTerms) {
            setShowTerms(true);
            setUid(uid);
          }
        } else {
          setError("User data not found");
          setTimeout(() => setError(""), 3000);
        }

        // Fetch reports
        await fetchUserReports(uid);
        
        // Fetch terms
        await fetchTerms();

      } catch (err) {
        console.error("Initialization error:", err);
        setError("Failed to load dashboard data. Please refresh the page.");
        setTimeout(() => setError(""), 3000);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  // REALTIME NEWS - Ensure proper sorting
  useEffect(() => {
    const uid = localStorage.getItem("uid");
    if (!uid) return;

    setFetchingNews(true);
    
    // Create query with orderBy createdAt in descending order
    const q = query(
      collection(db, "news"), 
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const posts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Additional sort to ensure newest first (in case of any inconsistencies)
        const sortedPosts = posts.sort((a, b) => {
          const dateA = typeof a.createdAt === 'number' ? a.createdAt : new Date(a.createdAt).getTime();
          const dateB = typeof b.createdAt === 'number' ? b.createdAt : new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        
        console.log("Sorted news posts (newest first):", sortedPosts.map(p => ({
          title: p.title,
          createdAt: p.createdAt,
          date: new Date(p.createdAt).toLocaleString()
        })));
        
        setNewsPosts(sortedPosts);
        setFetchingNews(false);
      },
      (error) => {
        console.error("Error fetching news:", error);
        setError("Failed to load news. Please refresh the page.");
        setTimeout(() => setError(""), 3000);
        setFetchingNews(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const acceptTerms = async () => {
    setAcceptingTerms(true);
    setError("");
    
    try {
      const userRef = doc(db, "residents", uid);
      await updateDoc(userRef, {
        acceptedTerms: true
      });
      setShowTerms(false);
    } catch (err) {
      console.error("Error accepting terms:", err);
      setError("Failed to accept terms. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setAcceptingTerms(false);
    }
  };

  useEffect(() => {
    if (termsContent.length < 300) {
      setScrolledToBottom(true);
    }
  }, [termsContent]);

  const handleScroll = (e) => {
    const bottom = e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 5;
    if (bottom) {
      setScrolledToBottom(true);
    }
  };

  // Loading overlay
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-sm tracking-wide">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <SideNav open={open} setOpen={setOpen} />

      <div className="md:ml-[260px] pt-4 px-3 sm:px-4 md:px-6 pb-10 bg-gray-50 min-h-screen">
        
        {/* Mobile Menu */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setOpen(true)}
            className="text-2xl text-[#007CCF]"
          >
            ☰
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-700 text-sm text-center animate-shake">
            {error}
          </div>
        )}
        
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back,
            <span className="text-[#007CCF]"> {residentName}</span>
          </h1>
          <p className="text-gray-500 mt-1">
            Here's what's happening in your dashboard today.
          </p>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          {/* TOTAL REPORTS */}
          <div
            onClick={() => navigate("/history", { state: { filter: "total" } })}
            className="rounded-2xl p-6 text-white shadow-lg bg-gradient-to-r from-[#007CCF] to-green-400 cursor-pointer transform transition duration-300 hover:scale-105"
          >
            <p className="text-sm">Total Reports</p>
            {fetchingReports ? (
              <div className="flex justify-center items-center mt-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : (
              <p className="text-5xl font-bold text-center mt-6">
                {totalReports}
              </p>
            )}
          </div>

          {/* PENDING REPORTS */}
          <div
            onClick={() => navigate("/history", { state: { filter: "pending" } })}
            className="rounded-2xl p-6 text-white shadow-lg bg-gradient-to-r from-[#007CCF] to-green-400 cursor-pointer transform transition duration-300 hover:scale-105"
          >
            <p className="text-sm">Pending Reports</p>
            {fetchingReports ? (
              <div className="flex justify-center items-center mt-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              </div>
            ) : (
              <p className="text-5xl font-bold text-center mt-6">
                {pendingReports}
              </p>
            )}
          </div>
        </div>

        {/* BARANGAY NEWS */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Barangay News
          </h2>

          {fetchingNews ? (
            <div className="flex justify-center items-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007CCF]"></div>
                <p className="text-gray-500 text-sm">Loading news...</p>
              </div>
            </div>
          ) : newsPosts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
              <p className="text-gray-500">No news posts available.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {/* Display all news posts - already sorted with newest first */}
              {newsPosts.slice(0, 5).map((post, index) => (
                <div
                  key={post.id}
                  onClick={() => post.media?.length > 0 && setSelectedPost(post)}
                  className={post.media?.length > 0 ? "cursor-pointer" : ""}
                >
                  <Preview
                    name={post.postedBy}
                    position={post.role}
                    time={formatTime(post.createdAt)}
                    title={post.title}
                    content={post.description}
                    clickable={post.media?.length > 0}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* NEWS MODAL */}
      {selectedPost && (
        <Modal title="Barangay News" onClose={() => setSelectedPost(null)}>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <img
                src={selectedPost.profile || "https://i.pravatar.cc/40"}
                className="w-10 h-10 rounded-full"
                alt={selectedPost.postedBy}
              />
              <div>
                <p className="font-semibold text-sm">
                  {selectedPost.postedBy}
                </p>
                <p className="text-xs text-gray-500">
                  {selectedPost.role}
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              {formatTime(selectedPost.createdAt)}
            </p>
          </div>

          <h3 className="font-semibold text-lg mt-4">
            {selectedPost.title}
          </h3>

          <p className="text-gray-600 text-sm mt-2 mb-4">
            {selectedPost.description}
          </p>

          {selectedPost.media?.length === 1 ? (
            selectedPost.media[0].includes(".mp4") ? (
              <video src={selectedPost.media[0]} controls className="w-full rounded-lg" />
            ) : (
              <img src={selectedPost.media[0]} className="w-full rounded-lg" alt={selectedPost.title} />
            )
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {selectedPost.media?.map((m, i) => (
                m.includes(".mp4") ? (
                  <video key={i} src={m} controls className="rounded-lg" />
                ) : (
                  <img key={i} src={m} className="rounded-lg" alt={`Media ${i + 1}`} />
                )
              ))}
            </div>
          )}
        </Modal>
      )}

      {/* TERMS MODAL */}
      {showTerms && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
          <Card
            title="Terms and Conditions"
            description=""
            className="w-full max-w-[700px] max-h-[90vh] overflow-hidden mx-4"
          >
            {fetchingTerms ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex flex-col items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007CCF]"></div>
                  <p className="text-gray-500 text-sm">Loading terms...</p>
                </div>
              </div>
            ) : (
              <>
                <div
                  className="max-h-[50vh] overflow-y-auto text-sm text-gray-700 border border-gray-200 p-4 rounded mb-4"
                  onScroll={handleScroll}
                >
                  {termsContent || "No terms available."}
                </div>

                <div className="flex items-center gap-2 mb-4">
                  <input
                    type="checkbox"
                    id="termsCheckbox"
                    disabled={!scrolledToBottom && termsContent.length > 300}
                    onChange={(e) => setAgreeChecked(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="termsCheckbox" className="text-sm cursor-pointer">
                    I agree to the Terms and Conditions
                  </label>
                </div>

                <Button
                  text={acceptingTerms ? "Processing..." : "Continue"}
                  onClick={acceptTerms}
                  disabled={!agreeChecked || acceptingTerms}
                  className={`w-full text-white py-2 rounded flex items-center justify-center gap-2
                    ${!agreeChecked || acceptingTerms 
                      ? "bg-gray-400 cursor-not-allowed" 
                      : "bg-blue-500 hover:bg-blue-600"
                    }`}
                >
                  {acceptingTerms && (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {acceptingTerms ? "Processing..." : "Continue"}
                </Button>
              </>
            )}
          </Card>
        </div>
      )}

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

export default Dashboard;