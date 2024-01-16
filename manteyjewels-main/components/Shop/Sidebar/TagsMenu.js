import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import c from "./brandlist.module.css";

export default function TagList({ tag, updateTag, parent }) {
  const [clicked, setClicked] = useState([]);
  const router = useRouter();
  const { filter } = router.query;

  useEffect(() => {
    if (filter) {
      const newitem = {
        ischecked: true,
        name: filter.split('-').join(' '),
        parentLabel: "Product Type",
      };

      if (
        clicked.find(
          (x) => x.name == newitem.name && x.parentLabel == newitem.parentLabel
        )
      ) {
        const filtered = clicked.filter(
          (x) => x.name != newitem.name && x.parentLabel == newitem.parentLabel
        );
        setClicked(filtered);
        newitem.ischecked = false;
        updateTag(newitem);
      } else {
        const newList = [...clicked, newitem];
        setClicked(newList);
        newitem.ischecked = true;
        updateTag(newitem);
      }

    }

  }, []);

  console.log(filter, "filter");
  // console.log(updateTag, "updateTag")

  function attributeSelected(item) {
    console.log(item, "item");

    if (
      clicked.find(
        (x) => x.name == item.name && x.parentLabel == item.parentLabel
      )
    ) {
      const filtered = clicked.filter(
        (x) => x.name != item.name && x.parentLabel == item.parentLabel
      );
      setClicked(filtered);
      item.ischecked = false;
      updateTag(item);
    } else {
      const newList = [...clicked, item];
      setClicked(newList);
      item.ischecked = true;
      updateTag(item);
    }
  }

  const attArr = [];
  tag.map((el) =>
    el.values.map((o) => attArr.push({ name: o.name, parentLabel: el.name }))
  );

  //detect query change
  useEffect(() => {
    const { tag } = router.query;
    if (tag && tag.length > 1) {
      const query = decodeURI(tag);
      setClicked(query);
      updateTag(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.tag]);

  return (
    <ul className={`list-unstyled ps-0 ${c.brand}`}>
      {attArr.map(
        (item, index) =>
          parent == item.parentLabel && (
            <li
              key={index}
              className={`${c.brand_item} ${
                clicked.find((x) => x.name == item.name)
                  ? c.brand_item_selected
                  : null
              }`}
              onClick={() => attributeSelected(item)}
            >
              {item.name}
            </li>
          )
      )}
    </ul>
  );
}
