import { useState, useEffect, useReducer } from "react";
import Select from 'react-select';
import { Axios } from "../../../../../utils/axios/Axios";
import CompanyReducer from "./CompanyReducer";
import Loading from "../../../../module/Loading";
import Modal from "../../../../module/Modal";
import CompanyJobInfo from "./CompanyJobInfo";
import CompanySiteManager from "./CompanySiteManager";
import CompanySafeManager from "./CompanySafeManager";
import CompanySupervisor from "./CompanySupervisor";
import CompanyInfo from "./CompanyInfo";
import "../../../../../assets/css/Table.css";
import "../../../../../assets/css/Company.css";

/**
 * @description: 협력업체 관리 화면
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-20
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - Select: 셀렉트 박스
 * - Loading: 로딩 스피너
 * - Modal: 알림 모달
 * - CompanyJobInfo: jon(프로젝트) 정보 테이블
 * - CompanySiteManager: 현장소장 테이블
 * - CompanySafeManager: 안전관리자 테이블
 * - CompanySupervisor: 관리감독자 테이블
 * - CompanyInfo: 협력업체 테이블
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /project-nm (프로젝트 이름 조회)
 */
const Company = () => {
    const [state, dispatch] = useReducer(CompanyReducer, {
        projectList: [],
    });

    const [jno, setJno] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isModal, setIsModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalText, setModalText] = useState("");
    const [showCompanyWrapper, setShowCompanyWrapper] = useState(false);

    // 프로젝트 select 선택
    const onChangeProjectSelect = (e) => {
        setJno(e.value);
    }

    // 프로젝트 조회
    const getData = async () => {
        setIsLoading(true);
        
        const res = await Axios.GET(`/project-nm`);
        
        if (res?.data?.result === "Success") {
            if(res?.data?.values?.list.length === 0) {
                setIsModal(true);
                setModalTitle("프로젝트 조회");
                setModalText("조회된 프로젝트가 없습니다.");
            }
            dispatch({ type: "PROJECT", list: res?.data?.values?.list });
        }

        setIsLoading(false);
    };

    useEffect(() => {
        getData();
    }, []);

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
                    <h2 className="mt-4">협력업체</h2>
                    <ol className="breadcrumb mb-4">
                        <img className="breadcrumb-icon" src="/assets/img/icon-house.png" />
                        <li className="breadcrumb-item active">관리 메뉴</li>
                        <li className="breadcrumb-item active">협력업체 관리</li>
                    </ol>

                    <div className="table-header">
                        <div className="table-header-left" style={{gap:"10px"}}>
                            <div style={{ width: "500px" }}>
                                <Select
                                    onChange={onChangeProjectSelect}
                                    options={state.projectList}
                                    placeholder={"프로젝트 선택"}
                                    styles={{
                                        menu: (provided) => ({ ...provided, zIndex: 9999 }),
                                        menuList: (provided) => ({
                                          ...provided,
                                          maxHeight: "500px", // 드롭다운 최대 높이 조정
                                        }),
                                    }}
                                />
                            </div>
                        </div>
                        
                        <div className="table-header-right">
                                                     
                        </div>
                    </div>
                    
                    <div className="table-wrapper">
                        <div className="table-container">
                            {/* job정보 */}
                            <CompanyJobInfo jno={jno} styles={{marginBottom: "40px"}}/>

                            {
                                jno !== null ?
                                    <div>
                                        <div className="company-manager">
                                            {/* 현장소장*/}
                                            <div style={{ width: "270px" }}>
                                                <CompanySiteManager jno={jno} styles={{ width: "270px" }} />
                                            </div>

                                            {/* 안전관리자*/}
                                            <div style={{ width: "265px", margin: "0 auto" }}>
                                                <CompanySafeManager jno={jno} styles={{ width: "265px", marginLeft:"9px" }} />
                                            </div>

                                            {/* 관리감독자*/}
                                            <div style={{ width: "1130px", marginLeft: "auto" }}>
                                                <CompanySupervisor jno={jno} styles={{ width: "1130px" }} />
                                            </div>
                                        </div>

                                        {/* 협력업체 */}
                                        <CompanyInfo jno={jno} styles={{marginBottom: "10px"}}/>
                                    </div>
                                : null
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Company;