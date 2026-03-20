import { FiFilter } from "react-icons/fi";
import { useState } from "react";

function Search({ value, onChange, onFilter, filterOptions = [] }) {

  const [openFilter, setOpenFilter] = useState(false);

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

      {/* FILTER ICON (always visible) */}
      <FiFilter
        onClick={() => setOpenFilter(!openFilter)}
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

      {/* DROPDOWN (only if options exist) */}
      {openFilter && filterOptions.length > 0 && (
        <div className="absolute right-0 mt-2 w-40 bg-white border rounded-lg shadow z-10">

          {filterOptions.map((option) => (
            <div
              key={option}
              onClick={() => {
                onFilter && onFilter(option); // ✅ SAFE
                setOpenFilter(false);
              }}
              className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer capitalize"
            >
              {option}
            </div>
          ))}

        </div>
      )}

    </div>
  );
}

export default Search;