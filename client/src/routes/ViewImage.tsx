import { useAuth } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import axios from "axios"; 
import { FaX } from "react-icons/fa6";
import { FaArrowLeft, FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa";
import { assertIsNode, formatDateTime } from "../../utils/utils";
import type { TagType } from "../../types/TagType";
import Tag from "../../components/Tag";
import ImageOptions from "../../components/ImageOptions";
import { useQuery } from "@tanstack/react-query";
import type { ImageType } from "../../types/ImageType";

interface ViewImageProp {
    id: string | null
    clearID: () => void
    isFirstImage: (id: string | undefined) => boolean
    isLastImage: (id: string | undefined) => boolean
    deleteImage: (id: string) => void
    toPreviousImage: (currentID : string | undefined) => void
    toNextImage: (currentID : string | undefined) => void
    tagsToString: (tagIDs : string[]) => string
}

export default function ViewImage({id, clearID, isFirstImage, isLastImage, deleteImage, toPreviousImage, toNextImage, tagsToString} : ViewImageProp) {
    const imageQuery = useQuery({
        queryKey: ["image", id],
        queryFn: () => (id ? fetchImageByID(id) : null)
    });

    const tagQuery = useQuery({
        queryKey: ["tag", id],
        queryFn: () => (id ? fetchTagByID(id) : null)
    });

    const imageData : ImageType | null = imageQuery.data;
    const tags : TagType[] | null = tagQuery.data;
    const { getToken } = useAuth();
    const [imageOptions, setImageOptions] = useState(false);
    const [deletePopup, setDeletePopup] = useState(false);
    const [hideInfo, setHideInfo] = useState(false);
    const optionsRef = useRef<HTMLDivElement|null>(null);
    const leftRef = useRef<HTMLDivElement | null>(null);
    const rightRef = useRef<HTMLDivElement | null>(null);

    async function fetchImageByID(id: string) {
        const token = await getToken();
        const response = await axios.get(`http://localhost:3000/images/${id}`, 
        {headers: {Authorization: `Bearer ${token}`}});

        return response.data;
    }

    async function fetchTagByID(id: string) {
        const token = await getToken();
        const response = await axios.get(`http://localhost:3000/tags?imageID=${id}`, 
        {headers: {Authorization: `Bearer ${token}`}});

        return response.data;
    }

    useEffect(() => {
        function handleClickOutside(event: Event) {
            try {
                assertIsNode(event.target);

                if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                    setImageOptions(false);
                    setDeletePopup(false);
                }
            }
            catch (err) {
                console.log(err);
            }
        }

        window.addEventListener("mousedown", handleClickOutside);

        return () => window.removeEventListener("mousedown", handleClickOutside);
    }, []);


    useEffect(() => {
        function handleKeyDown(e : KeyboardEvent) {
            if (e.key === "Escape") {
                (document.querySelector('#close-view') as HTMLDivElement).click();
            }
            else if (e.key === "ArrowLeft") {
                (document.querySelector('#arrow-left') as HTMLDivElement).click();
            }
            else if (e.key === "ArrowRight") {
                (document.querySelector('#arrow-right') as HTMLDivElement).click();
            }
        }

        window.addEventListener('keydown', handleKeyDown);

        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    async function handleDelete() {
        const token = await getToken({skipCache: true});

        try {
            if (id) {
                await axios.delete(`http://localhost:3000/images/delete/${id}`, 
                {headers: {Authorization: `Bearer ${token}`}});
            
                setDeletePopup(false);
                deleteImage(id);
                closeView();
            }
        }
        catch (err) {
            console.log(err);
        }
    }
    
    function closeView() {
        clearID();
        setHideInfo(false);
    }

    function handleLeftArrowClick() {
       if (!isFirstImage(imageData?.image_id)) {
            toPreviousImage(imageData?.image_id);
        }
    }

    function handleRightArrowClick() {
        if (!isLastImage(imageData?.image_id)) {
            toNextImage(imageData?.image_id);
        }     
    }

    return (
        <div className={id ? "fixed bg-white self-center flex flex-col p-4 w-full h-full" : "hidden"}>
            <div className="flex justify-between">
                <div className="flex">
                    <div className="flex gap-4">
                        {
                            !hideInfo ? 
                            <FaEyeSlash onClick={() => setHideInfo(!hideInfo)} size={20} scale={1} /> :
                            <FaEye onClick={() => setHideInfo(!hideInfo)} size={20} scale={1} />
                        }
                        <ImageOptions optionsRef={optionsRef} imageOptions={imageOptions} 
                        deletePopup={deletePopup} imageID={imageData?.image_id} setImageOptions={setImageOptions} 
                        setDeletePopup={setDeletePopup} handleDelete={handleDelete}/>
                    </div>    
                </div>  
                <div className={hideInfo ? "hidden" : "pb-4"}>{imageData?.title}</div>
                <div id="close-view" onClick={() => closeView()}><FaX size={20} scale={1}/></div>
            </div> 
            <div className={`flex w-full h-full items-center justify-between`}>
                <div id="arrow-left" className="fixed top-1/2 left-4" ref={leftRef} onClick={() => handleLeftArrowClick()}>
                    <FaArrowLeft color={isFirstImage(imageData?.image_id) ? "gainsboro" : "black"} size={20} scale={1} />
                </div>
                <div className={`flex justify-center items-center flex-col gap-6 w-full h-full pb-12`}>
                    <div id="image-container" className="flex justify-center items-center w-[925px] h-[450px] md:w-[600px] md:h-[350px] xs:w-[300px] xs:h-[275px] xxs:w-[185px] xxs:h-[125px]">
                        <img id={imageData?.image_id} src={imageData?.url} alt={`${imageData?.title} ${tagsToString(imageData?.tagIDs ?? [])}`} className={`w-[925px] max-h-[450px] md:max-w-[600px] md:max-h-[350px] xs:max-w-[300px] xs:max-h-[275px] xxs:max-w-[185px] xxs:max-h-[125px] bg-amber-100`} />
                    </div>
                    <div className={hideInfo ? "hidden" : "flex justify-between"}>
                        <div className="flex flex-wrap py-4 w-[500px] gap-4">
                            {
                                tags ? tags.map((tag) => <Tag key={tag.tag_id} id={tag.tag_id} title={tag.title} color={tag.color} addedTag={false} tagResult={false} />) 
                                : ""
                            }
                        </div>
                        <div className="flex text-gray-400 flex-col gap-4 md:text-lg xxs:text-xs">
                            <div className={imageData?.created_at ? "self-end" : "hidden"}>Date Uploaded: {formatDateTime(imageData?.created_at)}</div>
                            <div className={imageData?.source ? "" : "hidden"}>Source: {imageData?.source}</div>
                        </div>
                    </div> 
                </div>
                <div id="arrow-right" className="fixed top-1/2 right-3" ref={rightRef} onClick={() => handleRightArrowClick()}>
                    <FaArrowRight color={isLastImage(imageData?.image_id) ? "gainsboro" : "black"} onClick={() => handleRightArrowClick()} size={20} scale={1}/>
                </div>
            </div>  
        </div>
    )
}