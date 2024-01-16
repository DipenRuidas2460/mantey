import { PencilSquare, Trash } from "@styled-icons/bootstrap";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import DataTable from "react-data-table-component";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import useSWR from "swr";
import ImageLoader from "~/components/Image";
import classes from "~/components/tableFilter/table.module.css";
import { cpf, deleteData, fetchData, postData } from "~/lib/clientFunctions";

const Spinner = dynamic(() => import("~/components/Ui/Spinner"));
const GlobalModal = dynamic(() => import("~/components/Ui/Modal/modal"));
const LoadingButton = dynamic(() => import("~/components/Ui/Button"));
const Accordion = dynamic(() => import("~/components/Ui/Accordion"));
const FileUpload = dynamic(() => import("~/components/FileUpload/fileUpload"));

const HomePageSetting = () => {
  const url = `/api/page`;
  const { data, error, mutate } = useSWR(url, fetchData);

  const [homePageData, setHomePageData] = useState({});
  const [carouselImage, updateCarouselImage] = useState([]);
  const [carouselBackgroundImage, updateCarouselBackgroundImage] = useState([]);
  const [resetCarouselImageInput, setResetCarouselImageInput] = useState("");
  const [buttonState, setButtonState] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState("");
  const [selectCheckBox1, setSelectCheckBox1] = useState(null);
  const [selectCheckBox2, setSelectCheckBox2] = useState(null);
  const [selectCheckBox3, setSelectCheckBox3] = useState(null);

  const carouselForm = useRef();
  const carouselTitle = useRef();
  const carouselSubTitle = useRef();
  const carouselDesc = useRef();
  const carouselUrl = useRef();

  const banner1Title = useRef();
  const banner1SubTitle = useRef();
  const banner1Desc = useRef();
  const banner1Url = useRef();
  const banner2Title = useRef();
  const banner2SubTitle = useRef();
  const banner2Desc = useRef();
  const banner2Url = useRef();
  const banner3Title = useRef();
  const banner3SubTitle = useRef();
  const banner3Desc = useRef();
  const banner3Url = useRef();

  const collection1Title = useRef();
  const collection1Url = useRef();
  const collection2Title = useRef();
  const collection2Url = useRef();

  const [banner1Image, updateBanner1Image] = useState([]);
  const [banner2Image, updateBanner2Image] = useState([]);
  const [banner3Image, updateBanner3Image] = useState([]);

  const [collection1Image, updateCollection1Image] = useState([]);
  const [collection2Image, updateCollection2Image] = useState([]);

  const [collection1Data, setCollection1Data] = useState({
    title: "",
    url: "",
  });

  const [collection2Data, setCollection2Data] = useState({
    title: "",
    url: "",
  });

  const [collection1Scope, setCollection1Scope] = useState("");
  const [collection2Scope, setCollection2Scope] = useState("");

  const { t } = useTranslation();
  useEffect(() => {
    if (data && data.page) {
      setHomePageData(data.page.homePage);
      updateCarouselBackgroundImage(data.page.homePage.carousel.background);
      updateBanner1Image(data.page.homePage.banners?.banner1?.image);
      updateBanner2Image(data.page.homePage.banners?.banner2?.image);
      updateBanner3Image(data.page.homePage.banners?.banner3?.image);
      setSelectCheckBox1(data.page.homePage.banners?.banner1?.hide);
      setSelectCheckBox2(data.page.homePage.banners?.banner2?.hide);
      setSelectCheckBox3(data.page.homePage.banners?.banner3?.hide);
    }
  }, [data]);

  const { session } = useSelector((state) => state.localSession);
  const [permissions, setPermissions] = useState({});
  useEffect(() => {
    setPermissions(cpf(session, "pageSettings"));
  }, [session]);

  const openModal = (id) => {
    setSelectedId(id);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const deleteCarouselItem = async () => {
    setIsOpen(false);
    await deleteData(`/api/page/home?id=${selectedId}&scope=carousel`)
      .then((data) =>
        data.success
          ? (toast.success("Item Deleted Successfully"), mutate())
          : toast.error("Something Went Wrong")
      )
      .catch((err) => {
        toast.error(err.message);
      });
  };

  const handleSelectCheckBox1 = (e) => {
    setSelectCheckBox1(e.target.checked);
  };

  const handleSelectCheckBox2 = (e) => {
    setSelectCheckBox2(e.target.checked);
  };

  const handleSelectCheckBox3 = (e) => {
    setSelectCheckBox3(e.target.checked);
  };

  const handleCarouselAdd = async (e) => {
    e.preventDefault();
    try {
      if (!carouselImage[0]) {
        return toast.warn("Please add image");
      }
      setButtonState("loading");
      const data = {
        title: carouselTitle.current.value.trim(),
        subTitle: carouselSubTitle.current.value.trim(),
        description: carouselDesc.current.value.trim(),
        url: carouselUrl.current.value.trim(),
        image: carouselImage,
      };
      const { success, err } = await postData(
        `/api/page/home?scope=carousel`,
        data
      );

      success
        ? (toast.success("Item Added Successfully"),
          setResetCarouselImageInput("reset"),
          carouselForm.current.reset(),
          mutate())
        : toast.error(err);
      setButtonState("");
    } catch (err) {
      setButtonState("");
      toast.error(err.message);
    }
  };

  const handleCarouselBackground = async () => {
    try {
      if (!carouselBackgroundImage[0]) {
        return toast.warn("Please add image");
      }
      setButtonState("loading");
      const { success, err } = await postData(
        `/api/page/home?scope=background`,
        { background: carouselBackgroundImage }
      );
      success
        ? toast.success("Background Image Added Successfully")
        : toast.error(err);
      setButtonState("");
    } catch (err) {
      setButtonState("");
      toast.error(err.message);
    }
  };

  const handleBannerAdd = async (e) => {
    e.preventDefault();
    try {
      if (!banner1Image[0]) {
        return toast.warn("Please add Banner1 image");
      }
      if (!banner2Image[0]) {
        return toast.warn("Please add Banner2 image");
      }
      if (!banner3Image[0]) {
        return toast.warn("Please add Banner3 image");
      }
      setButtonState("loading");
      const data = {
        banner1: {
          title: banner1Title.current.value.trim(),
          subTitle: banner1SubTitle.current.value.trim(),
          description: banner1Desc.current.value.trim(),
          url: banner1Url.current.value.trim(),
          image: banner1Image,
          hide: selectCheckBox1,
        },
        banner2: {
          title: banner2Title.current.value.trim(),
          subTitle: banner2SubTitle.current.value.trim(),
          description: banner2Desc.current.value.trim(),
          url: banner2Url.current.value.trim(),
          image: banner2Image,
          hide: selectCheckBox2,
        },
        banner3: {
          title: banner3Title.current.value.trim(),
          subTitle: banner3SubTitle.current.value.trim(),
          description: banner3Desc.current.value.trim(),
          url: banner3Url.current.value.trim(),
          image: banner3Image,
          hide: selectCheckBox3,
        },
      };
      const { success, err } = await postData(
        `/api/page/home?scope=banners`,
        data
      );
      success ? toast.success("Item Updated Successfully") : toast.error(err);
      setButtonState("");
    } catch (err) {
      setButtonState("");
      toast.error(err.message);
    }
  };

  const editCollection1 = (scope) => {
    setCollection1Scope("");
    setTimeout(() => {
      updateCollection1Image(homePageData.collection1[scope].image);
      setCollection1Data({
        title: homePageData.collection1[scope].title,
        url: homePageData.collection1[scope].url,
      });
      setCollection1Scope(scope);
    }, 100);
  };

  const editCollection2 = (scope) => {
    setCollection2Scope("");
    setTimeout(() => {
      updateCollection2Image(homePageData.collection2[scope].image);
      setCollection2Data({
        title: homePageData.collection2[scope].title,
        url: homePageData.collection2[scope].url,
      });
      setCollection2Scope(scope);
    }, 100);
  };

  const handleCollection1Add = async (e) => {
    e.preventDefault();
    try {
      setButtonState("loading");
      const data = {
        title: collection1Title.current.value.trim(),
        url: collection1Url.current.value.trim(),
        image: collection1Image,
      };
      const { success, err } = await postData(
        `/api/page/home?scope=collectionOne&dataScopeOne=${collection1Scope}`,
        data
      );
      success
        ? (toast.success("Item Updated Successfully"),
          updateCollection1Image([]),
          setCollection1Data({
            title: "",
            url: "",
          }),
          setCollection1Scope(""),
          mutate())
        : toast.error(err);
      setButtonState("");
    } catch (err) {
      setButtonState("");
      toast.error(err.message);
    }
  };

  const handleCollection2Add = async (e) => {
    e.preventDefault();
    try {
      setButtonState("loading");
      const data = {
        title: collection2Title.current.value.trim(),
        url: collection2Url.current.value.trim(),
        image: collection2Image,
      };
      const { success, err } = await postData(
        `/api/page/home?scope=collectionTwo&dataScopeTwo=${collection2Scope}`,
        data
      );
      success
        ? (toast.success("Item Updated Successfully"),
          updateCollection2Image([]),
          setCollection2Data({
            title: "",
            url: "",
          }),
          setCollection2Scope(""),
          mutate())
        : toast.error(err);
      setButtonState("");
    } catch (err) {
      setButtonState("");
      toast.error(err.message);
    }
  };

  const columns = [
    {
      name: t("Title"),
      selector: (row) => row.title,
    },
    {
      name: t("URL"),
      selector: (row) => row.url,
      sortable: true,
    },
    {
      name: t("image"),
      selector: (row) => (
        <ImageLoader
          src={row.image[0]?.url}
          alt={row.title}
          width={50}
          height={50}
        />
      ),
    },
    {
      name: t("action"),
      selector: (row) =>
        permissions.delete && (
          <div className={classes.button} onClick={() => openModal(row.id)}>
            <Trash width={22} height={22} title="DELETE" />
          </div>
        ),
    },
  ];

  const handleCollection1CheckBox = async (event) => {
    try {
      const data = {
        hide: event.target.checked,
      };

      const { success, err } = await postData(
        `/api/page/home?scope=collection1Hide`,
        data
      );
      success
        ? (toast.success("Hide Status change Successfully"), mutate())
        : toast.error(err);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCollection2CheckBox = async (event) => {
    try {
      const data = {
        hide: event.target.checked,
      };

      const { success, err } = await postData(
        `/api/page/home?scope=collection2Hide`,
        data
      );
      success
        ? (toast.success("Hide Status change Successfully"), mutate())
        : toast.error(err);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      {error ? (
        <div className="text-center text-danger">failed to load</div>
      ) : !homePageData.carousel ? (
        <Spinner />
      ) : (
        <>
          {headerCarousel()}
          {banner()}
          {bannerTwo()}
        </>
      )}
      <GlobalModal isOpen={isOpen} handleCloseModal={closeModal} small={true}>
        <div className={classes.modal_icon}>
          <Trash width={90} height={90} />
          <p className="mb-1">Are you sure, you want to delete?</p>
          <div>
            <button
              className={classes.danger_button}
              onClick={() => deleteCarouselItem()}
            >
              Delete
            </button>
            <button
              className={classes.success_button}
              onClick={() => closeModal()}
            >
              Cancel
            </button>
          </div>
        </div>
      </GlobalModal>
    </>
  );

  function bannerTwo() {
    return (
      <div className="card-body">
        <div className="card border-0 shadow mb-5 mt-5">
          <div className="card-header bg-white py-3 fw-bold">
            {t("Product Review Card1")}
          </div>
          <div className="card-body">
            <div className="table-responsive mb-4">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">{t("image")}</th>
                    <th scope="col">{t("Title")}</th>
                    <th scope="col">{t("Link")}</th>
                    <th scope="col">{t("action")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">1</th>
                    <td>
                      {homePageData?.collection1?.scopeA?.image[0] && (
                        <ImageLoader
                          src={homePageData?.collection1?.scopeA?.image[0]?.url}
                          width={40}
                          height={40}
                          alt={homePageData?.collection1?.scopeA?.title}
                        />
                      )}
                    </td>
                    <td>{homePageData?.collection1?.scopeA?.title}</td>
                    <td>{homePageData?.collection1?.scopeA?.url}</td>
                    {permissions.edit && (
                      <td>
                        <div
                          className={classes.button}
                          onClick={() => editCollection1("scopeA")}
                        >
                          <PencilSquare width={22} height={22} title="Edit" />
                        </div>
                      </td>
                    )}
                  </tr>
                  <tr>
                    <th scope="row">2</th>
                    <td>
                      {homePageData?.collection1?.scopeB?.image[0] && (
                        <ImageLoader
                          src={homePageData?.collection1?.scopeB?.image[0]?.url}
                          width={40}
                          height={40}
                          alt={homePageData?.collection1?.scopeB?.title}
                        />
                      )}
                    </td>
                    <td>{homePageData?.collection1?.scopeB?.title}</td>
                    <td>{homePageData?.collection1?.scopeB?.url}</td>
                    {permissions.edit && (
                      <td>
                        <div
                          className={classes.button}
                          onClick={() => editCollection1("scopeB")}
                        >
                          <PencilSquare width={22} height={22} title="Edit" />
                        </div>
                      </td>
                    )}
                  </tr>
                  <tr>
                    <th scope="row">3</th>
                    <td>
                      {homePageData?.collection1?.scopeC?.image[0] && (
                        <ImageLoader
                          src={homePageData?.collection1?.scopeC?.image[0]?.url}
                          width={40}
                          height={40}
                          alt={homePageData?.collection1?.scopeC?.title}
                        />
                      )}
                    </td>
                    <td>{homePageData?.collection1?.scopeC?.title}</td>
                    <td>{homePageData?.collection1?.scopeC?.url}</td>
                    {permissions.edit && (
                      <td>
                        <div
                          className={classes.button}
                          onClick={() => editCollection1("scopeC")}
                        >
                          <PencilSquare width={22} height={22} title="Edit" />
                        </div>
                      </td>
                    )}
                  </tr>
                  <tr>
                    <th scope="row">4</th>
                    <td>
                      {homePageData?.collection1?.scopeD?.image[0] && (
                        <ImageLoader
                          src={homePageData?.collection1?.scopeD?.image[0]?.url}
                          width={40}
                          height={40}
                          alt={homePageData?.collection1?.scopeD?.title}
                        />
                      )}
                    </td>
                    <td>{homePageData?.collection1?.scopeD?.title}</td>
                    <td>{homePageData?.collection1?.scopeD?.url}</td>
                    {permissions.edit && (
                      <td>
                        <div
                          className={classes.button}
                          onClick={() => editCollection1("scopeD")}
                        >
                          <PencilSquare width={22} height={22} title="Edit" />
                        </div>
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
            {collection1Scope.length > 0 && (
              <div className="p-2 border">
                <form onSubmit={handleCollection1Add}>
                  <div className="pb-0">
                    <FileUpload
                      accept=".jpg,.png,.jpeg"
                      label={`${t("image")}*`}
                      maxFileSizeInBytes={2000000}
                      updateFilesCb={updateCollection1Image}
                      preSelectedFiles={collection1Image}
                    />
                  </div>
                  <div className="pb-3">
                    <label htmlFor="banner-title" className="form-label">
                      {t("Title")}*
                    </label>
                    <input
                      type="text"
                      id="banner-title"
                      className="form-control"
                      required
                      ref={collection1Title}
                      defaultValue={collection1Data.title}
                    />
                  </div>
                  <div className="pb-5">
                    <label htmlFor="banner-url" className="form-label">
                      {t("URL")}*
                    </label>
                    <input
                      type="text"
                      id="banner-url"
                      className="form-control"
                      required
                      ref={collection1Url}
                      defaultValue={collection1Data.url}
                    />
                  </div>
                  <div className="pb-0">
                    <LoadingButton
                      text={t("UPDATE")}
                      type="submit"
                      state={buttonState}
                    />
                  </div>
                </form>
              </div>
            )}
            <label className="form-check-label ml-5" htmlFor="inp-113">
              {t("Hide")}
            </label>
            <div className="form-check form-switch ml-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="inp-113"
                name="hide"
                onInput={handleCollection1CheckBox}
                defaultChecked={homePageData.collection1.hide}
              />
            </div>
          </div>
        </div>

        <div className="card border-0 shadow mb-5 mt-5">
          <div className="card-header bg-white py-3 fw-bold">
            {t("Product Review Card2")}
          </div>
          <div className="card-body">
            <div className="table-responsive mb-4">
              <table className="table">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">{t("image")}</th>
                    <th scope="col">{t("Title")}</th>
                    <th scope="col">{t("Link")}</th>
                    <th scope="col">{t("action")}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <th scope="row">1</th>
                    <td>
                      {homePageData?.collection2?.scopeA?.image[0] && (
                        <ImageLoader
                          src={homePageData?.collection2?.scopeA?.image[0]?.url}
                          width={40}
                          height={40}
                          alt={homePageData?.collection2?.scopeA?.title}
                        />
                      )}
                    </td>
                    <td>{homePageData?.collection2?.scopeA?.title}</td>
                    <td>{homePageData?.collection2?.scopeA?.url}</td>
                    {permissions.edit && (
                      <td>
                        <div
                          className={classes.button}
                          onClick={() => editCollection2("scopeA")}
                        >
                          <PencilSquare width={22} height={22} title="Edit" />
                        </div>
                      </td>
                    )}
                  </tr>
                  <tr>
                    <th scope="row">2</th>
                    <td>
                      {homePageData?.collection2?.scopeB?.image[0] && (
                        <ImageLoader
                          src={homePageData?.collection2?.scopeB?.image[0]?.url}
                          width={40}
                          height={40}
                          alt={homePageData?.collection2?.scopeB?.title}
                        />
                      )}
                    </td>
                    <td>{homePageData?.collection2?.scopeB?.title}</td>
                    <td>{homePageData?.collection2?.scopeB?.url}</td>
                    {permissions.edit && (
                      <td>
                        <div
                          className={classes.button}
                          onClick={() => editCollection2("scopeB")}
                        >
                          <PencilSquare width={22} height={22} title="Edit" />
                        </div>
                      </td>
                    )}
                  </tr>
                  <tr>
                    <th scope="row">3</th>
                    <td>
                      {homePageData?.collection2?.scopeC?.image[0] && (
                        <ImageLoader
                          src={homePageData?.collection2?.scopeC?.image[0]?.url}
                          width={40}
                          height={40}
                          alt={homePageData?.collection2?.scopeC?.title}
                        />
                      )}
                    </td>
                    <td>{homePageData?.collection2?.scopeC?.title}</td>
                    <td>{homePageData?.collection2?.scopeC?.url}</td>
                    {permissions.edit && (
                      <td>
                        <div
                          className={classes.button}
                          onClick={() => editCollection2("scopeC")}
                        >
                          <PencilSquare width={22} height={22} title="Edit" />
                        </div>
                      </td>
                    )}
                  </tr>
                  <tr>
                    <th scope="row">4</th>
                    <td>
                      {homePageData?.collection2?.scopeD?.image[0] && (
                        <ImageLoader
                          src={homePageData?.collection2?.scopeD?.image[0]?.url}
                          width={40}
                          height={40}
                          alt={homePageData?.collection2?.scopeD?.title}
                        />
                      )}
                    </td>
                    <td>{homePageData?.collection2?.scopeD?.title}</td>
                    <td>{homePageData?.collection2?.scopeD?.url}</td>
                    {permissions.edit && (
                      <td>
                        <div
                          className={classes.button}
                          onClick={() => editCollection2("scopeD")}
                        >
                          <PencilSquare width={22} height={22} title="Edit" />
                        </div>
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>
            {collection2Scope.length > 0 && (
              <div className="p-2 border">
                <form onSubmit={handleCollection2Add}>
                  <div className="pb-0">
                    <FileUpload
                      accept=".jpg,.png,.jpeg"
                      label={`${t("image")}*`}
                      maxFileSizeInBytes={2000000}
                      updateFilesCb={updateCollection2Image}
                      preSelectedFiles={collection2Image}
                    />
                  </div>
                  <div className="pb-3">
                    <label htmlFor="banner-title1" className="form-label">
                      {t("Title")}*
                    </label>
                    <input
                      type="text"
                      id="banner-title1"
                      className="form-control"
                      required
                      ref={collection2Title}
                      defaultValue={collection2Data.title}
                    />
                  </div>
                  <div className="pb-5">
                    <label htmlFor="banner-url1" className="form-label">
                      {t("URL")}*
                    </label>
                    <input
                      type="text"
                      id="banner-url1"
                      className="form-control"
                      required
                      ref={collection2Url}
                      defaultValue={collection2Data.url}
                    />
                  </div>
                  <div className="pb-0">
                    <LoadingButton
                      text={t("UPDATE")}
                      type="submit"
                      state={buttonState}
                    />
                  </div>
                </form>
              </div>
            )}

            <label className="form-check-label ml-5" htmlFor="inp-114">
              {t("Hide")}
            </label>
            <div className="form-check form-switch ml-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="inp-114"
                name="hide"
                onInput={handleCollection2CheckBox}
                defaultChecked={homePageData.collection2.hide}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  function banner() {
    return (
      <div className="card-body">
        <form onSubmit={handleBannerAdd}>
          <div className="card border-0 shadow mb-5">
            <div className="card-header bg-white py-3 fw-bold">
              {t("Banner1")}
            </div>
            <div className="card-body">
              <div className="pb-0">
                <FileUpload
                  accept=".jpg,.png,.jpeg"
                  label={`${t("image")}(1920px x 750px)*`}
                  maxFileSizeInBytes={2000000}
                  updateFilesCb={updateBanner1Image}
                  preSelectedFiles={banner1Image}
                />
              </div>
              <div className="pb-3">
                <label htmlFor="banner-title" className="form-label">
                  {t("Title")}*
                </label>
                <input
                  type="text"
                  id="banner-title"
                  className="form-control"
                  required
                  ref={banner1Title}
                  defaultValue={homePageData?.banners?.banner1?.title}
                />
              </div>
              <div className="pb-3">
                <label htmlFor="banner-subtitle" className="form-label">
                  {t("Subtitle")}*
                </label>
                <input
                  type="text"
                  id="banner-subtitle"
                  className="form-control"
                  required
                  ref={banner1SubTitle}
                  defaultValue={homePageData?.banners?.banner1?.subTitle}
                />
              </div>
              <div className="pb-3">
                <label htmlFor="banner-desc" className="form-label">
                  {t("description")}*
                </label>
                <textarea
                  id="banner-desc"
                  className="form-control"
                  required
                  ref={banner1Desc}
                  defaultValue={homePageData?.banners?.banner1?.description}
                />
              </div>
              <div className="pb-5">
                <label htmlFor="banner-url" className="form-label">
                  {t("URL")}*
                </label>
                <input
                  type="text"
                  id="banner-url"
                  className="form-control"
                  required
                  ref={banner1Url}
                  defaultValue={homePageData?.banners?.banner1?.url}
                />
              </div>
              <label className="form-check-label" htmlFor="inp-110">
                {t("Hide")}
              </label>
              <div className="form-check form-switch mb-4 pb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="inp-110"
                  name="hide"
                  onInput={handleSelectCheckBox1}
                  defaultChecked={homePageData?.banners?.banner1?.hide}
                />
              </div>
            </div>
          </div>
          <div className="card border-0 shadow mb-5">
            <div className="card-header bg-white py-3 fw-bold">
              {t("Banner2")}
            </div>
            <div className="card-body">
              <div className="pb-0">
                <FileUpload
                  accept=".jpg,.png,.jpeg"
                  label={`${t("image")}(1920px x 750px)*`}
                  maxFileSizeInBytes={2000000}
                  updateFilesCb={updateBanner2Image}
                  preSelectedFiles={banner2Image}
                />
              </div>
              <div className="pb-3">
                <label htmlFor="banner-title" className="form-label">
                  {t("Title")}*
                </label>
                <input
                  type="text"
                  id="banner-title"
                  className="form-control"
                  required
                  ref={banner2Title}
                  defaultValue={homePageData?.banners?.banner2?.title}
                />
              </div>
              <div className="pb-3">
                <label htmlFor="banner-subtitle" className="form-label">
                  {t("Subtitle")}*
                </label>
                <input
                  type="text"
                  id="banner-subtitle"
                  className="form-control"
                  required
                  ref={banner2SubTitle}
                  defaultValue={homePageData?.banners?.banner2?.subTitle}
                />
              </div>
              <div className="pb-3">
                <label htmlFor="banner-desc" className="form-label">
                  {t("description")}*
                </label>
                <textarea
                  id="banner-desc"
                  className="form-control"
                  required
                  ref={banner2Desc}
                  defaultValue={homePageData?.banners?.banner2?.description}
                />
              </div>
              <div className="pb-5">
                <label htmlFor="banner-url" className="form-label">
                  {t("URL")}*
                </label>
                <input
                  type="text"
                  id="banner-url"
                  className="form-control"
                  required
                  ref={banner2Url}
                  defaultValue={homePageData?.banners?.banner2?.url}
                />
              </div>
              <label className="form-check-label" htmlFor="inp-111">
                {t("Hide")}
              </label>
              <div className="form-check form-switch mb-4 pb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="inp-111"
                  name="hide"
                  onInput={handleSelectCheckBox2}
                  defaultChecked={homePageData?.banners?.banner2?.hide}
                />
              </div>
            </div>
          </div>
          <div className="card border-0 shadow mb-5">
            <div className="card-header bg-white py-3 fw-bold">
              {t("Banner3")}
            </div>
            <div className="card-body">
              <div className="pb-0">
                <FileUpload
                  accept=".jpg,.png,.jpeg"
                  label={`${t("image")}(1920px x 750px)*`}
                  maxFileSizeInBytes={2000000}
                  updateFilesCb={updateBanner3Image}
                  preSelectedFiles={banner3Image}
                />
              </div>
              <div className="pb-3">
                <label htmlFor="banner-title" className="form-label">
                  {t("Title")}*
                </label>
                <input
                  type="text"
                  id="banner-title"
                  className="form-control"
                  required
                  ref={banner3Title}
                  defaultValue={homePageData?.banners?.banner3?.title}
                />
              </div>
              <div className="pb-3">
                <label htmlFor="banner-subtitle" className="form-label">
                  {t("Subtitle")}*
                </label>
                <input
                  type="text"
                  id="banner-subtitle"
                  className="form-control"
                  required
                  ref={banner3SubTitle}
                  defaultValue={homePageData?.banners?.banner3?.subTitle}
                />
              </div>
              <div className="pb-3">
                <label htmlFor="banner-desc" className="form-label">
                  {t("description")}*
                </label>
                <textarea
                  id="banner-desc"
                  className="form-control"
                  required
                  ref={banner3Desc}
                  defaultValue={homePageData?.banners?.banner3?.description}
                />
              </div>
              <div className="pb-5">
                <label htmlFor="banner-url" className="form-label">
                  {t("URL")}*
                </label>
                <input
                  type="text"
                  id="banner-url"
                  className="form-control"
                  required
                  ref={banner3Url}
                  defaultValue={homePageData?.banners?.banner3?.url}
                />
              </div>
              <label className="form-check-label" htmlFor="inp-112">
                {t("Hide")}
              </label>
              <div className="form-check form-switch mb-4 pb-4">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="inp-112"
                  name="hide"
                  onInput={handleSelectCheckBox3}
                  defaultChecked={homePageData?.banners?.banner3?.hide}
                />
              </div>
            </div>
          </div>
          {permissions.edit && (
            <div className="pb-0">
              <LoadingButton
                text={t("UPDATE")}
                type="submit"
                state={buttonState}
              />
            </div>
          )}
        </form>
      </div>
    );
  }

  function headerCarousel() {
    return (
      <div className="card border-0 shadow mb-5">
        <div className="card-header bg-white py-3 fw-bold">
          {t("Header carousel")}
        </div>
        <div className="card-body">
          <DataTable
            columns={columns}
            data={homePageData.carousel.carouselData}
            pagination
          />
          {permissions.edit && (
            <>
              <Accordion title={t("Add new header carousel item")}>
                <form onSubmit={handleCarouselAdd} ref={carouselForm}>
                  <div className="pb-0">
                    <FileUpload
                      accept=".jpg,.png,.jpeg"
                      label={`${t("image")}(750px x 750px)*`}
                      maxFileSizeInBytes={2000000}
                      updateFilesCb={updateCarouselImage}
                      resetCb={resetCarouselImageInput}
                    />
                  </div>
                  <div className="pb-3">
                    <label htmlFor="header-title" className="form-label">
                      {t("title")}*
                    </label>
                    <input
                      type="text"
                      id="header-title"
                      className="form-control"
                      required
                      ref={carouselTitle}
                    />
                  </div>
                  <div className="pb-3">
                    <label htmlFor="header-subtitle" className="form-label">
                      {t("Subtitle")}*
                    </label>
                    <input
                      type="text"
                      id="header-subtitle"
                      className="form-control"
                      required
                      ref={carouselSubTitle}
                    />
                  </div>
                  <div className="pb-3">
                    <label htmlFor="header-desc" className="form-label">
                      {t("description")}*
                    </label>
                    <textarea
                      id="header-desc"
                      className="form-control"
                      required
                      ref={carouselDesc}
                    />
                  </div>
                  <div className="pb-5">
                    <label htmlFor="header-url" className="form-label">
                      {t("URL")}*
                    </label>
                    <input
                      type="text"
                      id="header-url"
                      className="form-control"
                      required
                      ref={carouselUrl}
                    />
                  </div>
                  <div className="pb-0">
                    <LoadingButton
                      text={t("Add Item")}
                      type="submit"
                      state={buttonState}
                    />
                  </div>
                </form>
              </Accordion>
              <Accordion title={t("Header carousel background")}>
                <div className="pb-0">
                  <FileUpload
                    accept=".jpg,.png,.jpeg"
                    label={`${t("image")}(1920px x 800px)*`}
                    maxFileSizeInBytes={2000000}
                    updateFilesCb={updateCarouselBackgroundImage}
                    preSelectedFiles={carouselBackgroundImage}
                  />
                </div>
                <div>
                  <LoadingButton
                    text={t("Add Background Image")}
                    state={buttonState}
                    clickEvent={handleCarouselBackground}
                  />
                </div>
              </Accordion>
            </>
          )}
        </div>
      </div>
    );
  }
};

HomePageSetting.requireAuthAdmin = true;
HomePageSetting.dashboard = true;

export default HomePageSetting;
