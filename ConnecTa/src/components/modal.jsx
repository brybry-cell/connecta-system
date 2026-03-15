function Modal({ title, children, onClose }) {

  return (

    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

      <div className="bg-white w-full max-w-lg max-h-[90vh] rounded-2xl shadow-xl flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">

          <h2 className="text-lg font-semibold text-gray-800">
            {title}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-lg"
          >
            ✕
          </button>

        </div>

        {/* Body */}
        <div className="overflow-y-auto px-6 py-4">
          {children}
        </div>

      </div>

    </div>

  );

}

export default Modal;