import { useState, useEffect } from "react";
import { Axios } from "../../../../../utils/axios/Axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import { useLogParam } from "../../../../../utils/Log";
import { roleGroup, useUserRole } from "../../../../../utils/hooks/useUserRole";
import CheckInput from "../../../../module/CheckInput";
import CheckIcon from "../../../../../assets/image/check-icon.png";
import "../../../../../assets/css/Table.css";
import Loading from "../../../../module/Loading";
import Modal from "../../../../module/Modal";

/**
 * @description: 관리감독자 테이블
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-20
 * @modified 최종 수정일: 2025-07-09
 * @modifiedBy 최종 수정자: 
 * @modified description
 * - 2025-07-09: 안전보건시스템에 등록되지 않은 관리감독자 추가
 * - 2025-07-09: 관리감독자에게 임시현장관리자 권한 부여 기능(roles에 있는 권한만 가능)
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /company/supervisor (관리감독자), /company/work-info (공종정보)
 */
const CompanySupervisor = ({jno, styles}) => {
    const navigate = useNavigate();

    const [header, setHeader] = useState([]);
    const [supervisor, setSupervisor] = useState([]);
    const { user, project } = useAuth();
    // 로그 기록용 param
    const { createLogParam } = useLogParam();
    // 권한 체크
    const { isRoleValid } = useUserRole();
    // 로딩
    const [isLoading, setIsLoading] = useState(false);
    // 모달
    const [isModal, setIsModal] = useState(false);
    const [modalText, setModalText] = useState("");
    // 임시현장관리자 모달
    const [isTempManager, setIsTempManager] = useState(false);
    const [tempManagerText, setTempManagerText] = useState("");
    const [fncTempManager, setFncTempManager] = useState(() => {});
    // 재랜더링 용도 state
    const [render, setRender] = useState(1);
    // 임시 현장관리자 등록/해제 권한 여부
    const siteManagerRole = isRoleValid(roleGroup.GRANT_TEMP_SITE_MANAGER);

    // 임시 현장관리자 등록/해제 확인 모달
    const onClickTempManagerBtn = (value, item) => {

        if(value === "Y"){
            setTempManagerText("임시 현장관리자로 등록하시겠습니까?");
        }else{
            setTempManagerText("임시 현장관리자를 해제하시겠습니까?");
        }
        setIsTempManager(true);
        setFncTempManager(() => () => setSiteManager(value, item))
    }
    
    // 임시 현장관리자 등록/해제 확인 모달 취소
    const onClickTempManagerCancel = () => {
        setIsTempManager(false);
        getData();
    }

    // 임시 현장관리자 등록/해제
    const setSiteManager = async(value, item) => {
        setIsTempManager(false);
        try {
            setIsLoading(true);
            const param = createLogParam({
                menu: "company",
                after: supervisor.find(obj =>obj.uno = item.uno)||[],
                before: {...item, is_site_manager: value}||{},
                items: [
                    {
                        user_uno: item.uno,
                        role_code: "TEMP_SITE_MANAGER",
                        jno: project.jno,
                        reg_user: user.userName,
                        reg_uno: user.uno,
                    }
                ],
            });
            
            let res;
            if(value === "Y"){
                param.type = "TEMP_SITE_MANAGER ADD";
                res = await Axios.POST(`/user-role/add`, param);
            }else{
                param.type = "TEMP_SITE_MANAGER REMOVE";
                res = await Axios.POST(`/user-role/remove`, param);
            }
            
            if (res?.data?.result === "Success") {
                if(value === "Y"){
                    setModalText("임시 현장관리자 등록에 성공하였습니다.");
                }else{
                    setModalText("임시 현장관리자 해제에 성공하였습니다.");
                }
            }else{
                if(value === "Y"){
                    setModalText("임시 현장관리자 등록에 실패하였습니다.");
                }else{
                    setModalText("임시 현장관리자 해제에 실패하였습니다.");
                }
            }
        } catch(err) {
            navigate("/error");
        }finally {
            setIsLoading(false);
            setIsModal(true);
            getData();
        }
    }

    // 공종 정보 조회
    const getHeaderText = async () => {
        try {
            setIsLoading(true);
            const res = await Axios.GET(`/company/work-info`);
            
            if (res?.data?.result === "Success") {
                setHeader(res?.data?.values?.list);
            }
        } catch(err) {
            navigate("/error");
        }finally {
            setIsLoading(false);
        }
    };

    // 관리감독자 정보 조회
    const getData = async () => {
        if (jno != null) {   
            try {
                setIsLoading(true);
                const res = await Axios.GET(`/company/supervisor?jno=${jno}`);
                
                if (res?.data?.result === "Success") {
                    //func_no
                    if (res?.data?.values?.list.length !== 0){
                        res.data.values.list = res.data.values.list.map(item => {
                            if(item.func_no !== null){
                                const funcArr = item.func_no.split("|").map(Number);
                                return {...item, funcArr: funcArr};
                            }else{
                                return {...item, funcArr: []};
                            }
                        });
                    }
                    setSupervisor(res?.data?.values?.list);
                }
            } catch(err) {
                navigate("/error");
            }finally{
                setIsLoading(false);
                setRender(prev=> prev+1);
            }
        }
    };

    useEffect(() => {
        getHeaderText();
    }, []);

    useEffect(() => {
        getData();
    }, [jno]);

    return(
        <>
            <Loading
                isOpen={isLoading}
            />
            <Modal
                isOpen={isModal}
                title={"임시 현장 관리자"}
                text={modalText}
                confirm={"확인"}
                fncConfirm={() => setIsModal(false)}
            />
            <Modal
                isOpen={isTempManager}
                title={"임시 현장 관리자"}
                text={tempManagerText}
                confirm={"예"}
                fncConfirm={fncTempManager}
                cancel={"아니오"}
                fncCancel={onClickTempManagerCancel}
            />
            <table style={{...styles}}>
            <colgroup>
                <col style={{width:"300px"}} />
                {
                    header.length === 0 ? null
                    :
                    header.map((item, idx) => (                        
                            <col style={{width: "auto" }} key={idx}/>
                    ))
                }
            </colgroup>
                <thead>
                    <tr>
                        <th colSpan={header.length+1}>관리감독자</th>
                    </tr>
                    <tr>
                        <th>성명 (ID)</th>
                        {
                            header.length === 0 ? null
                            :
                            header.map((item, idx) => (
                                <th key={idx}>{item.func_name}</th>
                            ))
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        supervisor.length === 0 ?
                            <tr>
                                <td className="center" colSpan={header.length+1}>등록된 데이터가 없습니다.</td>
                            </tr>
                        :
                        supervisor.map((item, idx) => (
                            <tr key={`${render}_${idx}`}>
                                <td style={{ padding: "5px 10px" }}>
                                    <div style={{ 
                                        display: "flex", 
                                        justifyContent: "space-between", 
                                        alignItems: "center" 
                                    }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                            <CheckInput checkFlag={item.is_site_manager} setCheckFlag={(value) => onClickTempManagerBtn(value, item)} checkVaild={siteManagerRole}/>
                                            <span>{`${item.user_name} ${item.duty_name} (${item.user_id})`}</span>
                                        </div>
                                        {
                                            item.sys_safe === "N" ? (
                                                <div
                                                    style={{
                                                        boxSizing: "border-box",
                                                        padding: "3px",
                                                        borderRadius: "3px",
                                                        backgroundColor: "#004377",
                                                        color: "white",
                                                        fontSize: "12px",
                                                        minWidth: "55px",
                                                        textAlign: "center"
                                                    }}
                                                >
                                                    {item.cd_nm}
                                                </div>
                                            ) : (
                                                <div style={{ width: "55px" }}></div>
                                            )
                                        }
                                    </div>
                                </td>
                                {
                                    Array.from({length: header.length}, (_, i) => (
                                        item.funcArr.includes(i+1) ?
                                        <td className="center" key={i}>
                                            <img src={CheckIcon} style={{width: "16px"}}/>
                                        </td>
                                        :
                                        <td key={i}></td>
                                    ))
                                }
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        </>
    );
}
export default CompanySupervisor;