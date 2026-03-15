import "./postpreview.css";
import profile from "../assets/profile.png";

function PostPreview({ name, position, time, title, content, clickable }) {

  return (

    <div
      className={`max-w-[1075px] w-[90%] mx-auto mt-[20px] 
      border border-[#007CCF] 
      rounded-xl p-6
      bg-[#F5F5F5] gap-[4px] shadow-md
      ${clickable ? "cursor-pointer hover:shadow-lg transition" : ""}`}
    >

      {/* Header */}
      <div className="flex items-center justify-between mb-5">

        <div className="flex items-center gap-[10px]">

          <img
            src={profile}
            alt="Profile"
            className="w-13 h-13 rounded-full object-cover shrink-0"
          />

          <div className="flex flex-col">

            <h2 className="m-0 text-[16px] font-semibold text-gray-800">
              {name}
            </h2>

            <p className="m-0 mt-[2px] text-[12px] text-[#1976d2]">
              {position}
            </p>

          </div>

        </div>

        {/* Time posted */}
        <p className="text-[12px] text-gray-400">
          {time}
        </p>

      </div>

      {/* Title */}
      <h3 className="text-[18px] font-bold mt-[10px] mb-[10px]">
        {title}
      </h3>

      {/* Content */}
      <p className="text-[15px] leading-relaxed m-0 max-w-[1000px] text-left">
        {content}
      </p>

      {/* Click Hint */}
      {clickable && (

        <p className="text-blue-500 text-[13px] mt-3">
          Click to see the full news
        </p>

      )}

    </div>

  );

}

export default PostPreview;