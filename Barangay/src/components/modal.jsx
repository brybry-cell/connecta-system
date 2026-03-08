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

      {/* MODAL BOX */}
<div className="relative bg-white w-full max-w-4xl rounded-xl shadow-lg p-8 z-10 animate-fadeIn">
          
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
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

        {/* CONTENT */}
        <div>{children}</div>

      </div>
    </div>
  );
}

export default Modal;