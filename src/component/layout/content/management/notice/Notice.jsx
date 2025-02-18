import { useEffect, useReducer, useState } from "react";
import ReactPaginate from "react-paginate";
import Select from 'react-select';
import "../../../../../assets/css/Paginate.css";
import "../../../../../assets/css/Table.css";
import { Axios } from "../../../../../utils/axios/Axios";
import { dateUtil } from "../../../../../utils/DateUtil";
import Button from "../../../../module/Button";
import GridModal from "../../../../module/GridModal";
import Loading from "../../../../module/Loading";
import NoticeReducer from "./NoticeReducer";

const Notice = () => {

    const [state, dispatch] = useReducer(NoticeReducer, {
        notices: [],
        count: 0,

    });

    const [pageNum, setPageNum] = useState(1);
    const [rowSize, setRowSize] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [isGridModal, setIsGridModal] = useState(false);
    const [gridMode, setGridMode] = useState("");
    const [detail, setDetail] = useState([]);


    const options = [
        { value: 5, label: "5줄 보기" },
        { value: 10, label: "10줄 보기" },
        { value: 15, label: "15줄 보기" },
        { value: 20, label: "20줄 보기" },
    ]

    const gridData = [
        { type: "html", span: "full", label: "", value: "" },
        { type: "html", span: "full", label: "", value: "" },
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
    // 공지사항 상세 GridModal
    const handleGridModal = (mode, notice) => {
        setGridMode(mode);

        const arr = [...gridData]

        // TODO: text가 긴 경우에 content가 넘어가고 스크롤로 변하지 않는 부분 변경
        if (mode === "DETAIL") {
            arr[0].value = `
                        <div class="row mb-2">
                            <div class="col-md-1 fw-bold">제목</div>
                            <div class="col-md-11">${notice.title}</div>
                        </div>
                        <div class="row">
                            <div class="col-md-1 fw-bold">지역</div>
                            <div class="col-md-3">${notice.loc_code}</div>
                            <div class="col-md-1 fw-bold">현장</div>
                            <div class="col-md-7">${notice.site_nm}</div>
                        </div>
                        <div class="row mt-2">
                            <div class="col-md-1 fw-bold">등록자</div>
                            <div class="col-md-3">${notice.reg_user}</div>
                            <div class="col-md-1 fw-bold">등록일</div>
                            <div class="col-md-3">${dateUtil.format(notice.reg_date, "yyyy-MM-dd")}</div>
                            ${dateUtil.format(notice.mod_date, "yyyy-MM-dd") !== "0001-01-01" ? `                                
                                <div class="col-md-1 fw-bold">수정일</div>
                                <div class="col-md-3 ">${dateUtil.format(notice.mod_date, "yyyy-MM-dd")}</div>
                            ` : ""}
                        </div>
                        `
            arr[1].value = `<div class="overflow-auto">${notice.content}</div>`;

            // TODO: 권한 있는 사람한테 수정 삭제 보이도록 고쳐야함.
        }
        // TODO: 추가 기능 구현(지역, 현장 지정 기능 있어야 함)

        setDetail(arr);
        setIsGridModal(true);
    }

    // 공지사항 상세 X 버튼 클릭 이벤트
    const onClickGridModalExitBtn = () => {
        setDetail([]);
        setIsGridModal(false);
    }

    // 행의 개수 선택
    const onChangeSelect = (e) => {
        setRowSize(e.value);
        setPageNum(1);
    }

    // 공지사항 전체 조회
    const getNotices = async () => {
        setIsLoading(true);

        const res = await Axios.GET(`/notice?page_num=${pageNum}&row_size=${rowSize}`);

        if (res?.data.result === "Success") {
            dispatch({ type: "INIT", notices: res?.data?.values?.notices, count: res?.data?.values?.count });
        }

        setIsLoading(false);
    }

    // page 이동 클릭 시 >
    const handlePageClick = ({ selected }) => {
        setPageNum(selected + 1);
    }


    useEffect(() => {
        getNotices();
    }, [pageNum, rowSize])

    return (
        <div>
            <Loading isOpen={isLoading} />
            <GridModal
                isOpen={isGridModal}
                gridMode={gridMode}
                funcModeSet //={onClickModeSet}
                editBtn={true}
                removeBtn={true}
                title={`공지사항 ${getModeString()}`}
                exitBtnClick={onClickGridModalExitBtn}
                detailData={detail}
                selectList
                saveBtnClick//={"저장 누를때"}
                removeBtnClick//={"삭제 누를때"}

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
                                onChange={onChangeSelect}
                                options={options}
                                defaultValue={options.find(option => option.value === rowSize)}
                                placeholder={"몇줄 보기"}
                                style={{ width: "200px" }}
                            />
                        </div>

                        <div className="table-header-right">
                            <Button text={"추가"} onClick={() => handleGridModal("SAVE")}></Button>
                        </div>
                    </div>

                    <div className="table-wrapper">
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: "80px" }}>순번</th>
                                        <th style={{ width: "80px" }}>지역</th>
                                        <th className="ellipsis" style={{ width: "200px" }}>현장</th>
                                        <th                        >제목</th>
                                        <th style={{ width: "100px" }}>등록자</th>
                                        <th style={{ width: "140px" }}>등록일</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.notices.length === 0 ? (
                                        <tr>
                                            <td className="center" colSpan={6}>등록된 공지사항이 없습니다.</td>
                                        </tr>
                                    ) : (
                                        state.notices.map((notice, idx) => (
                                            <tr key={idx} onClick={() => handleGridModal("DETAIL", notice)}>
                                                <td className="center">{state.count - notice.row_num + 1}</td> {/* 등록일 정렬로 인해 순번이 역순으로 출력되는 문제를 해결하기 위해, 전체 - row_num + 1 */}
                                                <td className="center">{notice.loc_code}</td>
                                                <td className="left px-4 ellipsis">{notice.site_nm}</td>
                                                <td className="left px-4 ellipsis">{notice.title}</td>
                                                <td className="center">{notice.reg_user}</td>
                                                <td className="center">{dateUtil.format(notice.reg_date, "yyyy-MM-dd")}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                        </div>
                    </div>

                    {/* TODO: 페이지가 항상 아래쪽에 위치하도록 */}
                    <div className="pagination-container">
                        <ReactPaginate
                            previousLabel={"<"}
                            nextLabel={">"}
                            breakLabel={"..."}
                            pageCount={Math.ceil(state.count / rowSize)}
                            marginPagesDisplayed={1}
                            pageRangeDisplayer={4}
                            onPageChange={handlePageClick}
                            containerClassName={"pagination"}
                            activeClassName={"active"}
                        />

                    </div>
                </div>

            </div>
        </div>

    );
}

export default Notice;