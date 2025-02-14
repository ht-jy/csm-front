import { useState, useEffect, useReducer } from "react";
import ReactPaginate from "react-paginate";
import Select from 'react-select';
import { Axios } from "../../../../../utils/axios/Axios";
import { dateUtil } from "../../../../../utils/DateUtil";
import { useAuth } from "../../../../context/AuthContext";
import DeviceReducer from "./DeviceReducer";
import Loading from "../../../../module/Loading";
import GridModal from "../../../../module/GridModal";
import Modal from "../../../../module/Modal";
import Button from "../../../../module/Button";
import "../../../../../assets/css/Table.css";
import "../../../../../assets/css/Paginate.css";

/**
 * @description: 
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-12
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - 
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /site-nm (현장데이터 조회), /device (근태인식기 조회)
 *    Http Method - POST : /device (근태인식기 추가)
 *    Http Method - PUT : /device (근태인식기 수정)
 *    Http Method - DELETE :  /device/${dno} (근태인식기 삭제)
 * - 주요 상태 관리: useReducer, useState
 */
const Device = () => {
    const [state, dispatch] = useReducer(DeviceReducer, {
        list: [],
        count: 0,
        selectList: {},
    });

    const { user } = useAuth();

    const [pageNum, setPageNum] = useState(1);
    const [rowSize, setRowSize] = useState(10);
    const [isLoading, setIsLoading] = useState(false);
    const [isGridModal, setIsGridModal] = useState(false);
    const [gridMode, setGridMode] = useState("");
    const [isModal, setIsModal] = useState(false);
    const [isMod, setIsMod] = useState(false);
    const [detail, setDetail] = useState([]);

    const options = [
        { value: 5, label: "5줄 보기" },
        { value: 10, label: "10줄 보기" },
        { value: 15, label: "15줄 보기" },
        { value: 20, label: "20줄 보기" },
    ];

    const gridData = [
        {type: "hidden", value: ""},
        {type: "text", span: "double", label: "장치명", value: "" },
        {type: "text", span: "double", label: "시리얼번호", value: "" },
        {type: "select", span: "double", label: "현장이름", value: "", selectName: "siteNm" },
        {type: "checkbox", span: "double", label: "사용여부", value: "" },
        {type: "text", span: "full", label: "비고", value: "" },
    ];

    // 페이지네이션 버튼 클릭
    const handlePageClick = ({ selected }) => {
        setPageNum(selected+1);
    };

    // 리스트 개수 select 선택
    const onChangeSelect = (e) => {
        setRowSize(e.value);
        setPageNum(1);
    };

    // GridModal 띄우기 - 추가 또는 리스트 row 클릭시
    const handleGridModal = (mode, item) => {
        setGridMode(mode);

        const arr = [...gridData];
        if (mode === "DETAIL") {
            arr[0].value = item.dno;
            arr[1].value = item.device_nm;
            arr[2].value = item.device_sn;
            arr[3].value = item.sno;
            arr[4].value = item.is_use;
            arr[5].value = item.etc;
        }
        
        setDetail(arr);
        getSiteData();
        setIsGridModal(true);
    }

    // GridModal의 'X' 버튼 클릭 이벤트
    const onClickGridModalExitBtn = () => {
        setDetail([]);
        setIsGridModal(false);
    }

    // GridModal의 저장 버튼 이벤트 - (저장, 수정)
    const onClicklModalSave = async(item, mode) => {
        setIsLoading(true);
        setGridMode(mode)

        const device = {
            dno: item[0].value || 0,
            device_nm: item[1].value || "",
            device_sn: item[2].value || "",
            sno: item[3].value || 0,
            is_use: item[4].value || "",
            etc: item[5].value || "",
            reg_user: user.userId || "",
            mod_user: user.userId || "",
        }

        let res;
        if(gridMode === "SAVE") {
            res = await Axios.POST(`/device`, device);
        }else{

            res = await Axios.PUT(`/device`, device);
        }

        if (res?.data?.result === "Success") {
            setIsMod(true);
            getData();
        }else {
            setIsMod(false);
        }

        setIsLoading(false);    
        setIsGridModal(false);
        setIsModal(true);
    }

    // GridModal의 삭제 버튼 이벤트
    const onClickModalRemove = async(item) => {
        setIsLoading(true);
        setGridMode("REMOVE")

        const res = await Axios.DELETE(`/device/${item[0].value}`);        

        if (res?.data?.result === "Success") {
            setIsMod(true);
            getData();
        }else {
            setIsMod(false);
        }
        
        setIsLoading(false);
        setIsGridModal(false);
        setIsModal(true);
    }

    // GridModal의 gridMode props 변경 이벤트
    const onClickModeSet = (mode) => {
        setGridMode(mode)
    }

    // Modal or GridModal 문구 출력
    const getModeString = () => {
        switch(gridMode) {
            case "SAVE":
                return "저장";
            case "DETAIL":
                return "상세";
            case "EDIT":
                return "수정";
            case "REMOVE":
                return "삭제";
        }
    }

    // 현장데이터 리스트 조회 - GridModal select 용도
    const getSiteData = async() => {
        setIsLoading(true);

        const res = await Axios.GET(`/site-nm`);

        if (res?.data?.result === "Success") {
            dispatch({ type: "SITE_NM", list: res?.data?.values?.list });
        }

        setIsLoading(false);
    }

    // 근태인식기 리스트 조회
    const getData = async () => {
        setIsLoading(true);

        const page = {
            page_num: pageNum,
            row_size: rowSize
        };

        const res = await Axios.GET(`/device?page_num=${pageNum}&row_size=${rowSize}`);

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
            <Modal 
                isOpen={isModal}
                title={`근태인식기 ${getModeString()}`}
                text={`근태인식기 ${getModeString()}에 ${isMod ? "성공하였습니다." : "실패하였습니다."}`}
                confirm={"확인"}
                fncConfirm={() => setIsModal(false)}
            />
            <GridModal 
                isOpen={isGridModal}
                gridMode={gridMode}
                funcModeSet={onClickModeSet}
                editBtn={true}
                removeBtn={true}
                title={`근태인식기 관리 ${getModeString()}`}
                exitBtnClick={onClickGridModalExitBtn}
                detailData={detail}
                selectList={state.selectList}
                saveBtnClick={onClicklModalSave}
                removeBtnClick={onClickModalRemove}
            />
            <div>
                <div className="container-fluid px-4">
                    <h2 className="mt-4">근태인식기 관리</h2>
                    <ol className="breadcrumb mb-4">
                        <img className="breadcrumb-icon" src="/assets/img/icon-house.png" />
                        <li className="breadcrumb-item active">관리 메뉴</li>
                        <li className="breadcrumb-item active">근태인식기 관리</li>
                    </ol>

                    <div className="table-header">
                        <div className="table-header-left">
                            <Select
                                onChange={onChangeSelect}
                                options={options}
                                defaultValue={options.find(option => option.value === rowSize)}
                                placeholder={"몇줄 보기"}
                            />
                        </div>
                        
                        <div className="table-header-right">
                            <Button text={"추가"} onClick={() => handleGridModal("SAVE")} />
                        </div>
                    </div>
                    
                    <div className="table-wrapper">
                        <div className="table-container">
                            <table>
                                <thead>
                                    <tr>
                                        <th>순번</th>
                                        <th>장치명</th>
                                        <th>시리얼번호</th>
                                        <th>현장이름</th>
                                        <th>비고</th>
                                        <th>사용여부</th>
                                        <th>최초 생성일시</th>
                                        <th>최종 수정일시</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {state.list.length === 0 ? (
                                        <tr>
                                            <td className="center" colSpan={8}>등록된 근태인식기가 없습니다.</td>
                                        </tr>
                                    ) : (
                                        state.list.map((item, idx) => (
                                            <tr key={idx} onClick={() => handleGridModal("DETAIL", item)}>
                                                <td className="center">{item.row_num}</td>
                                                <td className="left">{item.device_nm}</td>
                                                <td className="left">{item.device_sn}</td>
                                                <td className="left ellipsis">{item.site_nm}</td>
                                                <td className="left ellipsis">{item.etc}</td>
                                                <td className="center">{item.is_use === "Y" ? "사용중" : "사용안함"}</td>
                                                <td className="center">{dateUtil.format(item.reg_date, "yyyy-MM-dd")}</td>
                                                <td className="center">{dateUtil.format(item.mod_date, "yyyy-MM-dd")}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="pagination-container">
                        <ReactPaginate
                            previousLabel={"<"}
                            nextLabel={">"}
                            breakLabel={"..."}
                            pageCount={Math.ceil(state.count / rowSize)}
                            marginPagesDisplayed={1}
                            pageRangeDisplayed={4}
                            onPageChange={handlePageClick}
                            containerClassName={"pagination"}
                            activeClassName={"active"}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Device;
