import { useEffect, useState, useRef } from "react";
import { FaCheck, FaEllipsis, FaX } from "react-icons/fa6";
import {assertIsNode} from '../utils/utils.ts';

interface TagProp {
    id: string, 
    title: string, 
    color: string, 
    addedTag: boolean, 
    tagResult: boolean,
    removeTag?: (id: string) => void,
    editTag?: (id: string, title: string, color: string) => void,
    duplicateTag?: (id: string, title : string) => boolean,
    handleAddTag?: (title: string, color: string, edit: boolean, id?: string) => void,
}


export default function Tag({id, title, color, addedTag, tagResult,
    removeTag, editTag, duplicateTag, handleAddTag} : TagProp) {
    const [edit, setEdit] = useState(false);
    const [options, setOptions] = useState(false);
    const [editTitle, setEditTitle] = useState(title);
    const [editColor, setEditColor] = useState(color);
    const optionsRef = useRef<HTMLDivElement | null>(null);
    const tagRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function handleClickOutside(event: Event) {
            try {
                assertIsNode(event.target);

                if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                    setOptions(false);
                }

                if (tagRef.current &&  !tagRef.current.contains(event.target)) {
                    setEdit(false);
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
    }, [optionsRef]);

    function handleConfirm() {
        if (!duplicateTag?.(id, editTitle)) {        
            editTag!(id, editTitle, editColor);
            setEdit(false);
            setOptions(false);
        }
    }
    
    function handleClick() {
        if (tagResult) {
            handleAddTag?.(title, color, false, id);
        }
    }

//TODO: Get out of edit mode when clicking out of component
    return (
        <div onClick={() => handleClick()} ref={addedTag && edit ? tagRef : undefined} className="flex gap-1">
            <div className="text-center cursor-pointer rounded-full h-6 px-3" style={{backgroundColor: color, 
            outline: color === "#ffffff" ? "1px solid black" : "", color: "black"}}>
                {
                    edit ? 
                    <div className="flex gap-4">
                        <input id="title-input" style={{color: duplicateTag?.(id, editTitle) && editTitle !== title ? "red" : "black"}} className="max-w-[100px]" placeholder="Edit tag title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} /> 
                        <input id="color-input" type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} />
                        <FaCheck data-testid="confirm-addtag" onClick={() => handleConfirm()} size={20} scale={1} />
                        <FaX data-testid="cancel-addtag" onClick={() => setEdit(false)} size={20} scale={1} />
                    </div>
                    : 
                    <div>{title}</div> 
                }
                
            </div>
            <FaEllipsis onClick={() => setOptions(!options)} style={{display: addedTag && !options ? 'block' : 'none'}} />
            <div ref={optionsRef} style={{display: options ? 'flex' : 'none'}} className="flex-col outline outline-black">
                <div id="edit-button" className="p-2 cursor-pointer" onClick={() => {setEdit(true); setOptions(false)}}>Edit</div>
                <hr />
                <div className="p-2 cursor-pointer" onClick={() => removeTag!(id)}>Delete</div>
            </div>
        </div>
    )
}