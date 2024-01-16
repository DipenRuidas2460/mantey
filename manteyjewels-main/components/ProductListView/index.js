import { CaretLeft, CaretRight } from "@styled-icons/bootstrap";
import { useEffect, useRef, useState } from "react";
import { A11y, Autoplay, Navigation } from "swiper";
import "swiper/css";
import { Swiper, SwiperSlide } from "swiper/react";
import Product from "../Shop/Product/product";
import c from "./productList.module.css";
import useOnScreen from "~/utils/useOnScreen";
import { toast } from "react-toastify";
import { fetchData } from "~/lib/clientFunctions";
import Spinner from "../Ui/Spinner";
import { useRouter } from "next/router";
import Link from "next/link";

const breakpointNewArrival = {
  320: {
    slidesPerView: 1,
  },
  675: {
    slidesPerView: 1,
  },
  880: {
    slidesPerView: 3,
  },
  1100: {
    slidesPerView: 4,
  },
  1600: {
    slidesPerView: 5,
  },
};

function ProductList(props) {
  const [prevEl, setPrevEl] = useState(null);
  const [nextEl, setNextEl] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [productList, setProductList] = useState([]);
  const current = useRef();
  const onViewPort = useOnScreen(current);
  const [itemsToShow, setItemsToShow] = useState(8);
  const router = useRouter();

  async function loadData() {
    try {
      const url = `/api/home/products?type=${props.type}`;
      const resp = await fetchData(url);
      resp.success
        ? setProductList(resp.products || [])
        : toast.error("Something Went Wrong");
    } catch (err) {
      console.log(err);
      toast.error("Something Went Wrong");
    }
    setLoaded(true);
  }

  useEffect(() => {
    if (onViewPort && !loaded) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onViewPort]);

  return (
    <div className="content_container" ref={current}>
      <div className="custom_container">
        <h2 className="content_heading">{props.title}</h2>
        {!loaded && (
          <div className={c.loader}>
            <Spinner />
          </div>
        )}
        <div className={c.productswrapper}>
          {productList.length > 0 &&
            // <div className="navigation-wrapper">
            //   <Swiper
            //     modules={[Navigation, A11y, Autoplay]}
            //     spaceBetween={0}
            //     slidesPerView="auto"
            //     navigation={{ prevEl, nextEl }}
            //     breakpoints={breakpointNewArrival}
            //     className="_feature_slider"
            //     autoplay={{
            //       delay: 6000,
            //       disableOnInteraction: false,
            //       pauseOnMouseEnter: true,
            //       waitForTransition: true,
            //     }}
            //     loop={false}
            //     centeredSlides={false}
            //     centerInsufficientSlides={true}
            //     speed={900}
            //   >
            //     {productList.map((item) => (
            //       <SwiperSlide key={item._id} className={c.container}>
            //         <Product
            //           product={item}
            //           button
            //           link={`/?slug=${item.slug}`}
            //           layout={"text-start"}
            //           border
            //         />
            //       </SwiperSlide>
            //     ))}
            //   </Swiper>
            //   <div
            //     className="swiper-button-prev arrow arrow--left"
            //     ref={(node) => setPrevEl(node)}
            //   >
            //     <CaretLeft width={17} height={17} />
            //   </div>
            //   <div
            //     className="swiper-button-next arrow arrow--right"
            //     ref={(node) => setNextEl(node)}
            //   >
            //     <CaretRight width={17} height={17} />
            //   </div>
            // </div>
            productList.slice(0, itemsToShow).map((item) => (
              // <SwiperSlide key={item._id} className={c.container}>
              <Product
                product={item}
                button
                link={`/?slug=${item.slug}`}
                layout={"text-start"}
                border
              />
              // </SwiperSlide>
            ))}
          {/* /gallery */}
        </div>
        <div>
          {productList.length > itemsToShow && (
            <div className={c.buttonContainer}>
              <Link
                href={`/gallery?filter=${props.title.split(" ").join("-")}`}
                as={`/gallery?filter=${props.title.split(" ").join("-")}`}
                scroll={false}
                shallow={true}
                className={c.button}
              >
                Show More
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductList;
