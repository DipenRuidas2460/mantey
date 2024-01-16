import { CaretLeft, CaretRight } from "@styled-icons/bootstrap";
import { A11y, Autoplay, Navigation } from "swiper";
import { useState } from "react";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import Category from "./categories";
import c from "./category.module.css";
import { useTranslation } from "react-i18next";

const breakpointNewArrival = {
  320: {
    slidesPerView: 2,
  },
  480: {
    slidesPerView: 3,
  },
  600: {
    slidesPerView: 4,
  },
  991: {
    slidesPerView: 5,
  },
  1200: {
    slidesPerView: 8,
  },
};

function CategoryList(props) {
  const [prevEl, setPrevEl] = useState(null);
  const [nextEl, setNextEl] = useState(null);
  const { t } = useTranslation();

  if (!props.categoryList || !props.categoryList.length) {
    return null;
  }

  return (
    <div className="content_container">
      <div className="custom_container">
        <h2 className="content_heading">{t("top_categories")}</h2>
        <div className={c.root_container}>
          {props.categoryList.length > 0 && (
            <div className="navigation-wrapper">
              <Swiper
                modules={[Navigation, A11y, Autoplay]}
                spaceBetween={0}
                slidesPerView="auto"
                navigation={{ prevEl, nextEl }}
                breakpoints={breakpointNewArrival}
                className={`_feature_slider`}
                autoplay={{
                  delay: 6000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                  waitForTransition: true,
                }}
                loop={false}
                centeredSlides={false}
                centerInsufficientSlides={true}
                speed={900}
              >
                {props.categoryList?.map((category) => (
                  <SwiperSlide key={category._id}>
                    <Category
                      name={category.name}
                      slug={category.slug}
                      img={category.icon[0]?.url}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
              <div
                className="swiper-button-prev arrow arrow--left"
                ref={(node) => setPrevEl(node)}
              >
                <CaretLeft width={17} height={17} />
              </div>
              <div
                className="swiper-button-next arrow arrow--right"
                ref={(node) => setNextEl(node)}
              >
                <CaretRight width={17} height={17} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CategoryList;
