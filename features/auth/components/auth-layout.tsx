import Link from "next/link";
import Image from "next/image";

export const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
    <div className="flex flex-col items-center justify-center min-h-svh gap-6 p-6 md:p-10">
            <div className="flex w-full flex-col gap-6">
                <Link href="/" className="flex items-center gap-2 self-center font-medium">
                <Image src="/logos/logo.svg" alt="Logo" width={30} height={30} />
                <span className="text-lg">Nodebase</span>
                </Link>
                {children}
            </div>
        </div>
    );
};