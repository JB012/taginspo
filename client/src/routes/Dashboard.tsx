import { SignedIn, SignOutButton } from "@clerk/clerk-react";

export default function Dashboard() {
    return (
        <SignedIn>
            <SignOutButton>Sign Out</SignOutButton>
            Dashboard
        </SignedIn>
    )
}