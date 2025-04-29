import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import { Axios } from "../../../../../utils/axios/Axios";
import Exit from "../../../../../assets/image/exit.png";
import "../../../../../assets/css/SiteDetail.css";
import DetailSite from "./DetailSite";
import DetailProject from "./DetailProject";
import AddressSearchModal from "../../../../module/modal/AddressSearchModal";
import Button from "../../../../module/Button";
import SearchProjectModal from "../../../../module/modal/SearchProjectModal";
import Modal from "../../../../module/Modal";
import NonUsedProjectModal from "../../../../module/modal/NonUsedProjectModal";

/**
 * @description: 현장관리 전용 상세화면 모달 컴포넌트
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-24
 * @modified 최종 수정일: 2025-03-14
 * @modifiedBy 최종 수정자: 정지영
 * @usedComponents
 * - DetailSite: 현장 상세
 * - DetailProject: 프로젝트 상세
 * - AddressSearchModal : 주소 입력 모달
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
const DetailModal = ({ isOpen, setIsOpen, isEditBtn, title, detailData=[], detailWhether=[], exitBtnClick, saveBtnClick, isCancle = true, isSiteAdd=false }) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
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
        
        const newFormData = {...formData, project_list: newProjectList, work_rate: newProjectList.reduce((sum, project) => sum + project.work_rate, 0) / 2};
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
    }

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
            <NonUsedProjectModal
                isOpen={isPjModal}
                fncExit={() => setIsPjModal(false)}
                onClickRow={handleClickRow}
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
                                        <div>
                                            {
                                                isEditBtn && !isSiteAdd ? 
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
                                    detailWhether={detailWhether}
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
                                        <div style={{width: "100%", display: "flex", justifyContent: "center"}}>
                                            <Button text={"프로젝트 추가"} style={{width: "99%", marginBottom: "10px"}} onClick={onClickProjectAddBtn}/>
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
                                            />
                                        ))
                                    }
                                </>
                                : null
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
