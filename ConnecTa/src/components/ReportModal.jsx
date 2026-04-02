import { useState } from "react";

function ReportModal({ report, onClose }) {

  // normalize media
  const mediaList = Array.isArray(report.proofofReport)
    ? report.proofofReport
    : [report.proofofReport];

  const [activeMedia, setActiveMedia] = useState(mediaList[0] || null);
  const [feedback, setFeedback] = useState({
    q1:"",q2:"",q3:"",q4:"",q5:"",q6:"",q7:"",comment:""
  });

  const handleChange=(e)=>{
    setFeedback({...feedback,[e.target.name]:e.target.value});
  };

  const statusColor={
    pending:"bg-yellow-100 text-yellow-700",
    reviewing:"bg-blue-100 text-blue-700",
    ongoing:"bg-orange-100 text-orange-700",
    resolved:"bg-green-100 text-green-700"
  };

  // ✅ FIXED: proper helper
const isVideo = (file) => {
  if (!file) return false;

  return (
    file.endsWith(".mp4") ||
    file.endsWith(".mov") ||
    file.endsWith(".webm")
  );
};
  return (

<div className="fixed inset-0 bg-black/40 flex items-start sm:items-center justify-center z-50">
<div className="bg-white w-full max-w-4xl sm:rounded-2xl rounded-t-2xl h-full sm:h-auto max-h-[100vh] sm:max-h-[90vh] overflow-hidden shadow-xl">

        {/* Header */}
<div className="flex items-center justify-between px-4 sm:px-6 py-3">
<div className="flex flex-col gap-1">

  {/* TOP LINE */}
  <div className="flex items-center gap-3">

    <h1 className="text-lg sm:text-xl font-bold text-[#007CCF]">
      Report Details
    </h1>

    <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[report.status] || "bg-gray-100 text-gray-600"}`}>
      {report.status?.charAt(0).toUpperCase() + report.status?.slice(1)}
    </span>

  </div>

  {/* ISSUE TYPE UNDER */}
  <p className="text-sm text-gray-500">
    {report.category || "No category"}
  </p>

</div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>

        </div>


        {/* Body */}
<div className="overflow-y-auto p-4 sm:p-6 space-y-5 max-h-[80vh]">

          {/* MEDIA VIEWER */}

          {activeMedia && (
<div className="bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden">
              {isVideo(activeMedia) ? (
                <video
                  controls
                  src={activeMedia}
                  className="max-h-[420px] w-full object-contain"
                />
              ) : (
                <img
                  src={activeMedia}
                  alt="report media"
                  className="max-h-[420px] w-full object-contain"
                />
              )}

            </div>
          )}


          {/* MEDIA THUMBNAILS */}

          {mediaList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto">

              {mediaList.map((media, index) => (

                <div
                  key={index}
                  onClick={() => setActiveMedia(media)}
                  className={`cursor-pointer border rounded-lg overflow-hidden w-24 h-20 flex-shrink-0
                  ${activeMedia === media ? "border-blue-500" : "border-gray-200"}`}
                >

                  {isVideo(media) ? (
                    <video
                      src={media}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={media}
                      className="w-full h-full object-cover"
                    />
                  )}

                </div>

              ))}

            </div>
          )}


          {/* Info Section */}

          <div className="grid md:grid-cols-2 gap-5 text-sm">

<div className="grid grid-cols-3 sm:grid-cols-1 gap-4">

  {/* Name */}
  <div>
    <p className="text-xs text-gray-500">Resident Name</p>
    <p className="text-gray-900 font-semibold">
      {report.residentName
        ?.replace(/\b\w/g, c => c.toUpperCase()) || "N/A"}
    </p>
  </div>

  {/* Email */}
  <div>
    <p className="text-xs text-gray-500">Email</p>
    <p className="text-gray-900 font-semibold truncate">
      {report.email || "No email"}
    </p>
  </div>

  {/* Contact */}
  <div>
    <p className="text-xs text-gray-500">Contact Number</p>
    <p className="text-gray-900 font-semibold">
      {report.contact || "No contact"}
    </p>
  </div>

</div>



<div className="space-y-2">

              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Location
              </p>

              <p className="text-gray-900 leading-relaxed">
                {report.location || "N/A"}
              </p>

            </div>


<div className="space-y-2">

              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Date Reported
              </p>

              <p className="text-gray-900">
                {report.createdAt?.toDate
  ? report.createdAt.toDate().toLocaleString()
  : new Date(report.createdAt).toLocaleString()}
              </p>

            </div>

          </div>


          {/* Description */}

<div className="space-y-2">

            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Description
            </p>

            <p className="text-gray-800 leading-relaxed text-sm">
              {report.description}
            </p>

          </div>


          {/* Barangay Update */}

{report.status === "ongoing" && (
  <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl mb-5">

    <h3 className="font-semibold text-blue-800 mb-1">
      Barangay Update
    </h3>

    <p className="text-blue-700 text-sm">
      {report.adminMessage
        ? report.adminMessage
        : "Response team has been notified and is currently handling the situation."
      }
    </p>

  </div>
)}


          {/* Feedback Form */}

{report.status === "resolved" && (
  <div className="bg-green-50 border border-green-100 p-5 rounded-xl">

    <h3 className="font-semibold text-green-800 mb-2">
      Resolution Update
    </h3>

    <p className="text-green-700 text-sm mb-3">
      {report.resolutionMessage || "No resolution message provided."}
    </p>

    {report.resolutionMedia && (
      <div className="grid grid-cols-2 gap-2 mt-2">
        {(Array.isArray(report.resolutionMedia)
          ? report.resolutionMedia
          : [report.resolutionMedia]
        ).map((media, index) => (

          media.includes(".mp4") ? (
            <video key={index} src={media} controls className="w-full h-32 object-cover rounded-lg" />
          ) : (
            <img key={index} src={media} className="w-full h-32 object-cover rounded-lg" />
          )

        ))}
      </div>
    )}

  </div>
)}
        </div>

      </div>


    </div>

  );
}

export default ReportModal;