import Header from "../components/header";
import SideNavi from "../components/navi";
import { useState } from "react";
import Modal from "../components/modal";

function SystemSettings() {
  const [open, setOpen] = useState(false);
  const [activeSetting, setActiveSetting] = useState(null);
  const [content, setContent] = useState("");

  // REPORT CATEGORIES
  const [categories, setCategories] = useState(["Flood", "Garbage"]);
  const [newCategory, setNewCategory] = useState("");

  // SCHEDULE SETTINGS
  const [scheduleEnabled, setScheduleEnabled] = useState(true);

  // HELP SUPPORT
  const [helpContent, setHelpContent] = useState([
    { description: "", questions: [] }
  ]);

  const settings = [
    { title: "Terms & Conditions", desc: "Manage platform rules" },
    { title: "Help & Support", desc: "Manage FAQs" },
    { title: "Privacy & Security", desc: "Manage privacy policy" },
    { title: "Report Categories", desc: "Manage report types" },
    { title: "Schedule Posting Control", desc: "Control scheduling" },
    { title: "About Connecta", desc: "System description" },
    { title: "Roles & Permission", desc: "Mao nalang ni kulang here and the dashboard, and auto update"}
  ];

 const handleEdit = async (item) => {
  setActiveSetting(item);

  const mapType = {
    "Terms & Conditions": "terms",
    "Privacy & Security": "privacy",
    "About Connecta": "about",
    "Report Categories": "report_categories",
    "Schedule Posting Control": "schedule",
    "Help & Support": "help_support",
    "Roles & Permission": "roles"
  };

  const type = mapType[item.title];

  const res = await fetch(`https://connecta-backend-u4tw.onrender.com/admin/settings/${type}`);
  const data = await res.json();

if (!data) {
  // RESET states
  setHelpContent([{ description: "", questions: [] }]);
  setCategories([]);
  setScheduleEnabled(true);
  setContent("");
  return;
}
  // LOAD DATA PER TYPE
  if (type === "help_support") {
    setHelpContent(data.sections || []);
  } else if (type === "report_categories") {
    setCategories(data.categories || []);
  } else if (type === "schedule") {
    setScheduleEnabled(data.enabled ?? true);
  } else if (type === "roles") {
  setRoles(data.roles || []);
  } else {
    setContent(data.content || "");
  }
};

const addRole = () => {
  if (!newRole.trim()) return;

  setRoles([
    ...roles,
    { name: newRole, permissions: [] }
  ]);

  setNewRole("");
};

const deleteRole = (index) => {
  setRoles(roles.filter((_, i) => i !== index));
};

const togglePermission = (roleIndex, perm) => {
  const updated = [...roles];

  const perms = updated[roleIndex].permissions;

  if (perms.includes(perm)) {
    updated[roleIndex].permissions = perms.filter(p => p !== perm);
  } else {
    updated[roleIndex].permissions.push(perm);
  }

  setRoles(updated);
};

const saveRoles = async () => {
  await fetch("https://connecta-backend-u4tw.onrender.com/admin/settings/roles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ roles })
  });

  alert("Roles saved!");
};

  /* ================= HELP SUPPORT FUNCTIONS ================= */

  const addSection = () => {
    setHelpContent([...helpContent, { description: "", questions: [] }]);
  };

  const addQuestion = (sIndex) => {
    const updated = [...helpContent];
    updated[sIndex].questions.push({
      question: "",
      answer: "",
      open: true
    });
    setHelpContent(updated);
  };

  const handleChange = (sIndex, field, value) => {
    const updated = [...helpContent];
    updated[sIndex][field] = value;
    setHelpContent(updated);
  };

  const handleQuestionChange = (sIndex, qIndex, field, value) => {
    const updated = [...helpContent];
    updated[sIndex].questions[qIndex][field] = value;
    setHelpContent(updated);
  };

  const toggleAnswer = (sIndex, qIndex) => {
    const updated = [...helpContent];
    updated[sIndex].questions[qIndex].open =
      !updated[sIndex].questions[qIndex].open;
    setHelpContent(updated);
  };

  const deleteQuestion = (sIndex, qIndex) => {
    const updated = [...helpContent];
    updated[sIndex].questions.splice(qIndex, 1);
    setHelpContent(updated);
  };


  const saveTextSetting = async () => {
  const mapType = {
    "Terms & Conditions": "terms",
    "Privacy & Security": "privacy",
    "About Connecta": "about"
  };

  const type = mapType[activeSetting.title];

  await fetch(`https://connecta-backend-u4tw.onrender.com/admin/settings/${type}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content })
  });

  alert("Saved!");
};

const saveCategories = async () => {
  await fetch("https://connecta-backend-u4tw.onrender.com/admin/settings/report_categories", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ categories })
  });

  alert("Saved!");
};
const saveSchedule = async () => {
  await fetch("https://connecta-backend-u4tw.onrender.com/admin/settings/schedule", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ enabled: scheduleEnabled })
  });

  alert("Saved!");
};

const saveHelpSupport = async () => {
  await fetch("https://connecta-backend-u4tw.onrender.com/admin/settings/help_support", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sections: helpContent
    })
  });

  alert("Saved!");
};

// ROLES & PERMISSIONS
const [roles, setRoles] = useState([]);
const [newRole, setNewRole] = useState("");

const permissionsList = [
  "Dashboard",
  "Users",
  "Reports",
  "News",
  "Settings",
  "System Settings"
];
  /* ================= UI ================= */
  return (
    <>
      <Header />
      <SideNavi open={open} setOpen={setOpen} />

      <div className="md:ml-[260px] bg-gray-50 min-h-screen px-6 py-8">

  <h2 className="text-3xl font-bold text-[#007CCF] mb-6">
    System Settings
  </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {settings.map((item, i) => (
            <div key={i} className="bg-white p-6 rounded-xl shadow">
              <h2 className="text-lg font-semibold text-[#007CCF]">{item.title}</h2>
              <p className="text-sm text-gray-500 mb-3">{item.desc}</p>

              <button
                onClick={() => handleEdit(item)}
                className="bg-[#007CCF] text-white px-4 py-2 rounded-lg"
              >
                Edit
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ================= MODAL ================= */}

      <Modal
        isOpen={activeSetting !== null}
        onClose={() => setActiveSetting(null)}
        title={activeSetting?.title}
      >

        {/* ================= DEFAULT TEXT SETTINGS ================= */}
        {["Terms & Conditions", "Privacy & Security", "About Connecta"].includes(activeSetting?.title) && (
          <>
            <textarea
              placeholder="Enter content..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border rounded-lg p-3 min-h-[150px]"
            />

            <div className="flex justify-end mt-4">
<button onClick={saveTextSetting} className="bg-[#007CCF] text-white px-4 py-2 rounded">
  Save
</button>
            </div>
          </>
        )}

        {/* ================= REPORT CATEGORIES ================= */}
{activeSetting?.title === "Report Categories" && (
  <div className="space-y-3">

    {/* EXISTING */}
    {categories.map((cat, i) => (
      <div key={i} className="flex justify-between border p-2 rounded">
        <span>{cat}</span>
        <button
          onClick={() =>
            setCategories(categories.filter((_, idx) => idx !== i))
          }
          className="text-red-500"
        >
          ✕
        </button>
      </div>
    ))}

    {/* ADD CATEGORY */}
    <div className="flex gap-2">
      <input
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        className="border px-3 py-2 rounded w-full"
        placeholder="New category"
      />

      <button
        onClick={() => {
          if (!newCategory.trim()) return;

          setCategories([...categories, newCategory.trim()]);
          setNewCategory("");
        }}
        className="bg-green-500 text-white px-4 rounded"
      >
        Add
      </button>
    </div>

    {/* SAVE */}
    <div className="flex justify-end">
      <button
        onClick={saveCategories}
        className="bg-[#007CCF] text-white px-4 py-2 rounded"
      >
        Save
      </button>
    </div>

  </div>
)}

        {/* ================= SCHEDULE ================= */}
        {activeSetting?.title === "Schedule Posting Control" && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span>Enable Scheduling</span>
              <input
                type="checkbox"
                checked={scheduleEnabled}
                onChange={() => setScheduleEnabled(!scheduleEnabled)}
              />
            </div>
<button onClick={saveSchedule} className="bg-[#007CCF] text-white px-5 py-2 rounded-lg">
  Save Changes
</button>
          </div>
        )}

        {/* ================= HELP SUPPORT ================= */}
        {activeSetting?.title === "Help & Support" && (
<div className="space-y-6">

  {helpContent.map((section, sIndex) => (

    <div key={sIndex} className="border rounded-xl p-5 bg-gray-50 space-y-4">

      {/* SECTION HEADER */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-gray-700">
          Section {sIndex + 1}
        </h3>
      </div>

      {/* DESCRIPTION */}
      <div>
        <label className="text-sm font-medium text-gray-600">
          Description / Link
        </label>

        <textarea
          placeholder="Enter description or paste a link..."
          value={section.description}
          onChange={(e) =>
            handleChange(sIndex, "description", e.target.value)
          }
          className="w-full border rounded-lg px-3 py-2 mt-1"
        />
      </div>

      {/* QUESTIONS */}
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-600">
          Questions & Answers
        </p>

{(section.questions || []).map((q, qIndex) => (
          <div key={qIndex} className="bg-white border rounded-lg p-3 space-y-2">

            {/* QUESTION */}
            <div className="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Enter question"
                value={q.question}
                onChange={(e) =>
                  handleQuestionChange(sIndex, qIndex, "question", e.target.value)
                }
                className="flex-1 border rounded-lg px-3 py-2"
              />

              {/* TOGGLE */}
              <button
                onClick={() => toggleAnswer(sIndex, qIndex)}
                className="text-gray-500 text-sm"
              >
                {q.open ? "Hide" : "Show"}
              </button>

              {/* DELETE */}
              <button
                onClick={() => deleteQuestion(sIndex, qIndex)}
                className="text-red-500 text-sm"
              >
                ✕
              </button>
            </div>

            {/* ANSWER */}
            {q.open && (
              <textarea
                placeholder="Enter answer (optional)"
                value={q.answer}
                onChange={(e) =>
                  handleQuestionChange(sIndex, qIndex, "answer", e.target.value)
                }
                className="w-full border rounded-lg px-3 py-2"
              />
            )}

          </div>

        ))}

        {/* ADD QUESTION BUTTON */}
        <button
          onClick={() => addQuestion(sIndex)}
          className="bg-[#007CCF] text-white px-3 py-2 rounded-lg text-sm"
        >
          + Add Question
        </button>
      </div>

    </div>

  ))}

  {/* ADD SECTION BUTTON */}
  <button
    onClick={addSection}
    className="w-full border-2 border-dashed border-gray-300 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition"
  >
    + Add New Section
  </button>

  {/* SAVE */}
  <div className="flex justify-end">
<button onClick={saveHelpSupport} className="bg-[#007CCF] text-white px-5 py-2 rounded-lg">
  Save Changes
</button>
  </div>

</div>
        )}

{activeSetting?.title === "Roles & Permission" && (
  <div className="space-y-5">

    {/* ADD ROLE */}
    <div className="flex gap-2">
      <input
        value={newRole}
        onChange={(e) => setNewRole(e.target.value)}
        placeholder="Enter role name"
        className="border px-3 py-2 rounded w-full"
      />

      <button
        onClick={addRole}
        className="bg-green-500 text-white px-4 rounded"
      >
        Add
      </button>
    </div>

    {/* ROLE LIST */}
    {roles.map((role, rIndex) => (
      <div key={rIndex} className="border rounded-xl p-4 space-y-3 bg-gray-50">

        {/* ROLE HEADER */}
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-[#007CCF]">
            {role.name}
          </h3>

          <button
            onClick={() => deleteRole(rIndex)}
            className="text-red-500"
          >
            ✕
          </button>
        </div>

        {/* PERMISSIONS */}
        <div className="grid grid-cols-2 gap-2">
          {permissionsList.map((perm, i) => (
            <label key={i} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={role.permissions.includes(perm)}
                onChange={() => togglePermission(rIndex, perm)}
              />
              {perm}
            </label>
          ))}
        </div>

      </div>
    ))}

    {/* SAVE */}
    <div className="flex justify-end">
      <button
        onClick={saveRoles}
        className="bg-[#007CCF] text-white px-5 py-2 rounded-lg"
      >
        Save Roles
      </button>
    </div>

  </div>
)}
      </Modal>
    </>
  );
}

export default SystemSettings;