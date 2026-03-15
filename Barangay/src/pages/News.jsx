import { useState, useRef, useEffect } from "react";
import Header from "../components/header";
import SideNavi from "../components/navi";
import Table from "../components/table";
import Search from "../components/search";
import { uploadToCloudinary } from "../utils/cloudinary";

function News(){

const [open,setOpen]=useState(false);
const [search,setSearch]=useState("");
const [posts,setPosts]=useState([]);
const [previewPost,setPreviewPost]=useState(null);
const [scheduleModal,setScheduleModal]=useState(false);

const editorRef=useRef(null);

/* FORM VALUES */
const [title,setTitle]=useState("");
const [category,setCategory]=useState("");
const [description,setDescription]=useState("");
const [media,setMedia]=useState([]);

const [editPostId,setEditPostId]=useState(null);

/* SCHEDULE VALUES */
const [scheduleDate,setScheduleDate]=useState("");
const [scheduleTime,setScheduleTime]=useState("");

/* LOAD POSTS */
useEffect(()=>{
fetchPosts();
},[]);

const fetchPosts = async ()=>{

try{

const res = await fetch("http://localhost:5000/news");
const data = await res.json();

setPosts(data);

}catch(err){
console.error(err);
}

};

/* DRAG DROP MEDIA */
const dropUpload=(e)=>{
e.preventDefault();
const files=[...e.dataTransfer.files];
setMedia([...media,...files].slice(0,3));
};

/* INPUT MEDIA */
const uploadMedia=(e)=>{
const files=[...e.target.files];
setMedia([...media,...files].slice(0,3));
};

/* REMOVE MEDIA */
const removeMedia=(index)=>{
setMedia(media.filter((_,i)=>i!==index));
};

/* EDIT POST */
const editPost=(row)=>{

const post = posts[row[6].index];

setTitle(post.title);
setCategory(post.category);
setDescription(post.description);
setMedia(post.media || []);
setEditPostId(post.id);

if(editorRef.current){
editorRef.current.innerHTML = post.description;
}

};

/* DELETE POST */
const deletePost = async (row)=>{

const post = posts[row[6].index];

await fetch(`http://localhost:5000/admin/news/${post.id}`,{
method:"DELETE"
});

fetchPosts();

};

/* UPLOAD MEDIA TO CLOUDINARY */
const uploadMediaFiles = async ()=>{

const mediaUrls=[];

for(const file of media){

if(typeof file === "string"){
mediaUrls.push(file);
}else{

const url = await uploadToCloudinary(file);
if(url) mediaUrls.push(url);

}

}

return mediaUrls;

};

/* PUBLISH POST */
const publishPost = async ()=>{

const adminUID = localStorage.getItem("adminUID");

const mediaUrls = await uploadMediaFiles();

const postData={
title,
category,
description,
media:mediaUrls,
status:"Published",
schedule:"Now",
adminUID
};

if(editPostId){

await fetch(`http://localhost:5000/admin/news/${editPostId}`,{
method:"PUT",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify(postData)
});

}else{

await fetch("http://localhost:5000/admin/news",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify(postData)
});

}

clearForm();
fetchPosts();

};

/* SCHEDULE POST */
const saveSchedule = async ()=>{

const adminUID = localStorage.getItem("adminUID");

const mediaUrls = await uploadMediaFiles();

const postData={
title,
category,
description,
media:mediaUrls,
status:"Scheduled",
schedule:`${scheduleDate} ${scheduleTime}`,
adminUID
};

await fetch("http://localhost:5000/admin/news",{
method:"POST",
headers:{ "Content-Type":"application/json" },
body:JSON.stringify(postData)
});

clearForm();
fetchPosts();
setScheduleModal(false);

};

/* CLEAR FORM */
const clearForm=()=>{

setTitle("");
setCategory("");
setDescription("");
setMedia([]);
setEditPostId(null);

if(editorRef.current){
editorRef.current.innerHTML="";
}

};

/* TABLE */
const columns=[
"Date",
"Category",
"Title",
"Status",
"Posted By",
"Schedule",
"Action"
];

const tableData=posts.map((p,i)=>[
p.createdAt,
p.category,
p.title,
p.status,
p.postedBy,
p.schedule,
{ index:i }
]);

return(
<>
<Header/>
<SideNavi open={open} setOpen={setOpen}/>

<div className="md:ml-[260px] bg-gray-50 min-h-screen px-6 py-8">

<h1 className="text-2xl font-bold text-[#007CCF] mb-6">
News Management
</h1>

<div className="flex justify-end mb-6">
<Search value={search} onChange={(e)=>setSearch(e.target.value)}/>
</div>

{/* MAIN GRID */}
<div className="grid lg:grid-cols-3 gap-6 mb-10">

{/* CREATE POST CARD */}
<div className="lg:col-span-2 bg-white border border-gray-300 rounded-xl shadow-sm p-6">

<h2 className="font-semibold text-gray-700 mb-6">
{editPostId ? "Edit Post" : "Create Barangay Post"}
</h2>

{/* CATEGORY + TITLE */}
<div className="grid md:grid-cols-3 gap-4 mb-4">

<div>
<label className="text-sm text-gray-600">Category</label>

<select
value={category}
onChange={(e)=>setCategory(e.target.value)}
className="w-full border rounded-xl px-3 py-2 mt-1"
>

<option>Select Category</option>
<option>Event</option>
<option>Advisory</option>
<option>Announcement</option>
<option>Emergency</option>

</select>

</div>

<div className="md:col-span-2">

<label className="text-sm text-gray-600">Title</label>

<input
type="text"
value={title}
onChange={(e)=>setTitle(e.target.value)}
className="w-full border rounded-xl px-3 py-2 mt-1"
/>

</div>

</div>

{/* DESCRIPTION */}
<div className="border rounded-xl mb-4">

<div
ref={editorRef}
contentEditable
className="min-h-[140px] p-3 text-sm outline-none"
onInput={(e)=>{

let html = e.currentTarget.innerHTML;

/* AUTO DETECT LINKS */
const urlRegex = /(https?:\/\/[^\s]+)/g;

html = html.replace(urlRegex,(url)=>{
return `<a href="${url}" target="_blank" class="text-blue-500 underline">${url}</a>`;
});

setDescription(html);

}}
/>

{/* TOOLBAR */}
<div className="border-t flex gap-2 p-2 bg-gray-50 rounded-b-xl">

<button
type="button"
onClick={()=>document.execCommand("bold",false,null)}
className="px-3 py-1 text-sm font-bold hover:bg-gray-200 rounded"
>
B
</button>

<button
type="button"
onClick={()=>document.execCommand("italic",false,null)}
className="px-3 py-1 text-sm italic hover:bg-gray-200 rounded"
>
I
</button>


</div>

</div>

{/* MEDIA UPLOAD */}
<div
onDragOver={(e)=>e.preventDefault()}
onDrop={dropUpload}
className="mb-4 border-2 border-dashed rounded-xl p-6 text-center"
>

<p className="text-gray-500">
Drag & Drop media or click to upload
</p>

<input
type="file"
multiple
accept="image/*,video/*"
onChange={uploadMedia}
className="mt-2"
/>

</div>

{/* MEDIA PREVIEW */}
{media.length>0 &&(

<div className="grid grid-cols-3 gap-2 mb-4">

{media.map((file,i)=>{

const src = typeof file==="string"
? file
: URL.createObjectURL(file);

return(

<div key={i} className="relative">

<img
src={src}
className="rounded-lg object-cover h-24 w-full"
/>

<button
onClick={()=>removeMedia(i)}
className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 rounded"
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
onClick={()=>setScheduleModal(true)}
className="px-4 py-2 bg-yellow-500 text-white rounded-xl text-sm"
>
Schedule
</button>

<button
onClick={publishPost}
className="px-4 py-2 bg-[#007CCF] text-white rounded-xl text-sm"
>
{editPostId ? "Update" : "Publish"}
</button>

</div>

</div>

{/* RECENT POSTS */}
<div>

<h2 className="font-semibold text-gray-700 mb-4">
Recent Posts
</h2>

<div className="space-y-4">

{posts.slice(0,3).map((p,i)=>(

<div
key={i}
onClick={()=>setPreviewPost(p)}
className="bg-white border border-gray-300 rounded-xl p-4 shadow-sm cursor-pointer hover:shadow-md"
>

<img
src={p.media?.[0]}
className="w-full h-32 object-cover rounded-lg mb-2"
/>

<p className="font-semibold text-sm">
{p.title}
</p>

<p className="text-xs text-gray-500">
{p.description?.substring(0,60)}...
</p>

</div>

))}

</div>

</div>

</div>

{/* TABLE */}
<Table
columns={columns}
data={tableData}
onEdit={editPost}
onDelete={deletePost}
onRowClick={(row)=>setPreviewPost(posts[row[6].index])}
/>

</div>

{/* PREVIEW MODAL */}
{previewPost &&(

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<div className="bg-white rounded-xl shadow-lg w-full max-w-xl p-6 relative">

<button
onClick={()=>setPreviewPost(null)}
className="absolute top-3 right-4 text-xl"
>
✕
</button>

<img
src={previewPost.media?.[0]}
className="w-full rounded-lg mb-4"
/>

<h2 className="font-semibold text-lg mb-2">
{previewPost.title}
</h2>

<p className="text-sm text-gray-600">
{previewPost.description}
</p>

</div>

</div>

)}

{/* SCHEDULE MODAL */}
{scheduleModal &&(

<div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

<div className="bg-white rounded-xl p-6 w-96">

<h3 className="font-semibold mb-4">
Schedule Post
</h3>

<input
type="date"
value={scheduleDate}
onChange={(e)=>setScheduleDate(e.target.value)}
className="border rounded-lg w-full p-2 mb-3"
/>

<input
type="time"
value={scheduleTime}
onChange={(e)=>setScheduleTime(e.target.value)}
className="border rounded-lg w-full p-2 mb-4"
/>

<div className="flex justify-end gap-2">

<button
onClick={()=>setScheduleModal(false)}
className="px-3 py-1 bg-gray-200 rounded"
>
Cancel
</button>

<button
onClick={saveSchedule}
className="px-3 py-1 bg-[#007CCF] text-white rounded"
>
Save
</button>

</div>

</div>

</div>

)}

</>
);

}

export default News;