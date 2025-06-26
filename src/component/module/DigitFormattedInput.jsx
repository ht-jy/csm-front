import { useEffect, useState } from "react";
import "../../assets/css/NumberInput.css"

/**
 * @description: 숫자 버튼으로 변경 하는 입력 컴포넌트
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-06-25
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - 
 * 
 * @additionalInfo
 * - initNum: 초기 값
 * - setNum:  변경된 값을 받을 함수
 * - format: 자리수 ex) "2.1": 정수부 2자리, 소수부 한자리 | "3.0": 정수부 3자리, 소수 없음
 * - step: 증가/감소할 수 있는 최소 단위
 * - style: 스타일 객체
 */
const DigitFormattedInput = ({ initNum, setNum, format="3.0", step = 0.1, style }) => {
    const [inputNum, setInputNum] = useState("");

    // 정수부와 소수부 자릿수 파싱 (예: "2.3" → intLength=2, fracLength=3)
    const [intLength, fracLength] = format.split('.').map(Number);

    const onChangeNumber = (e) => {
        let value = e.target.value;

        // 숫자 또는 소수점만 허용
        if (!/^\d*\.?\d*$/.test(value)) return;

        const hasDot = value.includes(".");
        const [intPart, fracPart = ""] = value.split(".");

        // 정수부 길이 초과 시 제한
        if (intPart.length > intLength) {
            // 단, 기존에 "."가 없고 새로 "."을 입력하려는 경우는 허용
            const isTryingToAddDot =
                !inputNum.includes(".") &&
                value.includes(".") &&
                intPart.length === intLength;
            if (!isTryingToAddDot) return;
        }

        // 소수부 길이 초과 시 제한
        if (fracPart.length > fracLength) return;

        // "."를 지운 경우 → 소수부 제거
        if (!value.includes(".") && inputNum.includes(".")) {
            value = intPart;
        }

        setInputNum(value);

        // 빈 문자열 또는 단일 '.' 입력 시 0 처리
        if (value === "" || value === ".") {
            setNum(0);
            return;
        }

        const parsed = parseFloat(value);
        if (!isNaN(parsed)) {
            setNum(parsed);
        }
    };

    useEffect(() => {
        setInputNum(String(initNum ?? ""));
    }, [initNum]);

    return (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "5px" }}>
            <input
                className="number-input"
                type="text" // 커스텀 입력 제어를 위해 text 사용
                inputMode="decimal"
                value={inputNum}
                onChange={onChangeNumber}
                step={step}
                style={{ ...style }}
            />
        </div>
    );
};

export default DigitFormattedInput;