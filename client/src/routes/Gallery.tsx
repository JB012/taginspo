import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import { useContext, useState } from "react";
import { FaList, FaPlusCircle, FaWrench } from "react-icons/fa";
import axios from 'axios';
import { useNavigate, useSearchParams } from "react-router";
import type { TagType } from "../../types/TagType";
import type { ImageType } from "../../types/ImageType";
import Tag from "../../components/Tag";
import Image from "../../components/Image";
import GalleryHeader from "../../components/GalleryHeader";
import ViewImage from "./ViewImage";
import { useQuery } from "@tanstack/react-query";
import { QueryClientContext } from "@tanstack/react-query";

export default function Gallery() {
    const queryClient = useContext(QueryClientContext);
    
    const imageQuery = useQuery({
        queryKey: ["images"],
        queryFn: () => retrieveImages()
    });

    const tagQuery = useQuery({
        queryKey: ["tags"],
        queryFn: () => retrieveTags()
    });

    const images : ImageType[] = imageQuery.data;
    const tags : TagType[] = tagQuery.data;
    const [searchParams, setSearchParams] = useSearchParams();
    const [id, setId] = useState(searchParams.get("id"));
    const type = searchParams.get("type");
    const queries = searchParams.getAll("query");
    const queryImages = getMatchedImages();
    const navigate = useNavigate();
    const {getToken} = useAuth();

    function getMatchedImages() : ImageType[] {
        const queryResult : ImageType[] = [];
        
        if (images && tags) {
            for (const query of queries) {
                const findTag = tags.find((tag) => tag.title === query);
                
                if (findTag) {
                    const matchedImages = images.filter((img) => img.tagIDs.includes(findTag.tag_id) || img.title.includes(query));
                    console.log(matchedImages);
                    queryResult.push(...matchedImages);
                }
            }
        }
        
        return queryResult;
    }

    async function retrieveImages() {
        const token = await getToken();
        const res = await axios.get('http://localhost:3000/images', 
            {headers: { Authorization: `Bearer ${token}` }});

        return res.data;        
    }

    async function retrieveTags() {
        const token = await getToken();
        const res = await axios.get('http://localhost:3000/tags', 
            {headers: { Authorization: `Bearer ${token}` }});

        return res.data;
    }

    function deleteImage(id : string) {
        queryClient?.setQueryData(["images"], (prev : ImageType[]) => prev.filter((img) => img.image_id !== id));
    }

    function clearURLParams() {
        const keys = [...searchParams.keys()];
        for (const key of keys) {
            searchParams.delete(key);
        }
    }

    function handleGalleryType() {
        clearURLParams();
       
        searchParams.set("type", type === "image" ? "tag" : "image");
        setSearchParams(searchParams);
    }

    function handleImageClick(id : string) {
        clearURLParams();

        searchParams.set("type", "image");
        searchParams.append("id", id);
        setSearchParams(searchParams);
        setId(id);
    }

    function toPreviousImage(currentID: string | undefined) {
        if (currentID) {
            const currentIndex = images.findIndex((img) => img.image_id === currentID);

            if (currentIndex !== undefined && currentIndex - 1 >= 0) {                
                searchParams.set("id", images[currentIndex-1].image_id);
                setSearchParams(searchParams);
                setId(images[currentIndex-1].image_id);
            }
        }
    }

    function toNextImage(currentID: string | undefined) {
        if (currentID) {
            const currentIndex = images.findIndex((img) => img.image_id === currentID);

            if (currentIndex !== undefined && currentIndex + 1 <= images.length-1) {
                searchParams.set("id", images[currentIndex+1].image_id);
                setSearchParams(searchParams);
                setId(images[currentIndex+1].image_id);
            }
        }
    }

    function isFirstImage(id: string | undefined) {
        return typeof id !== "undefined" && images?.findIndex((tag) => tag.image_id === id) === 0;
    }

    function isLastImage(id: string | undefined) {
        return typeof id !== "undefined" && images?.findIndex((tag) => tag.image_id === id) === images.length-1;
    }

    function addQueryString(query: string) {
        clearURLParams();

        searchParams.append("query", query);
        setSearchParams(searchParams);
    }

    return (
        <>
        <SignedIn>
            <div className="flex flex-col w-full h-full px-16">
                 <GalleryHeader type={type} images={images} tags={tags} handleGalleryType={handleGalleryType} />
                 <div className="flex flex-col w-full">
                    <div className="flex w-full justify-between py-10 items-center">
                        <div className="flex items-center gap-8">
                            <div className="text-[32px] font-bold">{queries.length === 0 ? type === "image" ? "Your images" : "Your tags" : "Search results"}</div>
                            <div className={queries.length ? "hidden" : "flex gap-8"}>
                                <FaPlusCircle onClick={() => navigate(type === "image" ? "/addimage" : "/addtag")} id="add-button" scale={1} size={20}/>
                                <FaWrench id="edit-button" scale={1} size={20} />
                            </div>
                        </div>
                        <FaList id="sort-button" size={20} scale={1}/>
                    </div>
                    {
                        type === "image" ?    
                        <div id="images-previews" className={queries.length ? "hidden" : "flex w-full items-center flex-wrap gap-25"}>
                            {
                                images && images.length ? images.map((img) => <Image image_id={img.image_id} key={img.image_id} url={img.url} title={img.title} handleImageClick={handleImageClick} />) : 
                                <div className="flex w-full justify-center">Click on the + button to add an image</div> 
                            }
                        </div> :
                        <div id="tag-previews" style={{justifyContent: !tags ? "center" : "flex-start"}} className={queries.length ? "hidden" : "flex w-full items-center flex-wrap gap-25"}>
                            {
                                tags && tags.length ? tags.map((tag) => <Tag addQueryString={addQueryString} key={tag.tag_id} id={tag.tag_id} title={tag.title} color={tag.color} addedTag={false} tagResult={false} />) 
                                : <div className="flex w-full justify-center">Click on the + button to add a tag</div> 
                            }
                        </div>
                    }
                    <div id="query-images" className={queries.length ? "flex w-full items-center flex-wrap gap-25" : "hidden"}>
                        {
                            queryImages?.map((img) => <div className="cursor-pointer" key={img.image_id} onClick={() => handleImageClick(img.image_id)}><img id={img.image_id} src={img.url} alt={img.title} width={200} height={200}/></div>)
                        }
                    </div>
                </div> 
                <ViewImage id={id} clearID={() => setId("")} isFirstImage={isFirstImage} isLastImage={isLastImage} toPreviousImage={toPreviousImage} toNextImage={toNextImage} deleteImage={deleteImage} />
            </div>
        </SignedIn>
        <SignedOut>
            Log in on the home page
        </SignedOut>
        </>
    )
}