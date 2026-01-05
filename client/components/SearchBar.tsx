import { useEffect, useRef, useState } from "react";
import { FaTag, FaImage } from "react-icons/fa6"
import { RxTriangleDown } from "react-icons/rx";
import { assertIsNode } from "../utils/utils";

interface SearchBarProp {
    searchType: string
    input: string
    handleType: () => void
    handleInput: (userInput : string) => void
}

export default function SearchBar({searchType, input, handleType, handleInput} : SearchBarProp) {
    const [showList, setShowList] = useState(false);
    const listRef = useRef<HTMLDivElement|null>(null);

    function handleSearchType() {
        if (showList) {
            handleType();
            setShowList(false);
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

         document.addEventListener("mousedown", handleClickOutside);

        return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        };
        
    }, []);

    return (
        <div className="flex items-center relative">
            <input value={input} onChange={(e) => handleInput(e.target.value)} className="flex outline outline-black rounded-full w-[600px] px-20 h-[39px]" />        
            <div id="selected-option" className="absolute left-5 flex items-center gap-2">
                <RxTriangleDown id="open-search-type-list" onClick={() => setShowList(!showList)} size={18} scale={1} />
                <div ref={listRef} id="search-type-list" className={`flex ${searchType === "tag" ? "flex-col bg-green-300" : "flex-col-reverse bg-blue-300"} absolute left-5 -top-2 gap-5 p-2 rounded-full`}>
                    <FaTag onClick={() => handleSearchType()} color="green" className={searchType !== "tag" && !showList ? "hidden" : ""} size={18} scale={1}/>
                    <FaImage onClick={() => handleSearchType()} color="blue" className={searchType !== "image" && !showList ? "hidden" : ""} size={18} scale={1} />
                </div>
            </div>
        </div>
    )
}