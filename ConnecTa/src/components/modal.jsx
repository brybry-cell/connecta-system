function Modal({ isOpen = true, title, children, onClose, size = "md" }) {

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-3xl",
    xl: "max-w-5xl"
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-3 sm:p-4">

      <div
        className={`
          relative bg-white w-full
          ${sizeClasses[size] || sizeClasses.md}
          max-h-[90vh]
          overflow-hidden
          rounded-xl shadow-lg
          animate-fadeIn
        `}
      >

        {/* Header */}
<div className="flex items-center justify-between px-4 sm:px-6 py-4">
  <h2 className="text-base sm:text-lg font-semibold text-[#007CCF]">
    {title}
  </h2>

  <button
    onClick={onClose}
    className="text-gray-500 hover:text-red-500 text-xl shrink-0"
  >
    ✕
  </button>

</div>

        {/* Body */}
        <div className="overflow-y-auto px-4 sm:px-6 py-3 sm:py-4 max-h-[75vh]">
          {children}
        </div>

      </div>

    </div>
  );
}

export default Modal;