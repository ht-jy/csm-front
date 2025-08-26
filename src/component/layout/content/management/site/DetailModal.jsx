import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../../../../assets/css/SiteDetail.css";
import Exit from "../../../../../assets/image/exit.png";
import { Axios } from "../../../../../utils/axios/Axios";
import { dateUtil } from "../../../../../utils/DateUtil";
import { useUserRole } from "../../../../../utils/hooks/useUserRole";
import { siteRoles } from "../../../../../utils/rolesObject/siteRoles";
import { useAuth } from "../../../../context/AuthContext";
import SiteContext from "../../../../context/SiteContext";
import Button from "../../../../module/Button";
import Loading from "../../../../module/Loading";
import Modal from "../../../../module/Modal";
import AddressSearchModal from "../../../../module/modal/AddressSearchModal";
import NonUsedProjectModal from "../../../../module/modal/NonUsedProjectModal";
import DetailProject from "./DetailProject";
import DetailSite from "./DetailSite";
/**
 * @description: 현장관리 전용 상세화면 모달 컴포넌트
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-24
 * @modified 최종 수정일: 2025-07-16
 * @modifiedBy 최종 수정자: 김진우
 * @modified description
 * 2025-07-14: 공정률 모달 추가. 공정률 수정시 해당 날짜의 레코드가 공정률 테이블에 없는 경우 에러를 방지 하여 모달창 오픈. 연락시 해당 날짜의 레코드 삽입.
 * 2025-07-15: 작업완료 기능 DetailSite.jsx에서 이동
 * 2025-07-16: 작업완료 취소 기능 추가
 * 
 * @additionalInfo
 * - props: 
 *  isOpen: true|false (오픈여부) 
 *  isEditBtn: true|false (수정버튼 여부) 
 *  title: 제목
 *  detailData: Input 컴포넌트 props 리스트
 *  exitBtnClick: 종료버튼 fuction
 *  saveBtnClick: 저장버튼 function (저장, 수정 둘다 포함)
 *  removeBtnClick: 삭제버튼 function
 */
const DetailModal = ({ isOpen, setIsOpen, isEditBtn, title, detailData=[], detailWeather=[], exitBtnClick, saveBtnClick, isCancle = true, isSiteAdd=false }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { isRoleValid } = useUserRole();
    const { refetch, setIsDetail, setIsNonUseChecked, selectedDate } = useContext(SiteContext);
                                
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState(null);
    const [initialData, setInitialData] = useState({}); // 원본 데이터 저장
    const [addressSearchOpen, setAddressSearchOpen] = useState(false);
    const [address, setAddress] = useState(null);
    const [siteName, setSiteName] = useState("");
    /* projectModal */
    const [isPjModal, setIsPjModal] = useState(false);
    /* 알림모달 */
    const [isModal, setIsModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalText, setModalText] = useState("");
    const [modalConfirmText, setModalConfirmText] = useState("");
    const [modalCancelText, setModalCancelText] = useState("");
    const [modalfncType, setModalfncType] = useState("");
    /* 프로젝트 추가 아이템 */
    const [addItem, setAddItem] = useState({});
    /* 프로젝트 삭제 아이템 */
    const [deleteItem, setDeleteItem] = useState({});
    // 공정률 모달
    const [isWorkRate, setIsWorkRate] = useState(false);
    // 작업완료
    const [isNonUseCheckOpen, setIsNonUseCheckOpen] = useState(false);
    const [nonUseCheckText, setNonUseCheckText] = useState("");
    const [nonUseCheckFunc, setNonUseCheckFunc] = useState(() => {});
    const [isNonUseConfirm, setIsNonUseConfirm] = useState(false);
    const [nonUseConfirmText, setNonUseConfirmText] = useState("");
    /** 로딩 **/
    const [isLoading, setIsLoading] = useState(false);

    // "X"
    const handleExit = () => {
        exitBtnClick();
    };

    // "취소" 버튼 클릭 시 원래 데이터로 복구
    const handleCancel = () => {
        setAddress(null);
        setFormData(initialData); // 초기 데이터로 되돌리기
        setIsEdit(false);


    };

    // 수정모드로 변경
    const handleEditMode = () => {
        setIsEdit(true);
    }

    // 저장
    const handleSave = (e) => {
        // IRIS_JOB_WORK_RATE 테이블에 해당 날짜의 값이 없는 경우
        // 테이블에 해당 날짜의 레코드를 추가한 후에 수정해야 함
        if (formData.project_list.some(project => {
            const original = initialData.project_list.find(init => init.jno === project.jno);
            return original &&
                original.work_rate !== project.work_rate &&
                original.is_work_rate === 'N';
        })) {
            setIsWorkRate(true);
            return;
        }
        document.body.style.overflow = 'unset';
        saveBtnClick(formData);    
    };

    // 현장명 변경 이벤트
    const onChangeTitle = (e) => {
        setSiteName(e.target.value);
        handleChangeValue("site_nm", e.target.value);
    }

    // 현장 데이터 변경 
    const handleChangeValue = (name, data) => {

        if(name === "searchOpen"){
            setAddressSearchOpen((prev) => !prev)
        }else{
            setFormData((prev) => (
                {...prev, [name]: data}
            ))
        }
    }

    // 프로젝트 데이터 변경
    const handleChangeProjectValue = (name, jno, value) => {
        const newProjectList = formData.project_list.map(item => {
            if(item.jno === jno){
                 return {...item, [name]: value};
            }else{
                return {...item};
            }
        });
        
        const newFormData = {...formData, project_list: newProjectList, work_rate: newProjectList.reduce((sum, project) => sum + project.work_rate, 0) / newProjectList.length};
        setFormData(newFormData);
    }

    // 알림 모달 확인/취소 함수
    const handleModalBtnClick = (type) => {
        setModalCancelText("");
        setIsModal(false);

        if(modalfncType === "addProjectAsk"){
            if(type === "confirm"){
                addProject();
            }
        } else if(modalfncType === "addProjectResult") {
            if(type === "confirm"){
                setIsOpen(false);
                navigate(0);
            }
        } else if(modalfncType === "deleteProjectAsk"){
            if(type === "confirm"){
                deleteProject();
            }
        } else if(modalfncType === "deleteProjectResult"){
            if(type === "confirm"){
                setIsOpen(false);
                navigate(0);
            }
        }
    }
    
    // 프로젝트 추가 버튼 클릭
    const onClickProjectAddBtn = () => {
        setIsPjModal(true);
    }

    // 프로젝트 추가 모달 row 클릭
    const handleClickRow = (item) => {

        const param = {
            sno: formData.sno,
            jno: item.jno,
            reg_user: user.userName,
            reg_uno: user.uno,
        }
        setAddItem(param);

        setModalTitle("현장 프로젝트 추가");
        setModalText("선택한 프로젝트를 추가하시겠습니까?");
        setModalConfirmText("예");
        setModalCancelText("아니요");
        setModalfncType("addProjectAsk")
        setIsModal(true);
    }

    // 프로젝트 추가
    const addProject = async() => {
        try {
            const res  = await Axios.POST("/project", addItem)
                    
            if( res?.data?.result === "Success"){
                setModalText("프로젝트 추가에 성공하였습니다.");
            }else{
                setModalText("프로젝트 추가에 실패하였습니다.");
            }
            setModalConfirmText("확인");
            setModalfncType("addProjectResult")
            setModalTitle("현장 프로젝트 추가");
            setIsModal(true);
        } catch(err) {
            navigate("/error");
        }
    }

    // 프로젝트 삭제
    const handleDeleteBtn = (jno) => {
        const param = {
            sno: formData.sno,
            jno: jno,
        }
        setDeleteItem(param);

        setModalTitle("현장 프로젝트 삭제");
        setModalText("선택한 프로젝트를 삭제하시겠습니까?");
        setModalConfirmText("예");
        setModalCancelText("아니요");
        setModalfncType("deleteProjectAsk")
        setIsModal(true);
    }

    // 프로젝트 삭제
    const deleteProject = async() => {
        try {
            const res  = await Axios.DELETE(`/project/${deleteItem.sno}/${deleteItem.jno}`)
                    
            if( res?.data?.result === "Success"){
                setModalText("프로젝트 삭제에 성공하였습니다.");
            }else{
                setModalText("프로젝트 삭제에 실패하였습니다.");
            }
            setModalConfirmText("확인");
            setModalfncType("deleteProjectResult")
            setModalTitle("현장 프로젝트 삭제");
            setIsModal(true);
        } catch(err) {
            navigate("/error");
        }
    }

    /***** 작업완료 *****/
    // 현장 - type: true(작업완료), false(작업완료취소)
    const nonUseCheckOpen = (type) => {
        const text = type ? "종료" : "종료 취소";

        setIsNonUseCheckOpen(true);
        setNonUseCheckFunc(() => () => siteModifyNonUse(type));
        setNonUseCheckText(`현장 ${text}를 하시겠습니까?\n ${text} 시 프로젝트도 모두 ${text}됩니다.`);
    }

    // 현장 작업완료 처리
    const siteModifyNonUse = async(type) => {
        setIsNonUseCheckOpen(false);

        const url = type ? "/site/non-use" : "/site/use";
        const text = type ? "현장 종료 처리" : "현장 종료 취소";
        
        setIsLoading(true);
        try {
            const res = await Axios.PUT(url, {
                sno: detailData.sno || 0,
                mod_uno: user.uno,
                mod_user: user.userName
            });
            
            if (res?.data?.result === "Success") {
                setNonUseConfirmText(`${text}에 성공하였습니다.`);
            }else{
                setNonUseConfirmText(`${text}에 실패하였습니다.\n잠시 후에 다시 시도하여 주세요.`);
            }
            setIsNonUseConfirm(true);
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    // 현장 프로젝트 - type: true(작업완료), false(작업완료취소)
    const siteJobNonUseCheckOpen = (type, jno) => {
        const text = type ? "프로젝트 완료 처리" : "프로젝트 완료 취소";

        setIsNonUseCheckOpen(true);
        setNonUseCheckFunc(() => () => siteJobModifyNonUse(type, jno));
        setNonUseCheckText(`${text}를 하시겠습니까?`);
    }

    // 현장 프로젝트 작업완료 처리
    const siteJobModifyNonUse = async(type, jno) => {
        setIsNonUseCheckOpen(false);

        const url = type ? "/site/non-use/job" : "/site/use/job";
        const text = type ? "프로젝트 완료 처리" : "프로젝트 완료 취소";
        
        setIsLoading(true);
        try {
            const res = await Axios.PUT(url, {
                sno: detailData.sno || 0,
                jno: jno || 0,
                mod_uno: user.uno,
                mod_user: user.userName
            });
            
            if (res?.data?.result === "Success") {
                setNonUseConfirmText(`${text}에 성공하였습니다.`);
            }else{
                setNonUseConfirmText(`${text}에 실패하였습니다.\n잠시 후에 다시 시도하여 주세요.`);
            }
            setIsNonUseConfirm(true);
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    // 작업완료 성공 확인 이벤트
    const onClickNonUseConfirm = () => {
        setIsNonUseChecked(false);
        refetch(true, false);
        setIsDetail(false)
        setIsNonUseConfirm(false);
    }
    /***** 작업완료 취소 *****/

    /***** useEffect *****/

    useEffect(() => {
        setFormData(detailData);
        setInitialData(detailData);
    }, []);

    useEffect(() => {
        setSiteName(title);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

    }, [isOpen]);

    useEffect(() => {

    }, [addressSearchOpen, address])

    return (
        <div>
            <Loading 
                isOpen={isLoading}
            />
            <NonUsedProjectModal
                isOpen={isPjModal}
                fncExit={() => setIsPjModal(false)}
                onClickRow={handleClickRow}
            />
            <Modal 
                isOpen={isWorkRate}
                title={"현장 수정"}
                text={"프로젝트의 공정률을 수정할 수 없습니다.\n관리자에게 문의하여 주세요."}
                confirm={"확인"}
                fncConfirm={() => setIsWorkRate(false)}
            />
            <Modal
                isOpen={isModal}
                title={modalTitle}
                text={modalText}
                confirm={modalConfirmText}
                fncConfirm={() => handleModalBtnClick("confirm")}
                cancel={modalCancelText}
                fncCancel={() => handleModalBtnClick("cancel")}
                fncExit={() => setIsModal(false)}
            />
            <Modal
                isOpen={isNonUseCheckOpen}
                title={"현장 상세"}
                text={nonUseCheckText}
                confirm={"예"}
                fncConfirm={nonUseCheckFunc}
                cancel={"아니오"}
                fncCancel={() => setIsNonUseCheckOpen(false)}
            />
            <Modal
                isOpen={isNonUseConfirm}
                title={"현장 상세"}
                text={nonUseConfirmText}
                confirm={"확인"}
                fncConfirm={onClickNonUseConfirm}
            />
            {isOpen ? (
                <div className="overlayStyle">
                    <div className="modalStyle">
                    <AddressSearchModal 
                        isOpen={addressSearchOpen} 
                        fncExit={() => setAddressSearchOpen(false)}
                        fncChangeData={(data) => {setAddress(data)}}
                     />
                        <div className="modalHeader">
                            {/* 왼쪽 - 제목 */}
                            {
                                isEdit ? 
                                    <input className="title-input" type="text" value={siteName} onChange={onChangeTitle}/>
                                :   <h2 style={h2Style}>{siteName}</h2>
                            }

                            {/* 오른쪽 - 버튼 & 닫기 아이콘 */}
                            <div style={{ display: 'flex', alignItems: 'center', paddingBottom: "15px" }}>
                                {
                                    isEdit || isSiteAdd ?
                                        <div>
                                            <button className="btn btn-primary" onClick={handleSave} name="confirm" style={{marginRight:"10px"}}>
                                                저장
                                            </button>   
                                            {
                                                isCancle && !isSiteAdd ?
                                                    <button className="btn btn-primary" onClick={handleCancel} name="confirm" style={{marginRight:"10px"}}>
                                                        취소
                                                    </button> 
                                                : null
                                            }
                                        </div>
                                    :
                                        isRoleValid(siteRoles.SITE_MOD) && 
                                        <div>
                                            {
                                                isEditBtn && !isSiteAdd && selectedDate === dateUtil.format(Date.now()) ? 
                                                    <button className="btn btn-primary" onClick={handleEditMode} name="confirm" style={{marginRight:"10px"}}>
                                                        수정
                                                    </button>
                                                : null
                                            }
                                        </div>
                                }
                                

                                <div onClick={handleExit} style={{ cursor: "pointer" }}>
                                    <img src={Exit} style={{ width: "35px", paddingBottom: '5px' }} alt="Exit" />
                                </div>
                            </div>
                        </div>

                        <div className="grid-wrapper">
                            {
                                formData !== null &&
                                    <DetailSite 
                                    isEdit={isEdit}
                                    detailData={formData}
                                    detailWeather={detailWeather}
                                    projectData={detailData?.project_list}
                                    handleChangeValue={handleChangeValue}
                                    addressData={address}
                                    isSiteAdd={isSiteAdd}
                                />
                                
                                
                            }

                            {
                                detailData.length !== 0 && detailData?.project_list?.length !== 0 ?
                                <>
                                    <div className="grid-division"></div>
                                    {
                                        isEdit && 
                                        <div style={{width: "99%", display: "flex", justifyContent: "end"}}>
                                            <Button text={"프로젝트 추가"} style={{marginBottom: "10px"}} onClick={onClickProjectAddBtn}/>
                                        </div>
                                    }
                                    {
                                        detailData?.project_list?.map((item, idx) => (
                                            <DetailProject 
                                                key={idx}
                                                data={item}
                                                projectNo={idx+1}
                                                projectLength={detailData?.project_list.length}
                                                isMain={detailData.default_project_name === item.project_nm ? true : false}
                                                isEdit={isEdit}
                                                onClickDeleteBtn={handleDeleteBtn}
                                                handleChangeValue={handleChangeProjectValue}
                                                handleJobNonUseCheckOpen={(isNonUse, jno) => siteJobNonUseCheckOpen(isNonUse, jno)}
                                            />
                                        ))
                                    }
                                </>
                                : null
                            }

                            {
                                <div style={{marginRight: "8px", textAlign:"end"}}>

                                    {isRoleValid(siteRoles.SITE_WORK_FINISH) && detailData.status === 'Y' && !isEdit && <Button text={"현장 종료"} onClick={() => nonUseCheckOpen(true)}/>}
                                    {isRoleValid(siteRoles.SITE_WORK_CANCEL) && detailData.status !== 'Y' && !isEdit && <Button text={"현장 종료 취소"} style={{}} onClick={() => nonUseCheckOpen(false)}/>}

                                </div>
                            }
                        </div>
                    </div>
                </div>
            ) : null}
        </div>
    );
};

const h2Style = {
    minHeight: '50px',
    fontSize: '25px',
    paddingTop: '5px',
};

const buttonDivStyle = {
    display: 'flex', alignItems: 'center', marginBottom: '15px'
};

const buttonStyle = {
    margin: '5px',
    width: '30%',
};

export default DetailModal;
