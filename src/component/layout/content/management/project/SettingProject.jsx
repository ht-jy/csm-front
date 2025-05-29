import { useState } from "react";
import TextInput from "../../../../module/TextInput";
import minus from "../../../../../assets/image/minus.png"
import plus from "../../../../../assets/image/plus.png"
import Time24Input from "../../../../module/Time24Input";


const SettingProject = () => {

    const [manhourExpand, setManHourExpand] = useState(true)
    const [inOutTimeExpand, setInOutTimeExpand] = useState(true)
    const [cancelCodeExpand, setCancelCodeExpand] = useState(true)
    const [inTime, setInTime] = useState("9999-12-31T08:00:00Z")
    const [outTime, setOutTime] = useState("9999-12-31T17:00:00Z")



    return(
        <div className="container-fluid px-4">
            <ol className="breadcrumb mb-2 content-title-box">
                <li className="breadcrumb-item content-title">프로젝트 설정</li>
                <li className="breadcrumb-item active content-title-sub">관리</li>
            </ol>

            <ol className="breadcrumb m-2 content-title-box" onClick={() => setManHourExpand((prev) => !prev)}>
                {manhourExpand ?
                    <img src={minus} style={{ width: "20px" }} alt="..." />
                    :
                    <img src={plus} style={{ width: "20px" }} alt="..." />
                }
                <li style={{fontWeight: "bold", marginLeft:"5px"}}>공수시간 기준</li>
            </ol>
            {
                manhourExpand ?   
                <div className="form-control m-2 ms-4" style={{width:"98%"}}>
                    <div style={{display: "flex", height: "20px", margin:"20px 10px"}}>
                        <div style={{width: "80px"}}>시간</div>
                        <TextInput initText="0" style={{width:"100px"}} /> {/* setText={} style */}

                        <div style={{width: "80px", marginLeft:"80px"}}>공수</div>
                        <TextInput initText="0" style={{width:"100px"}} /> {/* setText={} style */}
                    </div>

                </div>
                
                : null
            }

            <hr></hr>
            
            <ol className="breadcrumb p-0 m-2 content-title-box" onClick={() => setInOutTimeExpand((prev) => !prev)}>
                {inOutTimeExpand ?
                    <img src={minus} style={{ width: "20px" }} alt="..." />
                    :
                    <img src={plus} style={{ width: "20px" }} alt="..." />
                }
                <li style={{fontWeight: "bold", marginLeft:"5px"}}>출/퇴근시간 및 유예시간</li>
            </ol>
            {
                inOutTimeExpand ? 
                    <div className="form-control m-2 ms-4" style={{width:"98%"}}>
                        <div style={{display: "flex", height: "20px", margin:"20px 10px"}}>
                            <div style={{width: "80px"}}>출근시간</div>
                            <Time24Input time={inTime} setTime={setInTime}></Time24Input>
                        </div>
                        <div style={{display: "flex", height: "20px", margin: "20px 10px"}}>
                            <div style={{width: "80px"}}>퇴근시간</div>
                            <Time24Input time={outTime} setTime={setOutTime}></Time24Input>
                        </div>
                        <div style={{display: "flex", height: "20px", margin: "20px 10px"}}>
                            <div style={{width: "80px"}}>유예시간</div>
                            <TextInput initText="30" style={{width:"60px", marginRight:"5px"}} /> 분 {/* setText={} style */}
                        </div>

                        <div className="text-success m-2">
                        {'>'} 출근인정시간: {"08:30"} 이전
                        </div>
                        <div className="text-success m-2">
                        {'>'} 퇴근인정시간: {"16:30"} 이후
                        </div>
                    </div>
                    :
                null
            }

            <hr></hr>
            <ol className="breadcrumb p-0 m-2 content-title-box" onClick={() => setCancelCodeExpand((prev) => !prev)}>
                { cancelCodeExpand   ?
                    <img src={minus} style={{ width: "20px" }} alt="..." />
                    :
                    <img src={plus} style={{ width: "20px" }} alt="..." />
                }
                <li style={{fontWeight: "bold", marginLeft:"5px"}}>마감취소기간</li>
            </ol>
            { cancelCodeExpand ? 
            
                <div className="form-control m-2 ms-4" style={{width:"98%"}}>
                    <div style={{display: "flex", height: "20px", margin: "20px 10px"}}>
                        <div style={{width: "80px"}}>기간</div>
                        <TextInput initText="0" style={{width:"100px"}} /> {/* setText={} style */}
                    </div>

                    <div className="text-success m-2">
                        {'>'} 기간 추가 문의: 기술연구소 담당( 김진우대리 ☎061-690-1530 )
                    </div>

                </div>
            : null 
            }


        </div>
    );
}

export default SettingProject;