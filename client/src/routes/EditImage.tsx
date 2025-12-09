import { FaArrowLeft, FaCheck, FaPlus } from "react-icons/fa";
import { FaCircleXmark, FaX } from "react-icons/fa6";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router";
import TagType from '../../types/TagType';
import axios from "axios";

export default function EditImage() {
    const [title, setTitle] = useState('');
    const [source, setSource] = useState('');
    const [tagInput, setTagInput] = useState('');
    const [addedTags, setAddedTags] = useState<Array<TagType>>([]);
    const [addTag, setAddTag] = useState(false);
    const [allTags, setAllTags] = useState<Array<TagType> | null>(null);
    const [tagSearchResults, setTagSearchResults] = useState<Array<TagType>>([]);
    const navigate = useNavigate();
    const imageRef = useRef<HTMLImageElement | null>(null);

    useEffect(() => {
        const dropZone = document.querySelector('#drop-zone') as HTMLElement;
        const dropZoneContainer = document.querySelector('#drop-zone-container') as HTMLElement;
        const fileInput = document.querySelector('#add-image') as HTMLInputElement;
        const message = document.querySelector("#drop-zone-message") as HTMLElement;
        const clearBtn = document.querySelector("#clear-image") as HTMLElement;

        function assertIsNode(e: EventTarget | null): asserts e is Node {
            if (!e || !("nodeType" in e)) {
                throw new Error(`Node expected`);
            }
        }

        function isDragEvent(e: Event): e is DragEvent {
           return e.type === "drag";
        }
        
        function handleWindowDrop(event : DragEvent) {
            if ([...event.dataTransfer!.items].some((item) => item.kind === "file")) {
                event.preventDefault();
            }
        }

        function handleDragOver(event : DragEvent) {
            const fileItems = [...event.dataTransfer!.items].filter(
                (item) => item.kind === "file",
            );

            try {
                assertIsNode(event.target);
                
                if (fileItems.length > 0) {
                    event.preventDefault();
                    
                    if (!dropZone!.contains(event.target)) {
                        event.dataTransfer!.dropEffect = "none";
                    }
                }
            }
            catch (err) {
                console.log(err);
            }
        }

        function handleDropZone(event : Event) {
             if (isDragEvent(event)) {
                const fileItems = [...event.dataTransfer!.items].filter(
                    (item) => item.kind === "file",
                );
                if (fileItems.length > 0) {
                    event.preventDefault();
                    if (fileItems.some((item) => item.type.startsWith("image/"))) {
                        event.dataTransfer!.dropEffect = "copy";
                    } else {
                        event.dataTransfer!.dropEffect = "none";
                    }
                }
            }
        }

        function handleFileInput(event : Event) {
            const input = event.target as HTMLInputElement;
            
            console.log(input.files);
            if (input.files) {
                displayImage(input.files[0]);
            }
        }

        function handleClearButton() {
            if (imageRef.current) {
                URL.revokeObjectURL(imageRef.current.src);

                imageRef.current.removeAttribute('src');
                imageRef.current.removeAttribute('alt');
                imageRef.current.style.display = "none";

                if (message) {
                    clearBtn.style.display = "none";
                    message.style.display = "block";
                    dropZoneContainer.style.outlineStyle = "dashed";
                    dropZone.style.cursor = "pointer";
                    // Changing value so that the input event is fired even when picking the same image.
                    fileInput.value = "";
                    // Disabling file input since an image is currently displayed.
                    fileInput.disabled = false;
                }
            }
        }

        function displayImage(file : File | null) {
            if (file?.type.startsWith("image/")) {
                
                if (imageRef.current) {
                    imageRef.current.src = URL.createObjectURL(file);
                    imageRef.current.alt = file.name;
                    imageRef.current.style.display = "block";
                    
                    message.style.display = "none";
                    clearBtn.style.display = "block";
                    dropZoneContainer.style.outlineStyle = "none";
                    dropZone.style.cursor = "default";
                    fileInput.disabled = true;
                }
                
            }
        }

        function handleDrop(ev : Event) {
            if (ev instanceof DragEvent) {
                ev.preventDefault();
                const file = ev.dataTransfer!.items[0].getAsFile();
                displayImage(file);
            }
        }

        
        window.addEventListener('drop', handleWindowDrop);
        window.addEventListener('dragover', handleDragOver);
        clearBtn?.addEventListener("click", handleClearButton);
        dropZone?.addEventListener("dragover", handleDropZone);
        fileInput?.addEventListener('input', handleFileInput);
        dropZone?.addEventListener("drop", handleDrop);

        if (!allTags) {
            axios.get('http://localhost:3000/tags').then(res => {
                setAllTags(res.data);
            });
        }

        return () => {   
            window.addEventListener('drop', handleWindowDrop);
            window.addEventListener('dragover', handleDragOver); 
            clearBtn?.removeEventListener("click", handleClearButton); 
            dropZone?.removeEventListener('dragover', handleDropZone);
            fileInput?.removeEventListener('input', handleFileInput);
            dropZone?.removeEventListener("drop", handleDrop);
        }
    }, [allTags]);

    function handleSubmit() {
        if (imageRef.current?.src) {
            const bodyData = {
                title: title !== "" ? title : new Date(),
                source: source !== "" ? source : null,
                tags: addedTags
            }

            axios.post('http://localhost:3000/images/add', bodyData).then(res => {
                if (res.status === 200) {
                    navigate('/gallery');
                }
            })
        }
    }

    function handleAddTag() {
        setAddedTags([...addedTags, {title: tagInput, color: "#JFWKKF"}]);
        setTagInput("");
        setTagSearchResults([]);
    }


    function handleTagSearch(event : React.ChangeEvent<HTMLInputElement>) {
        setTagInput(event.target.value);
        
        const matchedTags = allTags?.filter(tag => tag.title.startsWith(tagInput));

        if (matchedTags && matchedTags.length > 0) {
            setTagSearchResults(matchedTags);
        }
        else {
            setTagSearchResults([]);
        }

    }

    function handleKeyDown(event : React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === "Enter" && tagInput !== "") {
            handleAddTag();
        }
    }

    return (
        <div className="flex flex-col p-4 gap-10 w-full h-full">
            <div className="flex w-full justify-between">
                <FaArrowLeft className="cursor-pointer" onClick={() => navigate("/gallery")} data-testid="cancel-image" size={20} scale={1} />
                <button className="cursor-pointer">Save Changes</button>
            </div>
            <div className="flex justify-around w-full">
                <div id="drop-zone-container" className="outline-dashed outline-black flex w-[800px] h-[584px]">
                    <div className="flex flex-col w-full items-center relative">
                        <label id="drop-zone" htmlFor="add-image" className="w-full h-full flex items-center justify-center absolute cursor-pointer">
                            <div id="drop-zone-message">Drag-and-drop image or click to choose file</div>
                            <input id="add-image" type="file" accept="image/*" />
                        </label>
                        <div id="preview-image" className="relative">  
                            <FaCircleXmark color="white" id="clear-image" className="hidden z-20 absolute top-3 right-3 cursor-pointer" size={20} scale={1}/>
                            <img ref={imageRef} src={undefined} className="w-full h-full object-fill" />
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-16">
                    <div className="flex flex-col gap-4">
                        <label htmlFor="title">Title</label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} id="title" className="w-[464px] h-[50px] rounded-full outline outline-black" />
                    </div>
                    <div className="flex flex-col gap-4">
                        <label htmlFor="title">Source</label>
                        <input value={source} onChange={(e) => setSource(e.target.value)} id="title" className="w-[464px] h-[50px] rounded-full outline outline-black" />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex gap-3">
                            <div>Tags</div>
                            <div className="flex flex-col relative">
                                <FaPlus onClick={() => setAddTag(true)} className={!addTag ? "cursor-pointer" : "hidden"} size={20} scale={1}/>
                                <div id="tag-input-container" className={addTag ? "flex flex-col" : "hidden"}>
                                    <div className="flex gap-6">
                                        <input value={tagInput} onChange={handleTagSearch} onKeyDown={handleKeyDown} placeholder="Enter tag here" multiple={false} className="w-[243px] h-[30px] rounded-full px-3 outline outline-black" />
                                        <div className="flex justify-between w-[60px]">
                                            <FaCheck data-testid="submit-tag" onClick={() => {setAddTag(false); handleAddTag()}} className="cursor-pointer" size={20} scale={1} />
                                            <FaX data-testid="cancel-tag" onClick={() => {setAddTag(false); setTagInput(""); setTagSearchResults([])}} className="cursor-pointer" size={20} scale={1} />
                                        </div>
                                    </div>
                                    <div className="flex flex-col outline outline-black w-[239px] h-[200px] p-4 gap-4 overflow-y-auto">
                                        <div>tag</div>
                                    </div>
                                </div>      
                            </div>
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}