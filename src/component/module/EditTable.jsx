import { useState, useEffect } from "react";
import { ObjChk } from "../../utils/ObjChk";
import { dateUtil } from "../../utils/DateUtil";
import CheckSquareIcon from "../../assets/image/check-square-icon.png";
import NonCheckSquareIcon from "../../assets/image/non-check-square-icon.png";
import { Common } from "../../utils/Common";
import "../../assets/css/Table.css";

/**
 * @description: 추가/수정한 데이터를 단순하게 보여주기만 하기 위한 용도의 테이블 컴포넌트
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-03-24
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - 
 */
const EditTable = ({isOpen, columns, data=[]}) => {
    // dateUtil을 기준으로 날짜 포맷
    const formatDate = (date, formatType) => {
        if (!formatType || !dateUtil[formatType]) return date;
        return dateUtil[formatType](date);
    };

    return(
        !ObjChk.all(isOpen) ?
            <table>
                <thead>
                    <tr>
                        {
                            columns.map((col, idx) => (
                                <th 
                                    key={idx}
                                    style={{
                                        width: col.width,
                                        position: "relative",
                                        textAlign: "center"
                                    }}
                                >
                                    {columns[0].isRowCheck ? idx === 1 ? "종류" : col.header : idx === 0 ? "종류" : col.header }
                                </th>
                            ))
                        }
                    </tr>
                </thead>
                <tbody>
                    {
                        data.map((item, idx) => (
                            <tr key={idx}>
                                {
                                    columns.map((col, col_idx) => (
                                        <td 
                                            key={col_idx}
                                            className={`${col.bodyAlign} ${col.isEllipsis ? "ellipsis" : ""}`}
                                            style={{maxWidth: col.width}}
                                        >
                                            {
                                                col.isDate ?
                                                    formatDate(item[col.itemName], col.dateFormat)
                                                : col.isItemSplit ? 
                                                    col.itemName
                                                    .split("|")
                                                    .map(itemName => item[itemName])
                                                    .join(' ')
                                                : col.isChecked ?
                                                    item[col.itemName] === 'Y' ?
                                                        <img 
                                                            src={CheckSquareIcon}
                                                            style={{width: "18px"}}
                                                        />
                                                    :   <img 
                                                            src={NonCheckSquareIcon}
                                                            style={{width: "18px"}}
                                                        />
                                                : col.isFormat ?
                                                    Common[col.valid](item[col.itemName]) ?
                                                        Common[col.format](item[col.itemName])
                                                    :   item[col.itemName]
                                                : columns[0].isRowCheck ?
                                                        col_idx === 1 ?
                                                            item[col.itemName] === "ADD_ROW" ? 
                                                                <span style={{color: "blue", fontWeight: "bold"}}>추가</span> 
                                                            : 
                                                                <span style={{color: "green", fontWeight: "bold"}}>수정</span>
                                                        :   item[col.itemName]
                                                    :
                                                        col_idx === 0 ?
                                                        item[col.itemName] === "ADD_ROW" ? <span style={{color: "blue", fontWeight: "bold"}}>추가</span> : <span style={{color: "green", fontWeight: "bold"}}>수정</span>    
                                                : item[col.itemName]
                                            }
                                        </td>
                                    ))
                                }
                            </tr>
                        ))
                    }
                </tbody>
            </table>
        : null
    );
}

export default EditTable;