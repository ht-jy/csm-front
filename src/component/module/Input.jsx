import { useState } from "react";
import FormCheckInput from "react-bootstrap/esm/FormCheckInput";

const Input = ({ type, span, label, value, onValueChange }) => {
    const [isValid, setIsValid] = useState(true);

    const goalInputChangeHandler = (event) => {
        const newValue = event.target.value;
        setIsValid(newValue.trim() !== "");
        onValueChange(newValue);  // 부모 컴포넌트에 값 전달
    };

    const containerStyle = {
        gridColumn: span === 'full' ? 'span 2' : 'auto',
        padding: '10px',
    };

    return (
        <div className="form-control" style={containerStyle}>
            <label style={{ color: !isValid ? "red" : "black", marginRight: "5px" }}>
                {label}
            </label>
            <input
                style={{ width: "100%" }}
                type="text"
                value={value}
                onChange={goalInputChangeHandler}
            />
            <FormCheckInput /> 체크박스
        </div>
    );
};

export default Input;
