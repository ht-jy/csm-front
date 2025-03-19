import React, { useState, useEffect, useReducer } from "react";
import "../../assets/css/slider.css";
import arrorRight from "../../assets/image/arrow-right.png";
import arrorLeft from "../../assets/image/arrow-left.png";
import upAndDown from "../../assets/image/up-and-down.png";
import { Axios } from "../../utils/axios/Axios";
import NoticeReducer from "../layout/content/management/notice/NoticeReducer";
import { useAuth } from "../context/AuthContext";
import { dateUtil } from "../../utils/DateUtil";


function AnnouncementSlider() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const {user} = useAuth();

  const [state, dispatch] = useReducer(NoticeReducer, {
    noticesHeader: [],
    count : 0,
   });
   const getNotices = async () => {  
          const res = await Axios.GET(`/notice/${user.uno}?page_num=${1}&row_size=${10}`);
          if (res?.data?.result === "Success") {
              dispatch({ type: "HEADER", notices: res?.data?.values?.notices, count: res?.data?.values?.count });
          }
          console.log(state.noticesHeader)
      }

  const resetAutoSlide = () => {
    clearInterval(window.autoSlide);
    window.autoSlide = setInterval(handleNext, 3000);
  };

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

  const handlePrev = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? state.noticesHeader.length - 1 : prevIndex - 1
    );
    resetAutoSlide();
  };

  const handleNext = () => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrentIndex((prevIndex) => (prevIndex + 1) % (state.noticesHeader.length === 0 ? 10 : state.noticesHeader.length ) );
    resetAutoSlide();
  };

  const handleAnnouncementClick = () => {
    alert(`현재 공지사항: ${state.noticesHeader[currentIndex]}`);
  };

  useEffect(() => {
    if (state.noticesHeader.length > 0) {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % state.noticesHeader.length);
    }
  }, [state.noticesHeader]);

  useEffect(() => {
    getNotices()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      handleNext();
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex]);


  useEffect(() => {
    const timeout = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timeout);

  }, [currentIndex]);

  return (
    <div className="announcement-slider">
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
        
      <div style={{width: "30px", height: "30px", textAlign: "center", cursor: "pointer"}} onClick={handleClick}>
        <img 
          src={upAndDown}
          style={{width: "15px"}}
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
            {state.noticesHeader[currentIndex]} 
            {/* {currentIndex} {Date()} */}
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
