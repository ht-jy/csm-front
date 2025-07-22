import { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { Axios } from "../../../../../utils/axios/Axios";
import { useNavigate } from "react-router-dom";
import { dateUtil } from "../../../../../utils/DateUtil";
import DateInput from "../../../../module/DateInput";
import FormCheckInput from "react-bootstrap/esm/FormCheckInput";
import Select from "react-select";
import Loading from "../../../../module/Loading";
import Exit from "../../../../../assets/image/exit.png";
import RadioInput from "../../../../module/RadioInput";
import Modal from "../../../../module/Modal";

/**
 * @description: 일정관리 추가 화면
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-04-28
 * @modified 최종 수정일: 2025-07-22 
 * @modifiedBy 최종 수정자: 정지영
 * 2025-07-22: props에 jobjno추가
 * 
 * 
 * @additionalInfo
 * - props
 * isOpen: true|false
 * clickDate: 선택날짜
 * exitBtnClick: 모달 닫기 함수
 * restSaveBtnClick: 휴무일 저장 함수
 * jobSaveBtnClick: 작업내용 저장 함수
 * jobjno: 프로젝트 기본 설정에 사용(기본값 0)
 */
const AddDetailSchedule = ({ isOpen, clickDate, exitBtnClick, restSaveBtnClick, jobSaveBtnClick, jobjno = 0 }) => {
    const navigate = useNavigate();
    const { project} = useAuth();
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

    // 휴무일, 작업내용 저장
    const handleSave = (e) => {
        document.body.style.overflow = 'unset';
        if(addType === "REST"){
            restSaveBtnClick(formData);
        }else{
            jobSaveBtnClick(formData);
        }
        
    };

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
        setFormData(prev => {
            return {...prev, [key]: value};
        });
    }

    // 프로젝트 리스트 조회 및 셀렉트 옵션 생성
    const getProjectData = async () => {
        setIsLoading(true);
        try {
            const res = await Axios.GET(`/project/job_name`);
            if (res?.data?.result === "Success") {
                // 프로젝트 정보
                setSimpleProjects(res?.data?.values?.list);
                // 셀렉트 옵션
                const options = [{value:0, label: "전체 적용"}];
                res?.data?.values?.list.map(item => {
                    options.push({value: item.jno, label: item.project_nm});
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
            if(project !== null){
                onChangeFormData("jno", project.jno);
            }else{
                onChangeFormData("jno", jobjno);
            }
            // 선택날짜
            if(clickDate !== null){
                onChangeFormData("date", `${clickDate.getFullYear()}-${String(clickDate.getMonth()+1).padStart(2, '0')}-${String(clickDate.getDate()).padStart(2, '0')}`);
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
                title={"일정관리"}
                text={modalText}
                confirm={"확인"}
                fncConfirm={() => setIsModal(false)}
            />
            {
                isOpen ? (
                    <div style={overlayStyle}>
                        <div style={modalStyle}>

                            <div style={{ height: "50px", display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: "0px", marginRight: "5px", marginLeft: "5px" }}>
                                {/* 왼쪽 - 제목 */}
                                <div style={{display: "flex", alignItems: "flex-end"}}>
                                    <h2 style={h2Style}>일정관리 추가</h2>
                                    {/* <div style={{marginLeft: "20px"}}>
                                        <RadioInput itemName={"schedule"} selectedValue={addType} values={["REST", "JOB"]} labels={["휴무일", "작업내용"]} setRadio={(value) => setAddType(value)}/>
                                    </div> */}
                                </div>

                                {/* 오른쪽 - 버튼 & 닫기 아이콘 */}
                                <div style={{ display: 'flex', alignItems: 'center' }}>
                                    <div>
                                        <button className="btn btn-primary" onClick={handleSave} name="confirm" style={{marginRight:"10px"}}>
                                            저장
                                        </button>
                                    </div>
                                    <div onClick={exitBtnClick} style={{ cursor: "pointer" }}>
                                        <img src={Exit} style={{ width: "35px" }} alt="Exit" />
                                    </div>
                                </div>
                            </div>

                            {/* content */}
                            <div style={{ flex: 1, overflow: 'auto' }}>
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
                                                <RadioInput itemName={"schedule"} selectedValue={addType} values={["JOB", "REST"]} labels={["작업내용", "휴무일"]} setRadio={(value) => setAddType(value)}/>
                                            </div>
                                        </div>
                                    </div>

                                    {/* 체크 */}
                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "40px"}}>
                                        {
                                            addType === "REST" ?
                                                <>
                                                    <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>휴무 기간 설정</label>
                                                    <div style={{width: "50px"}}>
                                                        <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                            <FormCheckInput checked={formData.is_period === "Y" ? true : false} onChange={(e) => onChangeFormData("is_period", e.target.checked ? "Y" : "N")} />
                                                        </div>
                                                    </div>
                                                    <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>연간 적용</label>
                                                    <div>
                                                        <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                            <FormCheckInput checked={formData.is_every_year === "Y" ? true : false} onChange={(e) => onChangeFormData("is_every_year", e.target.checked ? "Y" : "N")} />
                                                        </div>
                                                    </div>
                                                </>
                                            :
                                                <>
                                                    <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>작업 기간 설정</label>
                                                    <div style={{width: "50px"}}>
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
                                                    time={dateUtil.format(formData.date)} 
                                                    setTime={(value) => onChangeFormData("date", value)} 
                                                    dateInputStyle={{margin: "0px"}}
                                                    calendarPopupStyle={{
                                                        position: "fixed",
                                                        top: "50%",
                                                        left: "50%",
                                                        transform: "translate(-50%, -50%)",
                                                        zIndex: 1000,
                                                    }}
                                                ></DateInput>
                                            </div>
                                        </div>

                                        {
                                            formData.is_period === "Y" ?
                                                <>
                                                    <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>종료일</label>
                                                    <div>
                                                        <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                            <DateInput 
                                                                time={dateUtil.format(formData.period_date)} 
                                                                setTime={(value) => onChangeFormData("period_date", value)} 
                                                                dateInputStyle={{margin: "0px"}}
                                                                calendarPopupStyle={{
                                                                    position: "fixed",
                                                                    top: "50%",
                                                                    left: "50%",
                                                                    transform: "translate(-50%, -50%)",
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
                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "40px"}}>
                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>{addType === "REST" ? "휴무사유" : "작업내용"}</label>
                                        <div>
                                            <input className="text-input" type="text" value={formData.reason === undefined ? "" : formData.reason} onChange={(e) => onChangeFormData("reason", e.target.value)} style={{width: "635px", textAlign: "left", paddingLeft: "10px"}}/>
                                        </div>
                                    </div>
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
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',  // 한 행에 두 개의 열
    gap: '10px',  // 요소 간의 간격 설정
    border: '2px solid #a5a5a5',
    borderRadius: '10px',
    padding: '10px',
    width: '100%', 
    // height: 'calc(100% - 60px)',  // 버튼과 라디오 영역을 제외한 높이
    overflowX: 'auto',            // 가로 스크롤
    overflowY: 'auto',            // 세로 스크롤
    marginTop: "5px",
    padding: "5px",
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
    height: 'auto',
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