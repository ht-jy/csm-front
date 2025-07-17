import { useState, useEffect, useMemo, useContext } from "react";
import { Axios } from "../../../utils/axios/Axios";
import { useAuth } from "../../context/AuthContext";
import { dateUtil } from "../../../utils/DateUtil";
import Table from "../Table";
import Exit from "../../../assets/image/exit.png";
import PaginationWithCustomButtons from "../PaginationWithCustomButtons";
import useTableControlState from "../../../utils/hooks/useTableControlState";
import useTableSearch from "../../../utils/hooks/useTableSearch";
import Search from "../search/Search";
import Button from "../Button";
import DateInput from "../DateInput";
import SiteBaseContext from "../../context/SiteBaseContext";
import { useTableContext } from "../../context/TableContext";
import "../../../assets/css/SearchWorkerModal.css";

/**
 * @description: 근로자 아이디, 이름, 부서 조회 모달
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-03-24
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - 
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : worker/total/simple (전체 근로자 조회)
 */
const SearchWorkerModal = ({isOpen=false, fncExit, onClickRow}) => {
    const { searchTime } = useTableContext();
    const { project } = useAuth();
    const [userId, setUserId] = useState("");
    const [data, setData] = useState([]);
    const [count, setCount] = useState(0);
    const [searchStartTime, setSearchStartTime] = useState(searchTime);

    const columns = useMemo(() => [
        { isSearch: false, isOrder: false, isSlide: false, width: "100px", header: "아이디", itemName: "user_id", bodyAlign: "center", isEllipsis: false, isDate: false },
        { isSearch: false, isOrder: false, isSlide: false, width: "100px", header: "이름", itemName: "user_nm", bodyAlign: "center", isEllipsis: false, isDate: false },
        { isSearch: false, isOrder: false, isSlide: false, width: "100px", header: "부서/조직명", itemName: "department", bodyAlign: "center", isEllipsis: false, isDate: false },
        { isSearch: false, isOrder: false, isSlide: false, width: "100px", header: "등록가능 날짜", itemName: "record_date", bodyAlign: "center", isEllipsis: false, isDate: false },
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

    // 테이블 리스트 클릭
    const handleRowClick = (item) => {
        onClickRow({
            user_id: item.user_id,
            user_nm: item.user_nm, 
            department: item.department,
            record_date: item.record_date
        });
        fncExit();
    }

    // 페이지네이션 버튼 클릭
    const handlePageClick = (num) => {
        setPageNum(num);
    };

    // 아이디 검색
    const getData = async () => {
        const res = await Axios.GET(`worker/total/simple?page_num=${pageNum}&row_size=${rowSize}&search_start_time=${searchStartTime}&jno=${project.jno}&retry_search=${retrySearchText}`);
        
        if (res?.data?.result === "Success") {
            setData(res?.data?.values?.list);
            setCount(res?.data?.values?.count);
        }
    };

    const {
        isSearchInit,
        handleRetrySearch,
        handleSearchInit,
    } = useTableSearch({ columns, getDataFunction: getData, retrySearchText, setRetrySearchText, pageNum, setPageNum, rowSize, setRowSize });
    

    /***** useEffect *****/

    // 상단 프로젝트 변경
    useEffect(() => {
        getData();
    }, [searchStartTime]);

    useEffect(() => {
        if(isOpen !== undefined && isOpen){
            setRetrySearchText("");
            getData();
        }
    }, [isOpen]);

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
                        <h2 style={{fontSize: "15px", color: "black", paddingLeft: "10px"}}>근로자 아이디 검색</h2>

                        <div onClick={handleExitScrollUnset} style={{ cursor: "pointer" }}>
                            <img src={Exit} style={{ width: "30px", paddingBottom: '0px', marginRight: "5px" }} alt="Exit" />
                        </div>
                    </div>

                    <div className="table-header">
                        <div className="table-header-left" style={{gap:"10px"}}>
                            <div>
                                조회날짜 <DateInput time={searchStartTime} setTime={setSearchStartTime}></DateInput>
                            </div>
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
                            noDataText={"검색한 아이디가 없습니다."}
                            onClickRow={handleRowClick}
                            styles={{width: "1290px"}}
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
    maxWidth: '1300px',
    width: '95%',
    maxHeight: '650px',
    height: '90%',
    boxShadow: '15px 15px 1px rgba(0, 0, 0, 0.3)',
    margin: '10px',
};

export default SearchWorkerModal;