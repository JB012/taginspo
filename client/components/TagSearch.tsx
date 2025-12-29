import { useEffect, useRef, useState } from "react";
import type { TagType } from '../types/TagType';
import { FaCheck, FaPlus } from "react-icons/fa";
import { FaX } from "react-icons/fa6";
import {assertIsNode} from '../utils/utils.ts';
import { v4 } from 'uuid';
import Tag from "./Tag.tsx";

interface TagSearchProp {
    allTags: Array<TagType> | null,
    duplicateTag: (title: string, id?: string) => boolean, 
    addTagToImage : (id: string, title: string, color: string) => void
}

export default function TagSearch({allTags, duplicateTag, addTagToImage} : TagSearchProp) {
    const [tagInput, setTagInput] = useState('');
    const [addTag, setAddTag] = useState(false);
    const [duplicateTagError, setDuplicateTagError] = useState(false);
    const [color, setColor] = useState('#ffffff');
    const [tagSearchResults, setTagSearchResults] = useState<Array<TagType>>([]);
    const tagResultsRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
         function handleClickOutside(event: Event) {
            try {
                assertIsNode(event.target);
                if (tagResultsRef.current && !tagResultsRef.current.contains(event.target)) {
                    tagResultsRef.current.style.display = "none";
                }

            }
            catch (err) {
                console.log(err);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        };

    }, []); 

    function handleAddTag(title: string, color: string, edit: boolean, id=v4()) {
        const hasDuplicate = edit ? !duplicateTag(title, id) : !duplicateTag(title);
        if (hasDuplicate) {
            if (title.trim()) {
                addTagToImage(id, title, color);    
                setTagInput("");
                setTagSearchResults([]);
                setAddTag(false);
            }
        }
        else {
            setDuplicateTagError(true);

            // Hiding display to view the error message
            if (tagResultsRef) {
                tagResultsRef.current!.style.display = "none";
            }
            
        }
    }

    

    function handleTagSearch(event : React.ChangeEvent<HTMLInputElement>) {
        setTagInput(event.target.value);

        if (duplicateTagError && event.target.value) {
            setDuplicateTagError(false);
        }

        if (allTags && allTags.length > 0) {
            const matchedTags = allTags.filter(tag => tag.title.toLowerCase().startsWith(event.target.value.toLowerCase()));

            if (matchedTags && matchedTags.length > 0) {
                setTagSearchResults(matchedTags);
            }
            else {
                setTagSearchResults([]);
            }
        }

    }

    function handleConfirm() {
        if (tagInput !== "") {
            setAddTag(false);
            handleAddTag(tagInput, color, true);
        }
    }

    function handleCancel() {
        setAddTag(false); 
        setTagInput(""); 
        setTagSearchResults([]);
    }

    return (
        <div className="flex flex-col relative">
            <FaPlus onClick={() => setAddTag(true)} className={!addTag ? "" : "hidden"} size={20} scale={1}/>
            <div id="tag-input-container" className={addTag ? "flex flex-col" : "hidden"}>
                <div className="flex gap-6">
                    <div className="flex gap-4">
                        <input value={tagInput} onChange={handleTagSearch} placeholder="Enter tag here" multiple={false} className="w-[243px] h-[30px] rounded-full px-3 outline outline-black" />
                        <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                    </div>
                    <div className="flex justify-between w-[60px]">
                        <FaCheck data-testid="submit-tag" onClick={() => handleConfirm()} size={20} scale={1} />
                        <FaX data-testid="cancel-tag" onClick={() => handleCancel()} size={20} scale={1} />
                    </div>
                </div>
                <div className={duplicateTagError ? "text-red-500" : "hidden"}> 
                    A tag with the same title has already been added.
                </div>
                <div ref={tagResultsRef} style={{display: tagSearchResults.length ? 'flex' : 'none'}} className="flex flex-col max-h-[200px] mt-8.5 z-10 bg-white fixed  outline outline-black w-[239px] p-4 gap-4 overflow-y-auto">
                    {
                        tagSearchResults.map((tag) => <Tag key={tag.tag_id} title={tag.title} id={tag.tag_id} color={tag.color} addedTag={false} tagResult={true} duplicateTag={duplicateTag} handleAddTag={handleAddTag}/>)
                    }
                </div>
            </div>      
        </div>
    )
}