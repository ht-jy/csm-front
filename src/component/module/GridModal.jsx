import { useState, useEffect } from "react";
import Input from "./Input";
import Exit from "../../assets/image/exit.png";

/**
 * @description: 상세화면 모달 컴포넌트
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-13
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
const GridModal = ({ isOpen, gridMode, funcModeSet, editBtn, removeBtn, title, detailData, selectList, exitBtnClick, saveBtnClick, removeBtnClick, isCancle = true }) => {
    const [isEdit, setIsEdit] = useState(false);
    const [formData, setFormData] = useState([]);
    const [initialData, setInitialData] = useState([]); // 원본 데이터 저장

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

    // 입력값 변경 핸들러
    const handleInputChange = (index, newValue) => {
        setFormData(prevFormData =>
            prevFormData.map((item, idx) => 
                idx === index ? { ...item, value: newValue } : item
            )
        );
    };

    // 수정모드로 변경
    const handleEditMode = () => {
        funcModeSet("EDIT");
        setIsEdit(true);
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

    // detailData가 변경될 때 상태를 업데이트 (최초 데이터 저장)
    useEffect(() => {
        if (detailData && detailData.length > 0) {
            setFormData(detailData);
            setInitialData(detailData); // 초기 데이터 저장
        }
    }, [detailData]);

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

    return (
        <div>
            {isOpen ? (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        {/* 왼쪽 - 제목 */}
                        <h2 style={h2Style}>{title}</h2>

                        {/* 오른쪽 - 버튼 & 닫기 아이콘 */}
                        <div style={{ display: 'flex', alignItems: 'center', paddingBottom: "15px" }}>
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
                                                    <button className="btn btn-primary" onClick={handleEditMode} name="confirm" style={{marginRight:"10px"}}>
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
                                <img src={Exit} style={{ width: "35px", paddingBottom: '5px' }} alt="Exit" />
                            </div>
                        </div>
                    </div>


                        <div style={gridStyle}>
                            {formData.length === 0 ? null : 
                                formData.map((item, idx) => (
                                    item.type === "hidden" ? null : (
                                        <Input
                                            key={idx}
                                            editMode={isEdit}
                                            type={item.type}
                                            span={item.span}
                                            label={item.label}
                                            value={item.value}
                                            onValueChange={(newValue) => handleInputChange(idx, newValue)}
                                            selectData={item.type === "select" ? selectList[item.selectName] : null}
                                        />
                                    )
                                ))
                            }
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
    zIndex: '9998'
};

const modalStyle = {
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    maxWidth: '1000px',
    width: '100%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    margin: '10px',
};

const h2Style = {
    minHeight: '50px',
    fontSize: '25px',
};

const buttonDivStyle = {
    display: 'flex', alignItems: 'center', marginBottom: '15px'
};

const buttonStyle = {
    margin: '5px',
    width: '30%',
};

export default GridModal;
