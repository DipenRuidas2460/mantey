import React, { useCallback, useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import c from "../Shop/Sidebar/sidebarList.module.css";

const MultiRangeSlider = ({ min, max, callMinPrice, callMaxPrice }) => {
  const [minVal, setMinVal] = useState(min);
  const [maxVal, setMaxVal] = useState(max);
  const minValRef = useRef(min);
  const maxValRef = useRef(max);
  const range = useRef(null);

  useEffect(() => {
    callMinPrice({ name: "minPrice", value: min })
    callMaxPrice({ name: "maxPrice", value: max });
  }, []);

  const minPriceHandler = (e) => {
    const value = Math.min(Number(e.target.value), maxVal - 1);
    setMinVal(value);
    minValRef.current = value;
    callMinPrice({ name: "minPrice", value: value });
  };

  const maxPriceHandler = (e) => {
    const value = Math.max(Number(e.target.value), minVal + 1);
    setMaxVal(value);
    maxValRef.current = value;
    callMaxPrice({ name: "maxPrice", value: value });
  };

  // Convert to percentage
  const getPercent = useCallback(
    (value) => Math.round(((value - min) / (max - min)) * 100),
    [min, max]
  );

  // Set width of the range to decrease from the left side
  useEffect(() => {
    const minPercent = getPercent(minVal);
    const maxPercent = getPercent(maxValRef.current);

    if (range.current) {
      range.current.style.left = `${minPercent}%`;
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [minVal, getPercent]);

  // Set width of the range to decrease from the right side
  useEffect(() => {
    const minPercent = getPercent(minValRef.current);
    const maxPercent = getPercent(maxVal);

    if (range.current) {
      range.current.style.width = `${maxPercent - minPercent}%`;
    }
  }, [maxVal, getPercent]);

  return (
    <div className={c.container}>
      <input
        type="range"
        min={min}
        max={max}
        value={minVal}
        onChange={(e) => minPriceHandler(e)}
        className={c.thumb_left}
        style={{ zIndex: minVal > max - 100 && "5" }}
      />
      <input
        type="range"
        min={min}
        max={max}
        value={maxVal}
        onChange={(e) => maxPriceHandler(e)}
        className={c.thumb_right}
      />

      <div className={c.slider}>
        <div className={c.slider__track} />
        <div ref={range} className={c.slider__range} />
        <div className={c.slider__left_value}>
          <strong>Rs. {minVal}</strong>
        </div>
        <div className={c.slider__right_value}>
          <strong>Rs. {maxVal}</strong>
        </div>
      </div>
    </div>
  );
};

MultiRangeSlider.propTypes = {
  min: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
};

export default MultiRangeSlider;
