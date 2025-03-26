import { useState, useEffect } from 'react';
import Button from './Button';
import "../../assets/css/TimeInput.css";
import { dateUtil } from '../../utils/DateUtil';
import Modal from './Modal';

/**
 * @description: 시간 입력을 위한 input. AM|PM hh:mm:ss
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-03-20
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @additionalInfo
 * btnStyle, time, setTime
 */
const Time12Input = ({btnStyle, time, setTime}) => {
    const [btnText, setbtnText] = useState("-");
    const [hour, setHour] = useState("00");
    const [min, setMin] = useState("00");
    const [isModal, setIsModal] = useState(false);

    const onClickBtnText = () => {
        let temp = "-";
        if(btnText === "AM"){
            temp = "PM";
        }else if(btnText === "PM") {
            temp = "-";
        }else if(btnText === "-"){
            temp = "AM";
        }
        setbtnText(temp);
        if(temp === "-"){
            setTime(dateUtil.parseFormatTime12ToGo(`${temp} 00:00:00`));
        }else{
            setTime(dateUtil.parseFormatTime12ToGo(`${temp} ${hour}:${min}:00`));
        }
    }

    const onChangeHour = (e) => {
        if(btnText === "-"){
            setIsModal(true);
            return;
        }
        let temp = e.target.value.replace(/\D/g, "");
        
        temp = Number(temp) > 12 ? 12 : Number(temp);
        temp = Number(temp) > 0 && Number(temp) < 10 ? "0"+Number(temp) : temp;
        temp = Number(temp) === 0 ? "00" : temp;

        setHour(temp);
        setTime(dateUtil.parseFormatTime12ToGo(`${btnText} ${temp}:${min}:00`));
    }

    const onChangeMin = (e) => {
        if(btnText === "-"){
            setIsModal(true);
            return;
        }
        let temp = e.target.value.replace(/\D/g, "");
        
        temp = Number(temp) > 60 ? 60 : Number(temp);
        temp = Number(temp) > 0 && Number(temp) < 10 ? "0"+Number(temp) : temp;
        temp = Number(temp) === 0 ? "00" : temp;

        setMin(temp);
        setTime(dateUtil.parseFormatTime12ToGo(`${btnText} ${hour}:${temp}:00`));
    }

    useEffect(() => {
        
        if(time !== "0001-01-01T00:00:00Z" && time !== ""){
            const time24 = time.split("T")[1];
            const timeArr = time24.split(":");
            let hours12 = Number(timeArr[0]) % 12
            Number(timeArr[0]) > 11 && Number(timeArr[0]) < 24 ? setbtnText("PM") : setbtnText("AM");
            if(Number(timeArr[0]) === 0|| Number(timeArr[0]) === 12 || Number(timeArr[0]) === 24){
                setHour("00");
            } else if(hours12 > 0 && hours12 < 10) {
                setHour("0"+hours12);
            }else{
                setHour(hours12);
            }
            setMin(timeArr[1]);
        }else{
            setbtnText("-");
            setHour("00");
            setMin("00");
        }
    }, [time]);
    
    return(
        <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "5px"}}>
            <Modal
                isOpen={isModal}
                text={"오전 또는 오후를 선택해주세요."}
                confirm={"확인"}
                fncConfirm={() => setIsModal(false)}
            />
            <Button text={btnText} onClick={onClickBtnText} style={{width: "30px", height: "28px", fontSize: "12px", margin: 0, padding: "2px"}}/>
            <input className="time-input" type="text" value={hour} onChange={onChangeHour}/> : <input className="time-input" type="text" value={min} onChange={onChangeMin}/>
        </div>
    );
}

export default Time12Input;
