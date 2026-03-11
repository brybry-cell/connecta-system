function Table({ columns, data, onView, onDelete }) {
  return (
    <div className="flex justify-center mt-6 px-2">
      <div className="w-full max-w-6xl bg-white shadow-md rounded-xl overflow-hidden">

        {/* Scroll container for mobile */}
        <div className="overflow-x-auto">

          <table className="min-w-[700px] w-full text-sm text-left border-collapse">

            {/* TABLE HEADER */}
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

            {/* TABLE BODY */}
            <tbody className="divide-y divide-gray-200">

              {data.map((row, rowIndex) => (

                <tr
                  key={rowIndex}
                  className="hover:bg-gray-50 transition"
                >

                  {row.slice(0, columns.length).map((cell, cellIndex) => {

                    /* ACTION COLUMN */
                    if (columns[cellIndex] === "Action") {
                      return (
                        <td
                          key={cellIndex}
                          className="px-4 md:px-6 py-4 flex flex-col sm:flex-row gap-2"
                        >
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

                    /* PROOF COLUMN */
                    if (columns[cellIndex] === "Proof of Residency") {
                      return (
                        <td
                          key={cellIndex}
                          onClick={() => onView(row)}
                          className="px-4 md:px-6 py-4 text-blue-600 font-medium cursor-pointer hover:underline whitespace-nowrap"
                        >
                          Proof
                        </td>
                      );
                    }

                    /* NORMAL CELL */
                    return (
                      <td
                        key={cellIndex}
                        className="px-4 md:px-6 py-4 text-gray-700 whitespace-nowrap"
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