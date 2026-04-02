function Table({ columns, data, onView, onDelete }) {

  const statusColor = {
    pending: "bg-yellow-100 text-yellow-700",
    reviewing: "bg-blue-100 text-blue-700",
    ongoing: "bg-orange-100 text-orange-700",
    resolved: "bg-green-100 text-green-700"
  };

  // View Icon SVG
  const ViewIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  // Delete Icon SVG
  const DeleteIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );

  return (
    <div className="flex justify-center mt-6 px-2">
      <div className="w-full max-w-6xl bg-white shadow-md rounded-xl overflow-hidden">

        {/* Scroll container */}
        <div className="overflow-x-auto">

          <table className="min-w-[700px] w-full text-sm text-left border-collapse">

            {/* HEADER */}
            <thead className="bg-[#007CCF] text-white">
              <tr>
                {columns.map((col, index) => (
                  <th
                    key={index}
                    className="px-4 md:px-6 py-3 font-semibold whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>

            {/* BODY */}
            <tbody className="divide-y divide-gray-200">

              {data.map((row, rowIndex) => (

                <tr
                  key={rowIndex}
                  className="hover:bg-gray-50 transition"
                >

                  {row.slice(0, columns.length).map((cell, cellIndex) => {

                    const colName = columns[cellIndex];

                    /* ACTION COLUMN */
                    if (colName === "Action") {
                      return (
                        <td
                          key={cellIndex}
                          className="px-4 md:px-6 py-4"
                        >
                          <div className="flex gap-3">
                            <button
                              onClick={() => onView(row)}
                              className="p-2 rounded-lg hover:bg-blue-50 transition text-blue-600"
                              title="View"
                            >
                              <ViewIcon />
                            </button>

                            <button
                              onClick={() => onDelete(row)}
                              className="p-2 rounded-lg hover:bg-red-50 transition text-red-600"
                              title="Delete"
                            >
                              <DeleteIcon />
                            </button>
                          </div>
                          </td>
                      );
                    }

                    /* PROOF COLUMN */
                    if (colName === "Proof of Residency") {
                      return (
                        <td
                          key={cellIndex}
                          onClick={() => onView(row)}
                          className="px-4 md:px-6 py-4"
                        >
                          <button
                            className="p-2 rounded-lg hover:bg-blue-50 transition text-blue-600"
                            title="View Proof"
                          >
                            <ViewIcon />
                          </button>
                          </td>
                      );
                    }

                    /* STATUS COLUMN */
                    if (colName.toLowerCase().includes("status")) {
                      return (
                        <td key={cellIndex} className="px-4 md:px-6 py-4">
                          <span
                            className={`text-xs px-3 py-1 rounded-full font-medium ${
                              statusColor[cell?.toLowerCase()] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {cell}
                          </span>
                          </td>
                      );
                    }

                    /* NAME COLUMN (make bold) */
                    if (colName.toLowerCase().includes("name")) {
                      return (
                        <td
                          key={cellIndex}
                          className="px-4 md:px-6 py-4 font-semibold text-gray-900 truncate max-w-[180px]"
                        >
                          {cell}
                          </td>
                      );
                    }

                    /* NORMAL CELL (TRUNCATED) */
                    return (
                      <td
                        key={cellIndex}
                        className="px-4 md:px-6 py-4 text-gray-700 truncate max-w-[180px]"
                        title={cell}
                      >
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
    </div>
  );
}

export default Table;