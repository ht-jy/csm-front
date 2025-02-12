import { useState, useEffect } from "react";
import Input from "./Input";
import Exit from "../../assets/image/exit.png";

const GridModal = ({ isOpen, exitBtnClick, title, detailData, confirm, fncConfirm, cancel, fncCancel }) => {
    // 초기 상태는 빈 배열로 설정
    const [formData, setFormData] = useState([]);

    // detailData가 변경될 때 상태를 업데이트
    useEffect(() => {
        if (detailData && detailData.length > 0) {
            setFormData(detailData);
        }
    }, [detailData]);

    // 입력값 변경 핸들러
    const handleInputChange = (index, newValue) => {
        setFormData(prevFormData =>
            prevFormData.map((item, idx) => 
                idx === index ? { ...item, value: newValue } : item
            )
        );
    };

    const scrollUnset = (e) => {
        document.body.style.overflow = 'unset';
        if (e.target.name === 'confirm') {
            fncConfirm(formData);  // 최종 데이터를 전달
        } else {
            fncCancel();
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    return (
        <div>
            {isOpen ? (
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                            <h2 style={h2Style}>{title}</h2>
                            <div style={{ marginLeft: "auto" }} onClick={exitBtnClick}>
                                <img src={Exit} style={{ width: "50px", marginBottom: '15px' }} alt="Exit" />
                            </div>
                        </div>

                        <div style={gridStyle}>
                            {formData.length === 0 ? null : 
                                formData.map((item, idx) => (
                                    item.type === "hidden" ? null : (
                                        <Input
                                            key={idx}
                                            type={item.type}
                                            span={item.span}
                                            label={item.label}
                                            value={item.value}
                                            onValueChange={(newValue) => handleInputChange(idx, newValue)}
                                        />
                                    )
                                ))
                            }
                        </div>

                        <div style={buttonDivStyle}>
                            {confirm && (
                                <button className="btn btn-primary" style={buttonStyle} onClick={scrollUnset} name="confirm">
                                    {confirm}
                                </button>
                            )}
                            {cancel && (
                                <button className="btn btn-primary" style={buttonStyle} onClick={scrollUnset} name="cancel">
                                    {cancel}
                                </button>
                            )}
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
    zIndex: '9999'
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
};

const buttonDivStyle = {
    display: 'flex',
    flex: '0 0 50%',
    textAlign: 'center',
};

const buttonStyle = {
    margin: '5px',
    width: '100%',
};

export default GridModal;
