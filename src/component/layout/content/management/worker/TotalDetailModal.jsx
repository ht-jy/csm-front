import { useState, useEffect } from "react";
import { Axios } from "../../../../../utils/axios/Axios";
import { Common } from "../../../../../utils/Common";
import { ObjChk } from "../../../../../utils/ObjChk";
import { dateUtil } from "../../../../../utils/DateUtil";
import { useNavigate } from "react-router-dom";
import Radio from "../../../../module/Radio";
import FormCheckInput from "react-bootstrap/esm/FormCheckInput";
import DateInput from "../../../../module/DateInput";
import SearchUsedProjectModal from "../../../../module/modal/SearchUsedProjectModal";
import Exit from "../../../../../assets/image/exit.png";
import CancelIcon from "../../../../../assets/image/cancel.png";
import EyeIcon from "../../../../../assets/image/eye-alert.png";
import "../../../../../assets/css/TotalDetailModal.css";
import "../../../../../assets/css/Input.css";
import Modal from "../../../../module/Modal";
import { useUserRole } from "../../../../../utils/hooks/useUserRole";
import { workerRoles } from "../../../../../utils/rolesObject/workerRoles";

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
    const navigate = useNavigate();
    const { isRoleValid } = useUserRole();

    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState({});
    const [initialData, setInitialData] = useState([]); // 원본 데이터 저장
    /** 마스킹 된 주민번호 **/
    const [frontReg, setFrontReg] = useState("");
    const [backReg, setBackReg] = useState("");
    const [initFrontReg, setInitFrontReg] = useState("");
    const [initBackReg, setInitBackReg] = useState("");
    /** 마스킹 아이콘 클릭중 **/
    const [showFullRegNo, setShowFullRegNo] = useState(false);
    /** 근로자 코드 **/
    const [workerTypes, setWorkerTypes] = useState([]);
    const [isProjectOpenModal, setIsProjectOpenModal] = useState(false);
    /** 모달 **/
    const [isModal, setIsModal] = useState(false);
    const [modalText, setModalText] = useState("");

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

        try {
            const res = await Axios.GET(`/site/nm?page_num=${1}&row_size=${10}&order=&sno=${sno}&site_nm=&loc_name=&etc=`);
            if (res?.data?.result === "Success") {
                onChangeFormData("site_nm", res.data.values?.list[0]?.site_nm);
            } else{
                onChangeFormData("site_nm", "-");
            }
        } catch(err) {
            navigate("/error");
        }
    }

    // 주민번호 마스킹 변경 처리
    const onChangeBackReg = (value) => {
        if(value.length > 7) value=value.substring(0, 7);

        const lastAsteriskIndex = value.lastIndexOf("*");
        if(lastAsteriskIndex === -1){
            setBackReg(value);
            return;
        }

        const nextCharIndex = lastAsteriskIndex + 1 < value.length ? lastAsteriskIndex + 1 : -1;
        if(nextCharIndex === -1){
            setBackReg(backReg.substring(0, lastAsteriskIndex+1));
            return;
        }else{
            setBackReg(backReg.substring(0, lastAsteriskIndex+1)+value.substring(nextCharIndex));
            return;
        }
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
        setFrontReg(initFrontReg);
        setBackReg(initBackReg);
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
        
        if(formData.project === undefined){
            if(gridMode === "SAVE"){
                setModalText("프로젝트를 선택하여 주세요.");
                setIsModal(true);
                return;
            }
        }else if(formData.user_id === undefined || formData.user_id === ""){
            setModalText("아이디를 입력하여 주세요.");
            setIsModal(true);
            return;
        } else if (frontReg.length < 6){
            setModalText("주민등록번호 앞자리를 입력하여 주세요.");
            setIsModal(true);
            return;
        }

        if(backReg === ""){
            formData.reg_no = frontReg;
        }else{
            formData.reg_no = `${frontReg}-${backReg}`;
        }
        saveBtnClick(formData, gridMode);
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
        try {
            const res = await Axios.GET(`/code?p_code=WORKER_TYPE`);

            if (res?.data?.result === "Success") {
                setWorkerTypes(res?.data?.values?.list);
            }
        } catch(err) {
            navigate("/error");
        }
    }

    // detailData가 변경될 때 상태를 업데이트 (최초 데이터 저장)
    useEffect(() => {
        setFormData(structuredClone(detailData));
        setInitialData(structuredClone(detailData)); // 초기 데이터 저장
        /** 주민번호 **/
        if(ObjChk.all(detailData.reg_no)){
            setFrontReg("");
            setBackReg("");
            setInitFrontReg("");
            setInitBackReg("");
        }else{
            if(detailData.reg_no.includes("-")){
                setFrontReg(detailData.reg_no.split("-")[0]);
                setBackReg(detailData.reg_no.split("-")[1]);
                setInitFrontReg(detailData.reg_no.split("-")[0]);
                setInitBackReg(detailData.reg_no.split("-")[1]);
            }else if(detailData.reg_no.length > 6) {
                setFrontReg(detailData.reg_no.substring(0,6));
                setBackReg(detailData.reg_no.substring(6));
                setInitFrontReg(detailData.reg_no.substring(0,6));
                setInitBackReg(detailData.reg_no.substring(6));
            }else{
                setFrontReg(detailData.reg_no);
                setBackReg("");
                setInitFrontReg(detailData.reg_no);
                setInitBackReg("");
            }
        }
        /** 근로자 구분 코드 조회 **/
        getWorkerType();
        
    }, [detailData]);

    useEffect(()=> {
        getSiteData(formData.project?.sno)  
    }, [formData.project])

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
        }else {
            document.body.style.overflow = "unset";
        }
    }, [isOpen]);

    return (
        <div>
            <Modal
                isOpen={isModal}
                title={"전체 근로자"}
                text={modalText}
                confirm={"확인"}
                fncConfirm={() => setIsModal(false)}
            />
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
                                                    isRoleValid(workerRoles.TOTAL_WORKER_MOD) && editBtn ? 
                                                        <button type="button" className="btn btn-primary" onClick={handleEditMode} name="confirm" style={{marginRight:"10px"}}>
                                                            수정
                                                        </button>
                                                    : null
                                                }
                                                {
                                                    isRoleValid(workerRoles.TOTAL_WORKER_DEL) && removeBtn ?
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
                                                    <SearchUsedProjectModal
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
                                                <input type="text" value={formData.user_id || ""} onChange={(e) => onChangeFormData("user_id", e.target.value)}/>
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
                                                <input type="text" value={formData.user_nm || ""} onChange={(e) => onChangeFormData("user_nm", e.target.value)}/>
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
                                                <input type="text" value={formData.department || ""} onChange={(e) => onChangeFormData("department", e.target.value)}/>
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
                                                <input type="text" value={formData.phone || ""} onChange={(e) => onChangeFormData("phone", Common.formatMobileNumber(e.target.value))}/>
                                            :
                                                formData.phone
                                        }
                                    </div>
                                </div>
                                {/* 주민등록 번호 */}
                                <div className="form-control" style={{gridColumn: "auto", padding: '10px', display: "flex", alignItems: "center", width: "100%", height: "62px"}}>
                                    <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>주민등록 번호</label>
                                    <div className="grid-input" style={{ flex: 1, marginRight: "10px" }}>
                                        {
                                            isEdit ?
                                                <div style={{display: "flex", alignItems: "center"}}>
                                                    <input type="text" value={frontReg} onChange={(e) => setFrontReg(Common.limitDigits(e.target.value, 6))} style={{width: "100px"}}/>
                                                    &nbsp;-&nbsp;
                                                    <input type="text" value={showFullRegNo ? backReg : Common.maskResidentBackNumber(backReg)} onChange={(e) => onChangeBackReg(e.target.value)} style={{width: "100px"}}/>
                                                    {/* <input type="text" value={showFullRegNo ? formData.reg_no || "" : Common.maskResidentNumber(maskRegNo) || ""} onChange={(e) => onChangeRegMasking(e.target.value)}/>
                                                    <input type="hidden" value={formData.reg_no || ""}/> */}
                                                </div>
                                            :
                                            showFullRegNo ? formData.reg_no : Common.maskResidentNumber(formData.reg_no)
                                        }
                                    </div>
                                    <img 
                                        src={EyeIcon}
                                        style={{width: "20px", cursor: "pointer"}}
                                        onMouseDown={() => setShowFullRegNo(true)}
                                        onMouseUp={() => setShowFullRegNo(false)}
                                        onMouseLeave={() => setShowFullRegNo(false)}
                                    />
                                </div>
                                 {/* 공종 */}
                                 <div className="form-control" style={{gridColumn: "auto", padding: '10px', display: "flex", alignItems: "center", width: "100%"}}>
                                    <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>공종</label>
                                    <div className="grid-input" style={{ flex: 1 }}>
                                        {
                                            isEdit ?
                                                <input type="text" value={formData.disc_name || ""} onChange={(e) => onChangeFormData("disc_name", e.target.value)}/>
                                            :
                                                formData.disc_name
                                        }
                                    </div>
                                </div>

                                {/* 근로자 구분 */}
                                <div className="form-control" style={{gridColumn: "auto", padding: '10px', width: "100%"}}>
                                    <div style={{display: "flex", alignItems: "center"}}>
                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>근로자 구분</label>
                                        
                                            {
                                                isEdit ?
                                                    <div style={{display: "flex"}}>
                                                        <div style={{ height: "40px", display: 'flex', gap: "30px", fontSize: "15px", marginRight: "50px"}}>
                                                            {
                                                                workerTypes.map((item, idx) => (
                                                                    <Radio text={workerTypes[idx].code_nm} value={workerTypes[idx].code} name="group1" checked={formData.worker_type === item.code} onChange={(e) => onChangeFormData("worker_type", e.target.value)} key={idx}/>
                                                                ))
                                                            }
                                                        </div>
                                                        
                                                    </div>
                                                :
                                                    <div style={{display: "flex"}}>
                                                        <div style={{ height: "40px", display: 'flex', gap: "30px", fontSize: "15px", marginRight: "50px"}}>
                                                            {
                                                                workerTypes.map((item, idx) => (
                                                                    <Radio text={workerTypes[idx].code_nm} value={workerTypes[idx].code} name="group1" checked={formData.worker_type === item.code} disabled={true} key={idx}/>
                                                                ))
                                                            }
                                                        </div>                             
                                                    </div>
                                            }
                                        </div>
                                    </div>
                                    <div className="form-control" style={{gridColumn: "auto", padding: '10px', display: "flex", alignItems: "center", width: "100%"}}>
                                            {
                                            formData.worker_type === "02" ?
                                                isEdit ?
                                                    <>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>구분</label>
                                                        <div style={{ height: "40px", display: 'flex', gap: "30px", fontSize: "15px"}}>
                                                            <Radio text={"관리자"} value={"Y"} name="group2" checked={formData.is_manage === 'Y'} onChange={(e) => onChangeFormData("is_manage", e.target.value)}/>
                                                            <Radio text={"근로자"} value={"N"} name="group2" checked={formData.is_manage === 'N'} onChange={(e) => onChangeFormData("is_manage", e.target.value)}/>
                                                
                                                        </div>
                                                    </>
                                                    :
                                                    <>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>구분</label>
                                                        <div style={{ height: "40px", display: 'flex', gap: "30px", fontSize: "15px"}}>
                                                            <Radio text={"관리자"} value={"Y"} name="group2" checked={formData.is_manage === 'Y'} disabled={true}/>
                                                            <Radio text={"근로자"} value={"N"} name="group2" checked={formData.is_manage === 'N'} disabled={true}/>
                                                        </div>
                                                    </>
                                            :
                                            formData.worker_type === "03" ?
                                                isEdit ?
                                                    <>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>사유</label>
                                                        <div className="grid-input" style={{flex:1}}>
                                                            <input type="text" value={formData.daily_reason || ""} onChange={(e) => onChangeFormData("daily_reason", e.target.value)}/>                                            
                                                        </div>
                                                    </>
                                                    :
                                                    <>
                                                        <label style={{ marginRight: "5px", fontWeight: "bold", width: "110px" }}>사유</label>
                                                        <div>
                                                            {formData.daily_reason}
                                                        </div>
                                                    </>
                                            :null

                                            }
                                    </div>
                            
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
