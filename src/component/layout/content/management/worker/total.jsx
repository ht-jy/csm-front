import { useState, useEffect, useReducer } from "react";
import Select from 'react-select';
import Calendar from "react-calendar";
import { Axios } from "../../../../../utils/axios/Axios";
import { dateUtil } from "../../../../../utils/DateUtil";
import TotalReducer from "./TotalReducer";
import Loading from "../../../../module/Loading";
import Modal from "../../../../module/Modal";
import Table from "../../../../module/Table";
import Button from "../../../../module/Button";
import PaginationWithCustomButtons from "../../../../module/PaginationWithCustomButtons ";
import "react-calendar/dist/Calendar.css";
import "../../../../../assets/css/Table.css";
import "../../../../../assets/css/Paginate.css";
import "../../../../../assets/css/Calendar.css";


/**
 * @description: 전체 근로자 관리
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-17
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - PaginationWithCustomButtons: 페이지 버튼
 * - Select: 셀렉트 박스
 * - Loading: 로딩 스피너
 * - Modal: 알림 모달
 * - Calendar: 캘린더
 * - Table: 테이블
 * - Button: 버튼
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /worker/total (전체근로자 조회)
 */

const Total = () => {
    const [state, dispatch] = useReducer(TotalReducer, {
        list: [],
        count: 0,
        initialList: [],
    });

    const [pageNum, setPageNum] = useState(1);
    const [rowSize, setRowSize] = useState(10);
    const [order, setOrder] = useState("");
    const [searchTime, setSearchTime] = useState(dateUtil.now());
    const [showCalendar, setShowCalendar] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isModal, setIsModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalText, setModalText] = useState("");
    const [isSearchReset, setIsSearchReset] = useState(false);
    const [isSearchInit, setIsSearchInit] = useState(false);

    const columns = [
        { isSearch: false, isOrder: false, width: "70px", header: "순번", itemName: "row_num", bodyAlign: "center", isEllipsis: false, isDate: false },
        { isSearch: true, isOrder: true, width: "210px", header: "부서/조직명", itemName: "department", bodyAlign: "left", isEllipsis: false, isDate: false },
        { isSearch: true, isOrder: true, width: "190px", header: "근로자 이름", itemName: "user_nm", bodyAlign: "left", isEllipsis: false, isDate: false },
        { isSearch: true, isOrder: true, width: "480px", header: "현장이름", itemName: "site_nm", bodyAlign: "left", isEllipsis: true, isDate: false },
        { isSearch: true, isOrder: true, width: "480px", header: "프로젝트명", itemName: "job_name", bodyAlign: "left", isEllipsis: true, isDate: false },
        { isSearch: false, isOrder: true, width: "140px", header: "출근시간", itemName: "in_recog_time", bodyAlign: "center", isEllipsis: false, isDate: true, dateFormat: "formatWithTime"},
        { isSearch: false, isOrder: true, width: "140px", header: "퇴근시간", itemName: "out_recog_time", bodyAlign: "center", isEllipsis: false, isDate: true, dateFormat: "formatWithTime" }
    ];

    const defaultSearchValues = columns.reduce((acc, col) => {
        if (col.isSearch) acc[col.itemName] = ""; 
        return acc;
    }, {});

    const [searchValues, setSearchValues] = useState(defaultSearchValues);
    const [activeSearch, setActiveSearch] = useState(
        columns.reduce((acc, col) => { 
            if (col.isSearch) acc[col.itemName] = false; 
            return acc; 
        }, {})
    );
    

    const options = [
        { value: 5, label: "5줄 보기" },
        { value: 10, label: "10줄 보기" },
        { value: 15, label: "15줄 보기" },
        { value: 20, label: "20줄 보기" },
    ];

    // 페이지네이션 버튼 클릭
    const onClickPageBtn = (num) => {
        setPageNum(num);
    }

    // 리스트 개수 select 선택
    const onChangeSelect = (e) => {
        setRowSize(e.value);
        setPageNum(1);
    };

    // 날짜 선택 시 캘린더 숨기기
    const handleDateChange = (date) => {
        setSearchTime(dateUtil.format(date));
        setShowCalendar(false);
    };

    // 테이블 검색 단어 갱신
    const handleSearchChange = (field, value) => {
        setSearchValues(prev => ({
            ...prev, 
            [field]: value 
        }));
    };

    // 테이블 검색
    const handleTableSearch = () => {
        setIsSearchInit(true);
        getData();
    };

    // 테이블 검색 초기화
    const onClickSearchInit = () => {
        setSearchValues(defaultSearchValues); // 검색값 초기화
        setActiveSearch(columns.reduce((acc, col) => { 
            if (col.isSearch) acc[col.itemName] = false; 
            return acc; 
        }, {})); // 검색창 닫기

        setIsSearchInit(false);
        setIsSearchReset(true);
    };

    // 테이블 정렬 변경시 이벤트
    const handleSortChange = (newOrder) => {
        setOrder(newOrder);
    }

    // 전체근로자 조회
    const getData = async () => {
        setIsLoading(true);
        
        const res = await Axios.GET(`/worker/total?page_num=${pageNum}&row_size=${rowSize}&order=${order}&search_time=${searchTime}&site_nm=${searchValues.site_nm}&job_name=${searchValues.job_name}&user_nm=${searchValues.user_nm}&department=${searchValues.department}`);
        
        if (res?.data?.result === "Success") {
            dispatch({ type: "INIT", list: res?.data?.values?.list, count: res?.data?.values?.count });
        }

        setIsLoading(false);
    };

    // 페이지, 리스트 수, 검색날짜, 정렬 변경시
    useEffect(() => {
        getData();
    }, [pageNum, rowSize, searchTime, order]);

    // 테이블 단어 검색시
    useEffect(() => {
        if (isSearchReset) {
            getData();
            setIsSearchReset(false);
        }
    }, [isSearchReset]);

    return(
        <div>
            <Loading isOpen={isLoading} />
            <Modal 
                isOpen={isModal}
                title={modalTitle}
                text={modalText}
                confirm={"확인"}
                fncConfirm={() => setIsModal(false)}
            />
            <div>
                <div className="container-fluid px-4">
                    <h2 className="mt-4">전체 근로자</h2>
                    <ol className="breadcrumb mb-4">
                        <img className="breadcrumb-icon" src="/assets/img/icon-house.png" />
                        <li className="breadcrumb-item active">관리 메뉴</li>
                        <li className="breadcrumb-item active">전체 근로자</li>
                    </ol>

                    <div className="table-header">
                        <div className="table-header-left" style={{gap:"10px"}}>
                            <Select
                                onChange={onChangeSelect}
                                options={options}
                                defaultValue={options.find(option => option.value === rowSize)}
                                placeholder={"몇줄 보기"}
                            />

                            <div className="calendar-wrapper">
                                <p
                                    onClick={() => setShowCalendar((prev) => !prev)}
                                    className="selected-date"
                                >
                                    선택한 날짜: <b>{searchTime}</b>
                                </p>
                                {showCalendar && (
                                    <div className="calendar-popup">
                                        <Calendar 
                                            onChange={handleDateChange} 
                                            value={searchTime} 
                                            locale="ko" 
                                            calendarType="hebrew" 
                                            tileClassName={({ date, view }) => {
                                                if (view !== 'month') return; // 달력에서만 적용
                                                const day = date.getDay(); // 0: 일요일, 6: 토요일

                                                if (date.getMonth() !== dateUtil.parseToDate(searchTime).getMonth()) {
                                                    return "neighboring-month"; // 이전/다음 달은 회색
                                                }

                                                if (day === 0) return "sunday"; // 일요일
                                                if (day === 6) return "saturday"; // 토요일
                                                else return "default";
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="table-header-right">
                            {
                                isSearchInit ? <Button text={"초기화"} onClick={onClickSearchInit} /> : null
                            }                            
                        </div>
                    </div>
                    
                    <div className="table-wrapper">
                        <div className="table-container">
                            <Table 
                                columns={columns} 
                                data={state.list} 
                                searchValues={searchValues}
                                onSearch={handleTableSearch} 
                                onSearchChange={handleSearchChange} 
                                activeSearch={activeSearch} 
                                setActiveSearch={setActiveSearch} 
                                resetTrigger={isSearchReset}
                                onSortChange={handleSortChange}
                            />
                        </div>
                    </div>

                    <div>
                        <PaginationWithCustomButtons 
                            dataCount={state.count}
                            fncClickPageNum={onClickPageBtn}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Total;