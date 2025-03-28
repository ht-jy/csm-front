import { useState } from "react";
import "../../assets/css/Toggle.css";

/**
 * @description: 
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-03-28
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - onClickValue 토글 true|false 반환 받을 함수
 */
const Toggle = ({onClickValue}) => {
  const [isToggleOn, setIsToggleOn] = useState(false);

  const onClickToggle = () => {
    setIsToggleOn(!isToggleOn)
    onClickValue(!isToggleOn)
  }

  return (
    <div className="ToggleWrap" onClick={onClickToggle}>
      <div className="Toggle" style={isToggleOn ? {backgroundColor: "#007bff"} : {backgroundColor: "#C1C1C1"}}>
        <div className="ToggleButton" style={isToggleOn ? {transform: "translateX(16px)"} : {transform: "translateX(0px)"}}></div>
      </div>
    </div>
  );
};

export default Toggle;