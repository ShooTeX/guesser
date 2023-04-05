import { SignIn } from "@clerk/nextjs";

const SignInPage = () => (
  <section className="flex h-screen w-full items-center justify-center">
    <SignIn
      path="/sign-in"
      routing="path"
      appearance={{
        elements: {
          footer: "hidden",
        },
      }}
    />
  </section>
);

export default SignInPage;
