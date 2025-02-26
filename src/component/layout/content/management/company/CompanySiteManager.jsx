import { useState, useEffect } from "react";
import { Axios } from "../../../../../utils/axios/Axios";
import Table from "../../../../module/Table";
import "../../../../../assets/css/Table.css";

/**
 * @description: 현장소장 테이블
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-20
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - Table: 테이블
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /company/site-manager (현장소장)
 */
const CompanySiteManager = ({jno, styles}) => {
    const [manager, setManager] = useState([]);

    const columns = [
        { isSearch: false, isOrder: false, header: "현장소장", itemName: "user_info", bodyAlign: "center", isEllipsis: false, isDate: false},
    ];

    // 현장소장 정보 조회
    const getData = async () => {
        if (jno != null) {   
            const res = await Axios.GET(`/company/site-manager?jno=${jno}`);
            if (res?.data?.result === "Success") {
                setManager(res?.data?.values?.list);
            }
        }
    };

    useEffect(() => {
        getData();
    }, [jno]);

    return(
        <>
            <Table 
                columns={columns} 
                data={manager}
                noDataText={"-"}
                styles={styles}
            />
        </>
    );
}
export default CompanySiteManager;