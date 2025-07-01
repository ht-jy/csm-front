import React from "react";
import { useEffect, useReducer } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Axios } from "../../utils/axios/Axios";
import SideNavReducer from "./SideNavReducer";
import htencLogo from "../../assets/image/hitecheng_logo_default.png";

/**
 * @description: 메뉴 리스트 컴포넌트
 * @author 작성자: 김진우
 * @created 작성일: 2025-02-??
 * @modified 최종 수정일: 2025-07-01
 * @modifiedBy 최종 수정자: 김진우
 * @modified Description: 
 * 2025-07-01: 사용자권한 및 프로젝트 권한에 따라서 메뉴가 다르게 보일 수 있도록 고정된 메뉴가 아닌 DB에 저장된 데이터에 따라서 다르게 보이도록 수정
 *
 * @additionalInfo
 * - API: 
 *    Http Method - GET : /menu?roles=${roles} (권한별 메뉴 리스트)
 *    Http Method - POST : 
 *    Http Method - PUT : 
 *    Http Method - DELETE : 
 */

const SideNav = () => {
    const [state, dispatch] = useReducer(SideNavReducer, {
        parentMenu: [],
        childMenu: [],
    });

    const { user, jobRole} = useAuth();

    // 권한별 메뉴 조회
    const getMenuData = async () => {
        const roles = user.role + "|" + jobRole;
        // const roles = "USER|SUPER_ADMIN";
        const res = await Axios.GET(`/menu?roles=${roles}`);
        
        if (res?.data?.result === "Success") {
            dispatch({type: "INIT_MENU", list: res?.data?.values});
        }
    };

    useEffect(() => {
        getMenuData()
    }, [jobRole]);

    return(
        <div id="layoutSidenav_nav">
            <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
                <div className="sb-sidenav-menu">
                    <div style={{textAlign:"center"}}>
                        <img src={htencLogo} style={{backgroundColor: "white", width:"200px", padding:"15px", borderRadius:"5px"}}/>
                    </div>
                    <div className="nav">
                        <div style={{height:"15px"}}></div>
                            {
                                state.parentMenu.map((item, idx) => (
                                    item.has_child === "N" ?
                                        <Link key={`parent-${idx}`} className="nav-link" to={item.menu_id} style={item.is_temp === "N" ? {color: "white"} : {}}>
                                            <div className="sb-nav-link-icon"><img src={item.svg_name} width='20px' /></div>
                                            {item.menu_nm}
                                        </Link>
                                    :
                                        <React.Fragment key={`parent-${idx}`}>
                                            <a className="nav-link collapsed" href="#!" data-bs-toggle="collapse" data-bs-target="#pagesCollapseAuth" aria-expanded="false" aria-controls="pagesCollapseAuth" style={item.is_temp === "N" ? {color: "white"} : {}}>
                                                <div className="sb-nav-link-icon"><img src={item.svg_name} width='20px' /></div>
                                                {item.menu_nm}
                                                <div className="sb-sidenav-collapse-arrow"><i className="fas fa-angle-down" /></div>
                                            </a>
                                            <div className="collapse" id="pagesCollapseAuth" aria-labelledby="headingOne" data-bs-parent="#sidenavAccordionPages">
                                                <nav className="sb-sidenav-menu-nested nav">
                                                    {
                                                        state.childMenu.map((child, cidx) => (
                                                            item.menu_id === child.parent_id ?
                                                                <Link key={`child-${idx}-${cidx}`} className="nav-link" to={child.menu_id} style={item.is_temp === "N" ? {color: "white"} : {}}>
                                                                    {child.menu_nm}
                                                                </Link>
                                                            : null
                                                        ))
                                                    }
                                                </nav>
                                            </div>
                                        </React.Fragment>
                                ))
                            }
                    </div>
                </div>
            </nav>
        </div>
    );
}

export default SideNav;
