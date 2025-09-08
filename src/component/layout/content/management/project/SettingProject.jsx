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
import TextInput from "../../../../module/TextInput.jsx";
import { useUserRole } from "../../../../../utils/hooks/useUserRole.js";
import { ProjectSettingRoles } from './../../../../../utils/rolesObject/projectSettingRoles';

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
 * - TextInput: 글자 입력
 * - Select: 셀렉트 박스
 * - Loading: 로딩 스피너
 * - Modal: 알림 모달
 * - Button: 버튼
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /project-setting/{jno} (프로젝트설정 조회), /code (마감취소기간 코드 조회)
 *    Http Method - POST : /project-setting (프로젝트설정 추가 및 수정), /project-setting/man-hours (공수 추가 및 수정), /project-setting/man-hours/{mhno} (공수 삭제)
 * - 주요 상태 관리: SettingProjectReducer
 */
const SettingProject = () => {
    const {project, user, setIsProject} = useAuth();
    const navigate = useNavigate();
    
    const [state, dispatch] = useReducer(SettingProjectReducer, {
        selectOptions: [{value:"ONE_WEEK", label:"7일"}],
        manHours: [],
        setting: {}
    });

    const [isLoading, setIsLoading] = useState(false)
    const { isRoleValid } = useUserRole();
    const allListRole = isRoleValid(ProjectSettingRoles.SETTING_LIST);
    const workHourModRole = isRoleValid(ProjectSettingRoles.WORK_HOUR_MOD);
    const periodHourModRole = isRoleValid(ProjectSettingRoles.PERIOD_HOUR_MOD);
    const deadlineCancelModRole = isRoleValid(ProjectSettingRoles.DEADLINE_CANCEL_MOD);
    // 모드
    const [isManHourEdit, setIsManHourEdit] = useState(false); // 공수 수정
    const [isInOutTimeEdit, setIsInOutTimeEdit] = useState(false); //출/퇴근 시간 수정
    const [isCancelCodeEdit, setIsCancelCodeEdit] = useState(false); // 마감취소기간 수정
    const [manHourExpand, setManHourExpand] = useState(true)     // 공수 +/-  
    const [inOutTimeExpand, setInOutTimeExpand] = useState(true)    // 출/퇴근 시간 +/-
    const [cancelCodeExpand, setCancelCodeExpand] = useState(true)     // 마감취소 +/-
    const [deleteMH, setDeleteMH] = useState(null);

    // 모달
    const [isModal, setIsModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalText, setModalText] = useState("");
    const [isConfirmButton, setIsConfirmButton] = useState(false);

    // 마감취소
    const [cancelCode, setCancelCode] = useState({value:"ONE_WEEK", label:"7일"})

    // 프로젝트 기본 정보
    const [setting, setSetting] = useState(null)
    const [manHours, setManHours] = useState([])

        
    // 모달 확인 클릭 시 실행할 함수
    const fncConfirm = () => {
        setIsModal(false)
        if(isManHourEdit){

            // 삭제를 확인 누르는 경우
            if (deleteMH !== null) {
                deleteManHour(deleteMH)

            // 공수시간 저장 누르는 경우
            } else if (manHours.length !== 0){
                saveManHours()
            }
        // 프로젝트설정정보 저장 누르는 경우
        }else if (isCancelCodeEdit || isInOutTimeEdit) {
            saveProjectSetting()
        }
        
    }

    // 수정모드 변환
    const editMode = (func) => {
        setIsManHourEdit(false)
        setIsInOutTimeEdit(false)
        setIsCancelCodeEdit(false)

        if (ObjChk.all(func)) return;
        func(true)

        if (func !== setIsInOutTimeEdit) {
            initSetting("inOutTime")
        }
        
        if (func !== setIsCancelCodeEdit) {
            initSetting("cancelCode")
        }

        if (func !== setIsManHourEdit){
            initSetting("editManHour")
        }
        
    }

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

            const res = await Axios.GET(`/project-setting/${project.jno}?isRole=${allListRole}`)

            if(res?.data?.result === "Success"){
                setSetting(res?.data?.values?.project[0] || null)
                setManHours(res?.data?.values?.project[0]?.man_hours || [])
                dispatch({type:"SETTING", setting: res?.data?.values?.project[0] || null})
                dispatch({type: "MAN_HOURS", manHours: res?.data?.values?.project[0]?.man_hours || []})
            }
        } catch (err) {
            navigate("/error")
        } finally {
            setIsLoading(false)
        }

    }

    // 설정 저장
    const saveProjectSetting = async() => {
        setIsLoading(true)

        try {
            setting.cancel_code = cancelCode.value

            // 데이터 변화 감지 해서 로그 메시지 넣기.
            let message = "[UPDATE] "
            let flag = false
            if (setting.respite_time !== state.setting.respite_time){
                message += `respite_time:[before:${state.setting.respite_time}, after:${setting.respite_time}]`
                flag = true
            }
            if (setting.in_time !== state.setting.in_time){
                message += `in_time:[before:${state.setting.in_time}, after:${setting.in_time}]`
                flag = true
            }
            if (setting.out_time !== state.setting.out_time){
                message += `out_time:[before:${state.setting.out_time}, after:${setting.out_time}]`
                flag = true
            }
            if (setting.cancel_code !== state.setting.cancel_code){
                message += `cancel_code:[before:${state.setting.cancel_code}, after:${setting.cancel_code}]`
                flag = true
            }
            if (flag){
                setting.message = message
            }

            // axios 요청보내기
            const res = await Axios.POST(`/project-setting`, {
                ...setting,
                reg_user: user.userName || "",
                reg_uno: Number(user.uno) || 0,
                mod_user: user.userName || "",
                mod_uno: Number(user.uno) || 0

            })

            if(res?.data?.result === "Success"){
                editMode()
                getData()

                // 성공 모달
                setModalTitle("저장 성공")
                setModalText("저장에 성공하였습니다. \n")
                setIsConfirmButton(false)
                setIsModal(true)
            }else{
                setModalTitle("저장 실패")
                setModalText("저장에 실패하였습니다. \n다시 한번 시도해주세요. \n")
                setIsConfirmButton(false)
                setIsModal(true)
            }
        } catch(err) {
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

        }else if (type === "editManHour"){
            setIsManHourEdit(false)
            setManHours(state.manHours)
            setDeleteMH(null)
        }
    }

    
    // 저장 확인 모달 띄우기
    const confirmSave = () => {
        setModalTitle("저장하시겠습니까?")
        setModalText("저장 시 현재 화면은 초기화됩니다.\n")
        setIsConfirmButton(true)
        setIsModal(true)
    }

    // 공수 삭제 시 해당 객체 없애고 다음 객체
    const deleteManHour = (manhour) => {
        setIsLoading(true)

        try {
            if (ObjChk.all(manhour?.mhno)) return;
            
            manhour.reg_uno = Number(user.uno) || 0
            manhour.reg_user = user.userName || ""
            manhour.mod_uno = Number(user.uno) || 0
            manhour.mod_user = user.userName || ""
            
            // mhno와 같은 객체를 빼고 반환
            setManHours( prev => 
                prev.filter((item, idx) => 
                    item.mhno !== manhour.mhno 
                )
            )
                        
        } catch(err) {

        } finally {
            setIsLoading(false)
            setDeleteMH(null)
        }
    }

    // 공수 저장 Axios 요청
    const saveManHours = async() => {
        setIsLoading(true)
        try {
            if (project?.jno === null) return;

            const res = await Axios.POST(`/project-setting/man-hours`, manHours)

            if(res?.data?.result === "Success"){
                editMode()              
                getData()

                // 성공 모달
                setModalTitle("저장 성공")
                setModalText("저장에 성공하였습니다. \n")
                setIsConfirmButton(false)
                setIsModal(true)

            } else {
                setModalTitle("저장 실패")
                setModalText("저장에 실패하였습니다. \n다시 한번 시도해주세요. \n")
                setIsConfirmButton(false)
                setIsModal(true)
            }

        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false)
        }

    }

    // 공수 저장 시 유효성 검증 및 로그 삽입
    const validManHours = () => {
        
        const sorted = [...manHours].sort((o1, o2) => o2.work_hour - o1.work_hour)

        const result = []
        let before_work = -1;
        let before_man = -1;
        let message;
        for (const [idx, manhour] of sorted.entries()) {
    
            // 값이 입력되지 않은 것은 넘기기
            if (idx !== 0 && (manhour.work_hour === 0 ) ){
                continue
            }

            // 마이너스 값은 경고
            if (manhour.work_hour < 0 || manhour.man_hour < 0){
                setModalTitle("입력 오류")
                setModalText(`마이너스 값은 입력할 수 없습니다. \n`)
                setIsConfirmButton(false)
                setIsModal(true)
                return
            }

            // 이미 설정된 시간이 있는 경우
            if (before_work === manhour.work_hour){
                setModalTitle("입력 오류")
                setModalText(`이미 ${manhour.work_hour}시간은 설정되어 있습니다.\n다른 시간을 입력해 주세요.\n`)
                setIsConfirmButton(false)
                setIsModal(true)
                return
            
            // 시간은 다른데 공수가 같은 경우
            } else if (before_work !== manhour.work_hour && before_man === manhour.man_hour){
                setModalTitle("입력 오류")
                setModalText(`이미 ${before_work}시간 이하인 경우 ${manhour.man_hour}공수로 설정되어 있습니다. \n다른 공수를 입력해 주세요.\n`)
                setIsConfirmButton(false)
                setIsModal(true)
                return    

            // 이미 설정된 시간에 비해 공수가 적은 경우
            }else if(before_work < manhour.work_hour && before_man > manhour.man_hour ){
                setModalTitle("입력 오류")
                setModalText(`${before_work}시간 이상인 경우 ${before_man}공수로 설정되어 있습니다.\n${manhour.work_hour}시간 공수를 더 높게 변경해 주세요.\n`)
                setIsConfirmButton(false)
                setIsModal(true)
                return

            // 이미 설정된 시간에 비해 공수가 큰 경우
            }else if (before_work > manhour.work_hour && before_man < manhour.man_hour){
                setModalTitle("입력 오류")
                setModalText(`${before_work}시간 이상인 경우 ${before_man}공수로 설정되어 있습니다.\n${manhour.work_hour}시간 공수를 더 낮게 변경해 주세요.\n`)
                setIsConfirmButton(false)
                setIsModal(true)
                return
            }

            before_work = manhour.work_hour
            before_man = manhour.man_hour
                                           
            message = `[ADD] work_hour:[before:N/A, after:${manhour.work_hour}]|man_hour:[before:N/A, after:${manhour.man_hour}]|etc:[before:N/A, after:${manhour.etc}]`
            manhour.message = message

            // 다시 배열 넣기
            result.push({
                ...manhour,
                reg_uno: Number(user.uno) || 0,
                reg_user: user.userName || "",                
                mod_uno: Number(user.uno) || 0,
                mod_user: user.userName || ""                
            })
        }

        setModalTitle("저장하시겠습니까?")
        setModalText("저장 시 현재 화면은 초기화됩니다.\n")
        setIsConfirmButton(true)
        setIsModal(true)
        setManHours(result)

    }


    // 공수시간 추가 버튼 시 값 추가
    const addManHourSet = () => {
        // 추가 버튼 누르는 경우 추가할 데이터셋
        const manhourSet = {
            mhno:null,
            work_hour:0,
            man_hour:0,
            jno: project?.jno,
            etc: ''
        }

        setManHours(prev => [
            ...prev,
            manhourSet
        ])
    }

    // 추가 버튼 취소 시
    const addCancelClick = (index) => {
        setManHours(prev => 
            prev.filter((item, idx) => idx !== index )
        )
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
        // 추가시 공수의 work_hour가 변경될 경우, man_hour 0으로 초기화.
        setManHours( prev => 
            prev.map((item, idx) => 
            index === idx ? 
                {...item, [name]: name === "etc" ? value : Number(value)}  
            : 
                item
        ))
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
        }else {
            getData()
        }

    }, [project?.jno]);

    // 상단의 project 표시 여부 설정: 표시
    useEffect(() => {
        setIsProject(true);
    }, [])

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
                fncCancel={() => { setIsModal(false); setDeleteMH(null)}}
                isCancelFocus={!isConfirmButton}
            />
            <ol className="breadcrumb mb-2 content-title-box">
                <li className="breadcrumb-item content-title">프로젝트 설정</li>
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
                            <>
                                <Button text={"저장"} style={{ ...titleButtonStyle }} onClick={() => validManHours()}></Button>
                                <Button text={"취소"} style={{ ...titleButtonStyle }} onClick={() => {initSetting("editManHour")}}></Button>
                            </>
                            : 
                                workHourModRole && <Button text={"수정"} style={{ ...titleButtonStyle }} onClick={() => editMode(setIsManHourEdit)}></Button>
                        }
                        {/* {

                        isManHourEdit && 
                        <div className="ms-auto me-0">
                            <i className="fa-solid fa-bell"></i> 삭제는 한 건씩 가능합니다.
                        </div>
                        } */}
                    </ol>

                    <div className="m-2 ms-4" style={{width:"98%"}}>
                    { manHourExpand && 
                        ( manHours.length === 0 ?
                            <table>
                                <tr key={"empty"}>
                                    <td style={{ textAlign: 'center', padding: '10px' }}>등록된 하위 코드가 없습니다.</td>
                                </tr>
                            </table>

                        : (
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "50px" }}>시간</th>
                                        <th style={{ width: "50px" }}>공수</th>
                                        <th style={{ width: "100px"}}>설명</th>
                                        <th style={{ width: "100px"}}>비고</th>
                                        <th style={{ width: "50px" }}>{""}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                { manHours.map((manhour, idx) => {
                                    return (
                                        idx === 0 ?
                                            <React.Fragment  key={idx}>
                                                <tr key={idx}>
                                                    <td className="center">
                                                        {isManHourEdit ?
                                                            <NumberInput initNum={manhour.work_hour} setNum={(val) => changeHour("work_hour", val, idx)} fixed={0} min={"0"} max={"24"} style={{ width: "100px", marginLeft: "5px" }}></NumberInput>
                                                            :
                                                            `${manhour.work_hour}시간 이상`
                                                        }
                                                    </td>
                                                    <td className="center">
                                                            {1}
                                                    </td>
                                                    <td className="center text-success">
                                                            {manhour.work_hour}시간 이상인 경우 1공수
                                                    </td>
                                                    <td className="center">{""}</td>
                                                    <td className="left">{}</td>
                                                </tr>
                                                <tr>
                                                    <td className="center">{manhour.work_hour}시간 이하</td>
                                                    <td className="center">
                                                        {isManHourEdit
                                                            ?
                                                            <NumberInput initNum={manhour.man_hour} setNum={(val) => changeHour("man_hour", val, idx)} min={"0"} max={"1.0"} fixed={1} step={0.1} style={{ width: "100px", marginLeft: "5px" }}></NumberInput>
                                                            :
                                                            `${manhour.man_hour}`}
                                                    </td>
                                                    <td className="center text-success">
                                                            {manhour.work_hour}시간 이하인 경우 {manhour.man_hour}공수
                                                    </td>
                                                    <td className="center">
                                                            {isManHourEdit ?
                                                                <TextInput initText={manhour.etc || ""} setText={(val) => changeHour("etc", val, idx)} style={{width:"95%"}} ></TextInput>
                                                            :
                                                                manhour.etc
                                                            }
                                                    </td>
                                                    <td className="left">{""}</td>
                                                </tr>
                                            </React.Fragment>
                                            :
                                            (
                                            isManHourEdit ?
                                                <tr key={idx}>
                                                    <td className="center"><NumberInput initNum={manhour.work_hour} setNum={(val) => changeHour("work_hour", val, idx)} fixed={0}  min={"0"} max={manHours[0].work_hour - 1} style={{ width: "100px", marginLeft: "5px" }}></NumberInput></td>
                                                    <td className="center"><NumberInput initNum={manhour.man_hour} setNum={(val) => changeHour("man_hour", val, idx)} min={"0"} max={manHours[0].man_hour < 0.1 ? 0 : (manHours[0].man_hour - 0.1).toFixed(1)} fixed={1} step={0.1} style={{ width: "100px", marginLeft: "5px" }}></NumberInput></td>
                                                    <td className="center text-success">
                                                        {manhour.work_hour}시간 이하인 경우 {manhour.man_hour}공수
                                                    </td>
                                                    <td className="center"><TextInput initText={manhour.etc || ""} setText={(val) => changeHour("etc", val, idx)} style={{width:"95%"}} ></TextInput></td>
                                                    <td className="center">
                                                        {
                                                            manhour.mhno ?
                                                            <Button style={{ ...deleteButton }} text={"삭제"} onClick={() => { deleteManHour(manhour); } }></Button>
                                                            :
                                                            <Button style={{ ...deleteButton }} text={"삭제"} onClick={() =>addCancelClick(idx)}></Button>
                                                        }
                                                    </td>
                                                </tr>
                                                :
                                                <tr key={idx}>
                                                    <td className="center">{manhour.work_hour}</td>
                                                    <td className="center">{manhour.man_hour}</td>
                                                    <td className="center text-success">
                                                        {manhour.work_hour}시간 이하인 경우 {manhour.man_hour}공수
                                                    </td>
                                                    <td className="center">{manhour.etc}</td>
                                                    <td className="center">{""}</td>
                                                </tr>
                                            )
                                        )
                                    })
                                }
                                {
                                    isManHourEdit &&
                                        <tr>                                            
                                            <td className="center">
                                                <Button text={"추가"} style={{ ...titleButtonStyle }} onClick={() => addManHourSet()}></Button>
                                            </td>
                                            <td>{""}</td>
                                            <td className="center">{""}</td>
                                            <td>{""}</td>
                                            <td>{""}</td>
                                        </tr>
                                }
                                </tbody>
                            </table>
                            ))
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
                                periodHourModRole && <Button text={"수정"} style={{ ...titleButtonStyle }} onClick={() => editMode(setIsInOutTimeEdit)} />
                        }
                    </ol>
                    {
                        inOutTimeExpand ? 
                            <div className="form-control m-2 ms-4" style={{width:"98%"}}>
                                <div style={{display: "flex", height: "20px", margin:"20px 10px"}}>
                                    <div style={{width: "80px"}}>출근시간</div>
                                    { isInOutTimeEdit ?
                                        <Time24Input time={setting.in_time} setTime={(time) => setSetting((prev) => ({...prev, in_time : time}))} style={{width:"100px", marginRight:"5px"}}></Time24Input>
                                    :
                                        <div className="text-style">{calMinutes(setting.in_time, 0)}</div>
                                    }

                                </div>
                                <div style={{display: "flex", height: "20px", margin: "20px 10px"}}>
                                    <div style={{width: "80px"}}>퇴근시간</div>
                                    {isInOutTimeEdit ?
                                        <Time24Input time={setting.out_time} setTime={(time) => setSetting((prev) => ({...prev, out_time : time}))} style={{width:"100px", marginRight:"5px"}}></Time24Input>
                                    :
                                        <div className="text-style">{calMinutes(setting.out_time, 0)}</div>    
                                    }

                                </div>
                                <div style={{display: "flex", height: "20px", margin: "20px 10px", alignItems: "center"}}>
                                    <div style={{width: "80px"}}>유예시간</div>
                                    { isInOutTimeEdit ?
                                        <><NumberInput initNum={setting.respite_time} setNum={(time) => setSetting((prev) => ({...prev, respite_time : Number(time)}))} fixed={0} min={0} max={1440} step={5} style={{width:"100px", marginRight:"5px"}}></NumberInput>{"분"}</>
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
                                deadlineCancelModRole && <Button text={"수정"} style={{ ...titleButtonStyle }} onClick={() => editMode(setIsCancelCodeEdit)}></Button>
                        }
                    </ol>
                    { cancelCodeExpand ? 
                    
                        <div className="form-control m-2 ms-4" style={{width:"98%"}}>
                            <div style={{display: "flex", height: "20px", margin: "20px 10px", alignItems:"center"}}>
                                <div style={{width: "80px"}}>기간</div>
                                { isCancelCodeEdit ?
                                    <Select  
                                        value={cancelCode} 
                                        options={state.selectOptions } 
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
                            
                            {isCancelCodeEdit && 
                                <div className="text-success m-2">
                                    {'>'} 기간 추가 문의: 기술연구소 담당( ☎061-809-1148 )
                                </div>
                            }
                        </div>
                    : null 
                    }
                </> 

            : 
                <div>
                    <h5 className="h5-style">{ project ? "공사관리에 등록된" : null } PROJECT를 선택하세요.</h5>
                        <div className="h5-div-style">
                            ※ 본인이 속한 프로젝트가 아닌 경우 조회가 되지 않을 수 있습니다. 
                            <br></br>
                            <br></br>
                            프로젝트 추가 문의: 담당자( ☎061-690-1242 )
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