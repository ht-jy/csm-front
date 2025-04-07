import { useState, useEffect, useMemo } from "react";
import { Axios } from "../../../utils/axios/Axios";
import Table from "../Table";
import PaginationWithCustomButtons from "../PaginationWithCustomButtons ";
import useTableControlState from "../../../utils/hooks/useTableControlState";
import useTableSearch from "../../../utils/hooks/useTableSearch";
import Search from "../search/Search";
import Button from "../Button";
import Exit from "../../../assets/image/exit.png";

/**
 * @description: 현장근태에 등록되지 않은 프로젝트를 조회하기 위한 모달. 현장추가를 할때 사용되고 있음.
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-03-31
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - 
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /project/non-used (현장근태에 등록되지 않은 프로젝트 조회)
 */
const NonUsedProjectModal = ({isOpen=false, fncExit, onClickRow}) => {

    const [data, setData] = useState([]);
    const [count, setCount] = useState(0);

    const columns = useMemo(() => [
        { isSearch: true, isOrder: true, isSlide: false, width: "50px", header: "프로젝트 번호", itemName: "jno", bodyAlign: "center", isEllipsis: false, isDate: false },
        { isSearch: true, isOrder: true, isSlide: false, width: "70px", header: "프로젝트 코드", itemName: "job_no", bodyAlign: "center", isEllipsis: true, isDate: false },
        { isSearch: true, isOrder: true, isSlide: false, width: "120px", header: "프로젝트 이름", itemName: "job_name", bodyAlign: "left", isEllipsis: true, isDate: false },
        { isSearch: true, isOrder: true, isSlide: false, width: "50px", header: "착수년도", itemName: "job_year", bodyAlign: "center", isEllipsis: false, isDate: false },
        { isSearch: true, isOrder: true, isSlide: false, width: "50px", header: "시작일", itemName: "job_sd", bodyAlign: "center", isEllipsis: false, isDate: false },
        { isSearch: true, isOrder: true, isSlide: false, width: "50px", header: "종료일", itemName: "job_ed", bodyAlign: "center", isEllipsis: false, isDate: false },
        { isSearch: true, isOrder: true, isSlide: false, width: "50px", header: "PM", itemName: "job_pm_nm", bodyAlign: "center", isEllipsis: false, isDate: false, addItem: "duty_name" },
    ], []);

    // 검색 옵션
    const searchOptions = [
        { value: "ALL", label: "전체" },
        { value: "JNO", label: "프로젝트 번호" },
        { value: "JOB_NO", label: "프로젝트 코드" },
        { value: "JOB_NAME", label: "프로젝트 이름" },
    ];

    const { pageNum, setPageNum, rowSize, setRowSize, order, setOrder, rnumOrder, setRnumOrder, retrySearchText, setRetrySearchText } = useTableControlState(10);

    // 종료 이벤트
    const handleExitScrollUnset = (e) => {
        document.body.style.overflow = 'unset';
        fncExit();
    }

    // 테이블 리스트 클릭
    const handleRowClick = (item) => {
        onClickRow(item);
        fncExit();
    }

    // 프로젝트 조회
    const getData = async () => {
        const res = await Axios.GET(`/project/non-used?page_num=${pageNum}&row_size=${rowSize}&order=${order}&rnum_order=${rnumOrder}&retry_search=${retrySearchText}&jno=${searchValues.jno}&job_no=${searchValues.job_no}&job_name=${searchValues.job_name}&job_year=${searchValues.job_year}&job_sd=${searchValues.job_sd}&job_ed=${searchValues.job_ed}&job_pm_nm=${searchValues.job_pm_nm}`);
        
        if (res?.data?.result === "Success") {
            setData(res?.data?.values?.list);
            setCount(res?.data?.values?.count);
        }
    };

    const {
        searchValues,
        isSearchInit,
        activeSearch,
        isSearchReset,
        setActiveSearch,
        handleRetrySearch,
        handleSearchInit,
        handlePageClick,
        handleTableSearch,
        handleSearchChange,
        handleSortChange,
    } = useTableSearch({ columns, getDataFunction: getData, retrySearchText, setRetrySearchText, pageNum, setPageNum, rowSize, setRowSize, order, setOrder, rnumOrder, setRnumOrder });

    /***** useEffect *****/

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
                        <h2 style={{fontSize: "15px", color: "black", paddingLeft: "10px"}}>프로젝트 검색</h2>

                        <div onClick={handleExitScrollUnset} style={{ cursor: "pointer" }}>
                            <img src={Exit} style={{ width: "30px", paddingBottom: '0px', marginRight: "5px" }} alt="Exit" />
                        </div>
                    </div>

                    <div className="table-header">
                        <div className="table-header-left" style={{gap:"10px"}}>
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
                            searchValues={searchValues}
                            onSearch={handleTableSearch}
                            onSearchChange={handleSearchChange}
                            activeSearch={activeSearch}
                            setActiveSearch={setActiveSearch}
                            resetTrigger={isSearchReset}
                            onSortChange={handleSortChange}
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

export default NonUsedProjectModal;