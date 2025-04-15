import { useState, useEffect } from "react";
import "../../assets/css/TextInput.css";

/**
 * @description: 
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-03-20
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @additionalInfo
 * initText: 초기 설정값
 * setText: 변경된 값을 받을 함수
 * style: 스타일 객체
 */
const TextInput = ({initText, setText, style}) => {
    const [inputText, setInputText] = useState("");

    const onChageText = (e) => {
        // onChageText(e.target.value);
        setInputText(e.target.value);
        setText(e.target.value);
    }

    useEffect(() => {
        setInputText(initText);
    }, [initText]);

    return(
        <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
            <input className="text-input" type="text" value={inputText} onChange={onChageText} style={{...style}}/>
        </div>
    );
}

export default TextInput;