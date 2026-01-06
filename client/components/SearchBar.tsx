import { useEffect, useRef, useState } from "react";
import { FaTag, FaImage } from "react-icons/fa6"
import { RxTriangleDown } from "react-icons/rx";
import { assertIsNode } from "../utils/utils";
import type { TagType } from "../types/TagType";
import type { ImageType } from "../types/ImageType";
import useImages from "../utils/useImages";
import useTags from "../utils/useTags";

export default function SearchBar() {    
    const [input, setInput] = useState("");
    const [searchType, setSearchType] = useState("tag");
    const [showList, setShowList] = useState(false);
    const [searchBarResults, setSearchBarResults] = useState<Array<ImageType | TagType>>([]);
    const [resultsView, setResultsView] = useState(false);
    const listRef = useRef<HTMLDivElement|null>(null);
    const resultsRef = useRef<HTMLDivElement|null>(null);

    const imageQuery = useImages();
    const tagQuery = useTags();
    const images : ImageType[] = imageQuery.data;
    const tags : TagType[] = tagQuery.data;

    function isImage(image: any) : image is ImageType {
        return images.includes(image);
    }

    function isTag(tag: any) : tag is TagType {
        return tags.includes(tag);
    }

    function numImagesforTag(tagID: string) {
        return images.filter((img) => img.tagIDs.includes(tagID)).length;
    }

    function handleSearchType() {
        if (showList) {
            setSearchType(searchType === "tag" ? "image" : "tag");
            setSearchBarResults([]);
            setShowList(false);
        }
    }
    
    function handleInput(input : string) {
        setInput(input);

        if (searchType === "tag") {
            const filteredTags = tags.filter((tag) => tag.title.toLowerCase().includes(input.toLowerCase()));
            setSearchBarResults(filteredTags);
        }
        else {    
            const filteredImages = images.filter((image) => image.title.toLowerCase().includes(input.toLowerCase()));
            setSearchBarResults(filteredImages);   
        }
    }

    useEffect(() => {
        function handleClickOutside(event: Event) {
            try {
                assertIsNode(event.target);
                
                // We need to prevent the toggler from being the event target so it's onClick event isn't overwritten
                const nodeName = event.target.nodeName;
                
                if (listRef.current && !listRef.current.contains(event.target)) {
                    if (!["svg", "path"].includes(nodeName)) {
                        setShowList(false);
                    }
                }
            }
            catch (err) {
                console.log(err);
            }
        }
;
        document.addEventListener("mousedown", handleClickOutside);

        return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        };
        
    }, []);

    function handleSearchView(elem : ImageType | TagType) {
        if (isImage(elem)) {
            return (<div className="flex justify-between cursor-pointer p-1.5 hover:backdrop-brightness-95">
                        <div className="flex items-center gap-4">
                            <FaImage color="blue" size={20} scale={1} />
                            <div>{elem.title}</div>
                        </div>
                        <div>{elem.created_at}</div>
                    </div>)
        }
        else if (isTag(elem)) {
            return (<div className="flex justify-between cursor-pointer p-1.5 hover:backdrop-brightness-95">
                        <div className="flex items-center gap-4">
                            <FaTag color={elem.color} strokeWidth={10} stroke={elem.color === "#ffffff" ? 'black' : undefined} size={20} scale={1} />
                            <div>{elem.title}</div>
                        </div>
                        <div className="text-gray-500">{`${numImagesforTag(elem.tag_id)} images`}</div>
                    </div>)
        }
    }

    return ( 
        <div className="flex flex-col">
            <div className="flex items-center relative">
                <input value={input} onFocus={() => setResultsView(true)} onBlur={() => setResultsView(false)} onChange={(e) => handleInput(e.target.value)} className="flex outline outline-black rounded-full w-[600px] pl-20 pr-5 h-[39px]" />        
                <div id="selected-option" className="absolute left-5 flex items-center gap-2">
                    <RxTriangleDown id="open-search-type-list" onClick={() => setShowList(!showList)} size={18} scale={1} />
                    <div ref={listRef} id="search-type-list" className={`flex ${searchType === "tag" ? "flex-col bg-green-300" : "flex-col-reverse bg-blue-300"} absolute left-5 -top-2 gap-5 p-2 rounded-full`}>
                        <FaTag onClick={() => handleSearchType()} color="green" className={searchType !== "tag" && !showList ? "hidden" : ""} size={18} scale={1}/>
                        <FaImage onClick={() => handleSearchType()} color="blue" className={searchType !== "image" && !showList ? "hidden" : ""} size={18} scale={1} />
                    </div>
                </div>
            </div>
            <div ref={resultsRef} className={!resultsView ? "hidden" : "absolute w-[600px] top-12 left-145 text-ellipsis overflow-hidden whitespace-nowrap bg-white shadow rounded-3xl flex flex-col"}>
                {
                    searchBarResults.length ? searchBarResults.map((elem) => handleSearchView(elem)) : input ? `No results for ${input}` : ''
                }
            </div>
        </div>
    )
}