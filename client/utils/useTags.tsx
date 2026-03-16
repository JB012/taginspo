import { useQuery } from "@tanstack/react-query";
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'

export default function useTags() {
    const {getToken} = useAuth();

    const tagQuery = useQuery({
        queryKey: ["tags"],
        queryFn: () => retrieveTags()
    });

    async function retrieveTags() {
        const token = await getToken();
        const res = await axios.get('https://api.taginspo.com/tags', 
            {headers: { Authorization: `Bearer ${token}` }});

        return res.data;
    }

    return tagQuery
}