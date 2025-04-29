import { ObjChk } from "../../utils/ObjChk";
import { useEffect } from "react";

// 두가지 선택 버튼과 취소버튼이 있는 커스텀 modal
const SelectModal = ({isOpen, title, text, first, fncFirst, second, fncSecond, cancel, fncCancel}) => {

    const scrollUnset = (e) => {
        document.body.style.overflow = 'unset';
        if(e.target.name == 'first'){
            fncFirst();
        }else if(e.target.name == 'second'){
            fncSecond();
        }else{
            fncCancel();
        }
    }

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";

            // 키 이벤트 핸들러
            const handleKeyDown = (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (event.key === "Enter" || event.key === "Escape") {
                    fncCancel();
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
                                <div key={index}>
                                    {line}
                                    <br />
                                </div>
                            ))}
                        </div>
                        <div style={buttonDivStyle}>
                            <button className="btn btn-primary" style={buttonStyle} onClick={scrollUnset} name="first">{first}</button>
                            <button className="btn btn-primary" style={buttonStyle} onClick={scrollUnset} name="second">{second}</button>
                        </div>
                        <div style={buttonDivStyle}>
                            <button className="btn btn-primary" style={cancelButtonStyle} onClick={scrollUnset} name="cancel">{cancel}</button>
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
}

const buttonStyle = {
    margin: '5px',
    width: '100%',
}

const cancelButtonStyle = {
    margin: '5px',
    width: '100%',
    backgroundColor: "#aaa",
    border: "#aaa"
}

export default SelectModal;