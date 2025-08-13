import { useState, useEffect, useReducer } from "react";
import { Axios } from "../../../../../utils/axios/Axios";
import { dateUtil } from "../../../../../utils/DateUtil";
import { useAuth } from "../../../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Button from "../../../../module/Button";
import Loading from "../../../../module/Loading";
import Modal from "../../../../module/Modal";
import Table from "../../../../module/Table";
import TotalReducer from "./TotalReducer";
import useDetailModal from "../../../../../utils/hooks/useDetailModal";
import PaginationWithCustomButtons from "../../../../module/PaginationWithCustomButtons";
import useTableControlState from "../../../../../utils/hooks/useTableControlState";
import useTableSearch from "../../../../../utils/hooks/useTableSearch";
import Search from "../../../../module/search/Search";
import GridModal from "../../../../module/GridModal";
import TotalDetailModal from "./TotalDetailModal";
import { useLogParam } from "../../../../../utils/Log";
import useGridModalControlState from "../../../../../utils/hooks/useGridModalControlState";
import useGridModalSearch from "../../../../../utils/hooks/useGridModalSearch";
import "../../../../../assets/css/Calendar.css";
import "../../../../../assets/css/Paginate.css";
import "../../../../../assets/css/Table.css";
import { workerRoles } from "../../../../../utils/rolesObject/workerRoles";
import { useUserRole } from "../../../../../utils/hooks/useUserRole";

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
 * - Search: 검색 컴포넌트
 * - GridModal: 상세 화면 모달
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /worker/total (전체근로자 조회), /site/nm (현장데이터 조회), /code (코드조회)
 *    Http Method - POST : /worker/total (근로자 추가)
 *    Http Method - PUT : /worker/total (근로자 수정)
 */

const Total = () => {
    const [state, dispatch] = useReducer(TotalReducer, {
        list: [],
        count: 0,
        workerTypeCodes: [],
        initialList: [],
        selectList: [],
    });

    const navigate = useNavigate();
    const { user, setIsProject } = useAuth();
    const {createLogParam} = useLogParam();
    const { isRoleValid } = useUserRole();

    // 로딩
    const [isLoading, setIsLoading] = useState(false);
    // 모달
    const [isModal, setIsModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalText, setModalText] = useState("");
    // 모달(예/아니오)
    const [isModal2, setIsModal2] = useState(false);
    const [modal2Title, setModal2Title] = useState("");
    const [modal2Text, setModal2Text] = useState("");
    // 상세모달
    const {isDetailModal, setIsDetailModal, detailData, detailMode, setDetailMode, isMod, setIsMod, handleDetailModalOn, handleModeSet, getModeString, handleExitBtnClick} = useDetailModal();

    const columns = [
        { isSearch: false, isOrder: true, isSlide: true, width: "50px", header: "순번", itemName: "rnum", bodyAlign: "center", isEllipsis: false, isDate: false, type: "number" },
        { isSearch: true, isOrder: true, isSlide: false, width: "100px", header: "아이디", itemName: "user_id", bodyAlign: "center", isEllipsis: false, isDate: false, /*isFormat: true, format: "maskResidentNumber", valid: "isValidResidentNumber"*/ },
        { isSearch: true, isOrder: true, isSlide: false, width: "100px", header: "이름", itemName: "user_nm", bodyAlign: "left", isEllipsis: false, isDate: false },
        { isSearch: true, isOrder: true, isSlide: false, width: "150px", header: "부서/조직명", itemName: "department", bodyAlign: "left", isEllipsis: false, isDate: false },
        { isSearch: true, isOrder: true, isSlide: false, width: "100px", header: "공종", itemName: "disc_name", bodyAlign: "left", isEllipsis: false, isDate: false },
        { isSearch: true, isOrder: true, isSlide: false, width: "300px", header: "프로젝트명", itemName: "job_name", bodyAlign: "left", isEllipsis: true, isDate: false },
        { isSearch: true, isOrder: true, isSlide: false, width: "100px", header: "핸드폰 번호", itemName: "phone", bodyAlign: "center", isEllipsis: false, isDate: false, isFormat: true, format: "formatMobileNumber", valid: "isValidMobileNumber" },
        { isSearch: true, isOrder: true, isSlide: false, width: "100px", header: "근로자구분", itemName: "worker_type_nm", bodyAlign: "center", isEllipsis: false, isDate: false },
        { isSearch: false, isOrder: true, isSlide: false, width: "100px", header: "퇴사 여부", itemName: "is_retire", bodyAlign: "center", isEllipsis: false, isDate: false, isChecked: true },
    ];

    const { pageNum, setPageNum, rowSize, setRowSize, order, setOrder, retrySearchText, setRetrySearchText, rnumOrder, setRnumOrder } = useTableControlState(100);
    

    const searchOptions = [
        { value: "ALL", label: "전체" },
        { value: "JOB_NAME", label: "프로젝트명" },
        { value: "USER_NM", label: "이름" },
        { value: "DEPARTMENT", label: "부서/조직명" },
    ];

    const onClickSaveBtn = () => {
        let saveItem;
        saveItem = columns.reduce((acc, item) => {
            return {...acc, [item.itemName]: ""}
        }, saveItem);
        saveItem.reg_no = "";
        handleDetailModalOn(saveItem, "SAVE");
    }

    // GridModal의 저장 버튼 이벤트 - (저장, 수정)
    const onClicklModalSave = async (item, mode) => {
        
        // setGridMode(mode);
        setDetailMode(mode);

        let retireDate = null;
        if (item.is_retire !== 'Y'){
            retireDate = null;
        }else{
            retireDate = dateUtil.parseToGo(item.retire_date);
        }
        
        const worker = {
            sno: item.sno || 0,
            jno: item.jno || 0,
            user_key: item.user_key || "",
            user_id: item.user_id || "",
            user_nm: item.user_nm || "",
            department: item.department || "",
            phone: item.phone || "",
            reg_no: item.reg_no || "",
            worker_type: item.worker_type || "00",
            disc_name: item.disc_name || "",
            is_retire: item.is_retire || "N",
            retire_date: retireDate,
            is_manage: item.is_manage || "N",
            reg_user: user.userName || "",
            reg_uno: user.uno || 0,
            mod_user: user.userName || "",
            mod_uno: user.uno || 0,
        }
        
        setIsLoading(true);
        try {
            let res;
            if (detailMode === "SAVE") {
                worker.sno = item.project.sno;
                worker.jno = item.project.jno;
                res = await Axios.POST(`/worker/total`, worker);
            } else {
                res = await Axios.PUT(`/worker/total`, worker);
            }
            
            if (res?.data?.result === "Success") {
                setModalTitle(`근로자 ${getModeString()}`);
                setModalText(`근로자 ${getModeString()}에 성공하였습니다.`);
                setIsMod(true);
                getData();
            } else {
                setModalTitle(`근로자 ${getModeString()}`);
                setModalText(`근로자 ${getModeString()}에 실패하였습니다. \n잠시 후에  다시 시도하여 주시기 바랍니다.`);
                setIsMod(false);
            }

            setIsDetailModal(false);
            setIsModal(true);
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }

    // 근로자 삭제 모달 알림
    const onClickModalDelete = () => {
        setModal2Title("근로자 삭제");
        setModal2Text("근로자를 삭제하시겠습니까?");
        setIsModal2("true");
    }

    // 근로자 삭제(상태만 변경)
    const deleteWorker = async() => {
        setIsModal2(false);

        try {
            setIsLoading(true);
            
            const param = createLogParam({
                item: {
                user_key: detailData.user_key,
                user_id: detailData.user_id,
                user_nm: detailData.user_nm,
                mod_user: user.userName,
                mod_uno: user.uno,
            },
                menu: "/total",
                type: "DELETE"
            });
            
            let res = await Axios.POST(`/worker/total/delete`, param);
            
            if (res?.data?.result === "Success") {
                setModalTitle(`근로자 삭제`);
                setModalText(`근로자 삭제에 성공하였습니다.`);
                setIsMod(true);
                getData();
            } else {
                setModalTitle(`근로자 삭제`);
                setModalText(`근로자 삭제에 실패하였습니다. \n잠시 후에  다시 시도하여 주시기 바랍니다.`);
                setIsMod(false);
            }
        } catch(err) {
            navigate("/error");
        } finally {
            setIsDetailModal(false);
            setIsModal(true);
            setIsLoading(false);
        }
    }

    // 근로자 구분 코드로 변환
    const convertWorkerTypeToCode = (workerTypeNm) => {
        if (workerTypeNm === "" || state.workerTypeCodes.length === 0){
            return "";
        }

        const code = state?.workerTypeCodes?.find(item => item.code_nm?.toUpperCase().includes(workerTypeNm.toUpperCase()));
        if (!code){
            return "99";
        }
        return code.code;
    }

    // 코드 조회
    const getCodeData = async () => {
        setIsLoading(true);

        try {
            const res = await Axios.GET(`/code?p_code=WORKER_TYPE`);
            if (res?.data?.result === "Success") {
                dispatch({ type: "CODE", code: res?.data?.values?.list });
                return res?.data?.values?.list;
            } else if (res?.data?.result === "Failure") {
                return [];
            }
            return true;
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    }
    
    // 전체근로자 조회
    const getData = async () => {
        setIsLoading(true);

        const params = {
            page_num: pageNum,
            row_size: rowSize,
            order: order.replaceAll("WORKER_TYPE_NM", "WORKER_TYPE"),
            rnum_order: rnumOrder,
            user_id: searchValues.user_id,
            user_nm: searchValues.user_nm,
            job_name: searchValues.job_name,
            department: searchValues.department,
            disc_name: searchValues.disc_name,
            phone: searchValues.phone,
            worker_type: convertWorkerTypeToCode(searchValues.worker_type_nm),
            retry_search: retrySearchText
          };

        const queryString = Object.entries(params)
            .filter(([key, value]) => value !== '' && value != null)
            .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
            .join('&');
        
        try {
            const res = await Axios.GET(`/worker/total?${queryString}`);

            // const res = await Axios.GET(`/worker/total?page_num=${pageNum}&row_size=${rowSize}&order=${order}&user_id=${searchValues.user_id}&user_nm=${searchValues.user_nm}&department=${searchValues.department}&phone=${searchValues.phone}&worker_type=${convertWorkerTypeToCode(searchValues.worker_type_nm)}&retry_search=${retrySearchText}`);
            
            if (res?.data?.result === "Success") {
                if(state.workerTypeCodes.length === 0) {
                    const code = await getCodeData();
                    dispatch({ type: "INIT", list: res?.data?.values?.list, count: res?.data?.values?.count, code: code });
                }else{
                    dispatch({ type: "INIT", list: res?.data?.values?.list, count: res?.data?.values?.count, code: state.workerTypeCodes });
                }
                
            }
        } catch(err) {
            navigate("/error");
        } finally {
            setIsLoading(false);
        }
    };

    // 테이블 조작
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
        handlePageClick,
    } = useTableSearch({ columns, getDataFunction: getData, pageNum, retrySearchText, setRetrySearchText, setPageNum, rowSize, setRowSize, order, setOrder, rnumOrder, setRnumOrder });

    /***** useEffect *****/

    useEffect(() => {

        // getProjectData();
    }, []);

    // 상단의 project 표시 여부 설정: 미표시
    useEffect(() => {
        setIsProject(false);
    }, [])

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
            <Modal
                isOpen={isModal2}
                title={modal2Title}
                text={modal2Text}
                confirm={"예"}
                cancel={"아니오"}
                fncConfirm={deleteWorker}
                fncCancel={() => setIsModal2(false)}
            />
            <TotalDetailModal
                isOpen={isDetailModal}
                gridMode={detailMode}
                funcModeSet={handleModeSet}
                editBtn={true}
                removeBtn={true}
                title={`근로자 ${getModeString()}`}
                exitBtnClick={handleExitBtnClick}
                detailData={detailData}
                selectList={state.selectList}
                saveBtnClick={onClicklModalSave}
                removeBtnClick={onClickModalDelete}
            />
            <div>
                <div className="container-fluid px-4">
                    
                    <ol className="breadcrumb mb-2 content-title-box">
                        <li className="breadcrumb-item content-title">전체</li>
                        <li className="breadcrumb-item active content-title-sub">근로자</li>
                        <div className="table-header-right">
                        {
                            isRoleValid(workerRoles.TOTAL_WORKER_ADD) && 
                            <Button text={"추가"} onClick={onClickSaveBtn} />
                        }
                        </div>
                    </ol>
                    
                    <div className="table-header">
                        <div className="table-header-left" style={{ gap: "10px" }}>
                            {/* <Select
                                onChange={onChangeSelect}
                                options={options}
                                defaultValue={options.find(option => option.value === rowSize)}
                                placeholder={"몇줄 보기"}
                            /> */}

                            {/* <div className="m-2">
                                조회기간 <DateInput time={searchStartTime} setTime={setSearchStartTime}></DateInput> ~ <DateInput time={searchEndTime} setTime={setSearchEndTime}></DateInput>
                            </div> */}
                        </div>

                        <div className="table-header-right">
                            {
                                isSearchInit ? <Button text={"초기화"} onClick={handleSearchInit} style={{marginRight: "2px"}}/> : null
                            }
                            <Search 
                                searchOptions={searchOptions}
                                width={"230px"}
                                fncSearchKeywords={handleRetrySearch}
                                retrySearchText={retrySearchText}
                            />                            
                        </div>
                    </div>
                    <div className="table-header">
                        <div className="table-header-right">
                            <div id="search-keyword-portal"></div>
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
                                onClickRow={handleDetailModalOn}
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

export default Total;