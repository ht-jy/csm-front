import React, { useEffect, useState } from "react";
import ReactPaginate from "react-paginate";
import "../../assets/css/Paginate.css";

/**
 * @description: 
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-26
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - react-paginate
 * 
 * @additionalInfo
 * - dataCount: 리스트 전체 개수, fncClickPageNum: 숫자 또는 화살표 버튼 클릭시 실행 함수
 */
const PaginationWithCustomButtons = ({ dataCount, rowSize=10, fncClickPageNum }) => {
    const [pageNum, setPageNum] = useState(0);
    const [pageCount, setPageCount] = useState(0);
    const [pageRange, setPageRange] = useState(window.innerWidth >= 720 ? 10 : 5);

    // 버튼 클릭
    const handlePageClick = ({ selected }) => {
        setPageNum(selected);
        fncClickPageNum(selected + 1);
    };

    // 이전 버튼 커스텀 핸들러: 10페이지 뒤로 점프
const handlePrevClick = (e) => {
    // 기본 이벤트 막기
    e.preventDefault();
    e.stopPropagation();
    const newPage = Math.max(pageNum - 10, 0);
    setPageNum(newPage);
    fncClickPageNum(newPage + 1);
  };
  
  // 다음 버튼 커스텀 핸들러: 10페이지 앞으로 점프
  const handleNextClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newPage = Math.min(pageNum + 10, pageCount - 1);
    setPageNum(newPage);
    fncClickPageNum(newPage + 1);
  };

    // 첫번째 페이지로 이동
    const goToFirstPage = () => {
        setPageNum(0);
        fncClickPageNum(1);
    };

    // 마지막 페이지로 이동
    const goToLastPage = () => {
        setPageNum(pageCount - 1);
        fncClickPageNum(pageCount);
    };

    // 화면 크기가 720px 이하로 내려가면 숫자버튼 개수를 5개로 변경
    useEffect(() => {
        const handleResize = () => {
            setPageRange(window.innerWidth >= 720 ? 10 : 5);
        };

        window.addEventListener("resize", handleResize);

        // 메모리 누수 방지를 위한 클린업
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    // 데이터개수, 보여줄 리스트 수 변경시 실행
    useEffect(() => {
        if(dataCount !== undefined){
            setPageCount(dataCount > 0 ? Math.ceil(dataCount / rowSize) : 0);
        }
    }, [dataCount, rowSize]);

    // 보여줄 리스트 수 변경시 첫번째 페이지로 이동
    useEffect(() => {
        setPageNum(0);
        fncClickPageNum(1);
    }, [rowSize]);

    return (
        <div className="pagination-wrapper">
            {/* 왼쪽 정렬 텍스트 */}
            <div className="pagination-info">
                Pages: <span style={{ color: "#ff5555" }}>{pageNum + 1}</span> - {pageCount} / Rows: {dataCount}
            </div>

            {
                pageCount > 0 && (
                    // 부모 컨테이너 기준 중앙 정렬 페이지네이션
                    <div className="pagination-container">
                        <button
                            onClick={goToFirstPage}
                            disabled={pageNum === 0}
                            className={`custom-nav-btn ${pageNum === 0 ? "disabled" : ""}`}
                        >
                            {"<<"}
                        </button>

                        <ReactPaginate
                            forcePage={pageNum}
                            previousLabel={<span onClick={handlePrevClick}>{"<"}</span>}
                            nextLabel={<span onClick={handleNextClick}>{">"}</span>}
                            breakLabel={null}
                            pageCount={pageCount}
                            pageRangeDisplayed={pageRange}
                            marginPagesDisplayed={0}
                            onPageChange={handlePageClick}
                            containerClassName={"pagination"}
                            activeClassName={"active"}
                            disabledClassName={"disabled"}
                            renderOnZeroPageCount={null}
                        />

                        <button
                            onClick={goToLastPage}
                            disabled={pageNum === pageCount - 1}
                            className={`custom-nav-btn ${pageNum === pageCount - 1 ? "disabled" : ""}`}
                        >
                            {">>"}
                        </button>
                    </div>
                )
            }
            
        </div>
    );
};

export default PaginationWithCustomButtons;
