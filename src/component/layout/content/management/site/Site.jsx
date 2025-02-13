import { useState, useEffect, useReducer } from "react";
import "../../../../../assets/css/Table.css";
import { Axios } from "../../../../../utils/axios/Axios"
import { dateUtil } from "../../../../../utils/DateUtil";
import SiteReducer from "./SiteReducer"


/**
 * @description: 현장 관리 페이지
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-10
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - 
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

    const getData = async() => {
        const res = await Axios.GET(`/site?targetDate=${dateUtil.format(new Date(), "yyyy-MM-dd")}&pCode=SITE_STATUS`);

        if(res?.data?.result === "Success"){
            dispatch({type: "INIT", site: res?.data?.values?.site, code: res?.data?.values?.code});
        }
    }

    useEffect(() => {
        getData();
    }, []);

    return(
        <div>
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
                                <th rowSpan={2} style={{width: '10px'}}></th>
                                <th rowSpan={2} style={{width: '150px'}}>발주처</th>
                                <th rowSpan={2} style={{width: '390px'}}>현장</th>
                                <th colSpan={2}>진행현황</th>
                                <th colSpan={2}>HTENC</th>
                                <th colSpan={2}>협력사</th>
                                <th rowSpan={2} style={{width: '50px'}}>소계(M/D)</th>
                                <th rowSpan={2} style={{width: '60px'}}>Equip.</th>
                                <th rowSpan={2} style={{width: '450px'}}>작업내용</th>
                                <th rowSpan={2} style={{width: '100px'}}>현장시작일</th>
                                <th rowSpan={2} style={{width: '100px'}}>현장종료일</th>
                                <th rowSpan={2}>날씨</th>
                            </tr>
                            <tr>
                                <th rowSpan={2} style={{width: '90px'}}>공정률(%)</th>
                                <th rowSpan={2} style={{width: '100px'}}>누계(M/D)</th>
                                <th style={{width: '50px'}}>공사</th>
                                <th style={{width: '50px'}}>안전</th>
                                <th style={{width: '50px'}}>관리</th>
                                <th style={{width: '60px'}}>근로자</th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                state.list.length == 0 ?
                                <tr>
                                    <td className="center" colSpan={15}>현장 관리 내용이 없습니다.</td>
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
                                            <td className="left ellipsis" style={{maxWidth:'390px'}}>{item.site_nm || ""}</td>
                                            {/* 공정률 */}
                                            <td className="center" rowSpan={item.rowSpan}>66%</td>
                                            {/* 누계 */}
                                            <td className="right" rowSpan={item.rowSpan}>61</td>
                                            {/* 공사 */}
                                            <td className="right">150</td>
                                            {/* 안전 */}
                                            <td className="right">50</td>
                                            {/* 관리 */}
                                            <td className="right">300</td>
                                            {/* 근로자 */}
                                            <td className="right">100</td>
                                            {/* 소계 */}
                                            <td className="right">600</td>
                                            {/* equip. */}
                                            <td className="right">61</td>
                                            {/* 작업내용 */}
                                            <td className="left ellipsis" style={{maxWidth:'450px'}}>
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
                                                            <li style={{ color: "#a5a5a5" }}>
                                                                당일 작업내용이 없습니다.
                                                            </li>
                                                        </ul>
                                                    :
                                                        ""
                                                }
                                                
                                            </td>
                                            {/* 시작일 */}
                                            <td className="center">2025-01-01</td>
                                            {/* 종료일 */}
                                            <td className="center">2025-02-01</td>
                                            {/* 날씨 */}
                                            <td className="center">날씨....</td>
                                        </tr>
                                    :
                                        <tr key={idx}>
                                            {/* 현장 */}
                                            <td className="left ellipsis" style={{maxWidth:'390px'}}>{item.project_nm}</td>
                                            {/* 공사 */}
                                            <td className="right">150</td>
                                            {/* 안전 */}
                                            <td className="right">50</td>
                                            {/* 관리 */}
                                            <td className="right">300</td>
                                            {/* 근로자 */}
                                            <td className="right">100</td>
                                            {/* 소계 */}
                                            <td className="right">600</td>
                                            {/* equip */}
                                            <td className="right">61</td>
                                            {/* 작업내용 */}
                                            <td className="left ellipsis" style={{maxWidth:'450px'}}>
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
                                                        <li style={{ color: "#a5a5a5" }}>
                                                            당일 작업내용이 없습니다.
                                                        </li>
                                                    </ul>
                                                }
                                            </td>
                                            {/* 시작일 */}
                                            <td className="center">2025-01-01</td>
                                            {/* 종료일 */}
                                            <td className="center">2025-02-01</td>
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