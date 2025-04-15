import { useEffect, useState } from "react"
import TextInput from "../../../../module/TextInput";
import Toggle from "../../../../module/Toggle";
import Button from "../../../../module/Button"
import ColorInput from "../../../../module/ColorInput";
import { useAuth } from "../../../../context/AuthContext";
import { Axios } from "../../../../../utils/axios/Axios";
import Modal from "../../../../module/Modal";
import { ObjChk } from "../../../../../utils/ObjChk";

const SubCodeList = ({ data, dispatch, path, funcRefreshData }) => {

    const [isAdd, setIsAdd] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editNo, setEditNo] = useState(-1);
    const [codeSet, setCodeSet] = useState({});
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [modalText, setModalText] = useState("")
    const [modalTitle, setModalTitle] = useState("")
    const [isConfirmButton, setIsConfirmButton] = useState(false);
    const { user } = useAuth();

    // 코드추가 버튼 클릭 시
    const handleAddCode = () => {
        setIsAdd(true)
        console.log("추가버튼 클릭 시", isAdd)
    }

    // 순서변경 버튼 클릭 시
    const handleSortNoChange = () => {
        // 순서로 테이블 변경

    }

    // 초기 데이터 세팅
    const initCodeSet = (set) => {
        if (set === undefined) {

            const code = {
                level: 0,
                idx: 0,
                code: null,
                p_code: null,
                code_nm: null,
                code_color: null,
                udf_val_03: null,
                udf_val_04: null,
                udf_val_05: null,
                udf_val_06: null,
                udf_val_07: "",
                sort_no: null,
                is_use: null,
                etc: "",
            }
            setCodeSet({ ...code })
        }
        else {
            setCodeSet({ ...set })
        }
    }

    // 데이터 추가 시 값 변경
    const onChangeTableData = (name, value) => {
        codeSet[name] = value
    }

    // 저장 버튼 클릭 시
    const onCilckSaveButton = () => {
        // MergeAPI : Update && Create

        // 코드ID 미기입 시
        if (ObjChk.all(codeSet.code)) {
            setIsOpenModal(true)
            setIsConfirmButton(false)
            setModalTitle("입력 오류")
            setModalText("코드ID를 입력해 주세요.")

            // 코드명 미기입 시
        } else if (ObjChk.all(codeSet.code_nm)) {
            setIsOpenModal(true)
            setIsConfirmButton(false)
            setModalTitle("입력 오류")
            setModalText("코드명을 입력해 주세요.")
        }
        else {
            // 저장하시겠습니까? 모달 띄우기 확인을 누를 경우 save 실행
            setIsOpenModal(true)
            setIsConfirmButton(true)
            setModalTitle("저장하시겠습니까?")
            setModalText("저장 시 현재 화면은 초기화됩니다.")
        }

    }

    // 저장 후 페이지 새로고침
    const save = async () => {

        codeSet.reg_uno = user.uno
        codeSet.reg_user = user.userName

        console.log("저장", codeSet)

        const res = await Axios.POST("/code", codeSet)
        if (res?.data?.result === "Success") {
            setIsEdit(false)
            initCodeSet()
            // 화면 초기화하기
            funcRefreshData()

        } else {

        }

        // 모달의 확인버튼 없애기
        setIsOpenModal(false)
        setIsConfirmButton(false)

    }

    const onCilckDeleteButton = () => {
        // IDX로 삭제 API
        console.log("삭제")

    }

    // 취소 버튼 클릭 시
    const onCilckCancleButton = (mode) => {
        // 이전 값으로 돌려놓기. edit모드를 제거하면 될 것 같음.
        if (mode === "EDIT") {
            setIsEdit(false)
        }
        else if (mode === "ADD") {
            setIsAdd(false)
        }
        initCodeSet()
    }

    // 수정 버튼 클릭 시
    // FIXME: 코드ID가 다른 코드ID와 겹칠경우, 부모코드가 될 수 없음 
    const onCilckEditButton = (no, data) => {
        // 수정모드로 변경 =>  저장/취소 버튼으로 변경
        initCodeSet(data)
        setIsEdit(true)
        setEditNo(no)

        console.log("수정")
    }


    // 데이터가 변경 시 추가 테이블 삭제
    useEffect(() => {
        setIsAdd(false)
        setEditNo(-1)
    }, [data])

    // 추가값 변경 시 
    useEffect(() => {

    }, [isAdd, isEdit, editNo])

    return <div style={{ margin: "0px 10px 10px 10px" }}>
        <Modal
            isOpen={isOpenModal}
            title={modalTitle}
            text={modalText}
            confirm={isConfirmButton ? "확인" : null}
            fncConfirm={save}
            cancel={isConfirmButton ? "취소" : "확인"}
            fncCancel={() => setIsOpenModal(false)}

        >
        </Modal>
        <div style={{ ...headerStyle }}>
            <div>
                <i className="fa-solid fa-house"></i>
                {` HOME ${path}`}</div>
            <div>
                <Button text={"코드추가"} onClick={() => handleAddCode()}>코드추가</Button>
                <Button text={"순서변경"} onClick={() => handleSortNoChange()}>순서변경</Button>
            </div>
        </div>
        <table>
            <thead>
                <tr>
                    <th style={{ width: "10px" }} >순서</th>
                    <th style={{ width: "25px" }}>코드ID</th>
                    <th style={{ width: "25px" }}>코드명</th>
                    <th style={{ width: "10px" }}>색깔</th>
                    <th style={{ width: "15px" }}>값1</th>
                    <th style={{ width: "15px" }}>값2</th>
                    <th style={{ width: "15px" }}>값3</th>
                    <th style={{ width: "15px" }}>값4</th>
                    <th style={{ width: "15px" }}>값5</th>
                    <th style={{ width: "30px" }}>비고</th>
                    <th style={{ width: "15px" }}>사용여부</th>
                    <th style={{ width: "20px" }}></th>
                </tr>
            </thead>

            <tbody>
                {data.length === 0 && !isAdd ?
                    <tr>
                        <td style={{ textAlign: 'center', padding: '10px' }} colSpan={12}>등록된 하위 코드가 없습니다.</td>
                    </tr>
                    :
                    <>
                        {data.map((codeData) => (
                            <>
                                {codeData.codeTrees?.length === 0 && !isAdd ?
                                    <tr>
                                        <td colSpan={12} style={{ textAlign: 'center', padding: '10px' }}>등록된 하위 코드가 없습니다.</td>
                                    </tr>
                                    :
                                    codeData.codeTrees && codeData.codeTrees?.map((codeTree, index) => (
                                        isEdit && editNo === index ?
                                            <tr>
                                                <td className="center">{codeTree.code_set.sort_no}</td>
                                                <td><TextInput style={{ ...textInputStyle }} initText={codeTree.code_set.code} setText={(value) => onChangeTableData("code", value)} /></td>
                                                <td><TextInput style={{ ...textInputStyle }} initText={codeTree.code_set.code_nm} setText={(value) => onChangeTableData("code_nm", value)} /></td>
                                                <td><ColorInput style={{ ...colorInputStyle }} initColor={codeTree.code_set.code_color} setColor={(value) => onChangeTableData("code_color", value)} ></ColorInput> </td>
                                                <td><TextInput style={{ ...textInputStyle }} initText={codeTree.code_set.udf_val_03} setText={(value) => onChangeTableData("udf_val_03", value)} /></td>
                                                <td><TextInput style={{ ...textInputStyle }} initText={codeTree.code_set.udf_val_04} setText={(value) => onChangeTableData("udf_val_04", value)} /></td>
                                                <td><TextInput style={{ ...textInputStyle }} initText={codeTree.code_set.udf_val_05} setText={(value) => onChangeTableData("udf_val_05", value)} /></td>
                                                <td><TextInput style={{ ...textInputStyle }} initText={codeTree.code_set.udf_val_06} setText={(value) => onChangeTableData("udf_val_06", value)} /></td>
                                                <td><TextInput style={{ ...textInputStyle }} initText={codeTree.code_set.udf_val_07} setText={(value) => onChangeTableData("udf_val_07", value)} /></td>
                                                <td><TextInput style={{ ...textInputStyle }} initText={codeTree.code_set.etc} setText={(value) => onChangeTableData("etc", value)} /></td>
                                                <td><Toggle style={{ justifyContent: 'center' }} initValue={codeTree.code_set.is_use === 'Y' ? true : false} onClickValue={(value) => onChangeTableData("is_use", value ? "Y" : "N")} /></td>
                                                <td className="center">
                                                    <Button text={"저장"} style={{ ...buttonStyle }} onClick={() => onCilckSaveButton()}></Button>
                                                    <Button text={"취소"} style={{ ...buttonStyle }} onClick={() => onCilckCancleButton("EDIT")}></Button>
                                                </td>
                                            </tr>
                                            :
                                            <tr>
                                                <td className="center">{codeTree.code_set.sort_no}</td>
                                                <td>{codeTree.code_set.code}</td>
                                                <td>{codeTree.code_set.code_nm}</td>
                                                <td style={{ justifyItems: 'center' }}> <div className="square" style={{ backgroundColor: `${codeTree.code_set.code_color}` }}></div></td>
                                                <td>{codeTree.code_set.udf_val_03}</td>
                                                <td>{codeTree.code_set.udf_val_04}</td>
                                                <td>{codeTree.code_set.udf_val_05}</td>
                                                <td>{codeTree.code_set.udf_val_06}</td>
                                                <td>{codeTree.code_set.udf_val_07}</td>
                                                <td>{codeTree.code_set.etc}</td>
                                                <td className="center">
                                                    {codeTree.code_set.is_use}
                                                </td>
                                                <td className="center">
                                                    <Button text={"수정"} style={{ ...buttonStyle }} onClick={() => onCilckEditButton(index, codeTree.code_set)}></Button>
                                                    <Button text={"삭제"} style={{ ...buttonStyle }} onClick={() => onCilckDeleteButton()}></Button>
                                                </td>
                                            </tr>
                                    ))
                                }
                            </>
                        ))
                        }

                        {isAdd ?
                            <tr>
                                <td className="center">{data[0] && data[0]?.codeTrees.length !== 0 ? data[0]?.codeTrees[data[0]?.codeTrees.length - 1].code_set.sort_no + 1 : "1"}</td>
                                <td><TextInput style={{ ...textInputStyle }} initText={""} setText={(value) => onChangeTableData("code", value)} /></td>
                                <td><TextInput style={{ ...textInputStyle }} initText={""} setText={(value) => onChangeTableData("code_nm", value)} /></td>
                                <td><ColorInput style={{ ...colorInputStyle }} initColor={""} setColor={(value) => onChangeTableData("code_color", value)} /></td>
                                <td><TextInput style={{ ...textInputStyle }} initText={""} setText={(value) => onChangeTableData("udf_val_03", value)} /></td>
                                <td><TextInput style={{ ...textInputStyle }} initText={""} setText={(value) => onChangeTableData("udf_val_04", value)} /></td>
                                <td><TextInput style={{ ...textInputStyle }} initText={""} setText={(value) => onChangeTableData("udf_val_05", value)} /></td>
                                <td><TextInput style={{ ...textInputStyle }} initText={""} setText={(value) => onChangeTableData("udf_val_06", value)} /></td>
                                <td><TextInput style={{ ...textInputStyle }} initText={""} setText={(value) => onChangeTableData("udf_val_07", value)} /></td>
                                <td><TextInput style={{ ...textInputStyle }} initText={""} setText={(value) => onChangeTableData("etc", value)} /></td>
                                <td><Toggle style={{ justifyContent: 'center' }} initValue={"Y"} onClickValue={(value) => onChangeTableData("is_use", value ? "Y" : "N")} /></td>
                                <td className="center">
                                    <Button text={"저장"} style={{ ...buttonStyle }} onClick={() => {
                                        // 부모코드 넣기 및 정렬순서 추가
                                        onChangeTableData("p_code", data[0]?.codeSet.code)
                                        onChangeTableData("sort_no", data[0]?.codeTrees.length !== 0 ? data[0]?.codeTrees[data[0]?.codeTrees.length - 1].code_set.sort_no + 1 : 1)
                                        // 저장
                                        onCilckSaveButton()
                                    }
                                    }></Button>
                                    <Button text={"취소"} style={{ ...buttonStyle }} onClick={() => onCilckCancleButton("ADD")}></Button>
                                </td>
                            </tr>
                            :
                            null
                        }
                    </>
                }
            </tbody>
        </table>
    </div>
}
export default SubCodeList;


const buttonStyle = {
    padding: "3px 5px",
    fontSize: "14px",
}

const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    margin: "0px 10px 5px 5px",
}

const textInputStyle = {
    width: "100%",
    textAlign: "left",
}

const colorInputStyle = {
    width: "30px",
    height: "25px",
}