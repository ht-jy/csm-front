import { useEffect, useReducer, useState } from "react";
import Select from 'react-select';
import { Axios } from "../../../../../utils/axios/Axios";
import { dateUtil } from "../../../../../utils/DateUtil";
import Loading from "../../../../module/Loading";
import NoticeReducer from "./NoticeReducer";
import ReactPaginate from "react-paginate";
import "../../../../../assets/css/Table.css";
import "../../../../../assets/css/Paginate.css";


const Notice = () => {

    const [state, dispatch] = useReducer(NoticeReducer, {
        notices: [],
        count: 0,

    });

    const [pageNum, setPageNum] = useState(1);
    const [rowSize, setRowSize] = useState(10);
    const [isLoading, setIsLoading] = useState(false);

    const options = [
        { value: 5, label: "5줄 보기" },
        { value: 10, label: "10줄 보기" },
        { value: 15, label: "15줄 보기" },
        { value: 20, label: "20줄 보기" },
    ]

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

    const handlePageClick = ({selected}) => {
        setPageNum(selected + 1);
    }

    useEffect(() => {
        getNotices();
    }, [pageNum, rowSize])

    return (
        <div>
            <Loading isOpen={isLoading} />


            <div>
                <div className="container-fluid px-4">
                    <h2 className="mt-4">공지사항</h2>
                    <ol className="breadcrumb mb-4">
                        <img className="breadcrumb-icon" src="/assets/img/icon-house.png" />
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
                    </div>

                    <div className="table-wrapper">
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>순번</th>
                                        <th>제목</th>
                                        <th>현장</th>
                                        <th>프로젝트</th>
                                        <th>등록자</th>
                                        <th>등록일</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.notices.length === 0 ? (
                                        <tr>
                                            <td className="center" colSpan={6}>등록된 공지사항이 없습니다.</td>
                                        </tr>
                                    ) : (
                                        state.notices.map((notice, idx) => (
                                            <tr key={idx}>
                                                <td className="center">{notice.row_num}</td>
                                                <td className="left ellipsis">{notice.title}</td>
                                                <td className="center">{notice.loc_code}</td>
                                                <td className="left">{notice.site_nm}</td>
                                                <td className="center">{notice.reg_user}</td>
                                                <td className="center">{dateUtil.format(notice.reg_date, "yyyy-mm-dd")}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>

                        </div>
                    </div>
                    
                    {/* TODO: 페이지가 항상 아래쪽에 위치하도록 변경하기 */}
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