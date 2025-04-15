import React, { useEffect, useState } from "react";
import {Calendar} from "react-calendar";
import CalendarIcon from "../../assets/image/calendar-icon.png"
import "react-calendar/dist/Calendar.css";
import "../../assets/css/Calendar.css";
import "../../assets/css/DateInput.css";
import { dateUtil } from "../../utils/DateUtil";
import OutsideClick from "./OutsideClick.jsx";

/**
 * @description: 날짜 입력 컴포넌트
 * 
 * @author 작성자: 정지영
 * @created 작성일: 2025-02-27
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - Calendar: 달력
 * - dateUtil: 날짜 형식
 * - OutsideClick: 컴포넌트 외 클릭 비활성화
 *    
 * @additionalInfo
 * - props
 *  time: 처음 표시될 시간
 *  setTime: 달력에서 날짜 선택 시 시간을 변경할 함수
 */
const DateInput = ({time, setTime, dateInputStyle, calendarPopupStyle, isCalendarHide}) => {

    const [saveTime, setSaveTime] = useState(time);
    const [showCalendar, setShowCalendar] = useState(false);

    // dateUtil의 format으로 인하여 "-"가 들어갈 경우 처리
    const dateUtilFormat = (time) => {
        if(time === "-"){
            return "";
        }
        return time;
    }

    // 날짜 선택 시 캘린더 숨기기
    const handleDateChange = (date) => {
            setTime(dateUtil.format(date));
            setShowCalendar(false);
    };

    useEffect(() => {
        if(time === null || time === "-") {
            setTime(dateUtil.format(new Date()));
        }else{
            setTime(time);
        }
    }, [time])

    return (
        <span className="calendar-wrapper">
            <div className="date-input" style={{...dateInputStyle}}>
                <input type="date" id="inputDate" value={time} max="9999-12-31" className="inputBox" onChange={(e) => setTime(e.target.value)} />
                {
                    isCalendarHide ? null
                    : <input type="image" value="" src={CalendarIcon} className="imgIcon" onClick={() => setShowCalendar(prev => !prev)}/>               
                }
            </div>
                {
                    isCalendarHide ? null
                    :
                    showCalendar && (
                        <div className="calendar-popup" style={{...calendarPopupStyle}}>
                            <OutsideClick setActive={setShowCalendar}>
                                {/* FIXME: 공휴일 문제, 오늘로 날짜 돌리기 */}
                                <Calendar 
                                    onChange={handleDateChange} 
                                    value={dateUtilFormat(time)} 
                                    locale="ko" 
                                    calendarType="gregory" 
                                    formatDay={(locale, date) => date.toLocaleString('en', { day: 'numeric' })}
                                />
                            </OutsideClick>
                        </div>
                    )
                }
        </span>
  );
}

export default DateInput;