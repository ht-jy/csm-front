import { useState, useEffect } from "react";
import { Axios } from "../../../utils/axios/Axios"; 
import Radio from "../Radio";
import Exit from "../../../assets/image/exit.png";
import Table from "../Table";
import PaginationWithCustomButtons from "../PaginationWithCustomButtons";
import Button from "../Button";
import { useAuth } from "../../context/AuthContext";
import useTableControlState from "../../../utils/hooks/useTableControlState";
import useTableSearch from "../../../utils/hooks/useTableSearch";

/**
 * @description: 화면 상단의 검색창을 클릭시 나오는 프로젝트 선택 모달. 프로젝트 선택시 AuthContext에 값을 담아서 다른 화면에서 사용 목적
 *               또는 프로젝트 선택용 모달
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-25
 * @modified 최종 수정일: 2025-07-01
 * @modifiedBy 최종 수정자: 김진우
 * @modified Description
 * 2025-07-01: 프로젝트 선택시 사용자의 프로젝트권한 조회
 * 
 * - props
 *   isUsedProject true 인 경우는 상단의 선택처럼 3가지의 프로젝트 경우의 수가 아닌 공사관리시스템에 등록된 프로젝트만 나오게 됨
 *   onClickRow 가 있을시에는 상단 검색창에 클릭과는 다르게 현장근태에 등록되어 있는 프로젝트만 적용이 됨. 선택한 아이템을 반환받을 함수
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /project (공사관리 프로젝트 조회), /project/enterprise (전사 프로젝트 조회), /project/my-org/{uno} (본인이 속한 조직도 프로젝트 조회), /user/role?jno=${jno}&uno=${uno} (프로젝트 사용자 권한 조회)
 */
const SearchProjectModal = ({isOpen, fncExit, isUsedProject, onClickRow}) => {
    const { user, setProject, setProjectName, setJobRole } = useAuth();
    const [selectedValue, setSelectedValue] = useState("1");
    const [data, setData] = useState([]);
    const [count, setCount] = useState(0);

    // 테이블 설정
    const columns = [
        { isSearch: false, isOrder: true, isSlide: true, width: "65.34px", header: "JNO", itemName: "jno", bodyAlign: "center", isEllipsis: false, isDate: false, type: "number" },
        { isSearch: true, isOrder: true, isSlide: false, width: "168.49px", header: "JOB No.", itemName: "job_no", bodyAlign: "left", isEllipsis: false, isDate: false },
        { isSearch: true, isOrder: true, isSlide: false, width: "157.75px", header: "End-User", itemName: "comp_name", bodyAlign: "center", isEllipsis: true, isDate: false },
        { isSearch: true, isOrder: true, isSlide: false, width: "157.75px", header: "Client", itemName: "order_comp_name", bodyAlign: "center", isEllipsis: true, isDate: false },
        { isSearch: true, isOrder: true, isSlide: false, width: "366.18px", header: "PROJECT 명", itemName: "job_name", bodyAlign: "left", isEllipsis: true, isDate: false },
        { isSearch: true, isOrder: true, isSlide: true, width: "70.65px", header: "PM", itemName: "job_pm_name", bodyAlign: "center", isEllipsis: false, isDate: false },
        { isSearch: true, isOrder: true, isSlide: true, width: "107.45px", header: "시작일", itemName: "job_sd", bodyAlign: "center", isEllipsis: false, isDate: false },
        { isSearch: true, isOrder: true, isSlide: true, width: "107.45px", header: "종료일", itemName: "job_ed", bodyAlign: "center", isEllipsis: false, isDate: false },
        { isSearch: true, isOrder: true, isSlide: true, width: "88.15px", header: "진행현황", itemName: "cd_nm", bodyAlign: "center", isEllipsis: true, isDate: false },
    ];

    // 테이블 조작 커스텀 훅
    const { pageNum, setPageNum, rowSize, setRowSize, order, setOrder } = useTableControlState(10);

    // 라디오 버튼 클릭
    const handleRadioChange = (event) => {
        setSelectedValue(event.target.value);
        setPageNum(1);
        handleSearchInit();
    };

    // 종료 이벤트
    const handleExitScrollUnset = (e) => {
        document.body.style.overflow = 'unset';
        fncExit();
    }
    // 테이블 리스트 클릭
    const handleRowClick = (item) => {
        if(onClickRow === undefined){
            // 화면 상단의 클릭시 실행
            setProject(item);
            setProjectName(item.job_name);
            getProjectRole(item.jno, user.uno);
        }else{
            // 현장근태 프로젝트 조회/선택 목적의 실행
            onClickRow(item);
        }
        fncExit();
    }

    // 프로젝트 사용자 권한 조회
    const getProjectRole = async (jno, uno) => {
        const res = await Axios.GET(`/user/role?jno=${jno}&uno=${uno}`);

        if (res?.data?.result === "Success") {
            setJobRole(res?.data?.values);
        }
    };

    // 공사관리 프로젝트 조회
    const getUsedData = async () => {
        const res = await Axios.GET(`/project?page_num=${pageNum}&row_size=${rowSize}&order=${order}&job_no=${searchValues.job_no}&comp_name=${searchValues.comp_name}&order_comp_name=${searchValues.order_comp_name}&job_name=${searchValues.job_name}&job_pm_name=${searchValues.job_pm_name}&job_sd=${searchValues.job_sd}&job_ed=${searchValues.job_ed}&cd_nm=${searchValues.cd_nm}`);
        
        if (res?.data?.result === "Success") {
            setData(res?.data?.values?.list);
            setCount(res?.data?.values?.count);
        }
    };

    // 조직도 프로젝트 조회
    const getStaffData = async () => {
        const res = await Axios.GET(`/project/my-org/${user.uno}?page_num=${pageNum}&row_size=${rowSize}&order=${order}&job_no=${searchValues.job_no}&comp_name=${searchValues.comp_name}&order_comp_name=${searchValues.order_comp_name}&job_name=${searchValues.job_name}&job_pm_name=${searchValues.job_pm_name}&job_sd=${searchValues.job_sd}&job_ed=${searchValues.job_ed}&cd_nm=${searchValues.cd_nm}`);
        if (res?.data?.result === "Success") {
            setData(res?.data?.values?.list);
            setCount(res?.data?.values?.count);
        }
        
    };

    // 전체 프로젝트 조회
    const getAllData = async () => {

        const res = await Axios.GET(`/project/enterprise?page_num=${pageNum}&row_size=${rowSize}&order=${order}&job_no=${searchValues.job_no}&comp_name=${searchValues.comp_name}&order_comp_name=${searchValues.order_comp_name}&job_name=${searchValues.job_name}&job_pm_name=${searchValues.job_pm_name}&job_sd=${searchValues.job_sd}&job_ed=${searchValues.job_ed}&cd_nm=${searchValues.cd_nm}`);
        if(res?.data?.result === "Success"){
            setData(res?.data?.values?.list);
            setCount(res?.data?.values?.count);            
        }
    };

    // 데이터 조회 분기
    const getData = (value) => {
        if(value == "1"){
            getUsedData();
        }else if(value == "2"){
            getStaffData();
        }else if(value == "3"){
            getAllData();
        }
    }

    // 테이블 조회, 검색, 정렬 이벤트 
    const { 
        searchValues,
        activeSearch, setActiveSearch, 
        isSearchReset,
        isSearchInit,
        handleTableSearch,
        handleSearchChange,
        handleSearchInit,
        handleSortChange,
        handlePageClick,
    } = useTableSearch({columns, getDataFunction: getData, getDataValue: selectedValue, pageNum, setPageNum, rowSize, order, setOrder});

    // 모달 오픈시 메인 화면 스크롤 정지
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";

            // 엔터 키 이벤트 핸들러
            const handleKeyDown = (event) => {
                if (event.key === "Escape") {
                    fncExit();
                }
            };

            document.addEventListener("keydown", handleKeyDown);

            return () => {
                document.body.style.overflow = "unset";
                document.removeEventListener("keydown", handleKeyDown);
            };
        }
    }, [isOpen]);

    return(
        <div>
            {
                isOpen ?
                <div style={overlayStyle}>
                    <div style={modalStyle}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: "#ddd", borderRadius: "5px", height: "40px" }}>
                            <h2 style={{fontSize: "15px", color: "black", paddingLeft: "10px"}}>프로젝트 선택</h2>

                            <div onClick={handleExitScrollUnset} style={{ cursor: "pointer" }}>
                                <img src={Exit} style={{ width: "30px", paddingBottom: '0px', marginRight: "5px" }} alt="Exit" />
                            </div>
                        </div>
                        
                        {
                            isUsedProject ?
                                <div style={{ display: 'flex', alignItems: 'center', borderRadius: "5px", padding: "0px", marginTop: "5px" }}>
                                    <div style={{marginLeft: "auto"}}>
                                        {
                                            isSearchInit || order != "" ? <Button text={"초기화"} onClick={handleSearchInit}/> : null
                                        }
                                    </div>
                                </div>
                                
                            :   <div style={{ display: 'flex', alignItems: 'center', borderRadius: "5px", border: "Solid #aaa 1px", padding: "10px", marginTop: "5px", height: "60px" }}>
                                    <div style={{ display: 'flex', gap: "30px", fontSize: "15px"}}>
                                        <Radio text="공사관리시스템 Used" value="1" name="group1" defaultChecked={selectedValue === "1"} onChange={handleRadioChange}/>
                                        <Radio text="조직도(STAFF)" value="2" name="group1" defaultChecked={selectedValue === "2"} onChange={handleRadioChange}/>
                                        <Radio text="전체(ALL)" value="3" name="group1" defaultChecked={selectedValue === "3"} onChange={handleRadioChange}/>
                                    </div>

                                    <div style={{marginLeft: "auto"}}>
                                        {
                                            isSearchInit || order != "" ? <Button text={"초기화"} onClick={handleSearchInit}/> : null
                                        }
                                    </div>
                                </div>
                        }

                        <div style={{ 
                            width: '100%', 
                            height: 'calc(100% - 120px)',  // 버튼과 라디오 영역을 제외한 높이
                            overflowX: 'auto',            // 가로 스크롤
                            overflowY: 'auto',            // 세로 스크롤
                            marginTop: "5px",
                        }}>
                            <Table
                                columns={columns} 
                                data={data}
                                noDataText={"선택된 프로젝트가 없습니다."}
                                searchValues={searchValues}
                                activeSearch={activeSearch} 
                                onSearch={handleTableSearch}
                                onSearchChange={handleSearchChange} 
                                setActiveSearch={setActiveSearch} 
                                resetTrigger={isSearchReset}
                                onSortChange={handleSortChange}
                                onClickRow={handleRowClick}
                                styles={{width: "1290px"}}
                            />

                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                                {
                                    count !== 0 ? 
                                        <PaginationWithCustomButtons 
                                            dataCount={count}
                                            fncClickPageNum={handlePageClick}
                                        />
                                    : null
                                }
                                
                            </div>
                        </div>
                    </div>
                </div>
                : 
                <></>
            }
        </div>
    );
}

const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '9999'
};
  
const modalStyle = {
    backgroundColor: '#fff',
    padding: '5px',
    borderRadius: '8px',
    maxWidth: '1300px',
    width: '95%',
    maxHeight: '650px',
    height: '90%',
    boxShadow: '15px 15px 1px rgba(0, 0, 0, 0.3)',
    margin: '10px',
};

export default SearchProjectModal;