import { useEffect, useReducer, useState } from "react";
import Select from 'react-select';
import "../../../../../assets/css/Paginate.css";
import "../../../../../assets/css/Table.css";
import { Axios } from "../../../../../utils/axios/Axios";
import useTableControlState from "../../../../../utils/hooks/useTableControlState.js";
import useTableSearch from "../../../../../utils/hooks/useTableSearch";
import { useAuth } from "../../../../context/AuthContext";
import Button from "../../../../module/Button";
import Loading from "../../../../module/Loading";
import Modal from "../../../../module/Modal";
import PaginationWithCustomButtons from "../../../../module/PaginationWithCustomButtons .jsx";
import Table from "../../../../module/Table";
import NoticeDetail from "./NoticeDetail.jsx";
import NoticeReducer from "./NoticeReducer";

/**
 * @description: 공지사항 CRUD
 * 
 * @author 작성자: 정지영
 * @created 작성일: 2025-02-18
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - ReactPagination: 페이지
 * - Select: 선택 박스
 * - Button: 등록 버튼
 * - GridModal: 공지사항 상세, 추가, 수정
 * - Modal: 알림 모달
 * - Loading: 로딩
 * - Table: 테이블
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /project/nm (프로젝트데이터 조회), /notice (공지사항 조회), /notice/period (공개기간)
 *    Http Method - POST : /notice (공지사항 추가)
 *    Http Method - PUT : /notice (공지사항 수정)
 *    Http Method - DELETE :  /notice/${idx} (공지사항 삭제)
 * - 주요 상태 관리: useReducer, useState
*/

const Notice = () => {

    const [state, dispatch] = useReducer(NoticeReducer, {
        notices: [],
        count: 0,
        selectList: {},
    });

    const { user } = useAuth();
    const { pageNum, setPageNum, rowSize, setRowSize, order, setOrder } = useTableControlState(10);

    const [isLoading, setIsLoading] = useState(false);

    // [GridModal]
    const [data, setData] = useState([]);
    const [isDetail, setIsDetail] = useState(false);

    // [Modal]
    const [isMod, setIsMod] = useState(true);
    const [isOpenModal, setIsOpenModal] = useState(false);

    const options = [
        { value: 5, label: "5줄 보기" },
        { value: 10, label: "10줄 보기" },
        { value: 15, label: "15줄 보기" },
        { value: 20, label: "20줄 보기" },
    ]

    // [테이블]
    const columns = [
        { header: "순번", width: "25px", itemName: "row_num", bodyAlign: "center", isSearch: false, isOrder: false, isDate: false, isEllipsis: false },
        { header: "지역", width: "35px", itemName: "job_loc_name", bodyAlign: "center", isSearch: true, isOrder: true, isDate: false, isEllipsis: false, isSlide: true },
        { header: "현장(공개범위)", width: "120px", itemName: "job_name", bodyAlign: "left", isSearch: true, isOrder: true, isDate: false, isEllipsis: true },
        { header: "제목", width: "190px", itemName: "title", bodyAlign: "left", isSearch: true, isOrder: true, isDate: false, isEllipsis: true },
        { header: "등록자", width: "60px", itemName: "user_info", bodyAlign: "center", isSearch: true, isOrder: true, isDate: false, isEllipsis: true },
        { header: "게시시작일", width: "60px", itemName: "reg_date", bodyAlign: "center", isSearch: false, isOrder: true, isDate: true, isEllipsis: false, dateFormat: "format" },
        { header: "게시마감일", width: "60px", itemName: "posting_date", bodyAlign: "center", isSearch: false, isOrder: true, isDate: true, isEllipsis: false, dateFormat: "format" },
    ]

    // [테이블] 행 클릭 시 상세페이지 
    const onClickRow = (item, mode) => {
        if (item === null) {
            setData([]);
            setIsDetail(true);
        }
        else {
            const notice = state.notices.filter(notice => notice.row_num === item.row_num);
            setData(notice);
            setIsDetail(true);
        }
    }

    // [데이터] 공지사항 전체 조회
    const getNotices = async () => {
        setIsLoading(true);

        const res = await Axios.GET(`/notice/${user.uno}?page_num=${pageNum}&row_size=${rowSize}&order=${order}&&job_loc_name=${searchValues.job_loc_name}&job_name=${searchValues.job_name}&title=${searchValues.title}&user_info=${searchValues.user_info}`);
        if (res?.data?.result === "Success") {
            dispatch({ type: "INIT", notices: res?.data?.values?.notices, count: res?.data?.values?.count });
        } else if (res?.data?.result === "Failure") {
            setIsMod(false);
            setIsOpenModal(true);
        }
        setIsLoading(false);
    }

    const handleOpenDetail = (openState) => {
        setIsDetail(openState)
    }

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
        handlePageClick
    } = useTableSearch({ columns, getDataFunction: getNotices, pageNum, setPageNum, rowSize, setRowSize, order, setOrder })


    useEffect(() => {
        if (isDetail === false) {
            getNotices()
        }
    }, [isDetail])

    
    return (
        <div>
            <Loading isOpen={isLoading} />
            <Modal
                isOpen={isOpenModal}
                title={isMod ? "요청 성공" : "요청 실패"}
                text={isMod ? "성공하였습니다." : "실패하였습니다."}
                confirm={"확인"}
                fncConfirm={() => setIsOpenModal(false)}
            />
            <NoticeDetail
                notice={data}
                isDetail={isDetail}
                setIsDetail={handleOpenDetail}
            ></NoticeDetail>

            <div>
                <div className="container-fluid px-4">
                    <ol className="breadcrumb mb-4 content-title-box">
                        <li className="breadcrumb-item content-title">공지사항 관리</li>
                        <li className="breadcrumb-item active content-title-sub">관리</li>
                    </ol>
                    <div className="table-header">
                        <div className="table-header-left">
                            <Select
                                onChange={handleSelectChange}
                                options={options}
                                defaultValue={options.find(option => option.value === rowSize)}
                                placeholder={"몇줄 보기"}
                                style={{ width: "200px" }}
                            />
                        </div>

                        <div className="table-header-right">
                            {
                                isSearchInit ? <Button text={"초기화"} onClick={handleSearchInit} /> : null
                            }
                            <Button text={"등록"} onClick={() => onClickRow(null)}></Button>
                        </div>
                    </div>

                    <div className="table-wrapper">
                        <div className="table-container">
                            <Table
                                columns={columns}
                                data={state.notices}
                                searchValues={searchValues}
                                onSearch={handleTableSearch}
                                onSearchChange={handleSearchChange}
                                activeSearch={activeSearch}
                                setActiveSearch={setActiveSearch}
                                resetTrigger={isSearchReset}
                                onSortChange={handleSortChange}
                                rowIndexName={"row_num"}
                                onClickRow={onClickRow}
                            />
                        </div>
                    </div>
                    {state.count !== 0 ?
                        <PaginationWithCustomButtons
                            dataCount={state.count}
                            rowSize={rowSize}
                            fncClickPageNum={handlePageClick}
                        /> : null
                    }

                </div>
            </div>

        </div>

    );
}

export default Notice;