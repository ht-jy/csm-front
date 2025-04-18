import { useState, useEffect } from "react";
import FormCheckInput from "react-bootstrap/esm/FormCheckInput";
import Select from 'react-select';
import "../../assets/css/Input.css";
import "../../assets/css/Scrollbar.css";
import { Common } from "../../utils/Common";
import DateInput from "./DateInput";
import { dateUtil } from "../../utils/DateUtil";
import Radio from "./Radio";

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
 *  checkedLabels: checkbox [true, false] spanText
 *  textFormat: text Format function name
 *  isHide: false: 보이기, true: 숨김
 */
const Input = ({ editMode, type, span, label, value, onValueChange, selectData, checkedLabels=["", ""], radioValues=[], radioLabels=[], textFormat, isHide=false, labelWidth="100px", item }) => {
    const [isValid, setIsValid] = useState(true);
    const [isChecked, setIsChecked] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null); // 초기값을 null로 설정
    const [searchStartTime, setSearchStartTime] = useState(value);
    
    const [maskValue, setMaskValue] = useState("");

    // input 마스킹 이벤트
    const inputChangeRegidentMasking = (event) => {
        // 마스킹 값 변경
        const newMaskValue = event.target.value;
        setIsValid(newMaskValue.trim() !== "");
        setMaskValue(newMaskValue);

        // 실제 값 변경
        let newValue;
        const formattedValue = Common.maskResidentNumber(value);
        
        if (newMaskValue.length < formattedValue.length) {
            newValue = value.slice(0, -1);
        } else {
            let cleaned = newMaskValue.replace(/[^0-9*]/g, '');
            newValue = value + cleaned.slice(-1);
        }
    
        newValue = Common.clipToMaxLength(13, newValue);
        
        onValueChange(newValue);
    };
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

    // radio 체인지 이벤트
    const handleRadioChange = (e) => {
        onValueChange(e.target.value);
    }

    /***** useEffect *****/
    // date 체인지 이벤트
    useEffect(() => {
        onValueChange(searchStartTime);
    }, [searchStartTime]);

    // 체크박스, 주민번호 상태 업데이트
    useEffect(() => {
        if (type === "checkbox") {
            setIsChecked(value === "Y"); // "Y"면 true, "N"이면 false
        }
        if(type === "text-regidentMask"){
            setMaskValue(value);
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
        // height: '86px'
        display: "flex",
        alignItems: "center"
    };

    return (
        isHide ? null
        :
        <div className="form-control" style={containerStyle}>
            {label.length > 0 &&
                <label style={{ color: !isValid ? "red" : "black", marginRight: "5px", fontWeight: "bold", width: labelWidth }}>
                    {label}
                </label>}
            {
                type === "hidden" ? (
                    null
                ) : type === "text" ? (
                    <div className="grid-input">
                        {
                            editMode ? (
                                <input
                                    style={{ width: "100%", padding: "0.5rem" }}
                                    type="text"
                                    value={
                                        textFormat ? 
                                            Common[textFormat](value)
                                        : value
                                    }
                                    onChange={inputChangeHandler}
                                />
                            ) : textFormat ? 
                                    Common[textFormat](value)
                                : value
                        }
                    </div>
                ) : type === "text-regidentMask" ? (
                    <div className="grid-input">
                        {
                            editMode ? (
                                <>
                                    <input
                                        style={{ width: "100%", padding: "0.5rem" }}
                                        type="text"
                                        value={
                                            textFormat ? 
                                                Common[textFormat](maskValue)
                                            : maskValue
                                        }
                                        onChange={inputChangeRegidentMasking}
                                    />
                                    <input 
                                        type="hidden"
                                        value={value}
                                    />
                                </>
                            ) : textFormat ? 
                                    Common[textFormat](value)
                                : value
                        }
                    </div>
                ) : type === "checkbox" ? (
                    <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                        <FormCheckInput checked={isChecked} onChange={checkboxChangeHandler} disabled={!editMode} />
                        <span style={{ color: "grey" }}>&nbsp;&nbsp;{isChecked ? checkedLabels[0] : checkedLabels[1]}</span>
                    </div>
                ) : type === "select" ? (
                    editMode ? (
                        <div style={{height: "40px", display: "flex", alignItems: "center", width: "100%", marginLeft: "10px" }}>
                            <Select
                                onChange={selectChangeHandler}
                                options={selectData || []} // selectData가 undefined일 경우 빈 배열 제공
                                value={selectedOption} // 상태에 따라 업데이트된 값 사용
                                placeholder={"선택하세요"}
                                menuPortalTarget={document.body}
                                styles={{
                                    menuPortal: (base) => ({
                                        ...base,
                                        zIndex: 999999999, // 모달보다 높게
                                    }),
                                    container: (provided) => ({
                                      ...provided,
                                      width: "100%",
                                    }),
                                }}
                            />
                        </div>
                    ) : (
                        <div className="grid-input">
                            {selectData?.find(option => option.value === value)?.label || "-"}
                        </div>
                    )
                ) : type === "html" ? (
                    editMode ? (
                        <textarea name="" id=""
                            style={{ width: "100%", height: "20rem", marginTop: "0.5rem", padding: "0.5rem" }}
                            value={value}
                            onChange={inputChangeHandler}>
                        </textarea>
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: value }}>
                        </div>
                    )
                ) : type === 'date' ? (
                    editMode ? (
                        <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                            <DateInput 
                                time={searchStartTime} 
                                setTime={setSearchStartTime} 
                                dateInputStyle={{margin: "0px"}}
                                calendarPopupStyle={{
                                    position: "fixed",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    zIndex: 1000,
                                }}
                            ></DateInput>
                        </div>
                    ) : (
                        <div className="grid-input">
                            {value}
                        </div>
                    )
                ) : type === 'radio' ? (
                    editMode ? (
                        <div style={{ height: "40px", display: 'flex', gap: "30px", fontSize: "15px"}}>
                            {
                                radioValues.map((item, idx) => (
                                    <Radio text={radioLabels[idx]} value={item} name="group1" checked={value === item} onChange={handleRadioChange} key={idx}/>
                                ))
                            }
                        </div>
                    ) : (
                        <div style={{ height: "40px", display: 'flex', gap: "30px", fontSize: "15px"}}>
                            {
                                radioValues.map((item, idx) => (
                                    <Radio text={radioLabels[idx]} value={item} name="group1" defaultChecked={value === item} disabled={true} key={idx}/>
                                ))
                            }
                        </div>
                    )
                ) : null

            }
        </div>
    );
};

export default Input;
