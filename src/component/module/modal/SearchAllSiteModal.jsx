import { useState, useEffect } from "react";
import { Axios } from "../../../utils/axios/Axios"; 
import Exit from "../../../assets/image/exit.png";
import Table from "../Table";
import PaginationWithCustomButtons from "../PaginationWithCustomButtons";
import Button from "../Button";
import useTableControlState from "../../../utils/hooks/useTableControlState";
import useTableSearch from "../../../utils/hooks/useTableSearch";

/**
 * @description: 전체 현장을 선택할 수 있는 모달
 * 
 * @author 작성자: 정지영
 * @created 작성일: 2025-04-23
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - Table 테이블
 * - ReactPaginate 페이지네이션
 * - Button 버튼
 * - useTableControlState 테이블 state 커스텀 훅
 * - useTableSearch 테이블 이벤트 커스텀 훅
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /site/nm (장소명 조회)
 */
const SearchAllSiteModal = ({isOpen, fncExit, onClickRow, nonSite}) => {
    const [data, setData] = useState([]);
    const [count, setCount] = useState(0);

    // 테이블 설정
    const columns = [
        { isSearch: true, isOrder: true, isSlide: false, width: "100px", header: "SNO", itemName: "sno", bodyAlign: "center", isEllipsis: false, isDate: false, type: "number" },
        { isSearch: true, isOrder: true, isSlide: false, width: "150px", header: "지역", itemName: "loc_name", bodyAlign: "center", isEllipsis: true, isDate: false },
        { isSearch: true, isOrder: true, isSlide: false, width: "540px", header: "현장이름", itemName: "site_nm", bodyAlign: "left", isEllipsis: true, isDate: false },
        { isSearch: true, isOrder: true, isSlide: false, width: "500px", header: "비고", itemName: "etc", bodyAlign: "left", isEllipsis: true, isDate: false },
       ];

    // 테이블 조작 커스텀 훅
    const { pageNum, setPageNum, rowSize, setRowSize, order, setOrder } = useTableControlState(10);

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

    // 전체 현장 조회
    const getData = async () => {

        const res = await Axios.GET(`/site/nm?non_site=${nonSite ? 1 : 0}&page_num=${pageNum}&row_size=${rowSize}&order=${order}&sno=${searchValues.sno}&site_nm=${searchValues.site_nm}&loc_name=${searchValues.loc_name}&etc=${searchValues.etc}`);
        if(res?.data?.result === "Success"){
            setData(res?.data?.values?.list);
            setCount(res?.data?.values?.count);            
        }
    };

    // 테이블 조회, 검색, 정렬 이벤트 
    const { 
        searchValues,
        activeSearch, setActiveSearch, 
        isSearchReset,
        isSearchInit,
        handleTableSearch,
        handleSearchChange,
        handleSearchInit,
        handleSortChange,
        handlePageClick,
    } = useTableSearch({columns, getDataFunction: getData, pageNum, setPageNum, rowSize, order, setOrder});

    // 모달 오픈시 메인 화면 스크롤 정지
    useEffect(() => {
        if (isOpen) {

            // 데이터 조회
            getData()

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

    return(
        <div>
            {
                isOpen ?
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: "#ddd", borderRadius: "5px", height: "40px" }}>
                            <h2 style={{fontSize: "15px", color: "black", paddingLeft: "10px"}}>현장 선택</h2>

                            <div onClick={handleExitScrollUnset} style={{ cursor: "pointer" }}>
                                <img src={Exit} style={{ width: "30px", paddingBottom: '0px', marginRight: "5px" }} alt="Exit" />
                            </div>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', borderRadius: "5px", border: "solid #aaa 1px", padding: "5px 10px", marginTop: "5px", height:"50px"}}>
                            <div style={{marginLeft: "auto"}}>
                                {  isSearchInit || order !== "" ? <Button text={"초기화"} onClick={handleSearchInit}/> : null}
                            </div>
                        </div>                    

                        <div style={{ 
                            width: '100%', 
                            height: 'calc(100% - 120px)',  // 버튼과 라디오 영역을 제외한 높이
                            overflowX: 'auto',            // 가로 스크롤
                            overflowY: 'auto',            // 세로 스크롤
                            marginTop: "5px",
                        }}>
                            <Table
                                columns={columns} 
                                data={data}
                                noDataText={"선택된 프로젝트가 없습니다."}
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

                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
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
                : 
                <></>
            }
        </div>
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

export default SearchAllSiteModal;