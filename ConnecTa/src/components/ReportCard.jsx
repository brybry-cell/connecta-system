function ReportCard({ report, onView }) {

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-700",
    reviewing: "bg-blue-100 text-blue-700",
    ongoing: "bg-orange-100 text-orange-700",
    resolved: "bg-green-100 text-green-700",
  };

  // normalize media
  const mediaList = Array.isArray(report.proofofReport)
    ? report.proofofReport
    : [report.proofofReport];

  const firstMedia = mediaList[0];

  const isVideo =
    firstMedia?.includes(".mp4") ||
    firstMedia?.includes(".mov") ||
    firstMedia?.includes(".webm");

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">

      {/* Media Preview */}
      <div className="h-40 bg-gray-200">

        {isVideo ? (
          <video
            src={firstMedia}
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={firstMedia}
            alt="report"
            className="h-full w-full object-cover"
          />
        )}

      </div>

      {/* Content */}
      <div className="p-4">

        <h2 className="font-semibold text-lg text-gray-800">
          {report.category}
        </h2>

        <p className="text-sm text-gray-500">
          Report ID: {report.id}
        </p>

        <div className="mt-2">
          <span
            className={`px-2 py-1 text-xs rounded-full ${statusColor[report.status]}`}
          >
            {report.status}
          </span>
        </div>

        <button
          onClick={onView}
          className="mt-4 w-full bg-[#007CCF] text-white py-2 rounded-lg hover:bg-blue-700"
        >
          View Report
        </button>

      </div>
    </div>
  );
}

export default ReportCard;