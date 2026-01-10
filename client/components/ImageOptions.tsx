import { FaEllipsisH } from "react-icons/fa";
import { useNavigate } from "react-router";

interface ImageOptionsProp {
    optionsRef: {current: HTMLDivElement | null}
    imageOptions: boolean
    deletePopup: boolean
    imageID: string | undefined
    setImageOptions: (value: React.SetStateAction<boolean>) => void
    setDeletePopup: (value: React.SetStateAction<boolean>) => void
    handleDelete: () => void

}

export default function ImageOptions({optionsRef, imageOptions, deletePopup, imageID, setImageOptions, setDeletePopup, handleDelete} : ImageOptionsProp) {
    const navigate = useNavigate();

    return (
        <div className="relative" ref={optionsRef}>
            <FaEllipsisH onClick={() => setImageOptions(!imageOptions)} size={20} scale={20}/>
            <div className={imageOptions ? "flex flex-col absolute top-1 left-6 w-[110px] bg-white outline" : "hidden"}>
                <div onClick={() => {if (imageID) navigate(`http://localhost:5173/editimage/${imageID}`)}} className="cursor-pointer p-2">Edit Image</div>
                <hr />
                <div onClick={() => setDeletePopup(!deletePopup)} className="relative cursor-pointer p-2">
                    <div className="text-red-500">Delete Image</div>
                    <div className={deletePopup ? "flex flex-col absolute top-0 left-27.5 w-[200px] gap-4 p-4 bg-gray-100" : "hidden"}>
                        <div className="self-center">Are you sure you want to delete this image?</div>
                        <div className="flex px-5 justify-between">
                            <button className="flex grow justify-center text-red-500" onClick={() => handleDelete()} data-testid="confirm-delete">Yes</button>
                            <button className="flex grow justify-center" onClick={() => setDeletePopup(!deletePopup)} data-testid="cancel-delete">No</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}