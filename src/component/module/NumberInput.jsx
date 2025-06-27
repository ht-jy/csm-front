import { useEffect, useState } from "react";
import "../../assets/css/NumberInput.css"

/**
 * @description: 숫자 버튼으로 변경 하는 입력 컴포넌트
 * 
 * @author 작성자: 정지영
 * @created 작성일: 2025-06-16
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - 
 * 
 * @additionalInfo
 * - initNum: 초기 값
 * - setNum:  변경된 값을 받을 함수
 * - min: 최소값(default = 0)
 * - max: 최댓값(default = 10000)
 * - step: 이동하는 크기(default = 1)
 * - style: 스타일 객체
 */
const NumberInput = ( {initNum, setNum, min = 0, max = 10000, step=1, style} ) => {
    const [inputNum, setInputNum] = useState("");

    const onChangeNumber = (e) => {
        let value = e.target.value;

        if (value > max) {
            value = max;
        }
        setNum(value);
        setInputNum(value);        
    }

    useEffect(() => {
        setInputNum(initNum)
    }, [initNum]);


    return (
        <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "5px"}}>
            <input 
                className="number-input"
                type="number" 
                id="quantity" 
                min={min} 
                max={max} 
                value={inputNum} 
                onChange={onChangeNumber} 
                step={step}
                style={{...style}}/>
        </div>
    );
}

export default NumberInput;