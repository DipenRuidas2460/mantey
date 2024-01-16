import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { fetchData } from "~/lib/clientFunctions";
import OrderSuccessPage from "./success/[id]";
import classes from "~/components/Checkout/checkout.module.css";

const PhopePeRedirect = () => {
  const [statusData, setStatusData] = useState("");
  const router = useRouter();
  const { merchantTransactionId, orderId } = router.query;

  const paymentStatus = () => {
    if (merchantTransactionId != undefined) {
      fetchData(
        `/api/checkout/phonePeCheckStatus?merchantTransactionId=${merchantTransactionId}`
      )
        .then((res) => {
          if (res.success) {
            if (res.data.data.state === "PENDING") {
              setTimeout(paymentStatus, 20000);
            } else {
              setStatusData(res.data);
            }
          } else {
            toast.error("Internal Server Error");
          }
        })
        .catch((err) => {
          console.error(err.message);
          toast.error("Something Went Wrong");
        });
    }
  };

  useEffect(() => {
    paymentStatus();
  }, [merchantTransactionId]);

  // console.log("statusData:-", statusData);

  return (
    <div className={classes.payment_related}>
      {statusData &&
        orderId &&
        (statusData.data.state === "COMPLETED" ? (
          <OrderSuccessPage orId={orderId} />
        ) : statusData.data.state === "PENDING" ? (
          <>
            <h1>PAYMENT PENDING....</h1>
          </>
        ) : statusData.data.state === "FAILED" ? (
          <h1>PAYMENT FAILED....</h1>
        ) : (
          <h1>SERVER ERROR PLEASE TRY AGAIN AFTER SOMETIMES....</h1>
        ))}
    </div>
  );
};

export default PhopePeRedirect;
