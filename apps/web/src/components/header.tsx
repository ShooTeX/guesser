import { SignedIn, UserButton, SignedOut, SignInButton } from "@clerk/nextjs";

export const Header = () => {
  return (
    <header
      className="flex justify-between p-5"
      style={{ display: "flex", justifyContent: "space-between", padding: 20 }}
    >
      <h1>this is WIP</h1>
      <SignedIn>
        <UserButton />
      </SignedIn>
      <SignedOut>
        <SignInButton />
      </SignedOut>
    </header>
  );
};
