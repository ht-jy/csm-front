import { useEffect, useState } from "react";
import Button from "./Button";
import SearchWorkerModal from "./modal/SearchWorkerModal";
import SearchIcon from "../../assets/image/search.png";

/**
 * @description: 검색버튼과 input을 사용하여 선택한 모달창을 띄워주는 컴포넌트
 * 
 * @author 작성자: 김진우
 * @created 작성일: 2025-03-24
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * selectedModal: 선택 모달명(usedComponents)
 * inputItemName: input에 들어가는 필드명
 * setSearchText: 모달에서 선택한 아이템 반환 함수
 */
const usedComponents = {
    "workerByUserId": SearchWorkerModal,
    // 필요시 추가
}

const SearchInput = ({selectedModal, inputText, inputItemName, setSearchText}) => {
    const Component = usedComponents[selectedModal];
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");

    // 모달 종료 이벤트
    const handleExitBtn = () => {
        setIsOpen(false);
    }

    const handleClickRow = (values) => {
        setInputValue(values[inputItemName]);
        setSearchText(values);
    }

    useEffect(() => {
        setInputValue(inputText ?? "");
    }, [inputText]);

    return (
        <>
            {
                Component ?
                    <Component
                        isOpen={isOpen}
                        fncExit={handleExitBtn}
                        onClickRow={handleClickRow}
                    />
                : null
            }
            {/* <Button text={"검색"} onClick={() => setIsOpen(true)} style={{height: "28px", padding: 0, fontSize: "13px", paddingLeft: "5px", paddingRight: "5px", marginLeft: 0}}/> */}
            <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                <input type="text" value={inputValue} disabled={true} style={{border: "1px solid #ccc", width: "150px", height: "28px", borderBottomLeftRadius: "5px", borderTopLeftRadius: "5px", textAlign: "center"}}/>
                <div 
                    onClick={() => setIsOpen(true)} 
                    style={{display: "flex", justifyContent: "center", alignItems: "center", borderTopRightRadius: "5px", borderBottomRightRadius: "5px", height: "28px", padding: 0, fontSize: "13px", paddingLeft: "5px", paddingRight: "5px", backgroundColor: "#0d6efd"}}
                >
                    <img
                        src={SearchIcon}
                        style={{width: "19px", filter: "brightness(0) invert(1)"}}
                    />
                </div>
            </div>
        </>
    );
}

export default SearchInput;