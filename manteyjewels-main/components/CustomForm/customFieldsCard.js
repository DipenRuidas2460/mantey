import { useState, useEffect } from "react";
import { TagsInput } from "react-tag-input-component";
import { fetchData, deleteData } from "~/lib/clientFunctions";
import { toast } from "react-toastify";

const CustomField = ({ cardData, handleChange }) => {
  const url = `/api/customField/customType/create`;
  const [type, setType] = useState([]);
  const [loading, setLoading] = useState(false);
  const [inputVisible, setInputVisible] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedDropdownIndex, setSelectedDropdownIndex] = useState([]); // dropdowns index
  const [selectedDropdownIndexFlag, setSelectedDropdownIndexFlag] = useState(
    []
  );
  const [selectedCheckedIndex, setSelectedCheckedIndex] = useState([]); // checkbox index
  const [selectedCheckedIndexFlag, setSelectedCheckedIndexFlag] = useState([]); // checkbox index flags

  useEffect(() => {
    //fordropdown values
    fetchData(url)
      .then((res) => {
        setLoading(false);
        setType(res.customType);
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);

  return cardData?.map((data, index) => {
    const {
      _id,
      Name,
      NeedInFilter,
      TypeId,
      Optionvalue,
      HideFieldLabel,
      Required,
    } = data;

    // split data of Optionvalues
    let splitValue;
    if (!Array.isArray(Optionvalue)) {
      splitValue = Optionvalue?.split(",");
    } else {
      splitValue = Optionvalue;
    }

    if (splitValue !== undefined) {
      if (
        splitValue[0] != "" &&
        splitValue[0] != null &&
        splitValue[0] != undefined
      ) {
        selectedItems[index] = splitValue;
      }
    }

    const handleItemChange = (evnt) => {
      selectedItems[index] = evnt;
      handleChange(index, selectedItems[index]);
    };

    const deleteCustomField = async () => {
      if (_id != undefined) {
        await deleteData(`/api/customField/delete?id=${_id}`)
          .then((data) =>
            data.success === true
              ? toast.success("Custom Feild Deleted Successfully")
              : toast.error("Something Went Wrong")
          )
          .catch((err) => {
            console.log(err);
            toast.error("Something Went Wrong");
          });
      }
      window.location.reload();
    };

    // handle for Dropdown
    const handleDropdown = (index, evnt) => {
      if (evnt.target.value === "2") {
        setSelectedDropdownIndex([...selectedDropdownIndex, index]);
        setSelectedDropdownIndexFlag([...selectedDropdownIndexFlag, true]);
        setInputVisible(true);
      } else {
        const selectedDropdownValueIndex = selectedDropdownIndex.indexOf(index);
        if (selectedDropdownValueIndex > -1) {
          setSelectedDropdownIndex(
            selectedDropdownIndex.filter((i) => i !== index)
          );
          setSelectedDropdownIndexFlag(
            selectedDropdownIndexFlag.filter(
              (_, i) => i !== selectedDropdownValueIndex
            )
          );
        }
        setInputVisible(true);
      }
    };

    // handel of Required field checkbox
    const handleChangeRequiredChatBox = (index, evnt) => {
      if (evnt.target.checked) {
        setSelectedCheckedIndex([...selectedCheckedIndex, index]);
        setSelectedCheckedIndexFlag([...selectedCheckedIndexFlag, true]);
        setInputVisible(true);
      } else {
        const selectedCheckedValueIndex = selectedCheckedIndex.indexOf(index);
        if (selectedCheckedValueIndex > -1) {
          setSelectedCheckedIndex(
            selectedCheckedIndex.filter((i) => i !== index)
          );
          setSelectedCheckedIndexFlag(
            selectedCheckedIndexFlag.filter(
              (_, i) => i !== selectedCheckedValueIndex
            )
          );
        }
        setInputVisible(true);
      }
    };

    return (
      <div className="card mb-2" key={index}>
        <div className="card-header">
          <h5 className="card-title mt-2">Custom Field {index + 1}</h5>
          {Object.keys(data).length > 0 ? (
            <button
              type="button"
              className="btn-close position-absolute top-0 end-0 p-3 mt-1"
              aria-label="Close"
              onClick={() => deleteCustomField()}
            />
          ) : (
            ""
          )}
        </div>
        <div className="card-body">
          <div className="row">
            <input type="hidden" name="Id" value={_id} />

            {/* Name */}
            <div className="col-sm-12 mt-2">
              <div className="form-group row">
                <label className="col-form-label col-md-2">
                  Name <span className="text-danger">*</span>
                </label>
                <div className="col-md-10">
                  <input
                    type="text"
                    className="form-control"
                    name="Name"
                    value={Name}
                    onChange={(evnt) => handleChange(index, evnt)}
                  />
                </div>
              </div>
            </div>

            {/* NeedInFilter */}
            <div className="col-sm-12 mt-4">
              <div className="form-group row">
                <label className="col-form-label col-md-2">
                  Need In Filter:
                </label>
                <div className="col-sm-9 col-md-9 pt-2 col-lg-10">
                  <input
                    className="form-check-input"
                    style={{ width: "1.25em", height: "1.25em" }}
                    type="checkbox"
                    checked={NeedInFilter == 1 ? true : false}
                    name="NeedInFilter"
                    onChange={(evnt) => {
                      handleChange(index, evnt);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* type */}
            <div className="col-sm-12 mt-4">
              <div className="form-group row">
                <label className="col-form-label col-md-2">Type</label>
                <div className="col-md-10">
                  <select
                    name="TypeId"
                    className="form-control custom_field_type"
                    value={TypeId}
                    onChange={(evnt) => {
                      handleDropdown(index, evnt);
                      handleChange(index, evnt);
                    }}
                  >
                    {NeedInFilter != 1 ? (
                      type?.map((option, ind) => (
                        <option value={option.Id} key={ind}>
                          {option.name}
                        </option>
                      ))
                    ) : (
                      <option value={"4"}>
                        {"Checkbox"}
                      </option>
                    )}
                  </select>
                  <div
                    key={index}
                    className={`${
                      (selectedDropdownIndexFlag.length > 0 &&
                        selectedDropdownIndex.includes(index) &&
                        selectedDropdownIndexFlag[
                          selectedDropdownIndex.indexOf(index)
                        ] === true) ||
                      TypeId == 2
                        ? ""
                        : "d-none"
                    }`}
                  >
                    <TagsInput
                      value={splitValue}
                      placeHolder="Enter Options..."
                      onChange={handleItemChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* hide field*/}
            <div className="col-sm-12 mt-4">
              <div className="form-group row">
                <label className="col-form-label col-md-2">
                  Hide Field Label:
                </label>
                <div className="col-sm-9 col-md-9 pt-2 col-lg-10">
                  <input
                    className="form-check-input"
                    style={{ width: "1.25em", height: "1.25em" }}
                    type="checkbox"
                    checked={HideFieldLabel == 1 ? true : false}
                    name="HideFieldLabel"
                    onChange={(evnt) => {
                      handleChange(index, evnt);
                    }}
                  />
                </div>
              </div>
            </div>

            {/* required */}
            <div className="col-sm-12 mt-4">
              <div className="form-group row">
                <label className="col-form-label col-md-2">Required</label>
                <div className="col-sm-9 col-md-9 pt-2 col-lg-10">
                  <input
                    className="form-check-input"
                    style={{ width: "1.25em", height: "1.25em" }}
                    type="checkbox"
                    name="Required"
                    checked={Required == 1 ? true : false}
                    onChange={(evnt) => {
                      handleChangeRequiredChatBox(index, evnt);
                      handleChange(index, evnt);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  });
};

export default CustomField;
