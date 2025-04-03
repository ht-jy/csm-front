import React, { useEffect, useReducer, useState } from "react";
import "../../assets/css/slider.css";
import upAndDown from "../../assets/image/up-and-down.png";
import { Axios } from "../../utils/axios/Axios";
import { useAuth } from "../context/AuthContext";
import NoticeDetail from "../layout/content/management/notice/NoticeDetail";
import NoticeReducer from "../layout/content/management/notice/NoticeReducer";


function AnnouncementSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const { user } = useAuth();
    const [hoverOpen, setHoverOpen] = useState(false);

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
        // FIXME: 관리자 권한에 따라 변경하기
        const res = await Axios.GET(`/notice/${user.uno}?role=ADMIN&page_num=${1}&row_size=${50}&order=POSTING_START_DATE DESC, POSTING_END_DATE ASC`);

        if (res?.data?.result === "Success") {
            dispatch({ type: "HEADER", notices: res?.data?.values?.notices, count: res?.data?.values?.count });
        }
    }

    // 자동 슬라이드 재시작하기
    const resetAutoSlide = () => {
        clearInterval(window.autoSlide);
        window.autoSlide = setInterval(handleNext, 3000);
    };

    // 화살표를 클릭했을 때
    const handleClick = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const imageHeight = rect.height;

        if (clickY < imageHeight / 2) {
            handleNext();
        } else {
            handlePrev();
        }
    };

    // 이전 공지로 넘기기
    const handlePrev = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? state.headerList.length - 1 : prevIndex - 1
        );
        resetAutoSlide();
    };

    // 다음 공지로 넘기기
    const handleNext = () => {
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentIndex((prevIndex) => (prevIndex + 1) % (state.headerList.length === 0 ? 10 : state.headerList.length));
        resetAutoSlide();
    };

    // 공지 클릭 시 상세페이지
    const handleAnnouncementClick = () => {
        setData([state.noticesHeader[currentIndex]])
        setIsDetail(true)
    };

    // 상세 모달에서 모달 open 상태 변경
    const handleOpenDetail = (openState) => {
        setIsDetail(openState)
    }

    // 공지사항 리스트 클릭 시 상세페이지
    const handleRowClick = (item) => {
        setData([item])
        setIsDetail(true)
    }

    // Index 조절하기
    useEffect(() => {
        if (state.headerList.length > 0) {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % state.headerList.length);
        }
    }, [state.headerList]);

    // 공지사항 데이터 로드
    useEffect(() => {
        getNotices()
    }, [])

    // 3초마다 다음 공지 띄우기.
    useEffect(() => {
        const interval = setInterval(() => {
            handleNext();
        }, 3000);
        return () => clearInterval(interval);
    }, [currentIndex]);

    // 0.5초 후 적용하기(텍스트 변경되는 시간)
    useEffect(() => {
        const timeout = setTimeout(() => setIsAnimating(false), 500);
        return () => clearTimeout(timeout);

    }, [currentIndex]);

    // 상세공지사항을 띄운 경우, 공지사항 리스트는 닫기
    useEffect(() => {
        if(isDetail === true){
            setHoverOpen(false)
        }

    }, [isDetail])

    return (
        <>
            <NoticeDetail
                notice={data}
                isDetail={isDetail}
                setIsDetail={handleOpenDetail}
            ></NoticeDetail>

            <div className="announcement-slider"
                onMouseEnter={() => setHoverOpen(true)}
                onMouseLeave={() => setHoverOpen(false)}
            >
                <div>
                    {
                        hoverOpen &&
                        <div style={{ width: "100%", height: "100%" }}>
                            <div style={{ ...modalStyle }} >
                                <div style={{...header}}>공지사항</div>
                                {
                                    state.noticesHeader.length === 0 ?
                                    <div>공지사항이 없습니다.</div>
                                        :
                                        state.noticesHeader?.map((item, idx) => {
                                            return <div 
                                                key={idx} 
                                                onClick={() => {
                                                    handleRowClick(item)
                                                }}
                                                style={{...listStyle }}                                                
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
                {/* 왼쪽 화살표 버튼 */}
                {/* <img
                src={arrorLeft}
                onClick={handlePrev}
                style={{ 
                    width: "12px", 
                    zIndex: 10, 
                    cursor: "pointer",
                    filter: "brightness(0) invert(1)",
                    marginRight: "10px"
                    }}
                    alt="left arrow"
                    /> */}

                <div style={{ width: "30px", height: "30px", textAlign: "center", cursor: "pointer" }} onClick={handleClick}>
                    <img
                        src={upAndDown}
                        style={{ width: "15px" }}
                    />
                </div>

                {/* 슬라이드 텍스트 */}
                <div className="slides-container">
                    <div className="slide">
                        {
                            state.headerList.length === 0 ? 
                                <span>공지사항이 없습니다.</span>
                            
                            :
                            <span className="slide"
                                onClick={handleAnnouncementClick}
                                style={{
                                    cursor: "pointer",
                                }} >
                                    
                                    {state.headerList[currentIndex]?.job_name === "전체" ?
                                    `전체` : `PROJ`} - {state.headerList[currentIndex]?.title}
                            </span>
                            }
                    </div>
                </div>



                {/* 오른쪽 화살표 버튼 */}
                {/* <img
                src={arrorRight}
                onClick={handleNext}
                style={{ 
                    width: "12px", 
                    zIndex: 10, 
                    cursor: "pointer",
                    filter: "brightness(0) invert(1)",
                    marginLeft: "10px"
                    }}
                    alt="right arrow"
                /> */}
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
    boxShadow: '10px 10px 1px rgb(0, 0, 0, 0.3)',
    margin: '20px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: "scroll",
    overflowX: "hidden",
    alignItems:"center"
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
