import { useState, useEffect, useReducer } from "react";
import ReactPaginate from "react-paginate";
import Select from 'react-select';
import "../../../../../assets/css/Calendar.css";
import "../../../../../assets/css/Paginate.css";
import "../../../../../assets/css/Table.css";
import { Axios } from "../../../../../utils/axios/Axios";
import { dateUtil } from "../../../../../utils/DateUtil";
import Button from "../../../../module/Button";
import DateInput from "../../../../module/DateInput";
import Loading from "../../../../module/Loading";
import Modal from "../../../../module/Modal";
import Table from "../../../../module/Table";
import TotalReducer from "./TotalReducer";
import PaginationWithCustomButtons from "../../../../module/PaginationWithCustomButtons ";


/**
 * @description: 전체 근로자 관리
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-17
 * @modified 최종 수정일: 2025-02-27
 * @modifiedBy 최종 수정자: 정지영
 * @usedComponents
 * - PaginationWithCustomButtons: 페이지 버튼
 * - Select: 셀렉트 박스
 * - Loading: 로딩 스피너
 * - Modal: 알림 모달
 * - Table: 테이블
 * - Button: 버튼
 * - DateInput: 날짜입력
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /worker/total (전체근로자 조회)
 * 
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
    const [searchStartTime, setSearchStartTime] = useState(dateUtil.now());
    const [searchEndTime, setSearchEndTime] = useState(dateUtil.now());
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
        { isSearch: false, isOrder: true, width: "140px", header: "출근시간", itemName: "in_recog_time", bodyAlign: "center", isEllipsis: false, isDate: true, dateFormat: "formatWithTime" },
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

        const res = await Axios.GET(`/worker/total?page_num=${pageNum}&row_size=${rowSize}&order=${order}&search_start_time=${searchStartTime}&search_end_time=${searchEndTime}&site_nm=${searchValues.site_nm}&job_name=${searchValues.job_name}&user_nm=${searchValues.user_nm}&department=${searchValues.department}`);

        if (res?.data?.result === "Success") {
            dispatch({ type: "INIT", list: res?.data?.values?.list, count: res?.data?.values?.count });
        }

        setIsLoading(false);
    };

    // 페이지, 리스트 수, 검색날짜, 정렬 변경시
    useEffect(() => {
        getData();
    }, [pageNum, rowSize, searchStartTime, searchEndTime, order]);

    // 테이블 단어 검색시
    useEffect(() => {
        if (isSearchReset) {
            getData();
            setIsSearchReset(false);
        }
    }, [isSearchReset]);

    // 시작 날짜보다 끝나는 날짜가 빠를 시 : 끝나는 날짜를 변경한 경우 (시작 날짜를 끝나는 날짜로)
    useEffect(() => {
        if (searchStartTime > searchEndTime) {
            setSearchStartTime(searchEndTime)
        }
    }, [searchEndTime]);

    // 시작 날짜보다 끝나는 날짜가 빠를 시 : 시작 날짜를 변경한 경우 (끝나는 날짜를 시작 날짜로)
    useEffect(() => {
        if (searchStartTime > searchEndTime) {
            setSearchEndTime(searchStartTime)
        }
    }, [searchStartTime]);

    return (
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
                        <div className="table-header-left" style={{ gap: "10px" }}>
                            <Select
                                onChange={onChangeSelect}
                                options={options}
                                defaultValue={options.find(option => option.value === rowSize)}
                                placeholder={"몇줄 보기"}
                            />

                            <div className="m-2">
                                조회기간 <DateInput time={searchStartTime} setTime={setSearchStartTime}></DateInput> ~ <DateInput time={searchEndTime} setTime={setSearchEndTime}></DateInput>
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