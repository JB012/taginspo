import { useAuth } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import axios from "axios";
import type { ImageType } from "../../types/ImageType";
import { FaX } from "react-icons/fa6";
import { FaArrowLeft, FaArrowRight, FaEye, FaEyeSlash } from "react-icons/fa";
import { assertIsNode } from "../../utils/utils";
import type { TagType } from "../../types/TagType";
import Tag from "../../components/Tag";
import ImageOptions from "../../components/ImageOptions";
import { useQuery } from "@tanstack/react-query";

interface ViewImageProp {
    id: string | null
    setId: (value: React.SetStateAction<string | null>) => void
    isFirstImage: (id: string | undefined) => boolean
    isLastImage: (id: string | undefined) => boolean
    deleteImage: (id: string) => void
    toPreviousImage: (currentID : string | undefined) => void
    toNextImage: (currentID : string | undefined) => void
}

export default function ViewImage({id, setId, isFirstImage, isLastImage, deleteImage, toPreviousImage, toNextImage} : ViewImageProp) {
    const {isPending, isError, data, error} = useQuery({
        queryKey: ["image", id],
        queryFn: () => (id ? fetchImageByID(id) : null),
        staleTime: 1000 * 60 * 10
    });
    
    const [searchParams, setSearchParams] = useSearchParams();
    const { getToken } = useAuth();
    const [tags, setTags] = useState<TagType[]|null>(null);
    const [imageOptions, setImageOptions] = useState(false);
    const [deletePopup, setDeletePopup] = useState(false);
    const [hideInfo, setHideInfo] = useState(false);
    const optionsRef = useRef<HTMLDivElement|null>(null);

    async function fetchImageByID(id: string) {
        const token = await getToken();
        const response = await axios.get(`http://localhost:3000/images/${id}`, 
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

        document.addEventListener("mousedown", handleClickOutside);

        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
/* 
    useEffect(() => {
        try {
            if (id && !imageInfoFromID) {
                getToken().then((token) => {
                    axios.get(`http://localhost:3000/images/${id}`, 
                    {headers: {Authorization: `Bearer ${token}`}}).then((res) => {
                        setImageInfoFromID(res.data);
                    });
                });
            }
        }
        catch (err) {
            console.log(err);
        }
    }, [id, imageInfoFromID, getToken]); */

    useEffect(() => {
        try {
            if (id && !tags) {
                getToken().then((token) => {
                    axios.get(`http://localhost:3000/tags?imageID=${id}`, 
                    {headers: {Authorization: `Bearer ${token}`}}).then((res) => {
                        setTags(res.data);
                    });
                });
            }
        }
        catch (err) {
            console.log(err);
        }
    }, [id, tags, getToken]);

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
        //setImageInfoFromID(null);
        setTags(null);
        setId("");
    }

    function handleLeftArrowClick() {
        if (!isFirstImage(data.image_id)) {
            toPreviousImage(data.image_id);
           // setImageInfoFromID(null);
            setTags(null);
        }
    }

    function handleRightArrowClick() {
        if (!isLastImage(data.image_id)) {
            toNextImage(data.image_id);
            //setImageInfoFromID(null);
            setTags(null);
        }
    }
    
    if (isPending) {
        return <span>Loading...</span>
    }

    if (isError) {
        return <span>Error: {error.message}</span>
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
                        <ImageOptions optionsRef={optionsRef} hideInfo={hideInfo} imageOptions={imageOptions} 
                        deletePopup={deletePopup} imageID={data?.image_id} setImageOptions={setImageOptions} 
                        setDeletePopup={setDeletePopup} handleDelete={handleDelete}/>
                    </div>    
                </div>  
                <div className={hideInfo ? "hidden" : "pb-4"}>{data?.title}</div>
                <FaX className={hideInfo ? "hidden" : ""} onClick={() => closeView()} size={20} scale={1}/>
            </div> 
            <div className={`flex w-full h-full items-center justify-between`}>
                <FaArrowLeft className={hideInfo ? "hidden" : "flex grow"} color={isFirstImage(data?.image_id) ? "gainsboro" : "black"} onClick={() => handleLeftArrowClick()} size={20} scale={1} />
                <div className="flex items-center flex-col gap-6">
                    <img id={data?.image_id} src={data?.url} alt={data?.title}  className={hideInfo ? "w-full h-full" : "w-[900px] h-[450px]"} />
                    <div className={hideInfo ? "hidden" : "flex w-full justify-between"}>
                        <div className="flex flex-col gap-4">
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
                            <div>Source: {data?.source}</div>
                        </div>
                    </div> 
                </div>
                <FaArrowRight className={hideInfo ? "hidden" : "flex grow"} color={isLastImage(data?.image_id) ? "gainsboro" : "black"} onClick={() => handleRightArrowClick()} size={20} scale={1}/>
            </div>  
        </div>
    )
}