import { useEffect } from "react";

function Modal({ isOpen, onClose, title, children }) {
  // Close when pressing ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

return (
  <div className="fixed inset-0 z-50 flex items-center justify-center">

    {/* BACKDROP */}
    <div
      className="absolute inset-0 bg-black/40"
      onClick={onClose}
    ></div>

    {/* MODAL WRAPPER */}
    <div className="relative z-10 w-full max-w-4xl px-4">

      {/* OUTER (radius + shadow) */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden animate-fadeIn">

        {/* HEADER */}
        <div className="flex justify-between items-center px-6 py-4 ">
          <h2 className="text-lg font-semibold text-[#007CCF]">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-500 hover:text-red-500 text-xl"
          >
            ✕
          </button>
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="max-h-[80vh] overflow-y-auto p-6">
          {children}
        </div>

      </div>

    </div>

  </div>
);
}

export default Modal;