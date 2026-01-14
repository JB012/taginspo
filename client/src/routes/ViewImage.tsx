import { useAuth } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import axios from "axios"; 
import { FaX } from "react-icons/fa6";
import { FaArrowLeft, FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa";
import { assertIsNode } from "../../utils/utils";
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
}


// TODO: Arrow keys
export default function ViewImage({id, clearID, isFirstImage, isLastImage, deleteImage, toPreviousImage, toNextImage} : ViewImageProp) {
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
    const [searchParams, setSearchParams] = useSearchParams();
    const { getToken } = useAuth();
    const [imageOptions, setImageOptions] = useState(false);
    const [deletePopup, setDeletePopup] = useState(false);
    const [hideInfo, setHideInfo] = useState(false);
    const optionsRef = useRef<HTMLDivElement|null>(null);
    const leftRef = useRef<HTMLDivElement | null>(null);
    const rightRef = useRef<HTMLDivElement | null>(null);
    const imgRef = useRef<HTMLImageElement | null>(null);

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
        function handleArrowMouseDown(e : Event) {
            try {
                assertIsNode(e.target);

                if (leftRef.current && imgRef.current && leftRef.current.contains(e.target) ||
                    rightRef.current && imgRef.current && rightRef.current.contains(e.target)) {
                    imgRef.current.style.display = "none";
                    imgRef.current.style.opacity = "0%";
                }
            }
            catch(e) {
                console.log(e);
            }
        }

        window.addEventListener('mousedown', handleArrowMouseDown);

        return () => window.removeEventListener('mousedown', handleArrowMouseDown);
    }, []);

     useEffect(() => {
        function handleArrowMouseUp(e : Event) {
            try {
                assertIsNode(e.target);

                if (leftRef.current && imgRef.current && leftRef.current.contains(e.target) ||
                    rightRef.current && imgRef.current && rightRef.current.contains(e.target)) {
                    imgRef.current.style.display = "block";
                    imgRef.current.style.opacity = "100%";
                }
            }
            catch(e) {
                console.log(e);
            }
        }

        window.addEventListener('mouseup', handleArrowMouseUp);

        return () => window.removeEventListener('mouseup', handleArrowMouseUp);
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
        searchParams.delete("id");
        setSearchParams(searchParams);
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
        <div className={id ? "absolute bg-white self-center flex flex-col p-4 w-full h-full" : "hidden"}>
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
                <FaX onClick={() => closeView()} size={20} scale={1}/>
            </div> 
            <div className={`flex w-full h-full items-center justify-between`}>
                <div ref={leftRef} onClick={() => handleLeftArrowClick()}><FaArrowLeft color={isFirstImage(imageData?.image_id) ? "gainsboro" : "black"} size={20} scale={1} /></div>
                <div className={`flex items-center flex-col gap-6 ${hideInfo ? " w-full h-full" : ""}`}>
                    <img ref={imgRef} id={imageData?.image_id} src={imageData?.url} alt={imageData?.title} className={`${hideInfo ? "fixed top-1/8 " : ""}w-[900px] h-[450px] transition-all delay-175 origin-center transition-discrete`} />
                    <div className={hideInfo ? "hidden" : "flex w-full justify-between"}>
                        <div className="flex flex-col">
                            <div>Tags:</div>
                            <div className="flex flex-wrap py-4 w-[500px] gap-4">
                                {
                                    tags ? tags.map((tag) => <Tag key={tag.tag_id} id={tag.tag_id} title={tag.title} color={tag.color} addedTag={false} tagResult={false} />) 
                                    : ""
                                }
                            </div>
                        </div>
                        <div className="flex flex-col gap-4">
                            <div>Date Uploaded:</div>
                            <div>Source: {imageData?.source}</div>
                        </div>
                    </div> 
                </div>
                <div ref={rightRef} onClick={() => handleRightArrowClick()}><FaArrowRight color={isLastImage(imageData?.image_id) ? "gainsboro" : "black"} onClick={() => handleRightArrowClick()} size={20} scale={1}/></div>
            </div>  
        </div>
    )
}