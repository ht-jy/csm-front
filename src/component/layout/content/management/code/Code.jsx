import CodeList from "./CodeList";
import SubCodeList from "./SubCodeList";
import {Axios} from "../../../../../utils/axios/Axios"
import { useEffect, useReducer, useState } from "react";
import CodeReducer from "./CodeReducer";
    

/**
 * @description: 코드 관리
 * 
 * @author 작성자: 정지영
 * @created 작성일: 2025-04-10
 * @modified 최종 수정일: 
 * @modifiedBy 최종 수정자: 
 * @usedComponents
 * - 
 * 
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /code/tree (코드트리 데이터 조회)
 * - 주요 상태 관리: CodeReducer
 */
const Code = () => {
    const [treeData, setTreeData] = useState([]);

    const codeSet = {
        level:0,
        idx:0,
        code:"",
        p_code:"",
        code_nm:"HOME",
        code_color:"",
        udf_val_03:"",
        udf_val_04:"",
        udf_val_05:"",
        udf_val_06:"",
        udf_val_07:"",
        sort_no:"",
        is_use:"",
        etc:""
    }
    const [state, dispatch] = useReducer(CodeReducer, {
        subCodeList: [],
        path: ""
    });

    // codeTrees 데이터 가져오는 API
    const getData = async () => {
        const res = await Axios.GET("/code/tree")
        
        if (res.data?.result == "Success"){
            setTreeData(res.data?.values?.code_trees)

        }else{
            
        }
    }

    // 처음에 데이터 가져오기. 저장 시 가져오기
    useEffect( () => {
        getData()
    }, [])

    return(
        <div>
            <div className="container-fluid px-4">
                    <ol className="breadcrumb mb-2 content-title-box">
                        <li className="breadcrumb-item content-title">코드 관리</li>
                        <li className="breadcrumb-item active content-title-sub">관리</li>
                    </ol>

            {/* <input type="text" style={{ width: "300px", padding: "0.5rem", margin:"1rem" }}></input>
            <button type="button" >추가</button> */}
            <div className="d-flex">

                <div style={{...containerStyle}}>
                        
                    <div style={headerStyle}>코드 분류</div>


                    <div style={{...contentStyle, width:"20vw"}}>

                        {
                            treeData.length == 0 ? null :                            
                                <CodeList 
                                key={-1}
                                code={'root'}
                                idx={-1}
                                level={0}
                                pCode={'HOME'}
                                expand={true}
                                codeTrees={treeData}
                                codeSet={codeSet}
                                dispatch={dispatch}
                                path={""}
                                ></CodeList>
                        }

                </div>
                </div>

                <div style={{...containerStyle, width: "70vw"}}>
                    <div style={headerStyle}> {/*state.subCodeList[0]?.codeSet?.code_nm*/} 하위 코드 상세</div>
                        <div style={contentStyle}>
                            <SubCodeList
                                data={state.subCodeList}
                                dispatch={dispatch}
                                path={state.path}
                            >
                                
                            
                            </SubCodeList>
                        </div>
                </div>


            </div>

                {/* { isAdd ? 
                    <form action="">
                        <input style={{width:"100px"}}></input>
                        <button onClick={handleSaveClick}>저장</button>
                        <button onClick={handleCancleClick}>X</button>
                    </form>
                    :
                    null    
                } */}
                {/* <input id="test" type="text" style={{ width: "300px", padding: "0.5rem", margin:"1rem" }}></input> */}
                </div>
        </div>
    );
}

export default Code;

const containerStyle = {
    border: '2px solid #a5a5a5',
    borderRadius: '10px',
    marginTop: "5px",
    marginRight:"15px",
    overFlow:"unset"

};

const headerStyle = {
    padding: '10px',
    marginBottom: '10px',
    borderRadius: '8px 8px 0px 0px',
    backgroundColor:"#004377",
    color:'#fff',
    textAlign:'center',
    width:"100%",

}

const contentStyle = {
    margin :'0px',
    overflowX: 'auto',
    overflowY: 'auto',
}