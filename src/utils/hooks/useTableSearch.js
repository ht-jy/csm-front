import { useState, useEffect, useRef } from "react";

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
const useTableSearch = ({ columns = [], getDataFunction, getDataValue, retrySearchText, setRetrySearchText, pageNum, setPageNum, rowSize, setRowSize, order, setOrder, rnumOrder, setRnumOrder, setEditList, isOpen = true }) => {
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

    // 테이블 검색어 없을시 초기화 버튼 숨기기
    const searchValuesEmpty = () => {
        let nonEmptyArr = [];
        for (let key in searchValues) {
            if(searchValues[key] !== ""){
                nonEmptyArr.push(key);
            }
        }
        
        if(nonEmptyArr.length === 0){
            return true;
        }
        return false;
    }

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
        
        if(searchValuesEmpty()) {
            setIsSearchInit(false);
        }
    };

    // 통합 검색
    const handleRetrySearch = (text) => {
        setIsSearchInit(true);
        if(setRetrySearchText !== undefined){
            setRetrySearchText(text);
            if(text === ""){
                setIsSearchInit(false);
            }
        }
        
    }

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
        if(setOrder !== undefined){
            setOrder("")
        }
        if(setRetrySearchText !== undefined){
            setRetrySearchText("")
        }
    };

    // 테이블 정렬 변경시 이벤트
    const handleSortChange = (newOrder) => {
        // order 문자열 분리
        const tokens = newOrder.split(',').map(token => token.trim());
        if (tokens.length === 0){
            if(setOrder !== undefined){
                setOrder("");
            }
            if(typeof setRnumOrder === 'function'){
                setRnumOrder("ASC")
            }            
        }
        // rnum을 제거한 정렬 문자열
        const nonRnumOrders = tokens.filter(token => !/^RNUM\s+(ASC|DESC)$/i.test(token));
        if(nonRnumOrders.length === 0){
            if(setOrder !== undefined){
                setOrder("");
            }
        }else{
            if(setOrder !== undefined){
                setOrder(nonRnumOrders.join(', '));
            }
        }        

        // rnum 정렬값 추출
        if(typeof setRnumOrder === 'function'){
            const rnumToken = tokens.find(token => /^RNUM\s+(ASC|DESC)$/i.test(token));
            if (rnumToken) {
                const match = rnumToken.match(/^RNUM\s+(ASC|DESC)$/i);
                setRnumOrder(match ? match[1].toUpperCase() : "ASC");
            }else{
                setRnumOrder("ASC")
            }        
        }
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

    // 테이블 수정/추가 리스트
    const handleEditList = (value) => {
        setEditList(value);
    }
    
    /***** useEffect *****/

    // 페이지 숫자, 리스트 수, 정렬 또는 호출 상태값 변경시 데이터 호출
    useEffect(() => {
        if (isOpen) {
            if (getDataFunction) {
                if (typeof getDataValue !== "undefined") {
                    getDataFunction(getDataValue);
                } else {
                    getDataFunction();
                }
            }
        }
    }, [getDataValue, retrySearchText, pageNum, rowSize, order, rnumOrder, isOpen]);

    // 초기화 버튼 클릭
    // const calledRef = useRef(false);
    useEffect(() => {
        // if (isSearchReset && !calledRef.current) {
        if (isSearchReset) {
            if (getDataFunction) {
                if (typeof getDataValue !== "undefined") {
                    getDataFunction(getDataValue);
                } else {
                    getDataFunction();
                }
            }
            // calledRef.current = true;
            setIsSearchReset(false);
        }        
    }, [isSearchReset]);

    return { 
        searchValues,
        activeSearch, setActiveSearch, 
        isSearchReset,
        isSearchInit,
        handleTableSearch,
        handleRetrySearch,
        handleSearchChange,
        handleSearchInit,
        handleSortChange,
        handleSelectChange,
        handlePageClick,
        handleEditList,
    };
};

export default useTableSearch;