import { useState, useEffect } from "react";
import { useAuth } from "../../../../context/AuthContext";
import { Axios } from "../../../../../utils/axios/Axios";
import { dateUtil } from "../../../../../utils/DateUtil";
import DateInput from "../../../../module/DateInput";
import FormCheckInput from "react-bootstrap/esm/FormCheckInput";
import Select from "react-select";
import Loading from "../../../../module/Loading";
import Exit from "../../../../../assets/image/exit.png";

const AddDetailSchedule = ({ isOpen, clickDate, exitBtnClick, restSaveBtnClick }) => {
    const { project} = useAuth();

    const [formData, setFormData] = useState([]);
    /** 로딩 **/
    const [isLoading, setIsLoading] = useState(false);
    /** select **/
    const [projectOptions, setProjectOptions] = useState([]);

    // 휴무일 저장
    const handleSave = (e) => {
        document.body.style.overflow = 'unset';
        restSaveBtnClick(formData);
    };

    // 상세 데이터 변경
    const onChangeFormData = (key, value) => {
        setFormData(prev => {
            return {...prev, [key]: value};
        });
    }

    // 프로젝트 리스트 조회 및 셀렉트 옵션 생성
    const getProjectData = async () => {
        setIsLoading(true);

        const res = await Axios.GET(`/project/job_name`);
        if (res?.data?.result === "Success") {
            const options = [{value:0, label: "전체 적용"}];
            res?.data?.values?.list.map(item => {
                options.push({value: item.jno, label: item.project_nm});
            });
            setProjectOptions(options);
        }

        setIsLoading(false);
        return true;
    }

    /***** useEffect *****/

    useEffect(() => {
        if(isOpen){
            onChangeFormData("mod", "REST");
            // 프로젝트
            if(project !== null){
                onChangeFormData("jno", project.jno);
            }else{
                onChangeFormData("jno", 0);
            }
            // 선택날짜
            if(clickDate !== null){
                onChangeFormData("date", `${clickDate.getFullYear()}-${clickDate.getMonth()+1}-${clickDate.getDate()}`);
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
            {
                isOpen ? (
                    <div style={overlayStyle}>
                        <div style={modalStyle}>

                            <div style={{ height: "50px", display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: "0px", marginRight: "5px", marginLeft: "5px" }}>
                                {/* 왼쪽 - 제목 */}
                                <h2 style={h2Style}>일정관리 추가</h2>

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

                            
                            <div style={{ flex: 1, overflow: 'auto' }}>
                                <div style={gridStyle}>

                                    {/* 프로젝트 */}
                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "40px"} }>
                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>프로젝트</label>
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
                                                        width: "100%",
                                                        }),
                                                    }}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 체크 */}
                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "40px"}}>
                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>연간 적용</label>
                                        <div style={{width: "50px"}}>
                                            <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                <FormCheckInput checked={formData.is_every_year === "Y" ? true : false} onChange={(e) => onChangeFormData("is_every_year", e.target.checked ? "Y" : "N")} />
                                            </div>
                                        </div>
                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>기간 설정</label>
                                        <div>
                                            <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                <FormCheckInput checked={formData.is_period === "Y" ? true : false} onChange={(e) => onChangeFormData("is_period", e.target.checked ? "Y" : "N")} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* 휴무일 날짜 */}
                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "40px"}}>
                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>{formData.is_period === "Y" ? "시작일" : "휴무일"}</label>
                                        <div style={{width: "200px"}}>
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
                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>휴무사유</label>
                                        <div>
                                            <input className="text-input" type="text" value={formData.reason === undefined ? "" : formData.reason} onChange={(e) => onChangeFormData("reason", e.target.value)} style={{width: "500px", textAlign: "left"}}/>
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
    maxWidth: '1200px',
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