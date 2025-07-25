import React from "react";
import { ObjChk } from "../../utils/ObjChk";
import { useEffect } from "react";

/**
 * @description: alert, confirm 을 위한 커스텀 modal창 모듈
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-??
 * @modified 최종 수정일: 2025-07-15
 * @modifiedBy 최종 수정자: 김진우
 * @modified Description: 
 * 2025-07-10: content를 추가하여 jsx구문을 넣어서 모달로 띄울 수 있도록 함
 * 2025-07-25: text 부분에 정렬 기능 추가
 */
const Modal = ({isOpen, title, text, content, confirm, fncConfirm, cancel, fncCancel, align = "center"}) => {

    const scrollUnset = (e) => {
        document.body.style.overflow = 'unset';
        if(e.target.name == 'confirm'){
            fncConfirm();
        }else{
            fncCancel();
        }
    }

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";

            const handleKeyDown = (event) => {
                const tag = event.target.tagName.toLowerCase();
                const isInputField = tag === 'input' || tag === 'textarea';

                // input이나 textarea가 아니어야만 단축키 작동
                if (!isInputField && (event.key === "Enter" || event.key === "Escape")) {
                    event.preventDefault();
                    event.stopPropagation();

                    if (ObjChk.all(cancel)) {
                        fncConfirm(); // cancel이 없으면 confirm 실행
                    } else {
                        fncCancel(); // cancel이 있으면 cancel 실행
                    }
                }
            };

            document.addEventListener("keydown", handleKeyDown);

            return () => {
                document.body.style.overflow = "unset";
                document.removeEventListener("keydown", handleKeyDown);
            };
        }
    }, [isOpen]);

    return(
        <div>
            {
                isOpen ?
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        {
                            ObjChk.all(title) ?
                            <></>
                            :
                            <h2 style={h2Style}>{title}</h2>
                        }
                        
                        <div style={pStyle}>
                            {text?.split("\n").map((line, index) => (
                                <div key={index} style={{display: 'flex', justifyContent: align}}>
                                    {line}
                                    <br />
                                </div>
                            ))}

                            {content && (
                                <div style={{ marginTop: '10px' }}>
                                    {typeof content === "function" ? content() : content}
                                </div>
                            )}
                        </div>
                        <div style={buttonDivStyle}>
                            {
                                ObjChk.all(confirm) ?
                                <></>
                                :
                                <button className="btn btn-primary" style={buttonStyle} onClick={scrollUnset} name="confirm">{confirm}</button>
                            }
                            {
                                ObjChk.all(cancel) ?
                                <></>
                                :
                                <button className="btn btn-primary" style={buttonStyle} onClick={scrollUnset} name="cancel">{cancel}</button>
                            }
                        </div>
                    </div>
                </div>
                : 
                <></>
            }
        </div>
    );
}

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
    maxWidth: '500px',
    width: '100%',
    boxShadow: '15px 15px 1px rgba(0, 0, 0, 0.3)',
    margin: '10px',
};

const h2Style = {
    minHeight: '40px',
    fontSize: '25px',
    textAlign: "center"
}

const pStyle = {
    paddingTop: '5px',
    minHeight: '40px',
}

const buttonDivStyle = {
    display: 'flex',
    flex: '0 0 50%',
    textAlign: 'center',
    justifyContent: 'center',
}

const buttonStyle = {
    margin: '5px',
    width: '50%',
}

export default Modal;