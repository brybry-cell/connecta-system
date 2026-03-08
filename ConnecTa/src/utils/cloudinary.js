export const uploadToCloudinary = async (file) => {

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "react_unsigned_upload");

  const response = await fetch(
    "https://api.cloudinary.com/v1_1/djh0ademo/image/upload",
    {
      method: "POST",
      body: formData
    }
  );

  const data = await response.json();

  return data.secure_url;
};