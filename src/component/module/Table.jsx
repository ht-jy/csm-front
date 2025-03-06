import React, { useState, useEffect } from "react";
import { dateUtil } from "../../utils/DateUtil";
import SearchIcon from "../../assets/image/search.png";
import ExitIcon from "../../assets/image/exit.png";
import SortIcon from "../../assets/image/sort-icon.png";
import UpIcon from "../../assets/image/up-icon.png";
import DownIcon from "../../assets/image/down-icon.png";
import HiddenLeftArrowIcon from "../../assets/image/hidden-left-arrow.png";
import { ObjChk } from "../../utils/ObjChk";
import "../../assets/css/Table.css";

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
 *      [{isSearch: true|false(검색여부), isOrder: true|false(정렬여부), isSlide: true|false(정렬/검색 숨김여부), width: th/td size, header: th 제목/input placeholder , itemName: 실제값 명칭, isItemSplit: true|false(여러 아이템 사용여부. '|' split 하여 ' ' 공백으로 연결), bodyAlign: "center"|"left"|"right"(td align), isEllipsis: true|false(td 줄임말(...)여부), isDate: true|false(날짜필드여부), dateFormat: (dateUtils 기준)}, ...]
 *  data: 실제 값 리스트
 *  searchValues={}: 검색 필드 객체
 *  onSearch: 검색 시 부모 컴포넌트 실행 함수(검색input에서 enter 입력시 실행)
 *  onSearchChange: 검색input에 타이핑시 부모 컴포넌트 실행 함수
 *  activeSearch: 검색창 활성화 여부 리스트
 *  setActiveSearch: 검색창 활성화 리스트 set 함수
 *  resetTrigger: 검색어 초기화 트리거
 *  onSortChange: 정렬시 부모 컴포넌트 실행 함수
 *  onClickRow: 행클릭 시 부모 컴포넌트 실행 함수 // 인자: ("DETAIL", 해당 행의 rowIndexName의 정보)
 *  isHeaderFixed: 헤더 부분 스크롤시 고정 여부 true|false
 *  styles: 테이블 스타일 추가 적용
 */
const Table = ({ columns, data, noDataText, searchValues={}, onSearch, onSearchChange, activeSearch=[], setActiveSearch, resetTrigger, onSortChange, onClickRow, isHeaderFixed, styles }) => {
    const [localSearchValues, setLocalSearchValues] = useState(searchValues); // 로컬 상태 유지
    const [orderState, setOrderState] = useState({}); // 각 컬럼별 정렬 상태 관리
    const [orderStateList, setOrderStateList] = useState([]);
    const [hoverState, setHoverState] = useState(null); // 마우스 오버 상태 관리

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
        if (e.key === "Enter") onSearch();
    };

    // 돋보기 아이콘 클릭 시 검색창 열기/닫기
    const toggleSearch = (itemName) => {
        setActiveSearch(prev => ({ ...prev, [itemName]: !prev[itemName] }));
    };

    // dateUtil을 기준으로 날짜 포맷
    const formatDate = (date, formatType) => {
        if (!formatType || !dateUtil[formatType]) return date;
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

    // 정렬, 검색 상태값 초기화
    useEffect(() => {
        setLocalSearchValues({});
        setOrderState({});
    }, [resetTrigger]);

    return (
        <table style={{...styles}}>
            <thead className={isHeaderFixed ? "fixed" : ""}>
                <tr>
                    {columns.map(col => (
                        <th
                            key={col.itemName}
                            className={hoverState === col.itemName ? "th-hover" : ""}
                            style={{
                                width: col.width,
                                position: "relative",
                                textAlign: "center"
                            }}
                            onMouseEnter={() => col.isSlide && setHoverState(col.itemName)}
                            onMouseLeave={() => col.isSlide && setHoverState(null)}
                        >
                            {/* 검색창이 활성화되지 않은 경우에만 텍스트 표시 */}
                            {!activeSearch[col.itemName] && <span>{col.header}</span>}
                        
                            {/* isSlide가 true일 때 숨김 아이콘과 조건에 따른 아이콘 표시 */}
                            {col.isSlide ? (
                                <>
                                    {/* 정렬 아이콘 - 조건 충족 시에만 마우스 오버로 표시 */}
                                    {hoverState === col.itemName && col.isOrder && (
                                        <div className="icon-wrapper sort-icon-wrapper">
                                            <img
                                                src={
                                                    orderState[col.itemName] === "asc" ? UpIcon :
                                                    orderState[col.itemName] === "desc" ? DownIcon :
                                                    SortIcon
                                                }
                                                alt="정렬"
                                                style={{
                                                    width: "10px",
                                                    height: "15px",
                                                    position: "absolute",
                                                    left: "5px",
                                                    top: "50%",
                                                    transform: "translateY(-50%)",
                                                    cursor: "pointer",
                                                    opacity: 1,
                                                    transition: "opacity 0.3s ease"
                                                }}
                                                onClick={() => handleSortChange(col.itemName)}
                                            />
                                        </div>
                                    )}
                        
                                    {/* 검색 아이콘 - isSearch가 true인 경우에만 표시 + 클릭 이벤트 정상화 */}
                                    {col.isSearch && (
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
                                                        width: "100%",
                                                        height: "30px",
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
                                                        right: "5px",
                                                        top: "50%",
                                                        transform: "translateY(-50%)",
                                                        cursor: "pointer",
                                                        padding: "2px"
                                                    }}
                                                    onClick={() => toggleSearch(col.itemName)}
                                                />
                                            </>
                                        ) : (
                                            hoverState === col.itemName && col.isSearch && (
                                                <div className="icon-wrapper search-icon-wrapper">
                                                    <img
                                                        src={SearchIcon}
                                                        alt="검색"
                                                        style={{
                                                            width: "17px",
                                                            position: "absolute",
                                                            right: "5px",
                                                            top: "50%",
                                                            transform: "translateY(-50%)",
                                                            filter: "brightness(0) invert(1)",
                                                            cursor: "pointer",
                                                            opacity: 1,
                                                            transition: "all 0.1s ease",
                                                        }}
                                                        onClick={() => toggleSearch(col.itemName)}
                                                    />
                                                </div>
                                            )
                                        )
                                    )}
                        
                                    {/* 숨김 아이콘 - 마우스 오버, isSearch, isOrder, 검색창 상태에 따라 표시 여부 제어 */}
                                    <img
                                        src={HiddenLeftArrowIcon}
                                        alt="숨김"
                                        style={{
                                            width: "15px",
                                            position: "absolute",
                                            right: "0px",
                                            top: "50%",
                                            transform: "translateY(-50%)",
                                            filter: "brightness(0) invert(1)",
                                            cursor: "pointer",
                                            opacity:
                                                activeSearch[col.itemName] || // 검색창이 열려있으면 숨김 아이콘 숨김
                                                (hoverState === col.itemName && (col.isSearch || col.isOrder))
                                                    ? 0
                                                    : 1,
                                            visibility:
                                                activeSearch[col.itemName] || (hoverState === col.itemName && (col.isSearch || col.isOrder))
                                                    ? "hidden"
                                                    : "visible",
                                            pointerEvents:
                                                activeSearch[col.itemName] || (hoverState === col.itemName && (col.isSearch || col.isOrder))
                                                    ? "none" // 클릭 이벤트 차단하여 버튼 클릭 방해 방지
                                                    : "auto",
                                            transition: "opacity 0.1s ease, visibility 0.1s ease"
                                        }}
                                    />
                                </>
                            ) : (
                                /* isSlide가 false인 경우 기존 로직 유지 */
                                <>
                                    {col.isOrder && (
                                        <img
                                            src={
                                                orderState[col.itemName] === "asc" ? UpIcon :
                                                orderState[col.itemName] === "desc" ? DownIcon :
                                                SortIcon
                                            }
                                            alt="정렬"
                                            style={{
                                                width: "10px",
                                                height: "15px",
                                                position: "absolute",
                                                left: "5px",
                                                top: "50%",
                                                transform: "translateY(-50%)",
                                                cursor: "pointer"
                                            }}
                                            onClick={() => handleSortChange(col.itemName)}
                                        />
                                    )}
                        
                                    {col.isSearch && (
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
                                                        width: "calc(100% - 15px)",
                                                        height: "30px",
                                                        marginLeft: "15px",
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
                                                        right: "5px",
                                                        top: "50%",
                                                        transform: "translateY(-50%)",
                                                        cursor: "pointer",
                                                        padding: "2px"
                                                    }}
                                                    onClick={() => toggleSearch(col.itemName)}
                                                />
                                            </>
                                        ) : (
                                            <img
                                                src={SearchIcon}
                                                alt="검색"
                                                style={{
                                                    width: "17px",
                                                    position: "absolute",
                                                    right: "5px",
                                                    top: "50%",
                                                    transform: "translateY(-50%)",
                                                    filter: "brightness(0) invert(1)",
                                                    cursor: "pointer"
                                                }}
                                                onClick={() => toggleSearch(col.itemName)}
                                            />
                                        )
                                    )}
                                </>
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
                        <tr 
                            className={ObjChk.all(onClickRow) ? "" : "table-tr"}
                            key={idx}
                            onClick={
                                ObjChk.all(onClickRow) ?
                                    null 
                                : 
                                    () => onClickRow(item, "DETAIL")
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
