import { useContext, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router";
import axios from 'axios';
import { useAuth } from "@clerk/clerk-react";
import { QueryClientContext } from "@tanstack/react-query";
import LoadingSpin from "../../components/LoadingSpin";

export default function EditTag() {
    const queryClient = useContext(QueryClientContext);
    const { id } = useParams();
    const navigate = useNavigate();
    const [title, setTitle] = useState("");
    const [color, setColor] = useState("#ffffff");
    const { getToken } = useAuth();
    const [editWarning, setEditWarning] = useState(localStorage.getItem('editWarning'));
    const [deleteWarning, setDeleteWarning] = useState(false);
    const [clickedDelete, setClickedDelete] = useState(false);
    const editCheckRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        async function retrieveTagData() {
            try {
                const token = await getToken();

                const res = await axios.get(`http://localhost:3000/tags/${id}`, 
                    {headers: {Authorization: `Bearer ${token}`}}
                )

                if (res.status === 200 && typeof res.data !== "string") {    
                    setTitle(res.data.title);
                    setColor(res.data.color);                    
                }
                else {
                    console.error(`No tag with id: ${id} found`);
                }

            }
            catch (err) {
                console.log(err);
            }
        }

        if (!title) {
            retrieveTagData();   
        }

    }, [getToken, id, title]);

    useEffect(() => {
        document.title = "Edit Tag - TagInspo";
    }, []);

    async function handleSubmit() {
        if (title) {
            try {
                const token = await getToken();

                const res = await axios.post(`http://localhost:3000/tags/edit`, {title: title, color: color, tagID: id}, 
                    {headers: {Authorization: `Bearer ${token}`}});
                
                if (res.status === 200 && queryClient) {
                    if (editCheckRef.current && editCheckRef.current.checked) {
                        localStorage.setItem('editWarning', 'set');
                    }

                    await queryClient.refetchQueries();
                    
                    navigate(-1);
                }
            }
            catch (err) {
                console.log(err);
            }
        }
    }

    async function handleDelete() {
        const token = await getToken();

        try {
            if (queryClient) {
                await axios.delete(`http://localhost:3000/tags/delete/${id}`, 
                {headers: {Authorization: `Bearer ${token}`}});
                    
                await queryClient.refetchQueries();
                navigate(-1);
            }
        }
        catch (err) {
            console.log(err);
        }
    }

    function handleSubmitClick() {
        // User pressed 'Do not show again' checkbox (editWarning="set")
        if (editWarning) {
            handleSubmit();
        }
        else {
            //editWarning needs to not be an empty string so the popup can show. The value
            //can be anything, as long as it isn't the string 'set'.
            setEditWarning('view')
        }
    }

    
    return (
        <div className={`w-full h-full relative`}>
            <div className={`flex flex-col p-4 gap-4 w-full min-h-screen ${(editWarning && editWarning !== "set") || deleteWarning ? "backdrop-brightness-75 brightness-50 pointer-events-none" : ""}`}>
                <div className="flex w-full justify-between">
                        <button className="rounded-full p-4" style={{backgroundColor: "red", color: "white"}} onClick={() => setDeleteWarning(true)}>Delete tag</button>
                        <button className="rounded-full p-4" style={{backgroundColor: title ? "cyan" : "gainsboro", 
                        color: title ? "black" : "white"}} onClick={() => handleSubmitClick()}>Save Changes</button>
                </div>
                <div className="text-[32px]">Edit Tag</div>
                <div className="flex flex-col gap-10">
                    <div className="flex flex-col gap-4">
                        <div className="flex gap-3">
                            <label className="text-2xl" htmlFor="title">Title</label>
                        </div>
                        <input required value={title} onChange={(e) => setTitle(e.target.value)} id="title" className="xs:w-[464px] xxs:w-[300px] h-[45px] p-4 rounded-full outline outline-black" />
                    </div>
                    <div className="flex flex-col gap-4">
                        <label className="text-2xl" htmlFor="color">Color</label>
                        <input value={color} onChange={(e) => setColor(e.target.value)} id="color" type="color" />
                    </div>
                </div>
            </div>
            <div className={editWarning && editWarning !== "set" ? "absolute z-10 bg-white flex flex-col gap-8 w-[300px] p-4 rounded-3xl top-1/4 left-150" : "hidden"}>
                <div>
                    Editing this tag will affect images that are attached to them.<br />
                    Are you sure you want to make this change?
                </div>
                <div className="flex gap-2 self-center">
                    <input ref={editCheckRef} type="checkbox" />
                    <div>Do not show again</div>
                </div>
                <div className="flex justify-between">
                    <button onClick={() => {setClickedDelete(true); handleSubmit()}} className="rounded-full px-2 outline outline-black">Yes</button>
                    <button onClick={() => setEditWarning('')} className={"rounded-full px-2 outline outline-black"}>No</button>
                </div>
            </div>
            <div data-testid="delete-warning" className={deleteWarning ? "absolute z-10 bg-white flex flex-col gap-8 w-[300px] p-4 rounded-3xl top-1/4 left-150" : "hidden"}>
                {
                    !clickedDelete ?     
                    <div>
                        This tag will be removed from every image that it's attached to.<br />
                        Are you sure you want to make this change?
                    </div> :
                    <div className="flex items-center gap-8">
                        <LoadingSpin />
                        <div>Deleting...</div>
                    </div>
                }
                <div className="flex justify-between">
                    <button onClick={() => handleDelete()} className="rounded-full px-2 outline outline-black">Yes</button>
                    <button onClick={() => setDeleteWarning(false)} className={"rounded-full px-2 outline outline-black"}>No</button>
                </div>
            </div>
        </div>
    )
}