import Header from "../components/Header";
import SideNav from "../components/navi";
import { useState, useEffect } from "react";
import profileDefault from "../assets/profile.png";
import { uploadToCloudinary } from "../utils/cloudinary";

function Settings() {

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
current:"",
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

const fetchUser = async ()=>{

const res = await fetch(`http://localhost:5000/resident/${uid}`);
const data = await res.json();

setUser(data);

};

fetchUser();

},[]);



/* PASSWORD STRENGTH */

const checkStrength=(value)=>{

if(value.length < 6){
setPasswordStrength("Weak");
}
else if(value.match(/[A-Z]/) && value.match(/[0-9]/)){
setPasswordStrength("Strong");
}
else{
setPasswordStrength("Medium");
}

};



/* PROFILE IMAGE UPLOAD */

const handleImageUpload = async (e) => {

const file = e.target.files[0];

if(!file) return;

const imageUrl = await uploadToCloudinary(file);

if(imageUrl){

setUser({
...user,
profileImage:imageUrl
});

}

};



/* UPDATE ACCOUNT */

const updateAccount = async ()=>{

await fetch(`http://localhost:5000/update-account/${uid}`,{

method:"PUT",

headers:{
"Content-Type":"application/json"
},

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

await fetch(`http://localhost:5000/update-password/${uid}`,{

method:"PUT",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify(password)

});

alert("Password updated");

};



/* DELETE ACCOUNT */

const confirmDelete = async ()=>{

await fetch(`http://localhost:5000/delete-account/${uid}`,{
method:"DELETE"
});

localStorage.clear();
window.location.href="/login";

};



/* UI COMPONENTS */

const SectionTitle=({title})=>(
<h3 className="text-xs uppercase text-gray-500 tracking-wider mt-8 mb-2">
{title}
</h3>
);


const SettingItem=({label,action,danger})=>(

<div
onClick={action}
className={`flex justify-between items-center px-5 py-4 rounded-xl cursor-pointer transition
${danger ? "hover:bg-red-50" : "hover:bg-blue-50"}`}
>

<span className={`${danger ? "text-red-500":"text-gray-700"} font-medium text-sm`}>
{label}
</span>

<span className="text-gray-400 text-lg">›</span>

</div>

);


/* MODAL */

const Modal=({title,children})=>(

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">

<div className="bg-white w-full max-w-lg max-h-[90vh] rounded-2xl shadow-xl flex flex-col">

<div className="flex justify-between items-center px-6 py-4 border-b">

<h2 className="text-lg font-semibold text-gray-800">
{title}
</h2>

<button
onClick={()=>setModal(null)}
className="text-gray-400 text-lg"
>
✕
</button>

</div>

<div className="overflow-y-auto px-6 py-4">

{children}

</div>

</div>

</div>

);



return(
<>

<Header/>
<SideNav open={open} setOpen={setOpen}/>

<div className="md:ml-[260px] bg-gray-50 min-h-screen px-6 py-8">

{/* MOBILE HAMBURGER */}
<div className="md:hidden mb-4">
<button
onClick={() => setOpen(true)}
className="text-2xl text-[#007CCF]"
>
☰
</button>
</div>

<div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-6">


<SectionTitle title="Account"/>

<SettingItem
label="Account Information"
action={()=>setModal("account")}
/>


<SectionTitle title="Notifications"/>

<SettingItem
label="Notification Settings"
action={()=>setModal("notifications")}
/>


<SectionTitle title="Support"/>

<SettingItem
label="Help & Support"
action={()=>setModal("support")}
/>


<SectionTitle title="Privacy"/>

<SettingItem
label="Privacy & Security"
action={()=>setModal("privacy")}
/>

<SettingItem
label="Delete Account"
danger
action={()=>setModal("delete")}
/>


<SectionTitle title="About"/>

<SettingItem
label="About Connecta"
action={()=>setModal("about")}
/>

</div>

</div>



{/* ACCOUNT MODAL */}

{modal==="account" && (

<Modal title="Account Information">

<div className="flex items-center gap-4 mb-6">

<label className="cursor-pointer">

<img
src={user.profileImage || profileDefault}
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

<h3 className="font-semibold">
Change Password
</h3>

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

</Modal>

)}



{/* DELETE ACCOUNT */}

{modal==="delete" && (

<Modal title="Delete Account">

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

</Modal>

)}

</>
);
}

export default Settings;