import { useState, useEffect } from "react";
import Exit from "../../../../../assets/image/exit.png";
import "../../../../../assets/css/SiteDetail.css";
import DetailSite from "./DetailSite";
import DetailProject from "./DetailProject";
import AddressSearchModal from "../../../../module/AddressSearchModal";

/**
 * @description: 현장관리 전용 상세화면 모달 컴포넌트
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-24
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - DetailSite: 현장 상세
 * - DetailProject: 프로젝트 상세
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
const DetailModal = ({ isOpen, isEditBtn, title, detailData, exitBtnClick, saveBtnClick, isCancle = true }) => {
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState(null);
    const [initialData, setInitialData] = useState({}); // 원본 데이터 저장
    const [addressSearchOpen, setAddressSearchOpen] = useState(false);
    const [address, setAddress] = useState(null);

    // "X"
    const handleExit = () => {
        exitBtnClick();
    };

    // "취소" 버튼 클릭 시 원래 데이터로 복구
    const handleCancel = () => {
        setFormData(initialData); // 초기 데이터로 되돌리기
        setIsEdit(false);
    };

    // 수정모드로 변경
    const handleEditMode = () => {
        setIsEdit(true);
    }

    // 수정
    const handleSave = (e) => {
        document.body.style.overflow = 'unset';
        saveBtnClick(formData);        
    };

    const handelChangeValue = (data) => {
       setAddressSearchOpen((prev) => !prev)
    }

    useEffect(() => {
        setFormData(detailData);
        setInitialData(detailData);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    useEffect(() => {
        console.log("modal", address)
    }, [addressSearchOpen, address])

    return (
        <div>
            

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
                            <h2 style={h2Style}>{title}</h2>

                            {/* 오른쪽 - 버튼 & 닫기 아이콘 */}
                            <div style={{ display: 'flex', alignItems: 'center', paddingBottom: "15px" }}>
                                {
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
                                                isEditBtn ? 
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
                                handelChangeValue={handelChangeValue}
                                addressData={address}
                                />
                                
                                
                            }

                            {
                                detailData?.project_list.length !== 0 ?
                                <>
                                    <div className="grid-division"></div>
                                    {
                                        detailData?.project_list.map((item, idx) => (
                                            <DetailProject 
                                                key={idx}
                                                data={item}
                                                projectNo={idx+1}
                                                projectLength={detailData?.project_list.length}
                                                isMain={detailData.default_project_name === item.project_nm ? true : false}
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
