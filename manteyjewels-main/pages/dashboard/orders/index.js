/* eslint-disable react-hooks/exhaustive-deps */
import { Eye, Trash } from "@styled-icons/bootstrap";
import dynamic from "next/dynamic";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import useSWR from "swr";
import classes from "~/components/tableFilter/table.module.css";
import {
  cpf,
  dateFormat,
  deleteData,
  fetchData,
  postData,
  updateData,
} from "~/lib/clientFunctions";

const DataTable = dynamic(() => import("react-data-table-component"));
const FilterComponent = dynamic(() => import("~/components/tableFilter"));
const GlobalModal = dynamic(() => import("~/components/Ui/Modal/modal"));
const Spinner = dynamic(() => import("~/components/Ui/Spinner"));

const OrderPage = () => {
  const url = `/api/order`;
  const refundApiUrl = `/api/checkout/phonePeRefund`;
  const { data, error, mutate } = useSWR(url, fetchData);
  const [orderList, setOrderList] = useState([]);
  const [newOrderId, setNewOrderId] = useState("");
  useEffect(() => {
    if (data && data.order) {
      setOrderList(data.order);
    }
  }, [data, data?.order?.paymentStatus]);
  const { t } = useTranslation();

  const decimalBalance = (num) => Math.round(num * 10) / 10;

  const settings = useSelector((state) => state.settings);
  const currencySymbol = settings.settingsData.currency.symbol;

  const [isOpen, setIsOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState("");

  const { session } = useSelector((state) => state.localSession);
  const [permissions, setPermissions] = useState({});
  useEffect(() => {
    setPermissions(cpf(session, "order"));
  }, [session]);

  const openModal = (id) => {
    setSelectedOrder(id);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const deleteOrder = async () => {
    setIsOpen(false);
    await deleteData(`/api/order?id=${selectedOrder}`)
      .then((data) =>
        data.success
          ? (toast.success("Order Deleted Successfully"), mutate())
          : toast.error("Something Went Wrong")
      )
      .catch((err) => {
        console.log(err);
        toast.error("Something Went Wrong");
      });
  };

  const handlePaymentStatus = async (e, orderStatus, id) => {
    const url = `/api/order/${id}?payment_status=${e.target.value}&order_status=${orderStatus}&action=payment`;
    await updateData(url)
      .then((data) => {
        if (data.success) {
          toast.success("Order Payment Status Updated Successfully"), mutate();
          window.location.reload();
        } else {
          toast.error("Something Went Wrong");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something Went Wrong");
      });
  };

  const handleOrderStatus = async (e, paymentStatus, id) => {
    const url = `/api/order/${id}?payment_status=${paymentStatus}&order_status=${e.target.value}&action=order`;
    await updateData(url)
      .then((data) => {
        if (data.success) {
          toast.success("Order Status Updated Successfully"), mutate();
        } else {
          toast.error("Something Went Wrong");
        }
      })
      .catch((err) => {
        console.log(err);
        toast.error("Something Went Wrong");
      });
  };

  const handlePaymentRefund = async () => {
    if (newOrderId) {
      await postData(refundApiUrl, {
        orderId: newOrderId,
      })
        .then((status) => {
          if (status.success) {
            toast.success("Payment Refund is Successful!");
            window.location.reload();
          } else {
            toast.error(`Refund Failed!`);
            console.log(status.data);
          }
        })
        .catch((err) => {
          toast.error(`Something Went Wrong ${err.message}`);
          console.log(err);
        });
    }
  };

  const [filterText, setFilterText] = React.useState("");
  const [resetPaginationToggle, setResetPaginationToggle] =
    React.useState(false);
  const filteredItems = orderList.filter(
    (item) =>
      item.orderId &&
      item.orderId.toLowerCase().includes(filterText.toLowerCase())
  );

  const subHeaderComponentMemo = React.useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle);
        setFilterText("");
      }
    };
    return (
      <FilterComponent
        onFilter={(e) => setFilterText(e.target.value)}
        onClear={handleClear}
        filterText={filterText}
        placeholder={t("tracking_number")}
      />
    );
  }, [filterText, resetPaginationToggle]);

  const columns = [
    {
      name: t("tracking_number"),
      selector: (row) => (
        <>
          {row.orderId}
          {row.new && (
            <span className="badge rounded-pill bg-primary ms-1">NEW</span>
          )}
        </>
      ),
      minWidth: "218px",
    },
    {
      name: t("order_date"),
      selector: (row) => dateFormat(row.orderDate),
      sortable: true,
      wrap: true,
      minWidth: "90px",
    },
    {
      name: t("amount"),
      selector: (row) => currencySymbol + decimalBalance(row.payAmount),
      sortable: true,
      minWidth: "90px",
    },
    {
      name: t("payment_status"),
      selector: (row) =>
        permissions.edit ? (
          <div className="dropdown">
            <select
              value={row.paymentStatus}
              onChange={(e) => handlePaymentStatus(e, row.status, row._id)}
              disabled={
                row.paymentStatus === "Refunded" || row.paymentStatus === "Paid"
                  ? true
                  : false
              }
            >
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
              <option value="Refund-Pending">Refund-Pending</option>
            </select>
          </div>
        ) : (
          row.paymentStatus.toUpperCase()
        ),
      minWidth: "160px",
    },
    {
      name: t("delivery_status"),
      selector: (row) =>
        permissions.edit ? (
          <div className="dropdown">
            <select
              defaultValue={row.status}
              onChange={(e) => handleOrderStatus(e, row.paymentStatus, row._id)}
              disabled={row.status === "Delivered" ? true : false}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Delivered">Delivered</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>
        ) : (
          row.status.toUpperCase()
        ),
      minWidth: "130px",
    },
    {
      name: t("Refund Status"),
      selector: (row) =>
        row.paymentStatus === "Paid" ? (
          <>
            <button
              type="button"
              className="btn btn-warning"
              data-bs-toggle="modal"
              data-bs-target="#exampleModal"
              onClick={() => setNewOrderId(row.orderId)}
            >
              Refund
            </button>
          </>
        ) : (
          ""
        ),
      minWidth: "90px",
    },
    {
      name: t("action"),
      selector: (row) => (
        <div>
          {permissions.delete && (
            <div className={classes.button} onClick={() => openModal(row._id)}>
              <Trash width={22} height={22} title="DELETE" />
            </div>
          )}
          {permissions.view && (
            <Link href={`/dashboard/orders/${row._id}`}>
              <div className={classes.button}>
                <Eye width={22} height={22} title="VIEW" />
              </div>
            </Link>
          )}
        </div>
      ),
      minWidth: "140px",
    },
  ];

  const customStyles = {
    rows: {
      style: {
        minHeight: "92px",
        fontSize: "15px",
      },
    },
    headCells: {
      style: {
        fontSize: "15px",
      },
    },
  };

  return (
    <>
      {error ? (
        <div className="text-center text-danger">failed to load</div>
      ) : !data ? (
        <Spinner />
      ) : (
        <div>
          <h4 className="text-center pt-3 pb-5">{t("orders")}</h4>
          <div className={classes.container}>
            <DataTable
              columns={columns}
              data={filteredItems}
              pagination
              paginationResetDefaultPage={resetPaginationToggle}
              subHeader
              subHeaderComponent={subHeaderComponentMemo}
              persistTableHead
              customStyles={customStyles}
            />
            <GlobalModal
              isOpen={isOpen}
              handleCloseModal={closeModal}
              small={true}
            >
              <div className={classes.modal_icon}>
                <Trash width={90} height={90} />
                <p>Are you sure, you want to delete?</p>
                <div>
                  <button
                    className={classes.danger_button}
                    onClick={() => deleteOrder()}
                  >
                    Delete
                  </button>
                  <button
                    className={classes.success_button}
                    onClick={() => closeModal()}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </GlobalModal>

            <div
              className="modal fade"
              id="exampleModal"
              tabIndex="-1"
              aria-labelledby="exampleModalLabel"
              aria-hidden="true"
            >
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <button
                      type="button"
                      className="btn-close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                    ></button>
                  </div>
                  <div className="modal-body">
                    <strong>Are You Sure To Refund Payment</strong>
                  </div>
                  <div className="modal-footer">
                    <button
                      type="button"
                      className="btn btn-success"
                      data-bs-dismiss="modal"
                      onClick={handlePaymentRefund}
                    >
                      Refund
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger"
                      data-bs-dismiss="modal"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

OrderPage.requireAuthAdmin = true;
OrderPage.dashboard = true;

export default OrderPage;
