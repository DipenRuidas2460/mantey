import { Filter } from "@styled-icons/bootstrap/Filter";
import React, { useEffect, useState } from "react";
import BrandList from "./brand";
import ShortMenu from "./ShortMenu";
import SidebarCategoryList from "./category";
import c from "./sidebarList.module.css";
import { XLg } from "@styled-icons/bootstrap";
import { useTranslation } from "react-i18next";
import MultiRangeSlider from "../../../components/MultiRangeSlider/MultiRangeSlider";
// import AttributeMenu from "./AttributeMenu";
import TagsMenu from "./TagsMenu";

function SidebarList({
  sort,
  updateBrand,
  brand,
  updateSubCategory,
  clickedData,
  subCateData,
  updateCategory,
  category,
  minPrice,
  maxPrice,
  callMinPrice,
  callMaxPrice,
  productData,
  // attributeData,
  // updateAttr
  tagsData,
  updateTag,
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [hideTopBar, setHideTopBar] = useState(false);
  const { t } = useTranslation();

  // let productNameDropdown = [
  //   {
  //     name: "New Products",
  //     parentLabel: "Product Type",
  //   },
  //   {
  //     name: "Trending Products",
  //     parentLabel: "Product Type",
  //   },
  //   {
  //     name: "Best Selling",
  //     parentLabel: "Product Type",
  //   },
  //   {
  //     name: "Featured Products",
  //     parentLabel: "Product Type",
  //   },
  //   {
  //     name: "Clearence Products",
  //     parentLabel: "Product Type",
  //   },
  // ];

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScroll = () => {
    const position = window.scrollY;
    const width = window.innerWidth;
    if (width < 992) {
      setHideTopBar(true);
    } else if (position > 110) {
      setHideTopBar(true);
    } else {
      setHideTopBar(false);
    }
  };

  const toggleFilter = () => setSidebarOpen(!sidebarOpen);

  console.log(tagsData, "tagsData");

  return (
    <>
      {/* Sidebar Button */}
      <div
        className={`${c.filter_btn} ${sidebarOpen ? c.b_left : ""}`}
        onClick={toggleFilter}
      >
        <Filter width={33} height={33} />
        <span>{t("filter")}</span>
      </div>

      {/* Sidebar */}
      <div className={`${c.header} ${sidebarOpen ? c.s_left : ""}`}>
        <h4>{t("filter")}</h4>
        <XLg width={25} height={25} onClick={toggleFilter} />
      </div>

      {/* Mobile */}
      <div
        className={`${c.sidebar_mobile} ${sidebarOpen ? c.s_left : ""} ${
          hideTopBar ? c.sidebar_top_scroll_mobile : c.sidebar_top_normal_mobile
        }`}
      >
        <div className={c.sidebar_inner_mobile}>
          <label>{t("sort_by")}</label>
          <ShortMenu update={sort} />

          {/* Price Menu */}

          <div className={c.category_item_mobile}>
            <label>{t("Price")}</label>
            <MultiRangeSlider
              min={minPrice}
              max={maxPrice}
              callMinPrice={callMinPrice}
              callMaxPrice={callMaxPrice}
            />
          </div>

          {/* Tags Menu */}

          {tagsData.map((el, index) => (
            <div className="dropdown mt-5" key={index}>
              <strong
                className="dropdown-toggle"
                id="dropdownMenuButton5"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ cursor: "pointer" }}
              >
                {el.name}
              </strong>
              <ul
                className="dropdown-menu"
                aria-labelledby="dropdownMenuButton5"
              >
                <li className="row">
                  <div className={c.category_item}>
                    <TagsMenu
                      tag={tagsData}
                      updateTag={updateTag}
                      parent={el.name}
                    />
                  </div>
                </li>
              </ul>
            </div>
          ))}

          {/* Attribute Menu */}

          {/* {attributeData?.map((el, ind) => (
            <div className={c.attribute} key={ind}>
              <label>{el.name}</label>
              <AttributeMenu attribute={el.values} />
            </div>
          ))} */}

          {/* category menu */}

          <div className={c.category_item_mobile}>
            <label>{t("categories")}</label>
            <SidebarCategoryList
              category={category}
              updateCategory={updateCategory}
              updateSubCategory={updateSubCategory}
              hideTopBar={hideTopBar}
              callBack={clickedData}
              newCallBack={subCateData}
              productData={productData}
            />
          </div>

          <div className={c.category_item_mobile}>
            <label>{t("brands")}</label>
            <BrandList brand={brand} updateBrand={updateBrand} />
          </div>
        </div>
      </div>

      {/* Desktop */}
      <div
        className={`${c.sidebar} ${sidebarOpen ? c.s_left : ""} ${
          hideTopBar ? c.sidebar_top_scroll : c.sidebar_top_normal
        }`}
      >
        <div className={c.sidebar_inner}>
          {/* category menu */}

          <div className="dropdown">
            <strong
              className="dropdown-toggle"
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ cursor: "pointer" }}
            >
              {t("categories")}
            </strong>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <li className={c.row_category}>
                <div className={c.category_item}>
                  <SidebarCategoryList
                    category={category}
                    updateCategory={updateCategory}
                    updateSubCategory={updateSubCategory}
                    callBack={clickedData}
                    newCallBack={subCateData}
                    productData={productData}
                  />
                </div>
              </li>
            </ul>
          </div>

          {/* brand menu */}

          <div className="dropdown">
            <strong
              className="dropdown-toggle"
              id="dropdownMenuButton2"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ cursor: "pointer" }}
            >
              {t("brands")}
            </strong>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton2">
              <li className="row">
                <div className={c.category_item}>
                  <BrandList brand={brand} updateBrand={updateBrand} />
                </div>
              </li>
            </ul>
          </div>

          {/* Price Menu */}

          <div className="dropdown">
            <strong
              className="dropdown-toggle"
              id="dropdownPrice"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ cursor: "pointer" }}
            >
              {t("Price")}
            </strong>
            <div className="dropdown-menu" aria-labelledby="dropdownPrice">
              <MultiRangeSlider
                min={minPrice}
                max={maxPrice}
                callMinPrice={callMinPrice}
                callMaxPrice={callMaxPrice}
              />
            </div>
          </div>

          {/* Attribute Menu */}

          {/* {attributeData.map((el, index) => (
            <div className="dropdown" key={index}>
              <strong
                className="dropdown-toggle"
                id="dropdownMenuButton5"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ cursor: "pointer" }}
              >
                {el.name}
              </strong>
              <ul
                className="dropdown-menu"
                aria-labelledby="dropdownMenuButton5"
              >
                <li className="row">
                  <div className={c.category_item}>
                    <AttributeMenu attribute={attributeData} updateAttr={updateAttr} />
                  </div>
                </li>
              </ul>
            </div>
          ))} */}

          {/* Tags Menu */}

          {tagsData.map((el, index) => (
            <div className="dropdown" key={index}>
              <strong
                className="dropdown-toggle"
                id="dropdownMenuButton5"
                data-bs-toggle="dropdown"
                aria-expanded="false"
                style={{ cursor: "pointer" }}
              >
                {el.name}
              </strong>
              <ul
                className="dropdown-menu"
                aria-labelledby="dropdownMenuButton5"
              >
                <li className="row">
                  <div className={c.category_item}>
                    <TagsMenu
                      tag={tagsData}
                      updateTag={updateTag}
                      parent={el.name}
                    />
                  </div>
                </li>
              </ul>
            </div>
          ))}

          {/* <div className="dropdown">
            <strong
              className="dropdown-toggle"
              id="dropdownMenuButton5"
              data-bs-toggle="dropdown"
              aria-expanded="false"
              style={{ cursor: "pointer" }}
            >
              Product Type
            </strong>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton5">
              {productNameDropdown?.map((item, index) => (
                <li key={index}>{item.name}</li>
              ))}
            </ul>
          </div> */}

          {/* Sort By:- */}
          <div className={c.short_menu}>
            <label>{t("Sort By:")}</label>
            <ShortMenu update={sort} />
          </div>
        </div>
      </div>
    </>
  );
}

export default React.memo(SidebarList);
