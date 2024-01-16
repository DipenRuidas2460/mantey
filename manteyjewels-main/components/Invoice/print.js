import React from "react";
import { useSelector } from "react-redux";
import { decimalBalance } from "~/lib/clientFunctions";
import ImageLoader from "../Image";
import classes from "./print.module.css";

const InvoicePrint = ({ data }) => {
  const settings = useSelector((state) => state.settings);
  const currencySymbol = settings.settingsData.currency.symbol;

  let cgstIn = 0;
  let sgstIn = 0;
  let igstIn = 0;
  let utgstIn = 0;
  let cgstOut = 0;
  let sgstOut = 0;
  let igstOut = 0;
  let utgstOut = 0;

  const shippingState = data.shippingInfo.state.toLowerCase();
  let totalTaxIn, totalTaxOut;

  if (shippingState === "gujarat") {
    data.products.forEach((ele) => {
      cgstIn = cgstIn + (ele.price * ele.productTax.CGSTIN) / 100;
      sgstIn = sgstIn + (ele.price * ele.productTax.SGSTIN) / 100;
      igstIn = igstIn + (ele.price * ele.productTax.IGSTIN) / 100;
      utgstIn = utgstIn + (ele.price * ele.productTax.UTGSTIN) / 100;
    });

    totalTaxIn = cgstIn + sgstIn + igstIn + utgstIn;
  } else {
    data.products.forEach((ele) => {
      cgstOut = cgstOut + (ele.price * ele.productTax.CGSTOUT) / 100;
      sgstOut = sgstOut + (ele.price * ele.productTax.SGSTOUT) / 100;
      igstOut = igstOut + (ele.price * ele.productTax.IGSTOUT) / 100;
      utgstOut = utgstOut + (ele.price * ele.productTax.UTGSTOUT) / 100;
    });

    totalTaxOut = cgstOut + sgstOut + igstOut + utgstOut;
  }

  return (
    <div className={classes.confirmation}>
      <div className={classes.confirmation_heading}>
        {settings.settingsData.logo[0] && (
          <ImageLoader
            src={settings.settingsData.logo[0]?.url}
            width={166}
            height={60}
            alt={settings.settingsData.name}
            quality={100}
          />
        )}
        <h6>Order no# {data.orderId}</h6>
        <br />
      </div>
      <div className={classes.confirmation_body}>
        <h5>Delivery details</h5>
        <div className={classes.row}>
          <div>
            <h6>Delivery for</h6>
            <p>{data.billingInfo.fullName}</p>
            <p>Phone no : {data.billingInfo.phone}</p>
            <br />
            <h6>Address</h6>
            <p>{`${data.billingInfo.house} ${data.billingInfo.state} ${data.billingInfo.zipCode} ${data.billingInfo.country}`}</p>
          </div>
          <div>
            <h6>Delivery method</h6>
            <p>{data.deliveryInfo.type}</p>
            <br />
            <h6>Payment method</h6>
            <p>{data.paymentMethod}</p>
          </div>
        </div>
        <h5>Order summary</h5>
        <div className={classes.cart_item_list}>
          {data.products.map((item, index) => (
            <div className={classes.cart_item} key={index}>
              <div className={classes.cart_container}>
                <span className={classes.cart_disc}>
                  <b>{item.name}</b>
                  {/* {item.color.name && <span>Color: {item.color.name}</span>}
                  {item.attribute.name && (
                    <span>{`${item.attribute.for}: ${item.attribute.name}`}</span>
                  )} */}
                  <span>Qty: {item.qty}</span>
                  <span>
                    Price: {currencySymbol} {item.price}
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className={classes.confirmation_pay}>
          {totalTaxIn ? (
            <>
              <div>
                <span>Sub Total</span>
                <span>
                  {currencySymbol}{" "}
                  {decimalBalance(data.totalPrice - totalTaxIn)}
                </span>
              </div>
              <div>
                <span>Discount</span>
                <span>
                  {currencySymbol}{" "}
                  {decimalBalance(
                    data.totalPrice - (data.payAmount - data.deliveryInfo.cost)
                  )}
                </span>
              </div>
              <div>
                <span>CGST</span>
                <span>
                  {currencySymbol} {decimalBalance(cgstIn)}
                </span>
              </div>
              <div>
                <span>SGST</span>
                <span>
                  {currencySymbol} {decimalBalance(sgstIn)}
                </span>
              </div>
              <div>
                <span>IGST</span>
                <span>
                  {currencySymbol} {decimalBalance(igstIn)}
                </span>
              </div>
              <div>
                <span>UTGST</span>
                <span>
                  {currencySymbol} {decimalBalance(utgstIn)}
                </span>
              </div>
              <div>
                <span>Delivery Charge</span>
                <span>
                  {currencySymbol} {data.deliveryInfo.cost}
                </span>
              </div>
              <div>
                <span>Total</span>
                <span>
                  {currencySymbol} {decimalBalance(data.payAmount)}
                </span>
              </div>
            </>
          ) : (
            <>
              <div>
                <span>Sub Total</span>
                <span>
                  {currencySymbol}{" "}
                  {decimalBalance(data.totalPrice - totalTaxOut)}
                </span>
              </div>
              <div>
                <span>Discount</span>
                <span>
                  {currencySymbol}{" "}
                  {decimalBalance(
                    data.totalPrice - (data.payAmount - data.deliveryInfo.cost)
                  )}
                </span>
              </div>
              <div>
                <span>CGST</span>
                <span>
                  {currencySymbol} {decimalBalance(cgstOut)}
                </span>
              </div>
              <div>
                <span>SGST</span>
                <span>
                  {currencySymbol} {decimalBalance(sgstOut)}
                </span>
              </div>
              <div>
                <span>IGST</span>
                <span>
                  {currencySymbol} {decimalBalance(igstOut)}
                </span>
              </div>
              <div>
                <span>UTGST</span>
                <span>
                  {currencySymbol} {decimalBalance(utgstOut)}
                </span>
              </div>
              <div>
                <span>Delivery Charge</span>
                <span>
                  {currencySymbol} {data.deliveryInfo.cost}
                </span>
              </div>
              <div>
                <span>Total</span>
                <span>
                  {currencySymbol} {decimalBalance(data.payAmount)}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default InvoicePrint;
