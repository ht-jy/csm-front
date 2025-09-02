import { useEffect, useMemo, useState } from "react";
import Button from "../../../../module/Button";
import Search from "../../../../module/search/Search";
import Table from "../../../../module/Table";
import Exit from "../../../../../assets/image/exit.png";
import useTableSearch from "../../../../../utils/hooks/useTableSearch";
import useTableControlState from "../../../../../utils/hooks/useTableControlState";
import { Axios } from "../../../../../utils/axios/Axios";
import { useAuth } from "../../../../context/AuthContext";
import Loading from "../../../../module/Loading";
import { useNavigate } from "react-router-dom";
import { ObjChk } from "../../../../../utils/ObjChk";
import Modal from "../../../../module/Modal";

/**
 * @description: 현장 근로자 변경 이력 모달창
 * @author 작성자: 김진우
 * @created 작성일: 2025-07-23
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @modified Description: 
 *
 * @additionalInfo
 * - API: 
 *    Http Method - GET : worker/site-base/reason (변경 사유), worker/site-base/history (변경 이력)
 *    Http Method - POST : 
 *    Http Method - PUT : 
 *    Http Method - DELETE : 
 */

const SiteBaseHistory = ({isOpen, fncExit, startDate, endDate, checkList}) => {

    const navigate = useNavigate();
    const { project } = useAuth();
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    // 사유 모달
    const [isReason, setIsReason] = useState(false);
    const [reason, setReason] = useState("");
    

    // 테이블 필드
    const columns = useMemo(() => [
        { isSearch: false, isOrder: false, width: "65px", header: "유형", itemName: "reason_type", bodyAlign: "center", isEllipsis: true, rowSpan: 2 },
        { isSearch: false, isOrder: false, width: "75px", header: "아이디", itemName: "user_id", bodyAlign: "center", isEllipsis: false , rowSpan: 2},
        { isSearch: false, isOrder: false, width: "45px", header: "이름", itemName: "user_nm", bodyAlign: "center", isEllipsis: false, rowSpan: 2 },
        { isSearch: false, isOrder: false, width: "75px", header: "날짜", itemName: "record_date", bodyAlign: "center", isEllipsis: false, isDate: true, dateFormat: 'format', rowSpan: 2 },
        { isSearch: false, isOrder: false, width: "95px", header: "변경일시", itemName: "reg_date", bodyAlign: "center", isEllipsis: true, isDate: true, dateFormat: 'formatDateTime', rowSpan: 2,  },
        { isSearch: false, isOrder: false, width: "40px", header: "변경", itemName: "his_name", bodyAlign: "center", isEllipsis: false },
        { isSearch: false, isOrder: false, width: "155px", header: "프로젝트명", itemName: "job_name", bodyAlign: "left", isEllipsis: true },
        { isSearch: false, isOrder: false, width: "55px", header: "출근시간", itemName: "in_recog_time", bodyAlign: "center", isEllipsis: false, isDate: true, dateFormat: 'formatTime24' },
        { isSearch: false, isOrder: false, width: "55px", header: "퇴근시간", itemName: "out_recog_time", bodyAlign: "center", isEllipsis: false, isDate: true, dateFormat: 'formatTime24' },
        { isSearch: false, isOrder: false, width: "45px", header: "상태", itemName: "work_state", bodyAlign: "center", isEllipsis: false },
        { isSearch: false, isOrder: false, width: "35px", header: "공수", itemName: "work_hour", bodyAlign: "center", isEllipsis: false },
        { isSearch: false, isOrder: false, width: "35px", header: "철야", itemName: "is_overtime", bodyAlign: "center", isEllipsis: false, isChecked: true},
        { isSearch: false, isOrder: false, width: "35px", header: "마감", itemName: "is_deadline", bodyAlign: "center", isEllipsis: false, isChecked: true },
        { isSearch: false, isOrder: false, width: "155px", header: "변경사유", itemName: "reason", bodyAlign: "left", isEllipsis: true, rowSpan: 2 },
    ], []);

    // 검색 옵션
    const searchOptions = [
        { value: "ALL", label: "전체" },
        { value: "REASON_TYPE", label: "유형" },
        { value: "USER_NM", label: "이름" },
        { value: "USER_ID", label: "아이디" },
    ];

    const { pageNum, setPageNum, rowSize, setRowSize, retrySearchText, setRetrySearchText } = useTableControlState(10);

    // 변경유형매칭
    const reasonType = {
        "추가": "01",
        "수정": "02|08",
        "마감": "03|07|08",
        "공수입력": "04",
        "프로젝트변경": "05",
        "삭제": "06",
        "마감취소": "07",
        "취소": "07",
        "근태업로드": "09",
        "엑셀": "09",
        "업로드": "09",
    };

    // 검색값 유형에 맞게 변환
    const convertReasonTypeString = (input) => {
        return input.split('~').map(field => {
            const [key, value] = field.split(':');
            if (!value) return field;

            const values = value.split('|');
            
            // REASON_TYPE 값  치환
            if (key === "REASON_TYPE") {
                const replaced = values
                    .map(v => reasonType[v] || v)    
                    .flatMap(v => v.split('|'));
                return `${key}:${[...new Set(replaced)].join('|')}`;
            }

            // ALL 값 치환
            if (key === "ALL") {
                const groups = values.map(v => {
                    let groupParts = [];
                    if (reasonType[v]) {
                        // 기존 값은 USER_NM/USER_ID 필드만 검색하도록 지정 (값의 뒤에 ?{필드명}?{필드명}... 이 붙으면 해당 필드만 검색)
                        groupParts.push(`${v}?USER_NM?USER_ID`);
                        // 치환된 코드들은 REASON_TYPE 검색하도록 지정
                        reasonType[v].split('|').forEach(code => {
                            groupParts.push(`${code}?REASON_TYPE`);
                        });
                    } else {
                        // 매핑 없는 값도 ?USER_ID?USER_NM 만 검색하도록 지정
                        groupParts.push(`${v}?USER_ID?USER_NM`);
                    }
                    return groupParts.join(';');
                });
                return `${key}:${groups.join('|')}`;
            }

            return field;
        }).join('~');
    }

    // 종료 이벤트
    const handleExitScrollUnset = (e) => {
        document.body.style.overflow = 'unset';
        fncExit();
    }

    // 현장근로자 변경 이력 리스트 클릭
    const onClickRow = async(cno) => {
        if(ObjChk.all(cno)) return;

        try{
            setIsLoading(true);
            const res = await Axios.GET(`worker/site-base/reason?cno=${cno}`);
            
            if (res?.data?.result === "Success") {
                setReason(res?.data?.values||"");
                setIsReason(true);
            }
        }catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    // 변경 이력 조회
    const getData = async () => {
        const convertText = encodeURIComponent(convertReasonTypeString(retrySearchText));
        const userKeyList = ObjChk.ensureArray(checkList).map(
            (item) => `keys=${item.user_key}` 
        ).join('&')

        try {
            setIsLoading(true);
            const res = await Axios.GET(`worker/site-base/history?start_date=${startDate}&end_date=${endDate}&sno=${project?.sno}&retry_search=${convertText}&${userKeyList}`);
            
            if (res?.data?.result === "Success") {
                const newData = res?.data?.values?.map(item => (
                    item.his_status === "AFTER" ? {...item, backgroundColor: "#faf4e3"} : {...item, backgroundColor: ""}
                ));
                setData(newData||[]);
            }
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    };

    const {
        isSearchInit,
        handleRetrySearch,
        handleSearchInit,
    } = useTableSearch({ columns, getDataFunction: getData, retrySearchText, setRetrySearchText, pageNum, setPageNum, rowSize, setRowSize, isOpen });

    /***** useEffect *****/
    // 모달이 열릴 때 실행
    useEffect(() => {

        if (isOpen) {
            handleSearchInit();
            document.body.style.overflow = "hidden";
        }
        // cleanup
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    // ESC 핸들러
    useEffect(() => {
        if (!isOpen) return; // 모달 닫히면 리스너 필요 없음

        const handleKeyDown = (event) => {
            // isReason이 켜져 있으면(서브모달) ESC 무시
            if (isReason) return;
            if (event.key === "Escape") fncExit();
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [isOpen, isReason]);
    
    return (
        <>
            <Loading
                isOpen={isLoading}
            />
            <Modal
                isOpen={isReason}
                title={"현장 근로자 변경 사유"}
                content={
                    <div className="form-control text-none-border" style={{padding: 0, marginBottom: "5px"}}>
                        <div style={{ width: "100%" }}>
                            <div className="form-textbox">
                                <div className="view-mode" style={{ whiteSpace: "pre-wrap" }}>
                                    {reason?.replace(/\\n/g, "\n")}
                                </div>
                            </div>
                        </div>
                    </div>
                }
                confirm={"확인"}
                fncConfirm={() => setIsReason(false)}
            />
            {
                isOpen !== null && isOpen ?
                    <div style={overlayStyle}>
                        <div style={modalStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: "#ddd", borderRadius: "5px", height: "40px" }}>
                                <h2 style={{fontSize: "15px", color: "black", paddingLeft: "10px"}}>현장 근로자 변경 이력</h2>

                                <div onClick={handleExitScrollUnset} style={{ cursor: "pointer" }}>
                                    <img src={Exit} style={{ width: "30px", paddingBottom: '0px', marginRight: "5px" }} alt="Exit" />
                                </div>
                            </div>

                            <div className="table-header">
                                <div className="table-header-left" style={{gap:"10px"}}>
                                    {/* <div>
                                        조회날짜 <DateInput time={searchStartTime} setTime={setSearchStartTime}></DateInput>
                                    </div> */}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: "right", marginTop: "5px", marginBottom: "5px", height: "40px" }}>
                                    {
                                        isSearchInit ? <Button text={"초기화"} onClick={handleSearchInit}  style={{marginRight: "2px"}}/> : null
                                    }
                                    <Search 
                                        searchOptions={searchOptions}
                                        width={"230px"}
                                        fncSearchKeywords={handleRetrySearch}
                                        retrySearchText={retrySearchText}
                                        potalId={"search-portal"}
                                    /> 
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: "right", paddingRight: 0 }}>
                                <div id="search-portal"></div>
                            </div>

                            <div style={{ 
                                width: '100%', 
                                height: 'calc(100% - 120px)',  // 버튼과 라디오 영역을 제외한 높이
                                overflowX: 'auto',            // 가로 스크롤
                                overflowY: 'auto',            // 세로 스크롤
                                marginTop: "0px",
                            }}>
                                <div className="table-wrapper">
                                    <div className="table-container" id="table-container" style={{overflow: "auto", maxHeight: "calc(100% - 350px)"}}>
                                        <Table
                                            columns={columns} 
                                            data={data}
                                            noDataText={"검색된 이력이 없습니다."}
                                            styles={{width: "100%"}}
                                            isHeaderFixed={true}
                                            // onClickRow={(clickItem)=> onClickRow(clickItem?.cno)}
                                            groupKeyArr={["user_id", "reg_date"]}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                : null
            }
        </>
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
    zIndex: '9998'
};
  
const modalStyle = {
    backgroundColor: '#fff',
    padding: '5px',
    borderRadius: '8px',
    maxWidth: '1300px',
    width: '95%',
    maxHeight: '900px',
    height: '90%',
    boxShadow: '15px 15px 1px rgba(0, 0, 0, 0.3)',
    margin: '10px',

};

export default SiteBaseHistory;