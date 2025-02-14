import { useState } from "react";
import Loading from "../../../../module/Loading";
import Select from 'react-select';


const Notice = () => {

    // const [state, dispatch] = useReducer(DeviceReducer, {
    //     list: [],
    //     count: 0,
    //     selectList: {},
    // });

    const [pageNum, setPageNum] = useState(1);
    const [rowSize, setRowSize] = useState(10);
    const [isLoading, setIsLoading] = useState(false);

    const options = [
        {value : 5, label: "5줄 보기"},
        {value : 10, label: "10줄 보기"},
        {value : 15, label: "15줄 보기"},
        {value : 20, label: "20줄 보기"},

    ]

    const onChangeSelect = (e) => {
        setRowSize(e.value);
        setPageNum(1);
    }


    // const getData = async () => {
    //     setIsLoading(true);

    //     const page = {
    //         page_num: pageNum,
    //         row_size: rowSize
    //     };

    //     const res = await Axios.Get(`/notice?page_num=${pageNum}&row_size=${rowSize}`);

    //     if(res?.data.result === "Success"){
    //         dispatch({})
    //     }
    // }
    return(
        <div>
            <Loading isOpen={isLoading} />


            <div>
                <div className="container-fluid px-4">
                    <h2 className="mt-4">공지사항</h2>
                    <ol className="breadcrumb mb-4">
                        <img className="breadcrumb-icon" src="/assets/img/icon-house.png" />
                        <li classNmae="breadcrumb-item active">공지사항</li>
                    </ol>

                    <div style={{display:'flex', alignItems: 'center', width: '90rem', marginBottom: '15px'}}>
                        <Select
                            onChange={onChangeSelect}
                            options={options}
                            defaultValue={options.find(option => option.value === rowSize)}
                            placeholder={"몇줄 보기"}
                            style={{width:"200px"}}
                        />
                    </div>

                    <div className="table-container" style={{overflowX:'auto'}}>
                        <table style={{width: "100%", borderCollapse: 'collapse'}}>
                            <thead>
                                <tr>
                                    <th>순번</th>
                                    <th>현장</th>
                                    <th>프로젝트</th>
                                    <th>제목</th>
                                    <th>등록자</th>
                                    <th>등록일</th>
                                </tr>
                            </thead>
                            <tbody>

                            </tbody>
                        </table>
                    

                    </div>

                </div>
            </div>

        </div>
    );
}
 
export default Notice;