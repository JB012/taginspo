import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/clerk-react";
import { useEffect, useMemo, useState } from "react";
import { FaImage, FaList, FaPlusCircle, FaTag, FaWrench } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import axios from 'axios';
import { useNavigate, useSearchParams } from "react-router";
import type { TagType } from "../../types/TagType";
import type { ImageType } from "../../types/ImageType";
import Tag from "../../components/Tag";
import ViewImage from "./ViewImage";

export default function Gallery() {
    const [input, setInput] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();
    const [id, setId] = useState(searchParams.get("id"));
    const type = searchParams.get("type");
    const queryString = searchParams.get("query");
    // Initial state is null instead of empty array to prevent multiple axios calls from useEffect
    const [images, setImages] = useState<ImageType[]|null>(null);
    const [tags, setTags] = useState<TagType[]|null>(null);
    const queryImages = useMemo(() => {
        return images?.filter((img) => { if (queryString) img.tagIDs.includes(queryString)});
    }, [images, queryString]);
    //const [sortOptions, setSortOptions] = useState("");
    const navigate = useNavigate();
    const {getToken} = useAuth();



    function getMatchedImages(query: string) {
        if (query)
    }
    function handleQueryImages(query: string) : ImageType[] {
        const queryResult : ImageType[] = [];
        
        if (queryImages && query && images && tags) {
            const findTag = tags.find((tag) => tag.title === query);
            
            if (findTag) {
                const matchedImages = images.filter((img) => img.tagIDs.includes(findTag.tag_id) || img.title.includes(query));
                queryResult.push(...matchedImages);
            }

            // Checking if there's a match for each word in the query. Could make this a recursive call
            const queryWords = query.split(' ');

            if (queryWords.length > 1) {
                for (const queryWord of queryWords) {
                    queryResult.push(...handleQueryImages(queryWord));
                    
                    /* const findTag = tags.find((tag) => tag.title === queryWord);
                    if (findTag) {
                        const matchedImages = images.filter((img) => img.tagIDs.includes(findTag.tag_id) || img.title.includes(queryWord));
                        queryResult.push(...matchedImages);
                    } */
                }
            }
        }
        
        return queryResult;
    }

    async function retrieveImages() {
        const token = await getToken();
        const res = await axios.get('http://localhost:3000/images', 
            {headers: { Authorization: `Bearer ${token}` }});

        if (typeof res.data === "object") {
            setImages(res.data);
        }
    }

    async function retrieveTags() {
        const token = await getToken();
        const res = await axios.get('http://localhost:3000/tags', 
            {headers: { Authorization: `Bearer ${token}` }});

        if (typeof res.data === "object") {
            setTags(res.data);
        }
    }

    useEffect(() => {
        if (!images) {
            try {
                getToken({skipCache: true}).then((token) => {
                    if (token) {
                        axios
                        .get('http://localhost:3000/images', {headers: { Authorization: `Bearer ${token}` }})
                        .then((res) => {
                            if (typeof res.data === "object") {
                                setImages(res.data);
                            }
                        });

                        axios
                        .get('http://localhost:3000/tags', {headers: { Authorization: `Bearer ${token}` }})
                        .then((res) => {
                            if (typeof res.data === "object") {
                                setTags(res.data);
                            }
                        });
                    }
                });
            }
            catch (err) {
                console.log(err);
            }
        }
    }, [getToken, images]);

    function deleteImage(id : string) {
        if (images) {
            console.log(id);
            setImages(images.filter((img) => img.image_id !== id));
        }
        else {
            console.log("images null");
        }
    }

    useEffect(() => {
        if (!tags) {
            try {
                getToken({skipCache: true}).then((token) => {
                    if (token) {
                        axios
                        .get('http://localhost:3000/tags', {headers: { Authorization: `Bearer ${token}` }})
                        .then((res) => {
                            if (typeof res.data === "object") {
                                setTags(res.data);
                            }
                        });
                    }
                });
            }
            catch (err) {
                console.log(err);
            }
        }
    }, [getToken, tags]);

    function handleGalleryType() {
        const keys = [...searchParams.keys()];
        for (const key of keys) {
            searchParams.delete(key);
        }

        searchParams.set("type", type === "image" ? "tag" : "image");
        setSearchParams(searchParams);
    }

    async function handleImageClick(id : string) {
        searchParams.append("id", id);
        setSearchParams(searchParams);
        setId(id);
    }

    function toPreviousImage(currentID: string | undefined) {
        if (images && currentID) {
            const currentIndex = images.findIndex((img) => img.image_id === currentID);

            if (currentIndex !== undefined && currentIndex - 1 >= 0) {                
                searchParams.set("id", images[currentIndex-1].image_id);
                setSearchParams(searchParams);
                setId(images[currentIndex-1].image_id);
            }
        }
    }

    function toNextImage(currentID: string | undefined) {
        if (images && currentID) {
            const currentIndex = images.findIndex((img) => img.image_id === currentID);

            if (currentIndex !== undefined && currentIndex + 1 <= images.length-1) {
                searchParams.set("id", images[currentIndex+1].image_id);
                setSearchParams(searchParams);
                setId(images[currentIndex+1].image_id);
            }
        }
    }

    function isFirstImage(id: string | undefined) {
        if (images && id && images.findIndex((tag) => tag.image_id === id) === 0) {
            return true;
        }

        return false;
    }

    function isLastImage(id: string | undefined) {
        if (images && id && images.findIndex((tag) => tag.image_id === id) === images.length-1) {
            return true;
        }

        return false;
    }

    function addQueryString(query: string) {
        searchParams.append("query", query);
        setSearchParams(searchParams);
    }

    return (
        <>
        <SignedIn>
            <div className="flex flex-col w-full h-full px-16">
                 <header className="flex w-full justify-between items-center">
                    <div className="flex gap-5 items-center">
                        <div className="text-[36px] font-bold">TagInspo</div>
                        <div className="flex gap-8">
                            <FaImage onClick={() => handleGalleryType()} className={type === "image" ? "border-b-4 border-b-cyan-300" : ""} size={20} scale={1} />
                            <FaTag onClick={() => handleGalleryType()} className={type === "tag" ? "border-b-4 border-b-cyan-300" : ""} size={20} scale={1} />
                        </div>
                    </div>
                    <div className="flex items-center relative">
                        <input className="flex outline outline-black rounded-full w-[600px] px-12 h-[39px]" value={input} onChange={(e) => setInput(e.target.value)} />
                        <FaMagnifyingGlass className="absolute left-5" scale={1}/>
                    </div>
                    <UserButton></UserButton>
                 </header>
                 <div className="flex flex-col w-full">
                    <div className="flex w-full justify-between py-10 items-center">
                        <div className="flex items-center gap-8">
                            <div className="text-[32px] font-bold">{type === "image" ? "Your images" : "Your tags"}</div>
                            <FaPlusCircle onClick={() => navigate(type === "image" ? "/addimage" : "/addtag")} id="add-button" scale={1} size={20}/>
                            <FaWrench id="edit-button" scale={1} size={20} />
                        </div>
                        <FaList id="sort-button" size={20} scale={1}/>
                    </div>
                    {
                        type === "image" ?    
                        <div id="images-previews" className={queryString ? "hidden" : "flex w-full items-center flex-wrap gap-25"}>
                            {
                                images && images.length ? images.map((img) => <div className="cursor-pointer" key={img.image_id} onClick={() => handleImageClick(img.image_id)}><img id={img.image_id} src={img.url} alt={img.title} width={200} height={200}/></div>) : 
                                <div className="flex w-full justify-center">Click on the + button to add an image</div> 
                            }
                        </div> :
                        <div id="tag-previews" style={{justifyContent: !tags ? "center" : "flex-start"}} className={queryString ? "hidden" : "flex w-full items-center flex-wrap gap-25"}>
                            {
                                tags && tags.length ? tags.map((tag) => <Tag addQueryString={addQueryString} key={tag.tag_id} id={tag.tag_id} title={tag.title} color={tag.color} addedTag={false} tagResult={false} />) 
                                : <div className="flex w-full justify-center">Click on the + button to add a tag</div> 
                            }
                        </div>
                    }
                    
                    <div id="query-images" className={queryImages ? "" : "hidden"}>
                        {
                            queryImages?.map((img) => <div className="cursor-pointer" key={img.image_id} onClick={() => handleImageClick(img.image_id)}><img id={img.image_id} src={img.url} alt={img.title} width={200} height={200}/></div>)
                        }
                    </div>
                </div> 
                <ViewImage id={id} setId={setId} isFirstImage={isFirstImage} isLastImage={isLastImage} toPreviousImage={toPreviousImage} toNextImage={toNextImage} deleteImage={deleteImage} />
            </div>
        </SignedIn>
        <SignedOut>
            Log in on the home page
        </SignedOut>
        </>
    )
}