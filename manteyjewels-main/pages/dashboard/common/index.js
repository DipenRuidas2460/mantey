import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import useSWR from "swr";
import { cpf, fetchData, postData } from "~/lib/clientFunctions";

const Spinner = dynamic(() => import("~/components/Ui/Spinner"));
const LoadingButton = dynamic(() => import("~/components/Ui/Button"));
const FileUpload = dynamic(() => import("~/components/FileUpload/fileUpload"));

const CommonSetting = () => {
  const url = `/api/common`;
  const { data, error } = useSWR(url, fetchData);
  const [settings, setSettings] = useState("");
  const [sizeChartImage, setSizeChartImage] = useState([]);
  const [shopDefaultImage, setShopDefaultImage] = useState([]);
  const [orderImage, setOrderImage] = useState([]);
  const [buttonState, setButtonState] = useState("");
  const [sizeAltText, setSizeAltText] = useState("");
  const [orderAltText, setOrderAltText] = useState("");
  const [shopDefaultAltText, setShopDefaultAltText] = useState("");
  const { t } = useTranslation();


//  console.log(sizeChartImage, "sizeChartImage"|| shopDefaultImage, "shopDefaultImage" || data, "data")

  useEffect(() => {
    if (data && data.commonSettings) {
      setSettings(data.commonSettings);
      setSizeChartImage(data.commonSettings.sizeChart);
      setOrderImage(data.commonSettings.orderSvg);
      setShopDefaultImage(data.commonSettings.shopDefault);
      if(data.commonSettings.sizeChart){
        setSizeAltText(data.commonSettings.sizeChart[0]?.altText);
      }
      if (data.commonSettings.shopDefault) {
        setShopDefaultAltText(data.commonSettings.shopDefault[0]?.altText);
      }
      if (data.commonSettings.orderSvg) {
        setOrderAltText(data.commonSettings.orderSvg[0]?.altText);
      }
    }
  }, [data]);

  const { session } = useSelector((state) => state.localSession);
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    setPermissions(cpf(session, "common"));
  }, [session]);

  const ruleSettingOrdered = useRef();
  const ruleSettingDelivered = useRef();
  const shippingReturnTexture = useRef();
  const careInstructionTexture = useRef();
  const minPrice = useRef();
  const maxPrice = useRef();

  const callbackFileAlt = (payload) => {
    if (payload.FileType === "sizeChart") {
      setSizeAltText(payload.FileAlt);
    }
    if (payload.FileType === "shopDefault") {
      setShopDefaultAltText(payload.FileAlt);
    }
    if (payload.FileType === "orderSvg") {
      setOrderAltText(payload.FileAlt);
    }
  };

  const handleForm = async (e) => {
    e.preventDefault();
    setButtonState("loading");
    try {
      if (sizeChartImage.length > 0) {
        sizeChartImage[0].altText = sizeAltText;
      }
      if (shopDefaultImage.length > 0) {
        shopDefaultImage[0].altText = shopDefaultAltText;
      }

      if (orderImage.length > 0) {
        orderImage[0].altText = orderAltText;
      }
      const data = {
        ruleSettingOrdered: ruleSettingOrdered.current.value.trim(),
        ruleSettingDelivered: ruleSettingDelivered.current.value.trim(),
        shippingReturnTexture: shippingReturnTexture.current.value.trim(),
        careInstructionTexture: careInstructionTexture.current.value.trim(),
        sizeChart: JSON.stringify(sizeChartImage),
        orderSvg: JSON.stringify(orderImage),
        shopDefault: JSON.stringify(shopDefaultImage),
        minPrice: minPrice.current.value.trim(),
        maxPrice: maxPrice.current.value.trim(),
      };
      const formData = new FormData();
      for (const key in data) {
        formData.append(key, data[key]);
      }

      const response = await postData(`/api/common`, formData);
      response.success
        ? toast.success("Common Settings Updated Successfully")
        : toast.error(`Something Went Wrong (500)`);
    } catch (err) {
      toast.error(`Something Went Wrong (${err.message})`);
    }
    setButtonState("");
  };

  return (
    <>
      {error ? (
        <div className="text-center text-danger">failed to load</div>
      ) : !settings._id ? (
        <Spinner />
      ) : (
        <form onSubmit={handleForm}>
          <div className="card mb-5 border-0 shadow">
            <div className="card-header bg-white py-3 fw-bold">
              {t("Common Settings")}
            </div>
            <div className="card-body">
              <div className="py-3">
                <label htmlFor="inp-1" className="form-label">
                  {t("Rule Order Setting")}
                </label>
                <input
                  type="text"
                  ref={ruleSettingOrdered}
                  id="inp-1"
                  placeholder="Enter Number"
                  defaultValue={settings?.ruleSettingOrdered}
                  className="form-control"
                />
              </div>
              <div className="py-3">
                <label htmlFor="inp-2" className="form-label">
                  {t("Rule Delivered Setting")}
                </label>
                <input
                  type="text"
                  ref={ruleSettingDelivered}
                  id="inp-2"
                  placeholder="Enter Number"
                  defaultValue={settings?.ruleSettingDelivered}
                  className="form-control"
                />
              </div>
              <div className="py-3">
                <label htmlFor="inp-3" className="form-label">
                  {t("Shipping & Return Texture")}
                </label>
                <textarea
                  ref={shippingReturnTexture}
                  id="inp-3"
                  defaultValue={settings?.shippingReturnTexture}
                  className="form-control"
                />
              </div>
              <div className="py-3">
                <label htmlFor="inp-4" className="form-label">
                  {t("Care Instruction Texture")}
                </label>
                <textarea
                  ref={careInstructionTexture}
                  id="inp-4"
                  defaultValue={settings?.careInstructionTexture}
                  className="form-control"
                />
              </div>
              <FileUpload
                accept=".jpg,.png,.jpeg,.gif,.svg,.webp"
                label={t("Order Image")}
                maxFileSizeInBytes={2000000}
                updateFilesCb={setOrderImage}
                filetype={"orderSvg"}
                callback={callbackFileAlt}
                preSelectedFiles={orderImage}
              />
              <FileUpload
                accept=".jpg,.png,.jpeg,.gif,.svg,.webp"
                label={t("Size Chart Image")}
                maxFileSizeInBytes={2000000}
                updateFilesCb={setSizeChartImage}
                filetype={"sizeChart"}
                callback={callbackFileAlt}
                preSelectedFiles={sizeChartImage}
              />
              <FileUpload
                accept=".jpg,.png,.jpeg,.gif,.svg,.webp"
                label={t("Shop Default Image")}
                maxFileSizeInBytes={2000000}
                updateFilesCb={setShopDefaultImage}
                filetype={"shopDefault"}
                callback={callbackFileAlt}
                preSelectedFiles={shopDefaultImage}
              />

              <div className="card-header bg-white py-3 fw-bold">
                {t("Filter Options")}
              </div>

              <div style={{ display: "flex" }}>
                <div className="row g-3 align-items-center mt-2">
                  <div className="col-auto">
                    <label htmlFor="inp-125" className="col-form-label">
                      {t("Min Price:")}
                    </label>
                  </div>
                  <div className="col-auto">
                    <input
                      type="text"
                      ref={minPrice}
                      id="inp-125"
                      placeholder="Enter Number"
                      defaultValue={settings?.minPrice}
                      className="form-control"
                    />
                  </div>
                </div>

                <div
                  className="row g-3 align-items-center mt-2"
                  style={{ marginLeft: "10%" }}
                >
                  <div className="col-auto">
                    <label htmlFor="inp-126" className="col-form-label">
                      {t("Max Price:")}
                    </label>
                  </div>
                  <div className="col-auto">
                    <input
                      type="text"
                      ref={maxPrice}
                      id="inp-126"
                      placeholder="Enter Number"
                      defaultValue={settings?.maxPrice}
                      className="form-control"
                    />
                  </div>
                </div>
              </div>

              {permissions.edit && (
                <div className="py-3">
                  <LoadingButton
                    type="submit"
                    text={t("UPDATE")}
                    state={buttonState}
                  />
                </div>
              )}
            </div>
          </div>
        </form>
      )}
    </>
  );
};

CommonSetting.requireAuthAdmin = true;
CommonSetting.dashboard = true;

export default CommonSetting;
