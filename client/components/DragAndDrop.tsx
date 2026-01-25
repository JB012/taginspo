import { useEffect } from "react";
import { FaCircleXmark } from "react-icons/fa6";
import {assertIsNode, isDragEvent} from '../utils/utils.ts';

interface DragAndDropProp {
    fileRef: {current: HTMLInputElement | null},
    imageRef: {current: HTMLImageElement | null},
    editImageURL?: string,
    setTitle: (value: React.SetStateAction<string>) => void,
    setSubmitable: (value: React.SetStateAction<boolean>) => void,
}


export default function DragAndDrop({fileRef, imageRef, editImageURL, setTitle, setSubmitable} : DragAndDropProp) {
    useEffect(() => {
        const dropZone = document.querySelector('#drop-zone') as HTMLElement;
        const dropZoneContainer = document.querySelector('#drop-zone-container') as HTMLElement;
        const fileInput = document.querySelector('#add-image') as HTMLInputElement;
        const message = document.querySelector("#drop-zone-message") as HTMLElement;
        const clearBtn = document.querySelector("#clear-image") as HTMLElement;

        
        
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

                setSubmitable(false);
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

                    setTitle(file.name.split(".")[0]);
                    setSubmitable(true);
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
    }, [imageRef, setSubmitable, setTitle]);

    return (
    <div id="drop-zone-container" className="outline-dashed outline-black flex w-[800px] h-[567px] xl:w-[600px] lg:w-[400px] xxs:w-[400px] xxs:h-[400px] xxs:self-center">
        <div className="flex flex-col w-full items-center relative">
            <label id="drop-zone" data-testid="drop-zone" htmlFor="add-image" className="w-full h-full flex items-center justify-center absolute cursor-pointer">
                <div id="drop-zone-message">Drag-and-drop image or click to choose file</div>
                <input className={editImageURL ? "hidden" : ""} ref={fileRef} id="add-image" type="file" name="file" accept="image/*" />
            </label>
            <div id="preview-image" className="relative">  
                <FaCircleXmark color="white" id="clear-image" data-testid="clear-image" className={"hidden z-20 absolute top-3 right-3"} size={20} scale={1}/>
                <img ref={imageRef} src={editImageURL ? editImageURL : undefined} className="w-full h-full object-fill" />
            </div>
        </div>
    </div>
    )
}