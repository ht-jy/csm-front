import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { dateUtil } from "../../utils/DateUtil";
import { ObjChk } from "../../utils/ObjChk";
import { Common } from "../../utils/Common";
import { useTableContext } from "../context/TableContext";
import Select from 'react-select';
import DateInput from "./DateInput";
import Time12Input from "./Time12Input";
import ToggleInput from "./ToggleInput";
import TextInput from "./TextInput";
import CheckInput from "./CheckInput";
import SearchInput from "./SearchInput";
import Button from "./Button";
import RadioInput from "./RadioInput";
import Time24Input from "./Time24Input";
import useTooltip from "../../utils/hooks/useTooltip";
import SearchIcon from "../../assets/image/search.png";
import ExitIcon from "../../assets/image/exit.png";
import SortIcon from "../../assets/image/sort-icon.png";
import UpIcon from "../../assets/image/up-icon.png";
import DownIcon from "../../assets/image/down-icon.png";
import HiddenLeftArrowIcon from "../../assets/image/hidden-left-arrow.png";
import CheckIcon from "../../assets/image/check-icon.png";
import NonCheckIcon from "../../assets/image/non-check-icon.png";
import ImportantIcon from "../../assets/image/important.png";
import CompareSIcom from "../../assets/image/compare_s.png";
import CompareWIcom from "../../assets/image/compare_w.png";
import CompareCIcom from "../../assets/image/compare_c.png";
import "../../assets/css/Table.css";
import SelectInput from "./SelectInput";
import DigitFormattedInput from "./DigitFormattedInput";

/**
 * @description: 
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-17
 * @modified 최종 수정일: 2025-07-25
 * @modifiedBy 최종 수정자: 김진우
 * @modified Description
 * 2025-07-25: columns 객체에 rowSpan이 있는 경우 해당 필드가 합쳐지고 마우스 hover시 rowSpan이 적용되는 리스트까지 같이 되도록 추가
 * 
 * @additionalInfo
 * - props
 *  columns: 테이블 th/td 설정 리스트
 *      [{
 *          isSearch: true|false(검색여부), 
 *          isOrder: true|false(정렬여부), 
 *          isSlide: true|false(정렬/검색 숨김여부), 
 *          width: th/td size, 
 *          header: th 제목/input placeholder, 
 *          itemName: 실제값 명칭 | "row_checked" -> 체크박스 사용 필드 지정
 *              itemName이 "row_checked" 경우에 사용
 *              - checkType: "all"|"reverse" -> 전체선택 | 반전선택 , defalut: all
 *              - checkedItemName: 체크박스 사용 비교 state 필드명칭 -> checkedItemName가 없을시 "row_checked"로 지정된 열은 체크박스로 사용되고, 있을시 checkedItemName에 적혀있는 필드의 값으로 비교하게 된다.
 *              - checkedState: [], checkedItemName에 있는 값에서 사용할 값의 배열
 *          isItemSplit: true|false(여러 아이템 사용여부. '|' split 하여 ' ' 공백으로 연결), 
 *          bodyAlign: "center"|"left"|"right"(td align), 
 *          isEllipsis: true|false(td 줄임말(...)여부), 
 *          isDate: true|false(날짜필드여부), 
 *          dateFormat: (dateUtils 기준)},
 *          type:
 *              - number: 숫자필드로 사용 3자리 단위로 ',' 구분됨
 *              - daliy-compare: 일일근로자 비교 화면의 상태에 사용되기 위한 타입
 *              - non-edit-select: 테이블 수정모드가 아닌 상태에서도 select를 사용
 *          condition: [], 배열형태로 여러 포맷에서 조건에 맞게 사용
 *              - 사용중: 
 *                  type: "non-edit-select",
 *          ...
 *      ]
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
 *  groupKeyArr: columns에 rowSpan이 있는 경우 같은 강조 효과를 주기 위한 키 배열
 *  styles: 테이블 스타일 추가 적용
 *  isEdit: 수정폼 변환 true|false
 *  editInfo: 수정폼 정보 리스트
 *  onChangeEditList:  수정한 데이터 리스트 반환 함수
 */
const Table = forwardRef(({ 
    columns, data=[], noDataText, searchValues={}, onSearch, onSearchChange, activeSearch=[], setActiveSearch, resetTrigger, onSortChange, onClickRow, isHeaderFixed, groupKeyArr, styles,
    isEdit, editInfo, onChangeEditList
}, ref) => {
    const [localSearchValues, setLocalSearchValues] = useState(searchValues); // 로컬 상태 유지
    const [orderState, setOrderState] = useState({}); // 각 컬럼별 정렬 상태 관리
    const [orderStateList, setOrderStateList] = useState([]);
    const [hoverState, setHoverState] = useState(null); // 마우스 오버 상태 관리
    const [tableData, setTableData] = useState([]);
    const [initTableData, setInitTableData] = useState([]);
    const [editList, setEditList] = useState([]);
    const [addRowIdx, setAddRowIdx] = useState([]);
    const [editAddList, setEditAddList] = useState([]);
    const [checkedItemList, setCheckedItemList] = useState([]);
    const [hoveredGroupKey, setHoveredGroupKey] = useState(null);

    // 툴팁
    useTooltip([data]);
    // 테이블 context
    const { setCheckedList, nonEditSelect, funcIsEditModeAddData } = useTableContext();
    
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

    // 수정모드에서 추가생성한 데이터 bool
    const isEditModeAddData = (item) => {
        // context
        if(typeof funcIsEditModeAddData === "function") {
            return funcIsEditModeAddData(item);
        }else{
            return false;
        }
    }

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

    // header 체크박스 클릭
    const onClickHeaderChecked = (value, type) => {
        if(type === "reverse"){
            onClickReverseCheck(value);
        }else{
            onClickAllCheck(value);
        }
    }

    // header 체크박스 클릭 - 전체 선택/해제
    const onClickAllCheck = (value) => {
        const tableDataCopy = structuredClone(tableData);
        let newTableData = [];
        if(value === 'Y'){
            newTableData = tableDataCopy.map(item => {
                return {...item, row_checked: "Y"};
            });
            setCheckedItemList(newTableData);

            // context
            if(typeof setCheckedList === "function") {
                setCheckedList(newTableData);
            }
        }else{
            newTableData = tableDataCopy.map(item => {
                return {...item, row_checked: "N"};
            });
            setCheckedItemList([]);

            // context
            if(typeof setCheckedList === "function") {
                setCheckedList([]);
            }
        }
        setTableData(newTableData);
    }

    // header 체크박스 클릭 - 체크 반전
    const onClickReverseCheck = (value) => {
        const tableDataCopy = structuredClone(tableData);
        let newTableData = [];

        newTableData = tableDataCopy.map(item => {
            if(item.row_checked === 'Y'){
                return {...item, row_checked: "N"};
            }else{
                return {...item, row_checked: "Y"};
            }
            
        });

        const newCheckedItem = newTableData.filter(item => item.row_checked === "Y");

        // context
        if(typeof setCheckedList === "function") {
            setCheckedList(newCheckedItem);
        }

        setCheckedItemList(newCheckedItem);
        setTableData(newTableData);
    }

    // row 체크박스 클릭
    const onClickRowCheck = (checked, index) => {
        const item = tableData.find(data => data.index === index) || {};

        let newCheckedItem = [];
        if(checked === "Y"){
            newCheckedItem = [...checkedItemList, item];
        }else{
            newCheckedItem = checkedItemList.filter(obj => obj.index !== item.index);
        }
        setCheckedItemList(newCheckedItem);

        // context
        if(typeof setCheckedList === "function") {
            setCheckedList(newCheckedItem);
        }

        const tableDataCopy = structuredClone(tableData);
        let newTableData = [];
        newTableData = tableDataCopy.map(obj => {
            if(obj.index === item.index){
                return {...obj, row_checked: checked}
            }
            return obj;
        });
        setTableData(newTableData);
    }

    // 체크 선택된 아이템 리스트 반환
    const getCheckedItemList = () => {
        return checkedItemList;
    }

    /***** edit *****/
    // 테이블 값 변경 이벤트
    const onChangeTableData = (idx, col, value) => {
        if(idx === undefined || col === undefined || value === undefined){
            return;
        }
        const initRow = initTableData.find(item => item.index === idx);
        const updatedRow = tableData.find(item => item.index === idx);
        const updatedRowCopy = { ...updatedRow };
        let tableNewData = [];
        let newEditList = [];

        // 테이블 리스트 데이터 변경
        if(updatedRow !== undefined){
            updatedRowCopy[col.itemName] = value;
            tableNewData = tableData.map(item => {
                if(item.index === idx){
                    return { ...item, [col.itemName]: value };
                }
                return item;
            });
            setTableData(tableNewData);
        }

        // 체크된 리스트 데이터 변경
        const newCheckedItemList = checkedItemList.map(item => {
            if(item.index === idx){
                return { ...item, [col.itemName]: value };
            }
            return item;
        });
        setCheckedItemList(newCheckedItemList);
        // context
        if(typeof setCheckedList === "function") {
            setCheckedList(newCheckedItemList);
        }

        if(!isEdit) return;
        
        // editList(추가/수정 row) 수정
        const editRow = editList.find(item => item.index === idx)
        if(initRow === undefined){
            // 추가 리스트
            if(editRow === undefined){
                // 수정리스트에 추가
                newEditList = [...editList, updatedRowCopy];
            }else{
                // 수정리스트의 객체값 변경
                newEditList = editList.map(item => {
                    if(item.index === idx){
                        return { ...item, [col.itemName]: value };
                    }
                    return item;
                });
            }
            setEditList(newEditList);
        }else{
            // 수정 리스트
            if (editCompareInit(initRow, updatedRowCopy)) {
                // 수정한 값이 기존과 동일한 경우 수정리스트에서 삭제
                newEditList = editList.filter(item => item.index !== idx);
                setEditList(newEditList);
            } else {
                if(editRow === undefined){
                    // 수정한 값이 기존과 다르고 수정리스트에 없는 경우 리스트에 추가
                    newEditList = [...editList, updatedRowCopy];
                } else{
                    // 수정한 값이 기존과 다르고 수정리스트에 있는 경우 해당 객체값 변경
                    newEditList = editList.map(item => {
                        if(item.index === idx){
                            return { ...item, [col.itemName]: value };
                        }
                        return item;
                    });
                }
                setEditList(newEditList);
            }
        }
        
        onChangeEditList(newEditList);
    };


    //item.index, col_idx, values
    // 테이블 값 변경 이벤트 - editType: "searchModal"
    const onChangeTableDataByDependency = (rowIdex, colIdx, values) => {
        const editMainCol = editInfo[colIdx];
        const selectedModal = editInfo[colIdx].selectedModal;

        const itemNames = editInfo
                            .filter(item => item.dependencyModal === selectedModal)
                            .map(item => item.itemName);
        itemNames.push(editMainCol.itemName);

        const updateData = tableData.find(item => item.index === rowIdex);
        const updatedData = { ...updateData };

        itemNames.forEach(key => {
            updatedData[key] = values[key];
        });

        const newTableData = tableData.map(item => {
            if(item.index === rowIdex){
                return updatedData;
            }
            return item;
        });
        setTableData(newTableData);

        let newEditList = [];
        const findEditList = editList.find(item => item.index === updatedData.index);
        if(findEditList !== undefined){
            newEditList = editList.map(item => {
                if(item.index === updatedData.index){
                    return {...updatedData};
                }
                return item;
            });
        }else{
            newEditList = [...editList, updatedData];
        }
        setEditList(newEditList);
        onChangeEditList(newEditList);

    }

    // 원본데이터와 수정한 데이터 비교 
    // *** date와 time은 go의 time.Time 타입에 따른 비교이기 때문에 다른 언어를 사용한다면 에러가 발생할 수 있다.
    const editCompareInit = (editData, initData) => {
        for (const key in editData) {
            if (Object.prototype.hasOwnProperty.call(initData, key)) {
                const editValue = editData[key];
                const initValue = initData[key];
    
                // 1. 필드명이 'time'이 포함된 경우
                if (key.toLowerCase().includes('time')) {
                    const normalizedEdit = normalizeTime(editValue);
                    const normalizedInit = normalizeTime(initValue);
    
                    if (normalizedEdit !== normalizedInit) {
                        return false;
                    }
                } else {
                    // 2. 일반 필드 비교
                    if (editValue !== initValue) {
                        return false;
                    }
                }
            }
        }
        return true;
    }
    
    // 시간 필드 비교를 위한 보조 함수
    function normalizeTime(value) {
        if (value === null || value === '0001-01-01T00:00:00Z') {
            return null; // null로 통일해서 비교
        }
        if (typeof value === 'string' && value.includes('T')) {
            const timePart = value.split('T')[1]; // "00:00:00+09:00" 같은 부분
            if (!timePart) return null;
    
            // 시:분만 추출 (예: "00:00")
            const hhmm = timePart.slice(0,5);
            return hhmm;
        }
        return value;
    }

    // 추가/수정 데이터 초기화
    const initEditList = () => {
        setEditList([]);
    }

    // 테이블 td 스타일 
    const tdEditStyle = (column, editCol) => {
        if(isEdit && editCol?.editType !== ""){
            return {maxWidth: column.width, padding: 0}
        }else{
            return {maxWidth: column.width}
        }
    }

    // 테이블 백그라운드
    const tdBackgroudColor = (item) => {
        return item.backgroundColor ? {backgroundColor: item.backgroundColor} : {backgroundColor: ""}
    }

    // rowSpan이 있는 경우 같은 강조 효과를 주기 위한 그룹키 생성
    const getRowGroupKey = (item, groupKey) => {
        if (!Array.isArray(groupKey) || groupKey.length === 0) return "";
        return groupKey.map(f => item[f]).join("_");
    };

    // 수정모드 변경. 최상단에 추가 버튼만 있는 row 생성
    const editTableMode = (addFieldName) => {
        let tableDataCopy = [...tableData];
        const copiedObject = { ...tableDataCopy[0] };
        Object.keys(copiedObject).forEach(key => {
            if (typeof copiedObject[key] === 'number') {
                copiedObject[key] = 0;
            } else if (typeof copiedObject[key] === 'string') {
                copiedObject[key] = "";
            }
        });

        if(addFieldName) {
            copiedObject[addFieldName] = "ADD_BTN";
            copiedObject["index"] = -1;
            copiedObject["tableAddRow"] = true;
        }

        tableDataCopy.unshift(copiedObject);
        setTableData([...tableDataCopy]);
        
        setEditAddList([copiedObject]);
    }

    // 테이블 상단 두번째에 입력 row 추가
    const addTableEmptyRow = () => {
        let tableDataCopy = [...tableData];
        let copiedObject = { ...tableDataCopy[1] };

        // 테이블에 row가 없는 경우
        if(tableData.length === 1){
            copiedObject = editInfo.reduce((acc, info) => {
                return { ...acc, [info.itemName]: info.defaultValue };
            }, copiedObject);
            copiedObject["index"] = 1;
            setAddRowIdx(copiedObject["index"]);
        // 테이블에 row가 있는 경우
        } else {
            copiedObject['unableEdit'] = 'N'; // 맨 위의 데이터가 수정불가인 경우가 있는 경우를 위하여 디폴트 값 설정
            Object.keys(copiedObject).forEach(key => {
                const findEditinfo = editInfo.find(item => item.itemName === key);
                if (findEditinfo !== undefined && findEditinfo.defaultValue !== undefined) {
                    copiedObject[key] = findEditinfo.defaultValue;
                } else if(typeof copiedObject[key] === 'number') {
                    copiedObject[key] = 0;
                } else if (typeof copiedObject[key] === 'string') {
                    copiedObject[key] = "";
                }
            });
            copiedObject["index"] = addRowIdx+1;
            copiedObject["edit_type"] = "ADD";
            setAddRowIdx(copiedObject["index"]);
        }

        const deleteFieldName = editInfo.find(item => item.editType === "delete").itemName;
        
        if(deleteFieldName) {
            copiedObject[deleteFieldName] = "ADD_ROW";
        }

        const newEditList = [
            ...tableDataCopy.slice(0, 1),
            copiedObject,
            ...tableDataCopy.slice(1)
        ];
        setTableData([...newEditList]);
        
        const editAddListCopy = [...editAddList];
        const newEditAddList = [
            ...editAddListCopy.slice(0, 1),
            copiedObject,
            ...editAddListCopy.slice(1)
        ];
        setEditAddList(newEditAddList);
    }

    // 추가한 row 삭제
    const editDeleteRow = (index) => {
        // 테이블 데이터 삭제
        const nonDeleteRows = tableData.filter(item => item.index !== index);
        setTableData([...nonDeleteRows]);

        // edit 테이블 데이터 삭제
        const newEditList = editList.filter(item => item.index !== index);
        setEditList([...newEditList]);
        onChangeEditList([...newEditList]);
    }

    // 수정모드 취소
    const editModeCancel = () => {
        setTableData(initTableData);
        setEditList([]);
        setEditAddList([]);
        onChangeEditList([]);
    }

    /***** useImperativeHandle *****/

    useImperativeHandle(ref, () => ({
        addTableEmptyRow, editModeCancel, editTableMode, editModeCancel, getCheckedItemList, initEditList
    }));

    /***** useEffect *****/

    // 부모 컴포넌트에 정렬 값 전달
    useEffect(() => {
        if(onSortChange !== undefined){
            onSortChange(convertToQueryString(orderStateList).toUpperCase());
        }
    }, [orderStateList]);

    // 데이터 초기화
    useEffect(() => {
        // 체크모드
        if(columns[0].itemName === "row_checked" && !isEdit){
            // columns[0].itemName = "row_checked";
            data = data.map(item => {
                return {...item, row_checked: "N"}
            });
        }

        let dataCopy = [];
        if(isEdit){
            /***** 수정 모드 *****/
            dataCopy = structuredClone(data);
            dataCopy.unshift(...editAddList);
        }else{
            dataCopy = structuredClone(data);
        }

        setTableData(structuredClone(dataCopy));
        setInitTableData(structuredClone(data));     
        setAddRowIdx(dataCopy.length);
        setCheckedItemList([]);
    }, [data]);

    // 수정모드 취소
    useEffect(() => {
        if(isEdit !== undefined && !isEdit){
            setTableData(initTableData);
        }
    }, [isEdit]);

    // 정렬, 검색 상태값 초기화
    useEffect(() => {
        setLocalSearchValues({});
        setOrderState({});
    }, [resetTrigger]);

    return (
        <table style={{...styles}}>
            <thead className={isHeaderFixed ? "fixed" : ""}>
                <tr>
                    {columns.map((col, idx) => (
                        col.colSpan === 0 ? null :
                        <th
                            key={`${col.itemName}${idx}`}
                            className={hoverState === col.itemName ? "th-hover" : ""}
                            style={{
                                width: col.width,
                                position: "relative",
                                textAlign: "center"
                            }}
                            onMouseEnter={() => col.isSlide && setHoverState(col.itemName)}
                            onMouseLeave={() => col.isSlide && setHoverState(null)}
                            colSpan={col.colSpan}
                        >
                            {
                                col.itemName === "row_checked" && !isEdit ?
                                    <div>
                                        <CheckInput checkFlag={col.checked} setCheckFlag={(value) => onClickHeaderChecked(value, col.checkType)}/>
                                    </div>
                                : null
                            }
                            {/* 검색창이 활성화되지 않은 경우에만 텍스트 표시 */}
                            {!activeSearch[col.itemName] && <span>{col.header}</span>}
                        
                            {/* isSlide가 true일 때 숨김 아이콘과 조건에 따른 아이콘 표시 */}
                            {col.isSlide ? (
                                <>
                                    {/* 정렬 아이콘 - 조건 충족 시에만 마우스 오버로 표시 */}
                                    {hoverState === col.itemName && col.isOrder && (
                                        <div className="icon-wrapper sort-icon-wrapper left-box-shadow">
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
                                                <div className="icon-wrapper search-icon-wrapper right-box-shadow">
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
                {tableData.length === 0 ? (
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
                    tableData.map((item, idx) => (
                        <tr 
                            key={idx}
                            className={ObjChk.all(onClickRow) ? "" : groupKeyArr !== undefined && getRowGroupKey(item, groupKeyArr) === hoveredGroupKey ? "table-tr highlight" : "table-tr"}
                            onMouseEnter={ObjChk.all(onClickRow) ? undefined : () => setHoveredGroupKey(getRowGroupKey(item, groupKeyArr))}
                            onMouseLeave={ObjChk.all(onClickRow) ? undefined : () => setHoveredGroupKey(null)}
                            onClick={ObjChk.all(onClickRow) ? undefined : () => onClickRow(item, "DETAIL")}
                        >
                            {columns.map((col, col_idx) => (
                                !col.rowSpan || idx % col.rowSpan === 0 ?
                                <td
                                    key={`cell-${idx}-${col_idx}-${col.itemName}`}
                                    className={`${col.bodyAlign} ${col.isEllipsis ? "ellipsis-tooltip" : ""} ${item[col.boldItemName] === 'Y' || item[col.boldItemName] === true ? "fw-bold" : ""} ${isEditModeAddData(item) ? "td-backgroud-sort" : ""}`}
                                    style={editInfo ? {...tdEditStyle(col, editInfo[col_idx]), ...tdBackgroudColor(item)} : {maxWidth: col.width, ...tdBackgroudColor(item)}}
                                    rowSpan= {col.rowSpan}
                                >
                                    {
                                        /***** Edit *****/
                                        isEdit ?
                                            item["tableAddRow"] !== undefined && item["tableAddRow"]?
                                                item[col.itemName] === "ADD_BTN" ?
                                                    <Button
                                                        text={"추가"}
                                                        onClick={addTableEmptyRow}
                                                        style={{height: "28px", padding: 0, fontSize: "13px", paddingLeft: "5px", paddingRight: "5px"}}
                                                    />
                                                :   null
                                            :   col.itemName === "row_checked" ?
                                                    null                                      
                                            :   editInfo[col_idx].editType === "delete" && item[col.itemName] === "ADD_ROW" ?
                                                    <Button
                                                        text={"삭제"}
                                                        onClick={() => editDeleteRow(item.index)}
                                                        style={{height: "28px", padding: 0, fontSize: "13px", paddingLeft: "5px", paddingRight: "5px"}}
                                                    />
                                            :   editInfo[col_idx].editType === "number" ?
                                                    item["unableEdit"] ?
                                                        item[col.itemName]
                                                    : 
                                                        <DigitFormattedInput 
                                                            initNum={item[col.itemName]}
                                                            setNum={(value) => onChangeTableData(item.index, editInfo[col_idx], value)}
                                                            format={editInfo[col_idx].format}
                                                            style={{width: "80%", height: "28px"}}
                                                        />  
                                            :   editInfo[col_idx].editType === "toggleText" ?
                                                    item["unableEdit"] ?
                                                        item[col.itemName]
                                                    : 
                                                        <TextInput 
                                                            initText={item[col.itemName]}
                                                            setText={(value) => onChangeTableData(item.index, editInfo[col_idx], value)}
                                                        />
                                            :   editInfo[col_idx].editType === "text" ?
                                                    item["unableEdit"] ?
                                                        item[col.itemName]
                                                    : 
                                                        <TextInput 
                                                            initText={item[col.itemName]}
                                                            setText={(value) => onChangeTableData(item.index, editInfo[col_idx], value)}
                                                        />
                                            :   editInfo[col_idx].editType === "searchModal"  && JSON.stringify(item).includes("ADD_ROW") ?
                                                    item["unableEdit"] ?
                                                        item[col.itemName]
                                                    : 
                                                        <SearchInput
                                                            selectedModal={editInfo[col_idx].selectedModal}
                                                            inputText={item[col.itemName]}
                                                            inputItemName={editInfo[col_idx].itemName}
                                                            setSearchText={(values) => onChangeTableDataByDependency(item.index, col_idx, values)}
                                                        />
                                            :   editInfo[col_idx].editType === "radio" ?
                                                    item["unableEdit"] ?
                                                        <RadioInput
                                                            itemName={col.itemName + idx}
                                                            selectedValue={item[col.itemName]}
                                                            values={col.radioValues}
                                                            labels={col.radioLabels}
                                                            disabled={true}
                                                            // setRadio={(value) => onChangeTableData(item.index, editInfo[col_idx], value)}
                                                        />
                                                    : 
                                                        <RadioInput
                                                            itemName={editInfo[col_idx].itemName + idx}
                                                            selectedValue={item[col.itemName]}
                                                            values={editInfo[col_idx].radioValues}
                                                            labels={editInfo[col_idx].radioLabels}
                                                            disabled={false}
                                                            setRadio={(value) => onChangeTableData(item.index, editInfo[col_idx], value)}
                                                            checked={[true, false]}
                                                        />                                            
                                            :   col.isDate ?
                                                    item["unableEdit"] ?
                                                        formatDate(item[col.itemName], col.dateFormat)
                                                    : 
                                                        editInfo[col_idx].editType === "date" ?                                                    
                                                            <DateInput 
                                                                time={formatDate(item[col.itemName], col.dateFormat)} 
                                                                setTime={(value) => onChangeTableData(item.index, editInfo[col_idx], dateUtil.parseToGo(value))} 
                                                                dateInputStyle={{margin: "0px", height: "28px", fontSize: "15px"}}
                                                                isCalendarHide={true}
                                                            ></DateInput>
                                                        : editInfo[col_idx].editType === "time24" ?
                                                            <Time24Input 
                                                                time={item[col.itemName]}
                                                                setTime={(value) => onChangeTableData(item.index, editInfo[col_idx], value)}
                                                            />
                                                        : editInfo[col_idx].editType === "time12" ?
                                                            <Time12Input 
                                                                time={item[col.itemName]}
                                                                setTime={(value) => onChangeTableData(item.index, editInfo[col_idx], value)}
                                                            />
                                                        : formatDate(item[col.itemName], col.dateFormat)
                                            :   col.isChecked ?
                                                    item["unableEdit"] ?
                                                        item[col.itemName] === 'Y' ?
                                                            <img 
                                                                src={CheckIcon}
                                                                style={{width: "18px"}}
                                                            />
                                                        :   <img 
                                                                src={NonCheckIcon}
                                                                style={{width: "16px"}}
                                                            />
                                                    : 
                                                        <CheckInput checkFlag={item[col.itemName]} setCheckFlag={(value) => onChangeTableData(item.index, editInfo[col_idx], value)}/>
                                            : item[col.itemName]
                                        /***** Non Edit *****/
                                        : col.itemName === "row_checked" ?
                                            col.checkedItemName ?
                                                col.checkedState.find(state => state === item[col.checkedItemName]) && (
                                                    <div>
                                                        <CheckInput checkFlag={item[col.itemName]} setCheckFlag={(value) => onClickRowCheck(value, item.index)}/>
                                                    </div>
                                                )
                                            :
                                                <div>
                                                    <CheckInput checkFlag={item[col.itemName]} setCheckFlag={(value) => onClickRowCheck(value, item.index)}/>
                                                </div>
                                        : col.isDate ?
                                            formatDate(item[col.itemName], col.dateFormat)
                                        : col.isItemSplit ? 
                                            col.itemName
                                            .split("|")
                                            .map(itemName => item[itemName])
                                            .join(' ')
                                        : col.addItem ?
                                            item[col.itemName] + " " + item[col.addItem]                                        
                                        : col.isChecked ?
                                            item[col.itemName] === 'Y' ?
                                                <img 
                                                    src={CheckIcon}
                                                    style={{width: "18px"}}
                                                />
                                            :   <img 
                                                    src={NonCheckIcon}
                                                    style={{width: "16px"}}
                                                />
                                        : col.isFormat ?
                                            // Common[col.valid](item[col.itemName]) ?
                                            //     Common[col.format](item[col.itemName])
                                            // :   
                                                Common[col.format](item[col.itemName])
                                        : col.importantName ? 
                                            item[col.importantName] === 'Y' ?
                                            <>
                                                <div
                                                    style={{
                                                        boxSizing: "border-box",
                                                        display: "inline-block",
                                                        margin: "0px 5px 0px 0px",
                                                        padding: "3px",
                                                        borderRadius: "3px",
                                                        backgroundColor: "#d89e00ff",
                                                        color: "white",
                                                        fontSize: "12px",
                                                        fontWeight:"normal",
                                                    }}
                                                    >
                                                        상시 
                                                    </div>
                                                {item[col.itemName]}
                                            </>
                                            : item[col.itemName]
                                        : col.isRadio ?
                                            <RadioInput
                                                itemName={col.itemName + idx}
                                                selectedValue={item[col.itemName]}
                                                values={col.radioValues}
                                                labels={col.radioLabels}
                                                disabled={true}
                                                // setRadio={(value) => onChangeTableData(item.index, editInfo[col_idx], value)}
                                            />
                                        : col.type === "number" ?
                                            Common.formatNumber(item[col.itemName])
                                        : col.type === "daliy-compare" ?
                                            item[col.itemName] === "S" ?
                                                <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                                                    <img src={CompareSIcom} style={{width: "20px"}}/>
                                                    <span style={{paddingLeft: "5px"}}>반영</span>
                                                </div>
                                            : item[col.itemName] === "X" ?
                                                <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                                                    <img src={CompareSIcom} style={{width: "20px"}}/>
                                                    <span style={{paddingLeft: "5px"}}>추가</span>
                                                </div>
                                            : item[col.itemName] === "W" ?
                                                <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                                                    <img src={CompareWIcom} style={{width: "20px"}}/>
                                                    <span style={{paddingLeft: "5px"}}>확인</span>
                                                </div>
                                            : item[col.itemName] === "C" ?
                                                <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                                                    <img src={CompareCIcom} style={{width: "20px"}}/>
                                                    <span style={{paddingLeft: "5px"}}>경고</span>
                                                </div>
                                            : "-"
                                        : col.type === "non-edit-select" ?
                                            col.condition[2].includes(item[col.condition[1]]) ?
                                                <SelectInput
                                                    options={nonEditSelect[col.condition[0]] || []}
                                                    defaultValue={item[col.itemName] || "NONE"}
                                                    onChange={(value) => onChangeTableData(item.index, col, value)}
                                                />
                                            : ObjChk.ensureArray(nonEditSelect[col.condition[0]]).find(opt => opt.value === item[col.itemName])?.label
                                        : col.type ==="fill-number" ?
                                            Common.fillZeroNumber(item[col.itemName], col.fillLen)
                                        : item[col.itemName]
                                        
                                    }
                                </td> :null
                            ))}
                        </tr>
                    ))
                )}
            </tbody>
        </table>
    );
});

export default Table;
