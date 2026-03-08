
function button({text, type, className, onClick}) {
    return (
        <button className={`button ${type} ${className}`} onClick={onClick}>
            {text}
        </button>
    );
}

export default button;