import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { FaImage, FaList, FaPlusCircle, FaTag, FaWrench } from "react-icons/fa";
import { FaMagnifyingGlass } from "react-icons/fa6";
import axios from 'axios';
import useToken from '../../utils/useToken'
import { useNavigate } from "react-router";
import type { TagType } from "../../types/TagType";
import Tag from "../../components/Tag";

export default function Gallery() {
    const [input, setInput] = useState("");
    const [galleryType, setGalleryType] = useState("Image");
    // Initial state is null instead of empty array to prevent multiple axios calls from useEffect
    const [preSignedURLs, setPreSignedURLs] = useState<[]|null>(null);
    const [tags, setTags] = useState<TagType[]|null>(null);
    const navigate = useNavigate();
    const token = useToken();

    useEffect(() => {
        if (!preSignedURLs && token) {
            try {
                axios
                .get('http://localhost:3000/images', {headers: { Authorization: `Bearer ${token}` }})
                .then((res) => {
                    if (typeof res.data === "object") {
                        setPreSignedURLs(res.data);
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
            catch (err) {
                console.log(err);
            }
        }
    }, [preSignedURLs, token]);

    return (
        <>
        <SignedIn>
            <div className="flex flex-col w-full h-full px-16">
                 <header className="flex w-full justify-between items-center">
                    <div className="flex gap-5 items-center">
                        <div className="text-[36px] font-bold">TagInspo</div>
                        <div className="flex gap-8">
                            <FaImage onClick={() => setGalleryType("Image")} className={galleryType === "Image" ? "border-b-4 border-b-cyan-300" : ""} size={20} scale={1} />
                            <FaTag onClick={() => setGalleryType("Tag")} className={galleryType === "Tag" ? "border-b-4 border-b-cyan-300" : ""} size={20} scale={1} />
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
                            <div className="text-[32px] font-bold">{galleryType === "Image" ? "Your images" : "Your tags"}</div>
                            <FaPlusCircle onClick={() => navigate(galleryType === "Image" ? "/editimage" : "/edittag")} id="add-button" scale={1} size={20}/>
                            <FaWrench id="edit-button" scale={1} size={20} />
                        </div>
                        <FaList id="sort-button" size={20} scale={1}/>
                    </div>
                    {
                        galleryType === "Image" ?    
                        <div id="images-previews" className="flex w-full justify-center flex-wrap gap-25">
                            {
                                preSignedURLs ? preSignedURLs.map((url) => <img src={url} key={url} width={200} height={200} />) : 
                                'Click on the + button to add an image' 
                            }
                        </div> :
                        <div id="tag-previews" style={{justifyContent: !tags ? "center" : "flex-start"}} className="flex w-full flex-wrap gap-25">
                            {
                                tags ? tags.map((tag) => <Tag key={tag.tag_id} id={tag.tag_id} title={tag.title} color={tag.color} addedTag={false} tagResult={false} />) 
                                : 'Click on the + button to add a tag' 
                            }
                        </div>
                    }   
                 </div>
            </div>
        </SignedIn>
        <SignedOut>
            Log in on the home page
        </SignedOut>
        </>
    )
}