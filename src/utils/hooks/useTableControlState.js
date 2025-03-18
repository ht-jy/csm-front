import { useState } from "react";

/**
 * @description: 테이블에 사용되는 현재페이지번호, 리스트개수, 정렬을 관리하는 훅
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-27
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 */
const useTableControlState = (row) => {
    const [pageNum, setPageNum] = useState(1);
    const [rowSize, setRowSize] = useState(row);
    const [order, setOrder] = useState("");
    const [retrySearchText, setRetrySearchText] = useState("");

    return { pageNum, setPageNum, rowSize, setRowSize, order, setOrder, retrySearchText, setRetrySearchText };
};

export default useTableControlState;
