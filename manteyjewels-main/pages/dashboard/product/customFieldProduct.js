import dynamic from "next/dynamic";
const CustomForm = dynamic(() =>
  import("~/components/CustomForm/customFormCard"),
);

const NewCustomProduct = () => {
  return <CustomForm />;
};

NewCustomProduct.requireAuthAdmin = true;
NewCustomProduct.dashboard = true;

export default NewCustomProduct;
