import React, { useEffect, useReducer, useState, useRef } from "react";
import { Axios } from "../../utils/axios/Axios";
import { useAuth } from "../context/AuthContext";
import "../../assets/css/slider.css";
import upAndDown from "../../assets/image/up-and-down.png";
import NoticeDetail from "../layout/content/management/notice/NoticeDetail";
import NoticeReducer from "../layout/content/management/notice/NoticeReducer";
import { previousDay } from "date-fns";
import { noticeRoles } from "../../utils/rolesObject/noticeRoles";
import { useUserRole } from "../../utils/hooks/useUserRole";

function AnnouncementSlider() {

    const { isRoleValid } = useUserRole(); 
    const noticeAllRole = isRoleValid(noticeRoles.NOTICE_LIST);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const { user, jobRole, project } = useAuth();
    const [hoverOpen, setHoverOpen] = useState(false);

    const sliderRef = useRef();
    const boardRef = useRef();

    // 슬라이드 텍스트 배열 및 내용 저장
    const [state, dispatch] = useReducer(NoticeReducer, {
        headerList: [],
        count: 0,
        noticesHeader: []
    });


    const [data, setData] = useState([])
    const [isDetail, setIsDetail] = useState(false)


    // 공지사항 데이터 불러오기
    const getNotices = async () => {
        const res = await Axios.GET(`/notice?isRole=${noticeAllRole}&page_num=${1}&row_size=${50}&jno=${project?.jno}`);
        if (res?.data?.result === "Success") {
           dispatch({ type: "HEADER", notices: res?.data?.values?.notices, count: res?.data?.values?.count })
        }
    }

    // 자동 슬라이드 재시작하기
    const resetAutoSlide = () => {
        clearInterval(window.autoSlide);
        window.autoSlide = setInterval(handleNext, 3000);
    };

    // 이전 공지로 넘기기
    const handlePrev = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? state.noticesHeader.length - 1 : prevIndex - 1
        );
        resetAutoSlide();
    };

    // 다음 공지로 넘기기
    const handleNext = () => {
 
        if (state.noticesHeader.length <= 1 ||isAnimating) {
            return;
        }

        setIsAnimating(true);
        setCurrentIndex( (prevIndex) =>(prevIndex + 1) % state.noticesHeader.length)
        resetAutoSlide();
    };

    // 상세 모달에서 모달 open 상태 변경
    const handleOpenDetail = (openState) => {
        setIsDetail(openState)
    }

    // 공지사항 리스트 클릭 시 상세페이지
    const handleRowClick = (item, e) => {
        e.stopPropagation();
        setHoverOpen(false);
        setData([item])
        setIsDetail(true)
    }

    // Index 조절하기
    useEffect(() => {
        if (state.noticesHeader.length > 0) {
            setCurrentIndex(0);
        }
    }, [state.noticesHeader]);

    // 공지사항 데이터 로드
    useEffect(() => {
        getNotices()
    }, [project?.jno])

    // 3초마다 다음 공지 띄우기.
    useEffect(() => {
        const interval = setInterval(() => {
            handleNext();
        }, 3000);
        return () => clearInterval(interval);
    }, [state.noticesHeader.length]);

    // 0.5초 후 적용하기(텍스트 변경되는 시간)
    useEffect(() => {
        if (state.noticesHeader.length <= 1 ) return;

        const timeout = setTimeout(() => setIsAnimating(false), 500);
        return () => clearTimeout(timeout);

    }, [currentIndex]);

    // 상세공지사항 외의 클릭 시
    useEffect(() => {
        const handleClick = (e) => {
            if (sliderRef.current?.contains(e.target)) {
                return;
            } else if (boardRef.current?.contains(e.target)) {
                return;
            } else {
                setHoverOpen(false);
            }
        };

        document.body.addEventListener("click", handleClick);
        return () => {
            document.body.removeEventListener("click", handleClick);
        };
    }, []);

    return (
        <>
            <NoticeDetail
                notice={data}
                isDetail={isDetail}
                setIsDetail={handleOpenDetail}
            ></NoticeDetail>

            <div className="announcement-slider"
                ref={sliderRef}
                onClick={() => setHoverOpen(prev => !prev)}
            >
                <div>
                    {
                        hoverOpen &&
                        <div ref={boardRef} style={{ width: "100%", height: "100%" }}>
                            <div style={{ ...modalStyle }} >
                                <div style={{...header}}>공지사항</div>
                                {
                                    state.noticesHeader.length === 0 ?
                                    <div>공지사항이 없습니다.</div>
                                        :
                                        state.noticesHeader?.map((item, idx) => {
                                            return <div 
                                                key={idx} 
                                                onClick={(e) => handleRowClick(item, e)}
                                                style={{...listStyle, cursor: "pointer" }}                                                
                                                >
                                                    <span style={{fontWeight:"bold"}}>{item.job_name === "전체" ?  `전체 ` : `PROJ`}&ensp;&ensp;</span>
                                                    <span style={{...noticeRow}} id="notice-row">{item.title}</span>
                                            </div>
                                        })
                                }
                            </div>
                        </div>
                    }
                </div>

                {/* 슬라이드 텍스트 */}
                <div className="slides-container">
                    <div className="slide">
                        {
                            state.noticesHeader.length === 0 ? 
                                <span>공지사항이 없습니다.</span>
                            :
                            <span className="slide">               
                                    {state.noticesHeader[currentIndex]?.job_name === "전체" ?
                                        `전체` : `PROJ`} - {state.noticesHeader[currentIndex]?.title}
                                              
                            </span>
                        }
                    </div>
                </div>
            </div>
        </>
    );
}

export default AnnouncementSlider;



const modalStyle = {
    position: "fixed",
    zIndex: '9998',
    backgroundColor: 'rgb(255,255,255)',
    paddingBottom: '5px',
    border: "3px solid rgb(255,255,255)",
    borderRadius: "10px",
    maxWidth: '500px',
    width: '500px',
    height: "500px",
    maxHeight: '500px',
    // boxShadow: '10px 10px 1px rgb(0, 0, 0, 0.3)',
    boxShadow: '5px 5px 8px rgba(0, 0, 0, 0.5)',
    marginTop: "15px",
    display: 'flex',
    flexDirection: 'column',
    overflowY: "scroll",
    overflowX: "hidden",
    alignItems:"center",
};


const listStyle = {
    display: "flex",
    justifyContent:"center",
    width:"400px",
    maxWidth:"400px",
    textAlign:"left",
    padding:"5px 0px",
    textOverflow: "ellipsis",
    whiteSpace : "nowrap",
    textOverflow: "clip",
    margin:"0px"
}

const noticeRow = {
    display:"inline-block",
    width :"90%",
    overflowX: "hidden",
    textOverflow: "ellipsis",
    whiteSpace : "nowrap",
}

const header = {
    padding : "10px",
    color: "white",
    backgroundColor: "#004377",
    borderRadius:"10px",
    textAlign:"center",
    width: "90%",
    height:"10%",
    margin:"10px 10px",
}
