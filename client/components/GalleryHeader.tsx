import {FaImage, FaTag} from 'react-icons/fa6'
import SearchBar from './SearchBar'
import { UserButton } from '@clerk/clerk-react'

interface GalleryHeaderProp {
    type: string | null
    handleImageClick: (id: string) => void
    handleGalleryType: () => void
    addQueryString: (query: string) => void
}

export default function GalleryHeader({type, handleImageClick, addQueryString, handleGalleryType} : GalleryHeaderProp) {
    return (
        <header className="flex w-full justify-between items-center">
            <div className="flex gap-5 items-center">
                <div className="text-[36px] font-bold">TagInspo</div>
                <div className="flex gap-8">
                    <FaImage onClick={() => handleGalleryType()} className={type === "image" ? "border-b-4 border-b-blue-300" : ""} size={20} scale={1} />
                    <FaTag onClick={() => handleGalleryType()} className={type === "tag" ? "border-b-4 border-b-green-300" : ""} size={20} scale={1} />
                </div>
            </div>
            <SearchBar handleImageClick={handleImageClick} addQueryString={addQueryString} />
            <UserButton></UserButton>
        </header>
    )
}