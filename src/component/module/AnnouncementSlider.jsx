import React, { useState, useEffect, useReducer } from "react";
import "../../assets/css/slider.css";
import arrorRight from "../../assets/image/arrow-right.png";
import arrorLeft from "../../assets/image/arrow-left.png";
import upAndDown from "../../assets/image/up-and-down.png";
import { Axios } from "../../utils/axios/Axios";
import NoticeReducer from "../layout/content/management/notice/NoticeReducer";
import { useAuth } from "../context/AuthContext";
import NoticeDetail from "../layout/content/management/notice/NoticeDetail";


function AnnouncementSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const { user } = useAuth();

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
    const res = await Axios.GET(`/notice/${user.uno}?page_num=${1}&row_size=${10}`);
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

  return (
    <div className="announcement-slider">
      <NoticeDetail
        notice={data}
        isDetail={isDetail}
        setIsDetail={handleOpenDetail}
      ></NoticeDetail>

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
          <span className="slide"
            onClick={handleAnnouncementClick}
            style={{
              cursor: "pointer",
            }}
          >
            {state.headerList[currentIndex]?.job_name === "전체" ?
              `전체` : `PROJ`} - {state.headerList[currentIndex]?.title}
          </span>
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
  );
}

export default AnnouncementSlider;
