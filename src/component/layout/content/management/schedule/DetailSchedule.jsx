import { useEffect, useState } from "react";
import FormCheckInput from "react-bootstrap/esm/FormCheckInput";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import BackIcon from "../../../../../assets/image/back-arrow.png";
import Exit from "../../../../../assets/image/exit.png";
import { Axios } from "../../../../../utils/axios/Axios";
import { dateUtil } from "../../../../../utils/DateUtil";
import { useUserRole } from "../../../../../utils/hooks/useUserRole";
import { ObjChk } from "../../../../../utils/ObjChk";
import { projectRoles } from "../../../../../utils/rolesObject/projectRoles";
import { scheduleRoles } from "../../../../../utils/rolesObject/scheduleRoles";
import { useAuth } from "../../../../context/AuthContext";
import ColorInput from "../../../../module/ColorInput";
import DateInput from "../../../../module/DateInput";
import Loading from "../../../../module/Loading";
import Modal from "../../../../module/Modal";

/**
 * @description: 일정 상세, 수정화면
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-04-28
 * @modified 최종 수정일: 2025-07-24
 * @modifiedBy 최종 수정자: 정지영
 * 2025-07-24: 마감 취소 일수에 따라 일정 수정/삭제 제한
 * 
 * 
 * @additionalInfo
 * - props
 * isOpen: true|false
 * isRest: 휴무일/공휴일 유무
 * restDates: 휴무일/공휴일 날짜 배열
 * dailyJobs: 작업내용 배열
 * clickDate: 선택 날짜
 * exitBtnClick: 모달 닫기 함수
 * restModifyBtnClick: 휴무일 수정 함수
 * restRemoveBtnClick: 휴무일 삭제 함수
 * dailyJobModifyBtnClick: 작업내용 수정 함수
 * dailyJobRemoveBtnClick: 작업내용 삭제 함수
 */
const DetailSchedule = ({isOpen, isRest, restDates, dailyJobs, clickDate, exitBtnClick, restModifyBtnClick, restRemoveBtnClick, dailyJobModifyBtnClick, dailyJobRemoveBtnClick, nonRest = false}) => {
    const navigate = useNavigate();

    const { project } = useAuth();
    // 권한 체크
    const { isRoleValid } = useUserRole();
    // 전체 프로젝트 수정 권한
    const scheduleRole = isRoleValid(scheduleRoles.SCHEDULE_MANAGER);


    const [isLoading, setIsLoading] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [isAllow, setIsAllow] = useState(false);
    const [remove, setRemove] = useState("N");
    const [edit, setEdit] = useState("N");
    const [editData, setEditData] = useState({});
    /** 프로젝트별 작업내용 **/
    const [jobsByProject, setJobsByProject] = useState([]);
    /** select **/
    const [projectOptions, setProjectOptions] = useState([]);

    /** dateInput **/
    const [minDate, setMinDate] = useState(null);

    /** 예/아니오 모달 **/
    const [isModal, setIsModal] = useState(false);
    const [modalText, setModalText] = useState("");

    /** 저장 유효성검사 모달 **/
    const [isErrorModal, setIsErrorModal] = useState(false);
    const [errorText, setErrorText] = useState("");
    /** 초기 데이터 **/
    const [initData, setInitData] = useState();

    // 제목 색상
    const titleColor = () => {
        if(isRest || clickDate.getDay() === 0){
            return "#f75d5d"
        } else if(clickDate.getDay() === 6) {
            return "#6462fa"
        }else{
            return "black"
        }
    }
    
    // 요일
    const getDateDay = () => {
        const days = ["일요일", "월요일", "화요일", "수요일", "목요일", "금요일", "토요일"];
        return days[clickDate.getDay()];
    }

    // 프로젝트
    const getProject = (jno) => {
        const empty = {value:0, label:"전체 적용", cancelDay: null };
        if(ObjChk.all(jno)){
            return empty;
        }

        const findProject = projectOptions.find(item => item.value === jno);
        if(findProject === undefined){
            return empty;
        }
        return findProject;
    }


    // 취소기한 별 수정 가능 여부 체크: cancelDay-마감취소기한, inputDate-비교날짜
    const checkAllowDate = (cancelDay, inputDate) => {
        // 오늘날짜에서 마감취소기간을 뺀 최소 허용 기간 구하기
        const now = new Date();
        const allowDate = dateUtil.diffDay(new Date(now.getFullYear(), now.getMonth(), now.getDate()), cancelDay);
        setMinDate(allowDate);
        
        // 만약 비교 날짜가 최소허용기간 보다 적으면 수정 불가
        if (!ObjChk.all(cancelDay) && allowDate > inputDate) {
            setIsAllow(false);
        }else{
            setIsAllow(true);
        }
    }

    // 작업내용 클릭
    const onClickDailyJob = (item) => {
        if (!scheduleRole) return;
        
        const project = projectOptions.find(option => option.value === item.jno);

        checkAllowDate(project?.cancelDay, item.date);

        setEdit("J");
        setRemove("N");
        setIsEdit(false);
        setInitData({...item, date: dateUtil.format(item.date)});
        setEditData({...item, date: dateUtil.format(item.date)});

    }

    // 휴무일 클릭
    const onClickRestDay = (item) => {
        const project = projectOptions.find(option => option.value === item.jno);
        const itemDate = new Date(item.rest_year, item.rest_month-1, item.rest_day);

        checkAllowDate(project?.cancelDay, itemDate);

        setEdit("R");
        setRemove("N");
        setIsEdit(false);
        setInitData({...item, date: dateUtil.format(new Date(`${item.rest_year}-${item.rest_month}-${item.rest_day}`))});
        setEditData({...item, date: dateUtil.format(new Date(`${item.rest_year}-${item.rest_month}-${item.rest_day}`))});
    }

    // 프로젝트 선택 시
    const handleSelect = (e) => {

        checkAllowDate(e.cancelDay, new Date(editData.date));
        onChangeEditData("jno", e.value);
    }

    // 데이터 변경
    const onChangeEditData = (key, value) => {

        setEditData(prev => {
            return {...prev, [key]: value};
        });
    }
    const onClickCancel = () => {
        setIsEdit(false);
        setEditData(initData);
        const project = projectOptions.find(option => option.value === initData.jno);
        checkAllowDate(project?.cancelDay, new Date(initData.date));
    }

    // 수정 알림 모달
    const onClickSave = () => {

        if (ObjChk.all(editData?.date) || editData.date === "-" ){
            setIsErrorModal(true);
            setErrorText("날짜를 입력해주세요. \n");
            return;
        }
        setRemove("N");
        setIsModal(true);
        setModalText("저장하시겠습니까?");
    }

    // 삭제 알림 모달
    const onClickRemove = () => {
        setRemove("Y");
        setIsModal(true);
        setModalText("삭제하시겠습니까?");
    }

    // 수정/삭제
    const saveOrRemove = () => {
        document.body.style.overflow = 'unset';
        if(remove === "N"){
            if(edit === "R"){
                restModifyBtnClick(editData);
                setIsModal(false);
            }else if(edit === "J"){
                dailyJobModifyBtnClick(editData);
                setIsModal(false);
            }
        }else {
            if(edit === "R"){
                restRemoveBtnClick(editData);
                setIsModal(false);
            }else if(edit === 'J'){
                dailyJobRemoveBtnClick(editData);
                setIsModal(false);
            }
        }
    }

    // 프로젝트 리스트 조회
    const getProjectData = async () => {
        setIsLoading(true);
        try {
            const res = await Axios.GET(`/project/job_name?isRole=${isRoleValid(projectRoles.PROJECT_NM)}`);
            if (res?.data?.result === "Success") {
                const options = [{value:0, label: "전체 적용", cancelDay: null}];
                res?.data?.values?.list.map(item => {
                    options.push({value: item.jno, label: item.project_nm, cancelDay: item.cancel_day});
                });
                setProjectOptions(options);
            }
            return true;
        } catch(err) {
            navigate("/error");
        } finally {
        setIsLoading(false);
        }
    }

    /***** useEffect *****/
    useEffect(() => {
        if(isOpen){
            setIsEdit(false);
            setEdit("N");
            setRemove("N");
            // 작업내용 프로젝트별로 그룹화
            const newDailyJobs = dailyJobs.reduce((acc, item) => {
                const key = item.jno;
                if (!acc[key]) {
                  acc[key] = [];
                }
                acc[key].push(item);
                return acc;
            }, {});
            
            setJobsByProject(Object.values(newDailyJobs));
            // 엔터 키 이벤트 핸들러
            document.body.style.overflow = "hidden";
            const handleKeyDown = (event) => {
                if (event.key === "Escape") {
                    exitBtnClick();
                }
            };
            document.addEventListener("keydown", handleKeyDown);

            return () => {
                document.body.style.overflow = "unset";
                document.removeEventListener("keydown", handleKeyDown);
            };
        }
    }, [isOpen]);

    useEffect(() => {
        getProjectData();
    }, []);

    return (
        <div>
            <Loading isOpen={isLoading} />
            <Modal 
                isOpen={isModal}
                title={"일정"}
                text={modalText}
                confirm={"예"}
                fncConfirm={saveOrRemove}
                cancel={"아니오"}
                fncCancel={() => setIsModal(false)}
            />
            <Modal
                isOpen={isErrorModal}
                title={"일정"}
                text={errorText}
                confirm={"확인"}
                fncConfirm={() => setIsErrorModal(false)}
                isConfirmFocus={true}            
            >
            </Modal>
            {
                isOpen ? (
                    <div style={overlayStyle}>
                        <div style={modalStyle}>

                            <div style={{ height: "50px", display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: "0px", marginRight: "5px", marginLeft: "5px", borderBottom: '2px dotted #a5a5a5' }}>
                                {/* 왼쪽 - 제목 */}
                                <h2 style={{fontSize: "20px", color: titleColor(), display: "flex", alignItems: "center"}}>
                                    {
                                        edit !== "N" && 
                                        <div className="back-icon" style={{marginLeft: "10px", cursor: "pointer", width: "30px", height: "30px", display: "flex", justifyContent: "center", alignItems: "center"}} onClick={() => setEdit("N")}>
                                            <img src={BackIcon} style={{width: "20px"}}/>
                                        </div>
                                    }
                                    <span style={{marginLeft: "15px"}}>{clickDate.getDate()}</span>
                                    <span style={{marginLeft: "20px", paddingTop: "2px"}}>{getDateDay()}</span>
                                </h2>

                                {/* 오른쪽 - 버튼 & 닫기 아이콘 */}
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    {
                                        edit !== "N"  && 
                                        (
                                            !isEdit ?
                                                <div className="d-flex align-items-center">
                                                    { (nonRest || (project === null && scheduleRole && editData.jno === 0) || editData.jno === project?.jno) ?
                                                    !isAllow && 
                                                        <div style={{margin: "0rem 1rem"}}>
                                                            해당 프로젝트는 수정 가능한 기간이 아닙니다.
                                                        </div>
                                                    :
                                                        <div style={{margin: "0rem 1rem"}}>
                                                            상단의 프로젝트와 일치하는 일정만 수정이 가능합니다.
                                                        </div>
                                                    }
                                                    <button className="btn btn-primary" disabled={!isAllow || !(nonRest || (project === null && scheduleRole && editData.jno === 0) || editData.jno === project?.jno)} onClick={() => setIsEdit(true)} name="confirm" style={{marginRight:"10px"}}>
                                                        수정
                                                    </button>
                                                    <button className="btn btn-primary" disabled={!isAllow || !(nonRest || (project === null && scheduleRole && editData.jno === 0) || editData.jno === project?.jno)} onClick={onClickRemove} name="confirm" style={{marginRight:"10px"}}>
                                                        삭제
                                                    </button>
                                                </div>
                                                :

                                                <div>
                                                    <button className="btn btn-primary" onClick={onClickSave} name="confirm" style={{marginRight:"10px"}}>
                                                        저장
                                                    </button>
                                                    <button className="btn btn-primary" onClick={() => onClickCancel()} name="confirm" style={{marginRight:"10px"}}>
                                                        취소
                                                    </button>
                                                </div>
                                                
                                                
                                        )
                                    }
                                    <div onClick={exitBtnClick} style={{ cursor: "pointer" }}>
                                        <img src={Exit} style={{ width: "35px" }} alt="Exit" />
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{display: "flex", justifyContent: "center", flex: 1, overflow: 'auto' }}>
                                <div style={{...gridStyle, backgroundColor: edit === "N" ? "#f3f3f3" : ""}}>

                                    {
                                        edit === "N" ?
                                            <>
                                                {!nonRest && <div>
                                                    {
                                                        restDates.length === 0 ?
                                                            <div style={{gridColumn: "span 2", padding: '5px', display: "flex", alignItems: "center", width: "100%"}}>
                                                                <div style={{backgroundColor: "#f75d5d", width: "5px", height: "100%", borderRadius: "5px", marginRight: "5px", height:"40px"}}></div>
                                                                일정이 없습니다.
                                                            </div>
                                                        : restDates.map((item, idx) => (
                                                            item.is_holiday ? 
                                                                <div style={{gridColumn: "span 2", padding: '5px', display: "flex", alignItems: "stretch", width: "100%", cursor: "pointer"}} key={idx}>
                                                                    <div style={{backgroundColor: "#f75d5d", width: "5px",  borderRadius: "5px"}}></div>
                                                                    <div style={{textAlign:"left", marginLeft: "10px", width: "100%"}}>
                                                                        <div style={{fontSize: "20px", color: "black"}}>{item.reason}</div>
                                                                        <div style={{border: "1px solid #ccc", width: "100%"}}></div>
                                                                        <div style={{fontSize: "13px"}}>공휴일</div>
                                                                    </div>
                                                                </div>
                                                            :   
                                                                <div  
                                                                    style={{gridColumn: "span 2", padding: '5px', display: "flex", alignItems: "stretch", width: "100%", cursor: "pointer"}} key={idx}                                                                    
                                                                >
                                                                <div style={{backgroundColor: "#f89999", width: "5px", borderRadius: "5px"}}></div>
                                                                <div style={{textAlign:"left", marginLeft: "10px", width: "100%", height:"" }}>
                                                                    {item.jno.map((rest, r_idx) => (
                                                                        <div key={r_idx} className="detail-rest-item" onClick={() => onClickRestDay(rest)} style={{fontSize: "20px", color: "black", height:"30px"}}>{rest.reason}</div>
                                                                    ))}
                                                                    
                                                                    <div style={{border: "1px solid #ccc", width: "100%"}}></div>
                                                                    
                                                                    <div style={{fontSize: "13px"}}>{`휴무일 : ${getProject(item.jno[0].jno)?.label}`}</div>
                                                                </div>
                                                                </div>
                                                        ))
                                                    }
                                                    </div> }
                                                    {
                                                        jobsByProject.length === 0 ?
                                                            <div style={{gridColumn: "span 2", padding: '5px', display: "flex", alignItems: "center", width: "100%", height: "50px"}}>
                                                                <div style={{backgroundColor: "#f9d470", width: "5px", height: "100%", borderRadius: "5px", marginRight: "5px"}}></div>
                                                                작업 내용이 없습니다.
                                                            </div>
                                                        :
                                                            <div style={{gridColumn: "span 2"}}>
                                                                {
                                                                    jobsByProject.map((jobs, j_idx) => (
                                                                        jobs.length !== 0 &&
                                                                        <div style={{ padding: '5px', display: "flex", alignItems: "stretch", width: "100%"}} key={j_idx}>
                                                                            <div style={{backgroundColor: "#f9d470", width: "5px", borderRadius: "5px"}}></div>
                                                                            <div style={{textAlign:"left", marginLeft: "10px", width: "100%"}}>
                                                                                <div style={{fontSize: "13px", fontWeight: "bold", color: "gray", marginLeft: "-5px", marginBottom: "5px"}}>작업내용</div>
                                                                                {
                                                                                    jobs.map((item, i_idx) => (
                                                                                        <div 
                                                                                            className={isRoleValid(scheduleRoles.DETAIL_ROW_CLICK) ? "detail-daily-job" : ""}
                                                                                            style={{
                                                                                                fontSize: "17px", 
                                                                                                display: "flex", 
                                                                                                alignItems: "center", 
                                                                                                cursor: isRoleValid(scheduleRoles.DETAIL_ROW_CLICK) ? "pointer" : "", 
                                                                                                paddingBottom: "2px", 
                                                                                                color: item.content_color || "#000000"
                                                                                            }}
                                                                                            key={`${j_idx}_${i_idx}`}
                                                                                            onClick={
                                                                                                isRoleValid(scheduleRoles.DETAIL_ROW_CLICK) ? () => onClickDailyJob(item) : () => {}
                                                                                            }
                                                                                        >
                                                                                            <div style={{marginRight: "5px", paddingBottom: "3px"}}>●</div>
                                                                                            <div style={{whiteSpace:"pre-line"}}>{item.content}</div>
                                                                                        </div>
                                                                                    ))
                                                                                }
                                                                                <div style={{border: "1px solid #ccc", width: "100%"}}></div>
                                                                                <div style={{fontSize: "13px"}}>{getProject(jobs[0].jno)?.label}</div>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                }
                                                            </div>
                                                    }
                                            </>
                                        :   edit === "R" ?
                                            ( isEdit ?
                                                <div>
                                                    {/* 프로젝트 */}
                                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "50px"} }>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>프로젝트</label>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{height: "40px", display: "flex", alignItems: "center", width: "100%" }}>
                                                                <Select
                                                                    onChange={(e) => handleSelect(e)}
                                                                    options={projectOptions || []} 
                                                                    value={editData.jno !== undefined ? projectOptions.find(item => item.value === editData.jno) : {}} 
                                                                    placeholder={"선택하세요"}
                                                                    menuPortalTarget={document.body}
                                                                    styles={{
                                                                        menuPortal: (base) => ({
                                                                            ...base,
                                                                            zIndex: 999999999,
                                                                        }),
                                                                        container: (provided) => ({
                                                                        ...provided,
                                                                        width: "655px",
                                                                        }),
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 체크 */}
                                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "50x"}}>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>연간 적용</label>
                                                        <div style={{width: "50px"}}>
                                                            <div style={{height: "30px", display: "flex", alignItems: "center" }}>
                                                                <FormCheckInput checked={editData.is_every_year === "Y" ? true : false} onChange={(e) => onChangeEditData("is_every_year", e.target.checked ? "Y" : "N")} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 휴무일 날짜 */}
                                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "50px"}}>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>휴무일</label>
                                                        <div style={{width: "200px"}}>
                                                            <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                                <DateInput 
                                                                    time={editData.date} 
                                                                    setTime={(value) => onChangeEditData("date", value)} 
                                                                    minDate={minDate}
                                                                    dateInputStyle={{margin: "0px"}}
                                                                ></DateInput>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 사유 */}
                                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", width: "100%", height: "50px"}}>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>휴무사유</label>
                                                        <div>
                                                            <textarea className="text-area" type="text" value={editData.reason === undefined ? "" : editData.reason} onChange={(e) => onChangeEditData("reason", e.target.value)} style={{width: "655px", height:"calc(50vh - 260px)", paddingLeft: "10px"}}/>
                                                        </div>
                                                    </div>
                                                </div>
                                            :
                                                <div>
                                                    {/* 프로젝트 */}
                                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "50px"} }>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>프로젝트</label>
                                                        <div style={{ flex: 1 }}>
                                                            {projectOptions.find(item => item.value === editData.jno)?.label}
                                                        </div>
                                                    </div>

                                                    {/* 체크 */}
                                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "50x"}}>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>연간 적용</label>
                                                        <div style={{width: "50px"}}>
                                                            <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                                {editData.is_every_year}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 휴무일 날짜 */}
                                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "50px"}}>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>휴무일</label>
                                                        <div style={{width: "200px"}}>
                                                            <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                                {editData.date} 
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 사유 */}
                                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", width: "100%", height: "50px"}}>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>휴무사유</label>
                                                        <div style={{whiteSpace: "preLine"}}>
                                                            {editData.reason === undefined || editData.reason === "" ? "-" : editData.reason}
                                                        </div>
                                                    </div>
                                                </div>
                                            )
                                        :   edit === "J" ? 
                                            ( isEdit ?
                                                <div>
                                                    {/* 프로젝트 */}
                                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "50px"} }>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>프로젝트</label>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{height: "40px", display: "flex", alignItems: "center", width: "100%" }}>
                                                                { nonRest ?
                                                                    <div> {projectOptions.find(item => item.value === editData.jno)?.label}</div>
                                                                :
                                                                    <Select
                                                                        onChange={(e) => handleSelect(e)}
                                                                        options={projectOptions || []} 
                                                                        value={editData.jno !== undefined ? projectOptions.find(item => item.value === editData.jno) : {}} 
                                                                        placeholder={"선택하세요"}
                                                                        menuPortalTarget={document.body}
                                                                        styles={{
                                                                            menuPortal: (base) => ({
                                                                                ...base,
                                                                                zIndex: 999999999,
                                                                            }),
                                                                            container: (provided) => ({
                                                                            ...provided,
                                                                            width: "655px",
                                                                            }),
                                                                        }}
                                                                    />
                                                                }
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 작업내용 날짜 */}
                                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "50px"}}>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>{editData.is_period === "Y" ? "시작일" : "작업일"}</label>
                                                        <div style={{width: "200px"}}>
                                                            <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                                <DateInput 
                                                                    time={editData.date} 
                                                                    setTime={(value) => onChangeEditData("date", value)} 
                                                                    minDate={minDate}
                                                                    dateInputStyle={{margin: "0px"}}
                                                                    calendarPopupStyle={{
                                                                        zIndex: 1000,
                                                                    }}
                                                                ></DateInput>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 표시 색상 */}
                                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "50px"}}>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>표시색상</label>
                                                        <div style={{width: "200px"}}>
                                                            <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                                <ColorInput
                                                                    initColor={editData.content_color || "#000000"}
                                                                    setColor={(color) => {editData.content_color = color}}
                                                                    style={{width:"1.75rem", height:"1.5rem"}}
                                                                >
                                                                </ColorInput>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 작업내용 */}
                                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", width: "100%"}}>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>작업내용</label>
                                                        <div>
                                                            <textarea className="text-area" type="text" value={editData.content === undefined ? "" : editData.content} onChange={(e) => onChangeEditData("content", e.target.value)} style={{width: "655px", height:"calc(50vh - 260px)", textAlign: "start", paddingLeft: "10px"}}/>
                                                        </div>
                                                    </div>
                                                </div>
                                            :
                                                <div>
                                                    {/* 프로젝트 */}
                                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "50px"} }>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>프로젝트</label>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{height: "40px", display: "flex", alignItems: "center", width: "100%" }}>
                                                                {editData.jno !== undefined ? projectOptions.find(item => item.value === editData.jno)?.label : ""}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 작업내용 날짜 */}
                                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "50px"}}>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>{editData.is_period === "Y" ? "시작일" : "작업일"}</label>
                                                        <div style={{width: "200px"}}>
                                                            <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                                {editData.date} 
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 작업내용 */}
                                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", width: "100%"}}>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>작업내용</label>
                                                        <div style={{color: editData.content_color || "#000000", whiteSpace:"pre-line"}}>
                                                            {editData.content === undefined || editData.content === "" ? "-" : editData.content}
                                                        </div>
                                                    </div>
                                                </div>                   
                                            )
                                        :null
                                    }

                                </div>
                            </div>
                        </div>
                    </div>
                ) :null
            }
        </div>
    );
}

const gridStyle = {
    // display: 'grid',
    gridTemplateColumns: '1fr 1fr',  // 한 행에 두 개의 열
    gap: '5px',
    // borderTop: '2px dotted #a5a5a5',
    borderRadius: '5px',
    padding: '10px',
    width: '98%', 
    // height: 'calc(100% - 60px)',  // 버튼과 라디오 영역을 제외한 높이
    overflowX: 'auto',            // 가로 스크롤
    overflowY: 'auto',            // 세로 스크롤
    marginTop: "5px",
    padding: "5px",
    // backgroundColor: "#f3f3f3",
};

const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '9998',
};

const modalStyle = {
    backgroundColor: '#fff',
    padding: '5px',
    borderRadius: '8px',
    maxWidth: '800px',
    width: '95%',
    height: '50vh',
    maxHeight: '90vh',
    boxShadow: '15px 15px 1px rgba(0, 0, 0, 0.3)',
    margin: '10px',
    display: 'flex',
    flexDirection: 'column',
};

export default DetailSchedule;