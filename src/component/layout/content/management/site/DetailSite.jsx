import { useState, useEffect, useContext } from "react";
import { dateUtil } from "../../../../../utils/DateUtil";
import { Axios } from "../../../../../utils/axios/Axios";
import DateInput from "../../../../module/DateInput";
import Button from "../../../../module/Button";
import Select from 'react-select';
import SiteContext from "../../../../context/SiteContext";
import Slider from "rc-slider";
import 'rc-slider/assets/index.css';
import whether0 from "../../../../../assets/image/whether/0.png";
import whether1 from "../../../../../assets/image/whether/1.png";
import whether2 from "../../../../../assets/image/whether/2.png";
import whether3 from "../../../../../assets/image/whether/3.png";
import whether4 from "../../../../../assets/image/whether/4.png";
import whether5 from "../../../../../assets/image/whether/5.png";
import whether6 from "../../../../../assets/image/whether/6.png";
import whether7 from "../../../../../assets/image/whether/7.png";
import whether13 from "../../../../../assets/image/whether/13.png";
import whether14 from "../../../../../assets/image/whether/14.png";
import Map from "../../../../module/Map";
import Modal from "../../../../module/Modal";
import Loading from "../../../../module/Loading";
import { Common } from "../../../../../utils/Common";

/**
 * @description: 현장 상세 컴포넌트
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-03-04
 * @modified 최종 수정일: 2025-03-14
 * @modifiedBy 최종 수정자: 정지영
 * @usedComponents
 * - dateUtil: 날짜 포맷
 * - DateInput: 커스텀 캘린더
 * 
 */
const DetailSite = ({isEdit, detailData, projectData, handleChangeValue, addressData, isSiteAdd}) => {
    const { getData, setIsDetail } = useContext(SiteContext);

    const [data, setData] = useState(null);
    const [openingDate, setOpeningDate] = useState(dateUtil.now());
    const [closingPlanDate, setClosingPlanDate] = useState(dateUtil.now());
    const [closingForecastDate, setClosingForecastDate] = useState(dateUtil.now());
    const [closingActualDate, setClosingActualDate] = useState(dateUtil.now());
    const [etc, setEtc] = useState("")
    const [projectOption, setProjectOption] = useState([]);
    /** 모달 **/
    const [isNonUseCheckOpen, setIsNonUseCheckOpen] = useState(false);
    const [isNonUseConfirm, setIsNonUseConfirm] = useState(false);
    const [nonUseConfirmText, setNonUseConfirmText] = useState("");
    /** 로딩 **/
    const [isLoading, setIsLoading] = useState(false);
    /** 슬라이더 **/
    const [sliderValue, setSliderValue] = useState(0);

    // 슬라이더 변경 이벤트
    const onChangeSliderValue = (value) => {
        const formatValue = Common.sanitizeNumberInput(value);
        setSliderValue(formatValue);
        handleChangeValue("work_rate", formatValue);
    }
    
    // 현장 데이터 변경 이벤트
    const handleChange = (name, value) => {
        if (data === null) return

        if(name === "site_pos"){
            const sitePos = {
                road_address: value.roadAddress,
                building_name: value.buildingName,
                zone_code: value.zonecode,
                address_name_depth1: value.sido,
                address_name_depth2: value.sigungu,
                address_name_depth3: value.bname1,
                address_name_depth4: value.bname,
                address_name_depth5: value.jibunAddress.replace(value.sido, "").replace(value.sigungu, "").replace(value.bname1, "").replace(value.bname, "").trim(),
                road_address_name_depth1: value.sido,
                road_address_name_depth2: value.sigungu,
                road_address_name_depth3: value.bname1,
                road_address_name_depth4: value.roadname,
                road_address_name_depth5: value.roadAddress.replace(value.sido, "").replace(value.sigungu, "").replace(value.bname1, "").replace(value.roadname, "").trim(),                
            }
            handleChangeValue(name, sitePos)
        }else if (name === "site_date"){   
            
            const siteDate = {
                opening_date : dateUtil.parseToGo(openingDate),
                closing_plan_date : dateUtil.parseToGo(closingPlanDate),
                closing_forecast_date: dateUtil.parseToGo(closingForecastDate),
                closing_actual_date: dateUtil.parseToGo(closingActualDate),
                reg_date: detailData.site_date.reg_date,
                reg_uno:detailData.site_date.reg_uno,
                reg_user: detailData.site_date.reg_user,
            } 
            handleChangeValue(name, siteDate)
            
        }else if (name === "etc") {

            handleChangeValue(name, etc.replace(/\n/g, "\\n"))
        }

    }

    // 캘린더에 사용할 수 있도록 날짜 데이터 초기화 및 textarea 반영을 위해 비고 초기화
    const setDateInit = () => {
        setOpeningDate(dateUtil.format(detailData.site_date.opening_date));
        setClosingPlanDate(dateUtil.format(detailData.site_date.closing_plan_date));
        setClosingForecastDate(dateUtil.format(detailData.site_date.closing_forecast_date));
        setClosingActualDate(dateUtil.format(detailData.site_date.closing_actual_date));
        setEtc(detailData.etc)
    }


    // 날씨 api 정보 확인
    const getIsWhether = (whether) => {
        if(whether?.length === 0) return false;
        return true;
    }

    // 날씨(강수형태) && 날씨(하늘상태)
    const getPtyNSkyData = (whether) => {

        let whetherIcon = whether0
        let whetherText = "맑음" 

        const temp = whether?.filter(item => item.key === "PTY");
        // 하늘 상태 추가
        const cloudy = whether?.filter(item => item.key === "SKY");
        switch (temp[0]?.value) {
            case "0":
                switch (cloudy[0]?.value) {
                    case "1":
                        whetherIcon = whether0;
                        whetherText = "맑음";
                        break;
                    case "3":
                        whetherIcon = whether13;
                        whetherText = "구름많음";
                        break;
                    case "4":
                        whetherIcon = whether14;
                        whetherText = "흐림";
                }
                break;
            case "1":
                whetherIcon = whether1;
                whetherText = "비";
                break;
            case "2":
                whetherIcon = whether2;
                whetherText = "비/눈";
                break;
            case "3":
                whetherIcon = whether3;
                whetherText = "눈";
                break;
            case "4":
                whetherIcon = whether4;
                whetherText = "소나기";
                break;
            case "5":
                whetherIcon = whether5;
                whetherText = "빗방울";
                break;
            case "6":
                whetherIcon = whether6;
                whetherText = "비/눈";
                break;
            case "7":
                whetherIcon = whether7
                whetherText = "눈";
            default: break;
        }

        return <>
            <img src={whetherIcon} style={{ width: "19px" }} /> {whetherText}
        </>
    }

    // 날씨(강수량)
    const getRn1Data = (whether) => {
        if(whether === undefined){
            return;
        }
        const temp = whether?.filter(item => item.key === "RN1");
        return ` 강수량: ${temp[0]?.value}(㎜) `;
    }

    // 날씨(기온)
    const getT1hData = (whether) => {
        if(whether === undefined){
            return;
        }
        const temp = whether?.filter(item => item.key === "T1H");
        return ` 기온: ${temp[0]?.value}(°C) `;
    }

    // 날씨(풍속,풍향)
    const getWindData = (whether) => {
        if(whether === undefined){
            return;
        }
        const temp1 = whether?.filter(item => item.key === "WSD");
        const temp2 = whether?.filter(item => item.key === "VEC");
        return ` ${temp2[0]?.value} ${temp1[0]?.value}(㎧) `;
    }

    // 작업완료 체크 모달
    const onClickCompleteBtn = () => {
        setIsNonUseCheckOpen(true);
    }

    // 작업완료 처리
    const siteModifyNonUse = async() => {
        setIsNonUseCheckOpen(false);
        
        setIsLoading(true);
            const res = await Axios.PUT(`/site/non-use`, {sno: data.sno || 0});
            
            if (res?.data?.result === "Success") {
                setNonUseConfirmText("현장 완료 처리에 성공하였습니다.");
            }else{
                setNonUseConfirmText("현장 완료 처리에 실패하였습니다.\n잠시 후에 다시 시도하여 주세요.");
            }
            setIsNonUseConfirm(true);
        setIsLoading(false);
    }

    // 작업완료 성공 확인 이벤트
    const onClickNonUseConfirm = () => {
        getData();
        setIsDetail(false)
        setIsNonUseConfirm(false);
    }

    /***** useEffect *****/

    useEffect(() => {
        setData(detailData);

        // 날짜
        if(detailData.site_date !== undefined){
            setDateInit();
        }
        
        // 기본 프로젝트
        const options = projectData.map(item => {
            return {value: item.jno, label:item.project_nm};
        });
        setProjectOption(options);

        // 공정률
        if(typeof detailData.work_rate === "number"){
            setSliderValue(detailData.work_rate);
        }else{
            setSliderValue(0);
        }

        
    }, [isEdit]);

    useEffect(() => {
        if(addressData !== null){
            handleChange("site_pos", addressData)
        }
    }, [addressData])

    useEffect(() => {
        if (data !== null){
            handleChange("site_date")
        }
    }, [openingDate, closingPlanDate, closingForecastDate, closingActualDate])

    return ( data !== null &&
        <>
            <Loading 
                isOpen={isLoading}
            />
            <Modal
                isOpen={isNonUseCheckOpen}
                title={"현장 작업 완료"}
                text={"작업 완료 처리를 하시겠습니까?\n완료 후에는 현장화면에서 조회를 할 수 없습니다."}
                confirm={"예"}
                fncConfirm={siteModifyNonUse}
                cancel={"아니오"}
                fncCancel={() => setIsNonUseCheckOpen(false)}
            />
            <Modal
                isOpen={isNonUseConfirm}
                title={"현장 작업 완료"}
                text={nonUseConfirmText}
                confirm={"확인"}
                fncConfirm={onClickNonUseConfirm}
            />
            <div className="grid-site">
            {/* 첫 번째 열 */}
            <div className="form-control text-none-border" style={{ gridColumn: "1 / span 2", gridRow: "1" }}>
                <div className="grid-site-title">
                    <span style={{paddingTop: "3px"}}>현장상세</span>
                    <div style={{marginLeft: "auto", marginRight: "2px"}}>
                        {isEdit && <Button text={"작업 완료"} onClick={onClickCompleteBtn}/>}
                    </div>
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
                                {dateUtil.format(data?.site_date?.opening_date)}
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
                                {dateUtil.format(data?.site_date?.closing_plan_date)}
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
                                {dateUtil.format(data?.site_date?.closing_forecast_date)}
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
                                {dateUtil.format(data?.site_date?.closing_actual_date)}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "8" }}>
                <div className="text-overflow">
                    <label className="text-label">
                        공정률
                    </label>
                    <div className="form-input" style={{ flex: 1 }}>
                        <div style={{display: "flex", alignItems: "center", marginLeft: "5px"}}>
                            {
                                isEdit ?
                                    <input type="text" value={sliderValue} onChange={(e) => onChangeSliderValue(e.target.value)} style={{height: "40px", width: "50px", textAlign: "right", paddingRight: "5px"}}/>
                                :
                                    sliderValue
                            }
                            &nbsp;%
                            <div style={{width: "300px", marginLeft: isEdit ? "20px" : "62px",}}>
                                <Slider 
                                    min={0}
                                    max={100}
                                    value={sliderValue}
                                    onChange={onChangeSliderValue}
                                    disabled={!isEdit}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "9" }}>
                <div className="text-overflow">
                    <label className="text-label">
                        기본 프로젝트
                    </label>
                    <div className="form-input" style={{ flex: 1 }}>
                        {/* <div className="read-only-input">
                            {data.default_project_name}
                        </div> */}
                        {isEdit ? (
                            <div style={{display: "flex", marginLeft: "5px"}}>
                                <Select
                                    onChange={(item) => handleChangeValue("default_jno", item.value)}
                                    defaultValue={projectOption.find(option => option.value === data.default_jno)}
                                    options={projectOption || []}
                                    styles={{
                                        menuPortal: (base) => ({
                                            ...base,
                                            zIndex: 999999999, // 모달보다 높게
                                        }),
                                        container: (provided) => ({
                                        ...provided,
                                        width: "100%",
                                        }),
                                    }}
                                />
                            </div>
                        ) : (
                            <div className="read-only-input">
                                {data.default_project_name}
                            </div>
                            )
                        }
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "10" }}>
                <div className="text-overflow">
                    <label className="text-label">
                        주소
                    </label>
                    <div className="form-input" style={{ flex: 1 }}>
                        <div className="read-only-input">
                            { 
                            addressData !== null ?
                            `${addressData?.roadAddress}` 
                            :
                                `${data?.site_pos?.road_address}`
                            }
                            {isEdit ? (
                                <Button
                                text={"변경"}
                                onClick={() => {
                                    handleChangeValue("searchOpen", true)
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
            <div className="form-control text-none-border" style={{ gridColumn: "1", gridRow: "11" }}>
                <div className="text-overflow">
                    <label className="text-label">
                        현장 날씨
                    </label>
                    <div className="form-input" style={{ flex: 1 }}>
                        <div className="read-only-input">
                            {
                                getIsWhether(data.whether) ?
                                <>
                                    <>{getPtyNSkyData(data.whether)}</>
                                    /
                                    <>{getRn1Data(data.whether)}</>
                                    /
                                    <>{getT1hData(data.whether)}</>
                                    /
                                    <>{getWindData(data.whether)}</>
                                </>                                                         
                                : "날씨 정보가 없습니다."
                            }
                        </div>
                    </div>
                </div>
            </div>
            <div className="form-control text-none-border" style={{ gridColumn: "1 / span 2", gridRow: "12" }}>
                <div style={{ width: "100%" }}>
                    <label className="text-label">비고</label>
                    <div className="form-textbox">
                        {isEdit ? (
                            <textarea
                            rows={4}
                            value={(data !== null ? etc.replace(/\\n/g, "\n") : "")}
                            name={"etc"}
                            onChange={(e) => {
                                // 실제 개행문자 '\n'을 '\\n'으로 치환하여 상태에 저장
                                setEtc(e.target.value);
                            }}
                            onBlur={() => handleChange("etc")}
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
            <div className="form-control" style={{ gridColumn: "2", gridRow: "2 / span 10" }}>
                 <Map roadAddress={data?.site_pos?.road_address}></Map>
            </div>
        </div>
    </>
    );
}
export default DetailSite;