const Radio = ({ text, value, name, defaultChecked, disabled, onChange }) => {
    return (
        <label style={{ display: "flex", alignItems: "center" }}>
            <input
                type="radio"
                value={value}
                name={name}
                defaultChecked={defaultChecked}
                disabled={disabled}
                onChange={onChange}
                style={{
                    display: "inline-block",
                    appearance: "auto",
                    width: "16px",
                    height: "16px",
                    marginRight: "8px",
                }}
            />
            {text}
        </label>
    );
};

export default Radio;
