'use client';
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/swiper.min.css";
import "swiper/components/navigation/navigation.min.css";
import "swiper/components/pagination/pagination.min.css";
// import Swiper core and required modules
import {
  Pagination,Navigation
} from 'swiper/core';
import React from "react";

export function SwiperComponent({ children }: { children: React.ReactNode }) {
  return (
    <Swiper
      spaceBetween={30}
      slidesPerView={1}
      navigation={true}
      hashNavigation={{
        "watchState": true
    }}
      pagination={{ clickable: true }}
      className="mySwiper"
    >
      {React.Children.map(children, (child, index) => (
        <SwiperSlide key={index}>
          {child}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}