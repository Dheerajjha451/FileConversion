import { useEffect, useRef, useState } from "react";
import { IoIosAddCircle, IoMdCloseCircle } from "react-icons/io";
import { MdChangeCircle } from "react-icons/md";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useFiles } from "../../Context/files";
import { toast } from "sonner";
import { Button } from '@heroui/button';

const supportedFormats = {
  image: ["jpeg", "png", "heic", "tiff", "bmp", "gif", "webp"],
  pdf: ["pdf", "annotate"],
  video: ["mp4", "avi", "mov", "mkv"],
};

function Home() {
  const [files, setFiles] = useState([]);
  const [type, setType] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { setFile } = useFiles();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    // File Size Limit - 100 Megabytes
    const maxFileSize = 100 * 1024 * 1024;
    const largeFiles = [];

    const MIMEtypes = {
      // video
      "video/mp4": "mp4",
      "video/x-matroska": "mkv",
      "video/quicktime": "mov",
      "video/x-msvideo": "avi",

      // images
      "image/jpeg": "jpeg",
      "image/png": "png",
      "image/heic": "heic",
      "image/tiff": "tiff",
      "image/bmp": "bmp",
      "image/gif": "gif",
      "image/webp": "webp"
    };

    const unsupportedFiles = selectedFiles.filter(
      (file) => {
        const fileType = MIMEtypes[file.type] || file.type.split("/")[1];
        if (!supportedFormats.image.includes(fileType) &&
          !supportedFormats.pdf.includes(fileType) &&
          !supportedFormats.video.includes(fileType)) {
          return true;
        }
        if (file.size > maxFileSize) {
          largeFiles.push(file.name);
          return false;
        }
        return false;
      }
    );

    if (unsupportedFiles.length > 0) {
      setError(`Unsupported file types: ${unsupportedFiles.map(file => file.name).join(", ")}`);
      toast.error(`Unsupported file types: ${unsupportedFiles.map(file => file.name).join(", ")}`);
      return;
    }

    if (largeFiles.length > 0) {
      setError(`File size too large: ${largeFiles.join(", ")}. Maximum allowed size is 100MB.`);
      toast.error(`File size too large: ${largeFiles.join(", ")}. Maximum allowed size is 100MB.`);
      return;
    }

    setFiles((prevFiles) => [...prevFiles, ...selectedFiles.filter(file => file.size <= maxFileSize)]);
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
  };

  const handleTypeChange = (e) => {
    setType(e.target.value);
  };

  const FileExtension = (fileName) => {
    return fileName.split('.').pop();
  };

  useEffect(() => {
    if (type === "annotate" && files.length > 0) {
      setFile(files);
      navigate("/PDF");
    }
  }, [type, files, setFile, navigate]);

  const convertToType = async () => {
    if (files.length === 0) {
      toast.error("Please select files to convert.");
      return;
    }
    if (!type) {
      toast.error("Please select a conversion type.");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    files.forEach((file) => formData.append("file[]", file));
    formData.append("type", type);

    try {
      const response = await axios.post("/api/v1/formatter/fetch", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        responseType: "blob",
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      const contentDisposition = response.headers["content-disposition"];
      let filename = "converted_file";
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?(.+)"?/);
        if (match?.[1]) {
          filename = match[1];
        }
      }
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("File converted successfully!");
      navigate("/thanks");
    } catch (error) {
      console.error("Error during file conversion:", error);
      toast.error("Failed to convert files. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-cream">
      <section className="bg-white shadow-xl rounded-lg p-6 w-11/12 sm:w-8/12 md:w-6/12 lg:w-4/12 xl:w-3/12">
        <header>
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 text-gray-700 text-center">
            Upload Your File
          </h1>
        </header>

        <h3 className="text-xl text-gray-600 text-center sm:text-left">Format:</h3>
        <div className="flex flex-col sm:flex-row items-center mt-4 sm:ml-32 md:ml-0">
          <label
            htmlFor="uploadFile1"
            className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-md shadow hover:bg-gray-200 cursor-pointer transition"
          >
            <IoIosAddCircle className="text-xl text-gray-500" /> Choose File
            <input
              type="file"
              id="uploadFile1"
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
          </label>
          <p className="my-2 sm:my-0 sm:mx-4">to</p>
          <select
            className="border border-gray-300 text-sm rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
            onChange={handleTypeChange}
          >
            <option value="">Select Format</option>
            <optgroup label="Image">
              <option value="jpeg">JPEG</option>
              <option value="png">PNG</option>
              <option value="heic">HEIC</option>
              <option value="tiff">TIFF</option>
              <option value="bmp">BMP</option>
              <option value="gif">GIF</option>
              <option value="webp">WEBP</option>
            </optgroup>
            <optgroup label="PDF">
              <option value="pdf">PDF</option>
              <option value="annotate">Annotate</option>
            </optgroup>
            <optgroup label="Video">
              <option value="mp4">MP4</option>
              <option value="avi">AVI</option>
              <option value="mov">MOV</option>
              <option value="mkv">MKV</option>
            </optgroup>
          </select>
        </div>

        {error && (
          <div className="text-red-600 text-sm mt-4 text-center">{error}</div>
        )}

        {files.length > 0 && (
          <div className="mt-6">
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li
                  key={index}
                  className="relative flex flex-col items-center justify-between bg-gray-100 p-3 rounded-md shadow"
                >
                  <Button
                    onPress={() => removeFile(index)}
                    isIconOnly
                    color="danger"
                    className="absolute top-2 right-2"
                    style={{ width: '25px', height: '25px' }}
                  >
                    <IoMdCloseCircle className="text-lg" />
                  </Button>
                  <span className="text-sm text-center">
                    {file.name}
                  </span>
                  <span className="text-sm text-gray-700 flex items-center">
                    <span>{FileExtension(file.name)}</span>
                    <span> &rarr;</span>
                    <span>{type}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <Button
          onPress={convertToType}
          className={`flex items-center justify-center mt-6 mx-auto bg-orange-500 hover:bg-orange-600 text-white text-sm md:text-base font-medium py-2 px-4 rounded-full shadow-lg transition ${loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          isLoading={loading}
        >
          {!loading ? <MdChangeCircle className="text-xl mr-2" /> : null}
          {loading ? "Processing..." : "Convert"}
        </Button>
      </section>
    </main>
  );
}

export default Home;