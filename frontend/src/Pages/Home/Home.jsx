import { useEffect, useRef, useState } from "react";
import { IoIosAddCircle, IoMdCloseCircle } from "react-icons/io";
import { MdChangeCircle } from "react-icons/md";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useFiles } from "../../Context/files";

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
    const unsupportedFiles = selectedFiles.filter(
      (file) => !supportedFormats.image.includes(file.type.split("/")[1]) &&
                !supportedFormats.pdf.includes(file.type.split("/")[1]) &&
                !supportedFormats.video.includes(file.type.split("/")[1])
    );

    if (unsupportedFiles.length > 0) {
      setError(`Unsupported file types: ${unsupportedFiles.map(file => file.name).join(", ")}`);
      return;
    }

    setFiles((prevFiles) => [...prevFiles, ...selectedFiles]);
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

  useEffect(() => {
    if (type === "annotate" && files.length > 0) {
      setFile(files);
      navigate("/PDF");
    }
  }, [type, files, setFile, navigate]);

  const convertToType = async () => {
    if (files.length === 0) {
      alert("Please select files to convert.");
      return;
    }
    if (!type) {
      alert("Please select a conversion type.");
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

      navigate("/thanks");
    } catch (error) {
      console.error("Error during file conversion:", error);
      alert("Failed to convert files. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600">
      <section className="bg-white shadow-2xl rounded-lg p-8 w-11/12 sm:w-8/12 md:w-6/12 lg:w-4/12 xl:w-3/12">
        <header>
          <h1 className="text-2xl font-bold mb-6 text-gray-800 text-center">
            Upload Your File
          </h1>
        </header>
        
        <h3 className="text-lg text-gray-700 text-center mb-4">Select Format:</h3>
        <div className="flex flex-col sm:flex-row items-center justify-center mb-6">
          <label
            htmlFor="uploadFile1"
            className="flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-md shadow hover:bg-blue-200 cursor-pointer transition"
          >
            <IoIosAddCircle className="text-2xl" /> Choose File
            <input
              type="file"
              id="uploadFile1"
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
          </label>
          <p className="my-2 sm:my-0 sm:mx-4 text-white">to</p>
          <select
            className="border border-gray-300 text-sm rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="flex items-center justify-between bg-gray-100 p-3 rounded-md shadow"
                >
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    onClick={() => removeFile(index)}
                    className="text-red-500 hover:text-red-600"
                  >
                    <IoMdCloseCircle className="text-lg" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={convertToType}
          className={`flex items-center justify-center mt-6 mx-auto bg-blue-500 hover:bg-blue-600 text-white text-sm md:text-base font-medium py-2 px-4 rounded-full shadow-lg transition ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          disabled={loading}
        >
          <MdChangeCircle className="mr-2 text-lg" />
          {loading ? "Processing..." : "Convert"}
        </button>
      </section>
    </main>
  );
}

export default Home;