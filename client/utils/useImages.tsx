import { useQuery } from "@tanstack/react-query";
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'

export default function useImages() {
    const {getToken} = useAuth();

    const imageQuery = useQuery({
        queryKey: ["images"],
        queryFn: () => retrieveImages()
    });

    async function retrieveImages() {
        const token = await getToken();
        const res = await axios.get('https://8t1pk2onwe.execute-api.us-east-1.amazonaws.com/images', 
            {headers: { Authorization: `Bearer ${token}` }});

        return res.data;        
    }

    return imageQuery
}