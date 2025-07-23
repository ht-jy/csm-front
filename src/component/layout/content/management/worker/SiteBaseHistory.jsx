import { useEffect, useMemo, useState } from "react";
import Button from "../../../../module/Button";
import DateInput from "../../../../module/DateInput";
import PaginationWithCustomButtons from "../../../../module/PaginationWithCustomButtons";
import Search from "../../../../module/search/Search";
import Table from "../../../../module/Table";
import Exit from "../../../../../assets/image/exit.png";
import useTableSearch from "../../../../../utils/hooks/useTableSearch";
import useTableControlState from "../../../../../utils/hooks/useTableControlState";
import { Axios } from "../../../../../utils/axios/Axios";

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
 *    Http Method - GET : 
 *    Http Method - POST : 
 *    Http Method - PUT : 
 *    Http Method - DELETE : 
 */

const SiteBaseHistory = ({isOpen, fncExit}) => {

    const [data, setData] = useState([]);
    const [count, setCount] = useState(0);

    // 테이블 필드
    const columns = useMemo(() => [
        { isSearch: false, isOrder: false, isSlide: false, width: "100px", header: "아이디", itemName: "user_id", bodyAlign: "center", isEllipsis: false, isDate: false },
    ], []);

    // 검색 옵션
    const searchOptions = [
        { value: "ALL", label: "전체" },
        { value: "USER_ID", label: "아이디" },
        { value: "USER_NM", label: "이름" },
        { value: "DEPARTMENT", label: "부서/조직명" },
    ];

    const { pageNum, setPageNum, rowSize, setRowSize, retrySearchText, setRetrySearchText } = useTableControlState(10);

    // 종료 이벤트
    const handleExitScrollUnset = (e) => {
        document.body.style.overflow = 'unset';
        fncExit();
    }

    const getData = async () => {
        const res = await Axios.GET(`worker/total/absent`);
        
        if (res?.data?.result === "Success") {
        }
    };

    const {
        isSearchInit,
        handleRetrySearch,
        handleSearchInit,
        handlePageClick,
    } = useTableSearch({ columns, getDataFunction: getData, retrySearchText, setRetrySearchText, pageNum, setPageNum, rowSize, setRowSize });

    /***** useEffect *****/
    // 모달 오픈시 메인 화면 스크롤 정지 및 모달종료
    useEffect(() => {
        if (isOpen !== null && isOpen) {

            document.body.style.overflow = "hidden";

            // 엔터 키 이벤트 핸들러
            const handleKeyDown = (event) => {
                if (event.key === "Escape") {
                    fncExit();
                }
            };

            document.addEventListener("keydown", handleKeyDown);

            return () => {
                document.body.style.overflow = "unset";
                document.removeEventListener("keydown", handleKeyDown);
            };
        }
    }, [isOpen]);
    
    return (
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
                        <Table
                            columns={columns} 
                            data={data}
                            noDataText={"검색된 이력이 없습니다."}
                            styles={{width: "100%"}}
                        />

                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0px' }}>
                            {
                                count !== 0 ? 
                                    <PaginationWithCustomButtons
                                        dataCount={count}
                                        fncClickPageNum={handlePageClick}
                                    />
                                : null
                            }
                            
                        </div>
                    </div>
                </div>
            </div>
        : null
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
    padding: '5px',
    borderRadius: '8px',
    // maxWidth: '1300px',
    width: '95%',
    maxHeight: '900px',
    height: '90%',
    boxShadow: '15px 15px 1px rgba(0, 0, 0, 0.3)',
    margin: '10px',
};

export default SiteBaseHistory;