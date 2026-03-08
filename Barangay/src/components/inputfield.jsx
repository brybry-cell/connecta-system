function InputField({ type, placeholder, text, className, onChange, value }) {

  if (type === "file") {
    return (
      <div className={`flex flex-col ${className}`}>
        <label className="text-white mb-1">
          {text}
        </label>

        <label className="bg-white text-black h-[45px] rounded-lg px-3 flex items-center cursor-pointer">
          Choose File
          <input
            type="file"
            className="hidden"
            accept="image/*,.pdf"
            onChange={(e) => onChange(e)}
          />
        </label>
      </div>
    );
  }

  return (
    <div className={`flex flex-col ${className}`}>
      <label className="text-white mb-1">
        {text}
      </label>

      <input
        type={type}
        placeholder={placeholder}
        className="w-full h-[45px] bg-white rounded-lg px-3 outline-none"
        onChange={onChange}
        value={value}
      />
    </div>
  );
}

export default InputField;