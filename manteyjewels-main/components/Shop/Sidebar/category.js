import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import ImageLoader from "~/components/Image";
import c from "./sidebar.module.css";

const SidebarCategoryList = ({
  updateSubCategory,
  updateCategory,
  category,
  hideTopBar,
  callBack,
  newCallBack,
  // productData
}) => {
  const [_c, setCatClicked] = useState("");
  const [subClicked, setSubClicked] = useState("");
  const router = useRouter();

  //toggle category category

  const htc = (name) => {
    setSubClicked("");
    updateSubCategory("");
    if (_c === name) {
      setCatClicked("");
      updateCategory("");
    } else {
      setCatClicked(name);
      updateCategory(name);
    }
    callBack(name);
    newCallBack("");
  };

  //detect query change

  useEffect(() => {
    const { category, parent } = router.query;
    const query = category ? decodeURI(category) : "";
    const parentCategory = parent ? decodeURI(parent) : "";
    if (parentCategory.length > 1) {
      setCatClicked(parentCategory);
      setSubClicked(query);
      updateSubCategory(
        `${
          parentCategory[0].toLocaleUpperCase("en-US") + parentCategory.slice(1)
        }-${query}`
      );

      updateCategory(parentCategory);
    } else if (query.length > 1) {
      setCatClicked(query);
      updateCategory(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.category]);

  //handle click subCategory

  const hcs = (name, newName, subName, parentSlug) => {
    if (subClicked === name) {
      updateSubCategory("");
      return setSubClicked("");
    }

    if (newName) {
      newCallBack(newName);
      callBack("");
    }

    setSubClicked(name);
    updateSubCategory(subName);
    updateCategory(parentSlug);
  };

  return (
    <ul className="list-unstyled ps-1 pt-2">
      {category.map((cat, i) => (
        <div key={cat._id + i}>
          <li className={c.list} key={cat._id + i}>
            <button
              className={`${
                _c === cat.slug ? c.parent_button_active : c.parent_button
              }`}
              onClick={() => htc(cat.slug)}
            >
              <ImageLoader
                src={cat.icon[0]?.url}
                alt={cat.name}
                width={22}
                height={22}
              />
              {cat.name}
            </button>
          </li>
          {hideTopBar ? (
            <div className={_c === cat.slug ? c.show : c.collapse}>
              <ul className="list-unstyled ps-1 ms-0">
                {cat.subCategories.map((_sub, subIdx) => (
                  <li key={_sub.slug + subIdx} className={c.sublist}>
                    <button
                      onClick={() => {
                        hcs(
                          _sub.slug,
                          cat.slug,
                          _sub.subCategory.name,
                          _sub.parentSlug
                        );
                      }}
                      className={`${
                        subClicked === _sub.slug ? c.subnav_active : c.subnav
                      }`}
                    >
                      {_sub?.subCategory?.original}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className={`${c.show}`}>
              <ul className="list-unstyled ps-1 ms-0">
                {cat.subCategories.map((_sub, subIdx) => (
                  <li key={_sub.slug + subIdx} className={c.sublist}>
                    <button
                      onClick={() => {
                        hcs(
                          _sub.slug,
                          cat.slug,
                          _sub.subCategory.name,
                          _sub.parentSlug
                        );
                      }}
                      className={`${
                        subClicked === _sub.slug ? c.subnav_active : c.subnav
                      }`}
                    >
                      {_sub?.subCategory?.original}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </ul>
  );
};

export default React.memo(SidebarCategoryList);
