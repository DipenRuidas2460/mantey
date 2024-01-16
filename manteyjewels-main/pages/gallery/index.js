import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import HeadData from "~/components/Head";
import Error500 from "~/components/error/500";
import { compareData, fetchData, setSettingsData } from "~/lib/clientFunctions";
import galleryPageData from "~/lib/dataLoader/gallery";
import { wrapper } from "~/redux/store";
import classes from "~/styles/gallery.module.css";

const GlobalModal = dynamic(() => import("~/components/Ui/Modal/modal"));
const Spinner = dynamic(() => import("~/components/Ui/Spinner"));
const TopbarList = dynamic(() =>
  import("~/components/Shop/Sidebar/sidebarList")
);
const ProductList = dynamic(() =>
  import("~/components/Shop/Product/productList")
);
const ProductDetails = dynamic(() =>
  import("~/components/Shop/Product/productDetails")
);

function GalleryPage({ data, error }) {
  const router = useRouter();
  const _items = data.product || [];
  const [_productList, _setProductList] = useState(_items);
  const [sortedItemList, setSortedItemList] = useState(_items);
  const [loading, setLoading] = useState(false);
  const [productLength, setProductLength] = useState(data.product_length || 0);
  const [isOpen, setIsOpen] = useState(false);
  const [sortKey, setSortKey] = useState("db");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedSubCategory, setSelectedSubCategory] = useState("");
  const [selectedBrand, setSelectedBrand] = useState([]);
  const [payloadData, setPayloadData] = useState("");
  const [subPayloadData, setSubPayloadData] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minPriceInput, setMinPriceInput] = useState("");
  const [maxPriceInput, setMaxPriceInput] = useState("");
  const [defaultShopImage, setDefaultShopImage] = useState({});
  // const [attributeData, setAttributeData] = useState("");
  // const [selectedAttr, setSelectedAttr] = useState([]);
  const [tagsData, setTagsData] = useState("");
  const [selectedTag, setSelectedTag] = useState([]);
  const isInitialMount = useRef(true);
  const { t } = useTranslation();

  const callback = (payload) => {
    if (payload.ischecked === true) {
      setSelectedTag([...selectedTag, payload]);
    } else {
      let filterSelectedArray = selectedTag.filter(
        (el) => el.label === payload.label && el.name === payload.name
      );
      let newFilterArray = selectedTag.filter(
        (el) => el != filterSelectedArray[0]
      );
      setSelectedTag(newFilterArray);
    }
  };

  const productType ={
    _id: "64dc7e400996e6a19demo12345",
    name: "Product Type",
    values: [
        {
            name: "New Products",
            value: ""
        },
        {
            name: "Trending Products",
            value: ""
        },
        {
            name: "Best Selling",
            value: ""
        },
        {
            name: "Featured Products",
            value: ""
        },
        {
            name: "Clearence Products",
            value: ""
        },
    ],
    hideAttribute: false,
    __v: 0
}

  //update filter
  async function updateFilteredProduct() {
    try {
      setLoading(true);

      let brandArr = "&";
      selectedBrand.forEach((el) => {
        brandArr = brandArr + `brands=${el}&`;
      });

      let tagArr = "&";
      selectedTag.forEach((el) => {
        tagArr =
          tagArr +
          `tags=${el.name.split(" ").join("-")}&` +
          `parent=${el.parentLabel.split(" ").join("-")}&`;
      });

      const cat = `category=${
        selectedCategory.length > 0 ? selectedCategory : ""
      }`;
      const sub = `&subcategory=${
        selectedCategory.length > 0 ? selectedSubCategory : ""
      }`;

      let minPrice, maxPrice;
      if (minPriceInput && maxPriceInput) {
        minPrice = `&minPrice=${minPriceInput?.value}`;
        maxPrice = `&maxPrice=${maxPriceInput?.value}`;
      }

      const prefix = `${cat}${sub}${brandArr}${minPrice}${maxPrice}${tagArr}`;
      const response = await fetchData(`/api/gallery?${prefix}`);
      _setProductList(response.product);
      setProductLength(response.product_length);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
  }

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else {
      updateFilteredProduct();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    selectedCategory,
    selectedSubCategory,
    selectedBrand,
    minPriceInput,
    maxPriceInput,
    // selectedAttr,
    selectedTag,
  ]);

  useEffect(() => {
    fetchData(`/api/common`)
      .then((res) => {
        setMaxPrice(res.commonSettings.maxPrice);
        setMinPrice(res.commonSettings.minPrice);
        setDefaultShopImage(res.commonSettings.shopDefault[0]);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  // useEffect(() => {
  //   fetchData(`/api/attributes/fetch`)
  //     .then((res) => {
  //       setAttributeData(res.attributes);
  //     })
  //     .catch((err) => {
  //       console.log(err.message);
  //     });
  // }, []);

  // console.log(defaultShopImage, "defaultShopImage");

  useEffect(() => {
    fetchData(`/api/tags/fetch`)
      .then((res) => {
   
        // console.log([...res.tags, productType], "tags data")
        setTagsData(res.tags);
      })
      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  const clickedData = (payload) => {
    setPayloadData(payload);
  };

  const subCateData = (payload) => {
    setSubPayloadData(payload);
  };

  const callMinPrice = (payload) => {
    setMinPriceInput(payload);
  };

  const callMaxPrice = (payload) => {
    setMaxPriceInput(payload);
  };

  //modal close handler
  const handleCloseModal = () => {
    router.push("/gallery", undefined, { shallow: true });
    setIsOpen(false);
  };

  //Global Data Sorting function
  function sortDataHandler(key) {
    setLoading(true);
    let sortedData = compareData(_productList, key);
    const __sdt = sortedData ? sortedData : _productList;
    setSortedItemList([...__sdt]);
    setLoading(false);
  }

  //Item sorting event handler
  const sortItems = (key) => {
    setSortKey(key);
    sortDataHandler(key);
  };

  //popup product viewer track
  useEffect(() => {
    if (router.query.slug) {
      setIsOpen(true);
    }
  }, [router.query.slug]);

  //Load more items
  const moreProduct = async () => {
    await fetchData(
      `/api/gallery/more-product?product_length=${_productList.length}`
    )
      .then((data) => {
        _setProductList([..._productList, ...data]);
      })
      .catch((err) => {
        console.error(err);
        toast.error(`Something went wrong...(${err.message})`);
      });
  };

  //on data change sort data
  useEffect(() => {
    sortDataHandler(sortKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_productList]);

  return (
    <>
      <HeadData />
      {data?.category?.map((el) =>
        el?.slug == subPayloadData ? (
          <img
            key={el.slug}
            src={
              el?.banner[0]?.url !== undefined
                ? el?.banner[0]?.url !== null
                  ? el?.banner[0]?.url
                  : defaultShopImage.url
                : defaultShopImage.url
            }
            alt={el?.banner[0]?.name}
            style={{ width: "100%", height: "40vh" }}
          />
        ) : (
          el?.slug == payloadData && (
            <img
              key={el.slug}
              src={
                el?.banner[0]?.url !== undefined
                  ? el?.banner[0]?.url !== null
                    ? el?.banner[0]?.url
                    : defaultShopImage.url
                  : defaultShopImage.url
              }
              // src={el?.banner[0]?.url}
              alt={el?.banner[0]?.name}
              style={{ width: "100%", height: "40vh" }}
            />
          )
        )
      )}
    

      {!payloadData && !subPayloadData && selectedCategory ? (
        data?.category?.map(
          (el) =>
            el?.slug == selectedCategory && (
              <img
                key={el.slug}
                // src={el?.banner[0]?.url}
                src={
                  el?.banner[0]?.url !== undefined
                    ? el?.banner[0]?.url !== null
                      ? el?.banner[0]?.url
                      : defaultShopImage.url
                    : defaultShopImage.url
                }
                alt={el?.banner[0]?.name}
                style={{ width: "100%", height: "40vh" }}
              />
            )
        )
      ) : (
        <img
          key={defaultShopImage.slug}
          src={defaultShopImage.url}
          alt={defaultShopImage.name}
          style={{ width: "100%", height: "40vh" }}
        />
      )}

      {error ? (
        <Error500 />
      ) : !data ? (
        <Spinner />
      ) : (
        <div className="row">
          <div className={classes.gallery_container}>
            <div className="row">
              {minPrice && maxPrice && tagsData && (
                <TopbarList
                  category={data.category}
                  brand={data.brand}
                  sort={sortItems}
                  updateCategory={setSelectedCategory}
                  updateSubCategory={setSelectedSubCategory}
                  updateBrand={setSelectedBrand}
                  clickedData={clickedData}
                  subCateData={subCateData}
                  minPrice={minPrice}
                  maxPrice={maxPrice}
                  callMinPrice={callMinPrice}
                  callMaxPrice={callMaxPrice}
                  productData={data.product}
                  // attributeData={attributeData}
                  // updateAttr={setSelectedAttr}
                  tagsData={[...tagsData, productType]}
                  updateTag={callback}
                />
              )}
            </div>

            {!loading && sortedItemList.length === 0 ? (
              <div className="m-5 p-5">
                <p className="text-center">{t("no_product_found")}</p>
              </div>
            ) : !loading ? (
              <ProductList
                items={sortedItemList}
                data_length={productLength}
                loadMore={moreProduct}
              />
            ) : (
              <div style={{ height: "80vh" }}>
                <Spinner />
              </div>
            )}
          </div>
        </div>
      )}
      {/* </div> */}
      <GlobalModal
        small={false}
        isOpen={isOpen}
        handleCloseModal={handleCloseModal}
      >
        {router.query.slug && (
          <ProductDetails productSlug={router.query.slug} />
        )}
      </GlobalModal>
    </>
  );
}

GalleryPage.footer = false;

export default GalleryPage;

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ req, res, query }) => {
      if (res) {
        res.setHeader(
          "Cache-Control",
          "public, s-maxage=10800, stale-while-revalidate=59"
        );
      }
      const { category: Qc, brand: Qb } = query;
      let type = null;
      let _query = null;
      if ((Qc && Qc.length > 0) || (Qb && Qb.length > 0)) {
        type = true;
        _query = true;
      }
      const _data = await galleryPageData(type, _query);
      const data = JSON.parse(JSON.stringify(_data));
      if (data.success) {
        setSettingsData(store, data);
      }
      return {
        props: {
          data,
          error: !data.success,
        },
      };
    }
);
