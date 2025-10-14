import { RegisterForm } from "@/features/auth/components/register-form";
import { requireUnauth } from "@/lib/auth-utils";

const Page = async () => {
    await requireUnauth();
    return (
        <div className="flex items-center justify-center">
            <RegisterForm />
        </div>
    )
}

export default Page;
