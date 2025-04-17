import { SignIn } from "@clerk/nextjs";
import PixelWindow from "@/components/ui/PixelWindow";
import Image from "next/image";

export default function Page() {
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-pixel-pattern py-8 px-4">
      <div className="mb-6 flex items-center gap-3">
        <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Image src="/icons/lilguy-logo.svg" alt="LilGuy Logo" width={32} height={32} />
        </div>
        <h1 className="text-2xl font-bold text-pixel">LilGuy</h1>
      </div>
      
      <PixelWindow 
        title="SIGN IN" 
        headerColor="bg-pixel-blue"
        className="max-w-md w-full"
      >
        <div className="p-4">
          <div className="text-center mb-6">
            <p className="text-lg text-pixel-green font-bold">
              Welcome to LilGuy! Sign in to track your productivity and help your character grow.
            </p>
          </div>
          <SignIn />
        </div>
      </PixelWindow>
    </div>
  );
}
