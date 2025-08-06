import { useState, useReducer, useEffect, useRef } from "react";
import Select from 'react-select';
import { Axios } from "../../../../../utils/axios/Axios";
import { useAuth } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import DeviceReducer from "./DeviceReducer";
import Loading from "../../../../module/Loading";
import GridModal from "../../../../module/GridModal";
import Modal from "../../../../module/Modal";
import Button from "../../../../module/Button";
import Table from "../../../../module/Table";
import PaginationWithCustomButtons from "../../../../module/PaginationWithCustomButtons";
import useTableControlState from "../../../../../utils/hooks/useTableControlState";
import useTableSearch from "../../../../../utils/hooks/useTableSearch";
import Search from "../../../../module/search/Search";
import Notification from "../../../../../assets/image/notification_empty.png"
import "../../../../../assets/css/Table.css";
import "../../../../../assets/css/Paginate.css";
import { dateUtil } from "../../../../../utils/DateUtil";
import { useLogParam } from "../../../../../utils/Log";
import { ObjChk } from "../../../../../utils/ObjChk";
import { useUserRole } from "../../../../../utils/hooks/useUserRole";
import { DeviceRoles } from "../../../../../utils/rolesObject/deviceRoles";

/**
 * @description: 
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-12
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - ReactPaginate: 페이지 버튼
 * - Select: 셀렉트 박스
 * - Loading: 로딩 스피너
 * - GridModal: 상세 화면 모달
 * - Modal: 알림 모달
 * - Button: 버튼
 * - Table: 테이블
 * - Search: 검색 컴포넌트
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /site/nm (현장데이터 조회), /device (근태인식기 조회), device/check-registered(근태인식기 미등록장치 확인)
 *    Http Method - POST : /device (근태인식기 추가)
 *    Http Method - PUT : /device (근태인식기 수정)
 *    Http Method - DELETE :  /device/${dno} (근태인식기 삭제)
 */
const Device = () => {
    const [state, dispatch] = useReducer(DeviceReducer, {
        list: [],
        count: 0,
        selectList: {},
        devices: [],
    });

    const navigate = useNavigate();
    const { user, setIsProject } = useAuth();
    const { createLogParam } = useLogParam();
    const { isRoleValid } = useUserRole();

    const [isLoading, setIsLoading] = useState(false);
    const [isGridModal, setIsGridModal] = useState(false);
    const [gridMode, setGridMode] = useState("");
    const [isModal, setIsModal] = useState(false);
    const [isMod, setIsMod] = useState(false);
    const [detail, setDetail] = useState([]);
    const [isModal2, setIsModal2] = useState(false);
    const [modal2Title, setModal2Title] = useState("");
    const [modal2Text, setModal2Text] = useState("");
    const [isRegistered, setIsRegistered] = useState(false);
    const [devices, setDevices] = useState([]);

    const registeredRef = useRef();
    const bellRef = useRef();

    const options = [
        { value: 20, label: "20줄 보기" },
        { value: 50, label: "50줄 보기" },
        { value: 100, label: "100줄 보기" },
        
    ];

    const searchOptions = [
        { value: "ALL", label: "전체" },
        { value: "DEVICE_NM", label: "장치명" },
        { value: "DEVICE_SN", label: "시리얼번호" },
        { value: "SITE_NM", label: "현장이름" },
    ];

    const gridData = [
        { type: "hidden", value: "" },
        { type: "text", span: "double", width: "110px", label: "장치명", value: "", isRequired: true },
        { type: "text", span: "double", width: "110px", label: "시리얼번호", value: "", isRequired: true },
        { type: "site", span: "full", width: "110px", label: "현장이름", value: {sno: 100, site_nm:"미지정"}, isRequired: true, isAll: true },
        // { type: "checkbox", span: "double", width: "110px", label: "사용여부", value: "", checkedLabel: "사용중|사용안함" },
        { type: "text", span: "full", width: "110px", label: "비고", value: "" },
    ];

    const columns = [
        { isSearch: false, isOrder: true, isSlide: true, header: "순번", width: "30px", itemName: "rnum", bodyAlign: "center", isDate: false, isEllipsis: false, type: "number" },
        { isSearch: true, isOrder: true, isSlide: false, header: "장치명", width: "60px", itemName: "device_nm", bodyAlign: "left", isDate: false, isEllipsis: false },
        { isSearch: true, isOrder: true, isSlide: false, header: "시리얼번호", width: "80px", itemName: "device_sn", bodyAlign: "left", isDate: false, isEllipsis: false },
        { isSearch: true, isOrder: true, isSlide: false, header: "현장이름", width: "150px", itemName: "site_nm", bodyAlign: "left", isDate: false, isEllipsis: true },
        { isSearch: true, isOrder: true, isSlide: false, header: "비고", width: "150px", itemName: "etc", bodyAlign: "left", isDate: false, isEllipsis: true },
        // { isSearch: true, isOrder: true, isSlide: true, header: "사용여부", width: "50px", itemName: "is_use", bodyAlign: "center", isDate: false, isEllipsis: false },
        { isSearch: false, isOrder: true, isSlide: true, header: "최초 생성일시", width: "60px", itemName: "reg_date", bodyAlign: "center", isDate: true, isEllipsis: false, dateFormat: "format" },
        { isSearch: false, isOrder: true, isSlide: true, header: "최종 수정일시", width: "60px", itemName: "mod_date", bodyAlign: "center", isDate: true, isEllipsis: false, dateFormat: "format" },
    ]

    const { pageNum, setPageNum, rowSize, setRowSize, order, setOrder, retrySearchText, setRetrySearchText } = useTableControlState(20);

    // 상세페이지 클릭 시
    const onClickRow = (deviceRow, mode) => {
        handleGridModal(mode, deviceRow);
    }

    // 미등록 장치 체크
    const getNonRegisteredDevice = async () => {
        setIsLoading(true);
        try {
            const res = await Axios.GET("device/check-registered")
            
            if(res.data?.result === "Success"){
                setDevices(res.data.values.list||[]);
            }
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }
    
    // GridModal 띄우기 - 추가 또는 리스트 row 클릭시
    const handleGridModal = (mode, item) => {
        setGridMode(mode);

        const arr = [...gridData];
        if (mode === "DETAIL") {
            arr[0].value = item.dno;
            arr[1].value = item.device_nm;
            arr[2].value = item.device_sn;
            arr[3].value = {
                sno: item.sno,
                site_nm: item.site_nm
            };
            // arr[4].value = item.is_use === "사용중" ? "Y" : "N" ;
            arr[4].value = item.etc;
        }
        setDetail(arr);
        setIsGridModal(true);
    }

    // GridModal의 'X' 버튼 클릭 이벤트
    const onClickGridModalExitBtn = () => {
        setDetail([]);
        setIsGridModal(false);
    }

    // GridModal의 저장 버튼 이벤트 - (저장, 수정)
    const onClicklModalSave = async (item, mode) => {
        setGridMode(mode)

        const device = {
            dno: item[0].value || 0,
            device_nm: item[1].value || "",
            device_sn: item[2].value || "",
            sno: item[3].value.sno || 0,
            // is_use: item[4].value || "",
            etc: item[4].value || "",
            reg_user: user.userId || "",
            mod_user: user.userId || "",
        }

        // 장치명 미입력 시
        if(device.device_nm === ""){
            setIsModal2(true)
            setModal2Title("입력 오류")
            setModal2Text("장치명을 입력해주세요.")
            return

        // 시리얼번호 미입력 시
        }else if (device.device_sn === ""){
            setIsModal2(true)
            setModal2Title("입력 오류")
            setModal2Text("시리얼번호를 입력해주세요.")
            return

        // 현장이름 미선택 시
        }else if (device.sno === 0) {
            setIsModal2(true)
            setModal2Title("입력 오류")
            setModal2Text("현장이름을 선택해주세요.")
            return
        }

        // const param = {
        //     time: dateUtil.format(Date.now(), 'yyyy-MM-dd HH:mm:ss'),
        //     menu: "device",
        //     user_name: user.userName||"",
        //     user_uno: user.uno||0,
        //     record: {
        //         before: state.list.find(item => item.dno === device.dno)||{},
        //         after: device,
        //     },
        //     item: device,
        // }
        const param = createLogParam({
            menu: "device", 
            before: state.list.find(item => item.dno === device.dno)||{}, 
            after: device, 
            item: device,
        });

        setIsLoading(true);

        try {
            let res;
            if (gridMode === "SAVE") {
                param.type = "ADD";
                res = await Axios.POST(`/device`, param);
            } else {
                param.type = "MODIFY";
                res = await Axios.PUT(`/device`, param);
            }

            if (res?.data?.result === "Success") {
                setIsMod(true);
                getData();
            } else {
                setIsMod(false);
            }
            setIsGridModal(false);
            setIsModal(true);
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    // GridModal의 삭제 버튼 이벤트
    const onClickModalRemove = async (item) => {
        setIsLoading(true);
        setGridMode("REMOVE")

        const param = createLogParam({ 
            type: "REMOVE", 
            menu: "device", 
            before: state.list.find(obj => obj.dno === item[0].value)||{}, 
            after: {}, 
            item: state.list.find(obj => obj.dno === item[0].value)||{},
        });

        try {
            const res = await Axios.POST(`/device/delete`, param);

            if (res?.data?.result === "Success") {
                setIsMod(true);
                getData();
            } else {
                setIsMod(false);
            }
            setIsGridModal(false);
            setIsModal(true);
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    // GridModal의 gridMode props 변경 이벤트
    const onClickModeSet = (mode) => {
        setGridMode(mode)
    }

    // Modal or GridModal 문구 출력
    const getModeString = () => {
        switch (gridMode) {
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
    
    // 근태인식기 리스트 조회
    const getData = async () => {
        setIsLoading(true);

        // let isUse;
        // if("사용중".includes(searchValues.is_use) && "사용안함".includes(searchValues.is_use)){
        //     isUse = "";
        // }
        // else if("사용중".includes(searchValues.is_use)){
        //     isUse = "Y";
        // }
        // else if("사용안함".includes(searchValues.is_use)){
        //     isUse = "N";
        // }else {
        //     isUse = searchValues.is_use;
        // }

        try {
            const res = await Axios.GET(`/device?page_num=${pageNum}&row_size=${rowSize}&order=${'' + order}&device_nm=${searchValues.device_nm}&device_sn=${searchValues.device_sn}&site_nm=${searchValues.site_nm}&etc=${searchValues.etc}&retry_search_text=${retrySearchText}`);
            
            if (res?.data?.result === "Success") {
                dispatch({ type: "INIT", list: res?.data?.values?.list, count: res?.data?.values?.count });
            } else if (res?.data?.result === "Failure") {

                setIsModal2(true);
                setModal2Title("근태인식기 조회");
                setModal2Text("근태인식기를 조회하는데 실패하였습니다. 잠시 후에 다시 시도하여 주시기 바랍니다.");
            }
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }

    };

    // 미등록 장치 확인
    useEffect(() => {
        // FIXME: 로딩 시 getData의 loading과 겹쳐 작동 안됨.
        getNonRegisteredDevice();
    }, [])

    // 미등록 장치 외의 클릭 시
    useEffect(() => {
        const handleClick = (e) => {
            if (registeredRef.current?.contains(e.target)) {
                setIsRegistered(true);
            } else if (bellRef.current?.contains(e.target)) {
                // 아무것도 안 함
            } else {
                setIsRegistered(false);
            }
        }

        document.body.addEventListener("click", handleClick);

        return () => {
            document.body.removeEventListener("click", handleClick);
        };
    }, []);

    // 상단의 project 표시 여부 설정: 미표시
    useEffect(() => {
        setIsProject(false);
    }, [])

    const { 
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
    } = useTableSearch({ columns, getDataFunction: getData, pageNum, retrySearchText, setRetrySearchText, setPageNum, rowSize, setRowSize, order, setOrder });

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
            <Modal
                isOpen={isModal2}
                title={modal2Title}
                text={modal2Text}
                confirm={"확인"}
                fncConfirm={() => setIsModal2(false)}
            />
            <GridModal
                isOpen={isGridModal}
                gridMode={gridMode}
                funcModeSet={onClickModeSet}
                editBtn={isRoleValid(DeviceRoles.MOD_BTN)}
                removeBtn={isRoleValid(DeviceRoles.DEL_BTN)}
                title={`근태인식기 관리 ${getModeString()}`}
                exitBtnClick={onClickGridModalExitBtn}
                detailData={detail}
                selectList={state.selectList}
                saveBtnClick={onClicklModalSave}
                removeBtnClick={onClickModalRemove}
            />
            <div>
                <div className="container-fluid px-4">
                    <ol className="breadcrumb mb-2 content-title-box">
                        <li className="breadcrumb-item content-title">근태인식기 관리</li>
                        <li className="breadcrumb-item active content-title-sub">관리</li>
                        <div className="table-header-right">
                            {isRoleValid(DeviceRoles.ADD_BTN) && <Button text={"추가"} onClick={() => handleGridModal("SAVE")} />}
                        </div>
                    </ol>

                    {/* <div className="table-header">
                        <div className="table-header-right">
                            <Search 
                                searchOptions={searchOptions}
                                width={"150px"}
                                fncSearchKeywords={searchKeywords}
                            />
                        </div>
                    </div> */}
                    <div className="table-header" style={{position:"relative"}}>
                        <div className="table-header-left" style={{gap: "10px"}}>
                            <Select
                                onChange={handleSelectChange}
                                options={options}
                                defaultValue={options.find(option => option.value === rowSize)}
                                placeholder={"몇줄 보기"}
                            />
                        </div>
                        <div
                            style={{position: "relative", marginLeft:"10px", marginLeft: "10px", width: "30px", height: "30px"}}
                        >
                            <div className="icon-hover" style={{width: "30px", height: "30px" , cursor: "pointer"}} onClick={() => setIsRegistered((prev) => !prev)}>
                                <img
                                    ref={bellRef}
                                    style={{width:"19px", height: "20px"}} 
                                    src={Notification}
                                    alt="알림"
                                />
                            </div>
                            <div style={{
                                position: "absolute",
                                top: "-5px",         // 종 위로 올림
                                right: "-12px",       // 종 오른쪽으로 이동
                                backgroundColor: "#FFD700",
                                minWidth: "20px",
                                height: "20px",
                                borderRadius: "999px",
                                fontSize: "12px",
                                fontWeight: "bold",
                                padding: "0 10px",
                                whiteSpace: "nowrap",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                boxShadow: "0 0 2px rgba(0,0,0,0.3)"
                            }}>
                                {devices.length}
                            </div>
                        </div>

                        {/* 미등록 장치 */}
                        {
                            isRegistered &&
                            <div ref={registeredRef} style={{ ...modalStyle }}>
                                <div style={{ ...header }}>미등록 장치</div>
                                <div style={{...contentStyle}}>
                                    <ul style={{alignItems:"center"}}>
                                        <div  style={{marginBottom:"5px",  textIndent: "-1.0em"}}>
                                            {devices.length > 0 ? "해당 장치가 등록되지 않았습니다." : "미등록 장치가 없습니다."}
                                        </div>
                                        { devices.length > 0 && devices.map((deviceName, idx) => (
                                            <li key={idx}>{deviceName}</li>
                                        ))
                                    } 
                                    </ul>
                                </div>
                            </div>
                        }

                        
                        <div className="table-header-right">
                            {
                                isSearchInit ? <Button text={"초기화"} onClick={handleSearchInit} /> : null
                            }
                            <Search 
                                searchOptions={searchOptions}
                                width={"230px"}
                                fncSearchKeywords={handleRetrySearch}
                                retrySearchText={retrySearchText}
                            />
                            {/* <Button text={"추가"} onClick={() => handleGridModal("SAVE")} /> */}
                        </div>
                    </div>
                    
                    <div className="table-header">
                        <div className="table-header-right">
                            <div id="search-keyword-portal"></div>
                        </div>
                    </div>

                    <div className="table-wrapper">
                        <div className="table-container">

                            <Table
                                columns={columns}
                                data={state.devices}
                                searchValues={searchValues}
                                onSearch={handleTableSearch}
                                onSearchChange={handleSearchChange}
                                activeSearch={activeSearch}
                                setActiveSearch={setActiveSearch}
                                resetTrigger={isSearchReset}
                                onSortChange={handleSortChange}
                                rowIndexName={"rnum"}
                                onClickRow={onClickRow}
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
};

export default Device;
const contentStyle = {
    display: 'flex',
    justifyContent: 'center',
    overflowY: "auto",
    overflowX: "hidden",
    width:"100%",
};


const modalStyle = {
    position: "absolute",
    zIndex: '100',
    backgroundColor: 'rgb(255,255,255)',
    padding: "10px 0px 50px 0px",
    border: "1px solid rgb(200,200,200)",
    borderRadius: "10px",
    width: '30vw',
    minWidth: "18rem",
    maxWidth: "32rem",
    height: "30rem",
    boxShadow: '5px 5px 8px rgba(0, 0, 0, 0.5)',
    top:"40px",
    left:"140px",
    display: 'flex',
    flexDirection: 'column',
    overflow: "unset",
    alignItems: "center",
};

const header = {
    backgroundColor: 'beige',
    color: 'black',
    display: "flex",
    flexDirection: "column",
    textAlign: 'center',
    justifyContent: "center",
    borderRadius: "10px",
    width: "90%",
    height: "10%",
    padding:"20px",
    margin: ".5rem .5rem",
    fontWeight: "bold",
}

const exitStyle = {
    position:"fixed", 
    top:"38rem",
    backgroundColor:"white",
    border: "2px solid rgb(200, 200, 200)",
    borderRadius:"5px",
    padding:"3px 5px",
}