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
const PaginationWithCustomButtons = ({ dataCount, fncClickPageNum }) => {
    const [pageNum, setPageNum] = useState(0);
    const [pageCount, setPageCount] = useState();
    const [pageRange, setPageRange] = useState(window.innerWidth >= 720 ? 10 : 5);

    const handlePageClick = ({ selected }) => {
        setPageNum(selected);
        fncClickPageNum(selected + 1);
    };

    const goToFirstPage = () => {
        setPageNum(0);
        fncClickPageNum(0);
    };

    const goToLastPage = () => {
        setPageNum(pageCount - 1);
        fncClickPageNum(pageCount - 1);
    };

    useEffect(() => {
        const handleResize = () => {
            setPageRange(window.innerWidth >= 720 ? 10 : 5);
        };

        window.addEventListener("resize", handleResize);

        // 메모리 누수 방지를 위한 클린업
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    useEffect(() => {
        setPageCount(Math.ceil(dataCount / 10));
    }, [dataCount]);

    return (
        <div className="pagination-wrapper">
            {/* 왼쪽 정렬 텍스트 */}
            <div className="pagination-info">
                Pages: <span style={{ color: "#ff5555" }}>{pageNum + 1}</span> - {pageCount} / Rows: {dataCount}
            </div>

            {/* 부모 컨테이너 기준 중앙 정렬 페이지네이션 */}
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
                    previousLabel={"<"}
                    nextLabel={">"}
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
        </div>
    );
};

export default PaginationWithCustomButtons;
