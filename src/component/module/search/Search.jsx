import { useEffect, useState } from 'react';
import Select from 'react-select';
import SearchIcon from "../../../assets/image/search.png";
import cancelIcon1 from "../../../assets/image/cancel-white.png";
import cancelIcon2 from "../../../assets/image/cancel-circle.png";
import KeywordPortal from './KeywordPortal';
import Toggle from '../Toggle';
import "../../../assets/css/Search.css";

/**
 * @description: 통합검색 컴포넌트
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-03-11
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - Select: 셀렉트박스
 * - KeywordPortal: 리액트포탈(검색키워드 div 분리)
 * 
 * @additionalInfo
 * - searchOptions=[]: 검색조건 셀렉트박스(value는 전체검색은 "ALL" 그 외는 검색하려는 컬럼명을 사용 ***대문자)
 * - width: 셀렉트박스 좌우길이
 * - fncSearchKeywords: 검색시 부모컴포넌트에서 값을 전달받기 위한 함수(~, :, | 의 구분자를 사용하여 하나의 텍스트로 전달 ex) "ALL:test|abc~column1:black|red|white~column2:react")
 */
const Search = ({searchOptions=[], width, height="auto", fncSearchKeywords, retrySearchText, potalId }) => {
    const [keyword, setKeyword] = useState([]);
    const [selectKey, setSelectKey] = useState("ALL");
    const [text, setText] = useState("");
    const [isReSearch, setIsReSerach] = useState(false);

    // 검색조건 select 변경
    const handleSelectChange = (e) => {
        setSelectKey(e.value);
    }

    // 텍스트 입력
    const handleChangeValue = (e) => {
        setText(e.target.value);
    }
    
    // 결과 내 재검색
    const onClickToggle = (value) => {
        const keywordCopy = structuredClone(keyword);
        let newKeyword = [];
        if(value){
            newKeyword = keywordCopy.filter(item => item.key !== "TOGGLE");
        }else{
            newKeyword = [
                ...keywordCopy
                , {
                    key: "TOGGLE",
                    label: "결과내재검색",
                    value: [""],
                }
            ];
        }
        setKeyword(newKeyword);
        fncSearchKeywords(setSearchKeyword(newKeyword));
        setText("");
    }

    // 검색
    const handleSearchValue = () => {
        if (text === "") return;

        let newKeyword;
        if(isReSearch){
            // 결과내재검색
            const existingEntry = keyword.find((entry) => entry.key === selectKey);
            if (existingEntry) {
                if (existingEntry.value.includes(text)) {
                    newKeyword = keyword;
                } else {
                    const updatedEntry = {
                        ...existingEntry,
                        value: [...existingEntry.value, text],
                    };
                    newKeyword = keyword.map((entry) =>
                        entry.key === selectKey ? updatedEntry : entry
                    );
                }
            } else {
                const foundItem = searchOptions.find(item => item.value === selectKey);
                newKeyword = [...keyword, { key: selectKey, label: foundItem.label, value: [text] }];
            }
        }else{
            //일반검색
            const foundItem = searchOptions.find(item => item.value === selectKey);
            newKeyword = [
                {
                    key: selectKey,
                    label: foundItem.label,
                    value: [text],
                }
            ]
        }
        
        setKeyword(newKeyword);
        fncSearchKeywords(setSearchKeyword(newKeyword));
        setText("");
    };

    // 검색어 텍스트로 변환
    const setSearchKeyword = (keywords) => {
        return keywords
            .map(item => `${item.key}:${item.value.join('|')}`)
            .join('~');
    }
    
    // 검색종류 삭제 버튼 이벤트
    const handleDeleteKeywords = (key) => {
        const updatedKeywords = keyword.filter(item => item.key !== key);
        setKeyword(updatedKeywords);
        fncSearchKeywords(setSearchKeyword(updatedKeywords));
    }

    // 검색어 삭제 버튼 이벤트
    const handleDeleteKeyword = (key, text) => {
        const updatedKeywords = keyword
            .map(item => {
                if (item.key === key) {
                    const updatedValue = item.value.filter(val => val !== text);
                    return { ...item, value: updatedValue };
                }
                return item;
            })
            .filter(item => item.value.length > 0);
        setKeyword(updatedKeywords);
        fncSearchKeywords(setSearchKeyword(updatedKeywords));
    }

    useEffect(() => {
        if(retrySearchText === ""){
            setKeyword([]);
        }  
    }, [retrySearchText]);

    // useEffect(() => {
    //     onClickToggle(isReSearch);
    // }, []);

    return(
        <div style={{display: "flex", justifyContent: "center", alignItems: "center"}}>
            <KeywordPortal potalId={potalId}>
                <div className="search-keyword-box">
                    {
                        keyword.length !== 0 && isReSearch ? 
                            keyword.map((item, idx) => (
                                <div key={idx} className="search-keyword">
                                    <div className="search-label">
                                        <img 
                                            src={cancelIcon1}
                                            alt="삭제"
                                            style={{width: "11px", cursor: "pointer"}}
                                            onClick={() => handleDeleteKeywords(item.key)}
                                        />
                                        {item.label}
                                    </div>
                                    {
                                        item.value.map((item2, idx2) => (
                                            <div key={idx2} className="search-value">
                                                <img 
                                                    src={cancelIcon2}
                                                    alt="삭제"
                                                    style={{width: "15px", cursor: "pointer"}}
                                                    onClick={() => handleDeleteKeyword(item.key, item2)}
                                                />
                                                {item2}
                                            </div>
                                        ))
                                    }
                                </div>
                            ))
                        : null
                    }
                </div>
            </KeywordPortal>
            <div style={{display: "flex", alignItems:"center", marginRight: "10px", marginLeft: "5px"}}>
                <span style={{width: "90px", fontSize: "13px"}}>결과 내 재검색</span>
                <Toggle onClickValue={(value) => setIsReSerach(value)}/>
            </div>
            <Select
                options={searchOptions}
                onChange={handleSelectChange}
                defaultValue={searchOptions.find(option => option.value === 'ALL')}
                styles={{
                    container: (provided) => ({
                        ...provided,
                        textAlign: "left",
                        width: width,
                        zIndex: 100,
                    }),
                    control: (provided) => ({
                        ...provided,
                        height: height, 
                    }),
                    valueContainer: (provided) => ({
                        ...provided,
                        height: height,
                        padding: '0 8px',
                    }),
                    input: (provided) => ({
                        ...provided,
                        margin: 0,
                        padding: 0,
                    }),
                }}
            />
            <div className="form-input search">
                <input 
                    className="search-input"
                    type="text"
                    value={text}
                    onChange={handleChangeValue}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          handleSearchValue();
                        }
                    }}
                />
            </div>
            <div className="search-icon" onClick={handleSearchValue}>
                <img
                    src={SearchIcon}
                    style={{width: "20px", filter: "brightness(0) invert(1)"}}
                />
            </div>
        </div>
    );
}
export default Search;