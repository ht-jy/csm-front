import { useState, useEffect } from "react";
import { Axios } from "../../../../../utils/axios/Axios";
import { Navigate, useNavigate } from "react-router-dom";
import { dateUtil } from "../../../../../utils/DateUtil";
import { useAuth } from "../../../../context/AuthContext";
import Select from 'react-select';
import Button from "../../../../module/Button";
import Loading from "../../../../module/Loading";
import AddDetailSchedule from "./AddDetailSchedule";
import Modal from "../../../../module/Modal";
import DetailSchedule from "./DetailSchedule";
import useTooltip from "../../../../../utils/hooks/useTooltip";
import PlusBottomIcon from "../../../../../assets/image/plus-sign.png";
import PlusIcon from "../../../../../assets/image/plus2.png";
import ArrowLeftIcon from "../../../../../assets/image/arrow-left.png";
import ArrowRightIcon from "../../../../../assets/image/arrow-right.png";
import "../../../../../assets/css/Table.css";
import "../../../../../assets/css/Schedule.css";

/**
 * @description: 일정관리 - 휴무일, 작업내용을 달력 형태로 확인 / 휴무일, 작업내용, 프로젝트 공정률, 프로젝트 장비 수정
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-04-28
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - 
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /api/rest-date (공휴일 조회), /schedule/rest (휴무일 조회), /schedule/daily-job (작업내용 조회)
 *    Http Method - POST : /schedule/rest (휴무일 저장), /schedule/daily-job (작업내용 저장) 
 *    Http Method - PUT : /schedule/rest (휴무일 수정), /schedule/daily-job (작업내용 수정)
 *    Http Method - DELETE : /schedule/rest${item.cno} (휴무일 삭제), /schedule/daily-job${item.cno} (작업내용 삭제)
 * - 주요 상태 관리: 
 */
const Schedule = () => {
    const navigate = useNavigate();
    const { project, user } = useAuth();

    const [isLoading, setIsLoading] = useState(false);
    /** 선택한 연, 월 **/
    const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
    const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()+1);
    /** 달력 날짜 배열 **/
    const [calendarSlice, setCalendarSlice] = useState([]);
    /** 셀렉트 연, 월 **/
    const [selectYear, setSelectYear] = useState([]);
    const [yearOption, setYearOption] = useState({});
    const [selectMonth, setSelectMonth] = useState([]);
    const [monthOption, setMonthOption] = useState({});
    /** 공휴일 **/
    const [hoildays, setHoildays] = useState([]);
    /** 휴무일 **/
    const [restDays, setRestDays] = useState([]);
    /** 작업내용 **/
    const [dailyJobs, setDailyJobs] = useState([]);
    /** 선택 날짜 **/
    const [clickDate, setClickDate] = useState(null);
    const [isClickDateRest, setIsClickDateRest] = useState(false);
    /** 해당 날짜 공휴일, 휴무일 **/
    const [clickRestDates, setClickRestDates] = useState([]);
    /** 해당 날짜 작업 내용 **/
    const [clickDailyJobs, setClickDailyJobs] = useState([]);
    /** 상세 모달 **/
    const [isDetailModal, setIsDetailModal] = useState(false);
    /** 추가 모달 **/
    const [isAddDetailModal, setIsAddDetailModal] = useState(false);
    /** 추가 결과 알림 모달 **/
    const [isModal, setIsModal] = useState(false);
    const [modalText, setModalText] = useState("");
    /** 툴팁 **/
    useTooltip([dailyJobs, calendarSlice]);

    // 날짜 비교 
    const isSameDay = (date1, date2) => {
        if(date1 === null || date2 === null){
            return false;
        }
        return date1.getFullYear() === date2.getFullYear() &&
                date1.getMonth() === date2.getMonth() &&
                date1.getDate() === date2.getDate();
    };

    // 연 셀렉트 이벤트
    const onChangeSelectYear = (option) => {
        setCurrentYear(option.value);
        setYearOption(option);
    }

    // 월 셀렉트 이벤트
    const onChangeSelectMonth = (option) => {
        setCurrentMonth(option.value);
        setMonthOption(option);
    }

    // 월 이동 버튼
    const onClickMonthBtn = (value) => {
        setCurrentMonth(currentMonth + value);
        setMonthOption(selectMonth.find(item => item.value === (currentMonth + value)));
    }

    // 작업내용 리스트
    const getIsSameDailyJobs = (date) => {
        const jobs = [];
        dailyJobs.map(item => {
            if(item.date.getFullYear() === date.getFullYear() && item.date.getMonth() === date.getMonth() && item.date.getDate() === date.getDate()){
                jobs.push(item);
            }
        });
        return jobs;
    }

    // 공휴일, 휴무일 리스트
    const getIsSameDates = (date) => {
        const rests = [];
        hoildays.filter(item => {
            if(item.date.getFullYear() === date.getFullYear() && item.date.getMonth() === date.getMonth() && item.date.getDate() === date.getDate()){
                rests.push({...item, is_hoilday: true});
            }
        });
        restDays.filter(day => {
            if (day.is_every_year === 'Y') {
                if(date.getMonth() + 1 === day.rest_month && date.getDate() === day.rest_day){
                    rests.push({...day, is_hoilday: false});
                }
            } else if (day.is_every_year === 'N') {
                if(date.getFullYear() === day.rest_year && date.getMonth() + 1 === day.rest_month && date.getDate() === day.rest_day){
                    rests.push({...day, is_hoilday: false});
                }
            }
        })
        return rests;
    }

    // 공휴일, 휴무일 날짜 비교 
    const isRest = (date) => {
        if(date === null){
            return false;
        }

        const rests = getIsSameDates(date);

        if(rests.length !== 0){
            return true;
        }
        return false;
    };

    // 공휴일, 휴무일 사유
    const restReason = (date) => {
        const reasons = [];
        const rests = getIsSameDates(date);
        rests.map(item => {
            reasons.push({reason: item.reason, is_hoilday: item.is_hoilday});
        });
        return reasons;
    }

    // 날짜 배열 생성
    const buildCalendarMatrix = (year, month) => {
        const lastDate = new Date(year, month, 0).getDate();
        const firstDay = new Date(year, month-1, 1).getDay(); // 0: 일요일, ... 6: 토요일

        const calendar = [];
        let week = [];

        // 첫번째 주에서 이전 달 날짜는 null
        for (let i = 0; i < firstDay; i++) {
            week.push(null);
        }

        // 해당 월의 날짜
        for (let date = 1; date <= lastDate; date++) {
            week.push(new Date(year, month - 1, date));
            if (week.length === 7) {
                calendar.push(week);
                week = [];
            }
        }

        // 마지막 주의 다음 달 날짜 null
        if (week.length > 0) {
            while (week.length < 7) {
                week.push(null);
            }
            calendar.push(week);
        }

        setCalendarSlice(calendar);
    }

    // 시작 ~ 종료 날짜 기간 ("YYYY-MM-DD")
    const getDatesBetween = (startDateStr, endDateStr) => {
        const dates = [];
        const start = new Date(startDateStr);
        const end   = new Date(endDateStr);
      
        // 현재 날짜를 start 날짜 복사본으로 초기화
        let current = new Date(start);
      
        // current가 end보다 작거나 같을 때까지 반복
        while (current <= end) {
          // YYYY-MM-DD 형식으로 맞춰서 push
          const yyyy = current.getFullYear();
          const mm   = String(current.getMonth() + 1).padStart(2, '0');
          const dd   = String(current.getDate()).padStart(2, '0');
          dates.push(`${yyyy}-${mm}-${dd}`);
      
          // 하루를 더한다
          current.setDate(current.getDate() + 1);
        }
      
        return dates;
    }

    // 공휴일, 휴무일 조회
    const getRestData = async() => {
        setIsLoading(true);

        try {
            // 공휴일
            let res = await Axios.GET(`/api/rest-date?year=${currentYear}&month=`);
            
            if (res?.data?.result === "Success") {
                let rests = res?.data?.values?.list || [];
                rests = rests.map(item => {
                    return {...item, date: dateUtil.formatNumericDate(item.rest_date)};
                });
                setHoildays([...rests]);
            }

            // 휴무일
            let jno = 0;
            if(project !== null){
                jno = project.jno;
            }
            res = await Axios.GET(`/schedule/rest?jno=${jno}&year=${currentYear}&month=${currentMonth}`);
            
            if (res?.data?.result === "Success") {
                setRestDays(res?.data?.values?.list);
            }
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    // 작업내용 조회
    const getDailyJobData = async() => {
        setIsLoading(true);

        let jno = 0;
        if(project !== null){
            jno = project.jno;
        }

        try {
            let res = await Axios.GET(`/schedule/daily-job?jno=${jno}&target_date=${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2, '0')}`);
            
            if (res?.data?.result === "Success") {
                const jobs = [];
                res?.data?.values?.list.map(item => {
                    jobs.push({...item, date: dateUtil.parseToDate(item.targetDate)});
                });
                setDailyJobs(jobs);
            }
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    /***** 상세 모달 *****/
    const onClickDetailOpen = (item) => {
        setIsClickDateRest(isRest(item));
        setClickRestDates(getIsSameDates(item));
        setClickDailyJobs(getIsSameDailyJobs(item));
        setClickDate(item);
        setIsDetailModal(true);
    }
    
    // 휴무일 수정
    const onClickRestModify = async(item) => {
        const rest = {
            cno: item.cno,
            jno: item.jno,
            is_every_year: item.is_every_year,
            rest_year: item.date.split("-")[0],
            rest_month: item.date.split("-")[1],
            rest_day: item.date.split("-")[2],
            reason: item.reason,
            mod_uno: user.uno,
            mod_user: user.userName
        }

        setIsLoading(true);

        try {
            const res = await Axios.PUT(`/schedule/rest`, rest);
            
            if (res?.data?.result === "Success") {
                getRestData();
                setModalText("휴무일 수정에 성공하였습니다.");
                setIsDetailModal(false);
            }else{
                setModalText("휴무일 수정에 실패하였습니다.\n잠시 후에 다시 시도하거나 관리자에게 문의해주세요.");
            }
            setIsModal(true);
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    // 휴무일 삭제
    const onClickRestRemove = async(item) => {
        setIsLoading(true);
        try {
            const res = await Axios.DELETE(`/schedule/rest/${item.cno}`);
            
            if (res?.data?.result === "Success") {
                getRestData();
                setModalText("휴무일 삭제에 성공하였습니다.");
                setIsDetailModal(false);
            }else{
                setModalText("휴무일 삭제에 실패하였습니다.\n잠시 후에 다시 시도하거나 관리자에게 문의해주세요.");
            }
            setIsModal(true);
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    // 작업내용 수정
    const onClickDailyJobModify = async(item) => {
        const job = {
            idx: item.idx,
            jno: item.jno,
            targetDate: dateUtil.parseToGo(item.date),
            content: item.content,
            mod_uno: user.uno,
            mod_user: user.userName
        }
        
        setIsLoading(true);
        try {
            const res = await Axios.PUT(`/schedule/daily-job`, job);
            
            if (res?.data?.result === "Success") {
                getDailyJobData();
                setModalText("작업내용 수정에 성공하였습니다.");
                setIsDetailModal(false);
            }else{
                setModalText("작업내용 수정에 실패하였습니다.\n잠시 후에 다시 시도하거나 관리자에게 문의해주세요.");
            }
            setIsModal(true);
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    // 작업내용 삭제
    const onClickDailyJobRemove = async(item) => {
        setIsLoading(true);
        try {
            const res = await Axios.DELETE(`/schedule/daily-job/${item.cno}`);
            
            if (res?.data?.result === "Success") {
                getDailyJobData();
                setModalText("작업내용 삭제에 성공하였습니다.");
                setIsDetailModal(false);
            }else{
                setModalText("작업내용 삭제에 실패하였습니다.\n잠시 후에 다시 시도하거나 관리자에게 문의해주세요.");
            }
            setIsModal(true);
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }
    
    /***** 추가 모달 *****/
    // 추가 모달 오픈
    const onClickAddDetailOpen = (item) => {
        setClickDate(item);
        setIsAddDetailModal(true);
    }

    // 휴무일 저장
    const onClicklRestSave = async(item) => {
        const rests = [];
        const rest = {
            jno: item.jno,
            is_every_year: item.is_every_year,
            rest_year: item.date.split("-")[0],
            rest_month: item.date.split("-")[1],
            rest_day: item.date.split("-")[2],
            reason: item.reason,
            reg_uno: user.uno,
            reg_user: user.userName
        }
        if(item.is_period === "Y"){
            const dates = getDatesBetween(item.date, item.period_date);
            dates.map(date => {
                rests.push({...rest, rest_year:date.split("-")[0], rest_month: date.split("-")[1], rest_day: date.split("-")[2]});
            });
        }else{
            rests.push(rest);
        }
        
        setIsLoading(true);
        try {
            const res = await Axios.POST(`/schedule/rest`, rests);
            
            if (res?.data?.result === "Success") {
                getRestData();
                setModalText("휴무일 추가에 성공하였습니다.");
                setIsAddDetailModal(false);
            }else{
                setModalText("휴무일 추가에 실패하였습니다.\n잠시 후에 다시 시도하거나 관리자에게 문의해주세요.");
            }
            setIsModal(true);
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    // 작업내용 저장
    const onClickJobSave = async(item) => {
        const jobs = [];
        const job = {
            jno: item.jno,
            content: item.reason,
            targetDate: dateUtil.parseToGo(item.date),
            reg_uno: user.uno,
            reg_user: user.userName
        }
        if(item.is_period === "Y"){
            const dates = getDatesBetween(item.date, item.period_date);
            dates.map(date => {
                jobs.push({...job, targetDate:dateUtil.parseToGo(date)});
            });
        }else{
            jobs.push(job);
        }
        
        setIsLoading(true);
        try {
            const res = await Axios.POST(`/schedule/daily-job`, jobs);
            
            if (res?.data?.result === "Success") {
                getDailyJobData();
                setModalText("작업내용 추가에 성공하였습니다.");
                setIsAddDetailModal(false);
            }else{
                setModalText("작업내용 추가에 실패하였습니다.\n잠시 후에 다시 시도하거나 관리자에게 문의해주세요.");
            }
            setIsModal(true);
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    /***** useEffect *****/

    // 셀렉트 연, 월 생성
    useEffect(() => {
        const yearOptions = [];
        for(let i=currentYear-5 ; i<currentYear+5 ; i++){
            yearOptions.push({value: i, label: i+"년"});
        }
        const monthOptions = [];
        for(let i=1 ; i<13 ; i++){
            monthOptions.push({value: i, label: i+"월"});
        }
        setSelectYear(yearOptions);
        setYearOption(yearOptions.find(item => item.value === currentYear));
        setSelectMonth(monthOptions);
        setMonthOption(monthOptions.find(item => item.value === currentMonth));
    }, []);

    // 달력 생성
    useEffect(() => {
        buildCalendarMatrix(currentYear, currentMonth);
        getRestData();
        getDailyJobData();
    }, [currentYear, currentMonth, project]);

    return(
        <div>
            <Loading isOpen={isLoading}/>

            <DetailSchedule
                isOpen={isDetailModal}
                isRest={isClickDateRest}
                restDates={clickRestDates}
                dailyJobs={clickDailyJobs}
                clickDate={clickDate}
                exitBtnClick={() => setIsDetailModal(false)}
                restModifyBtnClick={onClickRestModify}
                restRemoveBtnClick={onClickRestRemove}
                dailyJobModifyBtnClick={onClickDailyJobModify}
                dailyJobRemoveBtnClick={onClickDailyJobRemove}
            />

            <AddDetailSchedule
                isOpen={isAddDetailModal}
                clickDate={clickDate}
                exitBtnClick={() => setIsAddDetailModal(false)}
                restSaveBtnClick={onClicklRestSave}
                jobSaveBtnClick={onClickJobSave}
            />

            <Modal 
                isOpen={isModal}
                title={"일정관리"}
                text={modalText}
                confirm={"확인"}
                fncConfirm={() => setIsModal(false)}
            />

            <div onClick={() => onClickAddDetailOpen(new Date())}>
                <img
                src={PlusBottomIcon}
                alt="Custom Icon"
                style={{
                    position: 'fixed',
                    bottom: '50px',
                    right: '60px',
                    width: '50px',
                    height: '50px',
                    cursor: "pointer",
                    zIndex: 1000
                }}
                />
            </div>

            <div className="container-fluid px-4">
                <ol className="breadcrumb mb-2 content-title-box">
                    <li className="breadcrumb-item content-title">일정관리</li>
                    <li className="breadcrumb-item active content-title-sub">관리</li>
                    <div className="table-header-right">
                        {/* <Button text={"추가"} onClick={() => onClickSaveBtn()} /> */}
                    </div>
                </ol>

                <div style={{display: "flex", margin: "5px", gap: "5px", justifyContent: "center"}}>
                    <div>
                        <Button text={<img src={ArrowLeftIcon} style={{width: "15px", height: "15px", filter: "brightness(0) invert(1)"}}/>} style={{margin: 0, width: "35px", height: "38px", display: "flex", justifyContent: "center", alignItems: "center"}} onClick={() => onClickMonthBtn(-1)}/>
                    </div>
                    <div style={{width: "130px"}}>
                        <Select
                            onChange={onChangeSelectYear}
                            options={selectYear || []}
                            value={yearOption} 
                            placeholder={"선택하세요"}
                            menuPortalTarget={document.body}
                            styles={{
                                menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 999,
                                }),
                                container: (provided) => ({
                                    ...provided,
                                    width: "100%",
                                    textAlign: 'center'
                                }),
                                option: (provided, state) => ({
                                    ...provided,
                                    textAlign: 'center'
                                }),
                            }}
                        />
                    </div>
                    <div style={{width: "130px"}}>
                        <Select
                            onChange={onChangeSelectMonth}
                            options={selectMonth || []}
                            value={monthOption} 
                            placeholder={"선택하세요"}
                            menuPortalTarget={document.body}
                            styles={{
                                menuPortal: (base) => ({
                                    ...base,
                                    zIndex: 999,
                                }),
                                container: (provided) => ({
                                    ...provided,
                                    width: "100%",
                                    textAlign: 'center'
                                }),
                                option: (provided, state) => ({
                                    ...provided,
                                    textAlign: 'center'
                                }),
                            }}
                        />
                    </div>
                    <div>
                    <Button text={<img src={ArrowRightIcon} style={{width: "15px", height: "15px", filter: "brightness(0) invert(1)"}}/>} style={{margin: 0, width: "35px", height: "38px", display: "flex", justifyContent: "center", alignItems: "center"}} onClick={() => onClickMonthBtn(-1)}/>
                    </div>
                </div>

                <div className="table-container">
                    <table>
                        <thead className="fixed">
                            <tr>
                                <th>일</th>
                                <th>월</th>
                                <th>화</th>
                                <th>수</th>
                                <th>목</th>
                                <th>금</th>
                                <th>토</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                calendarSlice.map((week, week_idx) => (
                                    <tr key={`week-${week_idx}`} style={{height: "150px"}}>
                                        {
                                            week.map((item, item_idx) => (
                                                <td 
                                                    key={`item_${item_idx}`} 
                                                    style={{ 
                                                        verticalAlign: "top", 
                                                        textAlign: "left", 
                                                        padding: "10px", 
                                                        backgroundColor: isSameDay(new Date(), item) ? "#f9fdd7" : "",
                                                        overflow: "hidden"
                                                    }}
                                                >
                                                    {/* 날짜 */}
                                                    <div 
                                                        className="schedule-day"
                                                        onClick={item !== null ? () => onClickAddDetailOpen(item) : null}
                                                        style={{
                                                            color: item === null ? "black" : isRest(item) ? "red" : item.getDay() === 0 ? "red" : item.getDay() === 6 ? "blue" : "black",
                                                            cursor: item != null ? "pointer" : ""
                                                        }}
                                                    >
                                                        {
                                                            item !== null ?
                                                                item.getDate()
                                                            : ""
                                                        }
                                                        {
                                                            item !== null ?
                                                                <img src={PlusIcon} style={{width: "12px", marginLeft: "auto"}}/>
                                                            : ""
                                                        }
                                                    </div>
                                                    <div 
                                                        className="schedule-content" 
                                                        onClick={item !== null ? () => onClickDetailOpen(item) : null}
                                                        style={{
                                                            height: "100%",
                                                            cursor: item != null ? "pointer" : ""
                                                        }}
                                                    >
                                                        <div>
                                                            {
                                                                // 휴무일
                                                                item !== null && isRest(item) && restReason(item).map((reason, r_idx) => (
                                                                    reason.is_hoilday ?
                                                                        <div className="hoilday-reason" key={r_idx}>{reason.reason}</div>
                                                                    :
                                                                        <div className="rest-reason" key={r_idx}>{reason.reason}</div>
                                                                ))
                                                            }
                                                            {
                                                                // 작업내용
                                                                item !== null && getIsSameDailyJobs(item).map((job, j_idx) => (
                                                                    <div key={j_idx} style={{marginLeft: "5px"}}
                                                                        className="ellipsis-tooltip"
                                                                    >
                                                                        {`● ${job.content}`}
                                                                    </div>
                                                                )) 
                                                            }
                                                        </div>
                                                    </div>
                                                </td>
                                            ))
                                        }
                                    </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

export default Schedule;