import "../../assets/css/Radio.css";

const Radio = ({ text, value, name, defaultChecked, checked, disabled, onChange, style}) => {
    
    return (
        <label style={{ display: "flex", alignItems: "center", ...style }}>
            <input
                type="radio"
                value={value}
                name={name}
                defaultChecked={defaultChecked}
                checked={checked}
                disabled={disabled}
                onChange={onChange}
                style={{
                    display: "inline-block",
                    appearance: "auto",
                    width: "16px",
                    height: "16px",
                    marginRight: "3px",
                }}
            />
            {text}
        </label>
    );
};

export default Radio;
