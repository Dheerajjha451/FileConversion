import { useNavigate } from 'react-router-dom';
import { Button } from '@heroui/button';

function ThankYouPage() {
    const navigate = useNavigate();

    function onConvertAnother() {
        navigate("/");
    }

    return (
        <div className="relative flex flex-col items-center justify-center min-h-screen bg-cream text-center overflow-hidden">

            <div className="z-10">
                <h1 className="text-orange-500 text-4xl sm:text-5xl font-bold mb-6">THANK YOU</h1>
                <Button
                    onPress={onConvertAnother}
                    color='primary'
                >
                    Convert New File
                </Button>
            </div>
        </div>
    );
}

export default ThankYouPage;