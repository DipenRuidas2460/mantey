import customId from "custom-id-new";
import sessionChecker from "~/lib/sessionPermission";
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const region = process.env.STORAGE_AWS_REGION;
const bucketName = process.env.STORAGE_AWS_BUCKET_NAME;
// const accessKeyId = process.env.STORAGE_AWS_ACCESS_KEY_ID;
// const secretAccessKey = process.env.STORAGE_AWS_SECRET_ACCESS_KEY;
const domainName = process.env.STORAGE_AWS_S3_DOMAIN;

const createPresignedUrlWithClient = async ({ region, bucket, key }) => {
  const client = new S3Client({ region });
  const command = new PutObjectCommand({ Bucket: bucket, Key: key });
  return getSignedUrl(client, command, { expiresIn: 3600 });
};

export default async function apiHandler(req, res) {
  const { method } = req;
  if (!(await sessionChecker(req, "general")))
    return res
      .status(403)
      .json({ success: false, message: "Access Forbidden" });

  switch (method) {
    case "POST":
      try {
        const { query } = req;
        // console.log("query:--", query)
        const imageName =
          customId({ randomLength: 7, lowerCase: true }) + query.name;
        const s3Params = {
          region,
          bucket: bucketName,
          key: imageName,
        };
        const url = await createPresignedUrlWithClient(s3Params);
        res.status(200).json({ success: true, name: imageName, url, imageurl: (domainName + imageName)});
      } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, err: err.message });
      }
      break;

    case "DELETE":
      try {
        const { query } = req;
        const client = new S3Client({});
        const command = new DeleteObjectCommand({
          Bucket: bucketName,
          Key: query.name,
        });
        await client.send(command);
        res.status(200).json({ success: true, err: null });
      } catch (err) {
        console.log(err);
        res.status(500).json({ success: false, err: err.message });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}
