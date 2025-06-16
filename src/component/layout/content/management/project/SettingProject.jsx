import { useEffect, useReducer, useState } from "react";
import minus from "../../../../../assets/image/minus.png"
import plus from "../../../../../assets/image/plus.png"
import { Axios } from "../../../../../utils/axios/Axios";
import { useAuth } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { dateUtil } from "../../../../../utils/DateUtil.js";
import Time24Input from "../../../../module/Time24Input";
import Select from 'react-select'
import Loading from "../../../../module/Loading";
import NumberInput from "../../../../module/NumberInput";
import Modal from "../../../../module/Modal.jsx"
import SettingProjectReducer from "./SettingProjectReducer.js";
import Button from "../../../../module/Button.jsx";


/**
 * @description: 
 * 
 * @author 작성자: 정지영
 * @created 작성일: 2025-06-16
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - Time24Input: 시간 입력
 * - NumberInput: 숫자 입력
 * - Select: 셀렉트 박스
 * - Loading: 로딩 스피너
 * - Modal: 알림 모달
 * - Button: 버튼
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /project/setting/{jno} (프로젝트설정 조회)
 *    Http Method - POST : /project/setting (프로젝트설정 추가 및 수정)
 * - 주요 상태 관리: SettingProjectReducer
 */
const SettingProject = () => {
    const {project} = useAuth();
    const navigate = useNavigate();
    
     const [state, dispatch] = useReducer(SettingProjectReducer, {
        selectOptions: {}
    });

    const [isLoading, setIsLoading] = useState(false)

    // 모드
    const [isEdit, setIsEdit] = useState(false);
    const [manhourExpand, setManHourExpand] = useState(true)     // 공수   
    const [inOutTimeExpand, setInOutTimeExpand] = useState(true)    // 출/퇴근 시간
    const [cancelCodeExpand, setCancelCodeExpand] = useState(true)     // 마감취소

    // 모달
    const [isModal, setIsModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalText, setModalText] = useState("");

    // 마감취소
    const [cancelCode, setCancelCode] = useState({value:"ONE_WEEK", label:"일주일"})

    // 프로젝트 기본 정보
    const [setting, setSetting] = useState(null)

    // 프로젝트 유예기간 코드 불러오기
    const getProjectSettingCode = async() => {
        setIsLoading(true)
        
        try {

            const res = await Axios.GET(`/code?p_code=PROJECT_SETTING`);
            if (res?.data?.result === "Success") {
                dispatch({type: "SELECT_OPTIONS", list: res?.data?.values?.list})
                
            }
        } catch (err) {
            navigate("/error")
        } finally {
            setIsLoading(false)
        }
    }

    // 프로젝트에 저장된 설정값 가져오기
    const getData = async() => {
        setIsLoading(true)

        try {
            if(project?.jno === null) return;

            const res = await Axios.GET(`/project/setting/${project.jno}`)


            if(res?.data?.result === "Success"){
                setSetting(res?.data?.values?.project[0] || null)
            }
        } catch (err) {
            navigate("/error")
        } finally {
            setIsLoading(false)
        }

    }

    // 설정 저장
    const saveData = async() => {
        setIsLoading(true)

        try {
            
            setIsEdit(false)
            const res = await Axios.POST(`/project/setting`, {
                ...setting
            })

        } catch(err) {
            navigate("/error")
        } finally {
            setIsLoading(false)
        }
            

    }

    // select 체인지 이벤트
    const selectChangeHandler = (option) => {
        setting.cancel_code = option.value
        setCancelCode(option)
    };

    // select 값 추출: 코드 값 넣으면 마감취소기간 옵션 반환
    const selectInput = (value) => {
        if (value === null) return cancelCode;
        return state.selectOptions.find(item => item.value === value)
    }

    // 분 계산하기(date타입, int타입)
    const calMinutes = (inDate, minutes) => {
        const outDate = dateUtil.parseToDate(inDate)
        outDate.setMinutes(outDate.getMinutes() + minutes)
        const hours = String(outDate.getHours()).padStart(2, "0")
        const minute = String(outDate.getMinutes()).padStart(2, "0")
        return `${hours}:${minute}`
    }

    // 공수 시간 변경
    const changeHour = (name, value, index) => {
        setSetting(prev => ({
            ...prev,
            man_hours: prev.man_hours.map((item, idx) => 
                index === idx ? {...item, [name]: Number(value)} : item)
        }))

   } 

    // 화면이 로딩될 때, SelectCode 불러오기 
    useEffect(() => {
        getProjectSettingCode()
    }, [])

    // 마감취소기간 초기 세팅
    useEffect(() => {
        if (setting === null) {
            return;
        }
        setCancelCode(selectInput(setting.cancel_code))
    }, [setting])


    // jno 선택 시
    useEffect(() => {

        if(project == null){
            setSetting(null)
            setIsModal(true)
            setModalTitle("프로젝트 설정")
            setModalText("프로젝트를 선택해 주세요.")
        }else{
            setIsEdit(false)
            getData()

        }

    }, [project?.jno]);

    return(
        <div className="container-fluid px-4">
            <Loading isOpen={isLoading} />
            <Modal 
                isOpen={isModal}
                title={modalTitle}
                text={modalText}
                confirm={"확인"}
                fncConfirm={() => setIsModal(false)}
            />
            <ol className="breadcrumb mb-2 content-title-box">
                <li className="breadcrumb-item content-title">프로젝트 설정</li>
                <li className="breadcrumb-item active content-title-sub">관리</li>
                {
                setting ?
                <div className="table-header-right me-4">
                    { isEdit ?
                        <>
                            <Button text={"저장"} onClick={() => saveData()} />
                            <Button text={"취소"} onClick={() => {getData(); setIsEdit(false)}} />
                        </>
                        :
                        <Button text={"수정"} onClick={() => setIsEdit(true)} />

                    }
                </div>
                : null
                }
            </ol>

            {
                setting ?    
                <>
                    <ol className="breadcrumb m-2 content-title-box" onClick={() => setManHourExpand((prev) => !prev)}>
                        {manhourExpand ?
                            <img src={minus} style={{ width: "20px" }} alt="..." />
                            :
                            <img src={plus} style={{ width: "20px" }} alt="..." />
                        }
                        <li style={{fontWeight: "bold", marginLeft:"5px"}}>공수시간 기준</li>
                        
                        {
                            // isEdit ?
                                // <Button text={"추가"} style={{height: "25px", padding:"0px .5rem" }}></Button>
                            // : null
                        }
                    </ol>
                    {   
                        setting.man_hours.map((manhour, idx) => (
                            manhourExpand ?   
                                <div key={idx} className="form-control m-2 ms-4" style={{width:"98%"}}>
                                    <div style={{display: "flex", height: "20px", margin:"20px 10px"}}>
                                        <div style={{width: "80px"}}>시간</div>
                                        { isEdit ?
                                            <NumberInput initNum={manhour.work_hour} setNum={(val) => changeHour("work_hour", val, idx)} min={"0"} max={"24"} style={{width:"100px"}}></NumberInput>
                                        :
                                            <div style={textStyle}>{manhour.work_hour}</div>
                                        }
                                        
                                        <div style={{width: "80px", marginLeft:"80px"}}>공수</div>
                                        { isEdit ?
                                            <NumberInput initNum={manhour.man_hour} setNum={(val) => changeHour("man_hour", val, idx)} min={"0.00"} max={"3.00"} step={0.25} style={{width:"100px"}}></NumberInput>
                                        :
                                            <div style={textStyle}>{manhour.man_hour}</div>
                                        }

                                        <div className="text-success" style={{marginLeft: "50px"}}>
                                            {manhour.work_hour}시간 이상인 경우 {manhour.man_hour}공수
                                        </div>
                                    </div>
                                </div>
                            : null
                        )
                        )
                    }

                    <hr></hr>
                    
                    <ol className="breadcrumb p-0 m-2 content-title-box" onClick={() => setInOutTimeExpand((prev) => !prev)}>
                        {inOutTimeExpand ?
                            <img src={minus} style={{ width: "20px" }} alt="..." />
                            :
                            <img src={plus} style={{ width: "20px" }} alt="..." />
                        }
                        <li style={{fontWeight: "bold", marginLeft:"5px"}}>출/퇴근시간 및 유예시간</li>
                    </ol>
                    {
                        inOutTimeExpand ? 
                            <div className="form-control m-2 ms-4" style={{width:"98%"}}>
                                <div style={{display: "flex", height: "20px", margin:"20px 10px"}}>
                                    <div style={{width: "80px"}}>출근시간</div>
                                    { isEdit ?
                                        <Time24Input time={setting.in_time} setTime={(time) => setSetting((prev) => ({...prev, in_time : time}))} style={{width:"100px"}}></Time24Input>
                                    :
                                        <div style={textStyle}>{calMinutes(setting.in_time, 0)}</div>
                                    }

                                </div>
                                <div style={{display: "flex", height: "20px", margin: "20px 10px"}}>
                                    <div style={{width: "80px"}}>퇴근시간</div>
                                    { isEdit ?
                                        <Time24Input time={setting.out_time} setTime={(time) => setSetting((prev) => ({...prev, out_time : time}))} style={{width:"100px"}}></Time24Input>
                                    :
                                        <div style={textStyle}>{calMinutes(setting.out_time, 0)}</div>    
                                    }

                                </div>
                                <div style={{display: "flex", height: "20px", margin: "20px 10px", alignItems: "center"}}>
                                    <div style={{width: "80px"}}>유예시간</div>
                                    { isEdit ?
                                        <><NumberInput initNum={setting.respite_time} setNum={(time) => setSetting((prev) => ({...prev, respite_time : Number(time)}))} min={"0"} max={"1440"} step={10} style={{width:"100px", marginRight:"5px"}}></NumberInput>{"분"}</>
                                        :
                                        <div style={textStyle}>{setting.respite_time} 분</div>
                                    } 

                                </div>

                                <div className="text-success m-2">
                                {'>'} 출근인정시간: {calMinutes(setting.in_time, setting.respite_time)} 이전
                                </div>
                                <div className="text-success m-2">
                                {'>'} 퇴근인정시간: {calMinutes(setting.out_time, -1 * setting.respite_time)} 이후
                                </div>
                            </div>
                            :
                        null
                    }

                    <hr></hr>
                    <ol className="breadcrumb p-0 m-2 content-title-box" onClick={() => setCancelCodeExpand((prev) => !prev)}>
                        { cancelCodeExpand   ?
                            <img src={minus} style={{ width: "20px" }} alt="..." />
                            :
                            <img src={plus} style={{ width: "20px" }} alt="..." />
                        }
                        <li style={{fontWeight: "bold", marginLeft:"5px"}}>마감취소기간</li>
                    </ol>
                    { cancelCodeExpand ? 
                    
                        <div className="form-control m-2 ms-4" style={{width:"98%"}}>
                            <div style={{display: "flex", height: "20px", margin: "20px 10px", alignItems:"center"}}>
                                <div style={{width: "80px"}}>기간</div>
                                { isEdit ?
                                    <Select  
                                        value={cancelCode} 
                                        options={state.selectOptions} 
                                        onChange={selectChangeHandler} 
                                        isSearchable={false}
                                        styles={{container: (provided) => ({
                                            ...provided,
                                            width: "150px",
                                        })}}>
                                    </Select>
                                :
                                    <div style={textStyle}>{selectInput(setting.cancel_code).label}</div>
                                }
                            </div>

                            <div className="text-success m-2">
                                {'>'} 기간 추가 문의: 기술연구소 담당( ☎061-809-1148 )
                            </div>

                        </div>
                    : null 
                    }
                </> 

            : 
                <div >
                    <h5 style={h5Style}>{ project ? "공사관리에 등록된 " : null } PROJECT를 선택하세요.</h5>
                        <div style={h5DivStyle}>

                            <br></br>
                            프로젝트 추가 문의: 나중에 논의 후 추가
                        </div>
                    

                </div>
        }


        </div>
    );
}

const h5Style = {
    backgroundColor: 'beige',
    color: 'black',
    padding: '1rem',
    textAlign: 'center',
    margin: '0.5rem',
    marginBottom: "0px"


} 

const h5DivStyle ={
    backgroundColor: 'beige',
    color: 'black',
    padding: '1rem',
    textAlign: 'center',
}

const textStyle ={
    width:"100px",
    textAlign: "center",
}
export default SettingProject;