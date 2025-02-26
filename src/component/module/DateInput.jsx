import React, { useEffect, useState } from "react";
import {Calendar} from "react-calendar";
import CalendarIcon from "../../assets/image/calendar-icon.png"
import "react-calendar/dist/Calendar.css";
import "../../assets/css/Calendar.css";
import "../../assets/css/DateInput.css";
import { dateUtil } from "../../utils/DateUtil";


const DateInput = ({time, setTime}) => {

    const [saveTime, setSaveTime] = useState(time);
    const [showCalendar, setShowCalendar] = useState(false);

        // 날짜 선택 시 캘린더 숨기기
    const handleDateChange = (date) => {
            setTime(dateUtil.format(date));
            setShowCalendar(false);
    };

    useEffect(() => {
        setTime(time);
    }, [time])

    return (
            <>
            <div className="date-input">
                <input type="date" id="inputDate" value={time} max="9999-12-31" className="inputBox" onChange={(e) => setTime(e.target.value)} />
                <input type="image" value="" src={CalendarIcon} className="imgIcon" onClick={() => setShowCalendar(prev => !prev)}/>               
            </div>
                {showCalendar && (
                    <div className="calendar-popup">
                        <Calendar 
                            onChange={handleDateChange} 
                            value={time} 
                            locale="ko" 
                            calendarType="hebrew" 
                            tileClassName={({ date, view }) => {
                                if (view !== 'month') return; // 달력에서만 적용
                                const day = date.getDay(); // 0: 일요일, 6: 토요일
                                
                                if (date.getMonth() !== dateUtil.parseToDate(saveTime).getMonth()) {
                                    return "neighboring-month"; // 이전/다음 달은 회색
                                    }
                                    
                                    if (day === 0) return "sunday"; // 일요일
                                    if (day === 6) return "saturday"; // 토요일
                                    else return "default";
                                }}
                            onClickMonth={( {date, view }) => {
                                if(view !== 'month') return;
                                console.log(dateUtil.parseToDate(view).getDay());
                                const day = date.getDay();
                                setSaveTime(dateUtil.parseToDate(saveTime).getFullYear() + date.getMonth() + dateUtil.parseToDate(saveTime).getDay)
                            }
                            }
                        />
                    </div>
                )}
        </>
  );
}

export default DateInput;