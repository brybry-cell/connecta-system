import Header from "../components/header";
import SideNavi from "../components/navi";
import { useState, useEffect } from "react";
import Table from "../components/table";
import Modal from "../components/modal";
import Search from "../components/search";

function User() {

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [pendingResidents, setPendingResidents] = useState([]);
  const [allResidents, setAllResidents] = useState([]);
  const [staffs, setStaffs] = useState([]);

  const [selectedReport, setSelectedReport] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const columns = [
    "Resident Name",
    "Contact Number",
    "Email",
    "Address",
    "Proof of Residency",
    "Action"
  ];

  
  useEffect(() => {
    fetch("https://connecta-backend-u4tw.onrender.com/pending-residents")
      .then(res => res.json())
.then(data => {

  const sorted = data.sort((a, b) => {
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const formatted = sorted.map(r => [
  <span className="font-semibold">
    {formatName(r.firstname + " " + r.lastname)}
  </span>,
            r.contact,
          r.email,
          r.address,
          "Submitted",
          "Action",
          r.uid,
          r.proofOfResidency
        ]);
        setPendingResidents(formatted);
      });
  }, []);

  useEffect(() => {
    fetch("https://connecta-backend-u4tw.onrender.com/residents")
      .then(res => res.json())
.then(data => {

  const sorted = data.sort((a, b) => {
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const formatted = sorted.map(r => [
  <span className="font-semibold">
    {formatName(r.firstname + " " + r.lastname)}
  </span>,
          r.contact,
          r.email,
          r.address,
          "Submitted",
          "Action",
          r.uid,
          r.proofOfResidency
        ]);
        setAllResidents(formatted);
      });
  }, []);

  useEffect(() => {
    fetch("https://connecta-backend-u4tw.onrender.com/staffs")
      .then(res => res.json())
  .then(data => {

  const sorted = data.sort((a, b) => {
    return new Date(a.createdAt) - new Date(b.createdAt);
  });

  const formatted = sorted.map(r => [
  r.role,
  <span className="font-semibold">
    {formatName(r.firstname + " " + r.lastname)}
  </span>,
    r.email,
  r.contact,
  r.address,
  "Action",
  r.uid,
  r.permissions || r.access || [] // ✅ FIXED
]);
        setStaffs(formatted);
      });
  }, []);



  const approveResident = async (uid) => {
    await fetch(`https://connecta-backend-u4tw.onrender.com/approve-resident/${uid}`, {
      method: "PUT"
    });
    alert("Resident Approved");
    setIsModalOpen(false);
    window.location.reload();
  };

  /* SEARCH FUNCTION */
  const filterData = (data) => {
    if (!search) return data;

    return data.filter(row =>
      row.slice(0, 4).some(field =>
        String(field).toLowerCase().includes(search.toLowerCase())
      )
    );
  };

  const [pagePending, setPagePending] = useState(1);
  const [pageResidents, setPageResidents] = useState(1);
  const [pageStaffs, setPageStaffs] = useState(1);

  const perPage = 10;

  const paginate = (data, page) => {
    const start = (page - 1) * perPage;
    return data.slice(start, start + perPage);
  };

  const totalPages = (data) => Math.max(1, Math.ceil(data.length / perPage));

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [newStaff, setNewStaff] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    role: "",
    access: []
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewStaff({ ...newStaff, [name]: value });
  };

  const handleAccessChange = (page) => {
    setNewStaff(prev => {
      const exists = prev.access.includes(page);
      return {
        ...prev,
        access: exists
          ? prev.access.filter(p => p !== page)
          : [...prev.access, page]
      };
    });
  };

const createStaff = async () => {
  await fetch("https://connecta-backend-u4tw.onrender.com/create-staff", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(newStaff)
  });

  alert("Staff Created!");
  setIsCreateModalOpen(false);

  // 🔥 REFETCH STAFFS
  fetch("https://connecta-backend-u4tw.onrender.com/staffs")
    .then(res => res.json())
    .then(data => {
      const formatted = data.map(r => [
        r.firstname + " " + r.lastname,
        r.contact,
        r.email,
        r.address,
        r.role, // ✅ ROLE INSTEAD OF PROOF
        "Action",
        r.uid,
        r.permissions || [] // ✅ SAVE PERMISSIONS
      ]);
      setStaffs(formatted);
    });
};

  const [isEditing, setIsEditing] = useState({
  name: false,
  contact: false,
  email: false,
  address: false
});

const [editedData, setEditedData] = useState({});

const handleview = (report) => {
  setSelectedReport(report);

  setEditedData({
name: typeof report[0] === "string"
  ? report[0]
  : report[0].props.children,
      contact: report[1],
    email: report[2],
    address: report[3]
  });

  setIsEditing({
    name: false,
    contact: false,
    email: false,
    address: false
  });

  setIsModalOpen(true);
};

const isFromResidents =
  selectedReport &&
  allResidents.some(r => r[6] === selectedReport[6]);

  const isStaff =
  selectedReport &&
  staffs.some(s => s[6] === selectedReport[6]);
const isAnyEditing = Object.values(isEditing).some(v => v);

const saveChanges = async () => {

  const nameParts = editedData.name.split(" ");
  const firstname = nameParts[0];
  const lastname = nameParts.slice(1).join(" ");

  await fetch(`https://connecta-backend-u4tw.onrender.com/update-account/${selectedReport[6]}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      firstname,
      lastname,
      email: editedData.email,
      contact: editedData.contact,
      address: editedData.address
    })
  });

  alert("Updated successfully");
  setIsModalOpen(false);
  window.location.reload();
};


const [roles, setRoles] = useState([]);

useEffect(() => {
  fetch("https://connecta-backend-u4tw.onrender.com/admin/settings/roles")
    .then(res => res.json())
    .then(data => {
      setRoles(data?.roles || []);
    });
}, []);

// ADD THIS STATE (near your other useState)
const [isRejectOpen, setIsRejectOpen] = useState(false);
const [rejectData, setRejectData] = useState({
  email: "",
  message: ""
});

const sendReject = async () => {
  await fetch("https://connecta-backend-u4tw.onrender.com/reject-resident", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rejectData)
  });

  alert("Sent!");
  setIsRejectOpen(false);
};

const staffColumns = [
  "Role",
  "Staff Name",
  "Email",
  "Contact Number",
  "Address",
  "Action"
];

const formatName = (name) => {
  if (!name) return "";
  return name
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};
  return (
    <>
      <Header />
      <SideNavi open={open} setOpen={setOpen} />

      <div className="md:ml-[260px] bg-gray-50 min-h-screen p-6">

        <h1 className="text-3xl font-bold text-[#007CCF] mb-6">
          User Management
        </h1>

        <div className="flex justify-end mb-6">
          <Search value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        {/* PENDING */}
        <div className="mb-14">
                      <h2 className="text-lg font-semibold text-gray-700">
              Pending Residents
            </h2>
          <Table
            columns={columns}
            data={paginate(filterData(pendingResidents), pagePending)}
            onView={handleview}
          />

          <div className="flex justify-center items-center gap-3 mt-4">
            <button
              className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              onClick={() => setPagePending(p => p - 1)}
              disabled={pagePending === 1}
            >
              Prev
            </button>

            <span className="text-sm font-medium">
              Page {pagePending} of {totalPages(filterData(pendingResidents))}
            </span>

            <button
              className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              onClick={() => setPagePending(p => p + 1)}
              disabled={pagePending === totalPages(filterData(pendingResidents))}
            >
              Next
            </button>
          </div>
        </div>

        {/* RESIDENTS */}
        <div className="mb-14">
                      <h2 className="text-lg font-semibold text-gray-700">
              Residents
            </h2>
          <Table
            columns={columns}
            data={paginate(filterData(allResidents), pageResidents)}
            onView={handleview}
          />

          <div className="flex justify-center items-center gap-3 mt-4">
            <button
              className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              onClick={() => setPageResidents(p => p - 1)}
              disabled={pageResidents === 1}
            >
              Prev
            </button>

            <span className="text-sm font-medium">
              Page {pageResidents} of {totalPages(filterData(allResidents))}
            </span>

            <button
              className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              onClick={() => setPageResidents(p => p + 1)}
              disabled={pageResidents === totalPages(filterData(allResidents))}
            >
              Next
            </button>
          </div>
        </div>

        {/* STAFFS */}
        <div className="mb-14">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-700">
              Barangay Staffs
            </h2>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              + Create Staff/Admin
            </button>
          </div>

          <Table
            columns={staffColumns}
            data={paginate(filterData(staffs), pageStaffs)}
            onView={handleview}
          />

          <div className="flex justify-center items-center gap-3 mt-4">
            <button
              className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              onClick={() => setPageStaffs(p => p - 1)}
              disabled={pageStaffs === 1}
            >
              Prev
            </button>

            <span className="text-sm font-medium">
              Page {pageStaffs} of {totalPages(filterData(staffs))}
            </span>

            <button
              className="bg-blue-600 text-white px-4 py-1 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              onClick={() => setPageStaffs(p => p + 1)}
              disabled={pageStaffs === totalPages(filterData(staffs))}
            >
              Next
            </button>
          </div>
        </div>

      </div>

      {/* MODAL */}
<Modal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  title={isStaff ? "Barangay Staff Details" : "Resident Verification"}
>
  {selectedReport && (

    isStaff ? (

      /* ================= STAFF MODAL ================= */
      <div className="space-y-6">

        <div className="border-b pb-3">
          <h2 className="text-lg font-semibold text-gray-800">
            Staff Information
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="text-xs text-gray-500">Full Name</label>
            <div className="font-semibold text-gray-800">
              {typeof selectedReport[1] === "string"
                ? selectedReport[1]
                : selectedReport[1].props.children}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">Role</label>
            <div className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs inline-block">
              {selectedReport[0]}
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">Email</label>
            <div>{selectedReport[2]}</div>
          </div>

          <div>
            <label className="text-xs text-gray-500">Contact</label>
            <div>{selectedReport[3]}</div>
          </div>

          <div className="col-span-2">
            <label className="text-xs text-gray-500">Address</label>
            <div>{selectedReport[4] || "N/A"}</div>
          </div>

        </div>

        {/* PERMISSIONS */}
        <div>
          <label className="text-xs text-gray-500">Permissions</label>

          <div className="mt-2 flex flex-wrap gap-2">
            {Array.isArray(selectedReport[7]) && selectedReport[7].length > 0 ? (
              selectedReport[7].map((perm, i) => (
                <span
                  key={i}
                  className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs"
                >
                  {perm}
                </span>
              ))
            ) : (
              <span className="text-gray-400 text-sm">
                No permissions assigned
              </span>
            )}
          </div>
        </div>

      </div>

    ) : (

      /* ================= RESIDENT MODAL ================= */
/* ================= RESIDENT MODAL ================= */
<div className="grid grid-cols-2 gap-8">

  <div className="flex items-center justify-center">
    <img
      src={selectedReport?.[7]}
      className="w-full max-h-[400px] object-contain rounded-lg border"
    />
  </div>

  <div className="space-y-4">

    {/* NAME */}
    <div className="relative">
      <label className="text-sm text-gray-600">Resident Name</label>
      <input
        value={editedData.name}
        onChange={(e) =>
          isEditing.name &&
          setEditedData({ ...editedData, name: e.target.value })
        }
        className="w-full h-[45px] border px-3 rounded"
      />
      {isFromResidents && (
        <span
          onClick={() => setIsEditing(prev => ({ ...prev, name: true }))}
          className="absolute right-3 top-[32px] text-blue-600 text-sm cursor-pointer"
        >
          Edit
        </span>
      )}
    </div>

    {/* EMAIL */}
    <div className="relative">
      <label className="text-sm text-gray-600">Email</label>
      <input
        value={editedData.email}
        onChange={(e) =>
          isEditing.email &&
          setEditedData({ ...editedData, email: e.target.value })
        }
        className="w-full h-[45px] border px-3 rounded"
      />
      {isFromResidents && (
        <span
          onClick={() => setIsEditing(prev => ({ ...prev, email: true }))}
          className="absolute right-3 top-[32px] text-blue-600 text-sm cursor-pointer"
        >
          Edit
        </span>
      )}
    </div>

    {/* CONTACT */}
    <div className="relative">
      <label className="text-sm text-gray-600">Contact</label>
      <input
        value={editedData.contact}
        onChange={(e) =>
          isEditing.contact &&
          setEditedData({ ...editedData, contact: e.target.value })
        }
        className="w-full h-[45px] border px-3 rounded"
      />
      {isFromResidents && (
        <span
          onClick={() => setIsEditing(prev => ({ ...prev, contact: true }))}
          className="absolute right-3 top-[32px] text-blue-600 text-sm cursor-pointer"
        >
          Edit
        </span>
      )}
    </div>

    {/* ADDRESS */}
    <div className="relative">
      <label className="text-sm text-gray-600">Address</label>
      <input
        value={editedData.address}
        onChange={(e) =>
          isEditing.address &&
          setEditedData({ ...editedData, address: e.target.value })
        }
        className="w-full h-[45px] border px-3 rounded"
      />
      {isFromResidents && (
        <span
          onClick={() => setIsEditing(prev => ({ ...prev, address: true }))}
          className="absolute right-3 top-[32px] text-blue-600 text-sm cursor-pointer"
        >
          Edit
        </span>
      )}
    </div>

    {/* ✅ APPROVE + REJECT RESTORED */}
    {!isFromResidents && !isStaff && (
      <div className="flex gap-3">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded-lg"
          onClick={() => approveResident(selectedReport[6])}
        >
          Approve
        </button>

        <button
          className="bg-red-500 text-white px-4 py-2 rounded-lg"
          onClick={() => {
            setRejectData({ ...rejectData, email: editedData.email });
            setIsRejectOpen(true);
          }}
        >
          Reject / Resubmit
        </button>
      </div>
    )}

    {/* ✅ SAVE BUTTON RESTORED */}
    {isFromResidents && isAnyEditing && (
      <button
        onClick={saveChanges}
        className="bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        Save Changes
      </button>
    )}

  </div>
</div>

    )

  )}
</Modal>

<Modal
  isOpen={isRejectOpen}
  onClose={() => setIsRejectOpen(false)}
  title="Reject / Request Resubmission"
>
  <div className="space-y-4">

    <div>
      <label className="text-sm text-gray-600">Email</label>
      <input
        value={rejectData.email}
        readOnly
        onChange={(e) =>
          setRejectData({ ...rejectData, email: e.target.value })
        }
        className="w-full h-[45px] border px-3 rounded"
      />
    </div>

    <div>
      <label className="text-sm text-gray-600">Message</label>
      <textarea
        value={rejectData.message}
        onChange={(e) =>
          setRejectData({ ...rejectData, message: e.target.value })
        }
        className="w-full border px-3 py-2 rounded"
      />
    </div>

    <button
      onClick={sendReject}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg"
    >
      Send
    </button>

  </div>
</Modal>

<Modal
  isOpen={isCreateModalOpen}
  onClose={() => setIsCreateModalOpen(false)}
  title="Create Staff / Admin"
>
  <div className="space-y-4">

    <input
      name="firstname"
      placeholder="First Name"
      value={newStaff.firstname}
      onChange={handleChange}
      className="w-full h-[45px] border px-3 rounded"
    />

    <input
      name="lastname"
      placeholder="Last Name"
      value={newStaff.lastname}
      onChange={handleChange}
      className="w-full h-[45px] border px-3 rounded"
    />

    <input
      name="email"
      placeholder="Email"
      value={newStaff.email}
      onChange={handleChange}
      className="w-full h-[45px] border px-3 rounded"
    />

    <input
      name="phone"
      placeholder="Contact Number"
      value={newStaff.phone}
      onChange={handleChange}
      className="w-full h-[45px] border px-3 rounded"
    />

    {/* ROLE DROPDOWN */}
    <select
      name="role"
      value={newStaff.role}
      onChange={handleChange}
      className="w-full h-[45px] border px-3 rounded"
    >
      <option value="">Select Role</option>
      {roles.map((r, i) => (
        <option key={i} value={r.name}>
          {r.name}
        </option>
      ))}
    </select>

    {/* PERMISSIONS PREVIEW */}
    <div className="text-sm text-gray-600">
      Permissions:
      <div className="mt-2 flex flex-wrap gap-2">
        {roles
          .find(r => r.name === newStaff.role)
          ?.permissions?.map((p, i) => (
            <span key={i} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs">
              {p}
            </span>
          )) || <span className="text-gray-400">No permissions</span>}
      </div>
    </div>

    <button
      onClick={createStaff}
      className="bg-blue-600 text-white px-4 py-2 rounded-lg w-full"
    >
      Create
    </button>

  </div>
</Modal>
    </>
  );
}

export default User;