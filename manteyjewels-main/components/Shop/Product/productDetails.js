import customId from "custom-id-new";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import InnerImageZoom from "react-inner-image-zoom";
import "react-inner-image-zoom/lib/InnerImageZoom/styles.min.css";
import { useDispatch, useSelector } from "react-redux";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { toast } from "react-toastify";
import useSWR from "swr";
import ImageLoader from "~/components/Image";
import { fetchData, stockInfo } from "~/lib/clientFunctions";
import { addToCart, addVariableProductToCart } from "~/redux/cart.slice";
import Spinner from "../../Ui/Spinner";
import classes from "./productDetails.module.css";
import { useTranslation } from "react-i18next";
import moment from "moment/moment";
import Link from "next/link";

const Carousel = dynamic(() =>
  import("react-responsive-carousel").then((com) => com.Carousel)
);

const DataTable = dynamic(() => import("react-data-table-component"));

const ProductDetails = (props) => {
  const url = `/api/product/${props.productSlug}`;
  const { data, error } = useSWR(url, fetchData);
  const [price, setPrice] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [productList, setProductList] = useState([]);
  const [comboProduct, setComboProduct] = useState([]);
  const dispatch = useDispatch();
  const quantityAmount = useRef();
  const cartData = useSelector((state) => state.cart);
  const settings = useSelector((state) => state.settings);
  const currencySymbol = settings.settingsData.currency.symbol;
  const { t } = useTranslation();
  const [commonSettingData, setCommonSettingData] = useState({});

  const [bcsImage, setBcsImage] = useState("");

  useEffect(() => {
    fetchData(`/api/common`)
      .then((res) => {
        const responseData = res?.commonSettings;
        if (responseData) {
          setCommonSettingData(responseData);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [data]);

  useEffect(() => {
    let productListArray = [];
    data?.product?.comboProducts?.map((ele) => {
      fetchData(`/api/product/productSearchApi?productId=${ele?.productId}`)
        .then((res) => {
          productListArray.push(res.product);
          setComboProduct(productListArray);
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }, [data]);

  useEffect(() => {
    if (data && data.product) {
      setPrice(data.product.discount);
      if (data.product.type !== "variable") {
        return;
      }

      data.product.variants.map((el) => {
        el.image = data?.product?.gallery[el?.imageIndex - 1];
        el.originalPrice = data?.product?.price;
        el.discount = data?.product?.discount + parseInt(el.price);
        el.defaultQty = 1;
      });

      setProductList(data.product.variants);
    }
  }, [data]);

  const now = moment();
  let currentDate = `${now.format("ll")}`;
  currentDate = currentDate.slice(0, 6).replace(/,\s*$/, "");

  now.add(JSON.stringify(commonSettingData?.ruleSettingOrdered - 1), "days");
  let buildDate = `${now.format("ll")}`;
  buildDate = buildDate.slice(0, 6).replace(/,\s*$/, "");

  now.add("1", "days");
  let orderReadyDate = `${now.format("ll")}`;
  orderReadyDate = orderReadyDate.slice(0, 6).replace(/,\s*$/, "");

  now.add(JSON.stringify(commonSettingData?.ruleSettingDelivered), "days");
  let deliveredDate = `${now.format("ll")}`;
  deliveredDate = deliveredDate.slice(0, 6).replace(/,\s*$/, "");

  now.subtract("2", "days");
  let bufferDate = `${now.format("ll")}`;
  bufferDate = bufferDate.slice(0, 6).replace(/,\s*$/, "");

  const columns1 = [
    {
      name: t("image"),
      selector: (row) => (
        <ImageLoader
          src={row.image[0]?.url}
          alt={row.image[0]?.altText}
          width={80}
          height={80}
          mouseMove={() => setBcsImage(row.image[0]?.url)}
          mouseOut={() => setBcsImage("")}
          style={{ padding: "5px 0px 5px 0px", borderRadius: "10px" }}
        />
      ),
      width: "120px",
    },
    {
      name: t("name"),
      cell: (row) => {
        return (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div>
              <strong>
                <a href={`/product/${row.slug}`} target="_blank">
                  {row.name}
                </a>
              </strong>
            </div>
            <div>
              <small>
                <a href={`/product/${row.slug}`} target="_blank">
                  {row.productId}
                </a>
              </small>
            </div>
          </div>
        );
      },
      sortable: true,
      width: "280px",
    },
    {
      name: t("price"),
      cell: (row) => {
        return (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div>
              <strong>{currencySymbol + " " + row.discount}</strong>
            </div>
            <div>
              <small style={{ textDecoration: "line-through" }}>
                {currencySymbol + " " + row.price}
              </small>
            </div>
          </div>
        );
      },
      sortable: true,
      width: "100px",
    },
  ];

  const columns = [
    {
      name: t("image"),
      selector: (row) => (
        <ImageLoader
          src={row.image?.url}
          alt={row.image?.altText}
          width={50}
          height={50}
          mouseMove={() => setBcsImage(row.image?.url)}
          mouseOut={() => setBcsImage("")}
          style={{ padding: "5px 0px 5px 0px", borderRadius: "10px" }}
        />
      ),
      width: "90px",
    },
    {
      name: t("name"),
      cell: (row) => {
        return (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div>
              <strong>{row.variantName}</strong>
            </div>
            <div>
              <small>{row.sku}</small>
            </div>
          </div>
        );
      },
      sortable: true,
      width: "140px",
    },
    {
      name: t("price"),
      cell: (row) => {
        return (
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div>
              <strong>{currencySymbol + " " + row.discount}</strong>
            </div>
            <div>
              <small style={{ textDecoration: "line-through" }}>
                {currencySymbol + " " + row.originalPrice}
              </small>
            </div>
          </div>
        );
      },
      sortable: true,
      width: "90px",
    },
    {
      name: t("One stop jewelry shopping"),
      selector: (row, index) => (
        <div>
          {row.qty > 0 ? (
            <div className={classes.variable_addtocart}>
              <div className={classes.variable_number_input}>
                <button
                  onClick={() => handleDecrement(index)}
                  className={classes.variable_minus}
                  disabled={row?.defaultQty === 1}
                ></button>

                <input
                  className={classes.variable_quantity}
                  value={row?.defaultQty}
                  type="number"
                  disabled
                />

                <button
                  onClick={() => handleIncrement(index)}
                  className={classes.variable_plus}
                  disabled={row?.defaultQty == row?.qty}
                ></button>
              </div>
              <div className={classes.button_container}>
                {stockInfo(data.product) && (
                  <button
                    className={classes.variable_cart_button}
                    onClick={() => addItemToCart(row, data.product)}
                  >
                    {t("add_to_cart")}
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: "flex" }}>
              <div style={{ width: "130px" }}></div>
              <button className={classes.variable_cart_button} disabled>
                {t("out_of_stock")}
              </button>
            </div>
          )}
        </div>
      ),
      width: "250px",
    },
  ];

  if (error) return <div className="text-danger">failed to load</div>;
  if (!data) return <Spinner />;
  if (!data.product) return <div>Something Went Wrong...</div>;

  const stepUpQty = () => {
    quantityAmount.current.stepUp();
  };

  const stepDownQty = () => {
    quantityAmount.current.stepDown();
  };

  const handleIncrement = (index) => {
    setProductList((prev) => {
      const updatedCounters = [...prev];
      updatedCounters[index]["defaultQty"] =
        Number(updatedCounters[index]["defaultQty"]) + 1;
      return updatedCounters;
    });
  };

  const handleDecrement = (index) => {
    setProductList((prev) => {
      const updatedCounters = [...prev];
      updatedCounters[index]["defaultQty"] =
        Number(updatedCounters[index]["defaultQty"]) - 1;
      return updatedCounters;
    });
  };

  const simpleProductCart = (qty) => {
    const { _id, name, image, quantity, shipping, productTax, sku } =
      data.product;
    const existed = cartData.items.find((item) => item._id === _id);
    const totalQty = existed ? existed.qty + qty : qty;
    if (quantity === -1 || quantity >= totalQty) {
      const cartItem = {
        _id,
        uid: customId({ randomLength: 6 }),
        name,
        image,
        price: Number(price),
        qty,
        // quantity,
        sku,
        shipping,
        productTax,
        color: { name: null, value: null },
        attribute: { name: null, value: null, for: null },
      };
      dispatch(addToCart(cartItem));
      toast.success("Added to Cart");
    } else {
      toast.error("This item is out of stock!");
    }
  };

  const checkQty = (prevQty, currentQty, availableQty) => {
    const avQty = Number(availableQty);
    if (avQty === -1) {
      return true;
    } else {
      return prevQty + currentQty <= avQty;
    }
  };

  const customStyles = {
    rows: {
      style: {
        fontSize: "15px",
      },
    },
    headCells: {
      style: {
        fontSize: "15px",
      },
    },
  };

  const variableProductCart = (variantQty, row, variableProduct) => {
    try {
      const { sku, variantName, image, discount, qty } = row;
      const { shipping, productTax } = variableProduct;

      const existedProduct = cartData.items.find(
        (item) => item.sku === (data.product.sku || sku)
      );

      const existedQty = existedProduct ? existedProduct.qty : 0;

      const qtyAvailable = checkQty(existedQty, variantQty, qty);
      if (qtyAvailable) {
        const cartItem = {
          _id: data.product._id,
          uid: customId({ randomLength: 6 }),
          name: variantName,
          image: [image],
          price: Number(discount),
          qty: Number(variantQty),
          // quantity: Number(qty),
          sku,
          shipping,
          productTax,
        };

        dispatch(addVariableProductToCart(cartItem));
        toast.success("Added to Cart");
      } else {
        toast.error("This item is out of stock!");
      }
    } catch (err) {
      console.log(err);
      toast.error("Something Went Wrong");
    }
  };

  const addItemToCart = (row, variableProduct) => {
    const qty = Number(quantityAmount?.current?.value);
    if (data.product.type === "simple") {
      simpleProductCart(qty);
    } else if (data.product.type === "combo") {
      simpleProductCart(qty);
    } else if (data.product.type === "variable") {
      variableProductCart(row.defaultQty, row, variableProduct);
    }
  };

  const thumbs = () => {
    const thumbList = data.product.gallery.map((item, index) => (
      <ImageLoader
        key={item.name + index}
        src={item.url}
        alt={data.product.name}
        width={67}
        height={67}
        style={{ width: "100%", height: "auto" }}
      />
    ));
    return thumbList;
  };

  return (
    <div className={classes.container}>
      <div className="row">
        <div className="col-lg-6 p-0">
          <div className={classes.slider}>
            <div className={classes.image_container_main}>
              {data?.product?.type === "simple" && (
                <Carousel
                  showArrows={false}
                  showThumbs={true}
                  showIndicators={false}
                  renderThumbs={thumbs}
                  showStatus={false}
                  emulateTouch={true}
                  preventMovementUntilSwipeScrollTolerance={true}
                  swipeScrollTolerance={50}
                  selectedItem={selectedImage}
                >
                  {data.product.gallery.map((item, index) => (
                    <InnerImageZoom
                      key={item.name + index}
                      src={item.url}
                      className={classes.magnifier_container}
                      fullscreenOnMobile={true}
                    />
                  ))}
                </Carousel>
              )}

              {data?.product?.type === "variable" && (
                <Carousel
                  showArrows={false}
                  showThumbs={true}
                  showIndicators={false}
                  renderThumbs={thumbs}
                  showStatus={false}
                  emulateTouch={true}
                  preventMovementUntilSwipeScrollTolerance={true}
                  swipeScrollTolerance={50}
                  selectedItem={selectedImage}
                >
                  {data.product.gallery.map((item, index) => (
                    <InnerImageZoom
                      key={item.name + index}
                      src={bcsImage == "" ? item?.url : bcsImage}
                      className={classes.magnifier_container}
                      fullscreenOnMobile={true}
                    />
                  ))}
                </Carousel>
              )}

              {data?.product?.type === "combo" && (
                <Carousel
                  showArrows={false}
                  showThumbs={true}
                  showIndicators={false}
                  renderThumbs={thumbs}
                  showStatus={false}
                  emulateTouch={true}
                  preventMovementUntilSwipeScrollTolerance={true}
                  swipeScrollTolerance={50}
                  selectedItem={selectedImage}
                >
                  {data.product.gallery.map((item, index) => (
                    <InnerImageZoom
                      key={item.name + index}
                      src={bcsImage == "" ? item?.url : bcsImage}
                      className={classes.magnifier_container}
                      fullscreenOnMobile={true}
                    />
                  ))}
                </Carousel>
              )}
            </div>
          </div>
        </div>
        <div className="col-lg-6 p-0">
          <div className={classes.details}>
            <p className={classes.unit}>
              {data.product.unitValue} {data.product.unit}
            </p>
            <h1 className={classes.heading}>{data.product.name}</h1>
            <hr />
            {data.product.type !== "variable" && (
              <div>
                {data.product.discount < data.product.price && (
                  <p className={classes.price_ori}>
                    {settings.settingsData.currency.symbol} {data.product.price}
                  </p>
                )}
                <p className={classes.price}>
                  {settings.settingsData.currency.symbol} {price}
                </p>
              </div>
            )}
            <p className={classes.description}>
              {data.product.shortDescription}
            </p>

            {data.product.type === "variable" && (
              <p className={classes.section_heading}>
                {t("Product Variations")}
              </p>
            )}

            <div className={classes.custom}>
              {data?.product?.customfield?.map((el, ind) => (
                <strong key={ind}>{`${el.Name} : ${
                  Array.isArray(el.CustomFieldValue)
                    ? el.CustomFieldValue[0].url
                    : el.CustomFieldValue
                }`}</strong>
              ))}
            </div>

            {data.product.type === "variable" && (
              <div className={classes.container}>
                <DataTable
                  columns={columns}
                  data={productList}
                  persistTableHead
                  customStyles={customStyles}
                />
              </div>
            )}

            {data.product.type === "combo" && (
              <div className={classes.container}>
                <DataTable
                  columns={columns1}
                  data={comboProduct}
                  persistTableHead
                  customStyles={customStyles}
                />
              </div>
            )}

            <div className={classes.product_shipping}>
              <div>
                <span style={{ color: "#333" }}>
                  Free Shipping Within India. Order today on{" "}
                  <strong>{currentDate.slice(0, 6)}</strong> and you will
                  receive your package between{" "}
                  <strong>{bufferDate.slice(0, 6)}</strong> and{" "}
                  <strong>{deliveredDate.slice(0, 6)}.</strong>
                </span>
              </div>
            </div>

            {data.product.type !== "variable" && (
              <>
                {data.product.type === "simple" ? (
                  <div className={classes.cart_section}>
                    {data.product?.quantity > 0 && (
                      <div className={classes.number_input}>
                        <button
                          onClick={stepDownQty}
                          className={classes.minus}
                        ></button>
                        <input
                          className={classes.quantity}
                          ref={quantityAmount}
                          min="1"
                          max={
                            data.product.quantity === -1
                              ? 100000
                              : data.product.quantity
                          }
                          defaultValue="1"
                          type="number"
                          disabled
                        />
                        <button
                          onClick={stepUpQty}
                          className={classes.plus}
                        ></button>
                      </div>
                    )}

                    <div className={classes.button_container}>
                      {stockInfo(data.product) ? (
                        <button
                          className={classes.cart_button}
                          onClick={() => addItemToCart()}
                        >
                          {t("add_to_cart")}
                        </button>
                      ) : (
                        <button className={classes.cart_button} disabled>
                          {t("out_of_stock")}
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className={classes.cart_section}>
                    {data.product?.quantity > 0 && (
                      <div className={classes.number_input}>
                        <button
                          onClick={stepDownQty}
                          className={classes.minus}
                        ></button>
                        <input
                          className={classes.quantity}
                          ref={quantityAmount}
                          min="1"
                          max={
                            data.product.quantity === -1
                              ? 100000
                              : data.product.quantity
                          }
                          defaultValue="1"
                          type="number"
                          disabled
                        />
                        <button
                          onClick={stepUpQty}
                          className={classes.plus}
                        ></button>
                      </div>
                    )}

                    <div className={classes.button_container}>
                      {stockInfo(data.product) ? (
                        <button
                          className={classes.cart_button}
                          onClick={() => addItemToCart()}
                        >
                          {t("add_to_cart")}
                        </button>
                      ) : (
                        <button className={classes.cart_button} disabled>
                          {t("out_of_stock")}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            <div className={classes.product_Image_order}>
              {commonSettingData?.orderSvg && (
                <ImageLoader
                  src={commonSettingData.orderSvg[0]?.url}
                  alt={commonSettingData.orderSvg[0]?.altText}
                  width={40}
                  height={40}
                  style={{ width: "100%", height: "auto" }}
                />
              )}
            </div>

            <div className={classes.date_structure}>
              <div className={classes.tool_tip_info1}>
                <strong className={classes.strong_1}>{currentDate}</strong>
                <strong className={classes.onhover_span1_popup}>
                  Ordered{" "}
                </strong>
              </div>

              <div className={classes.tool_tip_info2}>
                <strong className={classes.strong_2}>
                  {buildDate}-{orderReadyDate}
                </strong>
                <strong className={classes.onhover_span2_popup}>
                  Order Ready
                </strong>
              </div>
              <div className={classes.tool_tip_info3}>
                <strong>
                  {bufferDate}-{deliveredDate}
                </strong>
                <strong className={classes.onhover_span3_popup}>
                  Delivered
                </strong>
              </div>
            </div>

            {data.product.categories.length > 0 && (
              <div className={classes.category}>
                <p className={classes.section_heading}>{t("categories")}</p>
                {data.product.categories.map((category, index) => (
                  <span key={index} className={classes.category_list}>
                    <Link href={`/gallery?category=${category}`}>
                      {category}
                    </Link>
                  </span>
                ))}
              </div>
            )}

            {data.product.subcategories.length > 0 && (
              <div className={classes.subCategory}>
                <p className={classes.section_heading}>{t("Sub Categories")}</p>

                {data.product.subcategories.map((sub, index) => (
                  <span key={index} className={classes.category_list}>
                    <Link
                      href={`/gallery?category=${sub.slug}&parent=${sub.parent}`}
                    >
                      {sub.value}
                    </Link>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
