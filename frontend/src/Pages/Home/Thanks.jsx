import { useNavigate } from 'react-router-dom';

function ThankYouPage() {
    const navigate = useNavigate();

    function onConvertAnother() {
        navigate("/");
    }

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-cream text-center overflow-hidden">

            <div className="z-10">
                <h1 className="text-orange-500 text-4xl sm:text-5xl font-bold mb-6">THANK YOU</h1>
                <button
                    onClick={onConvertAnother}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-base sm:text-lg font-medium py-3 px-6 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                    Convert New File
                </button>
            </div>
        </div>
    );
}

export default ThankYouPage;
