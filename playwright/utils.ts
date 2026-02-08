import {createClerkClient} from "@clerk/backend"

export async function acquireAccount(id: number) {
    const clerkClient = createClerkClient({
        secretKey: process.env.CLERK_SECRET_KEY
    });

    const username = `user-${id}`;
    const password = `pass-${id}`;
    try {        
        await clerkClient.users.createUser({
            username: username,
            password: password
        });

        return {username, password};
    }
    catch (err) {
        console.log(err);
    }

}