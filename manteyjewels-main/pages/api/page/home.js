import customIdNew from "custom-id-new";
import s3DeleteFiles from "~/lib/s3Delete";
import sessionChecker from "~/lib/sessionPermission";
import pageModel from "../../../models/webpages";
import dbConnect from "../../../utils/dbConnect";

export default async function apiHandler(req, res) {
  const { method } = req;

  if (!(await sessionChecker(req, "pageSettings")))
    return res
      .status(403)
      .json({ success: false, message: "Access Forbidden" });

  await dbConnect();

  switch (method) {
    case "POST":
      try {
        const { query, body } = req;
        let pageData = await pageModel.findOne({});
        if (pageData === null) {
          pageData = new pageModel({ aboutPage: { content: "" } });
        }
        //Check Data Scope
        switch (query.scope) {
          case "carousel":
            const { title, subTitle, description, url, image } = body;
            const carouselData = {
              title,
              subTitle,
              description,
              url,
              image,
              id: customIdNew({ randomLength: 4, lowerCase: true }),
            };
            pageData.homePage.carousel.carouselData.push(carouselData);
            await pageData.save();
            break;

          case "background":
            const { background } = body;
            const arg =
              pageData.homePage.carousel.background[0].name !==
              background[0].name;
            if (arg) {
              const fileName = [
                { Key: pageData.homePage.carousel.background[0].name },
              ];
              await s3DeleteFiles(fileName);
            }
            pageData.homePage.carousel.background = background;
            await pageData.save();
            break;

          case "banners":
            const arg2 =
              pageData?.homePage?.banners?.banner1?.image[0]?.name !==
              body?.banner1?.image[0]?.name;

            const arg4 =
              pageData?.homePage?.banners?.banner2?.image[0]?.name !==
              body?.banner2?.image[0]?.name;

            const arg5 =
              pageData?.homePage?.banners?.banner3?.image[0]?.name !==
              body?.banner3?.image[0]?.name;

            if (arg2) {
              const fileName = [
                { Key: pageData?.homePage?.banners?.banner1?.image[0]?.name },
              ];
              await s3DeleteFiles(fileName);
            }

            if (arg4) {
              const fileName = [
                { Key: pageData?.homePage?.banners?.banner2?.image[0]?.name },
              ];
              await s3DeleteFiles(fileName);
            }

            if (arg5) {
              const fileName = [
                { Key: pageData?.homePage?.banners?.banner3?.image[0]?.name },
              ];
              await s3DeleteFiles(fileName);
            }

            const bannerData = {
              banner1: {
                title: body?.banner1?.title,
                subTitle: body?.banner1?.subTitle,
                description: body?.banner1?.description,
                url: body?.banner1?.url,
                image: body?.banner1?.image,
                hide: body?.banner1?.hide,
              },
              banner2: {
                title: body?.banner2?.title,
                subTitle: body?.banner2?.subTitle,
                description: body?.banner2?.description,
                url: body?.banner2?.url,
                image: body?.banner2?.image,
                hide: body?.banner2?.hide,
              },
              banner3: {
                title: body?.banner3?.title,
                subTitle: body?.banner3?.subTitle,
                description: body?.banner3?.description,
                url: body?.banner3?.url,
                image: body?.banner3?.image,
                hide: body?.banner3?.hide,
              },
            };
            pageData.homePage.banners = bannerData;
            await pageData.save();
            break;

          case "collectionOne":
            const collectionItem1 =
              pageData.homePage.collection1[query.dataScopeOne];

            const arg3 =
              collectionItem1.image[0] &&
              collectionItem1.image[0]?.name !== body.image[0].name;
            if (arg3) {
              const fileName1 = [{ Key: collectionItem1.image[0].name }];
              await s3DeleteFiles(fileName1);
            }

            const collection1Data = {
              title: body?.title,
              url: body?.url,
              image: body?.image,
            };

            pageData.homePage.collection1[query.dataScopeOne] = collection1Data;

            await pageData.save();
            break;

          case "collectionTwo":
            const collectionItem2 =
              pageData.homePage.collection2[query.dataScopeTwo];

            const arg7 =
              collectionItem2.image[0] &&
              collectionItem2.image[0].name !== body.image[0].name;
            if (arg7) {
              const fileName2 = [{ Key: collectionItem2.image[0].name }];
              await s3DeleteFiles(fileName2);
            }

            const collection2Data = {
              title: body?.title,
              url: body?.url,
              image: body?.image,
            };

            pageData.homePage.collection2[query.dataScopeTwo] = collection2Data;

            await pageData.save();
            break;

          case "collection1Hide":
            pageData.homePage.collection1.hide = body.hide;
            await pageData.save();
            break;
          
          case "collection2Hide":
            pageData.homePage.collection2.hide = body.hide;
            await pageData.save();
            break;
        
          default:
            return res.status(400).json({ success: false });
        }

        res.status(200).json({ success: true });
      } catch (err) {
        console.log(err);
        res.status(400).json({ success: false, err: err.message });
      }
      break;

    case "DELETE":
      try {
        const { query } = req;
        const pageData = await pageModel.findOne({});
        //Check Data Scope
        switch (query.scope) {
          case "carousel":
            const item = await pageData.homePage.carousel.carouselData.filter(
              (item) => item.id === query.id
            );
            const fileName = [{ Key: item[0].image[0].name }];
            await s3DeleteFiles(fileName);
            await pageModel.updateOne(
              {},
              {
                $pull: { "homePage.carousel.carouselData": { id: query.id } },
              }
            );
            res.status(200).json({ success: true });
            break;
          default:
            res.status(400).json({ success: false });
            break;
        }
      } catch (err) {
        console.log(err);
        res.status(400).json({ success: false, err: err.message });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}
