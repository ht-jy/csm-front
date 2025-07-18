import { useState } from "react";
import { Axios } from "../../../../../utils/axios/Axios";
import { dateUtil } from "../../../../../utils/DateUtil";
import { ObjChk } from "../../../../../utils/ObjChk";
import { useAuth } from "../../../../context/AuthContext";
import Button from "../../../../module/Button";
import DateInput from "../../../../module/DateInput";
import Modal from "../../../../module/Modal";
import NumberInput from "../../../../module/NumberInput";
import TextInput from "../../../../module/TextInput";

/**
 * @description: 시스템관리자 페이지
 * @author 작성자: 정지영
 * @created 작성일: 2025-07-15
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @modified Description: 
 *
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /system/worker-deadline (마감처리), /system/worker-overtime (철야근로자), /system/project-setting (프로젝트초기세팅), 
 *                        /system/update-workhour(근로자공수계산), /system/setting-workrate(공정률기록) 
 *    Http Method - POST :  /system/manhour (공수추가)
 */
const SystemManagement = () => {

    const {project, user} = useAuth()

    // 모달
    const [isModal, setIsModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("")
    const [modalText, setModalText] = useState("")

    // 공정률 지정
    const [targetDate, setTargetDate] = useState(dateUtil.now())

    // 공수
    const [workhour, setWorkHour] = useState(8)
    const [manhour, setManHour] = useState(0.5)
    const [etc, setEtc] = useState("")

    // 퇴근한 근로자 마감 처리
    const onClickModifyWorkerDeadlineInit = async () => {
        try {
            
            const res = await Axios.GET("/system/worker-deadline")

            if(res?.data?.result === "Success"){
                // 성공 모달
                setModalTitle("처리 성공")
                setModalText("퇴근한 근로자 마감 처리에 성공하였습니다. \n")
                setIsModal(true)
            }else{
                setModalTitle("처리 실패")
                setModalText("퇴근한 근로자 마감 처리에 실패하였습니다. \n다시 한번 시도해주세요. \n")
                setIsModal(true)
            }
        }catch (e){
            navigator("/error")
        }finally{

        }
    }

    // 철야 근로자 처리
    const onClickModifyWorkerOverTime = async () => {
        try {
            
            const res = await Axios.GET("/system/worker-overtime")

            if(res?.data?.result === "Success"){
                // 성공 모달
                setModalTitle("처리 성공")
                setModalText("철야 근로자 처리에 성공하였습니다. \n")
                setIsModal(true)
            }else{
                setModalTitle("처리 실패")
                setModalText("철야 근로자 처리에 실패하였습니다. \n다시 한번 시도해주세요. \n")
                setIsModal(true)
            }
        }catch (e){
            navigator("/error")
        }finally{

        }

    }

    // 프로젝트 초기 세팅
    const onClickCheckProjectSetting = async () => {
        try {
            
            const res = await Axios.GET("/system/project-setting")

            if(res?.data?.result === "Success"){
                // 성공 모달
                setModalTitle("처리 성공")
                setModalText("프로젝트 초기 세팅에 성공하였습니다. \n")
                setIsModal(true)
            }else{
                setModalTitle("처리 실패")
                setModalText("프로젝트 초기 세팅에 실패하였습니다. \n다시 한번 시도해주세요. \n")
                setIsModal(true)
            }
        }catch (e){
            navigator("/error")
        }finally{

        }
    }

    // 근로자 공수 계산
    const onClickModifyWorkHour = async () => {
        try {
            
            const res = await Axios.GET("/system/update-workhour")

            if(res?.data?.result === "Success"){
                // 성공 모달
                setModalTitle("처리 성공")
                setModalText("근로자 공수 계산 처리에 성공하였습니다. \n")
                setIsModal(true)
            }else{
                setModalTitle("처리 실패")
                setModalText("근로자 공수 계산 처리에 실패하였습니다. \n다시 한번 시도해주세요. \n")
                setIsModal(true)
            }
        }catch (e){
            navigator("/error")
        }finally{

        }
    }

    // 공정률 기록
    const onClickSettingWorkRate = async () => {
        try {

            if( !dateUtil.isDate(targetDate) ){
                
                setModalTitle("공정률 기록")
                setModalText("날짜를 설정해주세요. \n")
                setIsModal(true)
                return
            }

            const res = await Axios.GET(`/system/setting-workrate?targetDate=${targetDate}`)

            if(res?.data?.result === "Success"){
                // 성공 모달
                setModalTitle("처리 성공")
                setModalText("공정률 기록에 성공하였습니다. \n")
                setIsModal(true)
            }else{
                setModalTitle("처리 실패")
                setModalText("공정률 기록에 실패하였습니다. \n다시 한번 시도해주세요. \n")
                setIsModal(true)
            }
        }catch (e){
            navigator("/error")
        }finally{

        }
    }

    // 공수 추가
    const onClickAddManHour = async () => {
        try {

            if (ObjChk.all(project?.jno)){
                setModalTitle("프로젝트 설정")
                setModalText("공수 추가를 원하실 경우 프로젝트를 선택해 주세요. \n")
                setIsModal(true)
                return;
            }


            const addManHour = {
                jno: project.jno,
                work_hour: workhour,
                man_hour: manhour,
                etc: etc,
                reg_user: user.username,
                reg_uno: user.uno,

            }

            const res = await Axios.POST(`/system/manhour`, addManHour)

            if(res?.data?.result === "Success"){
                // 성공 모달
                setModalTitle("처리 성공")
                setModalText("공수 추가에 성공하였습니다. \n")
                setIsModal(true)
            }else{
                setModalTitle("처리 실패")
                setModalText("공수 추가에 실패하였습니다. \n다시 한번 시도해주세요. \n")
                setIsModal(true)
            }
        } catch (e){
            
        }finally {

        }
    }

    return <div className="container-fluid px-4">
            <Modal
                isOpen={isModal}
                title={modalTitle}
                text={modalText}
                confirm={"확인"}
                fncConfirm={() => setIsModal(false)}
            />

            <ol className="breadcrumb mb-4 content-title-box">
                <li className="breadcrumb-item content-title">시스템 관리</li>
                <li className="breadcrumb-item active content-title-sub">관리</li>
            </ol>
            <div style={{...list}}>
                <div style={{...title}}>
                    마감처리(퇴근한 근로자만)
                </div>
                <Button text={"실행"} onClick={onClickModifyWorkerDeadlineInit}></Button>
            </div>
            
            <hr></hr>
            
            {/* 근로자 철야 수동으로 하기로 변경 */}
            {/* <div style={{...list}}>
                <div style={{...title}}>
                    근로자의 철야 처리
                </div>
                <Button text={"실행"} onClick={onClickModifyWorkerOverTime}></Button>
            </div>
            
            <hr></hr> */}
            
            <div style={{...list}}>
                <div style={{...title}}>
                    프로젝트 초기 세팅(새로고침)
                </div>
                <Button text={"실행"} onClick={onClickCheckProjectSetting}></Button>
            </div>
            <div>{"- 현장관리에서 등록한 프로젝트를 초기 값으로 설정합니다."}</div>

            <hr></hr>
            
            <div style={{...list}}>
                <div style={{...title}}>
                    근로자 공수 계산
                </div>
                <Button text={"실행"} onClick={onClickModifyWorkHour}></Button>
            </div>
            <div>{"- 마감처리가 안되고 출퇴근이 모두 있는 근로자에게 적용됩니다."}</div>
            
            <hr></hr>
            
            <div style={{...list}}>
                <div style={{...title}}>
                    공정률 기록: <DateInput time={targetDate} setTime={setTargetDate} ></DateInput>
                </div>
                <Button text={"실행"} onClick={onClickSettingWorkRate}></Button>
            </div>
            <div> {"- 지정한 날짜 이전의 기록 중 전날 공정률 데이터로 기록됩니다."}</div>

            <hr></hr>

            <div>
                <div style={{marginBottom:"0.5rem", ...title}}>
                    공수 추가
                </div>

                <div> {`현재 선택된 프로젝트: ${project?.job_name ? project.job_name : "미지정"}`} </div>
                <div style={{display:"flex", alignItems:"center", gap:"1rem", margin:"1rem 0rem"}}>
                    근로시간: <NumberInput initNum={workhour} setNum={(val) => setWorkHour(val)} fixed={0}  min={"0"} max={"24"} style={{ width: "100px", marginLeft: "5px" }}></NumberInput>
                    공수: <NumberInput initNum={manhour} setNum={(val) => setManHour(val)} min={"0"} max={"5"} fixed={1} step={0.1} style={{ width: "100px", marginLeft: "5px" }}></NumberInput>               
                    비고: <TextInput initText={manhour.etc || ""} setText={(val) => setEtc(val)} style={{width:"95%"}} ></TextInput>
                                                        
                    <Button text={"추가"} onClick={() => onClickAddManHour(manhour)}></Button>
                </div>
            </div>
            { workhour && manhour &&
                <div>
                    {`- ${workhour}시간 이하인 경우 ${manhour}공수`}
                </div>
            }
            <div>{"- 공수를 추가할 프로젝트를 선택하여야 합니다."}</div>
        </div>
}

export default SystemManagement;

const list = {
    display:"flex",
    alignItems:"center",
    gap:"1rem",
    margin:"1.5rem 0.5rem"

};

const title = {
    width:"500px",
    fontWeight:"bold"
}