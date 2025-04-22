import { useState, useEffect } from "react";
import { Axios } from "../../../../../utils/axios/Axios";
import { dateUtil } from "../../../../../utils/DateUtil";
import Loading from "../../../../module/Loading";
import FormCheckInput from "react-bootstrap/esm/FormCheckInput";
import DateInput from "../../../../module/DateInput";
import Modal from "../../../../module/Modal";
import Select from "react-select";
import Exit from "../../../../../assets/image/exit.png";
import BackIcon from "../../../../../assets/image/back-arrow.png";
import { ObjChk } from "../../../../../utils/ObjChk";


const DetailSchedule = ({isOpen, isRest, restDates, dailyJobs, clickDate, exitBtnClick, restModifyBtnClick, restRemoveBtnClick, dailyJobModifyBtnClick, dailyJobRemoveBtnClick}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [remove, setRemove] = useState("N");
    const [edit, setEdit] = useState("N");
    const [editData, setEditData] = useState({});
    /** 프로젝트별 작업내용 **/
    const [jobsByProject, setJobsByProject] = useState([]);
    /** select **/
    const [projectOptions, setProjectOptions] = useState([]);
    /** 예/아니오 모달 **/
    const [isModal, setIsModal] = useState(false);
    const [modalText, setModalText] = useState("");

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
        const empty = {value:0, label:"미지정"};
        if(ObjChk.all(jno)){
            return empty;
        }

        const findProject = projectOptions.find(item => item.value === jno);
        if(findProject === undefined){
            return empty;
        }
        return findProject;
    }

    // 작업내용 클릭
    const onClickDailyJob = (item) => {
        setEdit("J");
        setRemove("N");
        setEditData({...item, date: dateUtil.format(item.date)});
    }

    // 휴무일 클릭
    const onClickRestDay = (item) => {
        setEdit("R");
        setRemove("N");
        setEditData({...item, date: dateUtil.format(new Date(`${item.rest_year}-${item.rest_month}-${item.rest_day}`))});
    }

    // 데이터 변경
    const onChangeEditData = (key, value) => {
        setEditData(prev => {
            return {...prev, [key]: value};
        });
    }

    // 수정 알림 모달
    const onClickSave = () => {
        setRemove("N");
        setIsModal(true);
        setModalText("수정하시겠습니까?");
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
                title={"일정관리"}
                text={modalText}
                confirm={"예"}
                fncConfirm={saveOrRemove}
                cancel={"아니오"}
                fncCancel={() => setIsModal(false)}
            />
            {
                isOpen ? (
                    <div style={overlayStyle}>
                        <div style={modalStyle}>

                            <div style={{ height: "50px", display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: "0px", marginRight: "5px", marginLeft: "5px" }}>
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
                                        edit !== "N" && 
                                        <>
                                            <div>
                                                <button className="btn btn-primary" onClick={onClickSave} name="confirm" style={{marginRight:"10px"}}>
                                                    수정
                                                </button>
                                            </div>
                                            <div>
                                                <button className="btn btn-primary" onClick={onClickRemove} name="confirm" style={{marginRight:"10px"}}>
                                                    삭제
                                                </button>
                                            </div>
                                        </>
                                    }
                                    <div onClick={exitBtnClick} style={{ cursor: "pointer" }}>
                                        <img src={Exit} style={{ width: "35px" }} alt="Exit" />
                                    </div>
                                </div>
                            </div>
                            
                            <div style={{display: "flex", justifyContent: "center", flex: 1, overflow: 'auto' }}>
                                <div style={gridStyle}>

                                    {
                                        edit === "N" ?
                                            <>
                                                    {
                                                        restDates.length === 0 ?
                                                            <div style={{gridColumn: "span 2", padding: '5px', display: "flex", alignItems: "center", width: "100%", height: "40px"}}>
                                                                <div style={{backgroundColor: "#f75d5d", width: "5px", height: "100%", borderRadius: "5px", marginRight: "5px"}}></div>
                                                                일정이 없습니다.
                                                            </div>
                                                        : restDates.map((item, idx) => (
                                                            item.is_hoilday ? 
                                                                <div style={{gridColumn: "span 2", padding: '5px', display: "flex", alignItems: "stretch", width: "100%", cursor: "pointer"}} key={idx}>
                                                                    <div style={{backgroundColor: "#f75d5d", width: "5px", height: "100%", borderRadius: "5px"}}></div>
                                                                    <div style={{textAlign:"left", marginLeft: "10px", width: "100%"}}>
                                                                        <div style={{fontSize: "20px", color: "black"}}>{item.reason}</div>
                                                                        <div style={{border: "1px solid #ccc", width: "100%"}}></div>
                                                                        <div style={{fontSize: "13px"}}>공휴일</div>
                                                                    </div>
                                                                </div>
                                                            : 
                                                                <div 
                                                                    className="detail-rest-item"
                                                                    style={{gridColumn: "span 2", padding: '5px', display: "flex", alignItems: "stretch", width: "100%", cursor: "pointer"}} key={idx}
                                                                    onClick={() => onClickRestDay(item)}
                                                                >
                                                                    <div style={{backgroundColor: "#f75d5d", width: "5px", borderRadius: "5px"}}></div>
                                                                    <div style={{textAlign:"left", marginLeft: "10px", width: "100%"}}>
                                                                        <div style={{fontSize: "20px", color: "black"}}>{item.reason}</div>
                                                                        <div style={{border: "1px solid #ccc", width: "100%"}}></div>
                                                                        <div style={{fontSize: "13px"}}>{`휴무일 : ${getProject(item.jno).label}`}</div>
                                                                    </div>
                                                                </div>
                                                        ))
                                                    }
                                                    {
                                                        jobsByProject.length === 0 ?
                                                            <div style={{gridColumn: "span 2", padding: '5px', display: "flex", alignItems: "center", width: "100%", height: "40px"}}>
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
                                                                                <div style={{fontSize: "13px", fontWeight: "bold", color: "gray", marginLeft: "-5px", marginBottom: "5px"}}>작업일정</div>
                                                                                {
                                                                                    jobs.map((item, i_idx) => (
                                                                                        <div 
                                                                                            className="detail-daily-job"
                                                                                            style={{fontSize: "17px", display: "flex", alignItems: "center", cursor: "pointer", paddingBottom: "2px", color: "black"}}
                                                                                            key={`${j_idx}_${i_idx}`}
                                                                                            onClick={() => onClickDailyJob(item)}
                                                                                        >
                                                                                            <div style={{marginRight: "5px", paddingBottom: "3px"}}>●</div>
                                                                                            <div>{item.content}</div>
                                                                                        </div>
                                                                                    ))
                                                                                }
                                                                                <div style={{border: "1px solid #ccc", width: "100%"}}></div>
                                                                                <div style={{fontSize: "13px"}}>{getProject(jobs[0].jno).label}</div>
                                                                            </div>
                                                                        </div>
                                                                    ))
                                                                }
                                                            </div>
                                                    }
                                            </>
                                        :   edit === "R" ?
                                                <>
                                                    {/* 프로젝트 */}
                                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "40px"} }>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>프로젝트</label>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{height: "40px", display: "flex", alignItems: "center", width: "100%" }}>
                                                                <Select
                                                                    onChange={(e) => onChangeEditData("jno", e.value)}
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
                                                                        width: "665px",
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
                                                                <FormCheckInput checked={editData.is_every_year === "Y" ? true : false} onChange={(e) => onChangeEditData("is_every_year", e.target.checked ? "Y" : "N")} />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 휴무일 날짜 */}
                                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "40px"}}>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>휴무일</label>
                                                        <div style={{width: "200px"}}>
                                                            <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                                <DateInput 
                                                                    time={editData.date} 
                                                                    setTime={(value) => onChangeEditData("date", value)} 
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
                                                    </div>

                                                    {/* 사유 */}
                                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "40px"}}>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>휴무사유</label>
                                                        <div>
                                                            <input className="text-input" type="text" value={editData.reason === undefined ? "" : editData.reason} onChange={(e) => onChangeEditData("reason", e.target.value)} style={{width: "665px", textAlign: "left", paddingLeft: "10px"}}/>
                                                        </div>
                                                    </div>
                                                </>
                                        :   edit === "J" ?   
                                                <>
                                                    {/* 프로젝트 */}
                                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "40px"} }>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>프로젝트</label>
                                                        <div style={{ flex: 1 }}>
                                                            <div style={{height: "40px", display: "flex", alignItems: "center", width: "100%" }}>
                                                                <Select
                                                                    onChange={(e) => onChangeEditData("jno", e.value)}
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
                                                                        width: "665px",
                                                                        }),
                                                                    }}
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* 작업내용 날짜 */}
                                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "40px"}}>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>{editData.is_period === "Y" ? "시작일" : "휴무일"}</label>
                                                        <div style={{width: "200px"}}>
                                                            <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                                <DateInput 
                                                                    time={editData.date} 
                                                                    setTime={(value) => onChangeEditData("date", value)} 
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
                                                    </div>

                                                    {/* 작업내용 */}
                                                    <div style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "40px"}}>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "80px" }}>작업내용</label>
                                                        <div>
                                                            <input className="text-input" type="text" value={editData.content === undefined ? "" : editData.content} onChange={(e) => onChangeEditData("content", e.target.value)} style={{width: "665px", textAlign: "left", paddingLeft: "10px"}}/>
                                                        </div>
                                                    </div>
                                                </>
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
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',  // 한 행에 두 개의 열
    gap: '5px',
    borderTop: '2px dotted #a5a5a5',
    // borderRadius: '10px',
    padding: '10px',
    width: '98%', 
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

export default DetailSchedule;