import { useState, useEffect } from "react";
import { Axios } from "../../../../../utils/axios/Axios";
import Table from "../../../../module/Table";
import "../../../../../assets/css/Table.css";

/**
 * @description: jon(프로젝트) 정보 테이블
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
 *    Http Method - GET : /company/job-info (jon(프로젝트) 정보)
 */
const CompanyJobInfo = ({jno, styles}) => {
    const [jobInfo, setJobInfo] = useState([]);

    const columns = [
        { isSearch: false, isOrder: false, width: "70px", header: "JNO", itemName: "jno", bodyAlign: "center", isEllipsis: false, isDate: false, type: "number" },
        { isSearch: false, isOrder: false, width: "460px", header: "JOB명", itemName: "job_name", bodyAlign: "left", isEllipsis: true, isDate: false },
        { isSearch: false, isOrder: false, width: "150px", header: "JOB No.", itemName: "job_no", bodyAlign: "left", isEllipsis: false, isDate: false },
        { isSearch: false, isOrder: false, width: "180px", header: "End-User", itemName: "comp_name", bodyAlign: "center", isEllipsis: false, isDate: false },
        { isSearch: false, isOrder: false, width: "180px", header: "Client", itemName: "order_comp_name", bodyAlign: "center", isEllipsis: false, isDate: false },
        { isSearch: false, isOrder: false, width: "110px", header: "시작일", itemName: "job_sd", bodyAlign: "center", isEllipsis: false, isDate: false },
        { isSearch: false, isOrder: false, width: "110px", header: "종료일", itemName: "job_ed", bodyAlign: "center", isEllipsis: false, isDate: false },
        { isSearch: false, isOrder: false, width: "130px", header: "PM", itemName: "job_pm_name|job_pm_duty_name", bodyAlign: "center", isEllipsis: false, isDate: false, isItemSplit: true },
        { isSearch: false, isOrder: false, width: "90px", header: "구분", itemName: "cd_nm", bodyAlign: "center", isEllipsis: false, isDate: false },
    ];

    // jobInfo에 데이터 추가
    const addJonInfo = (item) => {
        setJobInfo([item]);
    }

    // jon(프로젝트) 정보 조회
    const getData = async () => {
        if (jno != null) {   
            const res = await Axios.GET(`/company/job-info?jno=${jno}`);
            if (res?.data?.result === "Success") {
                addJonInfo(res.data.values.data); // null 체크 후 데이터 추가
            }
        }
    };

    useEffect(() => {
        getData();

        if (jno === null) {
            setJobInfo([]);
        }

    }, [jno]);

    return(
        <>
            {
                <Table 
                    columns={columns} 
                    data={jobInfo}
                    noDataText={jno === null ? "선택된 프로젝트가 없습니다." : ""}
                    styles={styles}
                />
            }
        </>
    );
}
export default CompanyJobInfo;