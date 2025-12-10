import { useEffect, useState, useRef } from "react";
import { FaEllipsis } from "react-icons/fa6";

interface TagProp {
    id: string, 
    title: string, 
    color: string, 
    inEditImage: boolean, 
    removeTag: (id: string) => void
    editTagTitle: (id: string, title: string) => void
}


export default function Tag({id, title, color, inEditImage, removeTag, editTagTitle} : TagProp) {
    const [ellipsis, setEllipsis] = useState(false);
    const [edit, setEdit] = useState(false);
    const [options, setOptions] = useState(false);
    const [editInput, setEditInput] = useState("");
    const tagRef = useRef<HTMLDivElement | null>(null);
    const optionsRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => {
        function assertIsNode(e: EventTarget | null): asserts e is Node {
            if (!e || !("nodeType" in e)) {
                throw new Error(`Node expected`);
            }
        }

        function handleClickOutside(event: Event) {
            try {
                assertIsNode(event.target);
                if (tagRef.current && !tagRef.current.contains(event.target)) {
                    setEllipsis(false);
                }

                if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                    setOptions(false);
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
    }, [tagRef, optionsRef]);

    function handleKeyDown(event : React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter") {
            editTagTitle(id, editInput);
            setEditInput("");
            setEdit(false);
        }
    }

    return (
        <div ref={tagRef} onClick={() => {if (inEditImage) setEllipsis(true)}} className="text-center relative p-4" style={{color: color !== "" ? color : "white", 
        outline: color === "" ? "1px solid black" : ""}}>
            {
                edit ? <input value={editInput === "" ? title : editInput} onChange={(e) => setEditInput(e.target.value)} onKeyDown={handleKeyDown}/> : 
                <div>{title}</div> 
            }
            <FaEllipsis className="absolute top-0 right-2" onClick={() => setOptions(true)} style={{display: ellipsis ? 'block' : 'none'}}>
                <div style={{display: options ? 'flex' : 'none'}}>
                    <div className="flex flex-col gap-4">
                        <div onClick={() => setEdit(true)}>Edit</div>
                        <div onClick={() => removeTag(id)}>Delete</div>
                    </div>
                </div>
            </FaEllipsis>
        </div>
    )
}