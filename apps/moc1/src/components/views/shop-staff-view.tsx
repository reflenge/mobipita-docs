"use client";

import { useState, useEffect } from "react";
import { db, type Company, type Shop, type Reservation } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Store, Ban } from "lucide-react";
import { toast } from "sonner";
import { useQueryState } from 'nuqs';

interface EnhancedReservation extends Reservation {
    courseName: string;
}

export function ShopStaffView() {
    const companies = useLiveQuery(() => db.companies.toArray());
    const [selectedCompanyId, setSelectedCompanyId] = useQueryState('companyId');
    const [shops, setShops] = useState<Shop[]>([]);
    const [selectedShopId, setSelectedShopId] = useQueryState('shopId');
    const [reservations, setReservations] = useState<EnhancedReservation[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (companies !== undefined) {
            if (companies.length > 0 && !selectedCompanyId) {
                setSelectedCompanyId(String(companies[0].id));
            }
            setIsLoaded(true);
        }
    }, [companies, selectedCompanyId, setSelectedCompanyId]);

    useEffect(() => {
        if (selectedCompanyId) {
            db.shops.where('companyId').equals(Number(selectedCompanyId)).toArray().then(s => {
                setShops(s);
                if (s.length > 0) {
                    if (!selectedShopId || !s.find(shop => String(shop.id) === selectedShopId)) {
                        setSelectedShopId(String(s[0].id));
                    }
                } else {
                    setSelectedShopId(null);
                    setReservations([]);
                }
            });
        } else {
            setShops([]);
        }
    }, [selectedCompanyId, selectedShopId, setSelectedShopId]);

    useEffect(() => {
        if (selectedShopId) loadReservations();
        else setReservations([]);
    }, [selectedShopId]);

    const loadReservations = async () => {
        if (!selectedShopId) return;
        const resData = await db.reservations
            .where('shopId')
            .equals(Number(selectedShopId))
            .reverse()
            .toArray();

        const enhancedResData = await Promise.all(resData.map(async (r) => {
            const course = await db.courses.get(r.courseId);
            return { ...r, courseName: course ? course.name : '不明なコース' };
        }));

        setReservations(enhancedResData);
    };

    const updateStatus = async (id: number, status: 'confirmed' | 'cancelled') => {
        try {
            await db.reservations.update(id, { status });
            loadReservations();
            toast.info(`予約ステータスを更新しました: ${status}`);
        } catch (error) {
            toast.error("ステータスの更新に失敗しました");
        }
    };

    if (!isLoaded) {
        return (
            <Card className="border-t-4 border-t-green-600 min-h-[500px] flex items-center justify-center">
                <div className="text-green-600 animate-pulse">データを読み込み中...</div>
            </Card>
        );
    }

    return (
        <Card className="border-t-4 border-t-green-600">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-green-800">
                    <Store className="h-6 w-6" />
                    店舗スタッフ (予約台帳)
                </CardTitle>
                <CardDescription>予約の確認と管理を行います。</CardDescription>
            </CardHeader>
            <CardContent>
                {!companies || companies.length === 0 ? (
                    <div className="text-gray-500">企業データがありません。プラットフォーム管理画面で作成してください。</div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <Label className="mb-2 block">企業選択</Label>
                                <Select value={selectedCompanyId || ""} onValueChange={setSelectedCompanyId}>
                                    <SelectTrigger className="bg-green-50">
                                        <SelectValue placeholder="企業を選択" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {companies.map(c => (
                                            <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label className="mb-2 block">店舗選択</Label>
                                <Select value={selectedShopId || ""} onValueChange={setSelectedShopId} disabled={shops.length === 0}>
                                    <SelectTrigger className="bg-green-50">
                                        <SelectValue placeholder={shops.length === 0 ? "店舗なし" : "店舗を選択"} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {shops.map(s => (
                                            <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {shops.length === 0 ? (
                            <div className="text-gray-500">この企業には店舗が登録されていません。</div>
                        ) : (
                            <>
                                <h3 className="font-bold mb-2">予約リスト</h3>
                                <div className="rounded-md border">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-green-50">
                                                <TableHead>日時</TableHead>
                                                <TableHead>お客様名</TableHead>
                                                <TableHead>コース</TableHead>
                                                <TableHead>ステータス</TableHead>
                                                <TableHead>操作</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {reservations.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="text-center text-gray-500 h-24">
                                                        予約はまだありません
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                reservations.map(r => (
                                                    <TableRow key={r.id}>
                                                        <TableCell>{new Date(r.date).toLocaleString()}</TableCell>
                                                        <TableCell className="font-bold">{r.customerName}</TableCell>
                                                        <TableCell className="text-sm">{r.courseName}</TableCell>
                                                        <TableCell>
                                                            <Badge variant={r.status === 'confirmed' ? 'default' : 'destructive'} className={r.status === 'confirmed' ? 'bg-blue-500' : ''}>
                                                                {r.status === 'confirmed' ? '確定' : 'キャンセル'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            {r.status !== 'cancelled' && r.id && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => r.id && updateStatus(r.id, 'cancelled')}
                                                                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                >
                                                                    <Ban className="h-4 w-4 mr-1" /> キャンセル
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
