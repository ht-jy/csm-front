import { useState, useEffect } from "react";
import { dateUtil } from "../../../../../utils/DateUtil";
import DateInput from "../../../../module/DateInput";
import Button from "../../../../module/Button";

/**
 * @description: 현장 상세 컴포넌트
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-03-04
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - dateUtil: 날짜 포맷
 * - DateInput: 커스텀 캘린더
 * 
 */
const DetailSite = ({isEdit, detailData, handelChangeValue, addressData}) => {
    const [data, setData] = useState(null);
    const [openingDate, setOpeningDate] = useState(dateUtil.now());
    const [closingPlanDate, setClosingPlanDate] = useState(dateUtil.now());
    const [closingForecastDate, setClosingForecastDate] = useState(dateUtil.now());
    const [closingActualDate, setClosingActualDate] = useState(dateUtil.now());


    // 현장 데이터 변경 이벤트
    const handelChange = (name, value) => {
        // 어떤 데이터를 수정이 가능하고 안되는지 정해지지 않아 구현하지 않음.
    }

    // 캘린더에 사용할 수 있도록 날짜 데이터 초기화
    const setDateInit = () => {
        setOpeningDate(dateUtil.format(detailData.site_date.opening_date));
        setClosingPlanDate(dateUtil.format(detailData.site_date.closing_plan_date));
        setClosingForecastDate(dateUtil.format(detailData.site_date.closing_forecast_date));
        setClosingActualDate(dateUtil.format(detailData.site_date.closing_actual_date));
    }
    useEffect(() => {
        setData(detailData);
        setDateInit();
    }, [isEdit]);

    useEffect(() => {
        console.log("하위컴포넌트", addressData)
    }, [addressData])

    return ( data !== null &&
        <>
            <div className="grid-site">
            {/* 첫 번째 열 */}
            <div className="form-control text-none-border" style={{ gridColumn: "1 / span 2", gridRow: "1" }}>
                <div className="grid-site-title">
                    현장상세
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "2" }}>
                <div className="text-overflow">
                    <label className="text-label">
                        지역 (코드)
                    </label>
                    <div className="form-input" style={{ flex: 1 }}>
                        <div className="read-only-input">
                            {data.loc_name}{`(${data.loc_code||"-"})`}
                        </div>
                        {/* {isEdit ? (
                            <input
                            style={{ width: "100%", padding: "0.5rem" }}
                            type="text"
                            name={"loc_name"}
                            value={data.loc_name + ` (${data.loc_code||"-"})`}      
                            onChange={(e) => handelChange(e.target.name, e.target.value)}
                            />
                            ) : (
                                <div className="read-only-input">
                                {data.loc_name}{`(${data.loc_code||"-"})`}
                                </div>
                                )} */}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "3" }}>
                <div className="text-overflow">
                    <label className="text-label">
                        현장명
                    </label>
                    <div className="form-input" style={{ flex: 1 }}>
                        <div className="read-only-input">
                            {data.site_nm}
                        </div>
                        {/* {isEdit ? (
                            <input
                            style={{ width: "100%", padding: "0.5rem" }}
                            type="text"
                            name={"site_nm"}
                            value={data.site_nm}
                            onChange={(e) => handelChange(e.target.name, e.target.value)}
                            />
                            ) : (
                                <div className="read-only-input">
                                {data.site_nm}
                                </div>
                                )} */}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "4" }}>
                <div className="text-overflow">
                    <label className="text-label">
                        시작일
                    </label>
                    <div className="form-input" style={{ flex: 1 }}>
                        {isEdit ? (
                            <DateInput time={openingDate} setTime={setOpeningDate}></DateInput>
                        ) : (
                            <div className="read-only-input">
                                {dateUtil.format(data.site_date.opening_date)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "5" }}>
                <div className="text-overflow">
                    <label className="text-label">
                        종료일(계획)
                    </label>
                    <div className="form-input" style={{ flex: 1 }}>
                        {isEdit ? (
                            <DateInput time={closingPlanDate} setTime={setClosingPlanDate}></DateInput>
                        ) : (
                            <div className="read-only-input">
                                {dateUtil.format(data.site_date.closing_plan_date)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "6" }}>
                <div className="text-overflow">
                    <label className="text-label">
                        종료일(예정)
                    </label>
                    <div className="form-input" style={{ flex: 1 }}>
                        {isEdit ? (
                            <DateInput time={closingForecastDate} setTime={setClosingForecastDate}></DateInput>
                        ) : (
                            <div className="read-only-input">
                                {dateUtil.format(data.site_date.closing_forecast_date)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "7" }}>
                <div className="text-overflow">
                    <label className="text-label">
                        종료일(실행)
                    </label>
                    <div className="form-input" style={{ flex: 1 }}>
                        {isEdit ? (
                            <DateInput time={closingActualDate} setTime={setClosingActualDate}></DateInput>
                        ) : (
                            <div className="read-only-input">
                                {dateUtil.format(data.site_date.closing_actual_date)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "8" }}>
                <div className="text-overflow">
                    <label className="text-label">
                        기본 프로젝트
                    </label>
                    <div className="form-input" style={{ flex: 1 }}>
                        <div className="read-only-input">
                            {data.default_project_name}
                        </div>
                        {/* {isEdit ? (
                            <input
                            style={{ width: "100%", padding: "0.5rem" }}
                            type="text"
                            name={"default_project_name"}
                            value={data.default_project_name}
                            onChange={(e) => handelChange(e.target.name, e.target.value)}
                            />
                            ) : (
                                <div className="read-only-input">
                                {data.default_project_name}
                                </div>
                                )} */}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "9" }}>
                <div className="text-overflow">
                    <label className="text-label">
                        주소
                    </label>
                    <div className="form-input" style={{ flex: 1 }}>
                        <div className="read-only-input">
                            { 
                            addressData != null ?
                            `${addressData?.roadAddress}` 
                            :
                            // {`${data.site_pos.address_name_depth1} ${data.site_pos.address_name_depth2} ${data.site_pos.address_name_depth3} ${data.site_pos.address_name_depth4} ${data.site_pos.address_name_depth5}`}
                                `${data.site_pos.road_address}`
                            }
                            {isEdit ? (
                                <Button
                                text={"변경"}
                                onClick={() => {
                                    handelChangeValue(true)
                                }}
                                style={{width : "50px", padding:"0.25rem"}}
                                ></Button>
                            ) : (
                                <></>
                            )}

                        </div>
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "10" }}>
                <div className="text-overflow">
                    <label className="text-label">
                        현장 날씨
                    </label>
                    <div className="form-input" style={{ flex: 1 }}>
                        <div className="read-only-input">
                            {"-"}
                        </div>
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1 / span 2", gridRow: "11" }}>
                <div style={{ width: "100%" }}>
                    <label className="text-label">비고</label>
                    <div className="form-textbox">
                        {isEdit ? (
                            <textarea
                            rows={4}
                            value={data.etc?.replace(/\\n/g, "\n")}
                            name={"etc"}
                            onChange={(e) => {
                                // 실제 개행문자 '\n'을 '\\n'으로 치환하여 상태에 저장
                                const replaced = e.target.value.replace(/\n/g, "\\n");
                                handelChange(e.target.name, replaced);
                            }}
                            />
                        ) : (
                            /* 보기 모드 */
                            <div className="view-mode" style={{ whiteSpace: "pre-wrap" }}>
                                {data.etc?.replace(/\\n/g, "\n")}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 두 번째 열 */}
            <div className="form-control" style={{ gridColumn: "2", gridRow: "2 / span 9" }}>
                지도
            </div>
        </div>
    </>
    );
}
export default DetailSite;