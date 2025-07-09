import { useState, useEffect } from "react";
import CheckSquareIcon from "../../assets/image/check-square-icon.png";
import NonCheckSquareIcon from "../../assets/image/non-check-square-icon.png";

/**
 * @description: 
 * @author 작성자: 김진우
 * @created 작성일: 2025-03-??
 * @modified 최종 수정일: 2025-07-09
 * @modifiedBy 최종 수정자: 김진우
 * @modified Description: 
 * 2025-07-09: checkVaild를 이용하여 클릭 이벤트 제어
 * 
 */

const CheckInput = ({checkFlag, setCheckFlag, checkVaild = true}) => {
    const [img, setImg] = useState(NonCheckSquareIcon);

    const onCllickCheckImg = () => {
        if(checkVaild){
            if(img === CheckSquareIcon){
                setImg(NonCheckSquareIcon);
                setCheckFlag("N");
            }else{
                setImg(CheckSquareIcon);
                setCheckFlag("Y");
            }
        }
    }

    useEffect(() => {
        if(checkFlag === "Y"){
            setImg(CheckSquareIcon);
        }else{
            setImg(NonCheckSquareIcon);
        }
    }, [checkFlag]);

    return(
        <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "5px", cursor: checkVaild ? "pointer" : ""}}>
            <img src={img} style={{width: "18px"}} onClick={onCllickCheckImg}/>
        </div>
    );
}

export default CheckInput;