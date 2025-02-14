import { useState, useEffect } from "react";
import FormCheckInput from "react-bootstrap/esm/FormCheckInput";
import Select from 'react-select';
import "../../assets/css/Input.css";

/**
 * @description: 상세화면 모달 Input 컴포넌트
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-13
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - FormCheckInput
 * - Select.jsx
 * 
 * @additionalInfo
 * - props: 
 *  editMode: true|false (수정가능 여부)
 *  type: "text"|"checkbox"|"select" (input type 추후에 추가 예정)
 *  span: "double"|"full"(girdModal col 개수)
 *  label: input label
 *  value: input value
 *  onValueChange: function
 *  selectData: select data
 */
const Input = ({ editMode, type, span, label, value, onValueChange, selectData }) => {
    const [isValid, setIsValid] = useState(true);
    const [isChecked, setIsChecked] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null); // 초기값을 null로 설정

    // input 체인지 이벤트
    const inputChangeHandler = (event) => {
        const newValue = event.target.value;
        setIsValid(newValue.trim() !== "");
        onValueChange(newValue);  // 부모 컴포넌트에 값 전달
    };

    // checkbox 체인지 이벤트
    const checkboxChangeHandler = (event) => {
        const checked = event.target.checked;
        setIsChecked(checked);
        onValueChange(checked ? "Y" : "N");  // 부모 컴포넌트에 값 전달
    };

    // select 체인지 이벤트
    const selectChangeHandler = (option) => {
        setSelectedOption(option);
        onValueChange(option.value);  // 부모 컴포넌트에 값 전달
    };

    // value가 변경될 때 체크박스 상태 업데이트
    useEffect(() => {
        if (type === "checkbox") {
            setIsChecked(value === "Y"); // "Y"면 true, "N"이면 false
        }
    }, [value]); // value가 변경될 때마다 실행

    useEffect(() => {
        if (type === "select" && selectData) {
            const foundOption = selectData.find(option => option.value === value);
            setSelectedOption(foundOption || null);
        }
    }, [selectData, value]); // selectData가 변경될 때마다 실행

    const containerStyle = {
        gridColumn: span === 'full' ? 'span 2' : 'auto',
        padding: '10px',
    };

    return (
        <div className="form-control" style={containerStyle}>
            <label style={{ color: !isValid ? "red" : "black", marginRight: "5px" }}>
                {label}
            </label>
            {
                type === "text" ? (
                    <div className="form-input">
                        {
                            editMode ? (
                                <input
                                    style={{ width: "100%" }}
                                    type="text"
                                    value={value}
                                    onChange={inputChangeHandler}
                                />
                            ) : value
                        }
                    </div>
                ) : type === "checkbox" ? (
                    <div>
                        <FormCheckInput checked={isChecked} onChange={checkboxChangeHandler} disabled={!editMode}/> 
                        <span style={{ color: "grey" }}>&nbsp;&nbsp;{isChecked ? "사용중" : "사용안함"}</span>
                    </div>
                ) : type === "select" ? (
                    editMode ? (
                        <Select
                            onChange={selectChangeHandler}
                            options={selectData || []} // selectData가 undefined일 경우 빈 배열 제공
                            value={selectedOption} // 상태에 따라 업데이트된 값 사용
                            placeholder={"선택하세요"}
                            styles={{ width: "200px" }}
                        />
                    ) : (
                        <div className="form-input">
                            {selectData?.find(option => option.value === value)?.label || "-"}
                        </div>
                    )
                ) : null
            }
        </div>
    );
};

export default Input;
