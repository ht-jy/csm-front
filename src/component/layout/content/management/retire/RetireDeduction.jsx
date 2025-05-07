import { useState, useRef } from "react";
import { Axios } from "../../../../../utils/axios/Axios";
import useExcelUploader from "../../../../../utils/hooks/useExcelUploader";
import Button from "../../../../module/Button";
import Modal from "../../../../module/Modal";

/**
 * @description: 퇴직공제 데이터 조회
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-05-07
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - 
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - POST : /excel/export/daily-deduction (일간퇴직공제 excel export), /excel/import/deduction (퇴직공제 excel import)
 */
const RetireDeduction = () => {
    const [isOpen, setIsOpen] = useState(false);

    /** 엑셀 hidden input  **/
    const excelInput = useRef(null);

    /** 엑셀 업로드 **/
    const { handleSelectAndUpload } = useExcelUploader();

    const retireExcelExport = async() => {
        const temp =[
            {
                value1: '2023-05-31',
                value2: 'HPEO PROJECT 공사 중 전기/계장 공사',
                value3: '23-04101-2264',
                value4: '세이콘(주)',
                value5: '세이콘(주)',
                value6: '공호영',
                value7: '1996-08-13',
                value8: '1092125452',
                value9: '전공',
                value10: '대상',
                value11: '',
                value12: '발급',
                value13: '남',
                value14: '07:35:17',
                value15: '16:48:53',
                value16: '07:00:00',
                value17: '17:00:00',
                value18: 1,
                value19: 1,
                value20: '카드인증',
                value21: 1,
            },
            {
                value1: '2023-05-31',
                value2: 'HPEO PROJECT 공사 중 전기/계장 공사',
                value3: '23-04101-2264',
                value4: '세이콘(주)',
                value5: '세이콘(주)',
                value6: '김승우',
                value7: '1996-08-15',
                value8: '010-1234-5678',
                value9: '보통인부',
                value10: '대상',
                value11: '',
                value12: '발급',
                value13: '남',
                value14: '07:35:17',
                value15: '16:48:53',
                value16: '07:00:00',
                value17: '17:00:00',
                value18: 1,
                value19: 1,
                value20: '카드인증',
                value21: 1,
            }
        ]

        const res = await Axios.POST_BLOB(`/excel/export/daily-deduction?ts=${Date.now()}`, temp);
        
        if (res?.data?.result === "Success") {
            
        } else {
            setIsOpen(true);
        }
    }

    // 엑셀 업로드 버튼
    const excelUploadBtn = () => {
        excelInput.current.click();
    }

    // 엑셀 업로드
    const excelUpload = async(e) => {
        const res = await handleSelectAndUpload(e, "/excel/import/deduction");
        console.log(res);
    }

    return(
        <div>
            <Modal
                isOpen={isOpen}
                title={"엑셀 다운로드"}
                text={"엑셀 다운로드에 실패하였습니다."}
                confirm={"확인"}
                fncConfirm={() => setIsOpen(false)}
            />
            <div className="container-fluid px-4">
                <ol className="breadcrumb mb-2 content-title-box">
                    <li className="breadcrumb-item content-title">퇴직공제</li>
                    <li className="breadcrumb-item active content-title-sub">관리</li>
                    <div className="table-header-right">
                        <input ref={excelInput} type="file" accept=".xlsx, .xls" onChange={(e) => excelUpload(e)} style={{display: "none"}}/>
                        <Button text={"엑셀 업로드"} onClick={excelUploadBtn} />
                        <Button text={"엑셀 다운로드"} onClick={retireExcelExport} />
                    </div>
                </ol>


            </div>
        </div>
    );
}

export default RetireDeduction;