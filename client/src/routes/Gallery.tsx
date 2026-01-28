import { SignedIn, SignedOut } from "@clerk/clerk-react";
import { useCallback, useContext, useState, useMemo, useEffect } from "react";
import { FaList, FaPlusCircle, FaWrench } from "react-icons/fa";
import { Navigate, useNavigate, useSearchParams } from "react-router";
import type { TagType } from "../../types/TagType";
import type { ImageType } from "../../types/ImageType";
import useTags from '../../utils/useTags';
import Tag from "../../components/Tag";
import Image from "../../components/Image";
import SortOptions from "../../components/SortOptions";
import GalleryHeader from "../../components/GalleryHeader";
import Pagination from '../../components/Pagination';
import LoadingSpin from "../../components/LoadingSpin";
import ViewImage from "./ViewImage";
import { QueryClientContext } from "@tanstack/react-query";
import useImages from "../../utils/useImages";

export default function Gallery() {
    const queryClient = useContext(QueryClientContext);
    const [searchParams, setSearchParams] = useSearchParams();
    const type = searchParams.get("type");
    const query = searchParams.get("query");
    const id = searchParams.get('id');
    const navigate = useNavigate();
    const [editMode, setEditMode] = useState(false);
    const [page, setPage] = useState(0);
    const imageLimitPerPage = 20;
    const tagsLimitPerPage = 40;
    const offset = page === 0 ? 0 : (page * (type === "image" ? imageLimitPerPage : tagsLimitPerPage)) + 1;
    const [currentOption, setCurrentOption] = useState('created_at');
    const [viewSortOptions, setViewSortOptions] = useState(false);
    const imageQuery = useImages();    
    const tagQuery = useTags();


    useEffect(() => {
        if (query) {
            document.title = `${query ?? "Search Result"} - TagInspo`;
        }
        else if (id) {
            document.title = `Image - TagInspo`;
        }
        else {
            document.title = `Gallery - TagInspo`;
        }
    }, [id, query]);

    const images : ImageType[] = useMemo(() => {
        return imageQuery.data ?? [];
    }, [imageQuery.data]);
    
    const tags : TagType[] = useMemo(() => {
        return tagQuery.data ?? [];
    }, [tagQuery.data]);

    function containsAllTags(imageTagIDs: string[], queryTagIDs: string[]) : boolean {
        if (queryTagIDs.length === 0) {
            return false;
        }

        for (const id of queryTagIDs) {
            if (!imageTagIDs.includes(id)) {
                return false;
            }
        } 

        return true;
    }
    
    const getMatchedImages = useCallback(() => {
        const queryResult : ImageType[] = [];
        const tagIDs : string[] = [];
        if (images && tags && query) {
            const queries = query.split('&');
            
            for (const query of queries) {
                const findTag = tags.find((tag) => tag.title === query);
                
                if (findTag) {
                    tagIDs.push(findTag.tag_id);
                }
            }

            const matchedImages = images.filter((img) => containsAllTags(img.tagIDs, tagIDs));
            queryResult.push(...matchedImages);
        }
        
        return queryResult;
    }, [images, query, tags]);

    const fetchImageByID = useCallback((id: string | null) => {
        if (id) {
            return images.find((img) => img.image_id === id);
        }
    }, [images]);

    const queryImages = getMatchedImages();

    const totalPages = useMemo(() => {
        if (type === "image") {
            return Math.ceil(images.length / imageLimitPerPage);
        }
        else if (type === "tag") {
            return Math.ceil(tags.length / tagsLimitPerPage);
        }

        return Math.ceil(queryImages.length / imageLimitPerPage);
        
    }, [images.length, queryImages.length, tags.length, type]);

    const clearURLParams = useCallback(() => {
        const keys = [...searchParams.keys()];
        for (const key of keys) {
            searchParams.delete(key);
        }
    }, [searchParams]);

    const handleImageClick = useCallback((id : string) => {
        clearURLParams();

        searchParams.set("type", "image");
        searchParams.append("id", id);
        setSearchParams(searchParams);
    }, [searchParams, clearURLParams, setSearchParams]);

    const addQueryString = useCallback((query: string) => {
        clearURLParams();

        let existingQuery = searchParams.get('query');
        if (existingQuery) {
            existingQuery += `&${query}`;
            searchParams.set('query', existingQuery);
        }
        else {
            searchParams.set('query', query);
        }

        setSearchParams(searchParams);
    }, [clearURLParams, searchParams, setSearchParams]);


    function sortList(a: ImageType | TagType, b: ImageType | TagType) {
        if (currentOption === "created_at") {
            const dA = new Date(a.created_at);
            const dB = new Date(b.created_at);
            
            return dB.getTime() - dA.getTime();
            
        }
        else if (currentOption === "edited_at") {
            const dA = new Date(a.edited_at!);
            const dB = new Date(b.edited_at!);
            
            return dB.getTime() - dA.getTime();
        }
        
        return a.title.toLowerCase().localeCompare(b.title.toLowerCase());
        
    }

    function deleteImage(id : string) {
        queryClient?.setQueryData(["images"], (prev : ImageType[]) => prev.filter((img) => img.image_id !== id));
    }

    function handleGalleryType() {
        clearURLParams();
       
        searchParams.set("type", type === "image" ? "tag" : "image");
        setSearchParams(searchParams);
        setPage(0);
    }

    function toPreviousImage(currentID: string | undefined) {
        if (currentID) {
            const currentIndex = images.findIndex((img) => img.image_id === currentID);

            if (currentIndex !== undefined && currentIndex - 1 >= 0) {                
                searchParams.set("id", images[currentIndex-1].image_id);
                setSearchParams(searchParams);
            }
        }
    }

    function toNextImage(currentID: string | undefined) {
        if (currentID) {
            const currentIndex = images.findIndex((img) => img.image_id === currentID);

            if (currentIndex !== undefined && currentIndex + 1 <= images.length-1) {
                searchParams.set("id", images[currentIndex+1].image_id);
                setSearchParams(searchParams);
            }
        }
    }

    function toNextPage() {
        if (page + 1 < totalPages) {
            setPage((old) => old + 1);
        }
    }

    function toPreviousPage() {
        setPage(Math.max(page - 1, 0));
    }

    function isFirstImage(id: string | undefined) {
        return typeof id !== "undefined" && images?.findIndex((tag) => tag.image_id === id) === 0;
    }

    function isLastImage(id: string | undefined) {
        return typeof id !== "undefined" && images?.findIndex((tag) => tag.image_id === id) === images.length-1;
    }

    function tagsToString(tagIDs: string[]) {
        let res = '';

        for (const tagID of tagIDs) {
            const findTag = tags.find((tag) => tag.tag_id === tagID);

            if (findTag) {
                res += `${findTag.title} `;
            }
        }

        return res.trimEnd();
    }

    function clearID() {
        searchParams.delete("id");
        setSearchParams(searchParams);
    }

    return (
        <>
        <SignedIn>
            <div className={`flex flex-col w-full h-full lg:px-16 xxs:px-4 ${searchParams.get("id") ? "fixed" : ""}`}>
                 <GalleryHeader type={type} addQueryString={addQueryString} handleImageClick={handleImageClick} handleGalleryType={handleGalleryType} />
                 <div className="flex flex-col w-full">
                    <div className="flex grow w-full justify-between xs:py-10 xxs:py-4 items-center">
                        <div className="flex items-center gap-8">
                            <div className="text-[32px] xxs:text-[22px] font-bold">{!query ? type === "image" ? "Your images" : "Your tags" : "Search results"}</div>
                            <div className={query ? "hidden" : "flex gap-8"}>
                                <FaPlusCircle data-testid="add-image" className={type !== "image" ? "hidden" : ""} onClick={() => navigate("/addimage")} id="add-button" scale={1} size={20}/>
                                <div className="flex items-center gap-1">
                                    <FaWrench className={type !== "tag" ? "hidden" : ""} color={editMode ? "#7FEF9A" : "black"} onClick={() => setEditMode(!editMode)} id="edit-button" scale={1} size={20} />
                                    {editMode ? <div>Click a tag to edit</div> : <div></div>}
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <FaList data-testid="sort-options" onClick={() => setViewSortOptions(!viewSortOptions)} id="sort-button" size={20} scale={1} />
                            <SortOptions viewSortOptions={viewSortOptions} currentOption={currentOption} closeView={() => setViewSortOptions(false)} handleChangeOption={(option : string) => {setCurrentOption(option)}} />
                        
                        </div> 
                    </div>
                    {
                        type === "image" ?    
                        <div id="images-previews" className={query ? "hidden" : "flex flex-wrap w-full"}>
                            {
                                !imageQuery.isPending ?
                                (
                                    images && images.length ? images.sort(sortList).slice(offset, offset + imageLimitPerPage).map((img) => <Image image_id={img.image_id} key={img.image_id} title={img.title} url={img.url} alt={`${img.title} ${tagsToString(img.tagIDs)}`} handleImageClick={handleImageClick} />) : 
                                    <div className="flex w-full justify-center">Click on the + button to add an image</div>
                                )  
                                :  <LoadingSpin />
                                
                            }
                        </div> :
                        <div id="tag-previews" style={{justifyContent: !tags ? "center" : "flex-start"}} className={query ? "hidden" : "flex w-full items-center flex-wrap gap-25"}>
                            {
                                tags && tags.length ? tags.sort(sortList).slice(offset, offset + tagsLimitPerPage).map((tag) => <Tag editMode={editMode} addQueryString={addQueryString} key={tag.tag_id} id={tag.tag_id} title={tag.title} color={tag.color} addedTag={false} tagResult={false} />) 
                                : <div className="flex w-full justify-center">Click on the + button to add a tag</div> 
                            }
                        </div>
                    }
                    <div id="query-images" className={query ? "grid grid-cols-5 lg:grid-cols-4 w-full" : "hidden"}>
                        {
                            queryImages && queryImages.length ? queryImages.sort(sortList).slice(offset, offset + imageLimitPerPage).map((img) => <Image image_id={img.image_id} key={img.image_id} title={img.title} url={img.url} alt={`${img.title} ${tagsToString(img.tagIDs)}`} handleImageClick={handleImageClick} />)
                            : `No results for ${query?.replace('&', ' ')}`
                        }
                    </div>
                </div> 
                <ViewImage id={id} fetchImageByID={fetchImageByID} clearID={clearID} isFirstImage={isFirstImage} isLastImage={isLastImage} toPreviousImage={toPreviousImage} toNextImage={toNextImage} deleteImage={deleteImage} tagsToString={tagsToString} />
                <Pagination page={page} toPreviousPage={toPreviousPage} toNextPage={toNextPage} totalPages={totalPages} />
            </div>
        </SignedIn>
        <SignedOut>
            <Navigate to={'/'} />
        </SignedOut>
        </>
    )
}