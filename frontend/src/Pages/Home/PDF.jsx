import { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
import { useFiles } from "../../Context/files";
import { MdChangeCircle, MdDelete } from "react-icons/md";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Button } from '@heroui/button';

function PDF() {
  const { files, setFile } = useFiles();
  const [numPages, setNumPages] = useState(null);
  const [pagesToKeep, setPagesToKeep] = useState([]); 
  const [loading, setLoading] = useState(false); // Add loading state
  const navigate = useNavigate();

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const togglePageKeep = (pageIndex) => {
    const pageNumber = pageIndex + 1;
    setPagesToKeep((prevPagesToKeep) =>
      prevPagesToKeep.includes(pageNumber)
        ? prevPagesToKeep.filter((page) => page !== pageNumber)
        : [...prevPagesToKeep, pageNumber]
    );
  };

  const removeFile = (indexToRemove) => {
    setFile((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
    navigate("/");
  };

  const handleEditPage = () => {
    setLoading(true); // Set loading to true when conversion starts
    axios
      .post(
        "api/v1/formatter/fetch",
        {
          file: files,
          type: "annotate",
          pages_to_keep: pagesToKeep,
        },
        {
          headers: {
            "Content-Type": "multipart/form-data", 
          },
          responseType: "blob",
        }
      )
      .then((res) => {
        const url = window.URL.createObjectURL(new Blob([res.data]));

        const link = document.createElement("a");
        link.href = url;

        const contentDisposition = res.headers["content-disposition"];
        let filename = "downloaded_file";
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (filenameMatch?.length > 1) {
            filename = filenameMatch[1];
          }
        }
        link.setAttribute("download", filename);

        document.body.appendChild(link);
        link.click();

        link.parentNode.removeChild(link);
        window.URL.revokeObjectURL(url);
        navigate("/thanks");
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false); // Set loading to false when conversion ends
      });
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100">
      <div className="w-full lg:w-3/4 p-4 overflow-auto bg-gray-200">
        {files &&
          files.length > 0 &&
          files.map((file, fileIndex) => (
            <div key={fileIndex} className="mb-6">
              <Document
                file={file}
                className="grid grid-cols-1 gap-4"
                onLoadSuccess={onDocumentLoadSuccess}
              >
                {Array.from(new Array(numPages), (el, pageIndex) => (
                  <div
                    key={`page_${pageIndex + 1}`}
                    className={`relative flex flex-col items-center bg-white rounded-lg shadow-md border ${
                      pagesToKeep.includes(pageIndex + 1) ? "border-blue-600" : "border-gray-300"
                    }`}
                  >
                    <Page
                      pageNumber={pageIndex + 1}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      className="mx-auto"
                      width={Math.min(window.innerWidth - 40, 800)} 
                    />
                    <div className="flex justify-between items-center w-full mt-2 px-4">
                      <Button
                        onClick={() => togglePageKeep(pageIndex)}
                        className={`px-4 py-2 text-white rounded-md ${
                          pagesToKeep.includes(pageIndex + 1)
                            ? "bg-blue-600 hover:bg-blue-700"
                            : "bg-gray-500 hover:bg-gray-600"
                        }`}
                      >
                        {pagesToKeep.includes(pageIndex + 1) ? "Remove" : "Keep"}
                      </Button>
                      <span className="text-sm text-gray-600">Page {pageIndex + 1}</span>
                    </div>
                  </div>
                ))}
              </Document>
              <Button
                onPress={() => removeFile(fileIndex)}
                className="mt-4"
                color="danger"
              >
                <MdDelete />
                Remove File
              </Button>
            </div>
          ))}
      </div>

      <div className="w-full lg:w-1/4 bg-gray-100 flex flex-col items-center py-6">
        <h1 className="text-lg font-bold text-gray-700">Edit PDF Pages</h1>
        <p className="text-sm text-gray-500 text-center px-4 mt-2">
          Select the pages you want to keep or remove from the document.
        </p>
        <div className="mt-auto mb-4">
          <Button
            onPress={handleEditPage}
            isLoading={loading}
            color="primary"
          >
            {!loading && <MdChangeCircle />} {/* Show icon when not loading */}
            <span>{loading ? "Processing..." : "Create"}</span> {/* Show loading text */}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PDF;