import { ObjChk } from "../../utils/ObjChk"
import Loading from "../../assets/image/Loading.gif";
import { useEffect, useState } from "react";

// 도면 joint정보를 나타내기 위한 테이블
const Grid = ({items, weldingBtnState, wpsInfo, buttonFnc, type, rowBtnFnc}) => {
    
    const weldingCheck = (item) => {
        // wpsInfo = ['CS-HT-001', 'SS-HT-001'];
        // item.WPSNO = "68";
        // item.FITUP_STATUS = "CONFIRM";
        return wpsInfo.filter(wpsno => wpsno == item.WPSNO).length != 0 ? item.FITUP_STATUS == "CONFIRM" ? true : false : false;
        
    }

    return (
        <div className="container2">
        <div className="row" >
        <div className="col" style={type == "A" ? typeAClick : typeAUnClick } onClick={() => buttonFnc("A")}>WELDING</div>
        <div className="col" style={type == "B" ? typeBClick : typeBUnClick } onClick={() => buttonFnc("B")}>NON WELDING</div>
        </div>
            <div className="container">
            {
                items === null ?
                <></>
                :
                items.map((item, index) => (
                    <div className="row" key={index}>
                        <table className="table2">
                            <tbody>
                                <tr>
                                    <td rowSpan={3} style={{backgroundColor:"#f2f2f2", width:"10%"}}>{item.JOINTNO || '-'}</td>
                                    <td style={{width:"30%"}}>{item.JOINT_SIZE || '-'}</td>
                                    <td style={{width:"20%"}}>{item.JOINT_TYPE || '-'}</td>
                                    <td style={{width:"20%"}}>{item.JOINT_STATUS || '-'}</td>
                                    <td style={{width:"20%"}}>{item.SHOP_FIELD || '-'}</td>
                                </tr>
                                <tr>
                                    <td>{item.BASIC_MATERIAL_TEXT || '-'}</td>
                                    <td>{item.WPSNO || '-'}</td>
                                    <td>-</td>
                                    <td>-</td>
                                </tr>
                                <tr>
                                    <td colSpan={2}>
                                        {
                                            ObjChk.all(item.CAP_WELDER) ?
                                                weldingCheck(item) ?
                                                <div className="welding-btn" onClick={() => rowBtnFnc(item, index)}>WELDING</div>
                                                :
                                                '-'
                                            :
                                            item.CAP_WELDER
                                        }
                                    </td>
                                    <td colSpan={2}>{item.WELDING_DATE || '-'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                ))
            }
            </div></div>
    );
}

const typeAUnClick = {
    backgroundColor: "#f5f5f5"
    , borderTop: '1px solid #ddd'
    , borderRight: '1px solid #ddd'
    , borderBottom: '1px solid #ddd'
    , borderTopRightRadius: '10px'
    , height : '30px'
    , margin: '0 auto'
    , marginTop : '10px'
    , paddingTop: '5px'
}

const typeAClick = {
    backgroundColor: "#ffffff"
    , borderTop: '1px solid #ddd'
    , borderRight: '1px solid #ddd'
    , borderTopRightRadius: '10px'
    , height : '40px'
    , paddingTop: '10px'
}

const typeBUnClick = {
    backgroundColor: "#f5f5f5"
    , borderTop: '1px solid #ddd'
    , borderLeft: '1px solid #ddd'
    , borderBottom: '1px solid #ddd'
    , borderTopLeftRadius: '10px'
    , height : '30px'
    , margin: '0 auto'
    , marginTop : '10px'
    , paddingTop: '5px'
}

const typeBClick = {
    backgroundColor: "#ffffff"
    , borderTop: '1px solid #ddd'
    , borderLeft: '1px solid #ddd'
    , borderTopLeftRadius: '10px'
    , height : '40px'
    , paddingTop: '10px'
}

export default Grid;