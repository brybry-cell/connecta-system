import Header from "../components/Header";
import SideNavi from "../components/navi";
import { useState, useEffect } from "react";
import Table from "../components/table";
import Modal from "../components/modal";
import Search from "../components/search";
import profile from "../assets/profile.png";
import arrowleft from "../assets/arrowleft.png";
import arrowright from "../assets/arrowright.png";

function User() {

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("residents");

  const [pendingResidents, setPendingResidents] = useState([]);
  const [allResidents, setAllResidents] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);

  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);

  // Loading States
  const [loadingPending, setLoadingPending] = useState(true);
  const [loadingResidents, setLoadingResidents] = useState(true);
  const [loadingStaffs, setLoadingStaffs] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [creatingStaff, setCreatingStaff] = useState(false);
  const [savingChanges, setSavingChanges] = useState(false);
  const [updatingPermissions, setUpdatingPermissions] = useState(false);

  // Error States
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const columns = [
    "Resident Name",
    "Contact Number",
    "Email",
    "Address",
    "Proof of Residency",
    "Action"
  ];

  const staffColumns = [
    "Role",
    "Staff Name",
    "Email",
    "Contact Number",
    "Address",
    "Action"
  ];

  const [isEditing, setIsEditing] = useState({
    name: false,
    contact: false,
    email: false,
    address: false
  });

  const [editedData, setEditedData] = useState({});
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [customPermissions, setCustomPermissions] = useState([]);
  const [rejectData, setRejectData] = useState({
    email: "",
    message: ""
  });

  const [newStaff, setNewStaff] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    role: "",
    customPermissions: []
  });

  const [selectedPending, setSelectedPending] = useState(null);
  
  const [pagePending, setPagePending] = useState(1);
  const [pageResidents, setPageResidents] = useState(1);
  const [pageStaffs, setPageStaffs] = useState(1);
  const perPage = 10;

  const formatName = (name) => {
    if (!name) return "";
    return name
      .toLowerCase()
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  // Reset pagination when search changes
  useEffect(() => {
    setPagePending(1);
    setPageResidents(1);
    setPageStaffs(1);
  }, [search]);

  // Check if form is valid for staff creation
  const isStaffFormValid = () => {
    return (
      newStaff.firstname.trim() !== "" &&
      newStaff.lastname.trim() !== "" &&
      newStaff.email.trim() !== "" &&
      newStaff.phone.trim() !== "" &&
      newStaff.role !== ""
    );
  };

  // Fetch Pending Residents
  useEffect(() => {
    fetchPendingResidents();
  }, []);

  const fetchPendingResidents = async () => {
    setLoadingPending(true);
    setError("");
    
    try {
      const res = await fetch("https://connecta-backend-u4tw.onrender.com/pending-residents");
      
      if (!res.ok) {
        throw new Error(`Failed to fetch pending residents: ${res.status}`);
      }
      
      const data = await res.json();
      
      const sorted = data.sort((a, b) => {
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      
      const formatted = sorted.map(r => [
        <span className="font-semibold" key={`pending-name-${r.uid}`}>
          {formatName(r.firstname + " " + r.lastname)}
        </span>,
        r.contact,
        r.email,
        r.address,
        "Submitted",
        "Action",
        r.uid,
        r.proofOfResidency,
        r.profileImage
      ]);
      setPendingResidents(formatted);
    } catch (err) {
      console.error("Error fetching pending residents:", err);
      setError("Failed to load pending residents. Please refresh the page.");
    } finally {
      setLoadingPending(false);
    }
  };

  // Fetch All Residents
  useEffect(() => {
    fetchAllResidents();
  }, []);

  const fetchAllResidents = async () => {
    setLoadingResidents(true);
    setError("");
    
    try {
      const res = await fetch("https://connecta-backend-u4tw.onrender.com/residents");
      
      if (!res.ok) {
        throw new Error(`Failed to fetch residents: ${res.status}`);
      }
      
      const data = await res.json();
      
      const sorted = data.sort((a, b) => {
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      
      const formatted = sorted.map(r => [
        <span className="font-semibold" key={`resident-name-${r.uid}`}>
          {formatName(r.firstname + " " + r.lastname)}
        </span>,
        r.contact,
        r.email,
        r.address,
        "Submitted",
        "Action",
        r.uid,
        r.proofOfResidency,
        r.profileImage
      ]);
      setAllResidents(formatted);
    } catch (err) {
      console.error("Error fetching residents:", err);
      setError("Failed to load residents. Please refresh the page.");
    } finally {
      setLoadingResidents(false);
    }
  };

  // Fetch Staffs
  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    setLoadingStaffs(true);
    setError("");
    
    try {
      const res = await fetch("https://connecta-backend-u4tw.onrender.com/staffs");
      
      if (!res.ok) {
        throw new Error(`Failed to fetch staffs: ${res.status}`);
      }
      
      const data = await res.json();
      
      const sorted = data.sort((a, b) => {
        return new Date(a.createdAt) - new Date(b.createdAt);
      });
      
      const formatted = sorted.map(r => [
        r.role,
        <span className="font-semibold" key={`staff-name-${r.uid}`}>
          {formatName(r.firstname + " " + r.lastname)}
        </span>,
        r.email,
        r.contact,
        r.address,
        "Action",
        r.uid,
        r.permissions || r.access || [],
        r.customPermissions || [],
        r.profileImage
      ]);
      setStaffs(formatted);
    } catch (err) {
      console.error("Error fetching staffs:", err);
      setError("Failed to load staff members. Please refresh the page.");
    } finally {
      setLoadingStaffs(false);
    }
  };

  // Fetch Roles
  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    setLoadingRoles(true);
    setError("");
    
    try {
      const res = await fetch("https://connecta-backend-u4tw.onrender.com/admin/settings/roles");
      
      if (!res.ok) {
        throw new Error(`Failed to fetch roles: ${res.status}`);
      }
      
      const data = await res.json();
      setRoles(data?.roles || []);
      
      // Collect all unique permissions from all roles
      const allPerms = new Set();
      data?.roles?.forEach(role => {
        role.permissions?.forEach(perm => allPerms.add(perm));
      });
      setAllPermissions(Array.from(allPerms));
    } catch (err) {
      console.error("Error fetching roles:", err);
      setError("Failed to load roles. Staff creation may be affected.");
    } finally {
      setLoadingRoles(false);
    }
  };

  const approveResident = async (uid) => {
    if (approving) return;
    
    setApproving(true);
    setError("");
    
    try {
      const res = await fetch(`https://connecta-backend-u4tw.onrender.com/approve-resident/${uid}`, {
        method: "PUT"
      });
      
      if (!res.ok) {
        throw new Error("Failed to approve resident");
      }
      
      setSuccessMessage("Resident approved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      setIsPendingModalOpen(false);
      
      await Promise.all([
        fetchPendingResidents(),
        fetchAllResidents()
      ]);
      
    } catch (err) {
      console.error("Error approving resident:", err);
      setError("Failed to approve resident. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setApproving(false);
    }
  };

const sendReject = async () => {
  console.log("Sending:", rejectData); // 👈 ADD THIS

  if (!rejectData.message.trim()) {
    setError("Please enter a rejection message.");
    return;
  }

  try {
    const res = await fetch("https://connecta-backend-u4tw.onrender.com/reject-resident", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rejectData)
    });

    const data = await res.json();
    console.log("Response:", data); // 👈 ADD THIS

    if (!res.ok) {
      throw new Error(data.error || "Failed to send rejection");
    }

    setSuccessMessage("Rejection email sent successfully!");
  } catch (err) {
    console.error("ERROR:", err); // 👈 ADD THIS
    setError(err.message);
  }
};

  const createStaff = async () => {
    if (!isStaffFormValid()) {
      setError("Please fill in all required fields.");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    setCreatingStaff(true);
    setError("");
    
    try {
      const res = await fetch("https://connecta-backend-u4tw.onrender.com/create-staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newStaff,
          customPermissions: newStaff.customPermissions
        })
      });
      
      if (!res.ok) {
        throw new Error("Failed to create staff");
      }
      
      setSuccessMessage("Staff created successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      setIsCreateModalOpen(false);
      setNewStaff({
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
        role: "",
        customPermissions: []
      });
      
      await fetchStaffs();
      
    } catch (err) {
      console.error("Error creating staff:", err);
      setError("Failed to create staff. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setCreatingStaff(false);
    }
  };

  const updateStaffPermissions = async () => {
    if (!selectedStaff) return;
    
    setUpdatingPermissions(true);
    setError("");
    
    try {
      const res = await fetch(`https://connecta-backend-u4tw.onrender.com/update-staff-permissions/${selectedStaff.uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customPermissions: customPermissions
        })
      });
      
      if (!res.ok) {
        throw new Error("Failed to update permissions");
      }
      
      setSuccessMessage("Staff permissions updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      setIsPermissionModalOpen(false);
      await fetchStaffs();
      
    } catch (err) {
      console.error("Error updating permissions:", err);
      setError("Failed to update permissions. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setUpdatingPermissions(false);
    }
  };

  const saveChanges = async () => {
    const nameParts = editedData.name.split(" ");
    const firstname = nameParts[0];
    const lastname = nameParts.slice(1).join(" ");
    
    setSavingChanges(true);
    setError("");
    
    try {
      const updateData = {
        firstname,
        lastname,
        email: editedData.email,
        contact: editedData.contact,
        address: editedData.address,
      };
      
      // For staff, include role
      if (selectedReport && staffs.some(s => s[6] === selectedReport[6])) {
        updateData.role = editedData.role;
      }
      
      const res = await fetch(`https://connecta-backend-u4tw.onrender.com/update-account/${selectedReport[6]}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updateData)
      });
      
      if (!res.ok) {
        throw new Error("Failed to update account");
      }
      
      setSuccessMessage("Account updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      setIsModalOpen(false);
      setIsEditing({ name: false, contact: false, email: false, address: false });
      
      await Promise.all([
        fetchAllResidents(),
        fetchStaffs()
      ]);
      
    } catch (err) {
      console.error("Error updating account:", err);
      setError("Failed to update account. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setSavingChanges(false);
    }
  };

  const handleTogglePermission = (permission) => {
    if (customPermissions.includes(permission)) {
      setCustomPermissions(customPermissions.filter(p => p !== permission));
    } else {
      setCustomPermissions([...customPermissions, permission]);
    }
  };

  const openPermissionModal = (staff) => {
    const staffData = staffs.find(s => s[6] === staff[6]);
    setSelectedStaff({
      uid: staff[6],
      name: staff[1]?.props?.children || staff[1],
      role: staff[0],
      customPermissions: staffData?.[8] || []
    });
    setCustomPermissions(staffData?.[8] || []);
    setIsPermissionModalOpen(true);
  };

  const handleview = (report) => {
    setSelectedReport(report);
    
    const isStaffData = staffs.some(s => s[6] === report[6]);
    
    if (isStaffData) {
      setEditedData({
        name: typeof report[1] === "string" ? report[1] : report[1].props.children,
        email: report[2],
        contact: report[3],
        address: report[4],
        role: report[0]
      });
    } else {
      setEditedData({
        name: typeof report[0] === "string" ? report[0] : report[0].props.children,
        contact: report[1],
        email: report[2],
        address: report[3]
      });
    }
    
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewStaff({ ...newStaff, [name]: value });
  };

  // IMPROVED FILTER FUNCTION
  const filterData = (data) => {
    if (!search.trim()) return data;
    
    const searchLower = search.toLowerCase();
    
    return data.filter(row => {
      // Check each column in the row (exclude the last item which contains object data)
      for (let i = 0; i < row.length - 1; i++) {
        const field = row[i];
        
        // Handle different types of field values
        let fieldText = "";
        
        if (field === null || field === undefined) {
          continue;
        }
        
        // Handle React elements with props.children
        if (typeof field === 'object' && field !== null && field.props?.children) {
          // If children is a string or number
          if (typeof field.props.children === 'string') {
            fieldText = field.props.children.toLowerCase();
          } 
          // If children is an array (multiple parts)
          else if (Array.isArray(field.props.children)) {
            fieldText = field.props.children.map(child => 
              typeof child === 'string' ? child : String(child)
            ).join(' ').toLowerCase();
          }
          // If children is a number or other primitive
          else if (field.props.children) {
            fieldText = String(field.props.children).toLowerCase();
          }
        }
        // Handle string fields
        else if (typeof field === 'string') {
          fieldText = field.toLowerCase();
        }
        // Handle numbers
        else if (typeof field === 'number') {
          fieldText = String(field).toLowerCase();
        }
        
        if (fieldText.includes(searchLower)) {
          return true;
        }
      }
      return false;
    });
  };

  const paginate = (data, page) => {
    const start = (page - 1) * perPage;
    return data.slice(start, start + perPage);
  };

  const totalPages = (data) => Math.max(1, Math.ceil(data.length / perPage));

  const isStaff = selectedReport && staffs.some(s => s[6] === selectedReport[6]);

  // Get filtered data for counts
  const filteredPending = filterData(pendingResidents);
  const filteredResidents = filterData(allResidents);
  const filteredStaffs = filterData(staffs);

  return (
    <>
      <Header />
      <SideNavi open={open} setOpen={setOpen} />

      <div className="md:ml-[260px] bg-gray-50 min-h-screen p-6">

        <h1 className="text-3xl font-bold text-[#007CCF] mb-6">
          User Management
        </h1>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-700 text-sm text-center animate-fadeIn">
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-700 text-sm text-center animate-shake">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="flex justify-end mb-6">
          <Search value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("residents")}
              className={`pb-3 px-4 font-medium transition-all relative ${
                activeTab === "residents"
                  ? "text-[#007CCF] border-b-2 border-[#007CCF]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Residents
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {filteredResidents.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab("staff")}
              className={`pb-3 px-4 font-medium transition-all relative ${
                activeTab === "staff"
                  ? "text-[#007CCF] border-b-2 border-[#007CCF]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Barangay Staff
              <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                {filteredStaffs.length}
              </span>
            </button>
          </div>
        </div>

        {/* Residents Tab Content */}
        {activeTab === "residents" && (
          <>
            {/* PENDING RESIDENTS */}
            <div className="mb-14">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-yellow-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-700">
                  Pending Residents
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({filteredPending.length})
                  </span>
                </h2>
              </div>
              
              {loadingPending ? (
                <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#007CCF]"></div>
                  <p className="text-gray-500 mt-2">Loading pending residents...</p>
                </div>
              ) : (
                <>
                  <Table
                    columns={columns}
                    data={paginate(filteredPending, pagePending)}
                    onView={(row) => {
                      setSelectedPending(row);
                      setIsPendingModalOpen(true);
                      setRejectData({
                        email: row[2],
                        message: ""
                      });
                    }}
                  />
                  
                  <div className="flex justify-center items-center gap-4 mt-4">
                    <button
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      onClick={() => setPagePending(p => Math.max(p - 1, 1))}
                      disabled={pagePending === 1 || loadingPending}
                    >
                      <img src={arrowleft} alt="Previous" className="w-5 h-5" />
                    </button>
                    
                    <span className="text-sm font-medium text-gray-600">
                      Page {pagePending} of {totalPages(filteredPending)}
                    </span>
                    
                    <button
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      onClick={() => setPagePending(p => Math.min(p + 1, totalPages(filteredPending)))}
                      disabled={pagePending === totalPages(filteredPending) || loadingPending}
                    >
                      <img src={arrowright} alt="Next" className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* RESIDENTS */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-6 bg-green-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-700">
                  Verified Residents
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({filteredResidents.length})
                  </span>
                </h2>
              </div>
              
              {loadingResidents ? (
                <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 text-center">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#007CCF]"></div>
                  <p className="text-gray-500 mt-2">Loading residents...</p>
                </div>
              ) : (
                <>
                  <Table
                    columns={columns}
                    data={paginate(filteredResidents, pageResidents)}
                    onView={handleview}
                  />
                  
                  <div className="flex justify-center items-center gap-4 mt-4">
                    <button
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      onClick={() => setPageResidents(p => Math.max(p - 1, 1))}
                      disabled={pageResidents === 1 || loadingResidents}
                    >
                      <img src={arrowleft} alt="Previous" className="w-5 h-5" />
                    </button>
                    
                    <span className="text-sm font-medium text-gray-600">
                      Page {pageResidents} of {totalPages(filteredResidents)}
                    </span>
                    
                    <button
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      onClick={() => setPageResidents(p => Math.min(p + 1, totalPages(filteredResidents)))}
                      disabled={pageResidents === totalPages(filteredResidents) || loadingResidents}
                    >
                      <img src={arrowright} alt="Next" className="w-5 h-5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        )}

        {/* Staff Tab Content */}
        {activeTab === "staff" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                <h2 className="text-lg font-semibold text-gray-700">
                  Barangay Staff
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({filteredStaffs.length})
                  </span>
                </h2>
              </div>
              
              <button
                onClick={() => setIsCreateModalOpen(true)}
                disabled={loadingRoles}
                className="bg-[#007CCF] text-white px-5 py-2 rounded-lg hover:bg-[#005fa3] transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
              >
                <span className="text-lg">+</span>
                Create Staff/Admin
              </button>
            </div>
            
            {loadingStaffs ? (
              <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#007CCF]"></div>
                <p className="text-gray-500 mt-2">Loading staff members...</p>
              </div>
            ) : (
              <>
                <Table
                  columns={staffColumns}
                  data={paginate(filteredStaffs, pageStaffs)}
                  onView={handleview}
                  onManagePermissions={openPermissionModal}
                />
                
                <div className="flex justify-center items-center gap-4 mt-4">
                  <button
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    onClick={() => setPageStaffs(p => Math.max(p - 1, 1))}
                    disabled={pageStaffs === 1 || loadingStaffs}
                  >
                    <img src={arrowleft} alt="Previous" className="w-5 h-5" />
                  </button>
                  
                  <span className="text-sm font-medium text-gray-600">
                    Page {pageStaffs} of {totalPages(filteredStaffs)}
                  </span>
                  
                  <button
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    onClick={() => setPageStaffs(p => Math.min(p + 1, totalPages(filteredStaffs)))}
                    disabled={pageStaffs === totalPages(filteredStaffs) || loadingStaffs}
                  >
                    <img src={arrowright} alt="Next" className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        )}

      </div>

      {/* EDIT MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isStaff ? "Barangay Staff Details" : "Resident Details"}
        className="max-w-xl"
      >
        {selectedReport && (
          <div className="flex gap-6">
            <div className="w-[180px] flex flex-col items-center">
              <img
                src={selectedReport[9] || selectedReport[8] || profile}
                alt="profile"
                className="w-28 h-28 rounded-full object-cover border border-gray-200"
              />
              <p className="mt-3 font-semibold text-gray-700 text-center text-sm">
                {editedData.name}
              </p>
              <p className="text-xs text-gray-500">
                {isStaff ? editedData.role : "Resident"}
              </p>
              {isStaff && (
                <button
                  onClick={() => {
                    const staffData = staffs.find(s => s[6] === selectedReport[6]);
                    openPermissionModal(staffData);
                    setIsModalOpen(false);
                  }}
                  className="mt-2 text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-all"
                >
                  Manage Permissions
                </button>
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500">Full Name</label>
                  <input
                    value={editedData.name}
                    onChange={(e) => setEditedData({ ...editedData, name: e.target.value })}
                    disabled={!isStaff && !isEditing.name}
                    className="w-full h-[40px] border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#007CCF] focus:border-transparent disabled:bg-gray-50 transition-all"
                  />
                </div>

                {isStaff && (
                  <div>
                    <label className="text-xs text-gray-500">Role</label>
                    <select
                      value={editedData.role}
                      onChange={(e) => setEditedData({ ...editedData, role: e.target.value })}
                      className="w-full h-[40px] border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#007CCF] focus:border-transparent transition-all"
                    >
                      <option value="">Select Role</option>
                      {roles.map((r, i) => (
                        <option key={i} value={r.name}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="text-xs text-gray-500">Email</label>
                  <input
                    value={editedData.email}
                    onChange={(e) => setEditedData({ ...editedData, email: e.target.value })}
                    disabled={!isStaff && !isEditing.email}
                    className="w-full h-[40px] border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#007CCF] focus:border-transparent disabled:bg-gray-50 transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs text-gray-500">Contact</label>
                  <input
                    value={editedData.contact}
                    onChange={(e) => setEditedData({ ...editedData, contact: e.target.value })}
                    disabled={!isStaff && !isEditing.contact}
                    className="w-full h-[40px] border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#007CCF] focus:border-transparent disabled:bg-gray-50 transition-all"
                  />
                </div>

                <div className="col-span-2">
                  <label className="text-xs text-gray-500">Address</label>
                  <input
                    value={editedData.address}
                    onChange={(e) => setEditedData({ ...editedData, address: e.target.value })}
                    disabled={!isStaff && !isEditing.address}
                    className="w-full h-[40px] border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#007CCF] focus:border-transparent disabled:bg-gray-50 transition-all"
                  />
                </div>
              </div>

              {isStaff && (
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold text-gray-600">Current Permissions</label>
                    <span className="text-xs text-gray-400">Role: {editedData.role}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {roles
                      .find(r => r.name === editedData.role)
                      ?.permissions?.map((perm, i) => (
                        <span
                          key={i}
                          className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs"
                        >
                          {perm}
                        </span>
                      ))}
                    {staffs.find(s => s[6] === selectedReport[6])?.[8]?.map((perm, i) => (
                      <span
                        key={`custom-${i}`}
                        className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs"
                      >
                        + {perm}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Green badges are custom permissions added for this staff
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                {!isStaff && !isEditing.name && !isEditing.email && !isEditing.contact && !isEditing.address ? (
                  <button
                    onClick={() => setIsEditing({ name: true, email: true, contact: true, address: true })}
                    className="bg-[#007CCF] text-white px-4 py-1.5 rounded-lg text-sm hover:bg-[#005fa3] transition-all"
                  >
                    Edit
                  </button>
                ) : !isStaff ? (
                  <>
                    <button
                      onClick={() => setIsEditing({ name: false, email: false, contact: false, address: false })}
                      className="border px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={saveChanges}
                      disabled={savingChanges}
                      className="bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm disabled:opacity-50 flex items-center gap-2 hover:bg-green-700 transition-all"
                    >
                      {savingChanges && (
                        <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                      )}
                      {savingChanges ? "Saving..." : "Save"}
                    </button>
                  </>
                ) : (
                  <button
                    onClick={saveChanges}
                    disabled={savingChanges}
                    className="bg-[#007CCF] text-white px-4 py-1.5 rounded-lg text-sm disabled:opacity-50 flex items-center gap-2 hover:bg-[#005fa3] transition-all"
                  >
                    {savingChanges && (
                      <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    )}
                    {savingChanges ? "Saving..." : "Save Changes"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* PERMISSION MANAGEMENT MODAL */}
      <Modal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        title={`Manage Permissions - ${selectedStaff?.name || ""}`}
        className="max-w-md"
      >
        {selectedStaff && (
          <div className="space-y-5">
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-sm font-medium text-gray-700 mb-1">Staff Information</p>
              <p className="text-xs text-gray-500">Role: <span className="font-semibold text-gray-700">{selectedStaff.role}</span></p>
              <p className="text-xs text-gray-500 mt-1">
                Role-based permissions are inherited automatically. Add custom permissions below to grant additional access.
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Role-based permissions:</p>
              <div className="flex flex-wrap gap-1.5">
                {roles
                  .find(r => r.name === selectedStaff.role)
                  ?.permissions?.map((perm, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs"
                    >
                      {perm}
                    </span>
                  )) || (
                  <span className="text-gray-400 text-xs">No role permissions</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 mb-2">Custom permissions (add/remove):</p>
              <div className="flex flex-wrap gap-2">
                {allPermissions.map((perm, i) => (
                  <button
                    key={i}
                    onClick={() => handleTogglePermission(perm)}
                    className={`px-2 py-1 rounded text-xs transition-all ${
                      customPermissions.includes(perm)
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {customPermissions.includes(perm) ? "✓ " : "+ "}{perm}
                  </button>
                ))}
              </div>
              {customPermissions.length > 0 && (
                <div className="mt-3 pt-3 border-t">
                  <p className="text-xs text-gray-500 mb-1">Custom permissions added:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {customPermissions.map((perm, i) => (
                      <span key={i} className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">
                        + {perm}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsPermissionModalOpen(false)}
                className="flex-1 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={updateStaffPermissions}
                disabled={updatingPermissions}
                className="flex-1 bg-[#007CCF] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-[#005fa3] transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {updatingPermissions && (
                  <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                )}
                {updatingPermissions ? "Saving..." : "Save Permissions"}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* PENDING RESIDENT MODAL */}
      <Modal
        isOpen={isPendingModalOpen}
        onClose={() => setIsPendingModalOpen(false)}
        title="Pending Resident Details"
        className="max-w-1xl"
      >
        {selectedPending && (
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-2">
                Proof of Residency
              </h3>
              <img
                src={selectedPending[7]}
                alt="Proof of Residency"
                className="w-full h-[300px] object-contain bg-black rounded-lg"
              />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="font-semibold">
                  {selectedPending[0]?.props?.children || selectedPending[0]}
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="font-semibold">{selectedPending[2]}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Contact</p>
                <p className="font-semibold">{selectedPending[1]}</p>
              </div>

              <div>
                <p className="text-xs text-gray-500">Address</p>
                <p className="font-semibold">{selectedPending[3]}</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => approveResident(selectedPending[6])}
                  disabled={approving}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center gap-2 hover:bg-green-700 transition-all"
                >
                  {approving && (
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  )}
                  {approving ? "Approving..." : "Approve"}
                </button>

                <button
                  onClick={() => setIsRejectOpen(true)}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-all"
                >
                  Reject / Resubmit
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* REJECT MODAL */}
      <Modal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        title="Reject / Request Resubmission"
        className="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600">Email</label>
            <input
              value={rejectData.email}
              readOnly
              className="w-full h-[45px] border border-gray-200 px-3 rounded bg-gray-50"
            />
          </div>

          <div>
            <label className="text-sm text-gray-600">Message</label>
            <textarea
              value={rejectData.message}
              onChange={(e) => setRejectData({ ...rejectData, message: e.target.value })}
              className="w-full border border-gray-200 px-3 py-2 rounded min-h-[100px] focus:outline-none focus:ring-2 focus:ring-[#007CCF] focus:border-transparent transition-all"
              placeholder="Explain why the application is being rejected or what needs to be resubmitted..."
            />
          </div>

          <button
            onClick={sendReject}
            disabled={rejecting || !rejectData.message.trim()}
            className="bg-[#007CCF] text-white px-4 py-2 rounded-lg w-full disabled:opacity-50 flex items-center justify-center gap-2 hover:bg-[#005fa3] transition-all"
          >
            {rejecting && (
              <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {rejecting ? "Sending..." : "Send Rejection"}
          </button>
        </div>
      </Modal>

      {/* CREATE STAFF MODAL */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Staff / Admin"
        className="max-w-1xl"
      >
        <div className="space-y-5">
          <div className="flex justify-center">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full flex items-center justify-center text-xl">
              👤
            </div>
          </div>

          <p className="text-center text-xs text-gray-500">
            Create a new staff or admin account. They will receive login credentials via email.
          </p>

          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <input
                  name="firstname"
                  placeholder="Enter first name"
                  value={newStaff.firstname}
                  onChange={handleChange}
                  className="w-full h-[40px] border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#007CCF] focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <input
                  name="lastname"
                  placeholder="Enter last name"
                  value={newStaff.lastname}
                  onChange={handleChange}
                  className="w-full h-[40px] border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#007CCF] focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                name="email"
                type="email"
                placeholder="staff@barangay.gov.ph"
                value={newStaff.email}
                onChange={handleChange}
                className="w-full h-[40px] border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#007CCF] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Contact Number *
              </label>
              <input
                name="phone"
                placeholder="09123456789"
                value={newStaff.phone}
                onChange={handleChange}
                className="w-full h-[40px] border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#007CCF] focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Role *
              </label>
              <select
                name="role"
                value={newStaff.role}
                onChange={handleChange}
                className="w-full h-[40px] border border-gray-200 rounded-lg px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#007CCF] focus:border-transparent transition-all"
              >
                <option value="">Select a role</option>
                {roles.map((r, i) => (
                  <option key={i} value={r.name}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>

            {newStaff.role && (
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  ✓ Default Permissions
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {roles
                    .find(r => r.name === newStaff.role)
                    ?.permissions?.map((p, i) => (
                      <span
                        key={i}
                        className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs"
                      >
                        ✓ {p}
                      </span>
                    )) || (
                    <span className="text-gray-400 text-xs">
                      No permissions assigned for this role
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-200">
              <p className="text-xs text-blue-700">
                <strong>Note:</strong> Staff accounts are created with a default password "123456". 
                They will be prompted to change their password on first login.
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="flex-1 border border-gray-300 text-gray-700 px-3 py-1.5 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={createStaff}
              disabled={!isStaffFormValid() || creatingStaff}
              className="flex-1 bg-[#007CCF] text-white px-3 py-1.5 rounded-lg text-sm hover:bg-[#005fa3] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {creatingStaff && (
                <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              )}
              {creatingStaff ? "Creating..." : "Create Staff"}
            </button>
          </div>
        </div>
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

export default User;