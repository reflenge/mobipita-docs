import { PlatformAdminView } from "@/components/views/platform-admin-view";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default function PlatformPage() {
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
            <PlatformAdminView />
        </div>
    );
}
