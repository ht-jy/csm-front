import { useState, useEffect } from "react";
import { Axios } from "../../../../../utils/axios/Axios";
import "../../../../../assets/css/Table.css";
import CheckIcon from "../../../../../assets/image/check-icon.png";

/**
 * @description: 관리감독자 테이블
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-20
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /company/supervisor (관리감독자), /company/work-info (공종정보)
 */
const CompanySupervisor = ({jno, styles}) => {
    const [header, setHeader] = useState([]);
    const [supervisor, setSupervisor] = useState([]);

    // 공종 정보 조회
    const getHeaderText = async () => {
        const res = await Axios.GET(`/company/work-info`);
        
        if (res?.data?.result === "Success") {
            setHeader(res?.data?.values?.list);
        }
    };

    // 관리감독자 정보 조회
    const getData = async () => {
        if (jno != null) {   
            const res = await Axios.GET(`/company/supervisor?jno=${jno}`);
            
            if (res?.data?.result === "Success") {
                //func_no
                if (res?.data?.values?.list.length !== 0){
                    res.data.values.list = res.data.values.list.map(item => {
                        const funcArr = item.func_no.split("|").map(Number);
                        return {...item, funcArr: funcArr}
                    });
                }
                setSupervisor(res?.data?.values?.list);
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
                            <tr key={idx}>
                                <td style={{padding:"5px 10px"}}>{`${item.user_name} ${item.duty_name} (${item.user_id})`}</td>
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