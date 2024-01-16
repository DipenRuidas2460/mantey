import { Trash, Upload } from "@styled-icons/bootstrap";
import axios from "axios";
import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import ImageLoader from "../Image";
import classes from "./fileUpload.module.css";

const FileUpload = ({
  label,
  updateFilesCb,
  maxFileSizeInBytes,
  preSelectedFiles,
  resetCb,
  smallUi,
  filetype,
  callback = () => {},
  ...otherProps
}) => {
  const fileInputField = useRef(null);
  const [files, setFiles] = useState(preSelectedFiles || []);
  const [status, setStatus] = useState("");

  const handleFileAltChange = (value, index) => {
    let fileObject = {
      FileType: filetype,
      FileAlt: value,
      Index: index,
    };
    callback(fileObject);
  };

  useEffect(() => {
    if (resetCb === "reset") {
      setFiles([]);
    }
  }, [resetCb]);

  const handleUploadBtnClick = () => {
    fileInputField.current.click();
  };

  const addNewFilesLocal = async (file) => {
    try {
      setStatus("Uploading...");
      const data = new FormData();
      data.append("file", file);
      const resp = await axios({
        method: "post",
        url: "/api/fileupload/local",
        data: data,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }).then((res) => res.data);
      if (resp.success) {
        setStatus("");
        return {
          name: resp.name,
          url: resp.url,
        };
      } else {
        throw new Error("Something Went Wrong " + resp.err);
      }
    } catch (err) {
      setStatus(err.message);
    }
  };

  const addNewFilesS3 = async (file) => {
    try {
      setStatus("Uploading...");

      // get secure url from server
      const { name, imageurl, url } = await axios({
        method: "post",
        url: `/api/fileupload/s3?name=${file.name}&type=${file.type}`,
      }).then((res) => res.data);

      // post the image directly to the s3 bucket
      await axios({
        method: "put",
        url,
        headers: {
          "Content-Type": file.type,
        },
        data: file,
      });

      let imageUrl = url.split("?")[0];
      imageUrl = imageurl;
      if (imageUrl.length) {
        setStatus("");
        return {
          name,
          url: imageUrl,
        };
      }
      return null;
    } catch (err) {
      console.log(err);
      setStatus(err.message);
      return null;
    }
  };

  const callUpdateFilesCb = (files) => {
    updateFilesCb(files);
  };

  const handleNewFileUpload = async (e) => {
    try {
      if (!otherProps.multiple) {
        const { files: newFiles } = e.target;
        if (newFiles.length) {
          if (newFiles[0].size <= maxFileSizeInBytes) {
            let uploadedFile =
              process.env.NEXT_PUBLIC_LOCAL_FILE_SOURCE == "true"
                ? await addNewFilesLocal(newFiles[0])
                : await addNewFilesS3(newFiles[0]);
            if (uploadedFile) {
              if (!otherProps.multiple) {
                setFiles([uploadedFile]);
                callUpdateFilesCb([uploadedFile]);
              } else {
                setFiles([...files, uploadedFile]);
                callUpdateFilesCb([...files, uploadedFile]);
              }
            }
          } else {
            toast.warning(
              "File size is too large (Max 2mb for Image, Max 200mb for Video & Max 200mb for object file)"
            );
          }
        }
      } else {
        const { files: newFiles } = e.target;
        const uploadFunction =
          process.env.NEXT_PUBLIC_LOCAL_FILE_SOURCE == "true"
            ? addNewFilesLocal
            : addNewFilesS3;
        if (newFiles.length) {
          const promises = [];
          for (const file of newFiles) {
            if (file.size <= maxFileSizeInBytes) {
              promises.push(uploadFunction(file));
            } else {
              toast.error(
                `File (${file.name}) size is too large (Max 2mb for Image, Max 200mb for Video & Max 200mb for object file)`
              );
            }
            Promise.all(promises).then((res) => {
              if (res) {
                const uploadedFiles = res.filter(
                  (x) => x && x.url && x.url.length > 0
                );
                const updatedFileList = [...files, ...uploadedFiles];
                setFiles(updatedFileList);
                callUpdateFilesCb(updatedFileList);
              }
            });
          }
        }
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const removeFile = async (fileName) => {
    try {
      setStatus("Deleting...");
      const { success, err } = await axios({
        method: "DELETE",
        url: `/api/fileupload/${
          process.env.NEXT_PUBLIC_LOCAL_FILE_SOURCE == "true" ? "local" : "s3"
        }?name=${fileName}`,
      }).then((res) => res.data);
      if (success) {
        const filteredItem = files.filter((item) => item.name !== fileName);
        setFiles(filteredItem);
        callUpdateFilesCb(filteredItem);
      } else {
        toast.error(err);
      }
    } catch (err) {
      console.log(err);
      toast.error(`Something Went Wrong - ${err.message}`);
    }
    setStatus("");
  };

  return (
    <>
      <div
        className={
          smallUi ? classes.fileUploadContainer_sm : classes.fileUploadContainer
        }
      >
        <label className={classes.inputLabel}>{label}</label>
        <p className={classes.dragDropText}>
          Drag and drop your files anywhere or
        </p>
        <button
          className={classes.uploadFileBtn}
          type="button"
          onClick={handleUploadBtnClick}
        >
          <div>
            <Upload width={22} height={22} />
          </div>
          <span> Upload {otherProps.multiple ? "files" : "a file"}</span>
        </button>
        <input
          className={classes.formField}
          type="file"
          ref={fileInputField}
          onChange={handleNewFileUpload}
          title=""
          value=""
          {...otherProps}
        />
      </div>
      {status.length > 0 && <div className="text-danger my-2">{status}</div>}
      <div className={classes.filePreviewContainer}>
        <span>To Upload</span>
        <div className={classes.previewList}>
          {files?.map((file, index) => {
            return (
              <div className="d-flex col-lg-10" key={file.name + index}>
                {/\.(jpe?g|png|gif|svg|webp)$/i.test(file.name) ? (
                  <>
                    <label>
                      <div className={classes.previewContainer}>
                        <div className={classes.previewItem}>
                          <ImageLoader
                            className={classes.imagePreview}
                            src={file.url}
                            alt={file.altText}
                            width={100}
                            height={100}
                          />
                        </div>
                      </div>
                    </label>
                    <div className="col-sm-6" style={{ padding: "35px 40px" }}>
                      <input
                        type="text"
                        defaultValue={file.altText}
                        className="form-control"
                        onChange={(e) =>
                          handleFileAltChange(e.target.value, index)
                        }
                      />
                    </div>
                    <aside style={{ padding: "38px 1px" }}>
                      <Trash
                        width={18}
                        height={18}
                        className={classes.removeFileIcon}
                        onClick={() => removeFile(file.name)}
                      />
                    </aside>
                  </>
                ) : /\.(mp4|mov|gif|wmv|flv|avi|avchd|webm|mkv)$/i.test(
                    file.name
                  ) ? (
                  <>
                    <div className="d-flex">
                      <div style={{ marginRight: "10px" }}>{file.name}</div>
                      <aside>
                        <Trash
                          width={18}
                          height={18}
                          className={classes.removeFileIcon}
                          onClick={() => removeFile(file.name)}
                        />
                      </aside>
                    </div>
                  </>
                ) : /\.(obj)$/i.test(file.name) ? (
                  <>
                    <div className="d-flex">
                      <div style={{ marginRight: "10px" }}>{file.name}</div>
                      <aside>
                        <Trash
                          width={18}
                          height={18}
                          className={classes.removeFileIcon}
                          onClick={() => removeFile(file.name)}
                        />
                      </aside>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="d-flex">
                      <div style={{ marginRight: "10px" }}>{file.name}</div>
                      <aside>
                        <Trash
                          width={18}
                          height={18}
                          className={classes.removeFileIcon}
                          onClick={() => removeFile(file.name)}
                        />
                      </aside>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default FileUpload;
