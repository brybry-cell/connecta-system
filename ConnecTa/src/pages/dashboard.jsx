import Header from "../components/Header";
import SideNav from "../components/navi";
import { useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useEffect } from "react";
import Card from "../components/card";
import Button from "../components/button";
import Preview from "../components/PostPreview";

function Dashboard() {
  const [open, setOpen] = useState(false);
const [showTerms, setShowTerms] = useState(false);
const [agreeChecked, setAgreeChecked] = useState(false);
const [uid, setUid] = useState(null);
const [scrolledToBottom, setScrolledToBottom] = useState(false);
const [residentName, setResidentName] = useState("");

useEffect(() => {

  const checkTerms = async () => {

    const uid = localStorage.getItem("uid");

    if (!uid) return;

    const userRef = doc(db, "residents", uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {

      const data = userSnap.data();

      // 👇 Set the resident name
      setResidentName(`${data.firstname} ${data.lastname}`);

      if (!data.acceptedTerms) {
        setShowTerms(true);
        setUid(uid);
      }

    }

  };

  checkTerms();

}, []);
const acceptTerms = async () => {

  const userRef = doc(db, "residents", uid);

  await updateDoc(userRef, {
    acceptedTerms: true
  });

  setShowTerms(false);

};

const handleScroll = (e) => {
  const bottom =
    e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;

  if (bottom) {
    setScrolledToBottom(true);
  }
};
  return (
    <>
      <Header />
      <SideNav open={open} setOpen={setOpen} />

      <div className="md:ml-[260px] pt-6 px-6 pb-10 bg-gray-50 min-h-screen">

        {/* Mobile Hamburger */}
        <div className="md:hidden mb-4">
          <button
            onClick={() => setOpen(true)}
            className="text-2xl text-[#007CCF]"
          >
            ☰
          </button>
        </div>

        {/* Greeting Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back,{" "}
<span className="text-[#007CCF]">{residentName}</span>          
</h1>
          <p className="text-gray-500 mt-1">
            Here’s what’s happening in your dashboard today.
          </p>
        </div>

{/* Stats Section */}
<div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">

  {/* Total Reports */}
  <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg 
                  bg-gradient-to-r from-[#007CCF] to-green-400">

    <div className="flex justify-between items-center">
      <p className="text-sm opacity-90">Total Reports</p>
    </div>

    <p className="text-5xl font-bold mt-6 text-center">14</p>
  </div>

  {/* Pending Reports */}
  <div className="relative overflow-hidden rounded-2xl p-6 text-white shadow-lg 
                  bg-gradient-to-r from-[#007CCF] to-green-400">

    <div className="flex justify-between items-center">
      <p className="text-sm opacity-90">Pending Reports</p>
    </div>

    <p className="text-5xl font-bold mt-6 text-center">8</p>
  </div>

</div>

        {/* Posts Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Barangay News
          </h2>

          <div className="flex flex-col gap-4">
            <Preview 
              name="John Doe"
              position="Software Engineer"
              title="Water Disruption in Barangay 123"
              content="This is a preview of the project update post."
            />

            <Preview 
              name="John Doe"
              position="Software Engineer"
              title="Proper Waste Disposal in Barangay 456"
              content="This post is about the importance of proper waste disposal and how it can help keep our community clean and healthy."
            />
          </div>
        </div>

      </div>

      {showTerms && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">

    <Card
      title="Terms and Conditions"
      description=""
      className="w-[400px] max-h-[500px] overflow-hidden"
    >

<div
  className="h-48 overflow-y-auto text-sm text-gray-600 border p-3 rounded mb-4"
  onScroll={handleScroll}
>        Welcome to the system. By using this platform you agree to follow the
        community guidelines, provide truthful information, and use the system
        responsibly. Any misuse of the platform may result in account
        suspension.

              Welcome to the system. By using this platform you agree to follow the
        community guidelines, provide truthful information, and use the system
        responsibly. Any misuse of the platform may result in account
        suspension.

              Welcome to the system. By using this platform you agree to follow the
        community guidelines, provide truthful information, and use the system
        responsibly. Any misuse of the platform may result in account
        suspension.

              Welcome to the system. By using this platform you agree to follow the
        community guidelines, provide truthful information, and use the system
        responsibly. Any misuse of the platform may result in account
        suspension.
      </div>

      <div className="flex items-center gap-2 mb-4">
<input
  type="checkbox"
  disabled={!scrolledToBottom}
  onChange={(e) => setAgreeChecked(e.target.checked)}
/>
        <span className="text-sm">I agree to the Terms and Conditions</span>
      </div>

<Button
  text="Continue"
  onClick={acceptTerms}
  disabled={!agreeChecked || !scrolledToBottom}
  className="w-full bg-blue-500 text-white py-2 rounded"
/>

    </Card>

  </div>
)}
    </>
  );
}

export default Dashboard;