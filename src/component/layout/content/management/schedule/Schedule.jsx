import Slider from "rc-slider";
import { useEffect, useRef, useState } from "react";
import ReactDOM from 'react-dom';
import { useNavigate } from "react-router-dom";
import Select from 'react-select';
import "../../../../../assets/css/Schedule.css";
import "../../../../../assets/css/SiteDetail.css";
import "../../../../../assets/css/Table.css";
import ArrowLeftIcon from "../../../../../assets/image/arrow-left.png";
import ArrowRightIcon from "../../../../../assets/image/arrow-right.png";
import PlusBottomIcon from "../../../../../assets/image/plus-sign.png";
import PlusIcon from "../../../../../assets/image/plus2.png";
import weather0 from "../../../../../assets/image/weather/0.png";
import weather1 from "../../../../../assets/image/weather/1.png";
import weather13 from "../../../../../assets/image/weather/13.png";
import weather14 from "../../../../../assets/image/weather/14.png";
import weather2 from "../../../../../assets/image/weather/2.png";
import weather3 from "../../../../../assets/image/weather/3.png";
import weather4 from "../../../../../assets/image/weather/4.png";
import weather5 from "../../../../../assets/image/weather/5.png";
import weather6 from "../../../../../assets/image/weather/6.png";
import weather7 from "../../../../../assets/image/weather/7.png";
import weather from "../../../../../assets/image/weather/schedule.png";
import WorkRateIcon from "../../../../../assets/image/work-rate.png";
import { Axios } from "../../../../../utils/axios/Axios";
import { Common } from '../../../../../utils/Common';
import { dateUtil } from "../../../../../utils/DateUtil";
import useTooltip from "../../../../../utils/hooks/useTooltip";
import { ObjChk } from "../../../../../utils/ObjChk";
import { useAuth } from "../../../../context/AuthContext";
import Button from "../../../../module/Button";
import Loading from "../../../../module/Loading";
import Modal from "../../../../module/Modal";
import AddDetailSchedule from "./AddDetailSchedule";
import DetailSchedule from "./DetailSchedule";
import { useUserRole } from "../../../../../utils/hooks/useUserRole";
import { scheduleRoles } from "../../../../../utils/rolesObject/scheduleRoles";
import Radio from "../../../../module/Radio";
import NumberInput from "../../../../module/NumberInput";
import DigitFormattedInput from "../../../../module/DigitFormattedInput";

/**
 * @description: 일정 - 휴무일, 작업내용을 달력 형태로 확인 / 휴무일, 작업내용, 프로젝트 공정률, 프로젝트 장비 수정
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-04-28
 * @modified 최종 수정일: 2025-09-03
 * @modifiedBy 최종 수정자: 정지영
 * @modified description:
 * 2025-07-14: 공정률 확인 및 수정 추가. 해당 날짜의 레코드가 없으면 수정이 불가. 이에 대한 연락시 공정률 테이블에 레코드 삽입
 * 2025-07-25: 공정률 월별로 조회하도록 변경, 공정률 수정 및 작업내용 추가 마감기한에 따라 제한
 * 2025-09-03: 공정률 모달에 장비도 수정 가능하도록 추가
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /api/rest-date (공휴일 조회), /schedule/rest (휴무일 조회), /schedule/daily-job (작업내용 조회), /site/work-rate (날짜별 현장 공정률 조회), /site/work-rate/{jno}/{date} (공정률 월별 조회), /project-setting/{jno} (프로젝트 설정정보), /equip/all (장비 조회)
 *    Http Method - POST : /schedule/rest (휴무일 저장), /schedule/daily-job (작업내용 저장) 
 *    Http Method - PUT : /schedule/rest (휴무일 수정), /schedule/daily-job (작업내용 수정), /site/work-rate (공정률 수정), /equip (장비 수정)
 *    Http Method - DELETE : /schedule/rest${item.cno} (휴무일 삭제), /schedule/daily-job${item.cno} (작업내용 삭제)
 * - 주요 상태 관리: 
 */
const Schedule = () => {
    const navigate = useNavigate();
    const { project, user, setIsProject } = useAuth();
    const { isRoleValid } = useUserRole();

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
    const [holidays, setHolidays] = useState([]);
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
    const [modalTitle, setModalTitle] = useState("");
    /** 툴팁 **/
    useTooltip([dailyJobs, calendarSlice]);
    // 날씨정보
    const [weatherInfo, setWeatherInfo] = useState([]);
    const [showWeatherList, setShowWeatherList] = useState(-1)
    const weatherRef = useRef()
    const weatherRefMap = useRef({});
    const [weatherPopupPosition, setWeatherPopupPosition] = useState({ top: 0, left: 0 });
    // 설정 모달
    const [isSettingModal, setIsSettingModal] = useState();   // 변경 모달
    const [workRate, setWorkRate] = useState(0);            // 변경할 공정률 데이터
    const [workRates, setWorkRates] = useState([]);
    const [equip, setEquip] = useState(null);
    const [equips, setEquips] = useState([]);
    // 취소 기간
    const [cancelDay, setCancelDay] = useState(null);

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
        const changeMonth = currentMonth + value;
        if (changeMonth > 12) { // 12월 이상인경우 다음 해 1월로 변경
            setCurrentYear(prev => prev + 1);
            setYearOption(selectYear.find(item => item.value === currentYear + 1));
        }else if (changeMonth < 1) { // 1월 이하인 경우 이전 해 12월로 변경
            setCurrentYear(prev => prev - 1);
            setYearOption(selectYear.find(item => item.value === currentYear - 1));
        }

        setCurrentMonth( (changeMonth + 11) % 12 + 1);
        setMonthOption(selectMonth.find(item => item.value === ((changeMonth + 11) % 12 + 1)));
    }

    // 취소기한 조회
    const getProjectSetting = async () => {
        if(project === null) return;
        
        const res = await Axios.GET(`/project-setting/${project.jno}`)
        if (res?.data?.result === "Success"){
            setCancelDay(res?.data?.values?.project[0]?.cancel_day || null);
        }else{
            setCancelDay(null);
        }


    }

    // 취소기한 별 날짜 여부 체크: jno
    const checkAllowDate = (date) => {

        // 오늘날짜에서 마감취소기간을 뺀 최소 허용 기간 구하기
        const now = new Date();
        const allowDate = dateUtil.diffDay(new Date(now.getFullYear(), now.getMonth(), now.getDate()), cancelDay);
        const compDate = new Date(date);

        // 만약 선택한 날짜가 최소허용기간 보다 적으면 false 반환
        if (!ObjChk.all(cancelDay) && !ObjChk.all(compDate) && allowDate > compDate) {
            return false;
        }else{
            return true;
        }

    }

    // 공정률 확인
    const getDailyWorkRate = (date) => {
        const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}` 
        const result = workRates.filter( (workRate) => dateUtil.format(workRate.record_date) === dateStr);

        return {...result[0]};

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
        const filterRest = {}; // jno기준 휴무일
        holidays.filter(item => {
            if(item.date.getFullYear() === date.getFullYear() && item.date.getMonth() === date.getMonth() && item.date.getDate() === date.getDate()){
                rests.push({...item, is_holiday: true});
            }
        });
        restDays.filter(day => {                
            const key = day.jno;
            if( !filterRest[key] && !day.is_holiday){
                filterRest[key] = [];
            }
            if (day.is_every_year === 'Y') {
                if(date.getMonth() + 1 === day.rest_month && date.getDate() === day.rest_day){
                    filterRest[key].push({...day, is_holiday: false});
                }
            } else if (day.is_every_year === 'N') {
                if(date.getFullYear() === day.rest_year && date.getMonth() + 1 === day.rest_month && date.getDate() === day.rest_day){
                    filterRest[key].push({...day, is_holiday: false});
                }
            }
        })

        Object.keys(filterRest).forEach(key => {
            if (filterRest[key].length != 0){    
                rests.push({jno: filterRest[key], is_holiday:false});
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
        
        rests.forEach((item) => {
            if(item.is_holiday) {
                reasons.push({reason: item.reason, is_holiday: item.is_holiday});
            }
            else{
                reasons.push({reason: item.jno, is_holiday:item.is_holiday})
            }
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
                setHolidays([...rests]);
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
            let res = await Axios.GET(`/schedule/daily-job?jno=${jno}&target_date=${currentYear}-${String(currentMonth).padStart(2, '0')}`);

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

    // 이전 날씨 조회
    const onClickWeatherList = async (date, idx) => {
        try {
            if (project !== null) {
                const res = await Axios.GET(`/api/weather/${project.sno}?targetDate=${date}`);

                if (res.data.result === "Success") {
                    setWeatherInfo([...res.data.values.list]);
                    // 셀 위치 계산
                    const tdElement = weatherRefMap.current[idx]; 
                    if (tdElement) {
                        const rect = tdElement.getBoundingClientRect();
                        setWeatherPopupPosition({
                            top: rect.top + window.scrollY - 100,
                            left: rect.left + window.scrollX + rect.width - 308
                        });
                    }
                    // show/hide
                    if (showWeatherList === idx) {
                        setShowWeatherList(-1);
                    } else {
                        setShowWeatherList(idx);
                    }
                } else {
                    
                }
            }
        } catch (err) {
            navigate("/error");
        }
    };

    // 강수량과 하늘 수치로 정보 반환
    const convertWeather = (rainy, cloudy) => {
        let weatherIcon = weather0;
        let weatherText = "맑음";

        switch (rainy) {
            case "0":
                switch (cloudy) {
                    case "1":
                        weatherIcon = weather0;
                        weatherText = "맑음";
                        break;
                    case "3":
                        weatherIcon = weather13;
                        weatherText = "구름많음";
                        break;
                    case "4":
                        weatherIcon = weather14;
                        weatherText = "흐림";
                }
                break;
            case "1":
                weatherIcon = weather1;
                weatherText = "비";
                break;
            case "2":
                weatherIcon = weather2;
                weatherText = "비/눈";
                break;
            case "3":
                weatherIcon = weather3;
                weatherText = "눈";
                break;
            case "4":
                weatherIcon = weather4;
                weatherText = "소나기";
                break;
            case "5":
                weatherIcon = weather5;
                weatherText = "빗방울";
                break;
            case "6":
                weatherIcon = weather6;
                weatherText = "비/눈";
                break;
            case "7":
                weatherIcon = weather7;
                weatherText = "눈";
                break;
        }

        return <>
            <img src={`${weatherIcon}`} style={{ width: "19px" }} /> {weatherText}
            </>
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
                if (res?.data?.message.includes("중복")) {
                    setModalText("휴무일 수정에 실패하였습니다.\n지정한 날짜에 이미 휴무일이 존재합니다.\n");
                }else{
                    setModalText("휴무일 수정에 실패하였습니다.\n잠시 후에 다시 시도하거나 관리자에게 문의해주세요.\n");
                }
            }
            setModalTitle("휴무일");
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
                setModalText("휴무일 삭제에 실패하였습니다.\n잠시 후에 다시 시도하거나 관리자에게 문의해주세요.\n");
            }
            setModalTitle("휴무일");
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
            content_color: item.content_color,
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
                if (res?.data?.message.includes("중복")) {
                    setModalText("작업내용 수정에 실패하였습니다.\n지정한 날짜에 이미 작업 내용이 존재합니다.\n");
                }else{
                    setModalText("작업내용 수정에 실패하였습니다.\n잠시 후에 다시 시도하거나 관리자에게 문의해주세요.\n");
                }
            }

            setModalTitle("작업내용");
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
            const res = await Axios.DELETE(`/schedule/daily-job/${item.idx}`);
            if (res?.data?.result === "Success") {
                getDailyJobData();
                setModalText("작업내용 삭제에 성공하였습니다.");
                setIsDetailModal(false);
            }else{
                setModalText("작업내용 삭제에 실패하였습니다.\n잠시 후에 다시 시도하거나 관리자에게 문의해주세요.\n");
            }
            setModalTitle("작업내용");
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
                if (res?.data?.message.includes("중복")) {
                    setModalText("휴무일 추가에 실패하였습니다.\n지정한 날짜에 이미 같은 사유의 휴무일이 존재합니다.\n");
                }else{
                    setModalText("휴무일 추가에 실패하였습니다.\n잠시 후에 다시 시도하거나 관리자에게 문의해주세요.\n");
                }
            }
            setModalTitle("휴무일");
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
            content_color: item.content_color,
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
                if (res?.data?.message.includes("중복")) {
                    setModalText("작업내용 추가에 실패하였습니다.\n지정한 날짜에 같은 내용의 작업이 존재합니다.\n");
                }else{
                    setModalText("작업내용 추가에 실패하였습니다.\n잠시 후에 다시 시도하거나 관리자에게 문의해주세요.\n");
                }
            }
            setModalTitle("작업내용");
            setIsModal(true);
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    /***** 설정: 공정률, 장비 수 *****/
    
    // 초기 데이터와 변경 데이터 비교를 위해서 저장
    const initSettingData = {
        workRate : 0,
        equipCnt : 0,
    }; 
    
    // 설정 아이콘 틀릭 이벤트
    const onClickSetting = (date) => {
        if(project == null) return;
        const workRate = getDailyWorkRate(date);
        const dailyEquip = getDailyEquip(date);
        initSettingData["workRate"] = workRate.work_rate;
        initSettingData["equipCnt"] = dailyEquip.cnt;

        setWorkRate(workRate); // 공정률 저장
        setEquip(dailyEquip); // 장비 저장
        setIsSettingModal(true); // 설정 모달 open
        setClickDate(date); // 선택한 날짜
    }

    // 장비수 가져오기
    const getDailyEquip = (date) => {
        const strDate = dateUtil.format(date);

        const filterEquip = equips.filter(item => 
            strDate === dateUtil.format(new Date(item.record_date))
        )

        let daliyEquip;
        if ( filterEquip.length === 0) {
            daliyEquip = {
                sno: project?.sno || 0,
                jno: project?.jno || 0,
                record_date : dateUtil.parseToGo(strDate),
                cnt : 0
            };
        }else{
            daliyEquip = {...filterEquip[0]};
        } 

        return daliyEquip;
    }
    

    // 장비수 조회
    const getEquips = async() => {
        if(project == null) return;

        setIsLoading(true);
        try {
            const res = await Axios.GET(`/equip/all?jno=${project.jno}&sno=${project.sno}`);
            if (res?.data?.result === "Success") {
                setEquips(res?.data?.values?.list || []);
            }else{
                setModalText("장비 수 조회에 실패하였습니다.\n잠시 후에 다시 시도하거나 관리자에게 문의해주세요.\n");
                setModalTitle("설정");
                setIsModal(true);
                setIsSettingModal(false);
            }

        } catch(err) {

        } finally{
            setIsLoading(false);
        }

    };


    // 공정률 조회
    const getWorkRates = async() => {
        if(project == null) return;

        setIsLoading(true);
        try {
            // 공정률 조회 URL: /site/work-rate/jno/YYYY-MM
            const res = await Axios.GET(`/site/work-rate/${project.jno}/${currentYear}-${currentMonth}`);

            if (res?.data?.result === "Success") {
                setWorkRates(res?.data?.values);
            }else{
                setModalText("공정률 조회에 실패하였습니다.\n잠시 후에 다시 시도하거나 관리자에게 문의해주세요.\n");
                setModalTitle("공정률");
                setIsModal(true);
            }
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    // 공정률 변경 이벤트
    const onChangeWorkRageValue = (value) => {
        const formatValue = value;
        setWorkRate(prev => 
            { return {...prev, work_rate:formatValue}});
    }

    // 장비수 변경 이벤트
    const onChangeEquipValue = (value) => {
        
        const formatValue = Common.formatNumber(value);
        setEquip(prev => 
            { return {...prev, cnt:formatValue}});
    }

    // 설정 저장
    const clickSaveSetting = async () => {
        setIsSettingModal(false);
        if(project === null) return false;
        setIsLoading(true);

        try {

            // 장비 수정
            var res;
            if (initSettingData.equipCnt !== equip.cnt){
         
                equip.reg_uno = user.uno;
                equip.reg_user = user.userName;
                res = await Axios.POST(`/equip`, equip);
                if (res?.data?.result === "Success") {
                    getEquips();
                }else{
                    setModalText("설정 수정에 실패하였습니다.\n잠시 후에 다시 시도하거나 관리자에게 문의해주세요.\n");
                    return;
                }
            }

            // 공정률 수정
            res = null;
            if (initSettingData.workRate !== workRate.work_rate){
                
                const param = {
                    sno: project.sno || 0,
                    jno: project.jno || 0,
                    work_rate: workRate.work_rate || 0,
                    search_date: dateUtil.format(workRate.record_date) || "",
                    mod_user: user.userName,
                    mod_uno: user.uno,
                };

                if(workRate?.is_work_rate === 'N'){
                    // 공정률 레코드가 없는 경우 바로 추가할 때 필요한 코드
                    if ( !ObjChk.all(project.sno) && !ObjChk.all(project.jno)){
                        res = await Axios.POST(`/site/work-rate`, param);
                    }else{
                        setModalText("설정을 수정할 수 없습니다.\n관리자에게 문의하여 주세요.\n");
                        return;
                    }
                }else {
                    res = await Axios.PUT(`/site/work-rate`, param);
                }

                if (res?.data?.result === "Success") {
                    getWorkRates();
                    setModalText("설정 수정에 성공하였습니다.");
                }else{
                    setModalText("설정 수정에 실패하였습니다.\n잠시 후에 다시 시도하거나 관리자에게 문의해주세요.\n");
                    return;
                }
            }
        } catch(err) {
            navigate("/error");
        } finally {
            setModalTitle("설정");
            setIsModal(true);
            setIsLoading(false);
        }
    }

    // 공정률 당일날 체크(아이콘 css 용도)
    const workRateIconCss = (item) => {
        if(dateUtil.format(item) === dateUtil.format(Date.now())){
            return {
                borderTopLeftRadius: "5px",
                borderTopRightRadius: "5px",
                borderBottomLeftRadius: "5px",
                borderBottomRightRadius: "5px",
                right: "10px",
            }
        }else{
            return {
                borderTopLeftRadius: "5px",
                borderBottomLeftRadius: "5px",
                right: "34px",
            }
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

    // 날씨 리스트 외의 영역 클릭 시
    useEffect(() => {
        const handleClick = (e) => {
            if (weatherRef.current?.contains(e.target)) {
                return;
            } else {
                setShowWeatherList(-1);
            }
        };

        document.body.addEventListener("click", handleClick);
        return () => {
            document.body.removeEventListener("click", handleClick);
        };
    }, []);

    // 달력 생성
    useEffect(() => {
        buildCalendarMatrix(currentYear, currentMonth);
        getRestData();
        getDailyJobData();
        getWorkRates();
        getEquips();
    }, [currentYear, currentMonth, project]);

    // 상단의 project 표시 여부 설정: 표시
    useEffect(() => {
        setIsProject(true);
    }, [])

    // 프로젝트 변경 시 마감취소기한 조회
    useEffect(() => {
        if ( project === null ){
            setCancelDay(null);
        }else {
            getProjectSetting();
        }
    }, [project])

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
                title={modalTitle}
                text={modalText}
                confirm={"확인"}
                fncConfirm={() => setIsModal(false)}
                isConfirmFocus={true}
            />
            <Modal
                isOpen={isSettingModal}
                title={"설정"}
                content={
                    <div>
                        <div className="d-flex gap-3">
                            <div className="me-1 ms-auto">날짜: {dateUtil.format(clickDate)}</div>

                        </div>
                            <div className="read-only-input p-0 my-3" >
                                <label className="detail-text-label" style={{width: "5rem" }}>
                                    장비 
                                </label>
                                <input className="slider-input" type="text" value={equip?.cnt || 0} onChange={(e) => onChangeEquipValue(e.target.value)} style={{height: "30px", width: "5rem", textAlign: "right", paddingRight: "5px"}}/>
                                {/* <NumberInput className="slider-input" initNum={equips?.cnt} setNum={(num) => onChangeEquipValue(num)} style={{height: "30px", width: "50px", textAlign: "right", paddingRight: "5px"}}/> */}
                                &nbsp;개
                                <div className="mx-3">
                                    
                                </div>
                            </div>
                            <div className="read-only-input p-0 my-3">
                                <label className="detail-text-label" style={{width: "5rem" }}>
                                    공정률
                                </label>
                                <DigitFormattedInput initNum={workRate?.work_rate} setNum={onChangeWorkRageValue} format="3.2" style ={{height: "30px", width: "5rem", textAlign: "right", paddingRight: "5px"}}> </DigitFormattedInput>                                                               
                                &nbsp;%
                                <div style={{width: "18rem", marginLeft: "20px"}}>
                                    <Slider 
                                        min={0}
                                        max={100}
                                        value={workRate?.work_rate}
                                        onChange={onChangeWorkRageValue}
                                    />
                                </div>
                            </div>
                    </div>
                }
                confirm={"저장"}
                fncConfirm={() => clickSaveSetting()}
                cancel={"취소"}
                fncCancel={() => setIsSettingModal(false)}
            />
            {/* 하단 추가 아이콘 */}
            {
                isRoleValid(scheduleRoles.CALENDER_ADD_BTN) &&
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
            }

            <div className="container-fluid px-4">
                <ol className="breadcrumb mb-2 content-title-box">
                    <li className="breadcrumb-item content-title">일정</li>
                    <div className="table-header-right">
                        {/* <Button text={"추가"} onClick={() => onClickSaveBtn()} /> */}
                    </div>
                </ol>

                <div style={{display: "flex", margin: "5px", gap: "5px", justifyContent: "center", alignItems:"center"}}>
                    <div>
                        <Button text={<img src={ArrowLeftIcon} style={{width: "15px", height: "15px", filter: "brightness(0) invert(1)"}}/>} style={{margin: 0, width: "35px", height: "36px", display: "flex", justifyContent: "center", alignItems: "center"}} onClick={() => onClickMonthBtn(-1)}/>
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
                    <Button text={<img src={ArrowRightIcon} style={{width: "15px", height: "15px", filter: "brightness(0) invert(1)"}}/>} style={{margin: 0, width: "35px", height: "36px", display: "flex", justifyContent: "center", alignItems: "center"}} onClick={() => onClickMonthBtn(1)}/>
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
                                                    key={`item_${week_idx}_${item_idx}`} 
                                                    ref={el => {
                                                        if (el) weatherRefMap.current[`item_${week_idx}_${item_idx}`] = el;
                                                    }}
                                                    style={{ 
                                                        position:"relative",
                                                        verticalAlign: "top", 
                                                        textAlign: "left", 
                                                        padding: "10px", 
                                                        paddingBottom: project ? "30px": null,
                                                        backgroundColor: isSameDay(new Date(), item) ? "#f9fdd7" : "",
                                                    }}
                                                >   
                                                    
                                                    {
                                                        // 날씨
                                                        showWeatherList === `item_${week_idx}_${item_idx}` && (
                                                            ReactDOM.createPortal(
                                                            <div style={{
                                                                ...weatherListStyle, 
                                                                position: "fixed", 
                                                                top: `${weatherPopupPosition.top}px`,
                                                                left: `${weatherPopupPosition.left}px`}}
                                                            >
                                                                <div 
                                                                    ref={weatherRef}
                                                                    onClick={() => setShowWeatherList(-1)}
                                                                >
                                                                    {
                                                                    weatherInfo.length !== 0 ?
                                                                        weatherInfo.map((weather, idx)=> (
                                                                            <div key={`weather_${idx}`}>
                                                                                <li style={{margin:"0.5rem 1rem", fontWeight:"bold"}}>{dateUtil.formatTimeHHMM(weather.recog_time)} 시</li>
                                                                                <div style={{marginRight:"1rem", marginLeft:"2rem"}}>
                                                                                    {convertWeather(weather.pty, weather.sky)}
                                                                                    {weather.rn1 && ` / 강수량: ${weather.rn1}(㎜) `}
                                                                                    <br />
                                                                                    {weather.t1h && ` 기온: ${weather.t1h}(°C) `}
                                                                                    
                                                                                    {weather.vec && weather.wsd &&`/ ${weather.vec} ${weather.wsd}(㎧) `}
                                                                                </div>
                                                                                <br />
                                                                            </div>
                                                                        ))                                                        
                                                                    :
                                                                        <div style={{textAlign:"center", margin:"1rem 0rem"}}>
                                                                            해당 날짜의 날씨를 확인할 수 없습니다.
                                                                        </div>
                                                                    }
                                                                </div>
                                                            </div>,
                                                             document.body
                                                            )
                                                        )
                                                    }
                                                    {/* 날짜 */}
                                                    <div 
                                                        className={isRoleValid(scheduleRoles.CALENDER_ADD_BTN) ? "schedule-day schedule-day-hover" : "schedule-day"}
                                                        onClick={item !== null ? () => onClickAddDetailOpen(item) : null}
                                                        style={{
                                                            color: item === null ? "black" : isRest(item) ? "red" : item.getDay() === 0 ? "red" : item.getDay() === 6 ? "blue" : "black",
                                                            cursor: item != null && isRoleValid(scheduleRoles.CALENDER_ADD_BTN) ? "pointer" : ""
                                                        }}
                                                    >
                                                        {
                                                            item !== null ?
                                                                item.getDate()
                                                            : ""
                                                        }
                                                        {
                                                            item !== null && checkAllowDate(item) && isRoleValid(scheduleRoles.CALENDER_ADD_BTN)?
                                                                <img src={PlusIcon} style={{width: "12px", marginLeft: "auto"}}/>
                                                            : ""
                                                        }
                                                    </div>
                                                    <div 
                                                        className="schedule-content" 
                                                        onClick={item !== null ? () => onClickDetailOpen(item) : null}
                                                        style={{
                                                            height: "90%",
                                                            cursor: item != null ? "pointer" : ""
                                                        }}
                                                    >
                                                        <div>
                                                            {
                                                                // 휴무일
                                                                item !== null && isRest(item) && restReason(item).map((reason, r_idx) => (
                                                                    reason.is_holiday ?
                                                                        <div className="holiday-reason" key={r_idx}>
                                                                            {reason.reason}
                                                                        </div>
                                                                    :
                                                                        <div className="rest-reason" key={r_idx}>
                                                                        { reason.reason.map(( (rest, rest_idx) => (
                                                                                <div key={rest_idx}>{rest.reason || "\u00a0"}</div>
                                                                            )))
                                                                        }
                                                                        </div>
                                                                ))
                                                            }
                                                            {
                                                                // 작업내용
                                                                item !== null && getIsSameDailyJobs(item).map((job, j_idx) => (
                                                                    <div key={j_idx} style={{marginLeft: "5px", color:job.content_color || "black"}}
                                                                        className="ellipsis-tooltip"
                                                                    >
                                                                        {`● ${job.content}`}
                                                                    </div>
                                                                )) 
                                                            }
                                                        </div>
                                                    </div>
                                                    <div
                                                        style={{
                                                            padding: "0.5rem 0rem",
                                                            width:"100%",
                                                            height: "100%",
                                                            cursor: "pointer",
                                                            alignItems:"center",
                                                        }}
                                                    >
                                                    { item !== null && project !== null && new Date() > item &&
                                                        <div
                                                            style={{
                                                                display:"flex",
                                                                fontWeight:"bold",
                                                                position: "absolute",
                                                                bottom: "5px",
                                                                borderRadius : "5px", 
                                                                leftPadding: "2.5%",
                                                                width: "95%",
                                                                height:"32px",
                                                                padding:"0.125rem",
                                                                alignItems:"center",
                                                        }}>
                                                            {`공정 ${getDailyWorkRate(item).work_rate || 0}%`}
                                                            &nbsp;
                                                            {`장비 ${getDailyEquip(item).cnt || 0}개`}

                                                            {/* 공정률 아이콘 */}
                                                            {
                                                                item !== null && new Date(item) <= new Date(new Date().setHours(0, 0, 0, 0)) && project !== null && checkAllowDate(item) && isRoleValid(scheduleRoles.RATE_ICON) && (
                                                                    <img
                                                                        src={WorkRateIcon}
                                                                        alt="plus"
                                                                        onClick={() => onClickSetting(item)}
                                                                        style={{
                                                                            backgroundColor: "#eee",
                                                                            position: "absolute",
                                                                            padding: "3px",
                                                                            leftMargin: "auto",
                                                                            borderRadius:"5px",
                                                                            width: "24px",
                                                                            height: "24px",
                                                                            cursor: "pointer",
                                                                            zIndex: 10,
                                                                            ...workRateIconCss(item),
                                                                        }}
                                                                    />
                                                                )
                                                            }
                                                            {/* 날짜 아이콘 */}
                                                            {
                                                                item !== null && new Date(item) < new Date(new Date().setHours(0, 0, 0, 0)) && project !== null && (
                                                                    <img
                                                                        src={weather}
                                                                        alt="plus"
                                                                        onClick={() => onClickWeatherList(dateUtil.format(item), `item_${week_idx}_${item_idx}`)}
                                                                        style={{
                                                                            borderRadius:"5px",
                                                                            backgroundColor: "#eee",
                                                                            position: "absolute",
                                                                            padding:"3px",
                                                                            // bottom: "5px",
                                                                            right: "6px",
                                                                            width: "24px",
                                                                            height: "24px",
                                                                            cursor: "pointer",
                                                                            zIndex: 10
                                                                        }}
                                                                    />
                                                                )
                                                            }
                                                        </div>
                                                    }
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

const weatherListStyle = {
    position: "absolute",
    right: "0px",
    zIndex: '9998',
    backgroundColor: 'rgb(255,255,255)',
    padding: "10px 0px",
    border: "1px solid rgb(200,200,200)",
    borderRadius: "10px",
    width: '10vw',
    minWidth: "18rem",
    maxWidth: "32rem",
    height: "20rem",
    boxShadow: '5px 5px 8px rgba(0, 0, 0, 0.5)',
    margin: '10px',
    display: 'flex',
    flexDirection: 'column',
    overflow: "unset",
    overflowY: "auto",
    overflowX: "hidden",
}