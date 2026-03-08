
function Stats({ title, value, className }) {
    return (
        <div className={`stats ${className}`}>
            <p className="stats-title">{title}</p>
            <p className="stats-value">{value}</p>
        </div>
    );
}

export default Stats;