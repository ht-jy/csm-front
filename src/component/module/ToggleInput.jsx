import { useState, useEffect } from "react";
import "../../assets/css/ToggleInput.css";

/**
 * @description: 토글 버튼 input 폼
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-03-20
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - 
 * 
 * @additionalInfo
 * initText: 초기 설정 값, 없을시 toggleTexts의 첫번째 값이 들어가게 됨.
 * toggleTexts: 버튼 클릭시 마다 바뀌게 값 배열
 * setToggleText: 바뀐 값을 받을 함수
 * style: 스타일 객체
 * 
 */
const ToggleInput = ({initText, toggleTexts, setToggleText, style}) => {
    const [text, setText] = useState("");

    const onClickText = () => {
        const textLen = toggleTexts.length;
        const index = toggleTexts.indexOf(text);
        if(textLen === (index+1)){
            setText(toggleTexts[0]);
            setToggleText(toggleTexts[0])
        }else{
            setText(toggleTexts[index+1]);
            setToggleText(toggleTexts[index+1])
        }        
    }

    const btnStyle = () => {
        const longestLength = Math.max(...toggleTexts.map(text => text.length));
        const width = ((longestLength*15) + 10) + "px";
        return {width: width};
    }

    useEffect(() => {
        if(initText && initText !== ""){
            setText(initText);
        }else if(initText === ""){
            setText("-");
        }else{
            setText(toggleTexts[0]);
        }
    }, [initText]);

    return (
        <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
            <div className="toggle-input" onClick={onClickText} style={{...style, ...btnStyle()}}>{text}</div>
        </div>
    );
}

export default ToggleInput;