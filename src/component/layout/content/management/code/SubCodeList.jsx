import { useEffect, useState } from "react"
import TextInput from "../../../../module/TextInput";

const SubCodeList = ({data, dispatch, path}) => {

    const [isAdd, setIsAdd] = useState(false);

    // 코드추가 버튼 클릭 시
    const handleAddCode = () => {
        setIsAdd(true)
    }

    // 순서변경 버튼 클릭 시
    const handleSortNoChange = () => {

    }

    // 코드 추가 시 값 넣기. 무조건 맨 마지막으로.
    const codeSet = {
    }

    // 
    const onChangeTableData = (name, value) => {
        codeSet[name] = value
    }

    // 데이터가 변경 시 추가 테이블 삭제
    useEffect( () => {
        setIsAdd(false)
    }, [data])

    // 추가값 변경 시 
    useEffect( () => {

    }, [isAdd])

    return <div style={{margin:"10px"}}>
        <div className="d-flex justify-content-between">

            <div>{`HOME ${path}`}</div>
            <div>
                <button onClick={handleAddCode}>코드추가</button>
                <button onClick={handleSortNoChange}>순서변경</button>
            </div>
        </div>
        <table>
                <thead>
                <tr>
                    <th>정렬순서</th>
                    <th>코드ID</th>
                    <th>코드명</th>
                    <th>색깔</th>
                    <th>비고1</th>
                    <th>비고2</th>
                    <th>비고3</th>
                    <th>비고4</th>
                    <th>비고5</th>
                    <th>사용여부</th>
                </tr>
                </thead>

                <tbody>
                    {data.length == 0 && !isAdd ? 
                        <tr>
                            <td style={{textAlign:'center', padding:'20px'}} colSpan={10}>등록된 하위 코드가 없습니다.</td>
                        </tr>
                        : 
                        <>
                            {data.map((codeData) => (
                                <>
                                { codeData.codeTrees?.length === 0 && !isAdd? 
                                    <tr>
                                        <td colSpan={10} style={{textAlign:'center', padding:'20px'}}>등록된 하위 코드가 없습니다.</td>
                                    </tr>
                                    : 
                                    codeData.codeTrees && codeData.codeTrees?.map( (codeTree) => (
                                        <tr>
                                        <td>{codeTree.code_set.sort_no}</td>
                                        <td>{codeTree.code_set.code}</td>
                                        <td>{codeTree.code_set.code_nm}</td>
                                        <td>{codeTree.code_set.code_color}</td>
                                        <td>{codeTree.code_set.udf_val_03}</td>
                                        <td>{codeTree.code_set.udf_val_04}</td>
                                        <td>{codeTree.code_set.udf_val_05}</td>
                                        <td>{codeTree.code_set.udf_val_06}</td>
                                        <td>{codeTree.code_set.udf_val_07}</td>
                                        <td>
                                            {codeTree.code_set.is_use}
                                        </td>
                                        </tr>
                                    ))
                                }
                                </>
                                ))
                            }
                            
                            { isAdd ? 
                                <tr>
                                    <td><TextInput style={{width:"100%"}} setText={(value) => onChangeTableData("sort_no", value)} /></td>
                                    <td><TextInput style={{width:"100%"}} setText={(value) => onChangeTableData("code", value)} /></td>
                                    <td><TextInput style={{width:"100%"}} setText={(value) => onChangeTableData("code_nm", value)} /></td>
                                    <td><TextInput style={{width:"100%"}} setText={(value) => onChangeTableData("code_color", value)} /></td>
                                    <td><TextInput style={{width:"100%"}} setText={(value) => onChangeTableData("udf_val_03", value)} /></td>
                                    <td><TextInput style={{width:"100%"}} setText={(value) => onChangeTableData("udf_val_04", value)} /></td>
                                    <td><TextInput style={{width:"100%"}} setText={(value) => onChangeTableData("udf_val_05", value)} /></td>
                                    <td><TextInput style={{width:"100%"}} setText={(value) => onChangeTableData("udf_val_06", value)} /></td>
                                    <td><TextInput style={{width:"100%"}} setText={(value) => onChangeTableData("udf_val_07", value)} /></td>
                                    <td><TextInput style={{width:"100%"}} setText={(value) => onChangeTableData("is_use", value)} /></td>
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