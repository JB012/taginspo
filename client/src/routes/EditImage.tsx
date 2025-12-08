import { FaArrowLeft, FaCheck, FaPlus } from "react-icons/fa";
import { FaCircleXmark, FaX } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function EditImage() {
    const [tagInput, setTagInput] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const dropZone = document.querySelector('#drop-zone') as HTMLElement;
        const dropZoneContainer = document.querySelector('#drop-zone-container') as HTMLElement;
        const fileInput = document.querySelector('#add-image') as HTMLInputElement;
        const preview = document.querySelector("#preview-image");
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
             if (preview) {
                const img = preview.querySelector('img');

                if (img) {
                    URL.revokeObjectURL(img.src);
                    preview.removeChild(img);
                }

                
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
                const img = document.createElement("img");
                
                img.src = URL.createObjectURL(file);
                img.alt = file.name;

                img.style.width = "100%";
                img.style.height = "100%";
                img.style.objectFit = "fill";
                
                
                if (preview) {
                    preview.appendChild(img);

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

        return () => {   
            window.addEventListener('drop', handleWindowDrop);
            window.addEventListener('dragover', handleDragOver); 
            clearBtn?.removeEventListener("click", handleClearButton); 
            dropZone?.removeEventListener('dragover', handleDropZone);
            fileInput?.removeEventListener('input', handleFileInput);
            dropZone?.removeEventListener("drop", handleDrop);
        }
    }, []);
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
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-16">
                    <div className="flex flex-col gap-4">
                        <label htmlFor="title">Title</label>
                        <input id="title" className="w-[464px] h-[50px] rounded-full outline outline-black" />
                    </div>
                    <div className="flex flex-col gap-4">
                        <label htmlFor="title">Source</label>
                        <input id="title" className="w-[464px] h-[50px] rounded-full outline outline-black" />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex gap-3">
                            <div>Tags</div>
                            <div className="flex flex-col relative">
                                <FaPlus onClick={() => setTagInput(true)} className={!tagInput ? "cursor-pointer" : "hidden"} size={20} scale={1}/>
                                <div id="tag-input-container" className={tagInput ? "flex flex-col" : "hidden"}>
                                    <div className="flex gap-6">
                                        <input placeholder="Enter tag here" multiple={false} className="w-[243px] h-[30px] rounded-full px-3 outline outline-black" />
                                        <div className="flex justify-between w-[60px]">
                                            <FaCheck data-testid="submit-tag" onClick={() => setTagInput(false)} className="cursor-pointer" size={20} scale={1} />
                                            <FaX data-testid="cancel-tag" onClick={() => setTagInput(false)} className="cursor-pointer" size={20} scale={1} />
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