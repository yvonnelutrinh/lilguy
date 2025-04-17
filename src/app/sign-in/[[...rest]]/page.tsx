import { SignIn } from "@clerk/nextjs";
import PixelWindow from "@/components/ui/PixelWindow";
import Image from "next/image";

export default function Page() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-pixel-pattern py-8 px-4">
      <div className="mb-4 flex items-center gap-3">
        <div className="w-10 h-10 bg-white border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Image src="/icons/lilguy-logo.svg" alt="LilGuy Logo" width={24} height={24} />
        </div>
        <h1 className="text-xl font-pixel text-pixel">LilGuy</h1>
      </div>
      
      <PixelWindow 
        title="SIGN IN"
        headerColor="bg-pixel-blue"
        className="max-w-md w-full mx-auto"
        contentClassName="p-0 flex flex-col items-center"
      >
        <div className="p-3 w-full">
          <div className="text-center mb-3">
            <h2 className="text-lg font-pixel text-pixel-green mb-1">Welcome to LilGuy</h2>
            <p className="text-xs font-pixel-body text-gray-600">
              Sign up to track your productivity and help your character grow.
            </p>
          </div>
          <div className="clerk-sign-in-container w-full flex justify-center">
            <SignIn 
              appearance={{
                elements: {
                  rootBox: "w-full max-w-sm mx-auto",
                  card: "pixel-card",
                  headerTitle: "hidden",
                  headerSubtitle: "hidden",
                  socialButtonsBlockButton: "pixel-social-button",
                  formFieldInput: "pixel-input",
                  formButtonPrimary: "pixel-button-primary",
                  footerActionLink: "pixel-link",
                  formFieldLabel: "font-pixel-body",
                  formButtonText: "font-pixel",
                  socialButtonsBlockButtonText: "font-pixel-body",
                  footerText: "font-pixel-body",
                  card__main: "pt-0",
                  main: "gap-2",
                  socialButtonsBlockButton__text: "text-sm",
                  footer: "mt-2 pt-2"
                }
              }}
            />
          </div>
        </div>
      </PixelWindow>
    </div>
  );
}
