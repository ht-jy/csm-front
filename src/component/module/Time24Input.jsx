import { useState, useEffect } from 'react';
import "../../assets/css/TimeInput.css";
import { dateUtil } from '../../utils/DateUtil';

/**
 * @description: 시간 입력을 위한 input. hh24:mm:ss
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-03-25
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @additionalInfo
 * btnStyle, time, setTime
 */
const Time24Input = ({btnStyle, time, setTime}) => {
    const [hour, setHour] = useState("00");
    const [min, setMin] = useState("00");

    const onChangeHour = (e) => {
        let hourNum = Number(e.target.value.replace(/\D/g, ""));
        if(hourNum > 24){
            hourNum = 24;
        }
        hourNum = String(hourNum).padStart(2, '0');
        
        setHour(hourNum);
        setTime(dateUtil.parseFormatTime24ToGo(`${hourNum}:${min}:00`));
    }

    const onChangeMin = (e) => {
        let minNum = Number(e.target.value.replace(/\D/g, ""));
        if(minNum > 59){
            minNum = 59;
        }
        minNum = String(minNum).padStart(2, '0');

        setMin(minNum);
        setTime(dateUtil.parseFormatTime24ToGo(`${hour}:${minNum}:00`));
    }

    useEffect(() => {
        if(time !== "0001-01-01T00:00:00Z" && time !== ""){
            const date = new Date(time);
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            setHour(hours);
            setMin(minutes);
        }else{
            setHour("00");
            setMin("00");
        }
    }, [time]);
    
    return(
        <div style={{display: "flex", alignItems: "center", justifyContent: "center", gap: "5px"}}>
            <input className="time-input" type="text" value={hour} onChange={onChangeHour}/> : <input className="time-input" type="text" value={min} onChange={onChangeMin}/>
        </div>
    );
}

export default Time24Input;
