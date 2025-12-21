import { useAuth } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import axios from "axios";
import type { ImageType } from "../../types/ImageType";
import { FaX } from "react-icons/fa6";
import { FaArrowLeft, FaArrowRight, FaEllipsisH, FaEye } from "react-icons/fa";
import { assertIsNode } from "../../utils/utils";
import type { TagType } from "../../types/TagType";
import Tag from "../../components/Tag";

interface ViewImageProp {
    inGallery?: boolean
    toPreviousImage?: () => void;
    toNextImage?: () => void
}

export default function ViewImage({inGallery, toPreviousImage, toNextImage} : ViewImageProp) {
    const { id } = useParams();
    const { getToken } = useAuth();
    const [imageInfo, setImageInfo] = useState<ImageType|null>(null);
    const [tags, setTags] = useState<TagType[]|null>(null);
    const [imageOptions, setImageOptions] = useState(false);
    const [hideInfo, setHideInfo] = useState(false);
    const optionsRef = useRef<HTMLDivElement|null>(null);
    
    useEffect(() => {
        getToken().then((token) => {
            if (token && id && !imageInfo) {
                axios.get(`http://localhost:3000/images/${id}`,
                    {headers: {Authorization: `Bearer ${token}`}}
                ).then(res => {
                    if (typeof res.data === "object") {
                        setImageInfo(res.data);
                    }
                })
            }
        })
    }, [getToken, id, imageInfo]);

    
    useEffect(() => {
        getToken().then((token) => {
            if (token && id && !tags) {
                axios.get(`http://localhost:3000/tags?imageID=${id}`,
                    {headers: {Authorization: `Bearer ${token}`}}
                ).then(res => {
                    setTags(res.data);
                })
            }
        })
    }, [getToken, id, tags]);

    useEffect(() => {
        function handleClickOutside(event: Event) {
            try {
                assertIsNode(event.target);

                if (optionsRef.current && !optionsRef.current.contains(event.target)) {
                    setImageOptions(false);
                }
            }
            catch (err) {
                console.log(err);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    
    return (
        <div className="flex flex-col gap-12 p-4 w-full h-full">
            <div className="flex justify-between">
                <FaX size={20} scale={1}/>  
                <div>{imageInfo?.title}</div>
                <div className="flex relative">
                    <div className="flex flex-col absolute top-0">
                        <div>Edit Image</div>
                        <div className="text-red-500">Delete Image</div>
                    </div>
                    <div className="flex gap-4">
                        <div ref={optionsRef}>
                            <FaEllipsisH onClick={() => setImageOptions(!imageOptions)} size={20} scale={20}/>
                        </div>
                        <FaEye onClick={() => setHideInfo(!hideInfo)} size={20} scale={1} />
                    </div>                
                </div>
            </div>
            <div className="flex justify-between">
                <FaArrowLeft className={!inGallery ? "hidden" : ""} onClick={() => toPreviousImage?.()} size={20} scale={1} />
                <img id={imageInfo?.id} src={imageInfo?.url} alt={imageInfo?.title} width={900} height={545}/>
                <FaArrowRight className={!inGallery ? "hidden" : ""} onClick={() => toNextImage?.()} size={20} scale={1}/>
            </div>
            <div className="flex justify-between">
                <div className="flex flex-col gap-4">
                    <div>ID: ${imageInfo?.id}</div>
                    <div>
                        <div>Tags:</div>
                        <div className="flex flex-wrap py-4 w-[500px] gap-4">
                            {
                                tags ? tags.map((tag) => <Tag key={tag.tag_id} id={tag.tag_id} title={tag.title} color={tag.color} addedTag={false} tagResult={false} />) 
                                : ""
                            }
                        </div>
                    </div>
                </div>
                <div className="flex flex-col gap-4">
                    <div>Date Uploaded:</div>
                    <div>Source: ${imageInfo?.source}</div>
                </div>
            </div>
        </div>
    )
}