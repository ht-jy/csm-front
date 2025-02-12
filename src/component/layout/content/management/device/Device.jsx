import { useState, useEffect, useReducer } from "react";
import ReactPaginate from "react-paginate";
import Select from 'react-select';
import { Axios } from "../../../../../utils/axios/Axios";
import { dateUtil } from "../../../../../utils/DateUtil";
import DeviceReducer from "./DeviceReducer";
import Loading from "../../../../module/Loading";
import GridModal from "../../../../module/GridModal";
import "../../../../../assets/css/Table.css";
import "../../../../../assets/css/Paginate.css";

const Device = () => {
    const [state, dispatch] = useReducer(DeviceReducer, {
        list: [],
        count: 0,
    });

    const [pageNum, setPageNum] = useState(1);
    const [rowSize, setRowSize] = useState(5);
    const [isLoading, setIsLoading] = useState(false);
    const [isGridModal, setIsGridModal] = useState(false);
    const [detail, setDetail] = useState([]);

    const options = [
        { value: 5, label: "5줄 보기" },
        { value: 10, label: "10줄 보기" },
        { value: 15, label: "15줄 보기" },
        { value: 20, label: "20줄 보기" },
    ];

    const handlePageClick = ({ selected }) => {
        setPageNum(selected+1);
    };

    const onChangeSelect = (e) => {
        setRowSize(e.value);
        setPageNum(1);
    };

    const onClickRow = (item) => {
        setIsGridModal(true);

        const arr = [
            {type: "hidden", value: item.dno},
            {type: "text", span: "double", label: "장치명", value: item.device_nm },
            {type: "text", span: "double", label: "시리얼번호", value: item.device_sn },
            {type: "select", span: "double", label: "현장이름", value: item.site_nm },
            {type: "check", span: "double", label: "사용여부", value: item.is_use },
            {type: "text", span: "full", label: "비고", value: item.etc },
        ];
        setDetail(arr);
    }

    const onClickGridModalExitBtn = () => {
        setDetail([]);
        setIsGridModal(false);
    }

    const getData = async () => {
        setIsLoading(true);

        const page = {
            page_num: pageNum,
            row_size: rowSize
        };

        console.log(page);

        const res = await Axios.POST(`/device-list`, page);

        console.log(res);

        if (res?.data?.result === "Success") {
            dispatch({ type: "INIT", list: res?.data?.values?.list, count: res?.data?.values?.count });
        }

        setIsLoading(false);
    };

    useEffect(() => {
        getData();
    }, [pageNum, rowSize]);

    return (
        <div>
            <Loading isOpen={isLoading} />
            <GridModal 
                isOpen={isGridModal}
                exitBtnClick={onClickGridModalExitBtn}
                detailData={detail}
            />
            <div>
                <div className="container-fluid px-4">
                    <h2 className="mt-4">근태인식기 관리</h2>
                    <ol className="breadcrumb mb-4">
                        <img className="breadcrumb-icon" src="/assets/img/icon-house.png" />
                        <li className="breadcrumb-item active">관리 메뉴</li>
                        <li className="breadcrumb-item active">근태인식기 관리</li>
                    </ol>

                    <div style={{ display: 'flex', alignItems: 'center', width: '1710px', marginBottom: '15px' }}>
                        <Select
                            onChange={onChangeSelect}
                            options={options}
                            placeholder={"몇줄 보기"}
                            style={{ width: "200px" }}
                        />
                    </div>

                    <div className="table-container" style={{ overflowX: 'auto' }}>
                        <table style={{ width: "1710px", borderCollapse: 'collapse' }}>
                            <thead>
                                <tr>
                                    <th style={{ width: '70px' }}>순번</th>
                                    <th style={{ width: '160px' }}>장치명</th>
                                    <th style={{ width: '170px' }}>시리얼번호</th>
                                    <th style={{ width: '480px' }}>현장이름</th>
                                    <th style={{ width: '480px' }}>비고</th>
                                    <th style={{ width: '70px' }}>사용여부</th>
                                    <th style={{ width: '140px' }}>최초 생성일시</th>
                                    <th style={{ width: '140px' }}>최종 수정일시</th>
                                </tr>
                            </thead>
                            <tbody>
                                {state.list.length === 0 ? (
                                    <tr>
                                        <td className="center" colSpan={8}>등록된 근태인식기가 없습니다.</td>
                                    </tr>
                                ) : (
                                    state.list.map((item, idx) => (
                                        <tr key={idx} onClick={() => onClickRow(item)}>
                                            <td className="center">{item.row_num}</td>
                                            <td className="left">{item.device_nm}</td>
                                            <td className="left">{item.device_sn}</td>
                                            <td className="left ellipsis" style={{maxWidth:'480px'}}>{item.site_nm}</td>
                                            <td className="left ellipsis" style={{maxWidth:'480px'}}>{item.etc}</td>
                                            <td className="center">{item.is_use}</td>
                                            <td className="center">{dateUtil.format(item.reg_date, "yyyy-MM-dd")}</td>
                                            <td className="center">{dateUtil.format(item.mod_date, "yyyy-MM-dd")}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <ReactPaginate
                previousLabel={"<"}
                nextLabel={">"}
                breakLabel={"..."}
                pageCount={Math.ceil(state.count/rowSize)}
                marginPagesDisplayed={1} // 처음과 끝에서 보이는 페이지 개수
                pageRangeDisplayed={4} // 현재 페이지 주변에서 보이는 페이지 개수
                onPageChange={handlePageClick}
                containerClassName={"pagination"}
                activeClassName={"active"}
            />
        </div>
    );
};

export default Device;
