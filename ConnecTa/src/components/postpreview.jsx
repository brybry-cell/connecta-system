import "./postpreview.css";

function PostPreview({ name, position, time, title, content, clickable }) {
  return (
    <div
      className={`
        w-full 
        mt-3
        border border-[#007CCF]
        rounded-xl 
        p-4 sm:p-5
        bg-[#F5F5F5] 
        shadow-md
        ${clickable ? "cursor-pointer hover:shadow-lg transition" : ""}
      `}
    >

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">

        <div className="flex items-center gap-3">

          <img
            src="https://i.pravatar.cc/40"
            alt="Profile"
            className="w-10 h-10 rounded-full object-cover"
          />

          <div>
            <h2 className="text-sm sm:text-base font-semibold text-gray-800 leading-tight">
              {name}
            </h2>

            <p className="text-xs text-[#1976d2]">
              {position}
            </p>
          </div>

        </div>

        {/* Time */}
        <p className="text-xs text-gray-400 sm:text-right">
          {time}
        </p>

      </div>

      {/* Title */}
      <h3 className="text-base sm:text-lg font-bold mb-1">
        {title}
      </h3>

      {/* Content */}
      <p className="text-sm text-gray-700 leading-relaxed">
        {content}
      </p>

      {/* Click Hint */}
      {clickable && (
        <p className="text-blue-500 text-xs mt-3">
          Click to see the full news
        </p>
      )}

    </div>
  );
}

export default PostPreview;