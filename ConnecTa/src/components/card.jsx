function Card({ title, description, className, children }) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-xl ${className}`}>
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600 text-sm mb-4">{description}</p>

      {children}
    </div>
  );
}

export default Card;