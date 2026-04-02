import { useState } from "react";
import Modal from "./modal";

function PDFExportModal({ isOpen, onClose, onExport }) {
  const [selectedSections, setSelectedSections] = useState({
    kpi: true,
    categories: true,
    trend: true,
    topStaff: true,
    topCategory: true,
    comments: true,
    ratings: true,
  });

  const sections = [
    { id: "kpi", label: "KPI Statistics", description: "Total Reports, Pending, Ongoing, Resolved, Residents, Resolution Rate" },
    { id: "categories", label: "Categories Chart", description: "Bar chart showing report categories distribution" },
    { id: "trend", label: "Trend Chart", description: "Line chart showing report trends over time" },
    { id: "topStaff", label: "Top Staff", description: "Top performing staff members" },
    { id: "topCategory", label: "Top Category", description: "Most reported categories" },
    { id: "comments", label: "User Comments", description: "Recent user feedback comments" },
    { id: "ratings", label: "Ratings", description: "Question ratings and overall rating" },
  ];

  const handleToggle = (sectionId) => {
    setSelectedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const handleSelectAll = () => {
    const allSelected = {};
    sections.forEach(section => {
      allSelected[section.id] = true;
    });
    setSelectedSections(allSelected);
  };

  const handleDeselectAll = () => {
    const allDeselected = {};
    sections.forEach(section => {
      allDeselected[section.id] = false;
    });
    setSelectedSections(allDeselected);
  };

  const handleExport = () => {
    onExport(selectedSections);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Export PDF - Select Sections">
      <div className="space-y-4">
        <div className="flex gap-2 mb-4">
          <button
            onClick={handleSelectAll}
            className="px-3 py-1 text-sm bg-[#007CCF] text-white rounded-lg hover:bg-blue-700"
          >
            Select All
          </button>
          <button
            onClick={handleDeselectAll}
            className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
          >
            Deselect All
          </button>
        </div>

        <div className="space-y-3">
          {sections.map(section => (
            <label key={section.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedSections[section.id]}
                onChange={() => handleToggle(section.id)}
                className="mt-1 w-4 h-4 text-[#007CCF] rounded focus:ring-[#007CCF]"
              />
              <div className="flex-1">
                <div className="font-semibold text-gray-800">{section.label}</div>
                <div className="text-sm text-gray-500">{section.description}</div>
              </div>
            </label>
          ))}
        </div>

        <div className="flex gap-3 pt-4">
          <button
            onClick={handleExport}
            className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition"
          >
            Export PDF
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
}

export default PDFExportModal;