import customId from "custom-id-new";
import sessionChecker from "~/lib/sessionPermission";
import { convertToSlug } from "../../../middleware/functions";
import attrModel from "../../../models/attributes";
import tagModel from "../../../models/tags";
import brandModel from "../../../models/brand";
import categoryModel from "../../../models/category";
import colorModel from "../../../models/colors";
import ProductModel from "../../../models/product";
import dbConnect from "../../../utils/dbConnect";
import { parseFormMultiple } from "../../../utils/parseForm";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function apiHandler(req, res) {
  const { method } = req;
  if (!(await sessionChecker(req, "product")))
    return res
      .status(403)
      .json({ success: false, message: "Access Forbidden" });

  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const category = await categoryModel.find({});
        const attribute = await attrModel.find({});
        const tag = await tagModel.find({});
        const color = await colorModel.find({});
        const brand = await brandModel.find({});
        const products = await ProductModel.find({});
        res.status(200).json({
          success: true,
          category,
          attribute,
          tag,
          color,
          brand,
          products,
        });
      } catch (err) {
        console.log(err);
        res.status(500).json({ success: false });
      }
      break;
    case "POST":
      try {
        const data = await parseFormMultiple(req);
        const {
          name,
          unit,
          unit_val,
          main_price,
          sale_price,
          description,
          short_description,
          type,
          category,
          subcategory,
          brand,
          qty,
          trending,
          new_product,
          best_selling,
          sku,
          color,
          attribute,
          tag,
          comboProducts,
          selectedAttribute,
          variant,
          displayImage,
          galleryImages,
          video_val,
          obj_val,
          featured_product,
          clearence_product,
          shipping,
          seo,
          customfield,
          productTax,
        } = data.field;

        const random = "P" + customId({ randomLength: 4, upperCase: true });
        const categories = await JSON.parse(category);
        const subcategories = await JSON.parse(subcategory);
        const image = await JSON.parse(displayImage);
        const gallery = await JSON.parse(galleryImages);
        const video = await JSON.parse(video_val);
        const obj = await JSON.parse(obj_val);
        const colors = await JSON.parse(color);
        const attributes = await JSON.parse(attribute);
        const tags = await JSON.parse(tag);
        const variants = await JSON.parse(variant);
        const shippingData = await JSON.parse(shipping);
        const seoData = await JSON.parse(seo);
        const customFieldData = await JSON.parse(customfield);
        const taxData = await JSON.parse(productTax);
        const combo = await JSON.parse(comboProducts);
        const discount = (main_price - (sale_price / 100) * main_price).toFixed(
          1
        );

        // console.log("combo:--", combo)

        let productData;
        if (type === "simple") {
          productData = {
            name: name.trim(),
            slug: convertToSlug(name, true),
            productId: random,
            unit: unit.trim(),
            unitValue: unit_val.trim(),
            price: main_price,
            discount,
            shortDescription: short_description.trim(),
            description,
            type,
            image,
            gallery,
            video,
            obj,
            categories,
            subcategories,
            brand: brand,
            quantity: qty,
            trending: trending ? true : false,
            new: new_product ? true : false,
            bestSelling: best_selling ? true : false,
            tags,
            sku,
            featured: featured_product ? true : false,
            clearence: clearence_product ? true : false,
            shipping: shippingData,
            seo: seoData,
            customfield: customFieldData,
            productTax: taxData,
          };
        } else if (type === "variable") {
          productData = {
            name: name.trim(),
            slug: convertToSlug(name, true),
            productId: random,
            unit: unit.trim(),
            unitValue: unit_val.trim(),
            price: main_price,
            discount,
            shortDescription: short_description.trim(),
            description,
            type,
            image,
            gallery,
            video,
            obj,
            categories,
            subcategories,
            brand: brand,
            trending: trending ? true : false,
            new: new_product ? true : false,
            bestSelling: best_selling ? true : false,
            tags,
            colors,
            attributes,
            variants,
            attributeIndex: selectedAttribute,
            featured: featured_product ? true : false,
            clearence: clearence_product ? true : false,
            shipping: shippingData,
            seo: seoData,
            customfield: customFieldData,
            productTax: taxData,
          };
        } else {
          productData = {
            name: name.trim(),
            slug: convertToSlug(name, true),
            productId: random,
            unit: unit.trim(),
            unitValue: unit_val.trim(),
            price: main_price,
            discount,
            shortDescription: short_description.trim(),
            description,
            type,
            image,
            gallery,
            video,
            obj,
            categories,
            subcategories,
            brand: brand,
            quantity: qty,
            trending: trending ? true : false,
            new: new_product ? true : false,
            bestSelling: best_selling ? true : false,
            tags,
            sku,
            comboProducts: combo,
            featured: featured_product ? true : false,
            clearence: clearence_product ? true : false,
            shipping: shippingData,
            seo: seoData,
            customfield: customFieldData,
            productTax: taxData,
          };
        }

        // console.log("productData:---", productData);

        await ProductModel.create(productData);
        res.status(200).json({ success: true });
      } catch (err) {
        console.log(err);
        res.status(400).json({ success: false });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}
