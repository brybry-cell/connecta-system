import Header from "../components/Header";
import SideNav from "../components/navi";
import Modal from "../components/modal";
import { useState, useEffect } from "react";
import profileDefault from "../assets/profile.png";
import { uploadToCloudinary } from "../utils/cloudinary";


function Settings(){

const uid = localStorage.getItem("uid");

const [open,setOpen] = useState(false);
const [modal,setModal] = useState(null);

const [user,setUser] = useState({
firstname:"",
lastname:"",
email:"",
contact:"",
address:"",
proofOfResidency:"",
profileImage:""
});

const [password,setPassword] = useState({
newpass:"",
confirm:""
});

const [passwordStrength,setPasswordStrength] = useState("");

const [notifications,setNotifications] = useState({
reportUpdates:true,
announcements:true,
email:false
});


/* FETCH USER */

useEffect(()=>{

const fetchUser = async()=>{

const res = await fetch(`https://connecta-backend-u4tw.onrender.com/resident/${uid}`);
const data = await res.json();

setUser(data);

};

fetchUser();

},[]);



/* PASSWORD STRENGTH */

const checkStrength=(value)=>{

if(value.length<6){
setPasswordStrength("Weak");
}
else if(value.match(/[A-Z]/)&&value.match(/[0-9]/)){
setPasswordStrength("Strong");
}
else{
setPasswordStrength("Medium");
}

};



/* PROFILE UPLOAD */

const handleImageUpload=async(e)=>{

const file=e.target.files[0];
if(!file)return;

const url=await uploadToCloudinary(file);

if(url){
setUser({...user,profileImage:url});
}

};



/* UPDATE ACCOUNT */

const updateAccount=async()=>{

await fetch(`https://connecta-backend-u4tw.onrender.com/update-account/${uid}`,{

method:"PUT",
headers:{"Content-Type":"application/json"},

body:JSON.stringify({

firstname:user.firstname,
lastname:user.lastname,
email:user.email,
contact:user.contact,
address:user.address,
profileImage:user.profileImage

})

});

alert("Account updated successfully");

};



/* UPDATE PASSWORD */

const updatePassword = async ()=>{

if(password.newpass !== password.confirm){
alert("Passwords do not match");
return;
}

await fetch(`https://connecta-backend-u4tw.onrender.com/update-password/${uid}`,{

method:"PUT",
headers:{"Content-Type":"application/json"},
body:JSON.stringify(password)

});

alert("Password updated");

};



/* DELETE ACCOUNT */

const confirmDelete=async()=>{

await fetch(`https://connecta-backend-u4tw.onrender.com/delete-account/${uid}`,{
method:"DELETE"
});

localStorage.clear();
window.location.href="/login";

};



/* SETTINGS ITEM */

const SettingItem=({label,onClick,danger})=>(

<div
onClick={onClick}
className={`flex justify-between items-center px-5 py-4 rounded-xl cursor-pointer transition
${danger?"hover:bg-red-50":"hover:bg-blue-50"}`}
>

<span className={`${danger?"text-red-500":"text-gray-700"} font-medium text-sm`}>
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

      // HELP SUPPORT
      const helpRes = await fetch("https://connecta-backend-u4tw.onrender.com/admin/settings/help_support");
      const help = await helpRes.json();
      setHelpData(help?.sections || []);

      // PRIVACY
      const privacyRes = await fetch("https://connecta-backend-u4tw.onrender.com/admin/settings/privacy");
      const privacy = await privacyRes.json();
      setPrivacyData(privacy?.content || "");

      // ABOUT
      const aboutRes = await fetch("https://connecta-backend-u4tw.onrender.com/admin/settings/about");
      const about = await aboutRes.json();
      setAboutData(about?.content || "");

    } catch (err) {
      console.error(err);
    }
  };

  fetchSystemSettings();

}, []);

return(

<>

<Header/>
<SideNav open={open} setOpen={setOpen}/>

<div className="md:ml-[260px] bg-gray-50 min-h-screen">

{/* ================= MOBILE VIEW ================= */}

<div className="md:hidden px-6 py-6">

<button
onClick={()=>setOpen(true)}
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

<div className="bg-white rounded-2xl shadow-lg border p-6">

<h3 className="text-xs uppercase text-gray-500 mb-2">Account</h3>

<SettingItem
label="Account Information"
onClick={()=>setModal("account")}
/>

<h3 className="text-xs uppercase text-gray-500 mt-6 mb-2">Notifications</h3>

<SettingItem
label="Notification Settings"
onClick={()=>setModal("notifications")}
/>

<h3 className="text-xs uppercase text-gray-500 mt-6 mb-2">Support</h3>

<SettingItem
label="Help & Support"
onClick={()=>setModal("support")}
/>

<h3 className="text-xs uppercase text-gray-500 mt-6 mb-2">Privacy</h3>

<SettingItem
label="Privacy & Security"
onClick={()=>setModal("privacy")}
/>

<SettingItem
label="Delete Account"
danger
onClick={()=>setModal("delete")}
/>

<h3 className="text-xs uppercase text-gray-500 mt-6 mb-2">About</h3>

<SettingItem
label="About Connecta"
onClick={()=>setModal("about")}
/>

</div>

</div>



{/* ================= DESKTOP VIEW ================= */}

<div className="hidden md:block px-6 py-7">

  <h2 className="text-3xl font-bold text-[#007CCF] mb-6">
    Settings
  </h2>

  <div className="max-w-5xl mx-auto space-y-6">

    {/* ACCOUNT */}
    <div className="bg-white rounded-2xl shadow-md border p-5">
      <p className="text-xs font-semibold text-gray-400 mb-3">
        ACCOUNT
      </p>

      <SettingItem label="Account Information" onClick={()=>setModal("account")} />
    </div>

    {/* SUPPORT */}
    <div className="bg-white rounded-2xl shadow-md border p-5">
      <p className="text-xs font-semibold text-gray-400 mb-3">
        SUPPORT
      </p>

      <SettingItem label="Help & Support" onClick={()=>setModal("support")} />
    </div>

    {/* PRIVACY */}
    <div className="bg-white rounded-2xl shadow-md border p-5">
      <p className="text-xs font-semibold text-gray-400 mb-3">
        PRIVACY
      </p>

      <SettingItem label="Privacy & Security" onClick={()=>setModal("privacy")} />

      <div className="mt-2">
        <SettingItem label="Delete Account" danger onClick={()=>setModal("delete")} />
      </div>
    </div>

    {/* ABOUT */}
    <div className="bg-white rounded-2xl shadow-md border p-5">
      <p className="text-xs font-semibold text-gray-400 mb-3">
        ABOUT
      </p>

      <SettingItem label="About Connecta" onClick={()=>setModal("about")} />
    </div>

  </div>

</div>

</div>



{/* ================= CENTRALIZED MODAL ================= */}

<Modal
  isOpen={modal !== null}
  onClose={()=>setModal(null)}
  size="xl" // 🔥 THIS IS THE KEY
  title={
    modal==="account"?"Account Information":
    modal==="notifications"?"Notification Settings":
    modal==="support"?"Help & Support":
    modal==="privacy"?"Privacy & Security":
    modal==="delete"?"Delete Account":
    modal==="about"?"About Connecta":
    "Settings"
  }
>

{/* ACCOUNT */}

{modal==="account" && (

<div>

<div className="flex items-center gap-4 mb-6">

<label className="cursor-pointer">

<img
src={user.profileImage||profileDefault}
className="w-20 h-20 rounded-full object-cover border"
/>

<input
type="file"
accept="image/*"
onChange={handleImageUpload}
className="hidden"
/>

</label>

<div>

<p className="font-semibold">
{user.firstname} {user.lastname}
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
onChange={(e)=>setUser({...user,firstname:e.target.value})}
placeholder="First Name"
className="border rounded-lg px-3 py-2"
/>

<input
value={user.lastname}
onChange={(e)=>setUser({...user,lastname:e.target.value})}
placeholder="Last Name"
className="border rounded-lg px-3 py-2"
/>

</div>

<input
value={user.email}
onChange={(e)=>setUser({...user,email:e.target.value})}
placeholder="Email"
className="border rounded-lg px-3 py-2 w-full"
/>

<input
value={user.contact}
onChange={(e)=>setUser({...user,contact:e.target.value})}
placeholder="Contact"
className="border rounded-lg px-3 py-2 w-full"
/>

<input
value={user.address}
onChange={(e)=>setUser({...user,address:e.target.value})}
placeholder="Address"
className="border rounded-lg px-3 py-2 w-full"
/>

<button
onClick={()=>window.open(user.proofOfResidency)}
className="text-[#007CCF] text-sm hover:underline"
>
View Proof of Residency
</button>

<button
onClick={updateAccount}
className="w-full bg-[#007CCF] text-white py-2 rounded-lg"
>
Update Account
</button>

<hr/>

<h3 className="font-semibold">Change Password</h3>

<input
type="password"
placeholder="New Password"
value={password.newpass}
onChange={(e)=>{
setPassword({...password,newpass:e.target.value});
checkStrength(e.target.value);
}}
className="border rounded-lg px-3 py-2 w-full"
/>

<p className="text-xs">
Password Strength: {passwordStrength}
</p>

<input
type="password"
placeholder="Confirm Password"
value={password.confirm}
onChange={(e)=>setPassword({...password,confirm:e.target.value})}
className="border rounded-lg px-3 py-2 w-full"
/>

<button
onClick={updatePassword}
className="w-full bg-green-600 text-white py-2 rounded-lg"
>
Update Password
</button>

</div>

</div>

)}



{/* DELETE */}

{modal==="delete" && (

<div>

<p className="text-sm mb-6">
Are you sure you want to delete your account?
</p>

<div className="flex gap-3">

<button
onClick={()=>setModal(null)}
className="flex-1 border rounded-lg py-2"
>
Cancel
</button>

<button
onClick={confirmDelete}
className="flex-1 bg-red-600 text-white rounded-lg py-2"
>
Delete
</button>

</div>

</div>

)}

{modal==="support" && (

<div className="space-y-6 max-h-[70vh] overflow-y-auto">

  {helpData.map((section, sIndex) => (

    <div key={sIndex} className="space-y-3">

      {/* DESCRIPTION */}
      {section.description && (
        <p className="text-sm text-gray-600">
          {section.description}
        </p>
      )}

      {/* QUESTIONS */}
      {(section.questions || []).map((q, qIndex) => (

        <div key={qIndex} className="border rounded-lg p-3">

          {/* QUESTION */}
          <button
            onClick={() => {
              const updated = [...helpData];
              updated[sIndex].questions[qIndex].open =
                !updated[sIndex].questions[qIndex].open;
              setHelpData(updated);
            }}
            className="w-full text-left font-medium text-gray-700"
          >
            {q.question}
          </button>

          {/* ANSWER */}
          {q.open && (
            <p className="text-sm text-gray-600 mt-2">
              {q.answer}
            </p>
          )}

        </div>

      ))}

    </div>

  ))}

</div>

)}

{modal==="privacy" && (

<div className="max-h-[70vh] overflow-y-auto">
  <p className="text-sm text-gray-700 whitespace-pre-line">
    {privacyData || "No data available"}
  </p>
</div>

)}

{modal==="about" && (

<div className="max-h-[70vh] overflow-y-auto">
  <p className="text-sm text-gray-700 whitespace-pre-line">
    {aboutData || "No data available"}
  </p>
</div>

)}


</Modal>


</>

);

}

export default Settings;