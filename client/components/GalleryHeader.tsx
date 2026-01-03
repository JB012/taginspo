import {FaImage, FaTag} from 'react-icons/fa6'
import SearchBar from './SearchBar'
import { UserButton } from '@clerk/clerk-react'
import { useState } from 'react'
import type { ImageType } from '../types/ImageType'
import type { TagType } from '../types/TagType'

interface GalleryHeaderProp {
    type: string | null
    images: Array<ImageType>
    tags: Array<TagType>
    handleGalleryType: () => void
}

export default function GalleryHeader({type, images, tags, handleGalleryType} : GalleryHeaderProp) {
    const [input, setInput] = useState("");
    const [searchBarResults, setSearchBarResults] = useState<Array<ImageType | TagType>>([]);

    function handleInput(input : string) {
        setInput(input);

        const filteredTags = tags.filter((tag) => tag.title.toLowerCase().includes(input.toLowerCase()));

        const filteredImages = images.filter((image) => {
            const result = image.title.toLowerCase().includes(input.toLowerCase());
            let matchesFilteredTag = false;

            for (const tagID of image.tagIDs) {
                if (filteredTags.find((tag) => tag.tag_id === tagID)) {
                    matchesFilteredTag = true;
                }
            }

            return result || matchesFilteredTag;
        });
    
        setSearchBarResults([...filteredImages, ...filteredTags]);

    }

    return (
        <header className="flex w-full justify-between items-center">
            <div className="flex gap-5 items-center">
                <div className="text-[36px] font-bold">TagInspo</div>
                <div className="flex gap-8">
                    <FaImage onClick={() => handleGalleryType()} className={type === "image" ? "border-b-4 border-b-cyan-300" : ""} size={20} scale={1} />
                    <FaTag onClick={() => handleGalleryType()} className={type === "tag" ? "border-b-4 border-b-cyan-300" : ""} size={20} scale={1} />
                </div>
            </div>
            <SearchBar input={input} handleInput={handleInput} />
            <UserButton></UserButton>
        </header>
    )
}