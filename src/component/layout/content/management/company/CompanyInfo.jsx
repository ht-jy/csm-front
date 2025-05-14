import { useState, useEffect } from "react";
import { Axios } from "../../../../../utils/axios/Axios";
import { useNavigate } from "react-router-dom";
import "../../../../../assets/css/Table.css";
import CheckIcon from "../../../../../assets/image/check-icon.png";

/**
 * @description: 협력업체 테이블
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-21
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /company/company-info (협력업체), /company/work-info (공종정보)
 */
const CompanyInfo = ({jno, styles}) => {
    const navigate = useNavigate();

    const [header, setHeader] = useState([]);
    const [company, setCompany] = useState([]);

    // 공종 정보 조회
    const getHeaderText = async () => {
        try {
            const res = await Axios.GET(`/company/work-info`);
            
            if (res?.data?.result === "Success") {
                setHeader(res?.data?.values?.list);
            }
        } catch(err) {
            navigate("/error");
        }
    };

    // 협력업체 정보 조회
    const getData = async () => {

        if (jno != null) {   
            try {
                const res = await Axios.GET(`/company/company-info?jno=${jno}`);
                
                if (res?.data?.result === "Success") {
                    setCompany(res?.data?.values?.list);
                }
            } catch(err) {
                navigate("/error");
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
            <table style={{...styles}}>
                <colgroup>
                    <col style={{width:"210px"}} />
                    <col style={{width:"130px"}} />
                    <col style={{width:"130px"}} />
                    <col style={{width:"130px"}} />
                    <col style={{width:"200px"}} />
                    {
                        header.length === 0 ? null
                        :
                        header.map((item, idx) => (
                            <col style={{ boxSizing: "border-box", width: "auto"}} key={idx}/>
                        ))
                    }
                </colgroup>
                <thead>
                    <tr>
                        <th colSpan={header.length+5}>협력업체</th>
                    </tr>
                    <tr>
                        <th>업체명</th>
                        <th>아이디</th>      
                        <th>사용자명</th>                                          
                        <th>휴대전화</th>
                        <th>이메일</th>
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
                        company.length === 0 ?
                            <tr>
                                <td className="center" colSpan={header.length+5}>등록된 데이터가 없습니다.</td>
                            </tr>
                        :
                        company.map((item, idx) => (
                            <tr key={idx}>
                                <td style={{padding:"5px 15px"}}>{item.comp_name_kr}</td>
                                <td className="center">{item.id}</td>
                                <td style={{padding:"5px 15px"}}>{item.worker_name}</td>
                                <td className="center">{item.cellphone}</td>
                                <td style={{padding:"5px 15px"}}>{item.email}</td>
                                {
                                    Array.from({length: header.length}, (_, i) => (
                                        item.work_infos.includes(i+1) ?
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
export default CompanyInfo;