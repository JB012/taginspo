import { FaArrowLeft } from "react-icons/fa";
import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import type { TagType } from '../../types/TagType';
import type { ImageType } from "../../types/ImageType";
import Tag from '../../components/Tag';
import DragAndDrop from '../../components/DragAndDrop';
import TagSearch from '../../components/TagSearch';
import axios from "axios";
import { useAuth } from "@clerk/clerk-react";
import useTags from "../../utils/useTags";
import { QueryClientContext } from "@tanstack/react-query";

const url = import.meta.env.VITE_DEFAULT_URL;

export default function EditImage() {
    const queryClient = useContext(QueryClientContext);
    const { id } = useParams();
    const [editImage, setEditImage] = useState<ImageType | null>(null);
    const [title, setTitle] = useState('');
    const [source, setSource] = useState('');
    const tagQuery = useTags();
    const allTags : TagType[] = tagQuery.data;
    const [addedTags, setAddedTags] = useState<Array<TagType>>([]);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [submitable, setSubmitable] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const fileRef = useRef<HTMLInputElement | null>(null);
    const {getToken} = useAuth();

    useEffect(() => {
        async function retrieveImageData() {
            if (id && !editImage) {
                const token = await getToken();
                if (token) {
                    const res = await axios.get(`http://localhost:3000/images/${id}`, 
                        {headers:  { Authorization: `Bearer ${token}` }});
                    const imageData : ImageType = res.data;
                    
                    setEditImage(imageData);
                    setTitle(imageData.title);
                    setSource(imageData.source);
                    setAddedTags(allTags.filter((tag) => imageData.tagIDs.includes(tag.tag_id)));  
                }
            }
        }

        retrieveImageData();

    }, [id, editImage, getToken, allTags]);

    useEffect(() => {
        function handleEnter(event : KeyboardEvent) {
            if (event.key === "Enter") {
                event.preventDefault();

                return false;
            }
        }
        
        window.addEventListener('keydown', handleEnter);

        return () => window.removeEventListener('keydown', handleEnter);
    });

    useEffect(() => {
        const form = document.querySelector('form');

        function handleSubmit(ev: SubmitEvent) {
            ev.preventDefault();

            if (submitable && form && fileRef.current) {
                fileRef.current.disabled = false;
                const formData = new FormData(form);

                formData.set("title", title ? title : new Date().toString());
                formData.append("addedTags", JSON.stringify(addedTags));

                try {
                    async function addImageBackEnd() {
                        const token = await getToken();

                        if (token) {
                            const res = await axios.post('http://localhost:3000/images/add', formData, 
                            {headers:  { Authorization: `Bearer ${token}`, 
                            "Content-Type": "multipart/form-data"}});

                            if (res.status === 200 && !res.data.includes("Title already exists")) {
                                await queryClient?.refetchQueries();
                                navigate(url);
                            }
                            else {
                                setError(res.data);
                            }
                        }
                    }

                    async function editImageBackEnd() {
                        const token = await getToken();
                        //TODO: Tag duplicates occurring while editing image.
                        if (token) {
                            const res = await axios.post(`http://localhost:3000/images/edit/${id}`, 
                                {title: title, source: source, addedTags: JSON.stringify(addedTags)}, 
                                {headers:  { Authorization: `Bearer ${token}`}});
                            
                            if (res.status === 200 && !res.data.includes("Title already exists")) {
                                await queryClient?.refetchQueries();    
                                navigate(url);
                            }
                            else {
                                setError(res.data);
                            }
                        }
                    }
                    
                    if (!id) {
                        addImageBackEnd();
                    }
                    else {
                        editImageBackEnd();
                    }
                }
                catch (err) {
                    if (err instanceof Error) {
                        setError(err.message);
                        setSubmitable(false);
                    }
                }
            }
        }

        form?.addEventListener('submit', handleSubmit);

        return () => form?.removeEventListener("submit", handleSubmit);

    }, [addedTags, navigate, submitable, title, getToken, id, queryClient, source]);

    useEffect(() => {
        document.title = "Edit Image - TagInspo";
    }, []);

    function addTagToImage(id: string, title: string, color: string) {
        // created_at will be passed a date once user submits the form
        setAddedTags([...addedTags, {tag_id: id, title: title.trim().replace(' ', '_'), color: color, created_at: "", edited_at: null}]);
    }

    function removeTag(id : string) {
        setAddedTags(addedTags.filter(tag => tag.tag_id !== id));
    }

    function editTag(id: string, title: string, color: string) {
        setAddedTags(addedTags.map(tag => { 
            if (tag.tag_id === id) {
                tag.title = title;
                tag.color = color;
            }

            return tag;
        }))
    }

    function duplicateTag(title: string, id?: string) {
        // A scenario where id exists is when a tag is being edited. We don't want 
        // to count the tag itself as a duplicate.
        if (id) {
            return addedTags.some((tag) => tag.tag_id !== id && tag.title === title);
        } 
        
        // A scenario where id doesn't exists is when a tag is being added. We're
        // counting the tag's title as a duplicate. 
        return addedTags.some((tag) => tag.title === title);

    }

    return (
        <form onSubmit={(e) => {e.preventDefault(); return false}} encType="multipart/form-data" method="post" className="flex flex-col p-4 gap-4 sm:py-8 w-full h-full">
            <div className="flex w-full justify-between items-center">
                <FaArrowLeft onClick={() => navigate(-1)} data-testid="cancel-image" size={20} scale={1} />
                <button className="rounded-full p-4" style={{backgroundColor:  submitable ? "cyan" : "gainsboro", 
                    color: submitable ? "black" : "white"}}>
                    Save Changes
                </button>
            </div>
            <div className="flex lg:flex-row xxs:flex-col justify-around w-full">
                <DragAndDrop fileRef={fileRef} imageRef={imageRef} setTitle={setTitle} setSubmitable={setSubmitable} editImageURL={editImage ? editImage.url : undefined}/>
                <div className="flex flex-col gap-16">
                    <div style={{display: error ? "block" : "none"}}>{error}</div>
                    <div className="flex flex-col gap-4">
                        <label htmlFor="title">Title</label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} id="title" name="title" className="p-4 w-[464px] lg:w-[375px] h-[50px] rounded-full outline outline-black" />
                    </div>
                    <div className="flex flex-col gap-4">
                        <label htmlFor="source">Source</label>
                        <input value={source} onChange={(e) => setSource(e.target.value)} id="source" name="source" className="p-4 w-[464px] lg:w-[375px] h-[50px] rounded-full outline outline-black" />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex gap-3">
                            <div>Tags</div>
                            <TagSearch allTags={allTags} duplicateTag={duplicateTag} addTagToImage={addTagToImage} />
                        </div>
                        <div className="flex flex-wrap py-4 w-[500px] gap-4">
                            {
                                addedTags.map(tag => <Tag key={tag.tag_id} id={tag.tag_id} title={tag.title} color={tag.color} addedTag={true} tagResult={false} removeTag={removeTag} editTag={editTag} duplicateTag={duplicateTag}/>)
                            }
                        </div>
                        
                    </div>
                </div>
            </div>
        </form>
    )
}