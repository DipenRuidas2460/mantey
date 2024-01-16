import s3DeleteFiles from "~/lib/s3Delete";
import commonSettingModel from "~/models/commonSettings";
import dbConnect from "~/utils/dbConnect";
import { parseForm } from "~/utils/parseForm";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function apiHandler(req, res) {
  const { method } = req;
  await dbConnect();

  switch (method) {
    case "GET":
      try {
        const commonSettings = await commonSettingModel.findOne({});
        res.status(200).json({ success: true, commonSettings });
      } catch (err) {
        console.log(err);
        res.status(400).json({ success: false });
      }
      break;

    case "POST":
      try {
        const bodyData = await parseForm(req);
        const commonSettings = await commonSettingModel.findOne({});
        const sizeChartImage = await JSON.parse(bodyData.field.sizeChart);
        const orderSvgImage = await JSON.parse(bodyData.field.orderSvg);
        const shopDefaultImage = await JSON.parse(bodyData.field.shopDefault);

        const {
          ruleSettingOrdered,
          ruleSettingDelivered,
          shippingReturnTexture,
          careInstructionTexture,
          minPrice,
          maxPrice,
        } = bodyData.field;

        if (commonSettings) {
          if (
            commonSettings.sizeChart[0] &&
            commonSettings.sizeChart[0].name !== sizeChartImage[0].name
            ) {
              const fileName = [{ Key: commonSettings.sizeChart[0].name }];
              await s3DeleteFiles(fileName);
            }
            
            if (
                commonSettings.shopDefault[0] &&
                commonSettings.shopDefault[0].name !== shopDefaultImage[0].name
              ) {
                  const fileName = [{ Key: commonSettings.shopDefault[0].name }];
                  await s3DeleteFiles(fileName);
            }

            if (commonSettings.orderSvg) {
              if (
                commonSettings.orderSvg[0] &&
                commonSettings.orderSvg[0].name !== orderSvgImage[0].name
                ) {
                  const fileName = [{ Key: commonSettings.orderSvg[0].name }];
                  await s3DeleteFiles(fileName);
                }
              }
             
              commonSettings.ruleSettingOrdered = ruleSettingOrdered;
              commonSettings.ruleSettingDelivered = ruleSettingDelivered;
              commonSettings.shippingReturnTexture = shippingReturnTexture;
              commonSettings.careInstructionTexture = careInstructionTexture;
              commonSettings.sizeChart = sizeChartImage;
              commonSettings.orderSvg = orderSvgImage;
              commonSettings.shopDefault = shopDefaultImage;
              commonSettings.minPrice = minPrice;
              commonSettings.maxPrice = maxPrice;
              
          await commonSettings.save();
          return res.status(200).json({ success: true });
        } else {
          const settingData = {
            ruleSettingOrdered: ruleSettingOrdered,
            ruleSettingDelivered: ruleSettingDelivered,
            shippingReturnTexture: shippingReturnTexture,
            careInstructionTexture: careInstructionTexture,
            sizeChart: sizeChartImage,
            orderSvg: orderSvgImage,
            shopDefault: shopDefaultImage,
            minPrice: minPrice,
            maxPrice: maxPrice,
          };
          await commonSettingModel.create(settingData);
          return res.status(200).json({ success: true });
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
