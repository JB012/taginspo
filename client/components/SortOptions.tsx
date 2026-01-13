import { useEffect, useRef } from "react"
import { FaCheck } from "react-icons/fa"
import { assertIsNode } from "../utils/utils"

interface SortOptionsProp {
    viewSortOptions: boolean
    currentOption: string
    closeView: () => void
    handleChangeOption: (option : string) => void
}
export default function SortOptions({viewSortOptions, currentOption, handleChangeOption, closeView} : SortOptionsProp) {
    const sortOptionRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: Event) {
            try {
                assertIsNode(event.target);
                const nodeName = event.target.nodeName;
                
                if (sortOptionRef.current && !sortOptionRef.current.contains(event.target)) {
                    if (!["svg", "path"].includes(nodeName)) {
                        closeView();
                    }
                }

            }
            catch (err) {
                console.log(err);
            }
        }
        
        window.addEventListener('mousedown', handleClickOutside);

        return () => window.removeEventListener('mousedown', handleClickOutside);
    }, [closeView]);

    function handleOptionClick(option : string) {
        handleChangeOption(option);
        closeView()
    }
    return (
        <div ref={sortOptionRef} className={viewSortOptions ? "flex p-1 fixed right-24 bg-white flex-col gap-4 shadow" : "hidden"}>
            <div onClick={() => handleOptionClick('created_at')} className={`flex items-center cursor-pointer gap-2 ${currentOption === 'created_at' ? "backdrop-brightness-95" : ""}`}>
                <FaCheck size={12} className={currentOption === "created_at" ? "" : "hidden"} />
                <div>Last created</div>
            </div>
            <div onClick={() => handleOptionClick('edited_at')} className={`flex items-center cursor-pointer gap-2 ${currentOption === 'edited_at' ? "backdrop-brightness-95" : ""}`}>
                <FaCheck size={12} className={currentOption === "edited_at" ? "" : "hidden"} />
                <div>Last edited</div>
            </div>
            <div onClick={() => handleOptionClick('title')} className={`flex items-center cursor-pointer gap-2 ${currentOption === 'title' ? "backdrop-brightness-95" : ""}`}>
                <FaCheck size={12} className={currentOption === "title" ? "" : "hidden"} />
                <div>Title</div>
            </div>  
        </div>
    )
}