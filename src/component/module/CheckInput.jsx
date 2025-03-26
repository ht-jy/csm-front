import { useState, useEffect } from "react";
import CheckSquareIcon from "../../assets/image/check-square-icon.png";
import NonCheckSquareIcon from "../../assets/image/non-check-square-icon.png";

const CheckInput = ({checkFlag, setCheckFlag}) => {
    const [img, setImg] = useState(NonCheckSquareIcon);

    const onCllickCheckImg = () => {
        if(img === CheckSquareIcon){
            setImg(NonCheckSquareIcon);
            setCheckFlag("N");
        }else{
            setImg(CheckSquareIcon);
            setCheckFlag("Y");
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
        <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "5px"}}>
            <img src={img} style={{width: "18px"}} onClick={onCllickCheckImg}/>
        </div>
    );
}

export default CheckInput;