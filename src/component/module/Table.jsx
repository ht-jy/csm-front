import React, { useState, useEffect } from "react";
import { dateUtil } from "../../utils/DateUtil";
import SearchIcon from "../../assets/image/search.png";
import ExitIcon from "../../assets/image/exit.png";
import SortIcon from "../../assets/image/sort-icon.png";
import UpIcon from "../../assets/image/up-icon.png";
import DownIcon from "../../assets/image/down-icon.png";
import { ObjChk } from "../../utils/ObjChk";

/**
 * @description: 
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-17
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @additionalInfo
 * - props
 *  columns: 테이블 th/td 설정 리스트
 *      [{isSearch: true|false(검색여부), width: th/td size, header: th 제목/input placeholder , itemName: 실제값 명칭, isItemSplit: true|false(여러 아이템 사용여부. '|' split 하여 ' ' 공백으로 연결), bodyAlign: "center"|"left"|"right"(td align), isEllipsis: true|false(td 줄임말(...)여부), isOrder: true|false(정렬여부), isDate: true|false(날짜필드여부), dateFormat: (dateUtils 기준)}, ...]
 *  data: 실제 값 리스트
 *  searchValues={}: 검색 필드 객체
 *  onSearch: 검색 시 부모 컴포넌트 실행 함수(검색input에서 enter 입력시 실행)
 *  onSearchChange: 검색input에 타이핑시 부모 컴포넌트 실행 함수
 *  activeSearch: 검색창 활성화 여부 리스트
 *  setActiveSearch: 검색창 활성화 리스트 set 함수
 *  resetTrigger: 검색어 초기화 트리거
 *  onSortChange: 정렬시 부모 컴포넌트 실행 함수
 *  rowIndexName: 행클릭시 행의 정보를 구분할 열 이름
 *  onClickRow: 행클릭 시 부모 컴포넌트 실행 함수 // 인자: ("DETAIL", 해당 행의 rowIndexName의 정보)
 */
const Table = ({ columns, data, noDataText, searchValues={}, onSearch, onSearchChange, activeSearch, setActiveSearch, resetTrigger, onSortChange, styles, rowIndexName, onClickRow  }) => {
    const [localSearchValues, setLocalSearchValues] = useState(searchValues); // 로컬 상태 유지
    const [orderState, setOrderState] = useState({}); // 각 컬럼별 정렬 상태 관리
    const [orderStateList, setOrderStateList] = useState([]);

    // 정렬 아이콘 클릭 시 상태 변경 및 정렬 함수 실행
    const handleSortChange = (itemName) => {
        const newOrder = orderState[itemName] === "asc" ? "desc" : orderState[itemName] === "desc" ? null : "asc";
        setOrderState((prev) => ({ ...prev, [itemName]: newOrder }));

        setOrderStateList((prevList) => {
            // 기존 리스트에서 동일한 itemName 찾기
            const existingItemIndex = prevList.findIndex((item) => item.name === itemName);
      
            if (newOrder === null) {
              // newOrder가 null이면 리스트에서 제거
              return prevList.filter((item) => item.name !== itemName);
            }
      
            if (existingItemIndex !== -1) {
              // 이미 존재하면 order 값만 변경
              return prevList.map((item, index) =>
                index === existingItemIndex ? { ...item, order: newOrder } : item
              );
            }
      
            // 존재하지 않으면 새로 추가
            return [...prevList, { name: itemName, order: newOrder }];
        });
    };

    // Enter 키 이벤트 처리
    const handleKeyPress = (e, itemName) => {
        if (e.key === "Enter") {
            onSearch();
        }
    };

    // 돋보기 아이콘 클릭 시 검색창 열기/닫기
    const toggleSearch = (itemName) => {
        setActiveSearch(prev => ({ ...prev, [itemName]: !prev[itemName] }));
    };

    // dateUtil을 기준으로 날짜 포맷
    const formatDate = (date, formatType) => {
        if (!formatType || !dateUtil[formatType]) return date; // 해당 포맷 함수가 없으면 원본 반환
        return dateUtil[formatType](date);
    };

    // 쿼리에 사용될 order by 문으로 변환
    const convertToQueryString = (orderStateList) => {
        return orderStateList
          .map(item => `${item.name} ${item.order}`)
          .join(", ");
      };

    // 부모 컴포넌트에 정렬 값 전달
    useEffect(() => {
        if(onSortChange !== undefined){
            onSortChange(convertToQueryString(orderStateList).toUpperCase());
        }
    }, [orderStateList]);

    // 부모 컴포넌트에 검색 값 전달
    useEffect(() => {
        setLocalSearchValues({});
    }, [resetTrigger]);

    return (
        <table style={{...styles}}>
            <thead>
                <tr>
                    {columns.map(col => (
                        <th
                            key={col.itemName}
                            style={{
                                width: col.width,
                                position: "relative",
                                textAlign: "center"
                            }}
                        >
                            {col.isOrder && (
                                <img
                                    src={
                                        orderState[col.itemName] === "asc" ? UpIcon :
                                        orderState[col.itemName] === "desc" ? DownIcon :
                                        SortIcon
                                    }
                                    alt="정렬"
                                    style={{
                                        width: "15px",
                                        height: "20px",
                                        position: "absolute",
                                        left: "5px",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        cursor: "pointer"
                                    }}
                                    onClick={() => handleSortChange(col.itemName)}
                                />
                            )}
                            {col.isSearch ? (
                                activeSearch[col.itemName] ? (
                                    <>
                                        <input
                                            type="text"
                                            value={localSearchValues[col.itemName] ?? ""} 
                                            onChange={(e) => {
                                                const updatedValue = e.target.value;
                                                setLocalSearchValues(prev => ({ ...prev, [col.itemName]: updatedValue })); 
                                                onSearchChange(col.itemName, updatedValue); 
                                            }}
                                            onKeyDown={(e) => handleKeyPress(e, col.itemName)}
                                            placeholder={`${col.header} 입력`}
                                            style={{
                                                width: "calc(100% - 17px)",
                                                height: "30px",
                                                marginLeft: "17px",
                                                fontSize: "14px",
                                                border: "1px solid #aaa",
                                                borderRadius: "5px",
                                                outline: "none",
                                                boxShadow: "inset 0 1px 3px rgba(0,0,0,0.2)",
                                                boxSizing: "border-box",
                                                textAlign: "left"
                                            }}
                                            autoFocus
                                        />
                                        <img
                                            src={ExitIcon}
                                            alt="닫기"
                                            style={{
                                                width: "25px",
                                                position: "absolute",
                                                right: "10px",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                cursor: "pointer",
                                                padding: "2px"
                                            }}
                                            onClick={() => toggleSearch(col.itemName)}
                                        />
                                    </>
                                ) : (
                                    <>
                                        <span>{col.header}</span>
                                        <img
                                            src={SearchIcon}
                                            alt="검색"
                                            style={{
                                                width: "20px",
                                                position: "absolute",
                                                right: "5px",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                filter: "brightness(0) invert(1)",
                                                cursor: "pointer"
                                            }}
                                            onClick={() => toggleSearch(col.itemName)}
                                        />
                                    </>
                                )
                            ) : (
                                col.header
                            )}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {data.length === 0 ? (
                    <tr>
                        <td className="center" colSpan={columns.length}>
                            {
                                ObjChk.all(noDataText) ?
                                    "등록된 데이터가 없습니다."
                                :
                                    noDataText
                            }
                        </td>
                    </tr>
                ) : (
                    data.map((item, idx) => (
                        <tr key={idx}
                            
                            onClick={
                                rowIndexName != null && onClickRow != null ?
                                    () => onClickRow("DETAIL", item[rowIndexName]) : 
                                   null
                                }
                            >
                            {columns.map(col => (
                                <td
                                    key={col.itemName}
                                    className={`${col.bodyAlign} ${col.isEllipsis ? "ellipsis" : ""}`}
                                    style={{ maxWidth: col.width }}
                                >
                                    {
                                        col.isDate ?
                                            formatDate(item[col.itemName], col.dateFormat)
                                        : col.isItemSplit ? 
                                            col.itemName
                                            .split("|")
                                            .map(itemName => item[itemName])
                                            .join(' ')
                                        : item[col.itemName]
                                    }
                                </td>
                            ))}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
};

export default Table;