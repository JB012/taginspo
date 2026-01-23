import {FaImage, FaTag} from 'react-icons/fa6'
import SearchBar from './SearchBar'
import { UserButton } from '@clerk/clerk-react'
import { useNavigate } from 'react-router'

interface GalleryHeaderProp {
    type: string | null
    handleImageClick: (id: string) => void
    handleGalleryType: () => void
    addQueryString: (query: string) => void
}

export default function GalleryHeader({type, handleImageClick, addQueryString, handleGalleryType} : GalleryHeaderProp) {
    const navigate = useNavigate();

    return (
        <header className="flex pt-1 w-full justify-between items-center">
            <div className="flex gap-5 items-center">
                <div onClick={() => navigate("http://localhost:5173")} className="text-[36px] cursor-pointer font-bold lg:block xxs:max-sm:hidden">TagInspo</div>
                <div className="flex gap-8 xxs:gap-4">
                    <FaImage onClick={() => handleGalleryType()} className={type === "image" ? "border-b-4 border-b-blue-300" : ""} size={20} scale={1} />
                    <FaTag onClick={() => handleGalleryType()} className={type === "tag" ? "border-b-4 border-b-green-300" : ""} size={20} scale={1} />
                </div>
            </div>
            <SearchBar handleImageClick={handleImageClick} addQueryString={addQueryString} />
            <UserButton></UserButton>
        </header>
    )
}