import { useState, useEffect, useReducer } from "react";
import "../../../../../assets/css/Table.css";
import { Axios } from "../../../../../utils/axios/Axios"
import { dateUtil } from "../../../../../utils/DateUtil";
import SiteReducer from "./SiteReducer"
import DetailModal from "./DetailModal";


/**
 * @description: 현장 관리 페이지
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-10
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - DetailModal: 상세화면
 * 
 * @additionalInfo
 * - API:
 *    Http Method - GET : /site (현장관리 조회)
 * - 주요 상태 관리: useReducer
 */
const Site = () => {
    const [state, dispatch] = useReducer(SiteReducer, {
        list: [],
        code: [],
    })

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

    const getSiteStatsData = async() => {
        const res = await Axios.GET(`/site/stats?targetDate=${dateUtil.format(new Date(), "yyyy-MM-dd")}`);
        
        if(res?.data?.result === "Success"){
            dispatch({type: "STATS", list: res?.data?.values?.list});
        }
    }

    const getData = async() => {
        const res = await Axios.GET(`/site?targetDate=${dateUtil.format(new Date(), "yyyy-MM-dd")}&pCode=SITE_STATUS`);
        
        if(res?.data?.result === "Success"){
            dispatch({type: "INIT", site: res?.data?.values?.site, code: res?.data?.values?.code});
        }
    }

    useEffect(() => {
        getData();
        
        // 5초 폴링하여 현장상태 변경
        // 현장별 최소인원 충족(기본 근로자 5명)하는 경우에 현장 상태를 운영으로 하고 아닌 경우는 미운영으로 보여주기로 함.
        const interval = setInterval(() => {
            getSiteStatsData();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return(
        <div>
            {
                isDetail &&
                <DetailModal 
                    isOpen={isDetail}
                    title={detailTitle}
                    detailData={detailData}
                    isEditBtn={true}
                    exitBtnClick={() => setIsDetail(false)}
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
                                state.code.length == 0 ?
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
                                <th rowSpan={2} style={{width: '9.86px'}}></th>
                                <th rowSpan={2} style={{width: '131.89px'}}>발주처</th>
                                <th rowSpan={2} style={{width: '390px'}}>현장</th>
                                <th colSpan={2} style={{width: '129.28px'}}>진행현황</th>
                                <th colSpan={2} style={{width: '108.89px'}}>HTENC</th>
                                <th colSpan={2} style={{width: '110.58px'}}>협력사</th>
                                <th rowSpan={2} style={{width: '57.1px'}}>소계(M/D)</th>
                                <th rowSpan={2} style={{width: '53.83px'}}>장비</th>
                                <th rowSpan={2} style={{width: '356.85px'}}>작업내용</th>
                                <th rowSpan={2} style={{width: '360.94px'}}>날씨</th>
                            </tr>
                            <tr>
                                <th rowSpan={2} style={{width: '64.36px'}}>공정률<br />(%)</th>
                                <th rowSpan={2} style={{width: '64.91px'}}>누계<br />(M/D)</th>
                                <th style={{width: '55.29px'}}>공사</th>
                                <th style={{width: '53.6px'}}>안전</th>
                                <th style={{width: '55.29px'}}>관리</th>
                                <th style={{width: '55.29px'}}>근로자</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                state.list.length == 0 ?
                                <tr>
                                    <td className="center" colSpan={13}>현장 관리 내용이 없습니다.</td>
                                </tr>
                                :
                                state.list.map((item, idx) => (
                                    item.type === "main" ?
                                        <tr key={idx}>
                                            {/* 현장구분 */}
                                            <td rowSpan={item.rowSpan} style={{padding: 0, position: 'relative'}}>
                                                <div style={{
                                                    backgroundColor: item.siteStatsColor,
                                                    width: '100%',
                                                    position: 'absolute',
                                                    top: 0,
                                                    bottom: 0
                                                }}></div>
                                            </td>
                                            {/* 발주처 */}
                                            <td className="center" rowSpan={item.rowSpan}>{item.originalOrderCompName || ""}</td>
                                            {/* 현장 */}
                                            <td className="left ellipsis text-hover" style={{maxWidth:'390px', cursor: "pointer"}} onClick={()=> onClickRow(idx)}>{item.site_nm || ""}</td>
                                            {/* 공정률 */}
                                            <td className="center" rowSpan={item.rowSpan} style={{fontWeight: "bold"}}>66%</td>
                                            {/* 누계 */}
                                            <td className="right" rowSpan={item.rowSpan} style={{fontWeight: "bold"}}>61</td>
                                            {/* 공사 */}
                                            <td className="right">150</td>
                                            {/* 안전 */}
                                            <td className="right">50</td>
                                            {/* 관리 */}
                                            <td className="right">300</td>
                                            {/* 근로자 */}
                                            <td className="right">100</td>
                                            {/* 소계 */}
                                            <td className="right" style={{fontWeight: "bold"}}>600</td>
                                            {/* equip. */}
                                            <td className="right" style={{fontWeight: "bold"}}>61</td>
                                            {/* 작업내용 */}
                                            <td className="left ellipsis" style={{maxWidth:'356.85px'}}>
                                                {
                                                    item.project_list.length == 1 ?
                                                        item.project_list[0]?.daily_content_list.length != 0 ?
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
                                            <td className="center">날씨....</td>
                                        </tr>
                                    :
                                        <tr key={idx}>
                                            {/* 현장 */}
                                            <td className="left ellipsis text-hover" style={{maxWidth:'390px', cursor: "pointer"}} onClick={() => onClickRow(idx)}><li>{item.project_nm}</li></td>
                                            {/* 공사 */}
                                            <td className="right">150</td>
                                            {/* 안전 */}
                                            <td className="right">50</td>
                                            {/* 관리 */}
                                            <td className="right">300</td>
                                            {/* 근로자 */}
                                            <td className="right">100</td>
                                            {/* 소계 */}
                                            <td className="right" style={{fontWeight: "bold"}}>600</td>
                                            {/* equip */}
                                            <td className="right" style={{fontWeight: "bold"}}>61</td>
                                            {/* 작업내용 */}
                                            <td className="left ellipsis" style={{maxWidth:'356.85px'}}>
                                                {
                                                    item?.daily_content_list.length != 0 ?
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
                                            <td className="center">날씨....</td>
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