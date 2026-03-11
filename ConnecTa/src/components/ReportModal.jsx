import { useState } from "react";

function ReportModal({ report, onClose }) {

  // normalize media
  const mediaList = Array.isArray(report.proofofReport)
    ? report.proofofReport
    : [report.proofofReport];

  const [activeMedia, setActiveMedia] = useState(mediaList[0]);

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
  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="flex justify-between items-start border-b px-6 py-4">

          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Report Details
            </h2>

            <div className="mt-1">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${statusColor[report.status]}`}>
                {report.status}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl"
          >
            ✕
          </button>

        </div>


        {/* Body */}
        <div className="p-6 space-y-6">


          {/* MEDIA VIEWER */}

          <div className="bg-black rounded-xl flex items-center justify-center overflow-hidden">

            {activeMedia.includes(".mp4") || activeMedia.includes(".mov") ? (
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

                  {media.includes(".mp4") || media.includes(".mov") ? (
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

            <div className="bg-gray-50 border rounded-xl p-5">

              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Report ID
              </p>

              <p className="text-gray-900 font-semibold break-all">
                {report.id}
              </p>

            </div>


            <div className="bg-gray-50 border rounded-xl p-5">

              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Issue Type
              </p>

              <p className="text-gray-900 font-semibold">
                {report.category}
              </p>

            </div>


            <div className="bg-gray-50 border rounded-xl p-5">

              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Location
              </p>

              <p className="text-gray-900 leading-relaxed">
                {report.location}
              </p>

            </div>


            <div className="bg-gray-50 border rounded-xl p-5">

              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                Date Reported
              </p>

              <p className="text-gray-900">
                {report.reportedAt}
              </p>

            </div>

          </div>


          {/* Description */}

          <div className="bg-gray-50 border rounded-xl p-5">

            <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
              Description
            </p>

            <p className="text-gray-800 leading-relaxed text-sm">
              {report.description}
            </p>

          </div>


          {/* Barangay Update */}

          {report.status === "ongoing" && (
            <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl">

              <h3 className="font-semibold text-blue-800 mb-1">
                Barangay Update
              </h3>

              <p className="text-blue-700 text-sm">
                {report.barangayUpdate || "Response team has been notified and is currently handling the situation."}
              </p>

            </div>
          )}


          {/* Feedback Form */}

          {report.status === "resolved" && (

            <div className="border rounded-xl p-6">

              <h3 className="font-semibold text-gray-800 mb-4">
                Feedback Form
              </h3>

              {[1,2,3,4,5,6,7].map((q) => (

                <div key={q} className="mb-4">

                  <p className="text-sm mb-1">
                    Question {q}
                  </p>

                  <div className="flex gap-4">

                    {[1,2,3,4,5].map((rate) => (

                      <label key={rate} className="flex items-center gap-1 text-sm">

                        <input
                          type="radio"
                          name={`q${q}`}
                          value={rate}
                          onChange={handleChange}
                        />

                        {rate}

                      </label>

                    ))}

                  </div>

                </div>

              ))}

              <textarea
                name="comment"
                placeholder="Overall comment..."
                onChange={handleChange}
                className="w-full border rounded-lg p-3 mt-3"
              />

              <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Submit Feedback
              </button>

            </div>

          )}

        </div>

      </div>

    </div>

  );
}

export default ReportModal;