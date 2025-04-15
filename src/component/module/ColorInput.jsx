import { useState, useEffect } from "react";
import "../../assets/css/TextInput.css";


/**
 * @description: 
 * 
 * @author 작성자: 정지영
 * @created 작성일: 2025-04-15
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - 
 * 
 * @additionalInfo
 * initColor: 초기 설정값
 * setColor: 변경된 색상을 받을 함수
 * style: 스타일 객체
 */
const ColorInput = ({initColor, setColor, style}) => {
    const [inputColor, setInputColor] = useState("");

    const onChageColor = (e) => {
        setInputColor(e.target.value);
        setColor(e.target.value);
    }

    useEffect(() => {
        setInputColor(initColor);
    }, [initColor]);

    return(
        <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
           <input type="color" value={inputColor} onChange={onChageColor} style={{...style}}/>
        </div>
    );
}

export default ColorInput;