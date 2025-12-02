import { CompanyAdminView } from "@/components/views/company-admin-view";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Suspense } from "react";

export default function CompanyPage() {
    return (
        <div className="container mx-auto p-4 max-w-4xl py-10">
            <div className="mb-6">
                <Link href="/">
                    <Button variant="ghost" className="text-gray-500">
                        <ChevronLeft className="mr-2 h-4 w-4" />
                        ホームに戻る
                    </Button>
                </Link>
            </div>
            <Suspense fallback={<div>Loading...</div>}>
                <CompanyAdminView />
            </Suspense>
        </div>
    );
}
