import { useState, useRef, useEffect } from "react";
import Header from "../components/header";
import SideNavi from "../components/navi";
import Table from "../components/table";
import Search from "../components/search";
import { uploadToCloudinary } from "../utils/cloudinary";

import editIcon from "../assets/edit.png";
import deleteIcon from "../assets/delete.png";

function News() {

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [posts, setPosts] = useState([]);
  const [previewPost, setPreviewPost] = useState(null);
  const [scheduleModal, setScheduleModal] = useState(false);

  const editorRef = useRef(null);

  /* FORM VALUES */
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [media, setMedia] = useState([]);

  const [editPostId, setEditPostId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  /* SCHEDULE VALUES */
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");

  /* LOADING STATES */
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [deleteLoading, setDeleteLoading] = useState(null);
  const [mediaUploadLoading, setMediaUploadLoading] = useState(false);
  
  /* ERROR STATES */
  const [error, setError] = useState("");
  const [formErrors, setFormErrors] = useState({
    title: "",
    category: "",
    description: "",
    media: ""
  });
  
  /* SUCCESS STATES */
  const [successMessage, setSuccessMessage] = useState("");

  const API_URL = "https://connecta-backend-u4tw.onrender.com";

  /* LOAD CURRENT USER */
  useEffect(() => {
    const uid = localStorage.getItem("uid") || 
                localStorage.getItem("userUID") || 
                localStorage.getItem("adminUID") ||
                localStorage.getItem("userId");
    
    const userName = localStorage.getItem("userName") || 
                     localStorage.getItem("adminName") ||
                     localStorage.getItem("name");
    
    const userRole = localStorage.getItem("userRole") || 
                     localStorage.getItem("adminRole") ||
                     localStorage.getItem("role");
    
    console.log("Current user ID:", uid);
    console.log("Current user role:", userRole);
    
    if (uid) {
      setCurrentUser({
        uid: uid,
        name: userName || "Admin",
        role: userRole || "admin"
      });
    } else {
      console.warn("No user ID found in localStorage");
      setError("Please log in to manage news posts");
    }
  }, []);

  /* LOAD POSTS */
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setFetchLoading(true);
    setError("");
    
    try {
      const res = await fetch(`${API_URL}/admin/news`);
      
      if (!res.ok) {
        throw new Error(`Failed to fetch posts: ${res.status}`);
      }
      
      const data = await res.json();
      
      const sortedPosts = data.sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      
      console.log(`📰 Loaded ${sortedPosts.length} posts`);
      setPosts(sortedPosts);
      
    } catch (err) {
      console.error("Error fetching posts:", err);
      setError("Failed to load news posts. Please refresh the page or try again later.");
    } finally {
      setFetchLoading(false);
    }
  };

  /* VALIDATE FORM */
  const validateForm = () => {
    let isValid = true;
    const newErrors = { title: "", category: "", description: "", media: "" };
    
    if (!title.trim()) {
      newErrors.title = "Title is required";
      isValid = false;
    } else if (title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
      isValid = false;
    }
    
    if (!category || category === "Select Category") {
      newErrors.category = "Please select a category";
      isValid = false;
    }
    
    if (!description || description.trim() === "" || description === "<br>") {
      newErrors.description = "Description is required";
      isValid = false;
    } else if (description.replace(/<[^>]*>/g, '').trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
      isValid = false;
    }
    
    setFormErrors(newErrors);
    return isValid;
  };

  /* CHECK IF USER CAN EDIT/DELETE POST */
  const canModifyPost = (post) => {
    if (!currentUser) return false;
    return post.adminUID === currentUser.uid || currentUser.role === "admin" || currentUser.role === "superadmin";
  };

  /* DRAG DROP MEDIA */
  const dropUpload = (e) => {
    e.preventDefault();
    const files = [...e.dataTransfer.files];
    const validFiles = files.filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'));
    
    if (validFiles.length !== files.length) {
      setFormErrors({ ...formErrors, media: "Only image and video files are allowed" });
      setTimeout(() => setFormErrors({ ...formErrors, media: "" }), 3000);
    }
    
    if (media.length + validFiles.length > 3) {
      setFormErrors({ ...formErrors, media: "Maximum 3 files allowed" });
      setTimeout(() => setFormErrors({ ...formErrors, media: "" }), 3000);
      return;
    }
    
    setMedia([...media, ...validFiles].slice(0, 3));
    setFormErrors({ ...formErrors, media: "" });
  };

  /* INPUT MEDIA */
  const uploadMedia = (e) => {
    const files = [...e.target.files];
    const validFiles = files.filter(file => file.type.startsWith('image/') || file.type.startsWith('video/'));
    
    if (validFiles.length !== files.length) {
      setFormErrors({ ...formErrors, media: "Only image and video files are allowed" });
      setTimeout(() => setFormErrors({ ...formErrors, media: "" }), 3000);
    }
    
    if (media.length + validFiles.length > 3) {
      setFormErrors({ ...formErrors, media: "Maximum 3 files allowed" });
      setTimeout(() => setFormErrors({ ...formErrors, media: "" }), 3000);
      return;
    }
    
    setMedia([...media, ...validFiles].slice(0, 3));
    setFormErrors({ ...formErrors, media: "" });
  };

  /* REMOVE MEDIA */
  const removeMedia = (index) => {
    setMedia(media.filter((_, i) => i !== index));
  };

  /* EDIT POST */
  const editPost = (row) => {
    const post = posts[row[6].index];
    
    if (!canModifyPost(post)) {
      setError("You don't have permission to edit this post");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    setTitle(post.title);
    setCategory(post.category);
    setDescription(post.description);
    setMedia(post.media || []);
    setEditPostId(post.id);
    
    if (editorRef.current) {
      editorRef.current.innerHTML = post.description;
    }
    
    setError("");
    setSuccessMessage("");
  };

  /* DELETE POST */
  const deletePost = async (row) => {
    const post = posts[row[6].index];
    
    if (!canModifyPost(post)) {
      setError("You don't have permission to delete this post");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    if (!window.confirm(`Are you sure you want to delete "${post.title}"? This action cannot be undone.`)) {
      return;
    }
    
    setDeleteLoading(post.id);
    setError("");
    
    try {
      const res = await fetch(`${API_URL}/admin/news/${post.id}`, {
        method: "DELETE"
      });
      
      if (!res.ok) {
        throw new Error(`Failed to delete post: ${res.status}`);
      }
      
      await fetchPosts();
      setSuccessMessage("Post deleted successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      console.error("Error deleting post:", err);
      setError("Failed to delete post. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setDeleteLoading(null);
    }
  };

  /* UPLOAD MEDIA TO CLOUDINARY */
  const uploadMediaFiles = async () => {
    if (media.length === 0) {
      return [];
    }
    
    setMediaUploadLoading(true);
    const mediaUrls = [];
    
    try {
      for (let i = 0; i < media.length; i++) {
        const file = media[i];
        
        if (typeof file === "string") {
          mediaUrls.push(file);
        } else {
          const url = await uploadToCloudinary(file);
          if (url) {
            mediaUrls.push(url);
          } else {
            throw new Error(`Failed to upload file ${i + 1}`);
          }
        }
      }
      
      return mediaUrls;
    } catch (err) {
      console.error("Error uploading media:", err);
      setError(`Failed to upload media: ${err.message}`);
      throw err;
    } finally {
      setMediaUploadLoading(false);
    }
  };

  /* GET CURRENT USER ID */
  const getCurrentUserId = () => {
    return localStorage.getItem("uid") || 
           localStorage.getItem("userUID") || 
           localStorage.getItem("adminUID") ||
           localStorage.getItem("userId");
  };

  /* PUBLISH POST */
  const publishPost = async () => {
    if (loading) return;
    
    if (!validateForm()) {
      setError("Please fill in all required fields");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccessMessage("");
    
    try {
      const adminUID = getCurrentUserId();
      
      if (!adminUID) {
        throw new Error("User not authenticated. Please log in again.");
      }
      
      console.log("📝 Publishing post with UID:", adminUID);
      
      const mediaUrls = await uploadMediaFiles();
      
      const postData = {
        title,
        category,
        description,
        media: mediaUrls,
        status: "Published",
        schedule: "Now",
        adminUID
      };
      
      let res;
      if (editPostId) {
        res = await fetch(`${API_URL}/admin/news/${editPostId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData)
        });
      } else {
        res = await fetch(`${API_URL}/admin/news`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(postData)
        });
      }
      
      const responseData = await res.json();
      console.log("Server response:", responseData);
      
      if (!res.ok) {
        throw new Error(responseData.error || `Failed to ${editPostId ? 'update' : 'publish'} post`);
      }
      
      clearForm();
      await fetchPosts();
      setSuccessMessage(editPostId ? "Post updated successfully!" : "Post published successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      console.error("Error publishing post:", err);
      setError(err.message || "Failed to publish post. Please try again.");
      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  /* SCHEDULE POST */
  const saveSchedule = async () => {
    if (loading) return;
    
    if (!validateForm()) {
      setError("Please fill in all required fields");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    if (!scheduleDate || !scheduleTime) {
      setError("Please select both date and time for scheduling");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    const scheduleDateTime = new Date(`${scheduleDate}T${scheduleTime}`);
    if (scheduleDateTime <= new Date()) {
      setError("Schedule date and time must be in the future");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccessMessage("");
    
    try {
      const adminUID = getCurrentUserId();
      
      if (!adminUID) {
        throw new Error("User not authenticated. Please log in again.");
      }
      
      const mediaUrls = await uploadMediaFiles();
      
      const postData = {
        title,
        category,
        description,
        media: mediaUrls,
        status: "Scheduled",
        schedule: scheduleDateTime.toISOString(),
        adminUID
      };
      
      const res = await fetch(`${API_URL}/admin/news`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(postData)
      });
      
      if (!res.ok) {
        const errorData = await res.text();
        console.error("Server response:", errorData);
        throw new Error("Failed to schedule post");
      }
      
      clearForm();
      setScheduleModal(false);
      setScheduleDate("");
      setScheduleTime("");
      await fetchPosts();
      setSuccessMessage("Post scheduled successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      console.error("Error scheduling post:", err);
      setError(err.message || "Failed to schedule post. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* CLEAR FORM */
  const clearForm = () => {
    setTitle("");
    setCategory("");
    setDescription("");
    setMedia([]);
    setEditPostId(null);
    setFormErrors({ title: "", category: "", description: "", media: "" });
    
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
  };

  /* TABLE */
  const columns = [
    "Date",
    "Category",
    "Title",
    "Status",
    "Posted By",
    "Action"
  ];

  const [openDateFilter, setOpenDateFilter] = useState(false);
  const [dateRange, setDateRange] = useState({ from: "", to: "" });

  const filteredPosts = posts.filter((p) => {
    const matchSearch =
      p.title?.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.toLowerCase().includes(search.toLowerCase());
    
    const postDate = new Date(p.createdAt);
    const from = dateRange.from ? new Date(dateRange.from) : null;
    const to = dateRange.to ? new Date(dateRange.to) : null;
    
    let matchDate = true;
    if (from && postDate < from) matchDate = false;
    if (to && postDate > to) matchDate = false;
    
    return matchSearch && matchDate;
  });

  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + rowsPerPage);
  const totalPages = Math.ceil(filteredPosts.length / rowsPerPage);
  const tableData = paginatedPosts.map((p, i) => [
    p.createdAt ? new Date(p.createdAt).toLocaleDateString() : "N/A",
    p.category,
    p.title,
    p.status,
    p.postedBy || "Admin",
    p.schedule,
    { index: startIndex + i }
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, dateRange]);

  return (
    <>
      <Header />
      <SideNavi open={open} setOpen={setOpen} />

      <div className="md:ml-[260px] bg-gray-50 min-h-screen px-6 py-8">
        <h1 className="text-3xl font-bold text-[#007CCF] mb-6">News Management</h1>

        {successMessage && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-700 text-sm text-center animate-fadeIn">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-700 text-sm text-center animate-shake">
            {error}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2"></div>
          <div className="relative w-full max-w-md">
            <Search value={search} onChange={(e) => setSearch(e.target.value)} />
            {openDateFilter && (
              <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow p-4 z-50 w-64">
                <p className="text-sm font-semibold mb-2">Filter by Date</p>
                <input
                  type="date"
                  value={dateRange.from}
                  onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                  className="w-full border rounded px-2 py-1 mb-2 focus:ring-2 focus:ring-[#007CCF] outline-none"
                />
                <input
                  type="date"
                  value={dateRange.to}
                  onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                  className="w-full border rounded px-2 py-1 mb-3 focus:ring-2 focus:ring-[#007CCF] outline-none"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setOpenDateFilter(false)} className="px-3 py-1 bg-gray-200 rounded text-sm">
                    Cancel
                  </button>
                  <button onClick={() => setOpenDateFilter(false)} className="px-3 py-1 bg-[#007CCF] text-white rounded text-sm">
                    Apply
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* MAIN GRID - Keep all existing JSX */}
        {/* CREATE POST CARD */}
        <div className="grid lg:grid-cols-3 gap-6 mb-10">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-md border border-gray-100 p-6">
            <h2 className="font-semibold text-gray-700 mb-6">
              {editPostId ? "Edit Post" : "Create Barangay Post"}
            </h2>

            {/* CATEGORY + TITLE */}
            <div className="grid md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="text-sm text-gray-600">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className={`w-full border ${formErrors.category ? 'border-red-500' : 'border-gray-200'} rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#007CCF] outline-none transition-all`}
                >
                  <option>Select Category</option>
                  <option>Event</option>
                  <option>Advisory</option>
                  <option>Announcement</option>
                  <option>Emergency</option>
                </select>
                {formErrors.category && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="text-sm text-gray-600">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full border ${formErrors.title ? 'border-red-500' : 'border-gray-200'} rounded-lg px-3 py-2 mt-1 focus:ring-2 focus:ring-[#007CCF] outline-none transition-all`}
                />
                {formErrors.title && (
                  <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>
                )}
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="mb-4">
              <label className="text-sm text-gray-600 mb-2 block">Description *</label>
              <div className={`border rounded-xl ${formErrors.description ? 'border-red-500' : 'border-gray-200'} focus-within:ring-2 focus-within:ring-[#007CCF] focus-within:border-transparent transition-all`}>
                <div
                  ref={editorRef}
                  contentEditable
                  className="min-h-[140px] p-3 text-sm outline-none"
                  onInput={(e) => {
                    let html = e.currentTarget.innerHTML;
                    const urlRegex = /(https?:\/\/[^\s]+)/g;
                    html = html.replace(urlRegex, (url) => {
                      return `<a href="${url}" target="_blank" class="text-blue-500 underline">${url}</a>`;
                    });
                    setDescription(html);
                  }}
                  placeholder="Write your post description here..."
                />
              </div>
              {formErrors.description && (
                <p className="text-red-500 text-xs mt-1">{formErrors.description}</p>
              )}
            </div>

            {/* MEDIA UPLOAD */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={dropUpload}
              className={`mb-4 border-2 border-dashed ${formErrors.media ? 'border-red-500' : 'border-gray-300'} rounded-xl p-6 text-center hover:border-[#007CCF] transition`}
            >
              <p className="text-gray-500">Drag & Drop media or click to upload</p>
              <input
                type="file"
                multiple
                accept="image/*,video/*"
                onChange={uploadMedia}
                className="mt-2"
                disabled={mediaUploadLoading}
              />
              {mediaUploadLoading && (
                <div className="mt-2 text-sm text-blue-500">Uploading media...</div>
              )}
              {formErrors.media && (
                <p className="text-red-500 text-xs mt-2">{formErrors.media}</p>
              )}
            </div>

            {/* MEDIA PREVIEW */}
            {media.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-4">
                {media.map((file, i) => {
                  const src = typeof file === "string" ? file : URL.createObjectURL(file);
                  return (
                    <div key={i} className="relative">
                      <img src={src} className="rounded-lg object-cover h-24 w-full" alt={`Preview ${i + 1}`} />
                      <button
                        onClick={() => removeMedia(i)}
                        className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white text-xs px-2 rounded"
                      >
                        x
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setScheduleModal(true)}
                disabled={loading || !title.trim() || !category || category === "Select Category" || !description || description === "<br>" || description.trim() === ""}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Schedule
              </button>
              <button
                onClick={publishPost}
                disabled={loading || !title.trim() || !category || category === "Select Category" || !description || description === "<br>" || description.trim() === ""}
                className="px-4 py-2 bg-[#007CCF] hover:bg-[#005fa3] text-white rounded-xl text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
              >
                {loading && <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                {loading ? (editPostId ? "Updating..." : "Publishing...") : (editPostId ? "Update" : "Publish")}
              </button>
            </div>
          </div>

          {/* RECENT POSTS */}
          <div>
            <h2 className="font-semibold text-gray-700 mb-4">Recent Posts</h2>
            <div className="space-y-4">
              {fetchLoading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#007CCF]"></div>
                  <p className="text-gray-500 mt-2">Loading posts...</p>
                </div>
              ) : posts.slice(0, 3).map((p, i) => (
                <div
                  key={i}
                  onClick={() => setPreviewPost(p)}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md transition p-4 border border-gray-100 cursor-pointer"
                >
                  {p.media?.[0] && (
                    <img src={p.media[0]} className="w-full h-32 object-cover rounded-lg mb-2" alt={p.title} />
                  )}
                  <p className="font-semibold text-sm">{p.title}</p>
                  <p className="text-xs text-gray-500">{p.description?.substring(0, 60)}...</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* TABLE */}
        {fetchLoading ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#007CCF]"></div>
            <p className="text-gray-500 mt-2">Loading posts...</p>
          </div>
        ) : (
          <>
            <Table
              columns={columns}
              data={tableData}
              onEdit={editPost}
              onDelete={deletePost}
              onRowClick={(row) => setPreviewPost(posts[row[6].index])}
              editIcon={editIcon}
              deleteIcon={deleteIcon}
              deleteLoading={deleteLoading}
            />
            <div className="flex justify-center items-center gap-4 mt-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  currentPage === 1
                    ? "bg-blue-400 opacity-50 text-white cursor-not-allowed"
                    : "bg-[#007CCF] text-white hover:bg-[#005fa3]"
                }`}
              >
                ← Prev
              </button>
              <span className="text-sm font-medium">Page {currentPage} of {totalPages || 1}</span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`px-4 py-2 rounded-lg text-sm transition-all ${
                  currentPage === totalPages || totalPages === 0
                    ? "bg-blue-400 opacity-50 text-white cursor-not-allowed"
                    : "bg-[#007CCF] text-white hover:bg-[#005fa3]"
                }`}
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>

      {/* PREVIEW MODAL */}
      {previewPost && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-xl overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4 pt-5 pb-3">
              <h2 className="text-lg font-semibold text-[#007CCF]">Post Preview</h2>
              <button onClick={() => setPreviewPost(null)} className="text-gray-500 hover:text-red-500 text-xl">✕</button>
            </div>
            <div className="p-4 max-h-[80vh] overflow-y-auto space-y-4">
              {previewPost.media?.[0] && (
                <img src={previewPost.media[0]} className="w-full max-h-[320px] object-contain bg-gray-100 rounded-xl" alt={previewPost.title} />
              )}
              <h2 className="font-semibold text-gray-800 text-lg">{previewPost.title}</h2>
              <p className="text-sm text-gray-600">{previewPost.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE MODAL */}
      {scheduleModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-96 overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4">
              <h3 className="font-semibold text-[#007CCF]">Schedule Post</h3>
              <button onClick={() => setScheduleModal(false)} className="text-gray-500 hover:text-red-500">✕</button>
            </div>
            <div className="p-3 space-y-3">
              <div className="p-1 space-y-3">
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="border rounded-lg w-full p-2 focus:ring-2 focus:ring-[#007CCF] outline-none transition-all"
                  min={new Date().toISOString().split('T')[0]}
                />
                <input
                  type="time"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                  className="border rounded-lg w-full p-2 focus:ring-2 focus:ring-[#007CCF] outline-none transition-all"
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setScheduleModal(false)} className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded-md text-sm transition-all">
                    Cancel
                  </button>
                  <button
                    onClick={saveSchedule}
                    disabled={loading}
                    className="px-3 py-1 bg-[#007CCF] hover:bg-[#005fa3] text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                  >
                    {loading && <div className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>}
                    {loading ? "Saving..." : "Save"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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

export default News;