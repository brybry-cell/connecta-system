import Header from "../components/Header";
import SideNav from "../components/navi";
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import Card from "../components/card";
import Button from "../components/button";
import Preview from "../components/PostPreview";
import Modal from "../components/modal";
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

  const [loading, setLoading] = useState(true);
  const [termsContent, setTermsContent] = useState("");

  /* ------------------------------ */
  /* FORMAT TIME */
  /* ------------------------------ */

  const formatTime = (dateString) => {

    const postDate = new Date(dateString);
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
  try {
    const res = await fetch("https://connecta-backend-u4tw.onrender.com/admin/settings/terms");
    const data = await res.json();

    if (data?.content) {
      setTermsContent(data.content);
    }
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  const init = async () => {
    try {
      const uid = localStorage.getItem("uid");
      if (!uid) return;

      // USER INFO
      const userRef = doc(db, "residents", uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setResidentName(`${data.firstname} ${data.lastname}`);

        if (!data.acceptedTerms) {
          setShowTerms(true);
          setUid(uid);
        }
      }

      // REPORTS
      const reportRes = await fetch(`https://connecta-backend-u4tw.onrender.com/reports/${uid}`);
      const reportData = await reportRes.json();

      setTotalReports(reportData.length);

      const pending = reportData.filter(r =>
        ["pending", "reviewing", "ongoing"].includes(r.status)
      );

      setPendingReports(pending.length);


      await fetchTerms();


    } catch (err) {
      console.error(err);
    }

    setLoading(false); // ✅ always stop loading
  };

  init();
}, []);


useEffect(() => {
  const uid = localStorage.getItem("uid");
  if (!uid) return;

  // REALTIME NEWS
  const q = query(collection(db, "news"), orderBy("createdAt", "desc"));

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setNewsPosts(posts);
  });

  return () => unsubscribe(); // cleanup
}, []);


  const acceptTerms = async () => {

    const userRef = doc(db, "residents", uid);

    await updateDoc(userRef, {
      acceptedTerms: true
    });

    setShowTerms(false);

  };

  useEffect(() => {
  if (termsContent.length < 300) {
    setScrolledToBottom(true);
  }
}, [termsContent]);

const handleScroll = (e) => {
  const bottom =
    e.target.scrollTop + e.target.clientHeight >= e.target.scrollHeight - 5;

  if (bottom) {
    setScrolledToBottom(true);
  }
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
        
        {/* Greeting */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back,
            <span className="text-[#007CCF]"> {residentName}</span>
          </h1>

          <p className="text-gray-500 mt-1">
            Here’s what’s happening in your dashboard today.
          </p>
        </div>

        {/* STATS */}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">

          <div className="rounded-2xl p-6 text-white shadow-lg bg-gradient-to-r from-[#007CCF] to-green-400">
            <p className="text-sm">Total Reports</p>
            <p className="text-5xl font-bold text-center mt-6">
              {totalReports}
            </p>
          </div>

          <div className="rounded-2xl p-6 text-white shadow-lg bg-gradient-to-r from-[#007CCF] to-green-400">
            <p className="text-sm">Pending Reports</p>
            <p className="text-5xl font-bold text-center mt-6">
              {pendingReports}
            </p>
          </div>

        </div>

        {/* BARANGAY NEWS */}

        <div>

          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Barangay News
          </h2>

          <div className="flex flex-col gap-4">

            {newsPosts.slice(0,5).map((post) => (

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

        </div>

      </div>

      {/* NEWS MODAL */}

      {selectedPost && (

        <Modal
          title="Barangay News"
          onClose={() => setSelectedPost(null)}
        >

          <div className="flex justify-between items-center mb-4">

            <div className="flex items-center gap-3">

              <img
                src={selectedPost.profile || "https://i.pravatar.cc/40"}
                className="w-10 h-10 rounded-full"
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

            selectedPost.media[0].includes(".mp4") ?

              <video src={selectedPost.media[0]} controls className="w-full rounded-lg"/>

            :

              <img src={selectedPost.media[0]} className="w-full rounded-lg"/>

          ) : (

            <div className="grid grid-cols-2 gap-3">

              {selectedPost.media?.map((m,i)=>(

                m.includes(".mp4") ?

                  <video key={i} src={m} controls className="rounded-lg"/>

                :

                  <img key={i} src={m} className="rounded-lg"/>

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
      className="w-[700px] max-h-[80vh] overflow-hidden"
    >

      <div
        className="h-[400px] overflow-y-auto text-sm text-gray-700 border p-4 rounded mb-4"
        onScroll={handleScroll}
      >
        {termsContent || "No terms available."}
      </div>

      <div className="flex items-center gap-2 mb-4">

        <input
          type="checkbox"
          disabled={!scrolledToBottom && termsContent.length > 300}
          onChange={(e) => setAgreeChecked(e.target.checked)}
        />

        <span className="text-sm">
          I agree to the Terms and Conditions
        </span>

      </div>

      <Button
        text="Continue"
        onClick={acceptTerms}
        disabled={!agreeChecked}
        className="w-full bg-blue-500 text-white py-2 rounded"
      />

    </Card>

  </div>
)}

    </>
  );
}

export default Dashboard;