import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Building2, Store, User } from 'lucide-react';

const roles = [
    { id: 'platform', label: 'プラットフォーム管理者', icon: Server, color: 'bg-gray-800', href: '/platform', description: '企業の登録・削除' },
    { id: 'company', label: '企業担当者', icon: Building2, color: 'bg-blue-600', href: '/company', description: '店舗・コース管理' },
    { id: 'shop', label: '店舗スタッフ', icon: Store, color: 'bg-green-600', href: '/staff', description: '予約台帳・ステータス変更' },
    { id: 'customer', label: 'エンドユーザー(C)', icon: User, color: 'bg-orange-500', href: '/customer', description: '店舗検索・予約' },
];

export function RoleSwitcher() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((role) => (
                <Link key={role.id} href={role.href} className="block h-full">
                    <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer pt-0">
                        <CardHeader className={`${role.color} text-white rounded-t-lg pt-4`}>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <role.icon className="h-6 w-6" />
                                {role.label}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <p className="text-sm text-gray-500">{role.description}</p>
                        </CardContent>
                    </Card>
                </Link>
            ))}
        </div>
    );
}
