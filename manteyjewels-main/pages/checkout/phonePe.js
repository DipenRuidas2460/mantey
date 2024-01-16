import { useDispatch, useSelector } from "react-redux";
import { resetCart } from "~/redux/cart.slice";
import classes from "~/styles/payment.module.css";
import { postData } from "~/lib/clientFunctions";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import customId from "custom-id-new";

const PhonePeCheckout = () => {
  const url = `/api/checkout/phonePe`;
  const cartData = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const router = useRouter();

  const orderId = `R${customId({ randomLength: 4, upperCase: true })}`;
  
  const handleClick = async () => {
    await postData(url, {
      cartData: cartData,
      orderId: orderId,
    })
      .then((status) => {
        if (status.success) {
          router.push(status.data);
          dispatch(resetCart());
        } else {
          toast.error("Facing Issue, Please Try Again After Sometime.");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error(`Something Went Wrong ${err.message}`);
      });
  };

  return (
    <div className="layout_top">
      <div className={classes.container}>
        <h2 className={classes.h2}>Pay Now</h2>

        <button
          className="btn btn-warning"
          type="submit"
          instrumentResponse
          onClick={() => handleClick()}
        >
          Pay Now
        </button>
      </div>
    </div>
  );
};

PhonePeCheckout.footer = false;

export default PhonePeCheckout;
