import { useEffect, useState, useRef } from "react";
import { FaCheck, FaEllipsis, FaX } from "react-icons/fa6";
import {assertIsNode, hexToHSL} from '../utils/utils.ts';

interface TagProp {
    id: string, 
    title: string, 
    color: string, 
    addedTag: boolean, 
    tagResult: boolean,
    addQueryString?: (query: string) => void,
    removeTag?: (id: string) => void,
    editTag?: (id: string, title: string, color: string) => void,
    duplicateTag?: ( title : string, id?: string) => boolean,
    handleAddTag?: (title: string, color: string, edit: boolean, id?: string) => void,
}


export default function Tag({id, title, color, addedTag, tagResult,
    addQueryString, removeTag, editTag, duplicateTag, handleAddTag} : TagProp) {
    const [edit, setEdit] = useState(false);
    const [options, setOptions] = useState(false);
    const [editTitle, setEditTitle] = useState(title);
    const [editColor, setEditColor] = useState(color);
    const [colorLightness, setColorLightness] = useState(hexToHSL(color)?.l ?? 100);
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
        if (!duplicateTag?.(editTitle, id)) {        
            editTag!(id, editTitle, editColor);
            setEdit(false);
            setOptions(false);
        }
    }
    
    function handleCancel() {
        setEditTitle(title);
        setEditColor(color);
        setEdit(false);
    }

    function handleClick() {
        if (tagResult) {
            handleAddTag?.(title, color, false, id);
        }

        addQueryString?.(title);
    }

    function handleColorChange(event : React.ChangeEvent<HTMLInputElement>) {
        const changedColor = event.target.value;
        setEditColor(changedColor);

        const hsl = hexToHSL(changedColor);

        if (hsl && hsl.l) setColorLightness(hsl.l);
    }

    return (
        <div id="tag-container" onClick={() => handleClick()} ref={addedTag && edit ? tagRef : undefined} className="flex gap-1">
            <div className="text-center cursor-pointer rounded-full h-6 px-3" style={{backgroundColor: editColor, 
            outline: color === "#ffffff" ? "1px solid black" : "", color: "black"}}>
                {
                    edit ? 
                    <div className="flex gap-4">
                        <input id="title-input" style={{color: duplicateTag?.(id, editTitle) && editTitle !== title ? "red" : 
                            colorLightness < 60 ? "white" : "black"}} className="max-w-[100px]" placeholder="Edit tag title" 
                            value={editTitle} onChange={(e) => setEditTitle(e.target.value)} /> 
                        <input id="color-input" type="color" value={editColor} onChange={handleColorChange} />
                        <FaCheck fill={colorLightness < 60 ? "white" : "black"} data-testid="confirm-addtag" onClick={() => handleConfirm()} size={20} scale={1} />
                        <FaX fill={colorLightness < 60 ? "white" : "black"} data-testid="cancel-addtag" onClick={() => handleCancel()} size={20} scale={1} />
                    </div>
                    : 
                    <div style={{color: colorLightness < 60 ? "white" : "black"}}>{title}</div> 
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