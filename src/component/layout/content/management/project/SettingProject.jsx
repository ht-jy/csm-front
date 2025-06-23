import React, { useEffect, useReducer, useState } from "react";
import minus from "../../../../../assets/image/minus.png"
import plus from "../../../../../assets/image/plus.png"
import { Axios } from "../../../../../utils/axios/Axios";
import { useAuth } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { dateUtil } from "../../../../../utils/DateUtil.js";
import { ObjChk } from "../../../../../utils/ObjChk.js";
import Time24Input from "../../../../module/Time24Input";
import Select from 'react-select'
import Loading from "../../../../module/Loading";
import NumberInput from "../../../../module/NumberInput";
import Modal from "../../../../module/Modal.jsx"
import SettingProjectReducer from "./SettingProjectReducer.js";
import Button from "../../../../module/Button.jsx";
import "../../../../../assets/css/SettingProject.css";


/**
 * @description: 프로젝트 기본 설정 페이지
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
 *    Http Method - GET : /project-setting/{jno} (프로젝트설정 조회), /code (마감취소기간 코드 조회)
 *    Http Method - POST : /project-setting (프로젝트설정 추가 및 수정), /project-setting/man-hours (공수 추가 및 수정)
 *    Http Method - DELETE : /project-setting/man-hours/{mhno} (공수 삭제)
 * - 주요 상태 관리: SettingProjectReducer
 */
const SettingProject = () => {
    const {project, user} = useAuth();
    const navigate = useNavigate();
    
     const [state, dispatch] = useReducer(SettingProjectReducer, {
        selectOptions: {},
        manHours: [],
        setting: {}
    });

    const [isLoading, setIsLoading] = useState(false)

    // 모드
    const [isManHourEdit, setIsManHourEdit] = useState(false); // 공수 수정
    const [isInOutTimeEdit, setIsInOutTimeEdit] = useState(false); //출/퇴근 시간 수정
    const [isCancelCodeEdit, setIsCancelCodeEdit] = useState(false); // 마감취소기간 수정
    const [isAdd, setIsAdd] = useState(false);
    const [manHourExpand, setManHourExpand] = useState(true)     // 공수 +/-  
    const [inOutTimeExpand, setInOutTimeExpand] = useState(true)    // 출/퇴근 시간 +/-
    const [cancelCodeExpand, setCancelCodeExpand] = useState(true)     // 마감취소 +/-
    const [isDelete, setIsDelete] = useState(false);

    // 모달
    const [isModal, setIsModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalText, setModalText] = useState("");
    const [isConfirmButton, setIsConfirmButton] = useState(false);

    // 마감취소
    const [cancelCode, setCancelCode] = useState({value:"ONE_WEEK", label:"일주일"})

    // 프로젝트 기본 정보
    const [setting, setSetting] = useState(null)
    const [manHourSet, setManHourSet] = useState(null)
    const [addWorkHour, setAddWorkHour] = useState(4)
    const [addManHour, setAddManHour] = useState(0.75)



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

            const res = await Axios.GET(`/project-setting/${project.jno}`)

            if(res?.data?.result === "Success"){
                setSetting(res?.data?.values?.project[0] || null)
                dispatch({type:"SETTING", setting: res?.data?.values?.project[0] || null})
                dispatch({type: "MAN_HOURS", manHours: res?.data?.values?.project[0]?.man_hours || []})
            }
        } catch (err) {
            navigate("/error")
        } finally {
            setIsLoading(false)
        }

    }

    // 초기 값으로 초기화
    const initSetting = (type) => {
        if (type === "inOutTime") {
            setting.in_time = state.setting.in_time
            setting.out_time = state.setting.out_time
            setting.respite_time = state.setting.respite_time    
            setIsInOutTimeEdit(false)
        }else if (type === "cancelCode") {
            setCancelCode(selectInput(setting.cancel_code))

        }else if (type === "addManHour"){
            setIsAdd(false)
            setAddWorkHour(4)
            setAddManHour(0.75)
        }else if (type === "editManHour"){
            setIsAdd(false)
            setAddWorkHour(4)
            setAddManHour(0.75)
            setIsManHourEdit(false)
        }
    }

    // 수정모드 변환
    const editMode = (func) => {
        setIsManHourEdit(false)
        setIsInOutTimeEdit(false)
        setIsCancelCodeEdit(false)
        setIsAdd(false)

        if (ObjChk.all(func)) return;
        func(true)

        if (func !== setIsInOutTimeEdit) {
            initSetting("inOutTime")
        }
        
        if (func !== setIsCancelCodeEdit) {
            initSetting("cancelCode")
        }

        if (func !== setIsManHourEdit){
            initSetting("addManHour")
        }
        
    }

    // 저장 확인 모달
    const fncConfirm = () => {
        setIsModal(false)
        if(isManHourEdit){
            if (isDelete) {
                deleteManHour(manHourSet.mhno)
            } else if (manHourSet != null){
                saveManHours(manHourSet)
            }
        }else if (isCancelCodeEdit || isInOutTimeEdit) {
            saveProjectSetting()
        }
        
    }

    // 설정 저장
    const saveProjectSetting = async() => {
        setIsLoading(true)

        try {
            setting.cancel_code = cancelCode.value

            const res = await Axios.POST(`/project-setting`, {
                ...setting,
                reg_user: user.userName || "",
                reg_uno: Number(user.uno) || 0

            })

            if(res?.data?.result === "Success"){
                editMode()
                getData()
            }

        } catch(err) {
            navigate("/error")
        } finally {
            setIsLoading(false)
        }
    }

    // 삭제 확인 모달 띄우기
    const confirmDeleteManHour = (manhour) => {

        setIsDelete(true)

        setModalTitle("삭제하시겠습니까?")
        setModalText("삭제 시 현재 화면은 초기화됩니다.\n")
        setIsConfirmButton(true)
        setIsModal(true)
        setManHourSet(manhour)

    }

    // 저장 확인 모달 띄우기
    const confirmSave = () => {
        setModalTitle("저장하시겠습니까?")
        setModalText("저장 시 현재 화면은 초기화됩니다.\n")
        setIsConfirmButton(true)
        setIsModal(true)
    }

    // 공수 저장 시 유효성 검증
    const validManHours = (manhour) => {
        
        if (manhour.work_hour === 0){
            setModalTitle("입력 오류")
            setModalText("시간을 입력해 주세요.\n")
            setIsConfirmButton(false)
            setIsModal(true)
            return
        }

        for (const item of state.manHours) {
            // 현재 수정한 것은 넘기기
            if (item.mhno === manhour.mhno) continue;

            // 이미 설정된 시간이 있는 경우
            if (item.work_hour === manhour.work_hour){
                setModalTitle("입력 오류")
                setModalText(`이미 ${item.work_hour}시간은 설정되어 있습니다.\n다른 시간을 입력해 주세요.\n`)
                setIsConfirmButton(false)
                setIsModal(true)
                return
            
            // 시간은 다른데 공수가 같은 경우
            } else if (item.work_hour !== manhour.work_hour && item.man_hour === manhour.man_hour){
                setModalTitle("입력 오류")
                setModalText(`이미 ${item.work_hour === 0 ? "기본값" : item.work_hour}시간 이상은 ${item.man_hour}로 설정되어 있습니다. \n다른 공수를 입력해 주세요.\n`)
                setIsConfirmButton(false)
                setIsModal(true)
                return    

            // 이미 설정된 시간에 비해 공수가 적은 경우
            }else if(item.work_hour < manhour.work_hour && item.man_hour > manhour.man_hour ){
                setModalTitle("입력 오류")
                setModalText(`${item.work_hour}시간 이상인 경우 ${item.man_hour}로 설정되어 있습니다.\n공수를 더 높게 변경해 주세요.\n`)
                setIsConfirmButton(false)
                setIsModal(true)
                return

            // 이미 설정된 시간에 비해 공수가 큰 경우
            }else if (item.work_hour > manhour.work_hour && item.man_hour < manhour.man_hour){
                setModalTitle("입력 오류")
                setModalText(`${item.work_hour}시간 이상인 경우 ${item.man_hour}로 설정되어 있습니다.\n공수를 더 낮게 변경해 주세요.\n`)
                setIsConfirmButton(false)
                setIsModal(true)
                return
            }
        }
        setModalTitle("저장하시겠습니까?")
        setModalText("저장 시 현재 화면은 초기화됩니다.\n")
        setIsConfirmButton(true)
        setIsModal(true)
        setManHourSet(manhour)
        
    }

    // 공수 저장 Axios 요청
    const saveManHours = async(manhour) => {
        setIsLoading(true)
        try {
            if (project?.jno === null) return;

            setAddWorkHour(4)
            setAddManHour(0.75)

            const res = await Axios.POST(`/project-setting/man-hours`, {
                ...manhour,
                jno: Number(project.jno),
                reg_user: user.userName || "",
                reg_uno: Number(user.uno) || 0

            })

            if(res?.data?.result === "Success"){
                editMode()              
                getData()
            }

        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false)
        }

    }

    // 공수 삭제 Axios 요청
    const deleteManHour = async(mhno) => {
        setIsLoading(true)

        try {
            if (ObjChk.all(mhno)) return;

            const res = await Axios.DELETE(`/project-setting/man-hours/${mhno}`)

            if (res?.data?.result === "Success"){
                editMode()
                getData()
            }
        } catch(err) {

        } finally {
            setIsLoading(false)
            setIsDelete(false)


        }

    }


    // select 체인지 이벤트
    const selectChangeHandler = (option) => {
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
            setIsConfirmButton(false)
            setIsModal(true)
            setModalTitle("프로젝트 설정")
            setModalText("프로젝트를 선택해 주세요.")
        }else{
            // setIsEdit(false)
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
                confirm={isConfirmButton ? "확인": null}
                fncConfirm={() => fncConfirm()}
                cancel={isConfirmButton ? "취소" : "확인"}
                fncCancel={() => { setIsModal(false); setManHourSet(null);}}

            />
            <ol className="breadcrumb mb-2 content-title-box">
                <li className="breadcrumb-item content-title">프로젝트 설정</li>
                <li className="breadcrumb-item active content-title-sub">관리</li>
            </ol>

            {
                setting ?    
                <>
                    {/* 공수시간 기준 */}
                    <ol className="breadcrumb m-2 content-title-box" >
                        <div className="d-flex align-items-center" onClick={() => setManHourExpand((prev) => !prev)}>
                            {manHourExpand ?
                                <img src={minus} style={{ width: "20px" }} alt="..." />
                                :
                                <img src={plus} style={{ width: "20px" }} alt="..." />
                            }
                            <li style={{fontWeight: "bold", marginLeft:"5px"}}>공수시간 기준</li>
                        </div>
                        {
                            isManHourEdit ?
                                <Button text={"취소"} style={{ ...titleButtonStyle }} onClick={() => {initSetting("editManHour")}}></Button>
                            : 
                                <Button text={"수정"} style={{ ...titleButtonStyle }} onClick={() => editMode(setIsManHourEdit)}></Button>
                        }
                    </ol>

                    <div className="m-2 ms-4" style={{width:"98%"}}>
                        { manHourExpand && 
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ width: "50px" }}>시간</th>
                                    <th style={{ width: "50px" }}>공수</th>
                                    <th style={{ width: "100px"}}>설명</th>
                                    <th style={{ width: "50px" }}>버튼</th>
                                    <th style={{ width: "100px" }}>빈칸</th>
                                </tr>
                            </thead>
                            <tbody>
                            
                                { state.manHours?.length === 0  && !isAdd ?
                                    <tr key={"empty"}>
                                        <td style={{ textAlign: 'center', padding: '10px' }}>등록된 하위 코드가 없습니다.</td>
                                    </tr>
                                    : (
                                        state.manHours?.map((manhour, idx) => (
                                            <React.Fragment key={idx}>
                                            {
                                                manhour.work_hour === 0 ?
                                                    // 기본값
                                                    <tr key={idx}>
                                                        <td className="center">기본값</td>
                                                        <td className="center">
                                                            { isManHourEdit
                                                                ? 
                                                                    <NumberInput initNum={manhour.man_hour} setNum={(val) => changeHour("man_hour", val, idx)} min={"0.00"} max={"1.00"} step={0.05} style={{width:"100px", marginLeft:"5px"}}></NumberInput>
                                                                :
                                                                    `${manhour.man_hour}`
                                                            }
                                                        </td>
                                                        <td className="text-success center">출근이 찍힌 경우 {manhour.man_hour}공수</td>
                                                        <td className="left">
                                                            {   isManHourEdit ?
                                                                <>
                                                                    <Button style={{...buttonStyle, marginLeft:"calc(50% - 40px)"}} text={"저장"} onClick={() => validManHours(setting.man_hours[idx])}></Button>
                                                                    {/* <Button style={{...buttonStyle}} text={"취소"} onClick={() => setIsManHourEdit(false)}></Button> */}
                                                                </>
                                                                : null
                                                            }
                                                        </td>
                                                        <td className="center">{""}</td>
                                                    </tr>
                                                : 
                                                    (
                                                    isManHourEdit ?
                                                        <tr key={idx}>
                                                            <td className="center"><NumberInput initNum={manhour.work_hour} setNum={(val) => changeHour("work_hour", val, idx)} min={"1"} max={"24"} style={{width:"100px", marginLeft:"5px"}}></NumberInput></td>
                                                            {manhour.man_hour === 1 ? 
                                                                    <td className="center">{manhour.man_hour}</td>
                                                                :
                                                                    <td className="center"><NumberInput initNum={manhour.man_hour} setNum={(val) => changeHour("man_hour", val, idx)} min={"0.00"} max={"3.00"} step={0.05} style={{width:"100px", marginLeft:"5px"}}></NumberInput></td>
                                                                }
                                                            <td>
                                                                <div className="text-success center">
                                                                    {manhour.work_hour}시간 이상인 경우 {manhour.man_hour}공수
                                                                </div>
                                                            </td>
                                                            <td className="left">
                                                                <Button style={{...buttonStyle, marginLeft:"calc(50% - 40px)"}} text={"저장"} onClick={() => {validManHours(setting.man_hours[idx]); }}></Button>
                                                                {/* <Button style={{...buttonStyle}} text={"취소"} onClick={() => setIsManHourEdit(false)}></Button> */}
                                                                {manhour.man_hour === 1 ? 
                                                                    null
                                                                :
                                                                    <Button style={{...deleteButton}} text={"삭제"} onClick={() => {confirmDeleteManHour(setting.man_hours[idx])}}></Button>
                                                                }
                                                            </td>
                                                            <td className="center">{""}</td>
                                                        </tr>
                                                        :
                                                        <tr key={idx}>
                                                            <td className="center">{manhour.work_hour}</td>
                                                            <td className="center">{manhour.man_hour}</td>
                                                            <td>
                                                                <div className="text-success center">
                                                                    {manhour.work_hour}시간 이상인 경우 {manhour.man_hour}공수
                                                                </div>
                                                            </td>
                                                            <td className="center">
                                                            </td>
                                                            <td>{""}</td>
                                                        </tr>
                                                    )
                                                }
                                            </React.Fragment>
                                        ))
                                    )
                                }                                        
                                {
                                    isManHourEdit && !isAdd ?
                                        <tr>                                            
                                            <td className="center">
                                                { isAdd ? null :
                                                <Button text={"추가"} style={{ ...titleButtonStyle }} onClick={() => setIsAdd(true)}></Button>
                                                }
                                            </td>
                                            <td>{""}</td>
                                            <td>{""}</td>
                                            <td>{""}</td>
                                            <td>{""}</td>
                                        </tr>
                                    : null
                                }
                                {isManHourEdit && isAdd ?
                                    <tr key={setting?.man_hours.length + 1}>
                                        <td className="center"><NumberInput initNum={addWorkHour} setNum={(val) => setAddWorkHour(val)} min={"0"} max={"24"} style={{width:"100px", marginLeft:"5px"}}></NumberInput></td>
                                        <td className="center"><NumberInput initNum={addManHour} setNum={(val) => setAddManHour(val)} min={"0.00"} max={"3.00"} step={0.05} style={{width:"100px", marginLeft:"5px"}}></NumberInput></td>
                                        <td className="text-success center">{addWorkHour}시간 이상인 경우 {addManHour}공수</td>
                                        <td className="left">
                                            <Button style={{...buttonStyle, marginLeft:"calc(50% - 40px)"}} text={"저장"} onClick={() => {validManHours({work_hour: Number(addWorkHour), man_hour: Number(addManHour)})}}></Button>
                                            <Button style={{...buttonStyle}} text={"취소"} onClick={() => {initSetting("addManHour")}}></Button>
                                        </td>
                                        <td className="center">{""}</td>
                                    </tr>
                                    :
                                    null
                                }
                            
                            </tbody>
                        </table>
                        }
                    </div>
                    
                    <hr></hr>
                    {/* 출/퇴근시간 및 유예시간 */}
                    <ol className="breadcrumb p-0 m-2 content-title-box" >
                        <div className="d-flex align-items-center" onClick={() => setInOutTimeExpand((prev) => !prev)}>
                            {inOutTimeExpand ?
                                <img src={minus} style={{ width: "20px" }} alt="..." />
                                :
                                <img src={plus} style={{ width: "20px" }} alt="..." />
                            }
                            <li style={{fontWeight: "bold", marginLeft:"5px"}}>출/퇴근시간 및 유예시간</li>
                        </div>
                        {
                            isInOutTimeEdit ?
                                <div className="center">
                                    <Button style={{...titleButtonStyle}} text={"저장"} onClick={() => confirmSave()}></Button>
                                    <Button style={{...titleButtonStyle}} text={"취소"} onClick={() => initSetting("inOutTime")}></Button>
                                </div>
                            : 
                                <Button text={"수정"} style={{ ...titleButtonStyle }} onClick={() => editMode(setIsInOutTimeEdit)}></Button>
                        }
                    </ol>
                    {
                        inOutTimeExpand ? 
                            <div className="form-control m-2 ms-4" style={{width:"98%"}}>
                                <div style={{display: "flex", height: "20px", margin:"20px 10px"}}>
                                    <div style={{width: "80px"}}>출근시간</div>
                                    { isInOutTimeEdit ?
                                        <Time24Input time={state.setting.in_time} setTime={(time) => setSetting((prev) => ({...prev, in_time : time}))} style={{width:"100px", marginRight:"5px"}}></Time24Input>
                                    :
                                        <div className="text-style">{calMinutes(setting.in_time, 0)}</div>
                                    }

                                </div>
                                <div style={{display: "flex", height: "20px", margin: "20px 10px"}}>
                                    <div style={{width: "80px"}}>퇴근시간</div>
                                    {isInOutTimeEdit ?
                                        <Time24Input time={state.setting.out_time} setTime={(time) => setSetting((prev) => ({...prev, out_time : time}))} style={{width:"100px", marginRight:"5px"}}></Time24Input>
                                    :
                                        <div className="text-style">{calMinutes(setting.out_time, 0)}</div>    
                                    }

                                </div>
                                <div style={{display: "flex", height: "20px", margin: "20px 10px", alignItems: "center"}}>
                                    <div style={{width: "80px"}}>유예시간</div>
                                    { isInOutTimeEdit ?
                                        <><NumberInput initNum={state.setting.respite_time} setNum={(time) => setSetting((prev) => ({...prev, respite_time : Number(time)}))} min={"0"} max={"1440"} step={10} style={{width:"100px", marginRight:"5px"}}></NumberInput>{"분"}</>
                                        :
                                        <div className="text-style">{setting.respite_time} 분</div>
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
                    {/* 마감취소기간 */}
                    <ol className="breadcrumb p-0 m-2 content-title-box" >
                        <div className="d-flex align-items-center" onClick={() => setCancelCodeExpand((prev) => !prev)}>
                            {cancelCodeExpand ?
                                <img src={minus} style={{ width: "20px" }} alt="..." />
                                :
                                <img src={plus} style={{ width: "20px" }} alt="..." />
                            }
                            <li style={{fontWeight: "bold", marginLeft:"5px"}}>마감취소기간</li>
                        </div>
                        {
                            isCancelCodeEdit ?
                                <div className="center">
                                    <Button style={{...titleButtonStyle}} text={"저장"} onClick={() => {confirmSave()}}></Button>
                                    <Button text={"취소"} style={{ ...titleButtonStyle }} onClick={() => setIsCancelCodeEdit(false)}></Button>
                                </div>

                            : 
                                <Button text={"수정"} style={{ ...titleButtonStyle }} onClick={() => editMode(setIsCancelCodeEdit)}></Button>
                        }
                    </ol>
                    { cancelCodeExpand ? 
                    
                        <div className="form-control m-2 ms-4" style={{width:"98%"}}>
                            <div style={{display: "flex", height: "20px", margin: "20px 10px", alignItems:"center"}}>
                                <div style={{width: "80px"}}>기간</div>
                                { isCancelCodeEdit ?
                                    <Select  
                                        value={cancelCode} 
                                        options={state.selectOptions} 
                                        onChange={selectChangeHandler} 
                                        isSearchable={false}
                                        styles={{container: (provided) => ({
                                            ...provided,
                                            width: "150px",
                                            textAlign:"center",
                                        })}}>
                                    </Select>
                                :
                                    <div className="text-style">{selectInput(setting.cancel_code).label}</div>
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
                    <h5 className="h5-style">{ project ? "공사관리에 등록된 " : null } PROJECT를 선택하세요.</h5>
                        <div className="h5-div-style">

                            <br></br>
                            프로젝트 추가 문의: 담당자( ☎061-690-0000 )
                        </div>
                    

                </div>
        }
        </div>
    );
}

const buttonStyle = {
    padding: "3px 5px",
    fontSize: "14px"
}

const titleButtonStyle = {
    height: "25px", 
    padding:"0px .5rem",
    fontSize:"14px"
}

const deleteButton = {
  padding: "3px 5px",
  fontSize: "14px",
  color: "#fff",                  /* 버튼 글자 색 */
  backgroundColor: "#dc3545",      /* 주황빛 경고 색상 */
  borderColor: "#dc3545"          /* 동일하게 테두리 색 지정 */
}

export default SettingProject;