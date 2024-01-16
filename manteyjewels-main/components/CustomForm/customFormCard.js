import { useState, useEffect} from "react";
import { Plus } from "@styled-icons/bootstrap";
import { toast } from "react-toastify";
import { fetchData, postData } from "~/lib/clientFunctions";
import { useSelector } from "react-redux";
import CustomFieldcard from "../CustomForm/customFieldsCard";
import Link from "next/link";

const ProductCustomForm = (props) => {
  const { session } = useSelector((state) => state.localSession);
  const [loading, setLoading] = useState(false);
  const [cardData, setCardData] = useState([
    {
      Name: "",
      NeedInFilter: 0,
      TypeId: "1",
      Optionvalue: "",
      HideFieldLabel: 0,
      Required: 0,
      isDeleted: 0,
    },
  ]);

  const addCard = () => {
    const cardInput = {
      Name: "",
      NeedInFilter: 0,
      TypeId: "1",
      Optionvalue: "",
      HideFieldLabel: 0,
      Required: 0,
      isDeleted: 0,
    };

    setCardData([...cardData, cardInput]);
  };

  const handleChangeCard = (index, evnt) => {
    let name, values;
    if (evnt.target === undefined) {
      name = "Optionvalue";
      values = evnt.toString();
    } else {
      if (evnt.target.type === "checkbox") {
        name = evnt.target.name;
        if (evnt.target.checked === true) {
          values = 1;
        } else {
          values = 0;
        }
      } else {
        name = evnt.target.name;
        values = evnt.target.value;
      }
    }

    const cardInput = [...cardData];
    cardInput[index][name] = values;
    setCardData(cardInput);
  };

  const handleSubmit = async () => {
    let data = cardData.filter(function (cardData) {
      return cardData.Name != "";
    });

    data?.map((el) => (el.NeedInFilter == 1 ? (el.TypeId = "4") : el.TypeId));

    let jsonstring = JSON.stringify(data);

    await postData(`/api/customField/edit`, {
      customfield: jsonstring,
      loginuserid: session.user.id,
    })
      .then((res) => {
        if (res.success) {
          toast.success("Custom Field status success!");
        } else {
          toast.error("Something Went Wrong");
        }
        setLoading(false);
      })
      .catch((error) => {
        setLoading(false);
      });
    window.location.reload();
  };

  useEffect(() => {
    setLoading(true);
    fetchData(`/api/customField/fetch`)
      .then((res) => {
        const responseData = res.customData;
        if (responseData.length !== 0) {
          setCardData(responseData);
        }
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);


  return (
    <div className="page-wrapper cardhead">
      <div className="content container-fluid">
        <form>
          <div className="card">
            <div className="card-body">
              <div className="add">
                <CustomFieldcard
                  cardData={cardData}
                  handleChange={handleChangeCard}
                />
                <button
                  type="button"
                  className="btn btn-outline-dark btn-sm pull-left mt-2"
                  onClick={addCard}
                >
                  <Plus height={"22px"} width={"22px"} />
                  Add CustomFields
                </button>
              </div>

              <div className="d-flex position-absolute bottom-0 end-0 mb-2 p-2">
                <button className="btn btn-secondary btn-sm me-1 mt-2">
                <Link href="/dashboard/product">Cancel</Link>
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn btn-primary btn-sm mx-2 mt-2"
                >
                  {" "}
                  Save
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductCustomForm;
