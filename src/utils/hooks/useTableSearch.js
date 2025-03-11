import { useState, useEffect } from "react";

/**
 * @description: 테이블 조회, 검색, 정렬 등의 이벤트 중에서 반복되는 코드를 모아 놓은 커스텀 훅
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-28
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - 
 * 
 * @additionalInfo
 * - props
 *   columns = []: 테이블 설정리스트
 *   getDataFunction: 테이블 조회 함수
 *   getDataValue: 테이블 조회시 필요한 매개변수(필요할 때만 사용)
 *   pageNum: 페이지번호
 *   setPageNum: 페이지번호 setter
 *   rowSize: 테이블 리스트 수
 *   setRowSize: 테이블 리스트 수 setter
 *   order: 정렬 문자열 값
 *   setOrder: 정렬 문자열 값 stter
 */
const useTableSearch = ({ columns = [], getDataFunction, getDataValue, retrySearchText, pageNum, setPageNum, rowSize, setRowSize, order, setOrder }) => {
    // 기본 검색값 초기화: isSearch가 true인 컬럼에 대해 빈 문자열 할당
    const defaultSearchValues = columns.reduce((acc, col) => {
        if (col.isSearch) acc[col.itemName] = "";
        return acc;
    }, {});

    // 초기 액티브 검색 상태: isSearch가 true인 컬럼에 대해 false 할당
    const initialActiveSearch = columns.reduce((acc, col) => {
        if (col.isSearch) acc[col.itemName] = false;
        return acc;
    }, {});

    const [searchValues, setSearchValues] = useState(defaultSearchValues); // 검색한 단어 관리
    const [activeSearch, setActiveSearch] = useState(initialActiveSearch); // 검색창 활성화 플래그
    const [isSearchReset, setIsSearchReset] = useState(false);  // 검색된 단어 초기화 플래그
    const [isSearchInit, setIsSearchInit] = useState(false);    // 초기화 버튼 플래그(검색)

    // 테이블 검색
    const handleTableSearch = () => {
        setIsSearchInit(true);
        if (getDataFunction) {
            if (typeof getDataValue !== "undefined") {
                getDataFunction(getDataValue);
            } else {
                getDataFunction();
            }
        }
    };

    // 테이블 검색 단어 갱신
    const handleSearchChange = (field, value) => {
        setSearchValues(prev => ({
            ...prev, 
            [field]: value 
        }));
    };
    
    // 테이블 초기화
    const handleSearchInit = () => {
        setSearchValues(defaultSearchValues);
        setActiveSearch(columns.reduce((acc, col) => { 
            if (col.isSearch) acc[col.itemName] = false; 
            return acc; 
        }, {})); // 검색창 닫기

        setIsSearchInit(false);
        setIsSearchReset(true);
        setOrder("")
    };

    // 테이블 정렬 변경시 이벤트
    const handleSortChange = (newOrder) => {
        setOrder(newOrder);
    }

    // 테이블 리스트 수 셀렉트 박스 변경
    const handleSelectChange = (e) => {
        setRowSize(e.value);
        setPageNum(1);
    };

    // 페이지네이션 버튼 클릭
    const handlePageClick = (num) => {
        setPageNum(num);
    };

    // 페이지 숫자, 리스트 수, 정렬 또는 호출 상태값 변경시 데이터 호출
    useEffect(() => {
        if (getDataFunction) {
            if (typeof getDataValue !== "undefined") {
                getDataFunction(getDataValue);
            } else {
                getDataFunction();
            }
        }
    }, [getDataValue, retrySearchText, pageNum, rowSize, order]);

    // 테이블 단어 검색시 이벤트
    useEffect(() => {
        if (isSearchReset) {
            if (getDataFunction) {
                if (typeof getDataValue !== "undefined") {
                    getDataFunction(getDataValue);
                } else {
                    getDataFunction();
                }
            }
            setIsSearchReset(false);
        }
    }, [isSearchReset]);

    return { 
        searchValues,
        activeSearch, setActiveSearch, 
        isSearchReset,
        isSearchInit,
        handleTableSearch,
        handleSearchChange,
        handleSearchInit,
        handleSortChange,
        handleSelectChange,
        handlePageClick,
    };
};

export default useTableSearch;