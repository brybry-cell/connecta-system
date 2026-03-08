import { FiFilter } from "react-icons/fi";

function Search({ value, onChange }) {
  return (
    <div className="relative w-full max-w-md">
      
      <input
        type="text"
        placeholder="Search..."
        value={value}
        onChange={onChange}
        className="
          w-full
          bg-white
          border
          border-gray-300
          rounded-xl
          px-4
          py-2
          pr-10
          text-sm
          shadow-sm
          focus:outline-none
          focus:ring-2
          focus:ring-[#007CCF]
          focus:border-[#007CCF]
          transition
        "
      />

      <FiFilter
        className="
          absolute
          right-3
          top-1/2
          -translate-y-1/2
          text-gray-500
          text-lg
          cursor-pointer
        "
      />

    </div>
  );
}

export default Search;