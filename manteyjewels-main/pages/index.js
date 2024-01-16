import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import HeadData from "~/components/Head";
import { setSettingsData } from "~/lib/clientFunctions";
import homePageData from "~/lib/dataLoader/home";
import { wrapper } from "~/redux/store";

const Error500 = dynamic(() => import("~/components/error/500"));
const Header = dynamic(() => import("~/components/Header/header"));
const Banner = dynamic(() => import("~/components/Banner/banner"));
const CategoryList = dynamic(() =>
  import("~/components/Categories/categoriesList")
);
const Collection = dynamic(() => import("~/components/Collection/collection"));
const BrandCardList = dynamic(() => import("~/components/Brand/brandList"));
const ProductDetails = dynamic(() =>
  import("~/components/Shop/Product/productDetails")
);
const ProductList = dynamic(() => import("~/components/ProductListView"));
const GlobalModal = dynamic(() => import("~/components/Ui/Modal/modal"));

function HomePage({ data, error }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [hideBanner1, setHideBanner1] = useState(false);
  const [hideBanner2, setHideBanner2] = useState(false);
  const [hideBanner3, setHideBanner3] = useState(false);
  const [hideCollection1, setHideCollection1] = useState(false);
  const [hideCollection2, setHideCollection2] = useState(false);
  const { t } = useTranslation();

  const handleCloseModal = () => {
    router.push("/", undefined, { scroll: false });
    setIsOpen(false);
  };

  useEffect(() => {
    if (router.query.slug) {
      setIsOpen(true);
    }
    if (data?.additional?.homePage?.banners?.banner1?.hide) {
      setHideBanner1(true);
    }
    if (data?.additional?.homePage?.banners?.banner2?.hide) {
      setHideBanner2(true);
    }
    if (data?.additional?.homePage?.banners?.banner3?.hide) {
      setHideBanner3(true);
    }
    if (data?.additional?.homePage?.collection1?.hide) {
      setHideCollection1(true);
    }
    if (data?.additional?.homePage?.collection2?.hide) {
      setHideCollection2(true);
    }
  }, [router.query.slug]);

  return (
    <>
      {error ? (
        <Error500 />
      ) : (
        <>
          <HeadData />
          <Header
            carousel={data.additional && data.additional.homePage.carousel}
          />
          <CategoryList categoryList={data.category} />
          <ProductList title={t("new_products")} type="new" />
          {!hideBanner1 ? (
            <>
              <div className="content_spacing" />
              <Banner
                banner={
                  data.additional && data.additional.homePage.banners?.banner1
                }
              />
            </>
          ) : (
            ""
          )}

          <ProductList title={t("trending_products")} type="trending" />
          <div className="content_spacing" />

          {!hideCollection1 ? (
            <Collection
              data={data.additional && data.additional.homePage?.collection1}
            />
          ) : (
            ""
          )}

          <ProductList title={t("best_selling")} type="bestselling" />

          {!hideBanner2 ? (
            <>
              <div className="content_spacing" />
              <Banner
                banner={
                  data.additional && data.additional.homePage.banners?.banner2
                }
              />
            </>
          ) : (
            ""
          )}

          <ProductList title={t("featured_product")} type="featured" />

          {!hideBanner3 ? (
            <>
              <div className="content_spacing" />
              <Banner
                banner={
                  data.additional && data.additional.homePage.banners?.banner3
                }
              />
            </>
          ) : (
            ""
          )}

          <ProductList title={t("clearence_product")} type="clearence" />

          {!hideCollection2 ? (
            <Collection
              data={data.additional && data.additional.homePage?.collection2}
            />
          ) : (
            ""
          )}
          {/* <BrandCardList items={data.brand || []} /> */}
          <div className="content_spacing" />
        </>
      )}
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

export const getServerSideProps = wrapper.getServerSideProps(
  (store) =>
    async ({ req, res, locale, ...etc }) => {
      if (res) {
        res.setHeader(
          "Cache-Control",
          "public, s-maxage=10800, stale-while-revalidate=59"
        );
      }
      const _data = await homePageData();
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

export default HomePage;
