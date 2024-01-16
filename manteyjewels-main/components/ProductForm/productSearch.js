import { ArrowRepeat, Search } from "@styled-icons/bootstrap";
import { useRef, useState } from "react";
import { useSelector } from "react-redux";
import OutsideClickHandler from "~/components/ClickOutside";
import ImageLoader from "~/components/Image";
import { fetchData } from "~/lib/clientFunctions";
import classes from "./productSearch.module.css";
import { useTranslation } from "react-i18next";

export default function ProductSearch({ callback }) {
  const [searchData, setSearchData] = useState([]);
  const [searching, setSearching] = useState(false);
  const search = useRef("");
  const settings = useSelector((state) => state.settings);
  const { t } = useTranslation();

  const hideSearchBar = () => {
    search.current.value = "";
    setSearchData([]);
  };

  const handleClick = (e, product) => {
    callback(product);
  };

  const searchItem = async () => {
    setSearching(true);
    try {
      const options = {
        threshold: 0.3,
        keys: ["name"],
      };
      const product = await fetchData(`/api/home/product_search_combo?type=simple`);
      const Fuse = (await import("fuse.js")).default;
      const fuse = new Fuse(product.product, options);
      setSearchData(fuse.search(search.current.value));
    } catch (err) {
      console.log(err);
    }
    setSearching(false);
  };

  return (
    <div className={classes.searchBar_def}>
      <input
        type="text"
        ref={search}
        className={classes.searchInput_def}
        onInput={searchItem}
        placeholder={t("search_your_product")}
      />
      {searching && (
        <span className={classes.spinner_def}>
          <ArrowRepeat width={17} height={17} />
        </span>
      )}
      <span className={classes.search_icon_def}>
        <Search width={15} height={15} />
      </span>
      <OutsideClickHandler
        show={searchData.length > 0}
        onClickOutside={hideSearchBar}
      >
        <ul className={classes.searchData_def}>
          {searchData.map((product, index) => (
            <div key={index} onClick={(e) => handleClick(e, product)}>
              <li key={index}>
                <div onClick={hideSearchBar}>
                  <div className={classes.thumb}>
                    <ImageLoader
                      src={product.item.image[0]?.url}
                      alt={product.item.name}
                      width={40}
                      height={40}
                    />
                    <div className={classes.content}>
                      <div><p>{product.item.name}</p></div>
                      <div className={classes.price}>
                        <div
                          className={classes.unit}
                        >{`${product.item.unitValue} ${product.item.unit}`}</div>
                        <span>
                          {settings.settingsData.currency.symbol +
                            product.item.discount}
                          {product.item.discount < product.item.price && (
                            <del>
                              {settings.settingsData.currency.symbol +
                                product.item.price}
                            </del>
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            </div>
          ))}
        </ul>
      </OutsideClickHandler>
    </div>
  );
}
