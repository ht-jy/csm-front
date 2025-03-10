import { useState, useEffect, useReducer } from "react";
import ReactPaginate from "react-paginate";
import Select from 'react-select';
import Calendar from "react-calendar";
import { Axios } from "../../../../../utils/axios/Axios";
import { dateUtil } from "../../../../../utils/DateUtil";
import SiteBaseReducer from "./SiteBaseReducer";
import Loading from "../../../../module/Loading";
import Modal from "../../../../module/Modal";
import Table from "../../../../module/Table";
import Button from "../../../../module/Button";
import "react-calendar/dist/Calendar.css";
import "../../../../../assets/css/Table.css";
import "../../../../../assets/css/Paginate.css";
import "../../../../../assets/css/Calendar.css";
import DateInput from "../../../../module/DateInput";
import useTableSearch from "../../../../../utils/hooks/useTableSearch";
import useTableControlState from "../../../../../utils/hooks/useTableControlState";
import PaginationWithCustomButtons from "../../../../module/PaginationWithCustomButtons ";
import { useAuth } from "../../../../context/AuthContext";

/**
 * @description: 현장 근로자 관리
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-18
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - ReactPaginate: 페이지 버튼
 * - Select: 셀렉트 박스
 * - Loading: 로딩 스피너
 * - Modal: 알림 모달
 * - Table: 테이블
 * - Button: 버튼
 * - DateInput: 날짜 입력
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /site-base (현장 근로자 조회), /site/nm (현장 리스트 조회)
 */
const SiteBase = () => {
    const [state, dispatch] = useReducer(SiteBaseReducer, {
        list: [],
        count: 0,
        initialList: [],
        siteNmList: [],
    })

    const [searchStartTime, setSearchStartTime] = useState(dateUtil.now());
    const [searchEndTime, setSearchEndTime] = useState(dateUtil.now());
    const {project} = useAuth();

    const { pageNum, setPageNum, rowSize, setRowSize, order, setOrder } = useTableControlState(100);

    const [isLoading, setIsLoading] = useState(false);
    const [isModal, setIsModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalText, setModalText] = useState("");

    const columns = [
        { isSearch: false, isOrder: false, width: "70px", header: "순번", itemName: "row_num", bodyAlign: "center", isEllipsis: false, isDate: false },
        { isSearch: true, isOrder: true, width: "210px", header: "부서/조직명", itemName: "department", bodyAlign: "left", isEllipsis: false, isDate: false },
        { isSearch: true, isOrder: true, width: "190px", header: "근로자 이름", itemName: "user_nm", bodyAlign: "left", isEllipsis: false, isDate: false },
        { isSearch: false, isOrder: false, width: "480px", header: "현장이름", itemName: "site_nm", bodyAlign: "left", isEllipsis: true, isDate: false },
        { isSearch: true, isOrder: true, width: "480px", header: "프로젝트명", itemName: "job_name", bodyAlign: "left", isEllipsis: true, isDate: false },
        { isSearch: false, isOrder: true, width: "140px", header: "출근시간", itemName: "in_recog_time", bodyAlign: "center", isEllipsis: false, isDate: true, dateFormat: "formatWithTime"},
        { isSearch: false, isOrder: true, width: "140px", header: "퇴근시간", itemName: "out_recog_time", bodyAlign: "center", isEllipsis: false, isDate: true, dateFormat: "formatWithTime" }
    ];

    // 현장 근로자 조회
    const getData = async () => {
        if (project === null) {
            setIsModal(true);
            setModalTitle("현장 근로자 조회");
            setModalText("프로젝트를 선택해주세요.");
            return;
        }

        setIsLoading(true);

        if (project.sno == null) return;

        const res = await Axios.GET(`/worker/site-base?page_num=${pageNum}&row_size=${rowSize}&order=${order}&search_start_time=${searchStartTime}&search_end_time=${searchEndTime}&sno=${project.sno}&job_name=${searchValues.job_name}&user_nm=${searchValues.user_nm}&department=${searchValues.department}`);

        if (res?.data?.result === "Success") {
            if(res?.data?.values?.list.length === 0) {
                setIsModal(true);
                setModalTitle("현장 근로자 조회");
                setModalText("조회된 현장 근로자 데이터가 없습니다.");
            }
            dispatch({ type: "INIT", list: res?.data?.values?.list, count: res?.data?.values?.count });
        }

        setIsLoading(false);
    };

    // 페이지, 리스트 수, 검색날짜, 정렬, 현장 변경시
    useEffect(() => {
        getData();
    }, [pageNum, rowSize, searchStartTime, searchEndTime, order, project]);

    // 시작 날짜보다 끝나는 날짜가 빠를 시: 끝나는 날짜를 변경한 경우 (시작 날짜를 끝나는 날짜로)
    useEffect(() => {
        if (searchStartTime > searchEndTime) {
            setSearchStartTime(searchEndTime)
        }
    }, [searchEndTime]);

    // 시작 날짜보다 끝나는 날짜가 빠를 시: 시작 날짜를 변경한 경우 (끝나는 날짜를 시작 날짜로)
    useEffect(() => {
        if (searchStartTime > searchEndTime) {
            setSearchEndTime(searchStartTime)
        }
    }, [searchStartTime]);

    const { 
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
    } = useTableSearch({ columns, getDataFunction: getData, pageNum, setPageNum, rowSize, setRowSize, order, setOrder });

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
                    <ol className="breadcrumb mb-4" style={{display: "flex", alignItems: "flex-end", height: "100%"}}>
                        <li className="breadcrumb-item " style={{fontSize:"28px"}}>현장 근로자</li>
                        <li className="breadcrumb-item active" style={{paddingBottom: "4px"}}>근로자 관리</li>
                    </ol>

                    <div className="table-header">
                        <div className="table-header-left" style={{gap:"10px"}}>

                            <div className="m-2">
                                조회기간 <DateInput time={searchStartTime} setTime={setSearchStartTime}></DateInput> ~ <DateInput time={searchEndTime} setTime={setSearchEndTime}></DateInput>
                            </div>
                    
                        </div>
                        
                        <div className="table-header-right">
                            {
                                isSearchInit ? <Button text={"초기화"} onClick={handleSearchInit} /> : null
                            }                            
                        </div>
                    </div>
                    
                    <div className="table-wrapper">
                        <div className="table-container" style={{overflow: "auto", maxHeight: "calc(100vh - 350px)"}}>
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
                                isHeaderFixed={true}
                            />
                        </div>
                    </div>
                    <div>
                        <PaginationWithCustomButtons
                            dataCount={state.count}
                            rowSize={rowSize}
                            fncClickPageNum={handlePageClick}
                         />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SiteBase;