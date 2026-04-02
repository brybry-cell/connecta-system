import Header from "../components/Header";
import SideNavi from "../components/navi";
import { useState, useEffect } from "react";
import Modal from "../components/modal";
import trashIcon from "../assets/trash.png";
import editIcon from "../assets/edit.png";
import eyeIcon from "../assets/eye.png";

function SystemSettings() {
  const [open, setOpen] = useState(false);
  const [activeSetting, setActiveSetting] = useState(null);
  const [content, setContent] = useState("");
  const [hasChanges, setHasChanges] = useState(false);
  const [editedContent, setEditedContent] = useState("");

  // Loading States
  const [loading, setLoading] = useState({
    fetch: false,
    save: false,
    categories: false,
    feedback: false,
    help: false,
    roles: false,
    updatingUsers: false
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // REPORT CATEGORIES
  const [categories, setCategories] = useState(["Flood", "Garbage"]);
  const [newCategory, setNewCategory] = useState("");
  const [editingCategory, setEditingCategory] = useState(null);
  const [editedCategoryName, setEditedCategoryName] = useState("");

  // SCHEDULE SETTINGS
  const [scheduleEnabled, setScheduleEnabled] = useState(true);

  // HELP SUPPORT
  const [helpContent, setHelpContent] = useState([
    { description: "", questions: [] }
  ]);

  const [feedbackQuestions, setFeedbackQuestions] = useState([]);
  const [newQuestion, setNewQuestion] = useState("");
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [editedQuestionText, setEditedQuestionText] = useState("");

  const [openRoleIndex, setOpenRoleIndex] = useState(null);
  const [editingRole, setEditingRole] = useState(null);
  const [editedRoleName, setEditedRoleName] = useState("");
  const [originalRoleName, setOriginalRoleName] = useState("");
  
  const settings = [
    { title: "Terms & Conditions", desc: "Manage platform rules" },
    { title: "Help & Support", desc: "Manage FAQs" },
    { title: "Privacy & Security", desc: "Manage privacy policy" },
    { title: "Report Categories", desc: "Manage report types" },
    { title: "Feedback Questions", desc: "Manage feedback form questions" },
    { title: "About Connecta", desc: "System description" },
    { title: "Roles & Permission", desc: "Manage user roles and permissions" }
  ];

  const handleEdit = async (item) => {
    setActiveSetting(item);
    setError("");
    setHasChanges(false);
    
    const mapType = {
      "Terms & Conditions": "terms",
      "Privacy & Security": "privacy",
      "About Connecta": "about",
      "Report Categories": "report_categories",
      "Feedback Questions": "feedback",
      "Help & Support": "help_support",
      "Roles & Permission": "roles"
    };

    const type = mapType[item.title];
    
    setLoading(prev => ({ ...prev, fetch: true }));

    try {
      const res = await fetch(`https://connecta-backend-u4tw.onrender.com/admin/settings/${type}`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch ${item.title}`);
      }
      
      const data = await res.json();

      if (!data) {
        setHelpContent([{ description: "", questions: [] }]);
        setCategories([]);
        setScheduleEnabled(true);
        setContent("");
        setEditedContent("");
        setFeedbackQuestions([]);
        setRoles([]);
        return;
      }
      
      if (type === "help_support") {
        setHelpContent(data.sections || []);
      } else if (type === "report_categories") {
        setCategories(data.categories || []);
      } else if (type === "feedback") {
        setFeedbackQuestions(data.questions || []);
      } else if (type === "roles") {
        setRoles(data.roles || []);
      } else {
        setContent(data.content || "");
        setEditedContent(data.content || "");
      }
    } catch (err) {
      console.error(`Error fetching ${item.title}:`, err);
      setError(`Failed to load ${item.title}. Please try again.`);
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  };

  // ROLES & PERMISSIONS
  const [roles, setRoles] = useState([]);
  const [newRole, setNewRole] = useState("");
  const [hasRoleChanges, setHasRoleChanges] = useState(false);
  const [roleChangesLog, setRoleChangesLog] = useState([]);

  const permissionsList = [
    "Dashboard",
    "Users",
    "Reports",
    "News",
    "Settings",
    "System Settings"
  ];

  const addRole = () => {
    if (!newRole.trim()) {
      setError("Please enter a role name");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    if (roles.some(role => role.name.toLowerCase() === newRole.trim().toLowerCase())) {
      setError("Role already exists");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    setRoles([
      ...roles,
      { name: newRole.trim(), permissions: [] }
    ]);
    setNewRole("");
    setHasRoleChanges(true);
  };

  const deleteRole = (index) => {
    const roleToDelete = roles[index];
    setRoles(roles.filter((_, i) => i !== index));
    setRoleChangesLog([...roleChangesLog, { type: 'delete', oldName: roleToDelete.name }]);
    setHasRoleChanges(true);
  };

  const editRole = (index, newName) => {
    if (!newName.trim()) return;
    
    const oldName = roles[index].name;
    
    if (roles.some((role, i) => i !== index && role.name.toLowerCase() === newName.trim().toLowerCase())) {
      setError("Role already exists");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    const updated = [...roles];
    updated[index].name = newName.trim();
    setRoles(updated);
    setEditingRole(null);
    setRoleChangesLog([...roleChangesLog, { type: 'rename', oldName, newName: newName.trim() }]);
    setHasRoleChanges(true);
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
    setRoleChangesLog([...roleChangesLog, { type: 'permission', roleIndex, permissions: updated[roleIndex].permissions }]);
    setHasRoleChanges(true);
  };

  const updateAllUsersWithRole = async (oldRoleName, newRoleName, newPermissions) => {
    try {
      // Fetch all users with the old role
      const residentsRes = await fetch("https://connecta-backend-u4tw.onrender.com/residents");
      const staffsRes = await fetch("https://connecta-backend-u4tw.onrender.com/staffs");
      
      const residents = await residentsRes.json();
      const staffs = await staffsRes.json();
      const allUsers = [...residents, ...staffs];
      
      // Find users with the role to update
      const usersToUpdate = allUsers.filter(user => user.role === oldRoleName);
      
      if (usersToUpdate.length === 0) {
        console.log(`No users found with role: ${oldRoleName}`);
        return;
      }
      
      console.log(`Updating ${usersToUpdate.length} users from role "${oldRoleName}" to "${newRoleName}"`);
      
      // Update each user's role
      const updatePromises = usersToUpdate.map(user => 
        fetch(`https://connecta-backend-u4tw.onrender.com/update-account/${user.uid}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...user,
            role: newRoleName,
            permissions: newPermissions
          })
        })
      );
      
      await Promise.all(updatePromises);
      
      return usersToUpdate.length;
    } catch (error) {
      console.error("Error updating users with role:", error);
      throw error;
    }
  };

  const saveRoles = async () => {
    setLoading(prev => ({ ...prev, roles: true }));
    setError("");
    
    try {
      // First, save the updated roles to system settings
      const saveRes = await fetch("https://connecta-backend-u4tw.onrender.com/admin/settings/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roles })
      });
      
      if (!saveRes.ok) {
        throw new Error("Failed to save roles");
      }
      
      // Track which users were updated
      let totalUsersUpdated = 0;
      const updateErrors = [];
      
      // Process role changes (renames)
      const renameChanges = roleChangesLog.filter(log => log.type === 'rename');
      
      for (const change of renameChanges) {
        const updatedRole = roles.find(r => r.name === change.newName);
        if (updatedRole) {
          try {
            const updatedCount = await updateAllUsersWithRole(
              change.oldName,
              updatedRole.name,
              updatedRole.permissions
            );
            totalUsersUpdated += updatedCount;
          } catch (err) {
            updateErrors.push(`Failed to update users from "${change.oldName}" to "${change.newName}": ${err.message}`);
          }
        }
      }
      
      // Process permission changes for existing roles
      const permissionChanges = roleChangesLog.filter(log => log.type === 'permission');
      const uniqueRoleIndices = [...new Set(permissionChanges.map(log => log.roleIndex))];
      
      for (const roleIndex of uniqueRoleIndices) {
        const role = roles[roleIndex];
        if (role) {
          try {
            // Get all users with this role
            const residentsRes = await fetch("https://connecta-backend-u4tw.onrender.com/residents");
            const staffsRes = await fetch("https://connecta-backend-u4tw.onrender.com/staffs");
            
            const residents = await residentsRes.json();
            const staffs = await staffsRes.json();
            const allUsers = [...residents, ...staffs];
            
            const usersToUpdate = allUsers.filter(user => user.role === role.name);
            
            if (usersToUpdate.length > 0) {
              const updatePromises = usersToUpdate.map(user => 
                fetch(`https://connecta-backend-u4tw.onrender.com/update-account/${user.uid}`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    ...user,
                    permissions: role.permissions
                  })
                })
              );
              
              await Promise.all(updatePromises);
              totalUsersUpdated += usersToUpdate.length;
            }
          } catch (err) {
            updateErrors.push(`Failed to update permissions for role "${role.name}": ${err.message}`);
          }
        }
      }
      
      // Clear the changes log after successful save
      setRoleChangesLog([]);
      
      let successMsg = "Roles saved successfully!";
      if (totalUsersUpdated > 0) {
        successMsg += ` Updated ${totalUsersUpdated} user(s) with the new role/permission changes.`;
      }
      if (updateErrors.length > 0) {
        successMsg += `\n\nNote: Some updates failed: ${updateErrors.join(', ')}`;
      }
      
      setSuccessMessage(successMsg);
      setTimeout(() => setSuccessMessage(""), 5000);
      setHasRoleChanges(false);
      
    } catch (err) {
      console.error("Error saving roles:", err);
      setError("Failed to save roles. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(prev => ({ ...prev, roles: false }));
    }
  };

  // Reset role changes log when modal closes
  useEffect(() => {
    if (!activeSetting || activeSetting.title !== "Roles & Permission") {
      setRoleChangesLog([]);
    }
  }, [activeSetting]);

  /* ================= HELP SUPPORT FUNCTIONS ================= */
  const addSection = () => {
    setHelpContent([...helpContent, { description: "", questions: [] }]);
    setHasChanges(true);
  };

  const addQuestion = (sIndex) => {
    const updated = [...helpContent];
    updated[sIndex].questions.push({
      question: "",
      answer: "",
      open: true
    });
    setHelpContent(updated);
    setHasChanges(true);
  };

  const handleChange = (sIndex, field, value) => {
    const updated = [...helpContent];
    updated[sIndex][field] = value;
    setHelpContent(updated);
    setHasChanges(true);
  };

  const handleQuestionChange = (sIndex, qIndex, field, value) => {
    const updated = [...helpContent];
    updated[sIndex].questions[qIndex][field] = value;
    setHelpContent(updated);
    setHasChanges(true);
  };

  const toggleAnswer = (sIndex, qIndex) => {
    const updated = [...helpContent];
    updated[sIndex].questions[qIndex].open = !updated[sIndex].questions[qIndex].open;
    setHelpContent(updated);
    setHasChanges(true);
  };

  const deleteQuestion = (sIndex, qIndex) => {
    const updated = [...helpContent];
    updated[sIndex].questions.splice(qIndex, 1);
    setHelpContent(updated);
    setHasChanges(true);
  };

  const saveTextSetting = async () => {
    const mapType = {
      "Terms & Conditions": "terms",
      "Privacy & Security": "privacy",
      "About Connecta": "about"
    };
    
    const type = mapType[activeSetting.title];
    
    setLoading(prev => ({ ...prev, save: true }));
    setError("");
    
    try {
      const res = await fetch(`https://connecta-backend-u4tw.onrender.com/admin/settings/${type}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: editedContent })
      });
      
      if (!res.ok) {
        throw new Error("Failed to save settings");
      }
      
      setContent(editedContent);
      setSuccessMessage("Saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setHasChanges(false);
    } catch (err) {
      console.error("Error saving text setting:", err);
      setError("Failed to save. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(prev => ({ ...prev, save: false }));
    }
  };

  const saveCategories = async () => {
    setLoading(prev => ({ ...prev, categories: true }));
    setError("");
    
    try {
      const res = await fetch("https://connecta-backend-u4tw.onrender.com/admin/settings/report_categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categories })
      });
      
      if (!res.ok) {
        throw new Error("Failed to save categories");
      }
      
      setSuccessMessage("Categories saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error saving categories:", err);
      setError("Failed to save categories. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(prev => ({ ...prev, categories: false }));
    }
  };

  const saveHelpSupport = async () => {
    setLoading(prev => ({ ...prev, help: true }));
    setError("");
    
    try {
      const res = await fetch("https://connecta-backend-u4tw.onrender.com/admin/settings/help_support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sections: helpContent
        })
      });
      
      if (!res.ok) {
        throw new Error("Failed to save help content");
      }
      
      setSuccessMessage("Help & Support saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setHasChanges(false);
    } catch (err) {
      console.error("Error saving help support:", err);
      setError("Failed to save help content. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(prev => ({ ...prev, help: false }));
    }
  };

  const saveFeedbackQuestions = async () => {
    setLoading(prev => ({ ...prev, feedback: true }));
    setError("");
    
    try {
      const res = await fetch("https://connecta-backend-u4tw.onrender.com/admin/settings/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questions: feedbackQuestions })
      });
      
      if (!res.ok) {
        throw new Error("Failed to save feedback questions");
      }
      
      setSuccessMessage("Feedback questions saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error("Error saving feedback questions:", err);
      setError("Failed to save feedback questions. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(prev => ({ ...prev, feedback: false }));
    }
  };

  const addCategory = () => {
    if (!newCategory.trim()) return;
    setCategories([...categories, newCategory.trim()]);
    setNewCategory("");
  };

  const deleteCategory = (index) => {
    setCategories(categories.filter((_, idx) => idx !== index));
  };

  const startEditCategory = (index, category) => {
    setEditingCategory(index);
    setEditedCategoryName(category);
  };

  const saveEditCategory = (index) => {
    if (!editedCategoryName.trim()) return;
    const updated = [...categories];
    updated[index] = editedCategoryName.trim();
    setCategories(updated);
    setEditingCategory(null);
    setEditedCategoryName("");
  };

  const addFeedbackQuestion = () => {
    if (!newQuestion.trim()) return;
    setFeedbackQuestions([...feedbackQuestions, newQuestion.trim()]);
    setNewQuestion("");
  };

  const deleteFeedbackQuestion = (index) => {
    setFeedbackQuestions(feedbackQuestions.filter((_, idx) => idx !== index));
  };

  const startEditFeedbackQuestion = (index, question) => {
    setEditingQuestion(index);
    setEditedQuestionText(question);
  };

  const saveEditFeedbackQuestion = (index) => {
    if (!editedQuestionText.trim()) return;
    const updated = [...feedbackQuestions];
    updated[index] = editedQuestionText.trim();
    setFeedbackQuestions(updated);
    setEditingQuestion(null);
    setEditedQuestionText("");
  };

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
            <div key={i} className="bg-white p-6 rounded-xl shadow border border-gray-200">
              <h2 className="text-lg font-semibold text-[#007CCF]">{item.title}</h2>
              <p className="text-sm text-gray-500 mb-3">{item.desc}</p>
              <button
                onClick={() => handleEdit(item)}
                disabled={loading.fetch}
                className="bg-[#007CCF] text-white px-4 py-2 rounded-lg disabled:opacity-50"
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
        onClose={() => {
          setActiveSetting(null);
          setHasChanges(false);
          setHasRoleChanges(false);
          setRoleChangesLog([]);
        }}
        title={activeSetting?.title}
        className="max-w-2xl"
      >
        {/* Success Message inside Modal */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-700 text-sm text-center animate-fadeIn whitespace-pre-line">
            {successMessage}
          </div>
        )}

        {/* Error Message inside Modal */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-700 text-sm text-center animate-shake">
            {error}
          </div>
        )}

        {loading.fetch ? (
          <div className="flex justify-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#007CCF]"></div>
            <p className="ml-2 text-gray-500">Loading...</p>
          </div>
        ) : (
          <>
            {/* ================= DEFAULT TEXT SETTINGS ================= */}
            {["Terms & Conditions", "Privacy & Security", "About Connecta"].includes(activeSetting?.title) && (
              <>
                <textarea
                  placeholder="Enter content..."
                  value={editedContent}
                  onChange={(e) => {
                    setEditedContent(e.target.value);
                    setHasChanges(e.target.value !== content);
                  }}
                  className="w-full border border-gray-200 rounded-lg p-3 min-h-[150px] focus:outline-none focus:ring-2 focus:ring-[#007CCF]"
                />
                <div className="flex justify-end mt-4">
                  <button 
                    onClick={saveTextSetting} 
                    disabled={!hasChanges || loading.save}
                    className="bg-[#007CCF] text-white px-4 py-2 rounded disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading.save && (
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {loading.save ? "Saving..." : "Save"}
                  </button>
                </div>
              </>
            )}

            {/* ================= REPORT CATEGORIES ================= */}
            {activeSetting?.title === "Report Categories" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="border border-gray-200 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-[#007CCF]"
                    placeholder="New category"
                  />
                  <button
                    onClick={addCategory}
                    disabled={!newCategory.trim()}
                    className="bg-green-500 text-white px-4 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>

                {categories.map((cat, i) => (
                  <div key={i} className="flex justify-between items-center border border-gray-200 p-3 rounded-lg bg-gray-50">
                    {editingCategory === i ? (
                      <input
                        value={editedCategoryName}
                        onChange={(e) => setEditedCategoryName(e.target.value)}
                        className="flex-1 border border-gray-200 px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-[#007CCF]"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium">{cat}</span>
                    )}
                    <div className="flex gap-2">
                      {editingCategory === i ? (
                        <button
                          onClick={() => saveEditCategory(i)}
                          className="text-green-500 hover:text-green-700"
                        >
                          ✓
                        </button>
                      ) : (
                        <button
                          onClick={() => startEditCategory(i, cat)}
                          className="hover:opacity-70"
                        >
                          <img src={editIcon} alt="Edit" className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteCategory(i)}
                        className="hover:opacity-70"
                      >
                        <img src={trashIcon} alt="Delete" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end">
                  <button
                    onClick={saveCategories}
                    disabled={loading.categories}
                    className="bg-[#007CCF] text-white px-4 py-2 rounded disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading.categories && (
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {loading.categories ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            )}

            {/* ================= FEEDBACK QUESTIONS ================= */}
            {activeSetting?.title === "Feedback Questions" && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    value={newQuestion}
                    onChange={(e) => setNewQuestion(e.target.value)}
                    placeholder="Enter question"
                    className="border border-gray-200 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-[#007CCF]"
                  />
                  <button
                    onClick={addFeedbackQuestion}
                    disabled={!newQuestion.trim()}
                    className="bg-green-500 text-white px-4 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>

                {feedbackQuestions.map((q, i) => (
                  <div key={i} className="flex justify-between items-center border border-gray-200 p-3 rounded bg-gray-50">
                    {editingQuestion === i ? (
                      <input
                        value={editedQuestionText}
                        onChange={(e) => setEditedQuestionText(e.target.value)}
                        className="flex-1 border border-gray-200 px-3 py-1 rounded focus:outline-none focus:ring-2 focus:ring-[#007CCF]"
                        autoFocus
                      />
                    ) : (
                      <span>{q}</span>
                    )}
                    <div className="flex gap-2">
                      {editingQuestion === i ? (
                        <button
                          onClick={() => saveEditFeedbackQuestion(i)}
                          className="text-green-500 hover:text-green-700"
                        >
                          ✓
                        </button>
                      ) : (
                        <button
                          onClick={() => startEditFeedbackQuestion(i, q)}
                          className="hover:opacity-70"
                        >
                          <img src={editIcon} alt="Edit" className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => deleteFeedbackQuestion(i)}
                        className="hover:opacity-70"
                      >
                        <img src={trashIcon} alt="Delete" className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-end">
                  <button
                    onClick={saveFeedbackQuestions}
                    disabled={loading.feedback}
                    className="bg-[#007CCF] text-white px-4 py-2 rounded disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading.feedback && (
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {loading.feedback ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            )}

            {/* ================= HELP SUPPORT ================= */}
            {activeSetting?.title === "Help & Support" && (
              <div className="space-y-6">
                {helpContent.map((section, sIndex) => (
                  <div key={sIndex} className="border border-gray-200 rounded-xl p-5 bg-gray-50 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-gray-700">Section {sIndex + 1}</h3>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-600">Description / Link</label>
                      <textarea
                        placeholder="Enter description or paste a link..."
                        value={section.description}
                        onChange={(e) => handleChange(sIndex, "description", e.target.value)}
                        className="w-full border border-gray-200 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-[#007CCF]"
                      />
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm font-medium text-gray-600">Questions & Answers</p>
                      
{(section.questions || []).map((q, qIndex) => (
  <div key={qIndex} className="bg-white border border-gray-200 rounded-lg p-3 space-y-2">
    <div className="flex gap-2 items-center">
      <input
        type="text"
        placeholder="Enter question"
        value={q.question}
        onChange={(e) => handleQuestionChange(sIndex, qIndex, "question", e.target.value)}
        className="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007CCF]"
      />
      <button
        onClick={() => toggleAnswer(sIndex, qIndex)}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-600 font-bold text-lg"
      >
        {q.open ? "−" : "+"}
      </button>
      <button
        onClick={() => deleteQuestion(sIndex, qIndex)}
        className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors"
      >
        <img src={trashIcon} alt="Delete" className="w-4 h-4" />
      </button>
    </div>
    
    {q.open && (
      <textarea
        placeholder="Enter answer (optional)"
        value={q.answer}
        onChange={(e) => handleQuestionChange(sIndex, qIndex, "answer", e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#007CCF]"
        rows="3"
      />
    )}
  </div>
))}
                      
                      <button
                        onClick={() => addQuestion(sIndex)}
                        className="bg-[#007CCF] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#005fa3]"
                      >
                        + Add Question
                      </button>
                    </div>
                  </div>
                ))}

                <button
                  onClick={addSection}
                  className="w-full border-2 border-dashed border-gray-300 py-3 rounded-lg text-gray-600 hover:bg-gray-100 transition"
                >
                  + Add New Section
                </button>

                <div className="flex justify-end">
                  <button
                    onClick={saveHelpSupport}
                    disabled={!hasChanges || loading.help}
                    className="bg-[#007CCF] text-white px-5 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading.help && (
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {loading.help ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </div>
            )}

            {/* ================= ROLES & PERMISSION ================= */}
            {activeSetting?.title === "Roles & Permission" && (
              <div className="space-y-5">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                  <strong>Note:</strong> When you rename a role or change permissions, all users with that role will be automatically updated with the new role name and permissions.
                </div>

                <div className="flex gap-2">
                  <input
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    placeholder="Enter role name"
                    className="border border-gray-200 px-3 py-2 rounded w-full focus:outline-none focus:ring-2 focus:ring-[#007CCF]"
                  />
                  <button
                    onClick={addRole}
                    disabled={!newRole.trim()}
                    className="bg-green-500 text-white px-4 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>

                {roles.map((role, rIndex) => (
                  <div key={rIndex} className="border border-gray-200 rounded-xl bg-gray-50 overflow-hidden">
                    <div
                      onClick={() => setOpenRoleIndex(openRoleIndex === rIndex ? null : rIndex)}
                      className="flex justify-between items-center px-4 py-3 cursor-pointer hover:bg-gray-100"
                    >
                      {editingRole === rIndex ? (
                        <input
                          value={editedRoleName}
                          onChange={(e) => setEditedRoleName(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          className="font-semibold text-[#007CCF] border border-gray-200 px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-[#007CCF]"
                          autoFocus
                        />
                      ) : (
                        <h3 className="font-semibold text-[#007CCF]">{role.name}</h3>
                      )}
                      <div className="flex gap-2">
                        {editingRole === rIndex ? (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              editRole(rIndex, editedRoleName);
                            }}
                            className="text-green-500 hover:text-green-700"
                          >
                            ✓
                          </button>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingRole(rIndex);
                              setEditedRoleName(role.name);
                            }}
                            className="hover:opacity-70"
                          >
                            <img src={editIcon} alt="Edit" className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteRole(rIndex);
                          }}
                          className="hover:opacity-70"
                        >
                          <img src={trashIcon} alt="Delete" className="w-4 h-4" />
                        </button>
                        <span className="text-gray-400">{openRoleIndex === rIndex ? "▲" : "▼"}</span>
                      </div>
                    </div>
                    
                    {openRoleIndex === rIndex && (
                      <div className="p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          {permissionsList.map((perm, i) => (
                            <label key={i} className="flex items-center gap-2 text-sm cursor-pointer">
                              <input
                                type="checkbox"
                                checked={role.permissions.includes(perm)}
                                onChange={() => togglePermission(rIndex, perm)}
                                className="w-4 h-4"
                              />
                              {perm}
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                <div className="flex justify-end">
                  <button
                    onClick={saveRoles}
                    disabled={!hasRoleChanges || loading.roles}
                    className="bg-[#007CCF] text-white px-5 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading.roles && (
                      <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    {loading.roles ? "Saving..." : "Save Roles"}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </Modal>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
}

export default SystemSettings;