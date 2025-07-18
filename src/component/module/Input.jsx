import { useState, useEffect } from "react";
import FormCheckInput from "react-bootstrap/esm/FormCheckInput";
import Select from 'react-select';
import "../../assets/css/Input.css";
import "../../assets/css/Scrollbar.css";
import { Common } from "../../utils/Common";
import DateInput from "./DateInput";
import Radio from "./Radio";
import SearchAllSiteModal from "./modal/SearchAllSiteModal";
import CancelIcon from "../../assets/image/cancel.png"
import SearchAllProjectModal from "./modal/SearchAllProjectModal";

/**
 * @description: 상세화면 모달 Input 컴포넌트
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-13
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - FormCheckInput
 * - Select.jsx
 * 
 * @additionalInfo
 * - props: 
 *  editMode: true|false (수정가능 여부)
 *  type: "text"|"checkbox"|"select" | "site" | "project" | "date" |  "date-duration" (input type 추후에 추가 예정)
 *  span: "double"|"full"(girdModal col 개수)
 *  label: input label
 *  value: input value
 *  onValueChange: function
 *  selectData: select data
 *  checkedLabels: checkbox [true, false] spanText
 *  textFormat: text Format function name
 *  isHide: false: 보이기, true: 숨김
 *  isAll : true: "전체 or 미지정" 넣기, false: 실제 데이터만 (site의 경우 미지정, project의 경우 전체)
 */
const Input = ({ editMode, type, span, label, value, onValueChange, selectData, checkedLabels=["", ""], radioValues=[], radioLabels=[], textFormat, isHide=false, labelWidth="100px", item, isRequired = false, isAll = false }) => {
    const [isValid, setIsValid] = useState(true);
    const [isChecked, setIsChecked] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null); // 초기값을 null로 설정
    const [searchStartTime, setSearchStartTime] = useState(type==="date-duration" ? (value?.startTime):  value);
    const [searchEndTime, setSearchEndTime] = useState(type==="date-duration" && value?.endTime);
    const [isSiteOpenModal, setIsSiteOpenModal] = useState(false);
    const [isProjectOpenModal, setIsProjectOpenModal] = useState(false);
    const [maskValue, setMaskValue] = useState("");

    // input 마스킹 이벤트
    const inputChangeRegidentMasking = (event) => {
        // 마스킹 값 변경
        const newMaskValue = event.target.value;
        setIsValid(newMaskValue.trim() !== "");
        setMaskValue(newMaskValue);

        // 실제 값 변경
        let newValue;
        const formattedValue = Common.maskResidentNumber(value);
        
        if (newMaskValue.length < formattedValue.length) {
            newValue = value.slice(0, -1);
        } else {
            let cleaned = newMaskValue.replace(/[^0-9*]/g, '');
            newValue = value + cleaned.slice(-1);
        }
    
        newValue = Common.clipToMaxLength(13, newValue);
        
        onValueChange(newValue);
    };

    // 장소 선택 버튼 클릭 시
    const onClickSearchSite = () => {
        setIsSiteOpenModal(true)

    }

    // 장소 삭제 버튼 클릭 시
    const handleRefreshSite = () => {
        siteInputChangeHandler( {sno: 100, site_nm: "미지정"})
    }

    // siteInput 체인지 이벤트
    const siteInputChangeHandler = (item) => {
        const newValue = {
            sno: item.sno,
            site_nm: item.site_nm
        };
        setIsValid(true)
        onValueChange(newValue);
    }

    // 프로젝트 선택 버튼 클릭 시
    const onClickSearchProject = () => {
        setIsProjectOpenModal(true)

    }
    
    // 프로젝트 삭제 버튼 클릭 시
    const handleRefreshProject = () => {
        projectInputChangeHandler()
    }

    // projectInput 체인지 이벤트
    const projectInputChangeHandler = (item) => {
        const newValue = {
            ...item
        };
        setIsValid(true)
        onValueChange(newValue);
    }


    // input 체인지 이벤트
    const inputChangeHandler = (event) => {
        const newValue = event.target.value;
        setIsValid(newValue.trim() !== "");
        onValueChange(newValue);  // 부모 컴포넌트에 값 전달
    };

    // checkbox 체인지 이벤트
    const checkboxChangeHandler = (event) => {
        const checked = event.target.checked;
        setIsChecked(checked);
        onValueChange(checked ? "Y" : "N");  // 부모 컴포넌트에 값 전달
    };

    // select 체인지 이벤트
    const selectChangeHandler = (option) => {
        setSelectedOption(option);
        onValueChange(option.value);  // 부모 컴포넌트에 값 전달
    };

    // radio 체인지 이벤트
    const handleRadioChange = (e) => {
        onValueChange(e.target.value);
    }

    /***** useEffect *****/
    // date 체인지 이벤트
    useEffect(() => {
        if (type === "date-duration"){
            onValueChange({startTime: searchStartTime, endTime:searchEndTime});
        }else{
            onValueChange(searchStartTime)
        }

    }, [searchStartTime, searchEndTime]);


    // 체크박스, 주민번호 상태 업데이트
    useEffect(() => {
        if (type === "checkbox") {
            setIsChecked(value === "Y"); // "Y"면 true, "N"이면 false
        }
        if(type === "text-regidentMask"){
            setMaskValue(value);
        }
    }, [value]); // value가 변경될 때마다 실행

    useEffect(() => {
        if (type === "select" && selectData) {
            const foundOption = selectData.find(option => option.value === value);
            setSelectedOption(foundOption || null);
        }
    }, [selectData, value]); // selectData가 변경될 때마다 실행

    const containerStyle = {
        gridColumn: span === 'full' ? 'span 2' : 'auto',
        padding: '0px',
        // height: '100%',
        display: "flex",
        alignItems: "center",
        border:"0px"
    };

    return (
        isHide ? null
        :
        <div className="form-control" style={containerStyle}>
            {label.length > 0 &&
                <label style={{ color: isRequired && !isValid ? "red" : "black", marginRight: "5px", fontWeight: "bold", minWidth: labelWidth, display: "flex" }}>
                    {label}
                    {
                        isRequired ?
                        <div style={{color:"red", marginLeft:"3px"}}>*</div>
                        : null
                    }
                </label>} 
               
            {
                type === "hidden" ? (
                    null
                ) : type === "text" ? (
                    <div className="grid-input" >
                        {
                            editMode ? (
                                <input
                                    style={{ width: "100%", padding: "0.5rem" }}
                                    type="text"
                                    value={
                                        textFormat ? 
                                            Common[textFormat](value)
                                        : value
                                    }
                                    onChange={inputChangeHandler}
                                />
                            ) : textFormat ? 
                                    Common[textFormat](value)
                                : value
                        }
                    </div>
                ) : type === "text-regidentMask" ? (
                    <div className="grid-input">
                        {
                            editMode ? (
                                <>
                                    <input
                                        style={{ width: "100%", padding: "0.5rem" }}
                                        type="text"
                                        value={
                                            textFormat ? 
                                                Common[textFormat](maskValue)
                                            : maskValue
                                        }
                                        onChange={inputChangeRegidentMasking}
                                    />
                                    <input 
                                        type="hidden"
                                        value={value}
                                    />
                                </>
                            ) : textFormat ? 
                                    Common[textFormat](value)
                                : value
                        }
                    </div>
                ) : type === "checkbox" ? (
                    <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                        <FormCheckInput checked={isChecked} onChange={checkboxChangeHandler} disabled={!editMode} />
                        <span style={{ color: "grey" }}>&nbsp;&nbsp;{isChecked ? checkedLabels[0] : checkedLabels[1]}</span>
                    </div>
                ) : type === "select" ? (
                    editMode ? (
                        <div style={{height: "40px", display: "flex", alignItems: "center", width: "100%" }}>
                            <Select
                                onChange={selectChangeHandler}
                                options={selectData || []} // selectData가 undefined일 경우 빈 배열 제공
                                value={selectedOption} // 상태에 따라 업데이트된 값 사용
                                placeholder={"선택하세요"}
                                menuPortalTarget={document.body}
                                styles={{
                                    menuPortal: (base) => ({
                                        ...base,
                                        zIndex: 999999999, // 모달보다 높게
                                    }),
                                    container: (provided) => ({
                                      ...provided,
                                      width: "100%",
                                    }),
                                }}
                            />
                        </div>
                    ) : (
                        <div className="grid-input">
                            {selectData?.find(option => option.value === value)?.label || "-"}
                        </div>
                    )
                ) : type === "site" ? (
                    editMode ? (
                        <>
                        <SearchAllSiteModal
                            isOpen={isSiteOpenModal} 
                            fncExit={() => setIsSiteOpenModal(false)} 
                            onClickRow={(item) => {siteInputChangeHandler(item)}} 
                            nonSite={isAll}
                        />
                        <form className="input-group" style={{margin:"0px"}}>
                            <input className="form-control" type="text" value={value.site_nm} placeholder="Site를 선택하세요" aria-label="Site를 선택하세요" aria-describedby="btnNavbarSearch" onClick={onClickSearchSite} readOnly/>
                            {
                                (value.sno && value.sno != 100 &&
                                    <img 
                                    src={CancelIcon}
                                    alt="취소"
                                        style={{
                                            position: "absolute",
                                            top: "52%",
                                            right: "41px",
                                            transform: "translateY(-50%)",
                                            cursor: "pointer",
                                            width: "20px",
                                            margin: "0px 0.5rem"
                                        }}
                                        onClick={handleRefreshSite}
                                        />
                                    )
                                }
                            <button className="btn btn-primary" id="btnNavbarSearch" type="button"  onClick={onClickSearchSite}>
                                <i className="fas fa-search" />
                            </button>
                        </form>
                        </>
                    ) : (
                        <div className="grid-input"> 
                            {value.site_nm}
                        </div>
                    )
                ): type === "project" ? (
                    editMode ? (
                        <>
                            <SearchAllProjectModal
                                isOpen={isProjectOpenModal} 
                                fncExit={() => setIsProjectOpenModal(false)} 
                                onClickRow={(item) => {projectInputChangeHandler(item)}} 
                                isAll={isAll}
                            />
                            <form className="input-group" style={{margin:"0px"}}>
                                <input className="form-control" type="text" value={value.job_name || ''} placeholder="Proejct를 선택하세요" aria-label="Proejct를 선택하세요" aria-describedby="btnNavbarSearch" onClick={onClickSearchProject} readOnly/>
                                {
                                    (value.job_name &&
                                        <img 
                                        src={CancelIcon}
                                        alt="취소"
                                            style={{
                                                position: "absolute",
                                                top: "52%",
                                                right: "41px",
                                                transform: "translateY(-50%)",
                                                cursor: "pointer",
                                                width: "20px",
                                                margin: "0px 0.5rem"
                                            }}
                                            onClick={handleRefreshProject}
                                            />
                                        )
                                    }
                                <button className="btn btn-primary" id="btnNavbarSearch" type="button"  onClick={onClickSearchProject}>
                                    <i className="fas fa-search" />
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="grid-input"> 
                            {value.job_name}
                        </div>
                    )
                ): type === "html" ? (
                    editMode ? (
                        <textarea name="" id=""
                            style={{ width: "100%", height: "44vh", marginTop: "0.5rem", padding: "0.5rem" }}
                            value={value}
                            onChange={inputChangeHandler}>
                        </textarea>
                    ) : (
                        <div dangerouslySetInnerHTML={{ __html: value }}>
                        </div>
                    )
                ) : type === 'date' ? (
                    editMode ? (
                        <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                            <DateInput 
                                time={searchStartTime} 
                                setTime={setSearchStartTime} 
                                dateInputStyle={{margin: "0px"}}
                                calendarPopupStyle={{
                                    position: "fixed",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    zIndex: 1000,
                                }}
                            ></DateInput>
                        </div>
                    ) : (
                        <div className="grid-input">
                            {value}
                        </div>
                    )
                ) : type === 'date-duration' ? (
                    editMode ? (
                        <div style={{height: "40px", display: "flex", alignItems: "center" }}>
                            <DateInput 
                                time={searchStartTime} 
                                setTime={setSearchStartTime} 
                                dateInputStyle={{margin: "0px"}}
                                calendarPopupStyle={{
                                    position: "fixed",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    zIndex: 1000,
                                }}
                            ></DateInput>
                            {"\u00a0~\u00a0"} 
                            <DateInput 
                                time={searchEndTime} 
                                setTime={setSearchEndTime} 
                                dateInputStyle={{margin: "0px"}}
                                calendarPopupStyle={{
                                    position: "fixed",
                                    top: "50%",
                                    left: "50%",
                                    transform: "translate(-50%, -50%)",
                                    zIndex: 1000,
                                }}
                            ></DateInput>
                        </div>
                    ) : (
                        <div className="grid-input">
                            {value.startTime} ~ {value.endTime}
                        </div>
                    )
                ) : type === 'radio' ? (
                    editMode ? (
                        <div style={{ height: "40px", display: 'flex', gap: "30px", fontSize: "15px"}}>
                            {
                                radioValues.map((item, idx) => (
                                    <Radio text={radioLabels[idx]} value={item} name="group1" checked={value === item} onChange={handleRadioChange} key={idx}/>
                                ))
                            }
                        </div>
                    ) : (
                        <div style={{ height: "40px", display: 'flex', gap: "30px", fontSize: "15px"}}>
                            {
                                radioValues.map((item, idx) => (
                                    <Radio text={radioLabels[idx]} value={item} name="group1" defaultChecked={value === item} disabled={true} key={idx}/>
                                ))
                            }
                        </div>
                    )
                ) : null
            }
        </div>
    );
};

export default Input;
