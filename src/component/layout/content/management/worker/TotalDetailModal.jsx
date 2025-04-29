import { useState, useEffect } from "react";
import { Axios } from "../../../../../utils/axios/Axios";
import { Common } from "../../../../../utils/Common";
import Exit from "../../../../../assets/image/exit.png";
import "../../../../../assets/css/TotalDetailModal.css";
import Radio from "../../../../module/Radio";
import FormCheckInput from "react-bootstrap/esm/FormCheckInput";
import DateInput from "../../../../module/DateInput";
import { dateUtil } from "../../../../../utils/DateUtil";
import SearchAllProjectModal from "../../../../module/modal/SearchAllProjectModal";
import CancelIcon from "../../../../../assets/image/cancel.png"
import "../../../../../assets/css/Input.css";
import { ObjChk } from "../../../../../utils/ObjChk";
/**
 * @description: 전체 근로자 상세화면 모달 컴포넌트
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-04-11
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - Input.jsx
 * 
 * @additionalInfo
 * - props: 
 *  isOpen: true|false (오픈여부) 
 *  gridMode: "SAVE"|"DETAIL"|"EDIT"|"REMOVE" (모드 선택)
 *  funcModeSet: fuction("SAVE"|"DETAIL"|"EDIT"|"REMOVE") (부모 컴포넌트 모드 변경)
 *  editBtn: true|false (수정버튼 여부) 
 *  removeBtn: true|false (삭제버튼 여부) 
 *  title: 제목
 *  detailData: Input 컴포넌트 props 리스트
 *  selectList: Input 컴포넌트 selectData props
 *  exitBtnClick: 종료버튼 fuction
 *  saveBtnClick: 저장버튼 function (저장, 수정 둘다 포함)
 *  removeBtnClick: 삭제버튼 function
 */
const TotalDetailModal = ({ isOpen, gridMode, funcModeSet, editBtn, removeBtn, title, detailData, selectList, exitBtnClick, saveBtnClick, removeBtnClick, isCancle = true }) => {
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState([]);
    const [initialData, setInitialData] = useState([]); // 원본 데이터 저장
    /** 마스킹 된 주민번호 **/
    const [maskRegNo, setMaskRegNo ] = useState();
    /** 근로자 코드 **/
    const [workerTypes, setWorkerTypes] = useState([]);
    const [isProjectOpenModal, setIsProjectOpenModal] = useState(false);


    // 입력값 변경 핸들러
    const onChangeFormData = (key, value) => {
        setFormData(prevData => {
            return {...prevData, [key]: value};
        });
    };

    // 현장 리스트 조회 - 프로젝트 선택 시 자동으로 값 넣기
    const getSiteData = async (sno) => {
        if(ObjChk.all(sno)){
            onChangeFormData("site_nm", "-");
            return
        }
        const res = await Axios.GET(`/site/nm?page_num=${1}&row_size=${10}&order=&sno=${sno}&site_nm=&loc_name=&etc=`);
        if (res?.data?.result === "Success") {
            onChangeFormData("site_nm", res.data.values?.list[0]?.site_nm);
        } else{
            onChangeFormData("site_nm", "-");
        }
    }

    // 주민번호 마스킹 변경 처리 
    const onChangeRegMasking = (value) => {
        let newRegNo = formData.reg_no.replaceAll("-", "") || "";
        const maskLength = value?.replaceAll("-", "").length || 0;
        const realLength = newRegNo.length;
        

        if(maskLength === 0) {
            newRegNo = "";
        }else if(maskLength < realLength){
            newRegNo = newRegNo.slice(0, maskLength);
        }else{
            newRegNo += value?.replaceAll("-", "").slice(-1);
        }

        newRegNo = Common.residentNumber(newRegNo);
        setMaskRegNo(value);
        onChangeFormData("reg_no", newRegNo);
    }

    // "X"
    const handleExit = () => {
        setFormData(initialData); // 초기 데이터로 되돌리기
        setIsEditfalse();
        exitBtnClick();
    };

    // "취소" 버튼 클릭 시 원래 데이터로 복구
    const handleCancel = () => {
        setFormData(initialData); // 초기 데이터로 되돌리기
        setIsEditfalse();
    };

    // 수정모드로 변경
    const handleEditMode = () => {
        funcModeSet("EDIT");
        // setIsEdit(true);
    }

    // 저장, 수정
    const handleSave = (e) => {
        document.body.style.overflow = 'unset';
        saveBtnClick(formData, gridMode);  // 최종 데이터를 전달            
    };

    // 삭제
    const handleRemove = () => {
        removeBtnClick(formData);
    }

    // 편집모드 해제
    const setIsEditfalse = () => {
        if (gridMode === "EDIT"){
            funcModeSet("DETAIL");
            setIsEdit(false); // 편집 모드 해제
        }
    }

    // 프로젝트 선택 버튼 클릭 시
    const onClickSearchProject = () => {
        setIsProjectOpenModal(true)
    }    
    
    // 프로젝트 삭제 버튼 클릭 시
    const handleRefreshProject = () => {
        projectInputChangeHandler({})
    }

    // projectInput 체인지 이벤트
    const projectInputChangeHandler = (item) => {
        const newValue = {
            ...item
        };
        onChangeFormData("project", newValue)
    }

    // 근로자 구분 코드 조회
    const getWorkerType = async() => {
        const res = await Axios.GET(`/code?p_code=WORKER_TYPE`);

        if (res?.data?.result === "Success") {
            setWorkerTypes(res?.data?.values?.list);
        }
    }

    // detailData가 변경될 때 상태를 업데이트 (최초 데이터 저장)
    useEffect(() => {
        setFormData(structuredClone(detailData));
        setInitialData(structuredClone(detailData)); // 초기 데이터 저장
        /** 주민번호 **/
        setMaskRegNo(detailData.reg_no);
        /** 근로자 구분 코드 조회 **/
        getWorkerType();
        
    }, [detailData]);

    useEffect(()=> {
        getSiteData(formData.project?.sno)  
    }, [formData.project])

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    useEffect(() => {
        if (gridMode === "SAVE" || gridMode === "EDIT") {
            setIsEdit(true);
        }else {
            setIsEdit(false);
        }
    }, [gridMode]);

    useEffect(() => {
            if (isOpen) {
                document.body.style.overflow = "hidden";
    
                // 엔터 키 이벤트 핸들러
                const handleKeyDown = (event) => {
                    if (event.key === "Escape") {
                        handleExit();
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
        }, [formData.site_nm])

        return (
        <div>
            {isOpen ? (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <div style={{ height: "50px", display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: "0px", marginRight: "5px", marginLeft: "5px" }}>
                            {/* 왼쪽 - 제목 */}
                            <h2 style={h2Style}>{title}</h2>

                            {/* 오른쪽 - 버튼 & 닫기 아이콘 */}
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                {
                                    gridMode === "SAVE" ?
                                        <div>
                                            <button className="btn btn-primary" onClick={handleSave} name="confirm" style={{marginRight:"10px"}}>
                                                저장
                                            </button>
                                        </div>
                                    :
                                        isEdit ?
                                            <div>
                                                <button className="btn btn-primary" onClick={handleSave} name="confirm" style={{marginRight:"10px"}}>
                                                    저장
                                                </button>   
                                                {
                                                    isCancle ?
                                                        <button className="btn btn-primary" onClick={handleCancel} name="confirm" style={{marginRight:"10px"}}>
                                                            취소
                                                        </button> 
                                                    : null
                                                }
                                            </div>
                                        :
                                            <div>
                                                {
                                                    editBtn ? 
                                                        <button type="button" className="btn btn-primary" onClick={handleEditMode} name="confirm" style={{marginRight:"10px"}}>
                                                            수정
                                                        </button>
                                                    : null
                                                }
                                                {
                                                    removeBtn ?
                                                        <button className="btn btn-primary" onClick={handleRemove} name="confirm" style={{marginRight:"10px"}}>
                                                            삭제
                                                        </button>
                                                    : null
                                                }
                                            </div>
                                }

                                <div onClick={handleExit} style={{ cursor: "pointer" }}>
                                    <img src={Exit} style={{ width: "35px" }} alt="Exit" />
                                </div>
                            </div>
                        </div>

                        <div style={{ flex: 1, overflow: 'auto' }}>
                            <div style={gridStyle}>
                                {/* 현장 */}
                                <div className="form-control" style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%"}}>
                                    <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>현장</label>
                                    <div className="grid-input" style={{ flex: 1 }}>
                                        <div className="grid-input">
                                            {formData?.site_nm ? formData.site_nm : "-"}
                                        </div>
                                   </div>
                                </div>
                                 {/* 프로젝트 */}
                                 <div className="form-control" style={{gridColumn: "span 2", padding: '10px', display: "flex", alignItems: "center", width: "100%"}}>
                                    <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>프로젝트</label>
                                    <div className="grid-input" style={{ flex: 1 }}>
                                        {
                                            isEdit && gridMode === "SAVE" ?
                                                <> 
                                                    <SearchAllProjectModal
                                                        isOpen={isProjectOpenModal} 
                                                        fncExit={() => setIsProjectOpenModal(false)} 
                                                        onClickRow={(item) => projectInputChangeHandler(item)} 
                                                    />
                                                    <form className="input-group" style={{margin:"0px", display:"flex", flexWrap:"nowrap"}}>
                                                        <input className="form-control" type="text" value={formData.project?.job_name || ''} placeholder="Proejct를 선택하세요" aria-label="Proejct를 선택하세요" aria-describedby="btnNavbarSearch" onClick={onClickSearchProject} readOnly/>
                                                        {
                                                            ( formData.project?.job_name &&
                                                                <img 
                                                                src={CancelIcon}
                                                                alt="취소"
                                                                    style={{
                                                                        position: "absolute",
                                                                        top: "52%",
                                                                        right: "41px",
                                                                        transform: "translateY(-50%)",
                                                                        cursor: "pointer",
                                                                        width: "20px",
                                                                        margin: "0px 0.5rem"
                                                                    }}
                                                                    onClick={handleRefreshProject}
                                                                    />
                                                                )
                                                            }
                                                            <button className="btn btn-primary" id="btnNavbarSearch" type="button"  onClick={onClickSearchProject}>
                                                                <i className="fas fa-search" />
                                                            </button>
                                                    </form>
                                                </>
                                            :
                                                <div className="grid-input">
                                                    {formData.job_name ? formData.job_name : "-"}
                                                </div>
                                        }
                                    </div>
                                </div>
                                {/* 아이디 */}
                                <div className="form-control" style={{gridColumn: "auto", padding: '10px', display: "flex", alignItems: "center", width: "100%"}}>
                                    <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>아이디</label>
                                    <div className="grid-input" style={{ flex: 1 }}>
                                        {
                                            isEdit && gridMode === "SAVE" ?
                                                <input type="text" value={formData.user_id} onChange={(e) => onChangeFormData("user_id", e.target.value)}/>
                                            :
                                                formData.user_id
                                        }
                                    </div>
                                </div>
                                {/* 이름 */}
                                <div className="form-control" style={{gridColumn: "auto", padding: '10px', display: "flex", alignItems: "center", width: "100%"}}>
                                    <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>이름</label>
                                    <div className="grid-input" style={{ flex: 1 }}>
                                        {
                                            isEdit ?
                                                <input type="text" value={formData.user_nm} onChange={(e) => onChangeFormData("user_nm", e.target.value)}/>
                                            :
                                                formData.user_nm
                                        }
                                    </div>
                                </div>                               
                                {/* 부서/조직명 */}
                                <div className="form-control" style={{gridColumn: "auto", padding: '10px', display: "flex", alignItems: "center", width: "100%"}}>
                                    <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>부서/조직명</label>
                                    <div className="grid-input" style={{ flex: 1 }}>
                                        {
                                            isEdit ?
                                                <input type="text" value={formData.department} onChange={(e) => onChangeFormData("department", e.target.value)}/>
                                            :
                                                formData.department
                                        }
                                    </div>
                                </div>
                                {/* 핸드폰 번호 */}
                                <div className="form-control" style={{gridColumn: "auto", padding: '10px', display: "flex", alignItems: "center", width: "100%"}}>
                                    <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>핸드폰 번호</label>
                                    <div className="grid-input" style={{ flex: 1 }}>
                                        {
                                            isEdit ?
                                                <input type="text" value={formData.phone} onChange={(e) => onChangeFormData("phone", Common.formatMobileNumber(e.target.value))}/>
                                            :
                                                formData.phone
                                        }
                                    </div>
                                </div>
                                {/* 주민등록 번호 */}
                                <div className="form-control" style={{gridColumn: "auto", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "62px"}}>
                                    <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>주민등록 번호</label>
                                    <div className="grid-input" style={{ flex: 1 }}>
                                        {
                                            isEdit ?
                                                <>
                                                    <input type="text" value={Common.maskResidentNumber(maskRegNo)} onChange={(e) => onChangeRegMasking(e.target.value)}/>
                                                    <input type="hidden" value={formData.reg_no}/>
                                                </>
                                            :
                                                Common.maskResidentNumber(formData.reg_no)
                                        }
                                    </div>
                                </div>
                                 {/* 공종 */}
                                 <div className="form-control" style={{gridColumn: "auto", padding: '10px', display: "flex", alignItems: "center", width: "100%"}}>
                                    <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>공종</label>
                                    <div className="grid-input" style={{ flex: 1 }}>
                                        {
                                            isEdit ?
                                                <input type="text" value={formData.disc_name} onChange={(e) => onChangeFormData("disc_name", e.target.value)}/>
                                            :
                                                formData.disc_name
                                        }
                                    </div>
                                </div>

                                {/* 근로자 구분 */}
                                <div className="form-control" style={{gridColumn: "auto", padding: '10px', width: "100%"}}>
                                    <div style={{display: "flex", alignItems: "center"}}>
                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>근로자 구분</label>
                                        <div className="grid-input" style={{ flex: 1 }}>
                                            {
                                                isEdit ?
                                                    <div style={{ height: "40px", display: 'flex', gap: "30px", fontSize: "15px"}}>
                                                        {
                                                            workerTypes.map((item, idx) => (
                                                                <Radio text={workerTypes[idx].code_nm} value={workerTypes[idx].code} name="group1" checked={formData.worker_type === item.code} onChange={(e) => onChangeFormData("worker_type", e.target.value)} key={idx}/>
                                                            ))
                                                        }
                                                    </div>
                                                :
                                                    <div style={{ height: "40px", display: 'flex', gap: "30px", fontSize: "15px"}}>
                                                        {
                                                            workerTypes.map((item, idx) => (
                                                                <Radio text={workerTypes[idx].code_nm} value={workerTypes[idx].code} name="group1" checked={formData.worker_type === item.code} disabled={true} key={idx}/>
                                                            ))
                                                        }
                                                    </div>
                                            }
                                        </div>
                                    </div>
                                    </div>
                                    {isEdit? 
                                    <div className="form-control" style={{gridColumn: "auto", padding: '10px', width: "100%"}}>
                                        <div style={{paddingLeft: "115px"}}>
                                            {
                                                formData.worker_type === "02" ?
                                                isEdit ?
                                                <div style={{ height: "40px", display: 'flex', gap: "30px", fontSize: "15px"}}>
                                                            {
                                                                <>
                                                                    <Radio text={"관리자"} value={"Y"} name="group2" checked={formData.is_manage === 'Y'} onChange={(e) => onChangeFormData("is_manage", e.target.value)}/>
                                                                    <Radio text={"근로자"} value={"N"} name="group2" checked={formData.is_manage === 'N'} onChange={(e) => onChangeFormData("is_manage", e.target.value)}/>
                                                                </>
                                                            }
                                                        </div>
                                                    :
                                                    <div style={{ height: "40px", display: 'flex', gap: "30px", fontSize: "15px"}}>
                                                            {
                                                                <>
                                                                    <Radio text={"관리자"} value={"Y"} name="group2" checked={formData.is_manage === 'Y'} disabled={true}/>
                                                                    <Radio text={"근로자"} value={"N"} name="group2" checked={formData.is_manage === 'N'} disabled={true}/>
                                                                </>
                                                            }
                                                        </div>
                                                :null
                                            }
                                        </div>
                                </div>
                                :null}
                            
                                {/* 퇴직여부 */}
                                <div className="form-control" style={{gridColumn: "auto", padding: '10px', display: "flex", alignItems: "center", width: "100%"}}>
                                    <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>퇴직여부</label>
                                    <div className="grid-input" style={{ flex: 1 }}>
                                        <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                            <FormCheckInput checked={formData.is_retire === "Y" ? true : false} onChange={(e) => onChangeFormData("is_retire", e.target.checked ? "Y" : "N")} disabled={!isEdit} />
                                        </div>
                                    </div>
                                </div>
                                {/* 퇴직날짜 */}
                                {
                                    formData.is_retire === "Y" ?
                                        <div className="form-control" style={{gridColumn: "auto", padding: '10px', display: "flex", alignItems: "center", width: "100%"}}>
                                            <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>퇴직날짜</label>
                                            <div className="grid-input" style={{ flex: 1 }}>
                                                {
                                                    isEdit ?
                                                        <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                                                            <DateInput 
                                                                time={dateUtil.format(formData.retire_date)} 
                                                                setTime={(value) => onChangeFormData("retire_date", value)} 
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
                                                    :
                                                        <div className="grid-input">
                                                            {dateUtil.format(formData.retire_date)}
                                                        </div>
                                                }
                                            </div>
                                        </div>
                                    :<div></div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

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

const buttonDivStyle = {
    display: 'flex', alignItems: 'center', marginBottom: '15px'
};

const buttonStyle = {
    margin: '5px',
    width: '30%',
};

export default TotalDetailModal;
