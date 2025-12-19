import { FaArrowLeft } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import type { TagType } from '../../types/TagType';
import Tag from '../../components/Tag';
import DragAndDrop from '../../components/DragAndDrop';
import TagSearch from '../../components/TagSearch';
import axios from "axios";
import useToken from "../../utils/useToken";

export default function EditImage() {
    const [title, setTitle] = useState('');
    const [source, setSource] = useState('');
    const [allTags, setAllTags] = useState<Array<TagType> | null>(null);
    const [addedTags, setAddedTags] = useState<Array<TagType>>([]);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const [submitable, setSubmitable] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const token = useToken();

    useEffect(() => {
        if (!allTags && token) {
            axios.get('http://localhost:3000/tags', 
                {headers:  { Authorization: `Bearer ${token}` }}).then(res => {
                    setAllTags(res.data);
            });
        }
    }, [allTags, token]);

    useEffect(() => {
        const form = document.querySelector('form');

        function handleSubmit(ev: SubmitEvent) {
            ev.preventDefault();

            if (submitable && form) {
                const formData = new FormData(form);

                formData.set("title", title ? title : new Date().toString());
                formData.append("addedTags", JSON.stringify(addedTags));

                try {
                    axios.post('http://localhost:3000/images/add', formData, 
                    {headers:  { Authorization: `Bearer ${token}`, 
                "Content-Type": "multipart/form-data"}}).then(res => {
                        if (res.status === 200) {
                            navigate('/gallery');
                        }
                    });
                }
                catch (err) {
                    if (err instanceof Error) {
                        setError(err.message);
                        setSubmitable(false);
                    }
                    console.log(err);
                }
            }
            else {
                console.log("form is null?");
            }
        }
        form?.addEventListener('submit', handleSubmit);

        return () => form?.removeEventListener("submit", handleSubmit);

    }, [addedTags, navigate, submitable, title, token]);

    function addTagToImage(id: string, title: string, color: string) {
        setAddedTags([...addedTags, {tag_id: id, title: title, color: color}]);
    }

    function removeTag(id : string) {
        setAddedTags(addedTags.filter(tag => tag.tag_id !== id));
    }

    function editTag(id: string, title: string, color: string) {
        setAddedTags(addedTags.map(tag => {
            // changedTitle is needed for the case that a tag's color is the only thing
            // that needs to be changed. Since the tag's already in addedTags, 
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

    function handleSubmit() {
        if (submitable) {
            const bodyData = {
                title: title !== "" ? title : new Date(),
                source: source !== "" ? source : null,
                addedTags: addedTags
            }

            try {
                axios.post('http://localhost:3000/images/add', bodyData, 
                {headers:  { Authorization: `Bearer ${token}` }}).then(res => {
                    if (res.status === 200) {
                        navigate('/gallery');
                    }
                });
            }
            catch (err) {
                if (err instanceof Error) {
                    setError(err.message);
                    setSubmitable(false);
                }
                console.log(err);
            }
        }
    }

    return (
        <form encType="multipart/form-data" method="post" className="flex flex-col p-4 gap-10 w-full h-full">
            <div className="flex w-full justify-between">
                <FaArrowLeft onClick={() => navigate(-1)} data-testid="cancel-image" size={20} scale={1} />
                <button className="rounded-full p-4" style={{backgroundColor:  submitable ? "cyan" : "gainsboro", 
                    color: submitable ? "black" : "white"}}>
                    Save Changes
                </button>
            </div>
            <div className="flex justify-around w-full">
                <DragAndDrop imageRef={imageRef} setSubmitable={setSubmitable}/>
                <div className="flex flex-col gap-16">
                    <div style={{display: error ? "block" : "none"}}>{error}</div>
                    <div className="flex flex-col gap-4">
                        <label htmlFor="title">Title</label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} id="title" name="title" className="p-4 w-[464px] h-[50px] rounded-full outline outline-black" />
                    </div>
                    <div className="flex flex-col gap-4">
                        <label htmlFor="source">Source</label>
                        <input value={source} onChange={(e) => setSource(e.target.value)} id="source" name="source" className="p-4 w-[464px] h-[50px] rounded-full outline outline-black" />
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