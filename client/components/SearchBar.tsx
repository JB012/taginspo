/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useRef, useState } from "react";
import { FaTag, FaImage, FaCircleXmark } from "react-icons/fa6"
import { RxTriangleDown } from "react-icons/rx";
import { assertIsNode } from "../utils/utils";
import type { TagType } from "../types/TagType";
import type { ImageType } from "../types/ImageType";
import useImages from "../utils/useImages";
import useTags from "../utils/useTags";
import { FaSearch } from "react-icons/fa";

interface SearchBarProp {
    handleImageClick: (id: string) => void
    addQueryString: (query: string) => void
}
export default function SearchBar({handleImageClick, addQueryString} : SearchBarProp) { 
    const [input, setInput] = useState(""); 
    const [searchType, setSearchType] = useState("tag");
    const [showList, setShowList] = useState(false);
    const [searchBarResults, setSearchBarResults] = useState<Array<ImageType | TagType>>([]);
    const [resultsView, setResultsView] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const listRef = useRef<HTMLDivElement|null>(null);
    const resultsRef = useRef<HTMLDivElement|null>(null);

    const imageQuery = useImages();
    const tagQuery = useTags();
    const images : ImageType[] = imageQuery.data;
    const tags : TagType[] = tagQuery.data;


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

                if (resultsRef.current && !resultsRef.current.contains(event.target)) {
                    setResultsView(false);
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

    const isImage = useCallback((image: any) : image is ImageType => {
        return images.includes(image);
    }, [images]);

    function isTag(tag: any) : tag is TagType {
        return tags.includes(tag);
    }

    const handleSearch = useCallback(() => {
        if (input) {
            addQueryString(input.trim().replace(' ', '&'));
            setInput('');
            setSearchBarResults([]);
        }
    }, [addQueryString, input]);

    useEffect(() => {
        function handleArrow(event : KeyboardEvent) {
            if (searchBarResults.length > 0 && event.key === "ArrowUp") {
                if (currentIndex > 0) {
                    const elem = searchBarResults[currentIndex - 1];
                    const divElem : HTMLElement | null = document.getElementById(`div-${isImage(elem) ? elem.image_id : elem.tag_id}`);

                    if (divElem) {
                        divElem.focus();
                    }

                    setCurrentIndex(currentIndex - 1);
                }
            }
            else if (searchBarResults.length > 0 && event.key === "ArrowDown") {
                if (currentIndex < searchBarResults.length - 1) {
                    const elem = searchBarResults[currentIndex + 1];
                    const divElem : HTMLElement | null = document.getElementById(`div-${isImage(elem) ? elem.image_id : elem.tag_id}`);

                    if (divElem) {
                        divElem.focus();
                    }

                    setCurrentIndex(currentIndex + 1);
                }
            }
            else if (event.key === "Enter") {
                if (searchBarResults.length > 0) {    
                    const elem = searchBarResults[currentIndex];
                    const divElem : HTMLElement | null = document.getElementById(`div-${isImage(elem) ? elem.image_id : elem.tag_id}`);
                    if (divElem) {
                        divElem.click();
                    }
                }
                else {
                    handleSearch();
                }
                
            }    
        }
        
        document.addEventListener('keydown', handleArrow);

        return () => document.removeEventListener('keydown', handleArrow);

    }, [currentIndex, handleSearch, isImage, searchBarResults, searchBarResults.length]);


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
            const words = input.split(' ');
            const recentWordinInput = words[words.length - 1];
            const filteredTags = tags.filter((tag) => tag.title.toLowerCase().startsWith(recentWordinInput.toLowerCase()));
            setSearchBarResults(filteredTags);
        }
        else {    
            const filteredImages = images.filter((image) => image.title.toLowerCase().startsWith(input.toLowerCase()));
            setSearchBarResults(filteredImages);   
        }
    }

    function handleTagClick(tagTitle : string) {
        const inputArr = input.split(" ");
        inputArr[inputArr.length - 1] = tagTitle;
        
        setInput(inputArr.join(' ') + ' ');
        setSearchBarResults([]);
        setCurrentIndex(0);
    }

    function handleSearchView(elem : ImageType | TagType, index : number) {
        if (isImage(elem)) {
            return (<div tabIndex={0} onClick={() => handleImageClick(elem.image_id)} id={`div-${elem.image_id}`} key={elem.image_id} className={`flex focus:outline-0 justify-between cursor-pointer p-1.5 ${currentIndex === index ? 'backdrop-brightness-95' : ''} hover:backdrop-brightness-95`}>
                        <div className="flex items-center gap-4">
                            <FaImage color="blue" size={20} scale={1} />
                            <div>{elem.title}</div>
                        </div>
                        <div>{`${elem.created_at.substring(5, 7)}\\${elem.created_at.substring(8, 10)}\\${elem.created_at.substring(0,4)}`}</div>
                    </div>)
        }
        else if (isTag(elem)) {
            return (<div tabIndex={0} onClick={() => handleTagClick(elem.title)} id={`div-${elem.tag_id}`} key={elem.tag_id} className={`flex justify-between focus:outline-0 cursor-pointer p-1.5 ${currentIndex === index ? 'backdrop-brightness-95' : ''}  hover:backdrop-brightness-95`}>
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
                <input value={input} onFocus={() => setResultsView(true)} onChange={(e) => handleInput(e.target.value)} className="flex outline outline-black rounded-full w-[600px] pl-20 pr-25 h-[39px]" />        
                <FaCircleXmark onClick={() => setInput("")} size={20} className="absolute right-15"/>
                <FaSearch onClick={() => handleSearch()} size={20} className="absolute right-5" />
                <div id="selected-option" className="absolute left-5 flex items-center gap-2">
                    <RxTriangleDown id="open-search-type-list" onClick={() => setShowList(!showList)} size={18} scale={1} />
                    <div ref={listRef} id="search-type-list" className={`flex ${searchType === "tag" ? "flex-col bg-green-300" : "flex-col-reverse bg-blue-300"} absolute left-5 -top-2 gap-5 p-2 rounded-full`}>
                        <FaTag onClick={() => handleSearchType()} color="green" className={searchType !== "tag" && !showList ? "hidden" : ""} size={18} scale={1}/>
                        <FaImage onClick={() => handleSearchType()} color="blue" className={searchType !== "image" && !showList ? "hidden" : ""} size={18} scale={1} />
                    </div>
                </div>
            </div>
            <div ref={resultsRef} className={!resultsView ? "hidden" : "absolute w-[600px] max-h-[200px] top-12 left-145 text-ellipsis overflow-x-hidden overflow-y-auto whitespace-nowrap bg-white shadow rounded-3xl flex flex-col"}>
                {
                    searchBarResults.length ? searchBarResults.map((elem, index) => handleSearchView(elem, index)) : ''
                }
            </div>
        </div>
    )
}