import "./postpreview.css";
import profile from "../assets/profile.png";

function PostPreview({ name, position, title, content }) {
  return (
    <div className="max-w-[1075px] w-[90%] mx-auto mt-[20px] 
                    border-1 border-[#007CCF] 
                    rounded-xl p-6
                    bg-[#F5F5F5] gap-[4px] shadow-md">


      {/* Header */}
      <div className="flex items-center gap-[10px] mb-5">
        
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

      {/* Title */}
      <h3 className="text-[18px] font-bold mt-[20px] mb-[10px]">
        {title}
      </h3>

      {/* Content */}
      <p className="text-[15px] leading-relaxed m-0 max-w-[1000px] text-left">
        {content}
      </p>

    </div>
  );
}

export default PostPreview;