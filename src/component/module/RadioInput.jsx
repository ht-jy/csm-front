import { useEffect, useState } from "react";
import Radio from "./Radio";

/**
 * @description: Radio group 컴포넌트
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-03-25
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * itemName: radio 그룹 Name 명칭 
 * selectedValue: 초기 선택 값 
 * values: radio value 배열 
 * labels: radio text 배열 
 * disabled: true|false
 * setRadio: 선택 value 반환 받는 함수
 * style: 스타일 객체
 */
const RadioInput = ({itemName, selectedValue, values, labels, disabled, setRadio, style}) => {
    const [checkedValue, setCheckedValue] = useState("");
    const onChangeRadio = (e) => {
        setRadio(e.target.value);
    }

    const isfontBold = (isBold, styleObj) => {
        if(isBold){
            return {...styleObj, fontWeight: "bold"};
        }
        return styleObj;
    }

    useEffect(() => {
        setCheckedValue(selectedValue);
    }, [selectedValue]);
    
    return (
        <div style={{...style, display: "flex", justifyContent: "center", alignItems: "center", gap: "10px"}}>
            {
                values.map((item, idx) => (
                    <Radio
                        key={idx}
                        text={labels[idx]}
                        value={item}
                        name={itemName}
                        // defaultChecked={item === checkedValue}
                        checked={item === checkedValue}
                        disabled={disabled}
                        onChange={onChangeRadio}
                        style={isfontBold(item === checkedValue)}
                    />
                ))
            }
        </div>
    );
}

export default RadioInput;