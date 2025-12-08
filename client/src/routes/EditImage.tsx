import { FaArrowLeft, FaCheck, FaPlus } from "react-icons/fa";
import { FaCircleXmark, FaX } from "react-icons/fa6";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";

export default function EditImage() {
    const [tagInput, setTagInput] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const dropZone = document.querySelector('#drop-zone');
        const dropZoneContainer = document.querySelector('#drop-zone-container') as HTMLElement;
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
        
        window.addEventListener('drop', (e) => {
            if ([...e.dataTransfer!.items].some((item) => item.kind === "file")) {
                e.preventDefault();
            }
        });

        window.addEventListener("dragover", (e) => {
            const fileItems = [...e.dataTransfer!.items].filter(
                (item) => item.kind === "file",
            );

            try {
                assertIsNode(e.target);
                
                if (fileItems.length > 0) {
                    e.preventDefault();
                    
                    if (!dropZone!.contains(e.target)) {
                        e.dataTransfer!.dropEffect = "none";
                    }
                }
            }
            catch (err) {
                console.log(err);
            }
        });

        dropZone?.addEventListener("dragover", (e) => {
            if (isDragEvent(e)) {
                const fileItems = [...e.dataTransfer!.items].filter(
                    (item) => item.kind === "file",
                );
                if (fileItems.length > 0) {
                    e.preventDefault();
                    if (fileItems.some((item) => item.type.startsWith("image/"))) {
                        e.dataTransfer!.dropEffect = "copy";
                    } else {
                        e.dataTransfer!.dropEffect = "none";
                    }
                }
            }
        });

        clearBtn?.addEventListener("click", () => {
            if (preview) {
                for (const img of preview.querySelectorAll("img")) {
                    URL.revokeObjectURL(img.src);
                    preview.removeChild(img);
                }

                
                if (message) {
                    clearBtn.style.display = "none";
                    message.style.display = "block";
                    dropZoneContainer.style.outlineStyle = "dashed";
                }
                
            }
        });

        function displayImage(file : File | null) {
            if (file?.type.startsWith("image/")) {
                const img = document.createElement("img");
                
                img.src = URL.createObjectURL(file);
                img.alt = file.name;

                img.style.width = "100%";
                img.style.height = "100%";
                img.style.objectFit = "fill";
                
                
                if (preview) {
                    const existingImage = preview.querySelector("img");

                    if (existingImage) {
                        preview.removeChild(existingImage);
                    }

                    preview.appendChild(img);

                    if (message) {
                        message.style.display = "none";
                    }

                    if (clearBtn) {
                        clearBtn.style.display = "block";
                    }

                    if (dropZoneContainer) {
                        dropZoneContainer.style.outlineStyle = "none";
                    }
                }
            }
        }

        function dropHandler(ev : Event) {
            if (ev instanceof DragEvent) {
                ev.preventDefault();
                const file = ev.dataTransfer!.items[0].getAsFile();
                displayImage(file);
            }
            
        }

        

        dropZone!.addEventListener("drop", dropHandler);

        return () => dropZone!.removeEventListener("drop", dropHandler);
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