import { SignIn } from "@clerk/nextjs";

const SignInPage = () => (
  <section className="container flex items-center justify-center py-4">
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
