import { FaArrowLeft } from "react-icons/fa";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";
import type { TagType } from '../../types/TagType';
import Tag from '../../components/Tag';
import DragAndDrop from '../../components/DragAndDrop';
import TagSearch from '../../components/TagSearch';
import axios from "axios";

export default function EditImage() {
    const [title, setTitle] = useState('');
    const [source, setSource] = useState('');
    const [addedTags, setAddedTags] = useState<Array<TagType>>([]);
    const imageRef = useRef<HTMLImageElement | null>(null);
    const navigate = useNavigate();


    function addTagToImage(id: string, title: string, color: string) {
        setAddedTags([...addedTags, {tag_id: id, title: title, color: color}]);
    }

    function removeTag(id : string) {
        setAddedTags(addedTags.filter(tag => tag.tag_id !== id));
    }

    function editTag(id: string, title: string, color: string) {
        setAddedTags(addedTags.map(tag => {
            if (tag.tag_id === id && !addedTags.some((tag) => tag.title === title)) {
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
        if (imageRef.current?.src) {
            const bodyData = {
                title: title !== "" ? title : new Date(),
                source: source !== "" ? source : null,
                tags: addedTags
            }

            axios.post('http://localhost:3000/images/add', bodyData).then(res => {
                if (res.status === 200) {
                    navigate('/gallery');
                }
            })
        }
    }

    return (
        <div className="flex flex-col p-4 gap-10 w-full h-full">
            <div className="flex w-full justify-between">
                <FaArrowLeft onClick={() => navigate(-1)} data-testid="cancel-image" size={20} scale={1} />
                <button className="cursor-pointer">Save Changes</button>
            </div>
            <div className="flex justify-around w-full">
                <DragAndDrop imageRef={imageRef} />
                <div className="flex flex-col gap-16">
                    <div className="flex flex-col gap-4">
                        <label htmlFor="title">Title</label>
                        <input value={title} onChange={(e) => setTitle(e.target.value)} id="title" className="w-[464px] h-[50px] rounded-full outline outline-black" />
                    </div>
                    <div className="flex flex-col gap-4">
                        <label htmlFor="title">Source</label>
                        <input value={source} onChange={(e) => setSource(e.target.value)} id="title" className="w-[464px] h-[50px] rounded-full outline outline-black" />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex gap-3">
                            <div>Tags</div>
                            <TagSearch duplicateTag={duplicateTag} addTagToImage={addTagToImage} />
                        </div>
                        <div className="flex py-4 flex-wrap gap-4">
                            {
                                addedTags.map(tag => <Tag key={tag.tag_id} id={tag.tag_id} title={tag.title} color={tag.color} addedTag={true} tagResult={false} removeTag={removeTag} editTag={editTag} duplicateTag={duplicateTag}/>)
                            }
                        </div>
                        
                    </div>
                </div>
            </div>
        </div>
    )
}