import { useEffect, useState } from "react";
import { Calendar } from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { Tooltip as ReactTooltip } from 'react-tooltip';
import "../../assets/css/Calendar.css";
import "../../assets/css/DateInput.css";
import "../../assets/css/Tooltip.css";
import CalendarIcon from "../../assets/image/calendar-icon.png";
import RefreshIcon from "../../assets/image/refresh-icon.png";
import { dateUtil } from "../../utils/DateUtil";
import { Axios } from "../../utils/axios/Axios.js";
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

    const [showCalendar, setShowCalendar] = useState(false);

    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    /** 빨간색으로 표시할 날짜 목록 [{date: new Date('2025-05-01'), reason: "근로자의날"},...]**/
    const [hoildays, setHoildays] = useState([]);

    // 날짜 비교 
    const isSameDay = (date1, date2) => {
        return date1.getFullYear() === date2.getFullYear() &&
                date1.getMonth() === date2.getMonth() &&
                date1.getDate() === date2.getDate();
    };

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

    // 달력 뷰 변경(연도 변경)
    const onActiveStartDateChange = ({ activeStartDate }) => {
        if(currentYear !== activeStartDate.getFullYear()){
            setCurrentYear(activeStartDate.getFullYear());
        }
    };

    // 공휴일 조회
    const getHoliday = async(year) => {
        const res = await Axios.GET(`/api/rest-date?year=${year}&month=`);
        
        if (res?.data?.result === "Success") {
            let rests = res?.data?.values?.list || [];
            rests = rests.map(item => {
                return {...item, date: dateUtil.formatNumericDate(item.rest_date)};
            });
            setHoildays([...rests]);
        }
    }

    /***** useEffect *****/

    // 날짜 초기화
    useEffect(() => {
        if(time === null) {
            setTime(dateUtil.format(new Date()));
        }else{
            setTime(time);
        }
    }, [time])

    // 현재 연도 휴무일 조회
    useEffect(() => {
        getHoliday(currentYear);
    }, [currentYear]);

    return (
        <span className="calendar-wrapper">
            <div className="date-input" style={{...dateInputStyle}}>
                <input type="date" id="inputDate" value={time} max="9999-12-31" className="inputBox" onChange={(e) => setTime(e.target.value)} />
                {
                    <input type="image" value="" src={RefreshIcon} className="imgIcon" onClick={() => setTime("-")} style={{margin:"0 0.5rem"}}/>
                }
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
                                <Calendar 
                                    onChange={handleDateChange} 
                                    value={dateUtilFormat(time)} 
                                    locale="ko" 
                                    calendarType="gregory" 
                                    onActiveStartDateChange={onActiveStartDateChange}
                                    formatDay={(locale, date) => date.toLocaleString('en', { day: 'numeric' })}
                                    tileClassName={({ date, view }) => {
                                        if (view === 'month') {
                                          if ([...hoildays].some(item => isSameDay(item.date, date))) {
                                            return 'red-date';
                                          }
                                        }
                                        return null;
                                    }}
                                    tileContent={({ date, view }) => {
                                        if (view === 'month') {
                                          const match = [...hoildays].find(item => isSameDay(item.date, date));
                                          if (match) {
                                            return (
                                                <div
                                                    className="tile-tooltip"
                                                    data-tooltip-id="highlightTooltip"
                                                    data-tooltip-content={match.reason}
                                                />
                                            );
                                          }
                                        }
                                        return null;
                                    }}
                                />
                                <ReactTooltip id="highlightTooltip" delayShow={0} key={showCalendar ? 'open' : 'closed'} />
                            </OutsideClick>
                        </div>
                    )
                }
        </span>
  );
}

export default DateInput;