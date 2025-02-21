import { useState, useEffect } from "react";
import { Axios } from "../../../../../utils/axios/Axios";
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
    const [header, setHeader] = useState([]);
    const [company, setCompany] = useState([]);

    // 공종 정보 조회
    const getHeaderText = async () => {
        const res = await Axios.GET(`/company/work-info`);
        
        if (res?.data?.result === "Success") {
            setHeader(res?.data?.values?.list);
        }
    };

    // 협력업체 정보 조회
    const getData = async () => {

        if (jno != null) {   
            const res = await Axios.GET(`/company/company-info?jno=${jno}`);
            
            if (res?.data?.result === "Success") {
                setCompany(res?.data?.values?.list);
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
                <thead>
                    <tr>
                        <th colSpan={header.length+5}>협력업체</th>
                    </tr>
                    <tr>
                        <th style={{width:"180px"}}>업체명</th>
                        <th style={{width:"180px"}}>아이디</th>      
                        <th style={{width:"180px"}}>사용자명</th>                                          
                        <th style={{width:"180px"}}>휴대전화</th>
                        <th style={{width:"180px"}}>이메일</th>
                        {
                            header.length === 0 ? null
                            :
                            header.map((item, idx) => (
                                <th style={{width:"50px"}} key={idx}>{item.func_name}</th>
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
                                <td>{item.comp_name_kr}</td>
                                <td>{item.id}</td>
                                <td>{item.worker_name}</td>
                                <td>{item.cellphone}</td>
                                <td>{item.email}</td>
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