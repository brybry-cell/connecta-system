import Header from "../components/Header";
import SideNav from "../components/navi";
import Card from "../components/card";
import { useState } from "react";
import profile from "../assets/profile.png";
import { uploadToCloudinary } from "../utils/cloudinary";

function Report() {

  const [open, setOpen] = useState(false);

  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");

  const [loadingLocation, setLoadingLocation] = useState(false);
  const [loading, setLoading] = useState(false);

  const [mediaFiles, setMediaFiles] = useState([]);
  const [submitted, setSubmitted] = useState(false);

  /* ---------------- LOCATION ---------------- */

  const handleGetLocation = () => {

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(

      async (position) => {

        const { latitude, longitude } = position.coords;

        try {

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );

          const data = await response.json();

          if (data.display_name) {
            setLocation(data.display_name);
          } else {
            setLocation(`${latitude}, ${longitude}`);
          }

        } catch {
          setLocation(`${latitude}, ${longitude}`);
        }

        setLoadingLocation(false);

      },

      () => {
        alert("Unable to retrieve your location.");
        setLoadingLocation(false);
      }

    );
  };

  /* ---------------- MEDIA CAPTURE ---------------- */

  const handleMediaCapture = (event) => {

    const files = Array.from(event.target.files);

    if (files.length > 0) {
      setMediaFiles((prev) => [...prev, ...files]);
    }

  };

  /* ---------------- SUBMIT REPORT ---------------- */

const handleReport = async () => {

  if (!category || !location || !description || mediaFiles.length === 0) {
    alert("Please fill all fields and attach proof.");
    return;
  }

  try {

    setLoading(true);

    const uid = localStorage.getItem("uid");

    // upload all media
    const uploadedMedia = [];

    for (const file of mediaFiles) {

      const url = await uploadToCloudinary(file);

      if (url) {
        uploadedMedia.push(url);
      }

    }

    const response = await fetch("http://localhost:5000/report", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        category,
        location,
        description,
        proofofReport: uploadedMedia,   // now array
        uid
      })

    });

    const data = await response.json();

    if (response.ok) {

      setCategory("");
      setLocation("");
      setDescription("");
      setMediaFiles([]);

      setSubmitted(true);

    }

  } catch (error) {

    console.error(error);

  }

  setLoading(false);

};

  /* ---------------- CLOSE SUCCESS MODAL ---------------- */

  const closeSuccess = () => {

    setSubmitted(false);

  };

  return (
    <>

      <Header />
      <SideNav open={open} setOpen={setOpen} />

      <div className="md:ml-[260px] bg-gray-50 min-h-screen">

        {/* MOBILE HAMBURGER */}
        <div className="md:hidden px-6 pt-6">
          <button
            onClick={() => setOpen(true)}
            className="text-2xl text-[#007CCF]"
          >
            ☰
          </button>
        </div>

        {/* DESKTOP MESSAGE */}
        <div className="hidden md:flex items-center justify-center min-h-[80vh] px-6">

          <div className="bg-white rounded-2xl border-2 border-[#007CCF] shadow-xl p-10 max-w-lg w-full text-center">

            <img
              src={profile}
              alt="Profile"
              className="w-24 h-24 rounded-full mx-auto mb-6 object-cover border-4 border-gray-200"
            />

            <h2 className="text-xl font-bold text-gray-800 mb-3">
              MOBILE DEVICE REQUIRED
            </h2>

            <p className="text-gray-500 text-sm mb-6">
              Reporting is only available on mobile devices to ensure photos
              and videos are captured in real-time.
            </p>

            <div className="bg-blue-50 border border-[#007CCF] rounded-xl p-4 text-sm text-gray-600">
              Please access this application from your smartphone or tablet
              to submit a report.
            </div>

          </div>

        </div>

        {/* MOBILE REPORT FORM */}

        <div className="md:hidden px-6 py-6">

          <h1 className="text-2xl font-bold text-[#007CCF] mb-2">
            Report
          </h1>

          <p className="text-gray-500 text-sm mb-6">
            Submit an environmental concern
          </p>

          <div className="bg-white rounded-2xl border-2 border-green-400 p-6 shadow-md space-y-5">

            {/* CATEGORY */}

            <div>
              <label className="block text-sm font-medium mb-2">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 rounded-lg border border-gray-300 px-4"
              >

                <option>Select Category</option>
                <option>Garbage Issue</option>
                <option>Flooding</option>
                <option>Illegal Dumping</option>
                <option>Clogged Drainage</option>
                <option>Noise Pollution</option>
                <option>Air Pollution</option>
                <option>Water Contamination</option>

              </select>

            </div>

            {/* LOCATION */}

            <div>

              <label className="block text-sm font-medium mb-2">
                Location
              </label>

              <div className="flex gap-2">

                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Street, City"
                  className="flex-1 h-11 rounded-lg border border-gray-300 px-4"
                />

                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="px-4 h-11 bg-[#007CCF] text-white rounded-lg text-sm"
                >
                  {loadingLocation ? "..." : "GPS"}
                </button>

              </div>

            </div>

            {/* DESCRIPTION */}

            <div>

              <label className="block text-sm font-medium mb-2">
                Description
              </label>

              <textarea
                rows="4"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-4 py-3"
              />

            </div>

            {/* MEDIA CAPTURE */}

            <div className="flex justify-between gap-4">

              <input
                type="file"
                accept="image/*,video/*"
                capture="environment"
                onChange={handleMediaCapture}
                className="hidden"
                id="cameraInput"
              />

              <label
                htmlFor="cameraInput"
                className="flex-1 h-20 bg-gray-200 rounded-xl flex items-center justify-center text-3xl text-[#007CCF] cursor-pointer"
              >
                +
              </label>

              {mediaFiles.length > 0 && (

                <div className="grid grid-cols-3 gap-2 mt-3">

                  {mediaFiles.map((file, index) => (

                    <img
                      key={index}
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="w-full h-20 object-cover rounded-lg"
                    />

                  ))}

                </div>

              )}

            </div>

          </div>

          {/* SUBMIT BUTTON */}

          <button
            onClick={handleReport}
            disabled={loading}
            className="w-full mt-6 h-12 bg-gradient-to-r from-[#007CCF] to-green-400 text-white font-semibold rounded-lg shadow-md"
          >
            {loading ? "Submitting..." : "Submit Report"}
          </button>

        </div>

      </div>

      {/* SUCCESS POPUP */}

      {submitted && (

        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">

          <div className="relative">

            <button
              onClick={closeSuccess}
              className="absolute -top-3 -right-3 bg-white border rounded-full w-8 h-8 flex items-center justify-center shadow"
            >
              ✕
            </button>

            <Card
              title="Report Submitted"
              description="Thank you for submitting your report! Our team will review and take action as soon as possible."
              className="w-[350px] text-center"
            />

          </div>

        </div>

      )}

    </>
  );
}

export default Report;