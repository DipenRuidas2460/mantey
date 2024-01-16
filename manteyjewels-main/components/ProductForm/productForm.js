import React, { useEffect, useRef, useState } from "react";
import { Trash } from "@styled-icons/bootstrap";
import { MultiSelect } from "react-multi-select-component";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import useSWR from "swr";
import dynamic from "next/dynamic";
import { fetchData, postData, cpf } from "~/lib/clientFunctions";
import FileUpload from "../FileUpload/fileUpload";
import TextEditor from "../TextEditor";
import LoadingButton from "../Ui/Button";
import Spinner from "../Ui/Spinner";
import classes from "~/components/tableFilter/table.module.css";
import ImageLoader from "../Image";
import CustomSelect from "../CustomSelect";
import { useTranslation } from "react-i18next";
import Select from "react-select";
import FileInput from "../FormControl/FileInput";
import ProductSearch from "./productSearch";

const DataTable = dynamic(() => import("react-data-table-component"));

const ProductForm = () => {
  const url = `/api/product/create`;
  const { data, error } = useSWR(url, fetchData);
  const product_type = useRef();
  const seo_title = useRef();
  const seo_desc = useRef();
  const shipping_weight = useRef();
  const shipping_length = useRef();
  const shipping_width = useRef();
  const shipping_height = useRef();
  const hsn_num = useRef();
  const CgstIn = useRef(null);
  const SgstIn = useRef(null);
  const IgstIn = useRef(null);
  const UtgstIn = useRef(null);
  const CgstOut = useRef(null);
  const SgstOut = useRef(null);
  const IgstOut = useRef(null);
  const UtgstOut = useRef(null);
  const [selectedType, setSelectedType] = useState("");
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedSubCategory, setSelectedSubCategory] = useState([]);
  const [selectedColor, setSelectedColor] = useState([]);
  const [selectedAttr, setSelectedAttr] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [attrItemList, setAttrItemList] = useState([]);
  const [displayImage, setDisplayImage] = useState([]);
  const [galleryImage, setGalleryImage] = useState([]);
  const [seoImage, setSeoImage] = useState([]);
  const [displayVideo, setDisplayVideo] = useState([]);
  const [displayObj, setDisplayObj] = useState([]);
  const [displayFile, setDisplayFile] = useState([]);
  const [thumbText, setThumbText] = useState("");
  const [galleryText, setGalleryText] = useState([]);
  const [seoText, setSeoText] = useState("");
  const [variantInputList, setVariantInputList] = useState([]);
  const [resetImageInput, setResetImageInput] = useState("");
  const [resetVideoInput, setResetVideoInput] = useState("");
  const [resetFileInput, setResetFileInput] = useState("");
  const [resetObjInput, setResetObjInput] = useState("");
  const [editorState, setEditorState] = useState("");
  const [buttonState, setButtonState] = useState("");
  const [customFieldData, setCustomFieldData] = useState([]);
  const [selectCustomCheckBox, setSelectCustomCheckBox] = useState(false);
  const [productList, setProductList] = useState([]);
  const [permissions, setPermissions] = useState({});
  const [isChecked, setIsChecked] = useState([]);
  const { session } = useSelector((state) => state.localSession);

  useEffect(() => {
    setPermissions(cpf(session, "product"));
  }, [session]);

  const { t } = useTranslation();

  const settings = useSelector((state) => state.settings);
  const currencySymbol = settings.settingsData.currency.symbol;

  const callbackFileAlt = (payload) => {
    if (payload.FileType === "Display") {
      setThumbText(payload.FileAlt);
    }
    if (payload.FileType === "Gallery") {
      if (galleryText.length === 0) {
        setGalleryText([payload]);
      } else {
        const findTextIndex = galleryText.findIndex(
          (ind) => ind.Index === payload.Index
        );
        if (findTextIndex !== -1) {
          const updatedData = [...galleryText];
          updatedData[findTextIndex] = payload;
          setGalleryText(updatedData);
        } else {
          setGalleryText([...galleryText, payload]);
        }
      }
    }
    if (payload.FileType === "Meta") {
      setSeoText(payload.FileAlt);
    }
  };

  const callback = (payload) => {
    if (productList.length === 0) {
      setProductList([payload.item]);
    } else {
      const findTextIndex = productList.findIndex(
        (ind) => ind.productId == payload.item.productId
      );

      if (findTextIndex !== -1) {
        const updatedData = [...productList];
        updatedData[findTextIndex] = payload.item;
        setProductList(updatedData);
      } else {
        setProductList([...productList, payload.item]);
      }
    }
  };

  const selectStyles = {
    control: (provided) => ({
      ...provided,
      width: "100%",
      height: "40px",
      position: "relative",
    }), // dropdown input css
    menu: () => ({
      boxShadow: "inset 0 1px 0 rgba(0, 0, 0, 0.1)",
      position: "absolute",
      background: "#f8f8f8",
      width: "100%",
      zIndex: 99,
    }), // dropdown menu css
  };

  useEffect(() => {
    const arrList = [];
    if (selectedColor.length && attrItemList.length) {
      selectedColor.map((color) => {
        attrItemList.map((attr) => {
          const combination = {
            color: color.label,
            attr: attr.label,
            price: "",
            sku: "",
            qty: "",
            variantName: `${color.label} + ${attr.label}`,
            imageIndex: 0,
          };
          arrList.push(combination);
        });
      });
    } else if (selectedColor.length && !attrItemList.length) {
      selectedColor.map((color) => {
        const combination = {
          color: color.label,
          attr: null,
          price: "",
          sku: "",
          qty: "",
          variantName: `${color.label}`,
          imageIndex: 0,
        };
        arrList.push(combination);
      });
    } else if (!selectedColor.length && attrItemList.length) {
      attrItemList.map((attr) => {
        const combination = {
          color: null,
          attr: attr.label,
          price: "",
          sku: "",
          qty: "",
          variantName: `${attr.label}`,
          imageIndex: 0,
        };
        arrList.push(combination);
      });
    }
    setVariantInputList(arrList);
    return () => {
      setVariantInputList([]);
    };
  }, [selectedColor, attrItemList]);

  useEffect(() => {
    // Binding Custom Fields
    fetchData(`/api/customField/fetch`)
      .then((res) => {
        setCustomFieldData(res.customData);
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);

  const customStyles = {
    rows: {
      style: {
        minHeight: "62px",
        fontSize: "15px",
      },
    },
    headCells: {
      style: {
        fontSize: "15px",
      },
    },
  };

  const handleSelectCustomCheckBox = () => {
    setSelectCustomCheckBox(!selectCustomCheckBox);
  };

  const handleTagChange = (e, label, index, name) => {
    const findIndex = isChecked.findIndex(
      (i) => i.ind == index && i.label == label && i.name == name
    );
    if (findIndex != -1) {
      const updatedData = [...isChecked];
      updatedData[findIndex] = {
        val: e.target.checked,
        ind: index,
        label: label,
        name: name,
      };
      setIsChecked(updatedData);
    } else {
      setIsChecked([
        ...isChecked,
        { val: e.target.checked, ind: index, label: label, name: name },
      ]);
    }
  };

  const handleRemove = (productId) => {
    let filterProductList = productList.filter((o) => {
      return o.productId != productId;
    });
    setProductList(filterProductList);
  };

  function showHide(data) {
    if (data.HideFieldLabel === false) {
      if (data.Required === true) {
        return `${data.Name}*`;
      }
      return data.Name;
    }
    return "";
  }

  const updatedValueCb = (data) => {
    setEditorState(data);
  };

  const multiList = (item) => {
    const data = [];
    item.map((x) => data.push(x.value));
    return JSON.stringify(data);
  };

  const changeAttr = (e) => {
    setSelectedAttr(e);
    setAttrItemList([]);
  };

  const updateDisplayImage = (files) => {
    setDisplayImage(files);
  };

  const updateGalleryImage = (files) => {
    setGalleryImage(files);
  };

  const updateMetaImage = (files) => {
    setSeoImage(files);
  };

  const updateDisplayVideo = (files) => {
    setDisplayVideo(files);
  };

  const updateDisplayObj = (files) => {
    setDisplayObj(files);
  };

  const updateDisplayFile = (files) => {
    setDisplayFile(files);
  };

  const handleCustomFieldsValues = (
    event,
    fieldTypeName,
    fieldName,
    optionVal
  ) => {
    if (fieldTypeName === "Dropdown") {
      const existingControlIndex = customFieldData.findIndex(
        (item) => item._id == fieldName
      );
      if (existingControlIndex != -1) {
        const existingControl = customFieldData[existingControlIndex];
        existingControl.CustomFieldValue = event.value;
        existingControl.Optionvalue = optionVal;
        const updatedcustomField = [...customFieldData];
        updatedcustomField[existingControlIndex] = existingControl;
        setCustomFieldData(updatedcustomField);
      }
    } else {
      const existingControlIndex = customFieldData.findIndex(
        (item) => item._id == event.target.name
      );

      if (existingControlIndex != -1) {
        const existingControl = customFieldData[existingControlIndex];

        if (fieldTypeName === "Checkbox") {
          existingControl.CustomFieldValue = event.target.checked
            ? true
            : false;
        } else {
          existingControl.CustomFieldValue = event.target.value;
        }

        const updatedcustomField = [...customFieldData];
        updatedcustomField[existingControlIndex] = existingControl;
        setCustomFieldData(updatedcustomField);
      }
    }
  };

  const columns = [
    {
      name: t("Product Id"),
      selector: (row) => row.productId,
    },
    {
      name: t("name"),
      selector: (row) => row.name,
      sortable: true,
    },
    {
      name: t("image"),
      selector: (row) => (
        <ImageLoader
          src={row.image[0]?.url}
          alt={data.name}
          width={80}
          height={80}
        />
      ),
    },
    {
      name: t("Product Type"),
      selector: (row) => row.type.toUpperCase(),
      sortable: true,
    },
    {
      name: t("price"),
      selector: (row) => currencySymbol + row.price,
      sortable: true,
    },
    {
      name: t("action"),
      selector: (row) => (
        <div>
          {permissions.delete && (
            <div
              className={classes.button}
              onClick={() => handleRemove(row.productId)}
            >
              <Trash width={22} height={22} title="DELETE" />
            </div>
          )}
        </div>
      ),
    },
  ];

  const handleInputChange = (e, i) => {
    const { name, value } = e.target;
    const items = [...variantInputList];
    items[i][name] = value;
    setVariantInputList(items);
  };

  const getEditorStateData = (editorData) => {
    const regex = /(<([^>]+)>)/gi;
    const data = !!editorData.replace(regex, "").length ? editorData : "";
    return data;
  };

  const handleSelectSubCategory = (e) => {
    setSelectedSubCategory(e);
  };

  const formHandler = async (e) => {
    e.preventDefault();
    if (displayImage.length === 0) {
      return toast.warn("Please fill Display Image or check fileType!");
    }

    if (galleryImage.length === 0) {
      return toast.warn("Please fill Gallery Image or check fileType!");
    }

    if (seoImage.length === 0) {
      return toast.warn("Please fill Meta Image or check fileType!");
    }

    if (!/\.(jpe?g|png|gif|svg|webp)$/i.test(displayImage[0]?.name)) {
      return toast.warn(
        "Please Check Thumb-Nail Image type, Image is JPG, JPEG, PNG, GIF, SVG, WEBP!"
      );
    }

    if (
      !/\.(jpe?g|png|gif|svg|webp)$/i.test(
        galleryImage?.map((el) => {
          if (/\.(jpe?g|png|gif|svg|webp)$/i.test(el?.name)) {
            return el?.name;
          }
        })
      )
    ) {
      return toast.warn(
        "Please Check Gallery Image type, Image is JPG, JPEG, PNG, GIF, SVG, WEBP!"
      );
    }

    if (displayVideo.length > 0) {
      if (
        !/\.(mp4|mov|gif|wmv|flv|avi|avchd|webm|mkv)$/i.test(
          displayVideo[0]?.name
        )
      ) {
        return toast.warn(
          "Only MP4, MOV, WMV, GIF, FLV, AVI, AVCHD, WEBM and MKV Video Files are allowed!"
        );
      }
    }

    if (displayObj.length > 0) {
      if (!/\.(obj)$/i.test(displayObj[0]?.name)) {
        return toast.warn("Only OBJ object File is allowed!");
      }
    }

    if (!/\.(jpe?g|png|gif|svg|webp)$/i.test(seoImage[0]?.name)) {
      return toast.warn(
        "Please Check Meta Image type, Image is JPG, JPEG, PNG, GIF, SVG, WEBP!"
      );
    }

    setButtonState("loading");
    const form = document.querySelector("#product_form");
    const formData = new FormData(form);

    displayImage[0].altText = thumbText;

    galleryImage?.map((elem, indx) => {
      galleryText?.map((el) => {
        if (el.Index === indx) {
          elem.altText = el.FileAlt;
        }
      });
    });

    let customFielddata = customFieldData.filter(function (rowData) {
      return rowData._id !== null && rowData.CustomFieldValue !== null;
    });

    customFielddata?.map((el) => {
      if (el?.TypeName == "File") {
        el.CustomFieldValue = displayFile;
      }
    });

    const comboProductList = [];
    productList.map((el) => {
      comboProductList.push({ productId: el.productId });
    });

    const displayImg = await JSON.stringify(displayImage);
    const galleryImg = await JSON.stringify(galleryImage);
    const displayVid = await JSON.stringify(displayVideo);
    const displayObject = await JSON.stringify(displayObj);
    const customInfo = await JSON.stringify(customFielddata);

    const shipping = {
      weight: shipping_weight.current.value.trim(),
      length: shipping_length.current.value.trim(),
      width: shipping_width.current.value.trim(),
      height: shipping_height.current.value.trim(),
    };

    const seo = {
      title: seo_title.current.value.trim(),
      description: seo_desc.current.value.trim(),
      image: seoImage,
    };

    seo.image[0].altText = seoText;

    const newIsChecked = isChecked.filter((el) => el.val === true);

    const productTaxData = {
      hsn: hsn_num.current.value.trim(),
      CGSTIN: CgstIn.current.value.trim(),
      SGSTIN: SgstIn.current.value.trim(),
      IGSTIN: IgstIn.current.value.trim(),
      UTGSTIN: UtgstIn.current.value.trim(),
      CGSTOUT: CgstOut.current.value.trim(),
      SGSTOUT: SgstOut.current.value.trim(),
      IGSTOUT: IgstOut.current.value.trim(),
      UTGSTOUT: UtgstOut.current.value.trim(),
    };

    formData.append("displayImage", displayImg);
    formData.append("galleryImages", galleryImg);
    formData.append("video_val", displayVid);
    formData.append("obj_val", displayObject);
    formData.append("type", selectedType);
    formData.append("category", multiList(selectedCategory));
    formData.append("subcategory", JSON.stringify(selectedSubCategory));
    formData.append("brand", selectedBrand);
    formData.append("color", JSON.stringify(selectedColor));
    formData.append("comboProducts", JSON.stringify(comboProductList));
    formData.append("attribute", JSON.stringify(attrItemList));
    formData.append("tag", JSON.stringify(newIsChecked));
    formData.append("selectedAttribute", selectedAttr);
    formData.append("variant", JSON.stringify(variantInputList));
    formData.append("shipping", JSON.stringify(shipping));
    formData.append("seo", JSON.stringify(seo));
    formData.append("customfield", customInfo);
    formData.append("productTax", JSON.stringify(productTaxData))
    formData.append("description", getEditorStateData(editorState));

    await postData("/api/product/create", formData)
      .then((status) => {
        status.success
          ? (toast.success("Product Added Successfully"),
            form.reset(),
            setSelectedCategory([]),
            setSelectedSubCategory([]),
            setVariantInputList([]),
            setSelectedType(""),
            setSelectedColor([]),
            setProductList([]),
            setSelectedAttr([]),
            setIsChecked([]),
            setResetImageInput("reset"),
            setResetVideoInput("reset"),
            setResetObjInput("reset"),
            setResetFileInput("reset"),
            setEditorState(""))
          : toast.error("Something Went Wrong");
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something Went Wrong");
      });
    setButtonState("");
  };

  if (error) return <div>failed to load</div>;
  if (!data) return <Spinner />;
  if (!data.success) return <div>Something Went Wrong...</div>;

  const categoryOption = [];
  data.category.map((el) =>
    categoryOption.push({ label: el.name, value: el.slug })
  );

  const subcategoryOption = [];
  if (selectedCategory.length > 0) {
    selectedCategory.map((o) => {
      data.category.map((el) => {
        if (o.value === el.slug) {
          el.subCategories.map((sub) =>
            subcategoryOption.push({
              label: sub.subCategory.name,
              value: sub.subCategory.name,
              parent: el.slug,
              slug: sub.slug,
            })
          );
        }
      });
    });
  }

  const colorOption = [];
  data.color.map((color) =>
    colorOption.push({ label: color.name, value: color.value })
  );

  const productOption = [];
  data.products.map((pro) =>
    productOption.push({ label: pro.name, value: pro.slug })
  );

  const attrItemOption = (index) => {
    const item = [];
    data.attribute[index].values.map((attr) =>
      item.push({
        label: attr.name,
        value: attr.name,
        for: data.attribute[index].name,
      })
    );
    return item;
  };

  function updateBrand(e) {
    setSelectedBrand(e.target.value);
  }

  return (
    <>
      <h4 className="text-center pt-3 pb-5">{t("Create New Product")}</h4>
      <form
        id="product_form"
        encType="multipart/form-data"
        onSubmit={formHandler}
      >
        {imageInput()}
        {productInformation()}
        {productTax()}
        {productDescription()}
        {productType()}
        {productTypeInput()}
        {shippingInput()}
        {seoInput()}
        {customFields()}
        <div className="my-4">
          <LoadingButton
            type="submit"
            text={t("Add Product")}
            state={buttonState}
          />
        </div>
      </form>
    </>
  );

  function productDescription() {
    return (
      <div className="card mb-5 border-0 shadow">
        <div className="card-header bg-white py-3 fw-bold">
          {t("Product Description")}
        </div>
        <div className="card-body">
          <div className="py-3">
            <label htmlFor="inp-7" className="form-label">
              {t("Short Description")}*
            </label>
            <textarea
              id="inp-7"
              className="form-control"
              name="short_description"
            />
          </div>
          <div className="py-3">
            <label className="form-label">{t("description")}</label>
            <TextEditor
              previousValue={editorState}
              updatedValue={updatedValueCb}
              height={300}
            />
          </div>
        </div>
      </div>
    );
  }

  function productTypeInput() {
    return (
      <div>
        {selectedType === "simple" && (
          <div className="card mb-5 border-0 shadow">
            <div className="card-header bg-white py-3 fw-bold">
              {t("Product Information")}
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-12">
                  <div className="py-3">
                    <label htmlFor="inp-6" className="form-label">
                      {t("Item Quantity")}*({t("Set -1 to make it unlimited")})
                    </label>
                    <input
                      type="number"
                      min="-1"
                      id="inp-6"
                      className="form-control"
                      name="qty"
                      defaultValue={1}
                      required
                      onWheel={(e) => e.target.blur()}
                    />
                  </div>
                </div>
                <div className="col-12">
                  <div className="py-3">
                    <label className="form-label">{t("sku")}*</label>
                    <input
                      type="text"
                      className="form-control"
                      name="sku"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {selectedType === "variable" && (
          <div className="card mb-5 border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              {t("Product Variation")}
            </div>
            <div className="card-body">
              <div className="row py-3">
                <label className="form-label">{t("Colors")}</label>
                <MultiSelect
                  options={colorOption}
                  onChange={(e) => {
                    setSelectedColor(e);
                  }}
                  value={selectedColor}
                  labelledBy="Select Color"
                />
              </div>
              <div className="py-3">
                <label className="form-label">{t("Attributes")}</label>
                <select
                  className="form-control"
                  defaultValue=""
                  onChange={(evt) => changeAttr(evt.target.value)}
                >
                  <option value="" disabled>
                    {t("Select Attribute")}
                  </option>
                  {data.attribute.map((attr, idx) => (
                    <option value={idx} key={idx}>
                      {attr.name}
                    </option>
                  ))}
                </select>
              </div>
              {selectedAttr.length > 0 && (
                <div className="row py-3">
                  <label className="form-label">
                    {data.attribute[selectedAttr].name}
                  </label>
                  <MultiSelect
                    options={attrItemOption(selectedAttr)}
                    onChange={(e) => {
                      setAttrItemList(e);
                    }}
                    value={attrItemList}
                    labelledBy="Select Item"
                  />
                </div>
              )}
              {variantInputList.length > 0 &&
                variantInputList.map((variant, index) => {
                  return (
                    <div key={index}>
                      <hr />
                      <h6>
                        {t("Variant")}:{" "}
                        {`${variant.color ? variant.color : ""} ${
                          variant.color && variant.attr ? "+" : ""
                        } ${variant.attr ? variant.attr : ""}`}
                      </h6>
                      <div className="row">
                        <div className="col-12 col-md-2">
                          <div className="py-3">
                            <label className="form-label">
                              {t("Variant Name")}*
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="variantName"
                              required
                              value={variant.variantName || ""}
                              onChange={(evt) => handleInputChange(evt, index)}
                              onWheel={(e) => e.target.blur()}
                            />
                          </div>
                        </div>
                        <div className="col-12 col-md-2">
                          <div className="py-3">
                            <label className="form-label">
                              {t("Additional Price")}*
                            </label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              className="form-control"
                              name="price"
                              required
                              value={variant.price || ""}
                              onChange={(evt) => handleInputChange(evt, index)}
                              onWheel={(e) => e.target.blur()}
                            />
                            <div className="small text-primary">
                              {t("Set 0 to make it free")}
                            </div>
                          </div>
                        </div>
                        <div className="col-12 col-md-2">
                          <div className="py-3">
                            <label className="form-label">{t("sku")}*</label>
                            <input
                              type="text"
                              className="form-control"
                              name="sku"
                              required
                              value={variant.sku || ""}
                              onChange={(evt) => handleInputChange(evt, index)}
                            />
                          </div>
                        </div>
                        <div className="col-12 col-md-3">
                          <div className="py-3">
                            <label className="form-label">
                              {t("Item Quantity")}*
                            </label>
                            <input
                              type="number"
                              min="-1"
                              className="form-control"
                              name="qty"
                              required
                              value={variant.qty || ""}
                              onChange={(evt) => handleInputChange(evt, index)}
                              onWheel={(e) => e.target.blur()}
                            />
                            <div className="small text-primary">
                              {t("Set -1 to make it unlimited")}
                            </div>
                          </div>
                        </div>
                        <div className="col-12 col-md-3">
                          <div className="py-3">
                            <CustomSelect
                              list={galleryImage || []}
                              dataChange={handleInputChange}
                              rootIndex={index}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {selectedType === "combo" && (
          <div className="card mb-5 border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              {t("Combo Products List")}
            </div>
            <div className="card-body">
              <div className="row py-3">
                <label className="form-label">{t("Products List")}</label>
                <div className="row">
                  <div className="col-12">
                    <div className="py-3">
                      <label htmlFor="inp-16" className="form-label">
                        {t("Item Quantity")}*({t("Set -1 to make it unlimited")}
                        )
                      </label>
                      <input
                        type="number"
                        min="-1"
                        id="inp-16"
                        className="form-control"
                        name="qty"
                        defaultValue={1}
                        required
                        onWheel={(e) => e.target.blur()}
                      />
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="py-3">
                      <label className="form-label">{t("sku")}*</label>
                      <input
                        type="text"
                        className="form-control"
                        name="sku"
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="p-2 col-md-12">
                  <ProductSearch callback={callback} />
                </div>

                <div className={classes.container}>
                  <DataTable
                    columns={columns}
                    data={productList}
                    persistTableHead
                    customStyles={customStyles}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  function productType() {
    return (
      <div className="card mb-5 border-0 shadow">
        <div className="card-header bg-white py-3 fw-bold">
          {t("Product Type")}
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-2">
              <div className="py-3">
                <label htmlFor="inp-110" className="form-label">
                  {t("new_product")}
                </label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="inp-110"
                    name="new_product"
                  />
                  <label className="form-check-label" htmlFor="inp-110">
                    {t("Status")}
                  </label>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="py-3">
                <label htmlFor="inp-11" className="form-label">
                  {t("trending_product")}
                </label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="inp-11"
                    name="trending"
                  />
                  <label className="form-check-label" htmlFor="inp-11">
                    {t("Status")}
                  </label>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="py-3">
                <label htmlFor="inp-111" className="form-label">
                  {t("best_selling_product")}
                </label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="inp-111"
                    name="best_selling"
                  />
                  <label className="form-check-label" htmlFor="inp-111">
                    {t("Status")}
                  </label>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="py-3">
                <label htmlFor="inp-112" className="form-label">
                  {t("featured_product")}
                </label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="inp-112"
                    name="featured_product"
                  />
                  <label className="form-check-label" htmlFor="inp-112">
                    {t("Status")}
                  </label>
                </div>
              </div>
            </div>
            <div className="col-md-2">
              <div className="py-3">
                <label htmlFor="inp-113" className="form-label">
                  {t("clearence_product")}
                </label>
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="inp-113"
                    name="clearence_product"
                  />
                  <label className="form-check-label" htmlFor="inp-113">
                    {t("Status")}
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className="col-12">
            <div className="py-3">
              <label htmlFor="inp-type" className="form-label">
                {t("Product Type")}*
              </label>
              <select
                id="inp-type"
                ref={product_type}
                className="form-control"
                required
                onChange={() => setSelectedType(product_type.current.value)}
                defaultValue=""
              >
                <option value="" disabled>
                  {t("Select Product Type")}
                </option>
                <option value="simple">Simple Product</option>
                <option value="variable">Variable Product</option>
                <option value="combo">Combo Products</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function productInformation() {
    return (
      <div className="card mb-5 border-0 shadow">
        <div className="card-header bg-white py-3 fw-bold">
          {t("Product Description")}
        </div>
        <div className="card-body">
          <div className="py-3">
            <label htmlFor="inp-1" className="form-label">
              {t("name")}*
            </label>
            <input
              type="text"
              id="inp-1"
              className="form-control"
              name="name"
              required
            />
          </div>
          <div className="row">
            <div className="col-12 col-sm-6">
              <div className="py-3">
                <label htmlFor="inp-2" className="form-label">
                  {t("Unit")}*
                </label>
                <input
                  type="text"
                  id="inp-2"
                  className="form-control"
                  name="unit"
                  required
                />
              </div>
            </div>
            <div className="col-12 col-sm-6">
              <div className="py-3">
                <label htmlFor="inp-3" className="form-label">
                  {t("Unit Value")}*
                </label>
                <input
                  type="text"
                  id="inp-3"
                  className="form-control"
                  name="unit_val"
                  required
                />
              </div>
            </div>
            <div className="col-12 col-sm-6">
              <div className="py-3">
                <label htmlFor="inp-4" className="form-label">
                  {t("price")}*
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="inp-4"
                  className="form-control"
                  name="main_price"
                  required
                  onWheel={(e) => e.target.blur()}
                />
              </div>
            </div>
            <div className="col-12 col-sm-6">
              <div className="py-3">
                <label htmlFor="inp-5" className="form-label">
                  {t("Discount in Percentage")}*
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  id="inp-5"
                  placeholder="0%"
                  className="form-control"
                  name="sale_price"
                  required
                  onWheel={(e) => e.target.blur()}
                />
              </div>
            </div>
            <div className="col-12 col-sm-6">
              <div className="py-3">
                <label className="form-label">{t("categories")}*</label>
                <MultiSelect
                  options={categoryOption}
                  onChange={setSelectedCategory}
                  value={selectedCategory}
                  labelledBy="Select"
                />
              </div>
            </div>
            <div className="col-12 col-sm-6">
              <div className="py-3">
                <label className="form-label">{t("Subcategories")}</label>
                <MultiSelect
                  options={subcategoryOption}
                  onChange={(e) => handleSelectSubCategory(e)}
                  value={selectedSubCategory}
                  labelledBy="Select"
                />
              </div>
            </div>
            <div className="py-3">
              <label className="form-label">{t("Brands")}</label>
              <select className="form-control" onChange={updateBrand}>
                <option value="">None</option>
                {data.brand &&
                  data.brand.map((x) => (
                    <option value={x.slug} key={x._id}>
                      {x.name}
                    </option>
                  ))}
              </select>
            </div>

            <div className="py-3">
              <label className="form-label fw-bold">{t("Tags")}</label>
              {data.tag &&
                data.tag.map((x, ind) => (
                  <div key={ind}>
                    <label className="p-3">{x.name}* :</label>
                    {x.values.map((o, index) => (
                      <div className="form-check form-check-inline" key={index}>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          name={o.name}
                          id={`check${index}`}
                          onChange={(e) =>
                            handleTagChange(e, x.name, index, o.name)
                          }
                        />

                        <label
                          className="form-check-label"
                          htmlFor={`check${index}`}
                        >
                          {o.name}
                        </label>
                      </div>
                    ))}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function productTax() {
    return (
      <div className="card mb-5 border-0 shadow">
        <div className="card-header bg-white py-3 fw-bold">
          {t("Product Tax")}
        </div>
        <div className="card-body">
          <div className="row">
            <label className="col-form-label col-md-2 form-label mb-3">
              {t("HSN CODE* :")}
            </label>
            <div className="col-md-3">
              <input
                type="number"
                className="form-control"
                ref={hsn_num}
                placeholder="Enter HSN Number Here"
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div className="col-form-label col-md-5 form-label mb-3">
              <label className="form-label fw-bold">{t("IN STATE:")}</label>
              <div>
                <div className="row">
                  <label className="col-form-label col-md-6 form-label mb-3">
                    CGST-IN(%)*:
                  </label>
                  <div className="col-md-6">
                    <input
                      type="number"
                      className="form-control"
                      step="0.1"
                      min="0"
                      max="100"
                      ref={CgstIn}
                      placeholder="0"
                      onWheel={(e) => e.target.blur()}
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <label className="col-form-label col-md-6 form-label mb-3">
                    SGST-IN(%)*:
                  </label>
                  <div className="col-md-6">
                    <input
                      type="number"
                      className="form-control"
                      step="0.1"
                      min="0"
                      max="100"
                      ref={SgstIn}
                      placeholder="0"
                      onWheel={(e) => e.target.blur()}
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <label className="col-form-label col-md-6 form-label mb-3">
                    IGST-IN(%)*:
                  </label>
                  <div className="col-md-6">
                    <input
                      type="number"
                      className="form-control"
                      step="0.1"
                      min="0"
                      max="100"
                      ref={IgstIn}
                      placeholder="0"
                      onWheel={(e) => e.target.blur()}
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <label className="col-form-label col-md-6 form-label mb-3">
                    UTGST-IN(%)*:
                  </label>
                  <div className="col-md-6">
                    <input
                      type="number"
                      className="form-control"
                      step="0.1"
                      min="0"
                      max="100"
                      ref={UtgstIn}
                      placeholder="0"
                      onWheel={(e) => e.target.blur()}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-form-label col-md-5 form-label mb-3 mr-3">
              <label className="form-label fw-bold">{t("OUT STATE:")}</label>
              <div>
                <div className="row">
                  <label className="col-form-label col-md-6 form-label mb-3">
                    CGST-OUT(%)*:
                  </label>
                  <div className="col-md-6">
                    <input
                      type="number"
                      className="form-control"
                      step="0.1"
                      min="0"
                      max="100"
                      ref={CgstOut}
                      placeholder="0"
                      onWheel={(e) => e.target.blur()}
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <label className="col-form-label col-md-6 form-label mb-3">
                    SGST-OUT(%)*:
                  </label>
                  <div className="col-md-6">
                    <input
                      type="number"
                      className="form-control"
                      step="0.1"
                      min="0"
                      max="100"
                      ref={SgstOut}
                      placeholder="0"
                      onWheel={(e) => e.target.blur()}
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <label className="col-form-label col-md-6 form-label mb-3">
                    IGST-OUT(%)*:
                  </label>
                  <div className="col-md-6">
                    <input
                      type="number"
                      className="form-control"
                      step="0.1"
                      min="0"
                      max="100"
                      ref={IgstOut}
                      placeholder="0"
                      onWheel={(e) => e.target.blur()}
                      required
                    />
                  </div>
                </div>
                <div className="row">
                  <label className="col-form-label col-md-6 form-label mb-3">
                    UTGST-OUT(%)*:
                  </label>
                  <div className="col-md-6">
                    <input
                      type="number"
                      className="form-control"
                      step="0.1"
                      min="0"
                      max="100"
                      ref={UtgstOut}
                      placeholder="0"
                      onWheel={(e) => e.target.blur()}
                      required
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function imageInput() {
    return (
      <div className="card mb-5 border-0 shadow">
        <div className="card-header bg-white py-3 fw-bold">
          {t("Product Image")}
        </div>
        <div className="card-body">
          <FileUpload
            accept=".jpg,.png,.jpeg,.gif,.svg,.webp"
            label={t("Thumbnail Image* (300px x 300px)")}
            maxFileSizeInBytes={2000000}
            updateFilesCb={updateDisplayImage}
            resetCb={resetImageInput}
            filetype={"Display"}
            callback={callbackFileAlt}
          />

          <FileUpload
            accept=".jpg,.png,.jpeg,.gif,.svg,.webp"
            label={t("Gallery Images* (500px x 500px)")}
            multiple
            maxFileSizeInBytes={2000000}
            updateFilesCb={updateGalleryImage}
            resetCb={resetImageInput}
            filetype={"Gallery"}
            callback={callbackFileAlt}
          />

          <FileUpload
            accept=".mp4,.mov,.wmv,.gif,.flv,.avi,.avchd,.webm,.mkv"
            label={t("Video")}
            maxFileSizeInBytes={200000000}
            updateFilesCb={updateDisplayVideo}
            resetCb={resetVideoInput}
          />

          <FileUpload
            accept=".obj"
            label={t("Object File")}
            maxFileSizeInBytes={200000000}
            updateFilesCb={updateDisplayObj}
            resetCb={resetObjInput}
          />
        </div>
      </div>
    );
  }

  function shippingInput() {
    return (
      <div className="card mb-5 border-0 shadow">
        <div className="card-header bg-white py-3 fw-bold">
          {t("Shipping Details")}
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-12 col-sm-6">
              <div className="py-3">
                <label htmlFor="inp-4" className="form-label">
                  {t("Weight")}*
                </label>
                <input
                  type="number"
                  step="0.01"
                  id="inp-4"
                  ref={shipping_weight}
                  className="form-control"
                  name="weight_val"
                  placeholder="Enter Weight in Kg"
                  required
                />
              </div>
            </div>
            <div className="col-12 col-sm-6">
              <div className="py-3">
                <label htmlFor="inp-5" className="form-label">
                  {t("Length")}*
                </label>
                <input
                  type="number"
                  step="0.1"
                  id="inp-5"
                  ref={shipping_length}
                  className="form-control"
                  name="length_val"
                  placeholder="Enter Length in Cm"
                  required
                />
              </div>
            </div>
            <div className="col-12 col-sm-6">
              <div className="py-3">
                <label htmlFor="inp-3" className="form-label">
                  {t("Width")}*
                </label>
                <input
                  type="number"
                  id="inp-3"
                  step="0.1"
                  ref={shipping_width}
                  className="form-control"
                  name="width_val"
                  placeholder="Enter Width in Cm"
                  required
                />
              </div>
            </div>
            <div className="col-12 col-sm-6">
              <div className="py-3">
                <label htmlFor="inp-2" className="form-label">
                  {t("Height")}*
                </label>
                <input
                  type="number"
                  id="inp-2"
                  step="0.1"
                  ref={shipping_height}
                  className="form-control"
                  name="height"
                  placeholder="Enter Height in Cm"
                  required
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  function seoInput() {
    return (
      <div className="card mb-5 border-0 shadow">
        <div className="card-header bg-white py-3 fw-bold">
          {t("SEO Meta Tags")}
        </div>
        <div className="card-body">
          <div className="py-3">
            <label htmlFor="inp-122" className="form-label">
              {t("Meta Title")}
            </label>
            <input
              type="text"
              ref={seo_title}
              id="inp-122"
              className="form-control"
            />
          </div>
          <div className="py-3">
            <label htmlFor="inp-222" className="form-label">
              {t("Meta Description")}
            </label>
            <textarea ref={seo_desc} id="inp-222" className="form-control" />
          </div>
          <FileUpload
            accept=".jpg,.png,.jpeg,.gif,.svg,.webp"
            label={t("Meta Image*")}
            maxFileSizeInBytes={2000000}
            updateFilesCb={updateMetaImage}
            resetCb={resetImageInput}
            filetype={"Meta"}
            callback={callbackFileAlt}
          />
        </div>
      </div>
    );
  }

  function customFields() {
    return (
      <div className="card mb-5 border-0 shadow">
        <div className="card-header bg-white py-3 fw-bold">
          {t("Custom Fields")}
        </div>
        <div className="card-body">
          {customFieldData?.map((data, index) => (
            <div className="row" key={index}>
              <label className="col-form-label col-md-2 form-label mb-3">
                {showHide(data)}
              </label>
              <div className="col-md-4">
                {data.TypeName === "Text" ? (
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Text Here"
                    onChange={(event) => {
                      handleCustomFieldsValues(event, data.TypeName, data.Name);
                    }}
                    id={data.TypeName}
                    name={data._id}
                    defaultValue={""}
                    required={data.Required}
                  />
                ) : data.TypeName === "Textarea" ? (
                  <textarea
                    className="form-control mb-2"
                    placeholder="Enter Para Here"
                    onChange={(event) => {
                      handleCustomFieldsValues(event, data.TypeName, data.Name);
                    }}
                    id={data.TypeName}
                    name={data._id}
                    required={data.Required}
                  />
                ) : data.TypeName === "E-mail" ? (
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter E-mail"
                    onChange={(event) => {
                      handleCustomFieldsValues(event, data.TypeName, data.Name);
                    }}
                    id={data.TypeName}
                    name={data._id}
                    required={data.Required}
                  />
                ) : data.TypeName === "Dropdown" ? (
                  <Select
                    onChange={(event) => {
                      handleCustomFieldsValues(
                        event,
                        data.TypeName,
                        data._id,
                        data.Optionvalue
                      );
                    }}
                    options={data?.Optionvalue.map((option) => ({
                      label: option,
                      value: option,
                    }))}
                    placeholder="Select"
                    styles={selectStyles}
                    id={data.TypeName}
                    name={data._id}
                    required={data.Required}
                  />
                ) : data.TypeName === "Checkbox" ? (
                  <input
                    className="form-check-input form-control"
                    style={{
                      width: "1.5em",
                      height: "1.5em",
                    }}
                    type="checkbox"
                    id={data.TypeName}
                    name={data._id}
                    onChange={(event) => {
                      handleCustomFieldsValues(event, data.TypeName, data.Name);
                    }}
                    onInput={handleSelectCustomCheckBox}
                  />
                ) : data.TypeName === "Website" ? (
                  <input
                    type="text"
                    className="form-control mt-2"
                    placeholder="Enter Website Name"
                    onChange={(event) => {
                      handleCustomFieldsValues(event, data.TypeName, data.Name);
                    }}
                    id={data.TypeName}
                    name={data._id}
                    defaultValue={""}
                    required={data.Required}
                  />
                ) : data.TypeName === "Phone Number" ? (
                  <input
                    type="tel"
                    className="form-control"
                    placeholder="Enter Phone Number"
                    id={data.TypeName}
                    name={data._id}
                    onChange={(event) => {
                      handleCustomFieldsValues(event, data.TypeName, data.Name);
                    }}
                    defaultValue={""}
                    required={data.Required}
                  />
                ) : data.TypeName === "Date" ? (
                  <input
                    className="form-control"
                    type="date"
                    id={data.TypeName}
                    name={data._id}
                    onChange={(event) => {
                      handleCustomFieldsValues(event, data.TypeName, data.Name);
                    }}
                    defaultValue={""}
                    required={data.Required}
                  />
                ) : data?.TypeName === "File" ? (
                  <FileInput
                    accept="*"
                    maxFileSizeInBytes={2000000}
                    handleChange={(event) => {
                      handleCustomFieldsValues(
                        event,
                        data?.TypeName,
                        data?.Name
                      );
                    }}
                    id={data?.TypeName}
                    name={data?._id}
                    updateFilesCb={updateDisplayFile}
                    resetCb={resetFileInput}
                    req={data}
                  />
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
};

export default ProductForm;
