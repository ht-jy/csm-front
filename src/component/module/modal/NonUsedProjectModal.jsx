import { useState, useEffect, useMemo } from "react";
import { Axios } from "../../../utils/axios/Axios";
import Table from "../Table";
import PaginationWithCustomButtons from "../PaginationWithCustomButtons";
import useTableControlState from "../../../utils/hooks/useTableControlState";
import useTableSearch from "../../../utils/hooks/useTableSearch";
import Search from "../search/Search";
import Button from "../Button";
import Exit from "../../../assets/image/exit.png";
import Radio from "../Radio";
import Loading from "../Loading";

/**
 * @description: 현장근태에 등록되지 않은 프로젝트를 조회하기 위한 모달. 현장추가를 할때 사용되고 있음.
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-03-31
 * @modified 최종 수정일: 2025-07-25
 * @modifiedBy 최종 수정자: 김진우
 * @modified Description
 * 2025-07-21: 프로젝트 코드별 라디오버튼 추가 
 * 2025-07-25: 검색 데이터 초기화/모달 오픈시 api요청 n번 안되도록 수정, 상위컴포넌트 오픈시 api요청 안되도록 수정(현재 컴포넌트 오픈시에 호출), 데이터 조회중 대기 로딩 추가
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /project/non-reg (현장근태에 등록되지 않은 프로젝트 조회), /project/non-reg/{type} (현장근태에 등록되지 않은 프로젝트 조회)
 */
const NonUsedProjectModal = ({isOpen=false, fncExit, onClickRow}) => {

    // 라디오버튼에 따라 데이터 저장
    const [data, setData] = useState([]);
    const [selectedValue, setSelectedValue] = useState("1");
    const [isLoading, setIsLoading] = useState(false);

    const [count, setCount] = useState(0);

    const columns = useMemo(() => [
        { isSearch: true, isOrder: true, isSlide: true, width: "30px", header: "JNO", itemName: "jno", bodyAlign: "center", isEllipsis: false, isDate: false, type: "fill-number", fillLen: 5 },
        { isSearch: true, isOrder: true, isSlide: false, width: "70px", header: "JOB No.", itemName: "job_no", bodyAlign: "center", isEllipsis: true, isDate: false },
        { isSearch: true, isOrder: true, isSlide: false, width: "70px", header: "End-User", itemName: "comp_name", bodyAlign: "center", isEllipsis: true, isDate: false },
        { isSearch: true, isOrder: true, isSlide: false, width: "70px", header: "Client", itemName: "order_comp_name", bodyAlign: "center", isEllipsis: true, isDate: false },
        { isSearch: true, isOrder: true, isSlide: false, width: "150px", header: "프로젝트명", itemName: "job_name", bodyAlign: "left", isEllipsis: true, isDate: false },
        { isSearch: true, isOrder: true, isSlide: false, width: "50px", header: "PM", itemName: "job_pm_nm", bodyAlign: "center", isEllipsis: false, isDate: false, addItem: "duty_name" },
        { isSearch: true, isOrder: true, isSlide: false, width: "50px", header: "시작일", itemName: "job_sd", bodyAlign: "center", isEllipsis: false, isDate: false },
        { isSearch: true, isOrder: true, isSlide: false, width: "50px", header: "종료일", itemName: "job_ed", bodyAlign: "center", isEllipsis: false, isDate: false },
        { isSearch: true, isOrder: true, isSlide: true, width: "40px", header: "진행현황", itemName: "cd_nm", bodyAlign: "center", isEllipsis: true, isDate: false },
    ], []);

    // 검색 옵션
    const searchOptions = [
        { value: "ALL", label: "전체" },
        { value: "JNO", label: "프로젝트 번호" },
        { value: "JOB_NO", label: "프로젝트 코드" },
        { value: "JOB_NAME", label: "프로젝트명" },
    ];

    const { pageNum, setPageNum, rowSize, setRowSize, order, setOrder, rnumOrder, setRnumOrder, retrySearchText, setRetrySearchText } = useTableControlState(10);

    // 라디오 버튼 클릭
    const handleRadioChange = (event) => {
        setSelectedValue(event.target.value);
        setPageNum(1);
        handleSearchInit();
 
    }

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
    /* E: 설계, P: 구매, C: 공사, T: EPC전체(TurnKey) */
    const getData = (value) => {
        if(value === "1"){ // 전체
            getAllData();
        }else if (value === "2") { // T
            getFilterData("T");
        } else if (value === "3") { // C
            getFilterData("C");
        }
    }

    // 모든 데이터 조회
    const getAllData = async () => {
        try{
            setIsLoading(true);
            const res = await Axios.GET(`/project/non-reg?page_num=${pageNum}&row_size=${rowSize}&order=${order}&rnum_order=${rnumOrder}&retry_search=${retrySearchText}&jno=${searchValues.jno}&job_no=${searchValues.job_no}&job_name=${searchValues.job_name}&job_year=${searchValues.job_year}&job_sd=${searchValues.job_sd}&job_ed=${searchValues.job_ed}&job_pm_nm=${searchValues.job_pm_nm}`);

            if (res?.data?.result === "Success") {
                setData(res?.data?.values?.list);
                setCount(res?.data?.values?.count);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // T or E 데이터만 조회
    const getFilterData = async (type) => {
        try{
            setIsLoading(true);
            const res = await Axios.GET(`/project/non-reg/${type}?page_num=${pageNum}&row_size=${rowSize}&order=${order}&rnum_order=${rnumOrder}&retry_search=${retrySearchText}&jno=${searchValues.jno}&job_no=${searchValues.job_no}&job_name=${searchValues.job_name}&job_year=${searchValues.job_year}&job_sd=${searchValues.job_sd}&job_ed=${searchValues.job_ed}&job_pm_nm=${searchValues.job_pm_nm}`);

            if (res?.data?.result === "Success") {
                setData(res?.data?.values?.list);
                setCount(res?.data?.values?.count);
            }
        } finally {
            setIsLoading(false);
        }

    }

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
    } = useTableSearch({ columns, getDataFunction: getData, getDataValue: selectedValue, retrySearchText, setRetrySearchText, pageNum, setPageNum, rowSize, setRowSize, order, setOrder, rnumOrder, setRnumOrder, isOpen });

    /***** useEffect *****/
    useEffect(() => {
        if(isOpen !== undefined && isOpen){
            handleSearchInit();
            // getData();
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
        <>
            <Loading
                isOpen={isLoading}
            />
            {
                isOpen !== null && isOpen ?
                    <div style={overlayStyle}>
                        <div style={modalStyle}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: "#ddd", borderRadius: "5px", height: "40px" }}>
                                <h2 style={{fontSize: "15px", color: "black", paddingLeft: "10px"}}>프로젝트 선택</h2>

                                <div onClick={handleExitScrollUnset} style={{ cursor: "pointer" }}>
                                    <img src={Exit} style={{ width: "30px", paddingBottom: '0px', marginRight: "5px" }} alt="Exit" />
                                </div>
                            </div>

                            <div className="table-header">
                                <div className="table-header-left" style={{gap:"1rem", marginLeft:"1rem"}}>
                                    <Radio text="전체(ALL)" value="1" name="group1" defaultChecked={selectedValue === "1"} onChange={handleRadioChange}/>
                                    <Radio text="EPC(T)" value="2" name="group1" defaultChecked={selectedValue === "2"} onChange={handleRadioChange}/>
                                    <Radio text="공사(C)" value="3" name="group1" defaultChecked={selectedValue === "3"} onChange={handleRadioChange}/>
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