import { useState, useEffect, useReducer } from "react";
import { useAuth } from "../../../../context/AuthContext";
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
 *    Http Method - GET : 
 */
const Company = () => {
    const { project, setIsProject } = useAuth();

    const [jno, setJno] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isModal, setIsModal] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalText, setModalText] = useState("");

    useEffect(() => {
        if(project){
            setJno(project.jno);
        }else{
            setJno(null);
            setIsModal(true);
            setModalTitle("협력업체")
            setModalText("프로젝트를 선택해 주세요.")
        }
    }, [project]);

    // 상단의 project 표시 여부 설정: 표시
    useEffect(() => {
        setIsProject(true);
    }, [])

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
                <div className="border-box container-fluid px-4">
                    <ol className="breadcrumb mb-3 content-title-box">
                        <li className="breadcrumb-item content-title">협력업체 관리</li>
                        <li className="breadcrumb-item active content-title-sub">관리</li>
                    </ol>

                    <div className="table-header">
                        <div className="table-header-left" style={{gap:"10px"}}>
                            
                        </div>
                        
                        <div className="table-header-right">
                                                     
                        </div>
                    </div>
                    
                    <div className="table-wrapper">
                        <div style={{width: "100%", overflowX: "auto", display: "block", maxWidth: "100", borderRadius: "5px"}}>
                            {/* job정보 */}
                            <CompanyJobInfo jno={jno} styles={{marginBottom: "40px"}}/>

                            {
                                jno !== null ?
                                    <div>
                                        <div className="company-manager">
                                            {/* 현장소장*/}
                                            <div style={{ width: "220px", height: "100%", minWidth: "220px", overflow: "hidden", borderRadius: "5px", boxShadow: "0 2px 5px rgba(0, 0, 0, 0.25)" }}>
                                                <CompanySiteManager jno={jno} styles={{ width: "220px", minWidth: "220px" }} />
                                            </div>

                                            {/* 안전관리자*/}
                                            <div style={{ width: "250px", height: "100%", minWidth: "250px", margin: "0 auto", overflow: "hidden", borderRadius: "5px", marginLeft:"15px", boxShadow: "0 2px 5px rgba(0, 0, 0, 0.25)"  }}>
                                                <CompanySafeManager jno={jno} styles={{ width: "250px", minWidth: "250px"}} />
                                            </div>

                                            {/* 관리감독자*/}
                                            <div style={{ width: "100%", height: "100%", minWidth: "1030px", overflow: "hidden", borderRadius: "5px", marginLeft:"15px", boxShadow: "0 2px 5px rgba(0, 0, 0, 0.25)" }}>
                                                <CompanySupervisor jno={jno} styles={{ width: "100%", minWidth: "1030px" }} />
                                            </div>
                                        </div>

                                        {/* 협력업체 */}
                                        <div style={{ width:"100%", height: "100%", minWidth: "1530px", overflow: "hidden", borderRadius: "5px", boxShadow: "0 2px 5px rgba(0, 0, 0, 0.25)", marginBottom: "10px" }}>
                                            <CompanyInfo jno={jno}  styles={{ width: "100%", minWidth: "1530px" }}/>
                                        </div>
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