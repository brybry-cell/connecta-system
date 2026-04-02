import Header from "../components/Header";
import SideNav from "../components/navi";
import Modal from "../components/modal";
import { useState, useEffect } from "react";
import profileDefault from "../assets/profile.png";
import { uploadToCloudinary } from "../utils/cloudinary";
import { useLocation } from "react-router-dom";
import hideIcon from "../assets/eye.png";
import unhideIcon from "../assets/not.png";

function Settings() {

  const uid = localStorage.getItem("uid");

  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState({
    fetch: false,
    update: false,
    upload: false,
    password: false,
    delete: false,
    help: false,
    privacy: false,
    about: false,
    notifications: false
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const [user, setUser] = useState({
    firstname: "",
    lastname: "",
    email: "",
    contact: "",
    address: "",
    proofOfResidency: "",
    profileImage: ""
  });

  const [originalUser, setOriginalUser] = useState({
    email: "",
    contact: ""
  });

  const [password, setPassword] = useState({
    newpass: "",
    confirm: ""
  });

  const [showPassword, setShowPassword] = useState({
    newpass: false,
    confirm: false
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [passwordHasChanges, setPasswordHasChanges] = useState(false);

  const [notifications, setNotifications] = useState({
    reports: true,
    news: true
  });

  const [originalNotifications, setOriginalNotifications] = useState({
    reports: true,
    news: true
  });

  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const modalParam = params.get("modal");

    if (modalParam) {
      setModal(modalParam);
    }
  }, [location.search]);

  /* FETCH USER */
  useEffect(() => {
    const fetchUser = async () => {
      setLoading(prev => ({ ...prev, fetch: true }));
      setError("");
      
      try {
        const res = await fetch(`https://connecta-backend-u4tw.onrender.com/resident/${uid}`);
        
        if (!res.ok) {
          throw new Error(`Failed to fetch user: ${res.status}`);
        }
        
        const data = await res.json();
        setUser(data);
        setOriginalUser({
          email: data.email,
          contact: data.contact
        });

        await fetchNotificationSettings();
        
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user data. Please refresh the page.");
        setTimeout(() => setError(""), 3000);
      } finally {
        setLoading(prev => ({ ...prev, fetch: false }));
      }
    };

    if (uid) {
      fetchUser();
    }
  }, [uid]);

  const fetchNotificationSettings = async () => {
    try {
      const res = await fetch(`https://connecta-backend-u4tw.onrender.com/user/notification-settings/${uid}`);
      
      if (res.ok) {
        const data = await res.json();
        setNotifications({
          reports: data.reports ?? true,
          news: data.news ?? true
        });
        setOriginalNotifications({
          reports: data.reports ?? true,
          news: data.news ?? true
        });
      }
    } catch (err) {
      console.error("Error fetching notification settings:", err);
    }
  };

  const saveNotificationSettings = async () => {
    setLoading(prev => ({ ...prev, notifications: true }));
    setError("");
    
    try {
      const res = await fetch(`https://connecta-backend-u4tw.onrender.com/user/notification-settings/${uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reports: notifications.reports,
          news: notifications.news
        })
      });
      
      if (!res.ok) {
        throw new Error("Failed to save notification settings");
      }
      
      setOriginalNotifications({
        reports: notifications.reports,
        news: notifications.news
      });
      
      setSuccessMessage("Notification settings saved successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      
    } catch (err) {
      console.error("Error saving notification settings:", err);
      setError("Failed to save notification settings. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(prev => ({ ...prev, notifications: false }));
    }
  };

  /* PROFILE UPLOAD */
  const handleImageUpload = async (e) => {
    setLoading(prev => ({ ...prev, upload: true }));
    setError("");
    
    try {
      const file = e.target.files[0];
      if (!file) {
        setLoading(prev => ({ ...prev, upload: false }));
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        setLoading(prev => ({ ...prev, upload: false }));
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError("Only image files are allowed");
        setLoading(prev => ({ ...prev, upload: false }));
        return;
      }

      const url = await uploadToCloudinary(file);

      if (url) {
        const updatedUser = { ...user, profileImage: url };
        setUser(updatedUser);

        const res = await fetch(`https://connecta-backend-u4tw.onrender.com/update-account/${uid}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedUser)
        });
        
        if (!res.ok) {
          throw new Error("Failed to update profile image");
        }
        
        setSuccessMessage("Profile image updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      }
    } catch (err) {
      console.error("Error uploading image:", err);
      setError("Failed to upload profile image. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(prev => ({ ...prev, upload: false }));
    }
  };

  /* UPDATE ACCOUNT */
  const updateAccount = async () => {
    setLoading(prev => ({ ...prev, update: true }));
    setError("");
    
    try {
      const res = await fetch(`https://connecta-backend-u4tw.onrender.com/update-account/${uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          contact: user.contact,
          address: user.address,
          profileImage: user.profileImage
        })
      });
      
      if (!res.ok) {
        throw new Error("Failed to update account");
      }
      
      setSuccessMessage("Account updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setOriginalUser({
        email: user.email,
        contact: user.contact
      });
      setHasChanges(false);
    } catch (err) {
      console.error("Error updating account:", err);
      setError("Failed to update account. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  };

  /* UPDATE PASSWORD */
  const updatePassword = async () => {
    if (password.newpass !== password.confirm) {
      setError("Passwords do not match");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    if (password.newpass.length < 6) {
      setError("Password must be at least 6 characters");
      setTimeout(() => setError(""), 3000);
      return;
    }
    
    setLoading(prev => ({ ...prev, password: true }));
    setError("");
    
    try {
      const res = await fetch(`https://connecta-backend-u4tw.onrender.com/update-password/${uid}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(password)
      });
      
      if (!res.ok) {
        throw new Error("Failed to update password");
      }
      
      setSuccessMessage("Password updated successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
      setPassword({ newpass: "", confirm: "" });
      setPasswordHasChanges(false);
    } catch (err) {
      console.error("Error updating password:", err);
      setError("Failed to update password. Please try again.");
      setTimeout(() => setError(""), 3000);
    } finally {
      setLoading(prev => ({ ...prev, password: false }));
    }
  };

  /* DELETE ACCOUNT */
  const confirmDelete = async () => {
    setLoading(prev => ({ ...prev, delete: true }));
    setError("");
    
    try {
      const res = await fetch(`https://connecta-backend-u4tw.onrender.com/delete-account/${uid}`, {
        method: "DELETE"
      });
      
      if (!res.ok) {
        throw new Error("Failed to delete account");
      }
      
      localStorage.clear();
      window.location.href = "/login";
    } catch (err) {
      console.error("Error deleting account:", err);
      setError("Failed to delete account. Please try again.");
      setTimeout(() => setError(""), 3000);
      setLoading(prev => ({ ...prev, delete: false }));
    }
  };

  /* SETTINGS ITEM */
  const SettingItem = ({ label, onClick, danger }) => (
    <div
      onClick={onClick}
      className={`flex justify-between items-center px-5 py-4 rounded-xl cursor-pointer transition
        ${danger ? "hover:bg-red-50" : "hover:bg-blue-50"}`}
    >
      <span className={`${danger ? "text-red-500" : "text-gray-700"} font-medium text-sm`}>
        {label}
      </span>
      <span className="text-gray-400 text-lg">›</span>
    </div>
  );

  const [helpData, setHelpData] = useState([]);
  const [privacyData, setPrivacyData] = useState("");
  const [aboutData, setAboutData] = useState("");

  useEffect(() => {
    const fetchSystemSettings = async () => {
      try {
        setLoading(prev => ({ ...prev, help: true }));
        const helpRes = await fetch("https://connecta-backend-u4tw.onrender.com/admin/settings/help_support");
        if (helpRes.ok) {
          const help = await helpRes.json();
          setHelpData(help?.sections || []);
        }
        setLoading(prev => ({ ...prev, help: false }));

        setLoading(prev => ({ ...prev, privacy: true }));
        const privacyRes = await fetch("https://connecta-backend-u4tw.onrender.com/admin/settings/privacy");
        if (privacyRes.ok) {
          const privacy = await privacyRes.json();
          setPrivacyData(privacy?.content || "");
        }
        setLoading(prev => ({ ...prev, privacy: false }));

        setLoading(prev => ({ ...prev, about: true }));
        const aboutRes = await fetch("https://connecta-backend-u4tw.onrender.com/admin/settings/about");
        if (aboutRes.ok) {
          const about = await aboutRes.json();
          setAboutData(about?.content || "");
        }
        setLoading(prev => ({ ...prev, about: false }));

      } catch (err) {
        console.error("Error fetching system settings:", err);
        setError("Failed to load help content. Please try again.");
      }
    };

    fetchSystemSettings();
  }, []);

  const capitalize = (str) =>
    str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : "";

  const [editField, setEditField] = useState({
    email: false,
    contact: false
  });

  useEffect(() => {
    setHasChanges(
      user.email !== originalUser.email ||
      user.contact !== originalUser.contact
    );
  }, [user.email, user.contact]);

  useEffect(() => {
    setPasswordHasChanges(password.newpass !== "" || password.confirm !== "");
  }, [password.newpass, password.confirm]);

  if (loading.fetch) {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
          <p className="text-white text-sm tracking-wide">Loading your profile...</p>
        </div>
      </div>
    );
  }

  const notificationsHaveChanges = () => {
    return (
      notifications.reports !== originalNotifications.reports ||
      notifications.news !== originalNotifications.news
    );
  };

  const GlowSwitch = ({ checked, onChange }) => {
    return (
      <label className="relative inline-flex items-center cursor-pointer group">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className={`
          relative w-11 h-6 rounded-full transition-all duration-300 ease-in-out
          ${checked 
            ? 'bg-[#007CCF] shadow-[0_0_12px_rgba(0,124,207,0.8)]' 
            : 'bg-gray-300'
          }
          peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#007CCF] peer-focus:ring-offset-2
          after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
          after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
          ${checked ? 'after:translate-x-5' : 'after:translate-x-0'}
        `}></div>
        {checked && (
          <div className="absolute inset-0 rounded-full animate-pulse opacity-50 bg-[#007CCF] -z-10"></div>
        )}
      </label>
    );
  };

  return (
    <>
      <Header />
      <SideNav open={open} setOpen={setOpen} />

      <div className="md:ml-[260px] bg-gray-50 min-h-screen">

        {successMessage && modal === null && (
          <div className="fixed top-4 right-4 z-50 p-3 bg-green-500/90 border border-green-500 rounded-lg text-white text-sm text-center animate-fadeIn">
            {successMessage}
          </div>
        )}

        {error && modal === null && (
          <div className="fixed top-4 right-4 z-50 p-3 bg-red-500/90 border border-red-500 rounded-lg text-white text-sm text-center animate-shake">
            {error}
          </div>
        )}

        {/* MOBILE VIEW */}
        <div className="md:hidden px-6 py-6">
          <button
            onClick={() => setOpen(true)}
            className="text-2xl text-[#007CCF] mb-4"
          >
            ☰
          </button>

          <h1 className="text-2xl font-bold text-[#007CCF] mb-2">
            Settings
          </h1>

          <p className="text-gray-500 text-sm mb-6">
            Manage your account preferences
          </p>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-xs uppercase text-gray-500 mb-2">Account</h3>
            <SettingItem
              label="Account Information"
              onClick={() => setModal("account")}
            />

            <h3 className="text-xs uppercase text-gray-500 mt-6 mb-2">Notifications</h3>
            <SettingItem
              label="Notification Settings"
              onClick={() => setModal("notifications")}
            />

            <h3 className="text-xs uppercase text-gray-500 mt-6 mb-2">Support</h3>
            <SettingItem
              label="Help & Support"
              onClick={() => setModal("support")}
            />

            <h3 className="text-xs uppercase text-gray-500 mt-6 mb-2">Privacy</h3>
            <SettingItem
              label="Privacy & Security"
              onClick={() => setModal("privacy")}
            />
            <SettingItem
              label="Delete Account"
              danger
              onClick={() => setModal("delete")}
            />

            <h3 className="text-xs uppercase text-gray-500 mt-6 mb-2">About</h3>
            <SettingItem
              label="About Connecta"
              onClick={() => setModal("about")}
            />
          </div>
        </div>

        {/* DESKTOP VIEW */}
        <div className="hidden md:block px-6 py-7">
          <h2 className="text-3xl font-bold text-[#007CCF] mb-6">
            Settings
          </h2>

          <div className="max-w-5xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
              <p className="text-xs font-semibold text-gray-400 mb-3">
                ACCOUNT
              </p>
              <SettingItem label="Account Information" onClick={() => setModal("account")} />
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
              <p className="text-xs font-semibold text-gray-400 mb-3">
                NOTIFICATIONS
              </p>
              <SettingItem label="Notification Settings" onClick={() => setModal("notifications")} />
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
              <p className="text-xs font-semibold text-gray-400 mb-3">
                SUPPORT
              </p>
              <SettingItem label="Help & Support" onClick={() => setModal("support")} />
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
              <p className="text-xs font-semibold text-gray-400 mb-3">
                PRIVACY
              </p>
              <SettingItem label="Privacy & Security" onClick={() => setModal("privacy")} />
              <div className="mt-2">
                <SettingItem label="Delete Account" danger onClick={() => setModal("delete")} />
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-md border border-gray-200 p-5">
              <p className="text-xs font-semibold text-gray-400 mb-3">
                ABOUT
              </p>
              <SettingItem label="About Connecta" onClick={() => setModal("about")} />
            </div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      <Modal
        isOpen={modal !== null}
        onClose={() => {
          setModal(null);
          setEditField({ email: false, contact: false });
          setHasChanges(false);
          setPasswordHasChanges(false);
          setPassword({ newpass: "", confirm: "" });
          if (modal === "notifications") {
            setNotifications(originalNotifications);
          }
        }}
        size="lg"
        title={
          modal === "account" ? "Account Information" :
          modal === "notifications" ? "Notification Settings" :
          modal === "support" ? "Help & Support" :
          modal === "privacy" ? "Privacy & Security" :
          modal === "delete" ? "Delete Account" :
          modal === "about" ? "About Connecta" :
          "Settings"
        }
      >
        {successMessage && modal !== null && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500 rounded-lg text-green-700 text-sm text-center animate-fadeIn">
            {successMessage}
          </div>
        )}

        {error && modal !== null && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded-lg text-red-700 text-sm text-center animate-shake">
            {error}
          </div>
        )}

        {/* NOTIFICATIONS MODAL */}
        {modal === "notifications" && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-blue-800 mb-2">
                Email Notifications
              </h3>
              <p className="text-xs text-blue-600">
                Choose which notifications you want to receive via email.
              </p>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors rounded-lg px-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-800">Reports</h3>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">Status Changes</span>
                </div>
                <p className="text-sm text-gray-500">
                  Receive email notifications when your report status changes.
                </p>
              </div>
              <GlowSwitch
                checked={notifications.reports}
                onChange={(e) => setNotifications({ ...notifications, reports: e.target.checked })}
              />
            </div>

            <div className="flex items-center justify-between py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors rounded-lg px-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium text-gray-800">News & Announcements</h3>
                  <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full">Updates</span>
                </div>
                <p className="text-sm text-gray-500">
                  Receive email notifications when the barangay posts new announcements.
                </p>
              </div>
              <GlowSwitch
                checked={notifications.news}
                onChange={(e) => setNotifications({ ...notifications, news: e.target.checked })}
              />
            </div>

            <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-600">
                <span className="font-semibold">📧 Note:</span> Emails will be sent to: <strong>{user.email}</strong>
              </p>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => setModal(null)}
                className="flex-1 border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={saveNotificationSettings}
                disabled={!notificationsHaveChanges() || loading.notifications}
                className={`flex-1 rounded-lg py-2 flex items-center justify-center gap-2 transition-all
                  ${!notificationsHaveChanges() || loading.notifications
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#007CCF] text-white hover:bg-[#005fa3]"}
                `}
              >
                {loading.notifications && (
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {loading.notifications ? "Saving..." : "Save Settings"}
              </button>
            </div>
          </div>
        )}

        {/* ACCOUNT MODAL - WITH EYE ICONS ON PASSWORD FIELDS */}
        {modal === "account" && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <label className="cursor-pointer relative">
                <img
                  src={user.profileImage || profileDefault}
                  className="w-20 h-20 rounded-full object-cover border border-gray-200"
                  alt="Profile"
                />
                {loading.upload && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  disabled={loading.upload}
                />
              </label>

              <div>
                <p className="font-semibold text-[#007CCF]">
                  {capitalize(user.firstname)} {capitalize(user.lastname)}
                </p>
                <p className="text-xs text-gray-500">
                  Click profile image to change
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={user.firstname}
                  readOnly
                  placeholder="First Name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <input
                  value={user.lastname}
                  readOnly
                  placeholder="Last Name"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                />
              </div>

              <div className="relative">
                <input
                  value={user.email}
                  readOnly={!editField.email}
                  onChange={(e) => {
                    setUser({ ...user, email: e.target.value });
                    setHasChanges(true);
                  }}
                  className={`w-full border border-gray-200 rounded-lg px-3 py-2 pr-14 focus:outline-none focus:ring-2 focus:ring-[#007CCF] focus:border-transparent transition-all
                    ${editField.email
                      ? "bg-white"
                      : "bg-gray-100 text-gray-600 cursor-not-allowed"}
                  `}
                />
                {!editField.email && (
                  <button
                    type="button"
                    onClick={() => setEditField({ ...editField, email: true })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#007CCF] font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>

              <div className="relative">
                <input
                  value={user.contact}
                  readOnly={!editField.contact}
                  onChange={(e) => {
                    setUser({ ...user, contact: e.target.value });
                    setHasChanges(true);
                  }}
                  className={`w-full border border-gray-200 rounded-lg px-3 py-2 pr-14 focus:outline-none focus:ring-2 focus:ring-[#007CCF] focus:border-transparent transition-all
                    ${editField.contact
                      ? "bg-white"
                      : "bg-gray-100 text-gray-600 cursor-not-allowed"}
                  `}
                />
                {!editField.contact && (
                  <button
                    type="button"
                    onClick={() => setEditField({ ...editField, contact: true })}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-[#007CCF] font-medium"
                  >
                    Edit
                  </button>
                )}
              </div>

              <input
                value={user.address}
                readOnly
                placeholder="Address"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
              />



              <button
                onClick={updateAccount}
                disabled={!hasChanges || loading.update}
                className={`w-full py-2 rounded-lg flex justify-center items-center gap-2 transition-all
                  ${!hasChanges || loading.update
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-[#007CCF] text-white hover:bg-[#005fa3]"}
                `}
              >
                {loading.update && (
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {loading.update ? "Updating..." : "Update Account"}
              </button>

              <hr className="border-gray-200" />

              <h3 className="font-semibold">Change Password</h3>

              {/* New Password Field with Eye Icon */}
              <div className="relative">
                <input
                  type={showPassword.newpass ? "text" : "password"}
                  placeholder="New Password"
                  value={password.newpass}
                  onChange={(e) => {
                    setPassword({ ...password, newpass: e.target.value });
                    setPasswordHasChanges(e.target.value !== "" || password.confirm !== "");
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#007CCF] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, newpass: !showPassword.newpass })}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <img
                    src={showPassword.newpass ? hideIcon : unhideIcon}
                    alt="toggle password"
                    className="w-5 h-5 opacity-70 hover:opacity-100"
                  />
                </button>
              </div>

              <p className="text-xs text-gray-500">
                Password must be at least 6 characters
              </p>

              {/* Confirm Password Field with Eye Icon */}
              <div className="relative">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={password.confirm}
                  onChange={(e) => {
                    setPassword({ ...password, confirm: e.target.value });
                    setPasswordHasChanges(password.newpass !== "" || e.target.value !== "");
                  }}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-[#007CCF] focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  <img
                    src={showPassword.confirm ? hideIcon : unhideIcon}
                    alt="toggle password"
                    className="w-5 h-5 opacity-70 hover:opacity-100"
                  />
                </button>
              </div>

              <button
                onClick={updatePassword}
                disabled={!passwordHasChanges || loading.password}
                className={`w-full py-2 rounded-lg flex justify-center items-center gap-2 transition-all
                  ${!passwordHasChanges || loading.password
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-green-600 text-white hover:bg-green-700"}
                `}
              >
                {loading.password && (
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {loading.password ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        )}

        {/* DELETE MODAL */}
        {modal === "delete" && (
          <div className="space-y-5">
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
              <h3 className="text-red-600 font-semibold mb-1">
                Delete Account
              </h3>
              <p className="text-sm text-red-500">
                This action is permanent and cannot be undone.
              </p>
            </div>

            <p className="text-sm text-gray-600">
              If you delete your account:
            </p>

            <ul className="text-sm text-gray-600 list-disc ml-5 space-y-1">
              <li>All your submitted reports will be permanently deleted</li>
              <li>Your account information will be removed</li>
              <li>You will not be able to recover your data</li>
            </ul>

            <p className="text-sm text-gray-600">
              Are you sure you want to continue?
            </p>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setModal(null)}
                className="flex-1 border border-gray-200 rounded-lg py-2 hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading.delete}
                className="flex-1 bg-red-600 text-white rounded-lg py-2 hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2 transition"
              >
                {loading.delete && (
                  <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {loading.delete ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </div>
        )}

        {/* SUPPORT MODAL */}
        {modal === "support" && (
          <div className="max-h-[70vh] overflow-y-auto space-y-6">
            {loading.help ? (
              <div className="flex justify-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#007CCF]"></div>
              </div>
            ) : (
              helpData.map((section, sIndex) => (
                <div key={sIndex}>
                  {section.title && (
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">
                      {section.title}
                    </h3>
                  )}
                  
                  {section.description && (
                    <p className="text-sm text-gray-600 mb-4">
                      {section.description}
                    </p>
                  )}

                  <div className="rounded-xl border border-gray-200 bg-white">
                    {(section.questions || []).map((q, qIndex) => (
                      <div key={qIndex}>
                        <button
                          onClick={() => {
                            const updated = [...helpData];
                            updated[sIndex].questions[qIndex].open =
                              !updated[sIndex].questions[qIndex].open;
                            setHelpData(updated);
                          }}
                          className="w-full flex justify-between items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition"
                        >
                          <span className="font-medium">
                            {q.question}
                          </span>
                          <span className="text-gray-400 text-lg leading-none">
                            {q.open ? "−" : "+"}
                          </span>
                        </button>

                        {q.open && (
                          <div className="px-4 pb-4 text-sm text-gray-600 border-t border-gray-100">
                            {q.answer}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PRIVACY MODAL */}
        {modal === "privacy" && (
          <div className="max-h-[70vh] overflow-y-auto">
            {loading.privacy ? (
              <div className="flex justify-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#007CCF]"></div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {privacyData || "No data available"}
              </p>
            )}
          </div>
        )}

        {/* ABOUT MODAL */}
        {modal === "about" && (
          <div className="max-h-[70vh] overflow-y-auto">
            {loading.about ? (
              <div className="flex justify-center py-8">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#007CCF]"></div>
              </div>
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-line">
                {aboutData || "No data available"}
              </p>
            )}
          </div>
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

export default Settings;