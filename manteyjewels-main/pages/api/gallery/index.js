import CategoryModel from "../../../models/category";
import ProductModel from "../../../models/product";
import dbConnect from "../../../utils/dbConnect";

const productItemField = {
  name: 1,
  slug: 1,
  image: 1,
  gallery: 1,
  unit: 1,
  unitValue: 1,
  price: 1,
  discount: 1,
  type: 1,
  variants: 1,
  quantity: 1,
  date: 1,
  review: 1,
  tags: 1,
};

export default async function apiHandler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const {
          category,
          subcategory,
          brands,
          minPrice,
          maxPrice,
          tags,
          parent,
        } = req.query;

        let tempArr = [];
        let selectProductType = [];
        if (!Array.isArray(tags) && tags) {
          if (parent !== "Product-Type") {
            tempArr = [{ label: parent, name: tags }];
          } else {
            selectProductType = [{ label: parent, name: tags }];
          }
        } else if (tags && Array.isArray(tags)) {
          tags.map((o, i) => {
            if (parent[i] !== "Product-Type") {
              tempArr.push({ label: parent[i], name: o });
            } else {
              selectProductType.push({ label: parent[i], name: o });
            }
          });
        }


        const categoryItems = await CategoryModel.find({});
        
        if (
          category ||
          subcategory ||
          brands ||
          (minPrice && maxPrice) ||
          tempArr.length > 0 ||
          selectProductType.length > 0
        ) {
          // console.log(selectProductType.find(el=> el.name === "New-Products"), "checkavailableornot")

          const args = [
            category ? { categories: category } : {},
            subcategory ? { "subcategories.value": subcategory } : {},
            brands ? { brand: brands } : {},
            selectProductType.find((el) => el.name === "New-Products")
              ? { new: true }
              : {},
            selectProductType.find((el) => el.name === "Featured-Products")
              ? { featured: true }
              : {},
            selectProductType.find((el) => el.name === "Clearence-Products")
              ? { clearance: true }
              : {},
            selectProductType.find((el) => el.name === "Best-Selling")
              ? { bestSelling: true }
              : {},
            selectProductType.find((el) => el.name === "Trending-Products")
              ? { trending: true }
              : {},
          ];


          let product = await ProductModel.find({
            $and: args,
          })
            .sort("-date")
            .select(productItemField)
            .exec();

          if (tempArr.length > 0) {
            product = product.filter((product1) => {
              if (product1.tags && Array.isArray(product1.tags)) {
                return tempArr.every((tempTag) =>
                  product1.tags.some(
                    (productTag) =>
                      tempTag.label === productTag.label &&
                      tempTag.name === productTag.name
                  )
                );
              }
              return false;
            });
          }

          product = product.filter(
            (el) => el.discount >= minPrice && el.discount <= maxPrice
          );

          res.status(200).json({
            product: product,
            product_length: product.length,
            category: categoryItems,
          });
        } else {
          const product = await ProductModel.find({})
            .sort("-date")
            .limit(8)
            .select(productItemField)
            .exec();
          const product_length = await ProductModel.estimatedDocumentCount();
          res.status(200).json({
            product: product,
            product_length: product_length,
            category: categoryItems,
          });
        }
      } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}
