import { useNavigate } from 'react-router-dom';

function ThankYouPage() {
    const navigate = useNavigate();

    function onConvertAnother() {
        navigate("/");
    }

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 text-center overflow-hidden">
            <div className="z-10 p-8 bg-white bg-opacity-80 rounded-lg shadow-2xl">
                <h1 className="text-blue-500 text-4xl sm:text-5xl font-bold mb-6">THANK YOU</h1>
                <p className="text-gray-700 text-lg sm:text-xl mb-6">Your file has been successfully converted.</p>
                <button
                    onClick={onConvertAnother}
                    className="bg-blue-500 hover:bg-blue-600 text-white text-base sm:text-lg font-medium py-3 px-6 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                    Convert New File
                </button>
            </div>
        </div>
    );
}

export default ThankYouPage;