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
const NumberInput = ( {initNum, setNum, min = 0, max = 10000, fixed = null, step=1, style} ) => {
    const [inputNum, setInputNum] = useState("");
    const minValue = Number(min);
    const maxValue = Number(max);

    const onChangeNumber = (e) => {
        let value = e.target.value;
        const [intPart, fracPart = ""] = String(Number(value)).split(".");

        // 소수부 길이 초과 시 제한
        if (fixed !== null && fracPart.length > fixed)
            return

        // 숫자 또는 소수점만 허용
        if (!/^\d*\.?\d*$/.test(value)) return;

        // 단일 '.' 입력 시 0 처리
        if (value === ".") {
            setNum(inputNum);   
            return;
        }else if (String(value).endsWith('.') ){
            return;
        }

        if (value > maxValue) {
            value = maxValue;
        } else  if (value < minValue) {
            value = minValue
        }

        value = String(Number(value));

        setNum(value);
        setInputNum(value);        
    }

    // 사용자가 직접 입력 시 fixed 적용
    const onBlurNumber = () => {
        if (fixed !== null) {
            const rounded = Number(inputNum).toFixed(fixed);
            setInputNum(rounded);
            setNum(rounded);
        }        
    }

    useEffect(() => {
        setInputNum(initNum || 0)
    }, [initNum]);


    return (
        <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "5px"}}>
            <input 
                className="number-input"
                type="number" 
                id="quantity" 
                min={minValue} 
                max={maxValue} 
                value={inputNum} 
                onChange={onChangeNumber}
                onBlur={onBlurNumber}
                step={step}
                style={{...style}}/>
        </div>
    );
}

export default NumberInput;