import { useEffect, useReducer, useState } from "react";
import Select from 'react-select';
import "../../../../../assets/css/Paginate.css";
import "../../../../../assets/css/Table.css";
import { Axios } from "../../../../../utils/axios/Axios";
import { dateUtil } from "../../../../../utils/DateUtil";
import Button from "../../../../module/Button";
import GridModal from "../../../../module/GridModal";
import Modal from "../../../../module/Modal";
import Loading from "../../../../module/Loading";
import NoticeReducer from "./NoticeReducer";
import { useAuth } from "../../../../context/AuthContext";
import Table from "../../../../module/Table";
import PaginationWithCustomButtons from "../../../../module/PaginationWithCustomButtons .jsx"
import useTableControlState from "../../../../../utils/hooks/useTableControlState.js";
import useTableSearch from "../../../../../utils/hooks/useTableSearch";

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
 *    Http Method - GET : /site/nm (현장데이터 조회), /notice (공지사항 조회)
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
    const {pageNum, setPageNum, rowSize, setRowSize, order, setOrder } = useTableControlState(10);

    // [GridModal]
    const [data, setData] = useState([]);
    const [detail, setDetail] = useState([]);
    const [gridMode, setGridMode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isGetGridModal, setIsGetGridModal] = useState(false);
    const [isPostGridModal, setIsPostGridModal] = useState(false);

    // [Modal]
    const [isMod, setIsMod] = useState(true);
    const [modalText, setModalText] = useState("")
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isValidation, setIsValidation] = useState(true);

    const options = [
        { value: 5, label: "5줄 보기" },
        { value: 10, label: "10줄 보기" },
        { value: 15, label: "15줄 보기" },
        { value: 20, label: "20줄 보기" },
    ]

    // [테이블]
    const columns = [
        { header: "순번", width: "30px", itemName: "row_num", bodyAlign: "center", isSearch: false, isOrder: false, isDate: false, isEllipsis: false },
        { header: "지역", width: "30px", itemName: "loc_name", bodyAlign: "center", isSearch: true, isOrder: true, isDate: false, isEllipsis: false, isSlide:true },
        { header: "현장(공개범위)", width: "120px", itemName: "site_nm", bodyAlign: "left", isSearch: true, isOrder: true, isDate: false, isEllipsis: true },
        { header: "제목", width: "250px", itemName: "title", bodyAlign: "left", isSearch: true, isOrder: true, isDate: false, isEllipsis: true },
        { header: "등록자", width: "70px", itemName: "user_info", bodyAlign: "center", isSearch: true, isOrder: true, isDate: false, isEllipsis: true},
        { header: "등록일", width: "60px", itemName: "reg_date", bodyAlign: "center", isSearch: false, isOrder: true, isDate: true, isEllipsis: false, dateFormat: "format" },
    ]

    // [GridModal]
    const gridGetData = [
        { type: "html", span: "full", label: "", value: "" },
        { type: "html", span: "full", label: "", value: "" },
        { type: "hidden", value: "" },
    ]

    const gridPostData = [
        { type: "text", span: "full", label: "제목", value: "" },
        { type: "select", span: "double", label: "현장(공개범위)", value: 0, selectName: "siteNm" },
        { type: "select", span: "double", label: "공개기간", value: "1", selectName: "noticeNm" },
        { type: "html", span: "full", label: "내용", vlaue: "" },
        { type: "hidden", value: "" },
    ]

    const getModeString = () => {
        switch (gridMode) {
            case "SAVE":
                return "저장";
            case "EDIT":
                return "수정";
            case "REMOVE":
                return "삭제";
            default:
                return "";
        }
    }
    // [테이블] 행 클릭 시 상세페이지 
    const onClickRow = (item, mode) => {
        setGridMode(mode);
        const notice = state.notices.filter(notice => notice.row_num === item.row_num);
        setData(notice);
        handleGetGridModal("DETAIL", ...notice);
    }

    // [데이터] 공지사항 전체 조회
    const getNotices = async () => {
        setIsLoading(true);

        const res = await Axios.GET(`/notice?page_num=${pageNum}&row_size=${rowSize}&order=${order}&&loc_name=${searchValues.loc_name}&site_nm=${searchValues.site_nm}&title=${searchValues.title}&user_info=${searchValues.user_info}`);
        if (res?.data?.result === "Success") {
            dispatch({ type: "INIT", notices: res?.data?.values?.notices, count: res?.data?.values?.count });
        } else if (res?.data?.result === "Failure") {
            setIsMod(false);
            setIsOpenModal(true);
        }
        setIsLoading(false);

    }

    // [GridModal-Post] 공지사항 수정, 등록
    const handlePostGridModal = (mode, notice) => {
        setGridMode(mode);

        const arr = [...gridPostData]

        // 수정을 저장하고 난 후에, value값이 초기화 되지 않는 문제 해결하기 위해 사용.
        if (mode === "SAVE") {
            arr[3].value = "";
        }

        if (mode === "EDIT") {
            console.log("notcice",notice)
            console.log("select", state)
            arr[0].value = notice.title;
            arr[1].value = notice.sno;
            arr[2].value = notice.period_code;
            arr[3].value = notice.content;
            arr[4].value = notice.idx;

        }
        
        setDetail(arr);
        getSiteData();
        getPeriodData();
        setIsPostGridModal(true);
    }

    // [GridModal-Get] 공지사항 상세
    const handleGetGridModal = (mode, notice) => {

        const arr = [...gridGetData]

        if (mode === "DETAIL") {
            arr[0].value = `
                        <div class="row mb-2">
                            <div class="col-md-1 fw-bold">제목</div>
                            <div class="col-md-10">${notice.title}</div>
                        </div>
                        <div class="row">
                            <div class="col-md-1 fw-bold">지역</div>
                            <div class="col-md-3">${notice.loc_name}</div>
                            <div class="col-md-2 fw-bold">현장(공개범위)</div>
                            <div class="col-md-5">${notice.site_nm}</div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-md-1 fw-bold">등록자</div>
                            <div class="col-md-3">${notice.user_info}</div>
                            <div class="col-md-1 fw-bold">게시일</div>
                            <div class="col-md-3">${dateUtil.format(notice.reg_date, "yyyy-MM-dd")} ~ ${dateUtil.format(notice.posting_date, "yyyy-MM-dd")}</div>
                            ${dateUtil.format(notice.mod_date, "yyyy-MM-dd") !== "0001-01-01" ? `                                
                                <div class="col-md-1 fw-bold">수정일</div>
                                <div class="col-md-3 ">${dateUtil.format(notice.mod_date, "yyyy-MM-dd")}</div>
                            ` : ""}
                        </div>
                        `
            arr[1].value = `<div class="overflow-auto Scrollbar" style="white-space:pre; height: 28rem; padding: 0.5rem">${notice.content}</div>`;
            arr[2].value = notice.idx;
            // TODO: 권한 있는 사람에게만 수정 삭제 보이도록 고쳐야함.

        }

        setDetail(arr);
        setIsGetGridModal(true);

    }

    // [GridModal] gridMode props 변경 이벤트
    const onClickModeSet = (mode) => {
        setGridMode(mode)
    }

    // [GridModal] 삭제 이벤트
    const onClickGridModalDeleteBtn = async (item) => {
        setIsLoading(true);

        var idx;
        if (gridMode === "DETAIL") {
            idx = Number(item[2].value)
            setIsGetGridModal(false);
        } else {
            idx = Number(item[4].value)
            setIsPostGridModal(false);
        }
        const res = await Axios.DELETE(`notice/${idx}`)

        if (res?.data?.result === "Success") {
            // 성공 모달
            setIsMod(true);
            setIsOpenModal(true);
            getNotices();
        } else {
            // 실패 모달
            setIsMod(false);
            setIsOpenModal(true);
        }

        setGridMode("REMOVE")
        setIsLoading(false);

    }

    // [GridModal-Get] 공지사항 상세 X 버튼 클릭 이벤트
    const onClickGetGridModalExitBtn = () => {
        setDetail([]);
        setIsGetGridModal(false);
    }

    // [GridModal-Post] 닫기 버튼을 눌렀을 경우
    const onClickPostGridModalExitBtn = () => {
        setDetail([]);
        setIsPostGridModal(false);
    }

    // [GridModal-Post] 현장데이터 조회
    const getSiteData = async () => {
        setIsLoading(true);

        const res = await Axios.GET(`/site/nm`);

        if (res?.data?.result === "Success") {
            dispatch({ type: "SITE_NM", site: res?.data?.values?.list });
        }
        setIsLoading(false);
    }

    // [GridModal-Post] 공지기간 리스트 조회
    const getPeriodData = async () => {
        setIsLoading(true);
        const res = await Axios.GET(`/notice/period`);
        
        if (res?.data?.result === "Success") {
            dispatch({type: "NOTICE_NM", period: res?.data?.values?.periods})
        }

        setIsLoading(false);
    }

    // [GridModal-Post] 저장 버튼을 눌렀을 경우
    const onClickModalSave = async (item, mode) => {

        setGridMode(mode);

        // 제목을 입력 안했을 경우 모달
        if (item[0].value === "") {
            setIsValidation(false);
            setModalText("제목을 입력해 주세요.");
            setIsOpenModal(true);
        }
        // 내용을 입력 안했을 경우 모달
        else if (item[3].value === "") {
            setIsValidation(false);
            setModalText("내용을 입력해 주세요.")
            setIsOpenModal(true);

        } else {
            setIsLoading(true);
            setIsValidation(true);

            const notice = {
                sno: Number(item[1].value) || 0,
                title: item[0].value || "",
                content: item[3].value || "",
                show_yn: "Y", //item[2].value || "Y",
                period_code: item[2].value || "1",
                reg_uno: Number(user.uno) || 0,
                reg_user: user.userName || "",
            }

            let res;

            if (gridMode === "SAVE") {
                res = await Axios.POST(`/notice`, notice);
            } else {
                notice.idx = item[4].value;
                notice.mod_user = user.userName || "";
                notice.mod_uno = Number(user.uno) || 0;

                res = await Axios.PUT(`/notice`, notice);
            }

            if (res?.data?.result === "Success") {
                setIsMod(true);
                getNotices();

            } else {
                setIsMod(false);
            }

            setIsLoading(false);
            setDetail([]);
            setData([]);
            setIsPostGridModal(false);
            setIsOpenModal(true);
        }
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
     } = useTableSearch ({  columns, getDataFunction: getNotices, pageNum, setPageNum, rowSize, setRowSize, order, setOrder })


    // [GridModal] 모드 변경 시
    useEffect(() => {
        if (gridMode === "EDIT") {
            setIsGetGridModal(false);
            handlePostGridModal("EDIT", data[0]);
        }
    }, [gridMode])

    return (
        <div>
            <Loading isOpen={isLoading} />
            <GridModal
                isOpen={isGetGridModal}
                gridMode={gridMode}
                funcModeSet={onClickModeSet}
                editBtn={true}
                removeBtn={true}
                title={`공지사항 ${getModeString()}`}
                exitBtnClick={onClickGetGridModalExitBtn}
                detailData={detail}
                selectList
                saveBtnClick//={"저장 누를때"}
                removeBtnClick={onClickGridModalDeleteBtn}
            />
            <GridModal
                isOpen={isPostGridModal}
                gridMode={gridMode}
                funcModeSet={onClickModeSet}
                editBtn={true}
                removeBtn={true}
                title={`공지사항 ${getModeString()}`}
                exitBtnClick={onClickPostGridModalExitBtn}
                detailData={detail}
                selectList={state.selectList}
                saveBtnClick={onClickModalSave}
                removeBtnClick={onClickGridModalDeleteBtn}
                isCancle={false}
                isValidation={true}
            />
            <Modal
                isOpen={isOpenModal}
                title={isValidation ? (isMod ? "요청 성공" : "요청 실패") : "입력 오류"}
                text={isValidation ? (isMod ? "성공하였습니다." : "실패하였습니다.") : modalText}
                confirm={"확인"}
                fncConfirm={() => setIsOpenModal(false)}
            />

            <div>
                <div className="container-fluid px-4">
                    <h2 className="mt-4">공지사항</h2>
                    <ol className="breadcrumb mb-4">
                        <img className="breadcrumb-icon" src="/assets/img/icon-house.png" alt="..." />
                        <li className="breadcrumb-item active">공지사항</li>
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
                            <Button text={"등록"} onClick={() => handlePostGridModal("SAVE")}></Button>
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
                        { state.count !== 0 ?
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