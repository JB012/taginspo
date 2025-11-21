import { SignedIn, SignedOut, SignOutButton, UserButton } from "@clerk/clerk-react";
export default function Dashboard() {
    return (
        <>
        <SignedIn>
            <SignOutButton>Sign Out</SignOutButton>
            Dashboard
            <UserButton><div>Button</div></UserButton>
        </SignedIn>
        <SignedOut>
            nothing here
        </SignedOut>
        </>
    )
}