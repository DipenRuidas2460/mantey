import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import useSWR from "swr";
import { fetchData, postData } from "~/lib/clientFunctions";
import LoadingButton from "../../components/Ui/Button";
import Spinner from "../../components/Ui/Spinner";
import countryData from "../../data.json";
import classes from "~/components/Checkout/checkout.module.css";
import { useTranslation } from "react-i18next";

const ManageProfile = (props) => {
  const cartData = useSelector((state) => state.cart);
  const url = `/api/profile?id=${props.id}`;
  const { data, error, mutate } = useSWR(props.id ? url : null, fetchData);
  const [userData, setUserData] = useState([]);
  const [loading, setLoading] = useState("");
  const [country1, setCountry1] = useState("");
  const [country2, setCountry2] = useState("");
  const [tick, setTick] = useState(false);
  const { t } = useTranslation();
  const [billingInfo, setBillingInfo] = useState({
    fullName: "",
    billingEmail: "",
    phone: "",
    house: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });
  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    shippingEmail: "",
    phone: "",
    house: "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  });

  useEffect(() => {
    if (data && data.user) {
      setUserData(data.user);
      setTick(data.user?.addressCheck);
    }
  }, [data]);

  const name = useRef();
  const phone = useRef();
  const email = useRef();
  const house = useRef();
  const city = useRef();
  const state = useRef();
  const zip = useRef();
  const country = useRef();
  const fullName1 = useRef();
  const Email1 = useRef();
  const phone1 = useRef();
  const house1 = useRef();
  const city1 = useRef();
  const state1 = useRef();
  const zip1 = useRef();
  const fullName2 = useRef();
  const Email2 = useRef();
  const phone2 = useRef();
  const house2 = useRef();
  const city2 = useRef();
  const state2 = useRef();
  const zip2 = useRef();

  const handleBillingInfo = (e) => {
    e.preventDefault();
    const billingAddressValue = {
      fullName: fullName1.current.value,
      billingEmail: Email1.current.value,
      phone: phone1.current.value,
      house: house1.current.value,
      city: city1.current.value,
      state: state1.current.value,
      zipCode: zip1.current.value,
      country: country1,
    };
    setBillingInfo(billingAddressValue);
  };

  const handleShippingInfo = (e) => {
    e.preventDefault();
    const shippingAddressValue = {
      fullName: fullName2.current.value,
      shippingEmail: Email2.current.value,
      phone: phone2.current.value,
      house: house2.current.value,
      city: city2.current.value,
      state: state2.current.value,
      zipCode: zip2.current.value,
      country: country2,
    };
    setShippingInfo(shippingAddressValue);
  };

  const billingCountry = (e) => {
    setCountry1(e.target.value);
  };

  const shippingCountry = (e) => {
    setCountry2(e.target.value);
  };

  const sameBillingAsShipping = (e) => {
    setTick(e.target.checked);
    if (
      e.target.checked &&
      billingInfo &&
      Object?.keys(billingInfo).length > 0
    ) {
      setShippingInfo({
        fullName: billingInfo?.fullName,
        shippingEmail: billingInfo?.billingEmail,
        phone: billingInfo?.phone,
        house: billingInfo?.house,
        city: billingInfo?.city,
        state: billingInfo?.state,
        zipCode: billingInfo?.zipCode,
        country: billingInfo?.country,
      });
    } else if (e.target.checked) {
      setShippingInfo({
        fullName: fullName1.current.value,
        shippingEmail: Email1.current.value,
        phone: phone1.current.value,
        house: house1.current.value,
        city: city1.current.value,
        state: state1.current.value,
        zipCode: zip1.current.value,
        country: country1,
      });
    } else {
      if (data.user.shippingAddress) {
        setShippingInfo(data.user.shippingAddress);
      } else {
        setShippingInfo({});
      }
    }
  };

  const updateUserInfo = async (e) => {
    try {
      e.preventDefault();
      setLoading("loading");
      const userData = {
        name: name.current.value,
        email: email.current.value,
        phone: phone.current.value,
        house: house.current.value,
        city: city.current.value,
        state: state.current.value,
        zipCode: zip.current.value,
        country: country.current.value,
        addressCheck: tick,
        billingAddress: {
          fullName: fullName1.current.value,
          billingEmail: Email1.current.value,
          phone: phone1.current.value,
          house: house1.current.value,
          city: city1.current.value,
          state: state1.current.value,
          zipCode: zip1.current.value,
          country: country1,
        },
        shippingAddress: {
          fullName: fullName2.current.value,
          shippingEmail: Email2.current.value,
          phone: phone2.current.value,
          house: house2.current.value,
          city: city2.current.value,
          state: state2.current.value,
          zipCode: zip2.current.value,
          country: country2,
        },
      };
      const response = await postData(
        `/api/profile?scope=info&id=${props.id}`,
        userData
      );
      response.success
        ? toast.success("Profile Updated Successfully")
        : response.duplicate
        ? toast.error("A user with the given email is already registered")
        : toast.error("Something Went Wrong (500)");
      setLoading("");
    } catch (err) {
      setLoading("");
      console.log(err);
      toast.error(`Something Went Wrong (${err.message})`);
    }
  };

  useEffect(() => {
    async function fetchShippingCharge() {
      try {
        const response = await fetchData(`/api/home/shipping`);
        if (response.success) {
          if (response.address) {
            const {
              house,
              city,
              state,
              zipCode,
              country,
              billingAddress,
              shippingAddress,
            } = response.address;
            const data = {
              house,
              city,
              state,
              zipCode,
              country,
              billingAddress,
              shippingAddress,
            };
            const preData = {
              billingInfo: data.billingAddress,
              shippingInfo: data.shippingAddress,
            };
            setBillingInfo(preData.billingInfo);
            setShippingInfo(preData.shippingInfo);
            setCountry1(preData.billingInfo?.country);
            setCountry2(preData.shippingInfo?.country);
          } else {
            const { billingInfo, shippingInfo } = cartData;
            setBillingInfo(billingInfo);
            setShippingInfo(shippingInfo);
          }
        } else {
          toast.error("something went wrong");
        }
      } catch (err) {
        console.log(err);
      }
    }
    fetchShippingCharge();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {error ? (
        <div className="text-center text-danger">failed to load</div>
      ) : !data ? (
        <Spinner />
      ) : (
        <div>
          <div className="card mb-5 border-0 shadow-sm">
            <div className="card-header bg-white py-3">
              {t("basic_information")}
            </div>
            <form onSubmit={updateUserInfo}>
              <div className="card-body">
                <div className="py-2">
                  <label className="form-label">{t("name")}</label>
                  <input
                    type="text"
                    className="form-control"
                    ref={name}
                    defaultValue={userData?.name}
                  />
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="py-2">
                      <label className="form-label">{t("phone")}*</label>
                      <input
                        type="tel"
                        className="form-control"
                        ref={phone}
                        defaultValue={userData?.phone}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="py-2">
                      <label className="form-label">{t("email")}*</label>
                      <input
                        type="email"
                        className="form-control"
                        ref={email}
                        defaultValue={userData?.email}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="py-2">
                  <label className="form-label">{t("Full Address")}</label>
                  <textarea
                    className="form-control"
                    ref={house}
                    rows="2"
                    defaultValue={userData?.house}
                  />
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="py-2">
                      <label className="form-label">{t("city")}</label>
                      <input
                        type="text"
                        className="form-control"
                        ref={city}
                        defaultValue={userData?.city}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="py-2">
                      <label className="form-label">
                        {t("state_province")}
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        ref={state}
                        defaultValue={userData?.state}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="py-2">
                      <label className="form-label">{t("post_zip_code")}</label>
                      <input
                        type="text"
                        className="form-control"
                        ref={zip}
                        defaultValue={userData?.zipCode}
                      />
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="py-2">
                      <label className="form-label">
                        {t("select_country")}
                      </label>
                      <select
                        className="form-control"
                        ref={country}
                        value={userData?.country}
                      >
                        <option value="">{t("select_country")}</option>
                        {countryData?.country?.map((ct) => (
                          <option value={ct.name} key={ct.name}>
                            {ct.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  {billingInfoJsx()}
                  <div className="py-2 form-check mt-2">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="Check1"
                      checked={tick}
                      onChange={sameBillingAsShipping}
                    />
                    <label className="form-check-label" htmlFor="Check1">
                      {t("shipping_address_same_as_billing_address")}
                    </label>
                  </div>
                  {shippingInfoJsx()}
                  <div className="py-3">
                    <LoadingButton
                      text="Update"
                      state={loading}
                      type="submit"
                    />
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );

  function billingInfoJsx() {
    return (
      <div>
        <form className={classes.checkout_form} onSubmit={handleBillingInfo}>
          <div className="mt-3">
            <div className="card-header bg-white py-3">{t("billing_info")}</div>
            <div className={classes.input}>
              <input
                type="text"
                placeholder={`${t("full_name")}*`}
                ref={fullName1}
                required
                defaultValue={billingInfo?.fullName}
              />
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className={classes.input}>
                  <input
                    type="email"
                    placeholder={`${t("email")}*`}
                    ref={Email1}
                    required
                    defaultValue={billingInfo?.billingEmail}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className={classes.input}>
                  <input
                    type="tel"
                    placeholder={`${t("phone")}*`}
                    ref={phone1}
                    required
                    defaultValue={billingInfo?.phone}
                  />
                </div>
              </div>
            </div>
            <div className={classes.input}>
              <input
                className="form-control"
                placeholder={`${t("house_street")}*`}
                ref={house1}
                required
                defaultValue={billingInfo?.house}
              />
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className={classes.input}>
                  <input
                    type="text"
                    placeholder={`${t("city")}*`}
                    ref={city1}
                    required
                    defaultValue={billingInfo?.city}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className={classes.input}>
                  <input
                    type="text"
                    placeholder={`${t("state_province")}*`}
                    ref={state1}
                    required
                    defaultValue={billingInfo?.state}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className={classes.input}>
                  <input
                    type="text"
                    placeholder={`${t("post_zip_code")}*`}
                    ref={zip1}
                    required
                    defaultValue={billingInfo?.zipCode}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className={classes.input}>
                  <select
                    className="form-control"
                    onChange={(e) => billingCountry(e)}
                    required
                    value={country1}
                  >
                    <option value="" disabled>
                      {`${t("select_country")}*`}
                    </option>
                    {countryData?.country?.map((ct) => (
                      <option value={ct.name} key={ct.name}>
                        {ct.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }

  function shippingInfoJsx() {
    return (
      <div>
        <form className={classes.checkout_form} onSubmit={handleShippingInfo}>
          <div className="mt-3">
            <div className="card-header bg-white py-3">
              {t("shipping_info")}
            </div>
            <div className={classes.input}>
              <input
                type="text"
                placeholder={`${t("full_name")}*`}
                ref={fullName2}
                required
                defaultValue={shippingInfo?.fullName}
              />
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className={classes.input}>
                  <input
                    type="email"
                    placeholder={`${t("email")}*`}
                    ref={Email2}
                    required
                    defaultValue={shippingInfo?.shippingEmail}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className={classes.input}>
                  <input
                    type="tel"
                    placeholder={`${t("phone")}*`}
                    ref={phone2}
                    required
                    defaultValue={shippingInfo?.phone}
                  />
                </div>
              </div>
            </div>
            <div className={classes.input}>
              <input
                className="form-control"
                placeholder={`${t("house_street")}*`}
                ref={house2}
                required
                defaultValue={shippingInfo?.house}
              />
            </div>
            <div className="row">
              <div className="col-md-6">
                <div className={classes.input}>
                  <input
                    type="text"
                    placeholder={`${t("city")}*`}
                    ref={city2}
                    required
                    defaultValue={shippingInfo?.city}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className={classes.input}>
                  <input
                    type="text"
                    placeholder={`${t("state_province")}*`}
                    ref={state2}
                    required
                    defaultValue={shippingInfo?.state}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className={classes.input}>
                  <input
                    type="text"
                    placeholder={`${t("post_zip_code")}*`}
                    ref={zip2}
                    required
                    defaultValue={shippingInfo?.zipCode}
                  />
                </div>
              </div>
              <div className="col-md-6">
                <div className={classes.input}>
                  <select
                    className="form-control"
                    onChange={(e) => shippingCountry(e)}
                    required
                    value={country2}
                  >
                    <option value="">{`${t("select_country")}*`}</option>
                    {countryData.country.map((ct) => (
                      <option value={ct.name} key={ct.name}>
                        {ct.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    );
  }
};

export default ManageProfile;
