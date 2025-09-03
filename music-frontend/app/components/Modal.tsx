import { X } from "lucide-react";
import { SetStateAction } from "react";

interface ModalProps {
    isModalOpen: boolean;
    setIsModalOpen: React.Dispatch<SetStateAction<boolean>>;
};

export default function Modal({ isModalOpen, setIsModalOpen }: ModalProps) {
    const handleOpen = () => {
        setIsModalOpen(!isModalOpen);
    }

    return (
        <div className={`${isModalOpen ? "" : "hidden"} fixed inset-0 z-50 flex items-center justify-center`}>
            <div className="fixed inset-0 bg-black/50" onClick={handleOpen}></div>
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 relative z-10">
                <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">How does it work?</h3>
                <button onClick={handleOpen} className="text-gray-400 hover:text-gray-600 cursor-pointer">
                    <X size={20} />
                </button>
                </div>
                <div className="p-4 flex flex-col gap-4 text-gray-700">
                    <p>This is a music discovery tool that fills itself with data as it is getting used.</p>
                    <p>When an artist is &quot;searched&quot; the website gets data from its neo4j database, if the
                        artist doesnt exist in the database the website will fetch information about the searched artist
                        aswell as other related artists and add them to the database.
                    </p>
                    <p>
                        After this is done the page will show you similar artists for you to discover.
                    </p>
                    <p>The data is gathered from several sources as Spotify, LastFM, ListenBrainz and MusicBrainz</p>
                </div>
            </div>
        </div>
    );
}