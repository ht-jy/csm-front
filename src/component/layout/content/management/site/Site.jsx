import { useState, useEffect, useReducer } from "react";
import "../../../../../assets/css/Table.css";
import { Axios } from "../../../../../utils/axios/Axios"
import { dateUtil } from "../../../../../utils/DateUtil";
import SiteReducer from "./SiteReducer"
import DetailModal from "./DetailModal";
import Loading from "../../../../module/Loading";
import whether0 from "../../../../../assets/image/whether/0.png";
import whether1 from "../../../../../assets/image/whether/1.png";
import whether2 from "../../../../../assets/image/whether/2.png";
import whether3 from "../../../../../assets/image/whether/3.png";
import whether4 from "../../../../../assets/image/whether/4.png";
import whether5 from "../../../../../assets/image/whether/5.png";
import whether6 from "../../../../../assets/image/whether/6.png";
import whether7 from "../../../../../assets/image/whether/7.png";
import Modal from "../../../../module/Modal";

/**
 * @description: 현장 관리 페이지
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-10
 * @modified 최종 수정일: 2025-03-14
 * @modifiedBy 최종 수정자: 정지영
 * @usedComponents
 * - DetailModal: 상세화면
 * - Modal: 요청 성공/실패 모달
 * 
 * @additionalInfo
 * - API:
 *    Http Method - GET : /site (현장관리 조회), /site/stats (현장상태 조회), /project/count (프로젝트별 근로자 수 조회)
 *    Http Method - PUT : /site (현장관리 수정)
 * - 주요 상태 관리: useReducer
 */
const Site = () => {
    const [state, dispatch] = useReducer(SiteReducer, {
        list: [],
        code: [],
    })

    const [isValidation, setIsValidation] = useState(true);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isMod, setIsMod] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isDetail, setIsDetail] = useState(false);
    const [detailTitle, setDetailTitle] = useState("");
    const [detailData, setDetailData] = useState({});

    const onClickRow = (idx) => {
        let item;
        if(state.list[idx].type === "main") {
            item = state.list[idx];
        }else{
            for(let i=idx ; i>-1 ; i--){
                if(state.list[i].type === "main") {
                    item = state.list[i];
                    break;
                }
            }
        }

        setDetailTitle(`${item.site_nm} 상세`)
        setDetailData(item);
        setIsDetail(true);
    }

    // 날씨 api 정보 확인
    const getIsWhether = (whether) => {
        if(whether.length === 0) return false;
        return true;
    }

    const saveData = async (data) => {

        if (data?.site_pos?.road_address === null || data?.site_pos?.road_address == "") {
            setIsValidation(false);
            setIsOpenModal(true);
            return
        }
        
        const res  = await Axios.PUT("/site", data)

        if( res?.data?.result === "Success"){
            setIsMod(true);
            setIsOpenModal(true);
            setIsDetail(false);
            getData();
        }else {
            setIsMod(false);
            setIsOpenModal(true);
        }


    }

    // 날씨(강수형태)
    const getPtyData = (whether) => {
        const temp = whether?.filter(item => item.key === "PTY");
        switch(temp[0]?.value){
            case "0": 
                return (
                    <>
                        <img src={whether0} style={{width: "19px"}}/> 맑음
                    </>
                );
            case "1": 
                return (
                    <>
                        <img src={whether1} style={{width: "19px"}}/> 비
                    </>
                );
            case "2": 
                return (
                    <>
                        <img src={whether2} style={{width: "19px"}}/> 비/눈
                    </>
                );
            case "3": 
                return (
                    <>
                        <img src={whether3} style={{width: "19px"}}/> 눈
                    </>
                );
            case "4": 
                return (
                    <>
                        <img src={whether4} style={{width: "19px"}}/> 소나기
                    </>
                );
            case "5": 
                return (
                    <>
                        <img src={whether5} style={{width: "19px"}}/> 빗방울
                    </>
                );
            case "6": 
                return (
                    <>
                        <img src={whether6} style={{width: "19px"}}/> 비/눈
                    </>
                );
            case "7": 
                return (
                    <>
                        <img src={whether7} style={{width: "19px"}}/> 눈
                    </>
                );
            default: return "";
        }
    }

    // 날씨(강수량)
    const getRn1Data = (whether) => {
        const temp = whether?.filter(item => item.key === "RN1");
        return ` 강수량: ${temp[0]?.value}(㎜) `;
    }

    // 날씨(기온)
    const getT1hData = (whether) => {
        const temp = whether?.filter(item => item.key === "T1H");
        return ` 기온: ${temp[0]?.value}(°C) `;
    }

    // 날씨(풍속,풍향)
    const getWindData = (whether) => {
        const temp1 = whether?.filter(item => item.key === "WSD");
        const temp2 = whether?.filter(item => item.key === "VEC");
        return ` ${temp2[0]?.value} ${temp1[0]?.value}(㎧) `;
    }

    // 현장상태 조회
    const getSiteStatsData = async() => {
        const res = await Axios.GET(`/site/stats?targetDate=${dateUtil.format(new Date(), "yyyy-MM-dd")}`);
        
        if(res?.data?.result === "Success"){
            dispatch({type: "STATS", list: res?.data?.values?.list});
        }
    }

    // 프로젝트별 근로자 수 조회
    const getWorkerCountData = async() => {
        const res = await Axios.GET(`/project/count?targetDate=${dateUtil.format(new Date(), "yyyy-MM-dd")}`);
        
        if(res?.data?.result === "Success"){
            dispatch({type: "COUNT", list: res?.data?.values?.list});
        }
    }


    // 현장 정보 조회
    const getData = async() => {
        setIsLoading(true);

        const res = await Axios.GET(`/site?targetDate=${dateUtil.format(new Date(), "yyyy-MM-dd")}&pCode=SITE_STATUS`);
        
        if(res?.data?.result === "Success"){
            dispatch({type: "INIT", site: res?.data?.values?.site, code: res?.data?.values?.code});
        }

        setIsLoading(false);
    }
    
    // 현장상태 5초마다 갱신
    useEffect(() => {
        getData();

        const interval = setInterval(() => {
            getSiteStatsData();
        }, 5000);
    
        return () => clearInterval(interval);
    }, []);

    // 프로젝트별 근로자 수 5초마다 갱신
    useEffect(() => {
        const interval = setInterval(() => {
            getWorkerCountData();
        }, 5000);
    
        return () => clearInterval(interval);
    }, []);
    

    return(
        <div>
            <Loading
                isOpen={isLoading}
            />
            <Modal
                isOpen={isOpenModal}
                title={isValidation ?  (isMod ? "요청 성공" : "요청 실패") : "입력 오류" }
                text={ isValidation ?  (isMod ? "성공하였습니다." : "실패하였습니다.") : "주소를 입력해주세요."}
                confirm={"확인"}
                fncConfirm={() => setIsOpenModal(false)}
            />
            {
                isDetail &&
                <DetailModal 
                    isOpen={isDetail}
                    title={detailTitle}
                    detailData={detailData}
                    isEditBtn={true}
                    exitBtnClick={() => setIsDetail(false)}
                    saveBtnClick={(data) => saveData(data)}
                />
            }
            <div className="container-fluid px-4">
                <h2 className="mt-4">현장 관리</h2>
                <ol className="breadcrumb mb-4">
                    <img className="breadcrumb-icon" src="/assets/img/icon-house.png" />
                    <li className="breadcrumb-item active">관리 메뉴</li>
                    <li className="breadcrumb-item active">현장 관리</li>
                </ol>

                <div className="card mb-4">
                    <div className="card-body">
                        <div className="square-title">현장 목록</div>
                        <div className="square-container">
                            {
                                state.code.length === 0 ?
                                <></>
                                :
                                state.code.map((item, idx) => (
                                    <div className="square-inner" key={idx}>
                                        <div className="square" style={{backgroundColor: item.code_color}}></div>{item.code_nm}
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </div>

                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th className="fixed-left" rowSpan={2} style={{ width: "10px", left: "0px" }}></th>
                                <th className="fixed-left" rowSpan={2} style={{ width: "100px", left: "10px" }}>발주처</th>
                                <th className="fixed-left" rowSpan={2} style={{ width: "250px", left: "110px" }}>현장</th>
                                <th colSpan={2} style={{ width: "100px" }}>진행현황</th>
                                <th colSpan={2} style={{ width: "80px" }}>HTENC</th>
                                <th colSpan={2} style={{ width: "80px" }}>협력사</th>
                                <th rowSpan={2} style={{ width: "40px" }}>소계<br />(M/D)</th>
                                <th rowSpan={2} style={{ width: "40px" }}>장비</th>
                                <th rowSpan={2} style={{ width: "400px" }}>작업내용</th>
                                <th className="fixed-right" rowSpan={2} style={{ width: "180px", right: 0 }}>날씨</th>
                            </tr>
                            <tr>
                                <th style={{ width: "50px" }}>공정률<br />(%)</th>
                                <th style={{ width: "50px" }}>누계<br />(M/D)</th>
                                <th style={{ width: "40px" }}>공사</th>
                                <th style={{ width: "40px" }}>안전</th>
                                <th style={{ width: "40px" }}>관리</th>
                                <th style={{ width: "40px" }}>근로자</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                state.list.length === 0 ?
                                <tr>
                                    <td className="center" colSpan={13}>현장 관리 내용이 없습니다.</td>
                                </tr>
                                :
                                state.list.map((item, idx) => (
                                    item.type === "main" ?
                                        <tr key={idx}>
                                            {/* 현장구분 */}
                                            <td className="fixed-left" rowSpan={item.rowSpan} style={{padding: 0, position: 'sticky', left: "0px"}}>
                                                <div style={{
                                                    backgroundColor: item.siteStatsColor,
                                                    width: '100%',
                                                    position: 'absolute',
                                                    top: 0,
                                                    bottom: 0,
                                                    margin: "0.5px"
                                                }}></div>
                                            </td>
                                            {/* 발주처 */}
                                            <td className="center fixed-left" rowSpan={item.rowSpan} style={{left: "10px"}}>{item.originalOrderCompName || ""}</td>
                                            {/* 현장 */}
                                            <td className="left ellipsis text-hover fixed-left" style={{cursor: "pointer", left: "110px"}} onClick={()=> onClickRow(idx)}>{item.site_nm || ""}</td>
                                            {/* 공정률 */}
                                            <td className="center" rowSpan={item.rowSpan} style={{fontWeight: "bold"}}>66%</td>
                                            {/* 누계 */}
                                            <td className="right" rowSpan={item.rowSpan} style={{fontWeight: "bold"}}>
                                                {
                                                    item.project_list.reduce((sum, obj) => sum + Number(obj.worker_count_all), 0)
                                                }
                                            </td>
                                            {/* 공사 */}
                                            <td className="right">
                                                {
                                                    item.project_list.reduce((sum, obj) => sum + Number(obj.worker_count_work), 0)
                                                }
                                            </td>
                                            {/* 안전 */}
                                            <td className="right">
                                                {
                                                    item.project_list.reduce((sum, obj) => sum + Number(obj.worker_count_safe), 0)
                                                }
                                            </td>
                                            {/* 관리 */}
                                            <td className="right">
                                                {
                                                    item.project_list.reduce((sum, obj) => sum + Number(obj.worker_count_manager), 0)
                                                }
                                            </td>
                                            {/* 근로자 */}
                                            <td className="right">
                                                {
                                                    item.project_list.reduce((sum, obj) => sum + Number(obj.worker_count_not_manager), 0)
                                                }
                                            </td>
                                            {/* 소계 */}
                                            <td className="right" style={{fontWeight: "bold"}}>
                                                {
                                                    item.project_list.reduce((sum, obj) => sum + Number(obj.worker_count_date), 0)
                                                }
                                            </td>
                                            {/* 장비 */}
                                            <td className="right" style={{fontWeight: "bold"}}>0</td>
                                            {/* 작업내용 */}
                                            <td className="left ellipsis">
                                                {
                                                    item.project_list.length === 1 ?
                                                        item.project_list[0]?.daily_content_list.length !== 0 ?
                                                        <ul>
                                                            <li>
                                                                {
                                                                    item.project_list[0].daily_content_list.length > 1 ?
                                                                        `${item.project_list[0].daily_content_list.length } 외 ${item.project_list[0].daily_content_list.length - 1} 건`
                                                                    :
                                                                        `${item.project_list[0].daily_content_list.length }`
                                                                }
                                                            </li>
                                                        </ul>
                                                        :
                                                        <ul>
                                                            <li className="center" style={{ color: "#a5a5a5" }}>
                                                                -
                                                            </li>
                                                        </ul>
                                                    :
                                                        ""
                                                }
                                                
                                            </td>
                                            {/* 날씨 */}
                                            <td className="center fixed-right" rowSpan={item.rowSpan}>
                                                {
                                                    getIsWhether(item.whether) ?
                                                        <>
                                                            <>{getPtyData(item.whether)}</>
                                                            /
                                                            <>{getRn1Data(item.whether)}</>
                                                            <br />
                                                            <>{getT1hData(item.whether)}</>
                                                            /
                                                            <>{getWindData(item.whether)}</>
                                                        </>                                                         
                                                    : "날씨 정보가 없습니다."
                                                }
                                            </td>
                                        </tr>
                                    :
                                        <tr key={idx}>
                                            {/* 현장 */}
                                            <td className="left ellipsis text-hover fixed-left" style={{cursor: "pointer", left: "110px"}} onClick={() => onClickRow(idx)}><li>{item.project_nm}</li></td>
                                            {/* 공사 */}
                                            <td className="right">{item.worker_count_work}</td>
                                            {/* 안전 */}
                                            <td className="right">{item.worker_count_safe}</td>
                                            {/* 관리 */}
                                            <td className="right">{item.worker_count_manager}</td>
                                            {/* 근로자 */}
                                            <td className="right">{item.worker_count_not_manager}</td>
                                            {/* 소계 */}
                                            <td className="right" style={{fontWeight: "bold"}}>{item.worker_count_date}</td>
                                            {/* 장비 */}
                                            <td className="right" style={{fontWeight: "bold"}}>0</td>
                                            {/* 작업내용 */}
                                            <td className="left ellipsis">
                                                {
                                                    item?.daily_content_list.length === 0 ?
                                                    <ul>
                                                        <li>
                                                            {
                                                                item.daily_content_list.length > 1 ?
                                                                    `${item.daily_content_list.length } 외 ${item.daily_content_list.length - 1} 건`
                                                                :
                                                                    `${item.daily_content_list.length }`
                                                            }
                                                        </li>
                                                    </ul>
                                                    :
                                                    <ul>
                                                        <li className="center" style={{ color: "#a5a5a5" }}>
                                                            -
                                                        </li>
                                                    </ul>
                                                }
                                            </td>
                                            {/* 날씨 */}
                                            {/* <td className="center">날씨....</td> */}
                                        </tr>
                                ))
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            
        </div>
    );
}

export default Site;