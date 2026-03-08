function Table({ columns, data, onView, onDelete}) {
  return (
    <div className="flex justify-center mt-6">
      <div className="w-full max-w-6xl bg-white shadow-md rounded-xl overflow-hidden">
        
        <table className="w-full text-sm text-left border-collapse">
          
          {/* TABLE HEADER */}
          <thead className="bg-[#007CCF] text-white">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className="px-6 py-3 font-semibold">
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          {/* TABLE BODY */}
          <tbody className="divide-y divide-gray-200">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition">
                
{row.slice(0, columns.length).map((cell, cellIndex) => {
  // ACTION COLUMN
  if (columns[cellIndex] === "Action") {
    return (
      <td key={cellIndex} className="px-6 py-4 flex gap-2">
        <button
          onClick={() => onView(row)}
          className="px-3 py-1 text-xs bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
        >
          View
        </button>

        <button
          onClick={() => onDelete(row)}
          className="px-3 py-1 text-xs bg-red-100 text-red-600 rounded-md hover:bg-red-200"
        >
          Delete
        </button>
      </td>
    );
  }

  // PROOF COLUMN
  if (columns[cellIndex] === "Proof of Residency") {
    return (
      <td
        key={cellIndex}
        onClick={() => onView(row)}
        className="px-6 py-4 text-blue-600 font-medium cursor-pointer hover:underline"
      >
        Proof
      </td>
    );
  }

  // NORMAL CELL
  return (
    <td key={cellIndex} className="px-6 py-4 text-gray-700">
      {cell}
    </td>
  );

})}

              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}

export default Table;