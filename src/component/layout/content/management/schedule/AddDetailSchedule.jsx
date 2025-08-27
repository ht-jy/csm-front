import { useEffect, useState } from "react";
import FormCheckInput from "react-bootstrap/esm/FormCheckInput";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
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
import RadioInput from "../../../../module/RadioInput";

/**
 * @description: 일정 추가 화면
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-04-28
 * @modified 최종 수정일: 2025-07-24 
 * @modifiedBy 최종 수정자: 정지영
 * 2025-07-22: props에 jobjno추가 및 휴무일 추가 여부 확인
 * 2025-07-24: 마감 취소 일수에 따라 일정 추가 제한
 * 
 * @additionalInfo
 * - props
 * isOpen: true|false
 * clickDate: 선택날짜
 * exitBtnClick: 모달 닫기 함수
 * restSaveBtnClick: 휴무일 저장 함수
 * jobSaveBtnClick: 작업내용 저장 함수
 * jobjno: 프로젝트 기본 설정에 사용(기본값 0)
 * nonRest: 휴무일 표시 여부(기본값 false)
 */
const AddDetailSchedule = ({ isOpen, clickDate, exitBtnClick, restSaveBtnClick, jobSaveBtnClick, jobjno = 0, nonRest = false }) => {
    const navigate = useNavigate();
    const { project} = useAuth();
    // 권한 체크
    const { isRoleValid } = useUserRole();
    // 전체 프로젝트 수정 권한
    const scheduleRole = isRoleValid(scheduleRoles.SCHEDULE_MANAGER);
    
    /** 프로젝트 **/
    const [simpleProjects, setSimpleProjects] = useState([]);
    /** 추가 데이터 **/
    const [formData, setFormData] = useState([]);
    /** 추가 종류 선택 **/
    const [addType, setAddType] = useState("JOB");
    /** 로딩 **/
    const [isLoading, setIsLoading] = useState(false);
    /** select **/
    const [projectOptions, setProjectOptions] = useState([]);
    /** 알림 모달 **/
    const [isModal, setIsModal] = useState(false);
    const [modalText, setModalText] = useState("");
    const [isConfirmSave, setIsConfirmSave] = useState(false);

    // 날짜
    const [minDate, setMinDate] = useState(null);
    const [isEdit, setIsEdit] = useState(true);

    // 확인 모달 띄우기
    const onClickSave = () => {
        setIsConfirmSave(true);
    }

    // 휴무일, 작업내용 저장
    const handleSave = () => {
        setIsConfirmSave(false);
        document.body.style.overflow = 'unset';
        if(addType === "REST"){
            restSaveBtnClick(formData);
        }else{
            jobSaveBtnClick(formData);
        }
        
    };

    // 취소기한 별 수정 가능 여부 체크: jno
    const checkAllowDate = (jno, date) => {

        if (ObjChk.all(jno) ) return;
        const projectOption = projectOptions.find(option => option.value === jno);
    
        // 오늘날짜에서 마감취소기간을 뺀 최소 허용 기간 구하기
        const now = new Date();
        const allowDate = dateUtil.diffDay(new Date(now.getFullYear(), now.getMonth(), now.getDate()), projectOption?.cancelDay);
        setMinDate(allowDate);
        
        const compDate = (date === undefined) ? clickDate : new Date(date);

        // 만약 선택한 날짜가 최소허용기간 보다 적으면 수정 불가
        if (!ObjChk.all(projectOption?.cancelDay) && !ObjChk.all(compDate) && allowDate > compDate) {
            setIsEdit(false);
            setModalText(`해당 프로젝트는 ${dateUtil.format(clickDate)}에 일정추가가 불가합니다.`);
            setIsModal(true);
        }else{
            setIsEdit(true);
        }

    }

    // 데이터 변경
    const onChangeFormData = (key, value) => {        
        if(key === "period_date" && formData.is_period === 'Y'){
            if(value < formData.date){
                setIsModal(true);
                setModalText("종료일은 시작일 이후로 선택하여 주세요.");
                return;
            }
        }else if(key === "date" && formData.is_period === 'Y'){
            if(value > formData.period_date){
                setIsModal(true);
                setModalText("시작일은 종료일 이전으로 선택하여 주세요.");
                return;
            }
        }
        // date가 변경되는 경우 수정 여부 확인하기
        if(key === "date"){
            checkAllowDate(formData.jno, value);
        }
        
        // jno가 변경된느 경우 허용날짜 및 수정여부 확인하기
        if (key === "jno") {
            checkAllowDate(value);
        }

        setFormData(prev => {
            return {...prev, [key]: value};
        });
    }

    // 프로젝트 리스트 조회 및 셀렉트 옵션 생성
    const getProjectData = async () => {
        setIsLoading(true);
        try {
            const res = await Axios.GET(`/project/job_name?isRole=${isRoleValid(projectRoles.PROJECT_NM)}`);
            if (res?.data?.result === "Success") {
                // 프로젝트 정보
                setSimpleProjects(res?.data?.values?.list);
                // 셀렉트 옵션
                const options = scheduleRole ? [{value:0, label: "전체 적용", cancelDay:null}] : [];
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
            // 추가 기본타입
            setAddType("JOB");
            // 프로젝트
            if ( nonRest ) {
                onChangeFormData("jno", jobjno);
            }else if(project !== null){
                onChangeFormData("jno", project.jno);
            }else{
                onChangeFormData("jno", 0);
            }
            // 선택날짜
            if(clickDate !== null){
                onChangeFormData("date", `${clickDate.getFullYear()}-${String(clickDate.getMonth()+1).padStart(2, '0')}-${String(clickDate.getDate()).padStart(2, '0')}`); 
            }else{
                setIsEdit(false);
            }
            // 연간적용
            onChangeFormData("is_every_year", "N");
            // 기간설정
            onChangeFormData("is_period", "N");
            // 사유
            onChangeFormData("reason", "");
            
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
        }else{
            setFormData([]);
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
                confirm={"확인"}
                fncConfirm={() => setIsModal(false)}
            />
            <Modal
                isOpen={isConfirmSave}
                title={"일정 저장"}
                text={"저장하시겠습니까?"}
                confirm={"예"}
                fncConfirm={handleSave}
                cancel={"아니오"}
                fncCancel={() => setIsConfirmSave(false)}
            />
            {
                isOpen ? (
                    <div style={overlayStyle}>
                        <div style={modalStyle}>

                            <div style={{ height: "50px", display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: "0px", marginRight: "5px", marginLeft: "5px" }}>
                                {/* 왼쪽 - 제목 */}
                                <div style={{display: "flex", alignItems: "flex-end"}}>
                                    <h2 style={h2Style}>일정 추가</h2>
                                    {/* <div style={{marginLeft: "20px"}}>
                                        <RadioInput itemName={"schedule"} selectedValue={addType} values={["REST", "JOB"]} labels={["휴무일", "작업내용"]} setRadio={(value) => setAddType(value)}/>
                                    </div> */}
                                </div>

                                {/* 오른쪽 - 버튼 & 닫기 아이콘 */}
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    { isEdit ?
                                        <div>
                                            <button className="btn btn-primary" onClick={onClickSave} name="confirm" style={{marginRight:"10px"}}>
                                                저장
                                            </button>
                                        </div>
                                    :
                                        <div style={{margin: "0rem 1rem"}}>
                                            해당 프로젝트는 일정 추가 가능한 기간이 아닙니다.
                                        </div>
                                    }

                                    <div onClick={exitBtnClick} style={{ cursor: "pointer" }}>
                                        <img src={Exit} style={{ width: "35px" }} alt="Exit" />
                                    </div>
                                </div>
                            </div>

                            {/* content */}
                            <div style={{ flex: 1, overflow: 'auto' }}>
                                { isEdit ? 
                                    <div style={gridStyle}>
                                        {/* 프로젝트 */}
                                        <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "40px"} }>
                                            <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>프로젝트</label>
                                            <div style={{ flex: 1 }}>
                                                <div style={{height: "40px", display: "flex", alignItems: "center", width: "100%" }}>
                                                    { nonRest ?
                                                    <div>{projectOptions.find(item => item.value === formData.jno)?.label}</div>
                                                    :
                                                    <Select
                                                        onChange={(e) => onChangeFormData("jno", e.value)}
                                                        options={projectOptions || []} 
                                                        value={formData.jno !== undefined ? projectOptions.find(item => item.value === formData.jno) : {}} 
                                                        placeholder={"선택하세요."}
                                                        noOptionsMessage={() => '선택 가능한 프로젝트가 없습니다'}
                                                        menuPortalTarget={document.body}
                                                        styles={{
                                                            menuPortal: (base) => ({
                                                                ...base,
                                                                zIndex: 999999999,
                                                            }),
                                                            container: (provided) => ({
                                                            ...provided,
                                                            width: "635px",
                                                            }),
                                                        }}
                                                    />
                                                    }
                                                </div>
                                            </div>
                                        </div>

                                        {/* 종류 */}
                                        <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "40px"}}>
                                            <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>종류</label>
                                            <div style={{ flex: 1 }}>
                                                <div style={{height: "40px", display: "flex", alignItems: "center", width: "100%" }}>
                                                    {
                                                    nonRest ?
                                                    <RadioInput itemName={"schedule"} selectedValue={addType} values={["JOB"]} labels={["작업내용"]} setRadio={(value) => setAddType(value)}/>
                                                    :
                                                    <RadioInput itemName={"schedule"} selectedValue={addType} values={["JOB", "REST"]} labels={["작업내용", "휴무일"]} setRadio={(value) => setAddType(value)}/>
                                                }
                                                </div>
                                            </div>
                                        </div>

                                        {/* 체크 */}
                                        <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "40px"}}>
                                            {
                                                addType === "REST" ?
                                                    <>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>휴무 기간 설정</label>
                                                        <div style={{width: "190px"}}>
                                                            <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                                <FormCheckInput checked={formData.is_period === "Y" ? true : false} onChange={(e) => onChangeFormData("is_period", e.target.checked ? "Y" : "N")} />
                                                            </div>
                                                        </div>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>연간 적용</label>
                                                        <div>
                                                            <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                                <FormCheckInput checked={formData.is_every_year === "Y" ? true : false} onChange={(e) => onChangeFormData("is_every_year", e.target.checked ? "Y" : "N")} />
                                                            </div>
                                                        </div>
                                                    </>
                                                :
                                                    <>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>작업 기간 설정</label>
                                                        <div style={{width: "190px"}}>
                                                            <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                                <FormCheckInput checked={formData.is_period === "Y" ? true : false} onChange={(e) => onChangeFormData("is_period", e.target.checked ? "Y" : "N")} />
                                                            </div>
                                                        </div>
                                                    </>
                                            }
                                            
                                        </div>

                                        {/* 휴무일, 작업내용 날짜 */}
                                        <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "40px"}}>
                                            <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>{formData.is_period === "Y" ? "시작일" : addType === "REST" ? "휴무일" : "작업일"}</label>
                                            <div style={{width: "170px"}}>
                                                <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                    <DateInput 
                                                        time={dateUtil.format(formData.date || dateUtil.now())} 
                                                        setTime={(value) => {onChangeFormData("date", value)}} 
                                                        minDate={minDate}
                                                        dateInputStyle={{margin: "0px"}}
                                                        calendarPopupStyle={{
                                                            zIndex: 1000,
                                                        }}
                                                    ></DateInput>
                                                </div>
                                            </div>

                                            {
                                                formData.is_period === "Y" ?
                                                    <>
                                                        <label style={{ marginLeft:"20px", marginRight: "35px", fontWeight: "bold", width: "50px" }}>종료일</label>
                                                        <div>
                                                            <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                                <DateInput 
                                                                    time={dateUtil.format(formData.period_date || dateUtil.now())} 
                                                                    setTime={(value) => onChangeFormData("period_date", value)} 
                                                                    minDate={minDate}
                                                                    dateInputStyle={{margin: "0px"}}
                                                                    calendarPopupStyle={{
                                                                        zIndex: 1000,
                                                                    }}
                                                                ></DateInput>
                                                            </div>
                                                        </div>
                                                    </>
                                                : null
                                            }
                                        </div>

                                        {/* 표시 색상 */}
                                        { addType === "REST"  ? 
                                            null 
                                            :
                                            <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "50px"}}>
                                                <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>표시색상</label>
                                                <div style={{width: "200px"}}>
                                                    <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                        <ColorInput
                                                            initColor={formData.content_color || "#000000"}
                                                            setColor={(color) => {formData.content_color = color}}
                                                            style={{width:"1.75rem", height:"1.5rem"}}
                                                        >
                                                        </ColorInput>
                                                    </div>
                                                </div>
                                            </div>
                                        }

                                        {/* 사유 */}
                                        <div style={{gridColumn: "span 2", padding: '10px', display: "flex", width: "100%"}}>
                                            <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>{addType === "REST" ? "휴무사유" : "작업내용"}</label>
                                            <div>
                                                <textarea className="text-area" type="text" value={formData.reason === undefined ? "" : formData.reason} onChange={(e) => onChangeFormData("reason", e.target.value)} style={{width: "635px", height: addType === "REST"  ? "calc(50vh - 285px)" :"calc(50vh - 335px)", textAlign: "left", paddingLeft: "10px", textWrap:"wrap"}}/>
                                            </div>
                                        </div>
                                    </div>
                                :
                                    <div style={gridStyle}>
                                        {/* 프로젝트 */}
                                        <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "40px"} }>
                                            <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>프로젝트</label>
                                            <div style={{ flex: 1 }}>
                                                <div style={{height: "40px", display: "flex", alignItems: "center", width: "100%" }}>
                                                    <Select
                                                        onChange={(e) => onChangeFormData("jno", e.value)}
                                                        options={projectOptions || []} 
                                                        value={formData.jno !== undefined ? projectOptions.find(item => item.value === formData.jno) : {}} 
                                                        placeholder={"선택하세요"}
                                                        menuPortalTarget={document.body}
                                                        styles={{
                                                            menuPortal: (base) => ({
                                                                ...base,
                                                                zIndex: 999999999,
                                                            }),
                                                            container: (provided) => ({
                                                            ...provided,
                                                            width: "635px",
                                                            }),
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* 종류 */}
                                        <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "40px"}}>
                                            <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>종류</label>
                                            <div style={{ flex: 1 }}>
                                                <div style={{height: "40px", display: "flex", alignItems: "center", width: "100%" }}>
                                                    {
                                                    nonRest ?
                                                    <RadioInput itemName={"schedule"} selectedValue={addType} values={["JOB"]} labels={["작업내용"]} setRadio={(value) => setAddType(value)}/>
                                                    :
                                                    <RadioInput itemName={"schedule"} selectedValue={addType} values={["JOB", "REST"]} labels={["작업내용", "휴무일"]} setRadio={(value) => setAddType(value)}/>
                                                }
                                                </div>
                                            </div>
                                        </div>

                                        {/* 체크 */}
                                        <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "40px"}}>
                                            {
                                                addType === "REST" ?
                                                    <>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>휴무 기간 설정</label>
                                                        <div style={{width: "190px"}}>
                                                            <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                                <FormCheckInput checked={formData.is_period === "Y" ? true : false} onChange={(e) => onChangeFormData("is_period", e.target.checked ? "Y" : "N")} />
                                                            </div>
                                                        </div>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>연간 적용</label>
                                                        <div>
                                                            <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                                <FormCheckInput checked={formData.is_every_year === "Y" ? true : false} onChange={(e) => onChangeFormData("is_every_year", e.target.checked ? "Y" : "N")} />
                                                            </div>
                                                        </div>
                                                    </>
                                                :
                                                    <>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>작업 기간 설정</label>
                                                        <div style={{width: "190px"}}>
                                                            <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                                <FormCheckInput checked={formData.is_period === "Y" ? true : false} onChange={(e) => onChangeFormData("is_period", e.target.checked ? "Y" : "N")} />
                                                            </div>
                                                        </div>
                                                    </>
                                            }
                                            
                                        </div>

                                        {/* 휴무일, 작업내용 날짜 */}
                                        <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "40px"}}>
                                            <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>{formData.is_period === "Y" ? "시작일" : addType === "REST" ? "휴무일" : "작업일"}</label>
                                            <div style={{width: "170px"}}>
                                                <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                    <DateInput 
                                                        time={dateUtil.format(formData.date || dateUtil.now())} 
                                                        setTime={(value) => onChangeFormData("date", value)} 
                                                        minDate={minDate}
                                                        dateInputStyle={{margin: "0px"}}
                                                        calendarPopupStyle={{
                                                            zIndex: 1000,
                                                        }}
                                                    ></DateInput>
                                                </div>
                                            </div>

                                            {
                                                formData.is_period === "Y" ?
                                                    <>
                                                        <label style={{ marginLeft:"20px", marginRight: "5px", fontWeight: "bold", width: "80px" }}>종료일</label>
                                                        <div>
                                                            <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                                <DateInput 
                                                                    time={dateUtil.format(formData.period_date || dateUtil.now())} 
                                                                    setTime={(value) => onChangeFormData("period_date", value)} 
                                                                    minDate={minDate}
                                                                    dateInputStyle={{margin: "0px"}}
                                                                    calendarPopupStyle={{
                                                                        zIndex: 1000,
                                                                    }}
                                                                    
                                                                ></DateInput>
                                                            </div>
                                                        </div>
                                                    </>
                                                : null
                                            }
                                        </div>

                                        {/* 사유 */}
                                        <div style={{gridColumn: "span 2", padding: '10px', display: "flex", width: "100%"}}>
                                            <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>{addType === "REST" ? "휴무사유" : "작업내용"}</label>
                                            <div  sytle={{color: addType !== "REST" ? formData.content_color || "#000000" : null}}>
                                                {formData.reason === undefined || formData.reason === "" ? "-" : formData.reason}
                                            </div>
                                        </div>
                                    </div>
                                }
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
    gap: '10px',  // 요소 간의 간격 설정
    border: '2px solid #a5a5a5',
    borderRadius: '10px',
    padding: '0.5rem',
    width: '100%', 
    height: 'calc(100% - 1rem)',  
    overflowX: 'auto',            // 가로 스크롤
    overflowY: 'auto',            // 세로 스크롤
    marginTop: "5px"
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

const h2Style = {
    // minHeight: '50px',
    fontSize: '25px',
    // paddingTop: '5px',
};

export default AddDetailSchedule;