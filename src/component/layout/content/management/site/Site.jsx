import React, { useState, useEffect, useReducer, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Axios } from "../../../../../utils/axios/Axios"
import { dateUtil } from "../../../../../utils/DateUtil";
import { useAuth } from "../../../../context/AuthContext";
import { Common } from "../../../../../utils/Common";
import { ObjChk } from "../../../../../utils/ObjChk";
import useTooltip from "../../../../../utils/hooks/useTooltip";
import SiteContext from "../../../../context/SiteContext";
import SiteReducer from "./SiteReducer";
import DetailModal from "./DetailModal";
import Loading from "../../../../module/Loading";
import Modal from "../../../../module/Modal";
import Button from "../../../../module/Button";
import NonUsedProjectModal from "../../../../module/modal/NonUsedProjectModal";
import DateInput from "../../../../module/DateInput";
import weather0 from "../../../../../assets/image/weather/0.png";
import weather1 from "../../../../../assets/image/weather/1.png";
import weather2 from "../../../../../assets/image/weather/2.png";
import weather3 from "../../../../../assets/image/weather/3.png";
import weather4 from "../../../../../assets/image/weather/4.png";
import weather5 from "../../../../../assets/image/weather/5.png";
import weather6 from "../../../../../assets/image/weather/6.png";
import weather7 from "../../../../../assets/image/weather/7.png";
import weather13 from "../../../../../assets/image/weather/13.png";
import weather14 from "../../../../../assets/image/weather/14.png";
import warningWeather from "../../../../../assets/image/warningWeather.png";
import LoadingIcon from "../../../../../assets/image/Loading.gif";
import "../../../../../assets/css/Table.css";
import { roleGroup, useUserRole } from "../../../../../utils/hooks/useUserRole";
import { createPortal } from "react-dom";
/**
 * @description: 현장 관리 페이지
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-10
 * @modified 최종 수정일: 2025-07-14
 * @modifiedBy 최종 수정자: 김진우
 * @modified description
 * 2025-07-14: 현장 저장시 select_date필드 추가. 공정률 수정시 날짜 구분을 하기 위함
 * 
 * @additionalInfo
 * - API:
 *    Http Method - GET : /site (현장관리 조회), /site/stats (현장상태 조회), /project/worker-count (프로젝트별 근로자 수 조회)
 *    Http Method - PUT : /site (현장관리 수정)
 * - 주요 상태 관리: useReducer
 */

const Site = () => {
    const [state, dispatch] = useReducer(SiteReducer, {
        list: [],
        code: [],
        dailyTotalCount: {},
        dailyWeather: [],
    })

    const navigate = useNavigate();
    const { user } = useAuth();
    const { isRoleValid } = useUserRole();

    const [isLoading, setIsLoading] = useState(false);
    const [isDetail, setIsDetail] = useState(false);
    const [detailTitle, setDetailTitle] = useState("");
    const [detailData, setDetailData] = useState({});
    const [detailWeather, setDetailWeather] = useState([]);
    const [isSiteAdd, setIsSiteAdd] = useState({});
    const [isNonPjModal, setIsNonPjModal] = useState(false);
    const [addSiteJno, setAddSiteJno] = useState("");
    const [selectedDate, setSelectedDate] = useState(null)
    const [showWeatherList, setShowWeatherList] = useState(false)

    // 날짜 선택 폴링
    const selectedDateStr = dateUtil.format(selectedDate, "yyyy-MM-dd");
    const nowStr = dateUtil.format(dateUtil.now(), "yyyy-MM-dd");
    const isToday = selectedDateStr === nowStr;
    const isFuture = selectedDateStr > nowStr;

    // 기상특보
    const [warningListOpen, setWarningListOpen] = useState(false);
    const [warningData, setWarningData] = useState([]);
    const warningRef = useRef();

    // modal - 현장 수정용
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalText, setModalText] = useState("");
    // modal - 현장 추가용
    const [isModal2, setIsModal2] = useState(false);
    const [modalTitle2, setModalTitle2] = useState("");
    const [modalText2, setModalText2] = useState("");
    const [modal2type, setModal2Type] = useState("");
    const [modal2Confirm, setModal2Confirm] = useState("");
    const [modal2Cancel, setModal2Cancel] = useState("");
    
    // 날씨정보
    const [weatherInfo, setWeatherInfo] = useState([]);
    const weatherRef = useRef()

    // FIXME
    const [popupPos, setPopupPos] = useState({top :0, left:0});


    // 툴팁
    useTooltip([state.list]);

    // 현장 상세
    const onClickRow = (idx) => {
        let item;
        if (state.list[idx].type === "main") {
            item = state.list[idx];
        } else {
            for (let i = idx; i > -1; i--) {
                if (state.list[i].type === "main") {
                    item = state.list[i];
                    break;
                }
            }
        }

        setDetailTitle(`${item.site_nm}`)
        setDetailData(item);
        
        const findWeather = state.dailyWeather.find(weather => weather.sno === item.sno);
        if(findWeather !== undefined){
            setDetailWeather(findWeather.weather);
        }else{
            setDetailWeather([]);
        }
        
        setIsDetail(true);
        setIsSiteAdd(false);
    }

    // 현장 관리 추가
    const onClickSaveBtn = () => {
        setIsNonPjModal(true);
    }

    // 현장 관리 추가 창 닫기
    const handleAddSiteModalExitBtn = () => {
        setIsNonPjModal(false);
    }

    // 현장 관리 추가 프로젝트 선택
    const handleOnClickProjectRow = (item) => {
        setAddSiteJno(item.jno);
        setIsModal2(true);
        setModalTitle2("현장 생성");
        setModalText2("선택한 프로젝트로 현장을 생성하겠습니까?");
        setModal2Confirm("예");
        setModal2Cancel("아니요");
        setModal2Type("ADD_SITE");
    }

    // 현장 생성 확인 모달 "예"
    const handleModal2Confirm = () => {
        if (modal2type === "ADD_SITE") {
            setIsModal2(false);
            addSite();
        } else if (modal2type === "ADD_SITE_RES") {
            setIsModal2(false);
        }
    }

    // 현장 생성 확인 모달 "아니요"
    const handleModal2Cancel = () => {
        if (modal2type === "ADD_SITE") {
            setAddSiteJno("");
            setIsModal2(false);
        } else if (modal2type === "ADD_SITE_RES") {
            setIsModal2(false);
        }
    }

    // 현장 관리 추가
    const addSite = async () => {
        const param = {
            jno: addSiteJno,
            uno: user.uno,
            user_name: user.userName
        };

        setIsLoading(true);
        try{
            const res = await Axios.POST("/site", param);

            setModalTitle2("현장 생성");
            if (res?.data?.result === "Success") {
                setModalText2("선택한 프로젝트로 현장이 생성되었습니다.");
                getData();
            } else {
                setModalText2("선택한 프로젝트로 현장을 생성하는데 실패하였습니다.");
            }
            setModal2Confirm("확인");
            setModal2Cancel("");
            setModal2Type("ADD_SITE_RES");
            setIsModal2(true);
        } catch (err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    // 현장 상세 화면 종료
    const handleExitBtn = () => {
        setIsDetail(false);
        setDetailData({});
    }

    // 현장 데이터 수정
    const saveData = async (data) => {
        data = {
            ...data,
            select_date: selectedDate,
            mod_uno: user.uno,
            mod_user: user.userName,
        }
        try {
            const res = await Axios.PUT("/site", data);
            
            if (res?.data?.result === "Success") {
                setModalText("현장 수정에 성공하였습니다.")
                setIsDetail(false);
                getData();
            } else {
                setModalText("현장 수정에 실패하였습니다.")
                
            }
            setModalTitle("현장관리 수정")
            setIsOpenModal(true);
        } catch(err) {
            navigate("/error");
        }
    }

    // 강수량과 하늘 수치로 정보 반환
    const convertWeather = (rainy, cloudy) => {
        let weatherIcon = weather0
        let weatherText = "맑음" 

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
                weatherIcon = weather7
                weatherText = "눈";
                break;
            default:
                return "-";
        }

        return <>
            <img src={`${weatherIcon}`} style={{ width: "19px" }} /> {weatherText}
            </>
    }

    // 날씨(강수형태) && 날씨(하늘상태)
    const getPtyNSkyData = (weather) => {

        const temp = weather?.filter(item => item.key === "PTY");
        // 하늘 상태 추가
        const cloudy = weather?.filter(item => item.key === "SKY");

        return convertWeather(temp[0]?.value, cloudy[0]?.value)
    }

    // 날씨(강수량)
    const getRn1Data = (weather) => {
        const temp = weather?.filter(item => item.key === "RN1");
        return ` 강수량: ${temp[0]?.value}(㎜) `;
    }

    // 날씨(기온)
    const getT1hData = (weather) => {
        const temp = weather?.filter(item => item.key === "T1H");
        return ` 기온: ${temp[0]?.value}(°C) `;
    }

    // 날씨(풍속,풍향)
    const getWindData = (weather) => {
        const temp1 = weather?.filter(item => item.key === "WSD");
        const temp2 = weather?.filter(item => item.key === "VEC");
        return ` ${temp2[0]?.value} ${temp1[0]?.value}(㎧) `;
    }

    // 날씨 버튼 클릭 시
    const weatherListClickHandler = async (e, site, idx) => {
        try{

            if (ObjChk.all(idx)) return;

            const rect = e.target.getBoundingClientRect();

            setPopupPos({
                top: rect.bottom + window.scrollY + 3,
                left: rect.left + window.scrollX - 260
            });

            if (!ObjChk.all(site?.sno)) {
                const res = await Axios.GET(`/api/weather/${site.sno}?targetDate=${selectedDate}`) 

                if (res.data.result === "Success"){
                    setWeatherInfo([...res.data.values.list])
                    setShowWeatherList(true)
                    
                } else{
                    // 날씨를 불러올 수 없습니다.
                    
                }
            }

        }catch(err){
            navigate("/error")

        }finally {
           
        }

    }

    // 현장상태 조회
    const getSiteStatsData = async () => {
        try {
            const res = await Axios.GET(`/site/stats?targetDate=${dateUtil.format(selectedDate, "yyyy-MM-dd")}`);

            if (res?.data?.result === "Success") {
                dispatch({ type: "STATS", list: res?.data?.values?.list });
            }
        } catch(err) {
            navigate("/error");
        }
    }

    // 프로젝트별 근로자 수 조회
    const getWorkerCountData = async () => {
        try {
            const res = await Axios.GET(`/project/worker-count?targetDate=${dateUtil.format(selectedDate, "yyyy-MM-dd")}`);
            
            if (res?.data?.result === "Success") {
                dispatch({ type: "COUNT", list: res?.data?.values?.list });
            }
        } catch(err) {
            navigate("/error");
        }
    }


    // 현장 정보 조회
    const getData = async () => {
        setIsLoading(true);
        try {
            const res = await Axios.GET(`/site?targetDate=${dateUtil.format(selectedDate, "yyyy-MM-dd")}&pCode=SITE_STATUS`);
            
            if (res?.data?.result === "Success") {
                dispatch({ type: "INIT", site: res?.data?.values?.site, code: res?.data?.values?.code });
            }
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    // 기상특보 현황 조회
    const getWarningData = async () => {
        try {
            const res = await Axios.GET(`/api/weather/wrn`)

            if (res?.data?.result === "Success") {
                setWarningData(res.data.values.list)
            } else if (res?.data?.result === "Failure") {

            }
        } catch(err) {
            navigate("/error");
        }
    }

    // 날씨 조회
    const getWeatherData = async () => {
        try {
            const res = await Axios.GET(`/api/weather/srt`)

            if (res?.data?.result === "Success") {
                dispatch({ type: "WEATHER", list: res?.data?.values?.list });
            } else if (res?.data?.result === "Failure") {
                
            }
        } catch(err) {
            navigate("/error");
        }
    }
    
    // 날짜 제한
    useEffect(() => {
        if (isFuture) {
            setSelectedDate(dateUtil.now());
            setModalTitle("현장 관리");
            setModalText("오늘 이후의 날짜는 선택할 수 없습니다.");
            setIsOpenModal(true);
        }
    }, [selectedDate]);

    // 현장 상태 5초 polling
    useEffect(() => {
        getData();
        getWarningData();
        getWeatherData();

        if (!isToday) return;

        const interval = setInterval(getSiteStatsData, 5000);
        return () => clearInterval(interval);
    }, [selectedDate, isToday]);

    // 근로자 수 5초 polling
    useEffect(() => {
        if (!isToday) return;

        const interval = setInterval(getWorkerCountData, 5000);
        return () => clearInterval(interval);
    }, [selectedDate, isToday]);

    // 날씨 5분 polling
    // 기상청api가 30분마다 갱신이 되기에 날씨가 변경되는 시간은 차이가 있음.
    useEffect(() => {
        
        const interval = isToday? setInterval(() => {
            getWeatherData();
        }, 300000) : null;

        return () => clearInterval(interval);
    }, [selectedDate]);

    // 기상특보 외의 클릭 시
    useEffect(() => {
        const handleClick = (e) => {
            if (warningRef.current?.contains(e.target)) {
                return;
            } else {
                setWarningListOpen(false);
            }
        };

        document.body.addEventListener("click", handleClick);
        return () => {
            document.body.removeEventListener("click", handleClick);
        };
    }, []);

    // 날씨 리스트 외의 영역 클릭 시
    useEffect(() => {
        const handleClick = (e) => {
            if (weatherRef.current?.contains(e.target)) {
                return;
            } else {
                setShowWeatherList(false);
            }
        };

        document.body.addEventListener("click", handleClick);
        return () => {
            document.body.removeEventListener("click", handleClick);
        };
    }, []);

    return (
        <div>
            <Loading
                isOpen={isLoading}
            />
            <Modal
                isOpen={isOpenModal}
                title={modalTitle}
                text={modalText}
                confirm={"확인"}
                fncConfirm={() => setIsOpenModal(false)}
            />
            <Modal
                isOpen={isModal2}
                title={modalTitle2}
                text={modalText2}
                confirm={modal2Confirm}
                fncConfirm={handleModal2Confirm}
                cancel={modal2Cancel}
                fncCancel={handleModal2Cancel}
            />
            <NonUsedProjectModal
                isOpen={isNonPjModal}
                fncExit={handleAddSiteModalExitBtn}
                onClickRow={handleOnClickProjectRow}
            />
            {
                isDetail &&
                <SiteContext.Provider value={{getData, setIsDetail}}>
                    <DetailModal
                        isOpen={isDetail}
                        setIsOpen={setIsDetail}
                        title={detailTitle}
                        detailData={detailData}
                        detailWeather={detailWeather}
                        isEditBtn={true}
                        exitBtnClick={handleExitBtn}
                        saveBtnClick={(data) => saveData(data)}
                        isSiteAdd={isSiteAdd}
                    />
                </SiteContext.Provider>
            }
            <div className="container-fluid px-4">
                <ol className="breadcrumb mb-2 content-title-box">
                    <li className="breadcrumb-item content-title">현장 관리</li>
                    <li className="breadcrumb-item active content-title-sub">관리</li>
                    
                    {
                    isRoleValid(roleGroup.SITE_MANAGER) &&   
                        <div className="table-header-right">
                            <Button text={"추가"} onClick={() => onClickSaveBtn()} />
                        </div>
                    }
                </ol>

                <div className="card mb-4">
                    <div className="card-body">
                        <div className="square-title d-flex align-items-center">
                            <div>현장 목록</div>
                            <DateInput 
                                time={dateUtil.format(selectedDate)} 
                                setTime={(value) => setSelectedDate(value)} 
                                dateInputStyle={{margin: "0px", marginLeft:"10px"}}
                            ></DateInput>
                        </div>
                        <div className="square-container">
                            {
                                state.code.length === 0 ?
                                    <></>
                                    :
                                    state.code.map((item, idx) => (
                                        <div className="square-inner" key={idx}>
                                            <div className="square" style={{ backgroundColor: item.code_color }}></div>{item.code_nm}
                                        </div>
                                    ))
                            }
                            {/* 기상특보 현황 :: start */}
                            {
                            isToday &&
                                <div
                                ref={warningRef}
                                className="weather-report icon-hover"
                                onClick={() => setWarningListOpen(prev => !prev)}
                                >
                                    <img src={warningWeather} style={{width:"30px", margin:"5px"}}></img>
                                    기상특보현황
                                </div>
                            }
                            {
                                warningListOpen ?
                                    <div style={{ width: "70%", height: "70%" }}>
                                        <div style={{ ...modalStyle }}>
                                            <div style={{ ...header }}>기상특보</div>
                                            {
                                                warningData.length === 0 ?
                                                    <div>
                                                        현재 조회된 기상특보는 없습니다.
                                                    </div>

                                                    :
                                                    warningData.map((item, idx) => (
                                                        <div style={{ ...listStyle }} key={idx}>
                                                            <div className="square-title" style={{marginTop:"10px", marginBottom:"5px"}} >{item.warning}</div>
                                                            <ul style={{ listStylePosition: "inside", paddingLeft: "0" }}>
                                                                {item.area.map((area, areaIdx) => (
                                                                    <li style={{ paddingLeft: "1.2em", textIndent: "-1.0em" }} key={areaIdx}>{area}</li>
                                                                ))
                                                                }
                                                            </ul>
                                                        </div>
                                                    ))
                                            }
                                        </div>
                                    </div>
                                    :
                                    <></>
                            }
                            {/* 기상특보현황 :: end */}
                        </div>

                    </div>
                </div>
                <div>
                    {
                    createPortal(
                    showWeatherList &&
                        <div
                            className="table-container"
                            style={{
                                position: "absolute",
                                top: popupPos.top,
                                left: popupPos.left,
                                width: "400px",
                                maxWidth:"400px",
                                minWidth:"400px",
                                background: "white",
                                borderRadius: "8px",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
                                overflowX:"hidden",
                                zIndex: 9999
                            }}
                        ref={weatherRef}
                        onClick={() => {setShowWeatherList(false); setPopupPos({top:0, left:0})}}
                        >
                            <table style={{minWidth:"400px"}}> 
                                {/* <thead>
                                    <tr>
                                        <th style={{width:"100px"}}>시각</th>
                                        <th>날씨</th>
                                    </tr>
                                </thead> */}
                            <tbody>
                            {
                            weatherInfo.length !== 0 ?
                                weatherInfo.map((weather, idx)=> (
                                    <tr style={{width:"400px", maxWidth:"400px"}} key={idx}>
                                        <td className="center" style={{width:"100px"}}>{dateUtil.formatTimeHHMM(weather.recog_time)}</td>
                                        <td className="" >
                                            {convertWeather(weather.pty, weather.sky)}
                                            {weather.rn1 && ` / 강수량: ${weather.rn1}(㎜) `}
                                            <br/>
                                            {weather.t1h && ` 기온: ${weather.t1h}(°C) `}
                                            {weather.vec && weather.wsd &&`/ ${weather.vec} ${weather.wsd}(㎧) `}
                                        </td>
                                    </tr>
                                ))                                                        
                            :
                                <tr>
                                    <td colSpan={2} style={{padding:"1rem 5rem"}}>해당 날짜의 날씨를 확인할 수 없습니다.</td>
                                </tr>
                            }
                            </tbody>
                            </table>

                        </div>,
                    document.body
                )}</div>
                <div className="table-wrapper">
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th className="fixed-left" rowSpan={2} style={{ width: "10px", left: "0px" }}></th>
                                <th className="fixed-left" rowSpan={2} style={{ width: "100px", left: "10px" }}>발주처</th>
                                <th className="fixed-left" rowSpan={2} style={{ width: "250px", left: "110px" }}>현장</th>
                                <th colSpan={2} style={{ width: "100px" }}>진행현황</th>
                                <th colSpan={2} style={{ width: "80px" }}>HTENC</th>
                                <th colSpan={2} style={{ width: "80px" }}>협력사</th>
                                <th rowSpan={2} style={{ width: "40px" }}>소계<br />(M/D)</th>
                                <th rowSpan={2} style={{ width: "40px" }}>장비</th>
                                <th rowSpan={2} style={{ width: "400px" }}>작업내용</th>
                                <th className="fixed-right" rowSpan={2} style={{ width: "180px", right: 0 }}>날씨</th>
                            </tr>
                            <tr>
                                <th style={{ width: "50px" }}>공정률<br />(%)</th>
                                <th style={{ width: "50px" }}>누계<br />(M/D)</th>
                                <th style={{ width: "40px" }}>공사</th>
                                <th style={{ width: "40px" }}>안전</th>
                                <th style={{ width: "40px" }}>관리</th>
                                <th style={{ width: "40px" }}>근로자</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                state.list.length === 0 ?
                                    <tr>
                                        <td className="center" colSpan={13}>현장 관리 내용이 없습니다.</td>
                                    </tr>
                                    :
                                    state.list.map((item, idx) => (
                                        
                                        item.type === "main" ?
                                            <tr key={idx}>
                                                {/* 현장구분 */}
                                                <td className="fixed-left" rowSpan={item.rowSpan} style={{ padding: 0, position: 'sticky', left: "0px" }}>
                                                    <div style={{
                                                        backgroundColor: item.siteStatsColor,
                                                        width: '100%',
                                                        position: 'absolute',
                                                        top: 0,
                                                        bottom: 0,
                                                        margin: "0.5px"
                                                    }}></div>
                                                </td>
                                                {/* 발주처 */}
                                                <td className="left fixed-left" rowSpan={item.rowSpan} style={{ left: "10px" }}>{item.originalOrderCompName || ""}</td>
                                                {/* 현장 */}
                                                <td className="left fixed-left ellipsis-tooltip" style={{ cursor: "pointer", left: "110px" }} onClick={() => onClickRow(idx)}>{item.site_nm || ""}</td>
                                                {/* 공정률 */}
                                                <td className="center" style={{ fontWeight: "bold" }}>{item.work_rate}%</td>
                                                {/* 누계 */}
                                                <td className="right" rowSpan={item.rowSpan} style={{ fontWeight: "bold" }}>
                                                    {
                                                        Common.formatNumber(item.project_list.reduce((sum, obj) => sum + Number(obj.worker_count_all), 0))
                                                    }
                                                </td>
                                                {/* 공사 */}
                                                <td className="right">
                                                    {
                                                        Common.formatNumber(item.project_list.reduce((sum, obj) => sum + Number(obj.worker_count_work), 0))
                                                    }
                                                </td>
                                                {/* 안전 */}
                                                <td className="right">
                                                    {
                                                        Common.formatNumber(item.project_list.reduce((sum, obj) => sum + Number(obj.worker_count_safe), 0))
                                                    }
                                                </td>
                                                {/* 관리 */}
                                                <td className="right">
                                                    {
                                                        Common.formatNumber(item.project_list.reduce((sum, obj) => sum + Number(obj.worker_count_manager), 0))
                                                    }
                                                </td>
                                                {/* 근로자 */}
                                                <td className="right">
                                                    {
                                                        Common.formatNumber(item.project_list.reduce((sum, obj) => sum + Number(obj.worker_count_not_manager), 0))
                                                    }
                                                </td>
                                                {/* 소계 */}
                                                <td className="right" style={{ fontWeight: "bold" }}>
                                                    {
                                                        Common.formatNumber(item.project_list.reduce((sum, obj) => sum + Number(obj.worker_count_date), 0))
                                                    }
                                                </td>
                                                {/* 장비 */}
                                                <td className="right" style={{ fontWeight: "bold" }}>
                                                    {
                                                        Common.formatNumber(item.project_list.reduce((sum, obj) => sum + Number(obj.equip_count), 0))
                                                    }
                                                </td>
                                                {/* 작업내용 */}
                                                <td className="left ellipsis">
                                                    {
                                                        item.project_list.length === 0 ?
                                                            // 현장에 프로젝트가 없는 경우. 그럴 경우는 없지만 만약을 위하여
                                                            <div>
                                                                <div className="center" style={{ color: "#a5a5a5" }}>
                                                                    -
                                                                </div>
                                                            </div>
                                                        :
                                                            item.project_list.length > 1 ?
                                                                // 프로젝트가 여러개일 경우
                                                                <div>
                                                                    <div>
                                                                        {
                                                                            item.daily_content_list.length > 1 ?
                                                                                // 작업내용이 있는 경우
                                                                                ""
                                                                                :
                                                                                // 작업내용이 없는 경우
                                                                                <div className="center" style={{ color: "#a5a5a5" }}>-</div>
                                                                        }
                                                                    </div>
                                                                </div>
                                                            :
                                                                // 프로젝트가 하나인 경우
                                                                <div>
                                                                    {
                                                                        item.daily_content_list.length > 1 ?
                                                                            // 작업내용이 여러개인 경우
                                                                            item.daily_content_list.map( (content, idx) => (
                                                                                <div key={idx}>● {content}</div>
                                                                            ))
                                                                        :   item.daily_content_list.length === 1 ?
                                                                            // 작업내용이 하나인 경우
                                                                            <div>● {item.daily_content_list[0]}</div>
                                                                        :   
                                                                            // 작업내용이 없는 경우
                                                                            <div className="center" style={{ color: "#a5a5a5" }}>-</div>
                                                                    }
                                                                </div>
                                                    }

                                                </td>
                                                {/* 날씨 */}
                                                <td className="center fixed-right" rowSpan={item.rowSpan} >
                                                    {
                                                        selectedDate !== dateUtil.now()
                                                        ? 
                                                        <div style={{position:"relative", overflow:"visible"}}>
                                                            <button  onClick={(e) => weatherListClickHandler(e, item, idx)} style={{...btnStyle}}>상세</button>
                                                            
                                                        </div>
                                                        : 
                                                        (
                                                            state.dailyWeather.length === 0 ?
                                                            <img src={LoadingIcon} style={{width: "23px"}}/>
                                                            :
                                                            state.dailyWeather.find(weather => weather.sno === item.sno) !== undefined ?
                                                            <>
                                                                <>{getPtyNSkyData(state.dailyWeather.find(weather => weather.sno === item.sno).weather)}</>
                                                                /
                                                                <>{getRn1Data(state.dailyWeather.find(weather => weather.sno === item.sno).weather)}</>
                                                                <br />
                                                                <>{getT1hData(state.dailyWeather.find(weather => weather.sno === item.sno).weather)}</>
                                                                /
                                                                <>{getWindData(state.dailyWeather.find(weather => weather.sno === item.sno).weather)}</>
                                                            </>
                                                            : "날씨 정보가 없습니다."
                                                        )
                                                    }
                                                </td>
                                            </tr>
                                            :
                                            <tr key={idx}>
                                                {/* 현장 */}
                                                <td className="left fixed-left ellipsis-tooltip" style={{ cursor: "pointer", left: "110px" }} onClick={() => onClickRow(idx)}><li>{item.project_nm}</li></td>
                                                {/* 공정률 */}
                                                <td className="center" style={{ fontWeight: "bold" }}>{item.work_rate}%</td>
                                                {/* 공사 */}
                                                <td className="right">{Common.formatNumber(item.worker_count_work)}</td>
                                                {/* 안전 */}
                                                <td className="right">{Common.formatNumber(item.worker_count_safe)}</td>
                                                {/* 관리 */}
                                                <td className="right">{Common.formatNumber(item.worker_count_manager)}</td>
                                                {/* 근로자 */}
                                                <td className="right">{Common.formatNumber(item.worker_count_not_manager)}</td>
                                                {/* 소계 */}
                                                <td className="right" style={{ fontWeight: "bold" }}>{Common.formatNumber(item.worker_count_date)}</td>
                                                {/* 장비 */}
                                                <td className="right" style={{ fontWeight: "bold" }}>{Common.formatNumber(item.equip_count)}</td>
                                                {/* 작업내용 */}
                                                <td className="left ellipsis">
                                                    {
                                                        item.daily_content_list.length > 1 ?
                                                            // 작업내용이 여러개인 경우
                                                            item.daily_content_list.map( (content, idx) => (
                                                                <div key={idx}>● {content}</div>
                                                            ))
                                                        :   item.daily_content_list.length === 1 ?
                                                            // 작업내용이 하나인 경우
                                                            <div>● {item.daily_content_list[0]}</div>
                                                        :   
                                                            // 작업내용이 없는 경우
                                                            <div className="center" style={{ color: "#a5a5a5" }}>-</div>
                                                    }
                                                </td>
                                                {/* 날씨 */}
                                                {/* <td className="center">날씨....</td> */}
                                            </tr>

                                    ))
                            }
                            <tr style={{fontWeight: "bold"}}>
                                <td colSpan={3} className="fixed-left" style={{backgroundColor: "#004377"}}></td>
                                <td colSpan={2} className="center">일일 누계</td>
                                <td className="right">{Common.formatNumber(state.dailyTotalCount.worker_count_work)}</td>
                                <td className="right">{Common.formatNumber(state.dailyTotalCount.worker_count_safe)}</td>
                                <td className="right">{Common.formatNumber(state.dailyTotalCount.worker_count_manager)}</td>
                                <td className="right">{Common.formatNumber(state.dailyTotalCount.worker_count_not_manager)}</td>
                                <td className="right">{Common.formatNumber(state.dailyTotalCount.worker_count_date)}</td>
                                <td className="right">{Common.formatNumber(state.dailyTotalCount.equip_count)}</td>
                                <td style={{backgroundColor: "#004377", boxShadow: "inset -0.4px 0 0 0 #004377"}}></td>
                                <td className="fixed-right" style={{backgroundColor: "#004377", boxShadow: "inset 0.4px 0 0 0 #004377"}}></td>
                            </tr>
                        </tbody>
                    </table>
                    
                </div>
                </div>
            </div>


        </div>
    );
}

export default Site;


const modalStyle = {
    position: "absolute",
    boxSizing: "border-box",
    right: "0px",
    zIndex: '9998',
    backgroundColor: 'rgb(255,255,255)',
    padding: "10px 0px",
    border: "1px solid rgb(200,200,200)",
    borderRadius: "10px",
    width: '30vw',
    minWidth: "18rem",
    maxWidth: "32rem",
    height: "35rem",
    boxShadow: '5px 5px 8px rgba(0, 0, 0, 0.5)',
    margin: '10px',
    display: 'flex',
    flexDirection: 'column',
    overflow: "unset",
    overflowY: "auto",
    overflowX: "hidden",
    alignItems: "center"
};

const header = {
    backgroundColor: 'beige',
    color: 'black',
    display: "flex",
    flexDirection: "column",
    textAlign: 'center',
    justifyContent: "center",
    borderRadius: "10px",
    width: "90%",
    height: "3rem",
    margin: ".5rem .5rem",
    fontWeight: "bold",

}

const listStyle = {
    width: "85%",
    textWrap: "wrap",
    wordBreak: "break-all",
}



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

const btnStyle = {
  color: "white",
  background: "#0d6efd",
  padding: ".25rem .375rem",
  border: "1px solid teal",
  borderRadius: ".25rem",
  fontSize: "0.875rem",
  lineHeight: 1.5,
  marginLeft: "5px",
  marginRight: "1px",
};