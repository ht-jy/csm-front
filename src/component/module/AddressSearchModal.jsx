import { useEffect } from "react";
import Exit from "../../assets/image/exit.png"


/**
 * @description: 주소 검색 컴포넌트
 * 
 * @author 작성자: 정지영
 * @created 작성일: 2025-03-12
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @additionalInfo
 * - 카카오제공 API : 우편번호 검색 (무료, 호출제한X)
 * 
 */
const AddressSearchModal = ({isOpen, fncExit, fncChangeData}) => {

    useEffect(() => {
        if(!document.getElementById("address-search-script")) {
            const script = document.createElement("script")
            script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js"
            script.id = "address-search-script"
            script.async = true;
            document.body.appendChild(script);
        }
        if (isOpen) {
            const searchFrame = document.getElementById("address-search")
            new window.daum.Postcode({
                oncomplete: function (data) {
                    fncChangeData(data)
                    fncExit();
                },
            }).embed(searchFrame);    
        }

    }, [isOpen]);

    return <>
        { isOpen ? 

            <div style={overlayStyle} >
                <div style={modalStyle}>
                    <div style={arrange}>
                        <div style={searchHeader}>
                            <h5 style={{margin : '1rem 0 0 0'}}> 주소 검색 </h5>
                            <div onClick={fncExit} style={{ cursor: "pointer" }}>
                                        <img src={Exit} style={{ width: "35px", paddingTop: '10px' }} alt="Exit" />
                            </div>
                        </div>
                        <hr style={{width:'95%', color:'black'}}></hr>
                        <div id="address-search">
                        </div>
                    </div>
                </div>
            </div>
        : null    }
    </>
}
export default AddressSearchModal
  
const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    zIndex: 9998,
}

const modalStyle = {
    padding : '0px',
    margin : '8vh 0px',
    backgroundColor: '#ececec',
    borderRadius: '8px',
    border: "1px solid rgba(0, 0, 0, 1)",
    maxWidth: '530px',
    width: '100%',
    maxHeight: '600px',
    height: '100%',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    zIndex: 100,
};


const arrange = {
    display :'flex',  
    flexDirection:'column', 
    alignItems :'center',
}

const searchHeader = {
    display: 'flex', 
    flexDirection:'row', 
    // justifyContent: 'space-around',
    justifyContent: 'start',
    alignItems: 'start',
    flexShrink: 0,
}