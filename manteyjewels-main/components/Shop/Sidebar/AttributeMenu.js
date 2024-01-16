import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import c from "./brandlist.module.css";

export default function AttributeList({ attribute, updateAttr }) {
  const [clicked, setClicked] = useState([]);
  const router = useRouter();

  //handle brand selection
  function attributeSelected(name) {
    if (clicked.find((x) => x == name)) {
      const filtered = clicked.filter((x) => x != name);
      setClicked(filtered);
      updateAttr(filtered);
    } else {
      const newList = [...clicked, name];
      setClicked(newList);
      updateAttr(newList);
    }
  }

  const attArr = [];
  attribute.map((el) => el.values.map((o) => attArr.push(o.name)));

  // console.log("updateAttr:-", updateAttr)

  //detect query change
  useEffect(() => {
    const { attribute } = router.query;
    if (attribute && attribute.length > 1) {
      const query = decodeURI(attribute);
      setClicked(query);
      updateAttr(query);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.attribute]);


  return (
    <ul className={`list-unstyled ps-0 ${c.brand}`}>
      {attArr.map((item, index) => (
        <li
          key={index}
          className={`${c.brand_item} ${
            clicked.find((x) => x == item) ? c.brand_item_selected : null
          }`}
          onClick={() => attributeSelected(item)}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
