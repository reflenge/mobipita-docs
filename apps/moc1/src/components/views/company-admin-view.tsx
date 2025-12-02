"use client";

import { useState, useEffect } from "react";
import { db, type Company, type Shop, type Course } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Building2, Store, Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryState } from 'nuqs';

export function CompanyAdminView() {
    const companies = useLiveQuery(() => db.companies.toArray());
    const [selectedCompanyId, setSelectedCompanyId] = useQueryState('companyId');
    const [shops, setShops] = useState<Shop[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [newShopName, setNewShopName] = useState("");
    const [isLoaded, setIsLoaded] = useState(false);

    // Course Modal State
    const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);
    const [targetShopId, setTargetShopId] = useState<number | null>(null);
    const [courseForm, setCourseForm] = useState<{ id: number | null; name: string; price: string }>({ id: null, name: "", price: "" });

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
            loadShops();
        } else {
            setShops([]);
            setCourses([]);
        }
    }, [selectedCompanyId]);

    const loadShops = async () => {
        if (!selectedCompanyId) return;
        const s = await db.shops.where('companyId').equals(Number(selectedCompanyId)).toArray();
        setShops(s);
        const sIds = s.map(shop => shop.id).filter((id): id is number => id !== undefined);
        if (sIds.length > 0) {
            const c = await db.courses.where('shopId').anyOf(sIds).toArray();
            setCourses(c);
        } else {
            setCourses([]);
        }
    };

    const addShop = async () => {
        if (!newShopName || !selectedCompanyId) return;
        try {
            await db.shops.add({
                companyId: Number(selectedCompanyId),
                name: newShopName,
                address: '東京都某所'
            });
            setNewShopName("");
            loadShops();
            toast.success("店舗を追加しました");
        } catch (error) {
            toast.error("店舗の追加に失敗しました");
        }
    };

    const openAddCourseModal = (shopId: number) => {
        setTargetShopId(shopId);
        setCourseForm({ id: null, name: "", price: "" });
        setIsCourseModalOpen(true);
    };

    const openEditCourseModal = (course: Course) => {
        setTargetShopId(course.shopId);
        setCourseForm({ id: course.id || null, name: course.name, price: String(course.price) });
        setIsCourseModalOpen(true);
    };

    const deleteCourse = async (courseId: number) => {
        if (confirm("本当にこのコースを削除しますか？")) {
            try {
                await db.courses.delete(courseId);
                loadShops();
                toast.info("コースを削除しました");
            } catch (error) {
                toast.error("コースの削除に失敗しました");
            }
        }
    };

    const saveCourse = async () => {
        if (courseForm.name && courseForm.price && targetShopId) {
            try {
                if (courseForm.id) {
                    await db.courses.update(courseForm.id, {
                        name: courseForm.name,
                        price: Number(courseForm.price)
                    });
                    toast.success("コースを更新しました");
                } else {
                    await db.courses.add({
                        shopId: targetShopId,
                        name: courseForm.name,
                        price: Number(courseForm.price),
                        duration: 60
                    });
                    toast.success("コースを追加しました");
                }
                setIsCourseModalOpen(false);
                loadShops();
            } catch (error) {
                toast.error("コースの保存に失敗しました");
            }
        } else {
            toast.error("全ての項目を入力してください");
        }
    };

    if (!isLoaded) {
        return (
            <Card className="border-t-4 border-t-blue-600 min-h-[500px] flex items-center justify-center">
                <div className="text-blue-600 animate-pulse">データを読み込み中...</div>
            </Card>
        );
    }

    return (
        <Card className="border-t-4 border-t-blue-600">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-blue-800">
                    <Building2 className="h-6 w-6" />
                    企業管理 (テナント)
                </CardTitle>
                <CardDescription>自社店舗の追加やメニュー設定を行います。</CardDescription>
            </CardHeader>
            <CardContent>
                {!companies || companies.length === 0 ? (
                    <div className="text-red-500">先にプラットフォーム管理画面で企業を作成してください。</div>
                ) : (
                    <>
                        <div className="mb-6">
                            <Label className="mb-2 block">操作する企業を選択</Label>
                            <Select value={selectedCompanyId || ""} onValueChange={setSelectedCompanyId}>
                                <SelectTrigger className="w-full bg-blue-50">
                                    <SelectValue placeholder="企業を選択" />
                                </SelectTrigger>
                                <SelectContent>
                                    {companies.map(c => (
                                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="border-t pt-6">
                            <h3 className="font-bold mb-4 flex items-center gap-2"><Store className="h-5 w-5" /> 店舗管理</h3>
                            <div className="flex gap-2 mb-6">
                                <Input
                                    type="text"
                                    value={newShopName}
                                    onChange={(e) => setNewShopName(e.target.value)}
                                    placeholder="新しい店舗名 (例: 渋谷店)"
                                    className="max-w-md"
                                />
                                <Button onClick={addShop} className="bg-blue-600 hover:bg-blue-500">
                                    <Plus className="mr-2 h-4 w-4" /> 店舗追加
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {shops.map(shop => (
                                    <Card key={shop.id} className="shadow-sm hover:shadow-md transition">
                                        <CardContent className="p-4">
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <h4 className="font-bold text-lg text-blue-700">{shop.name}</h4>
                                                    <p className="text-xs text-gray-500">ID: {shop.id}</p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => shop.id && openAddCourseModal(shop.id)}
                                                    className="text-blue-700 bg-blue-50 hover:bg-blue-100 border-blue-200"
                                                >
                                                    <Plus className="h-3 w-3 mr-1" /> コース追加
                                                </Button>
                                            </div>

                                            <div className="space-y-2">
                                                {courses.filter(c => c.shopId === shop.id).map(course => (
                                                    <div key={course.id} className="flex justify-between items-center bg-gray-50 p-2 rounded text-sm group">
                                                        <span>{course.name} (¥{course.price.toLocaleString()})</span>
                                                        <div className="flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-blue-500" onClick={() => openEditCourseModal(course)}>
                                                                <Edit className="h-3 w-3" />
                                                            </Button>
                                                            <Button variant="ghost" size="icon" className="h-6 w-6 text-red-500" onClick={() => course.id && deleteCourse(course.id)}>
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {courses.filter(c => c.shopId === shop.id).length === 0 && (
                                                    <p className="text-xs text-gray-400 italic">コース未登録</p>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    </>
                )}

                <Dialog open={isCourseModalOpen} onOpenChange={setIsCourseModalOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{courseForm.id ? "コースの編集" : "コースの追加"}</DialogTitle>
                            <DialogDescription>
                                コース名と価格を入力してください。
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">コース名</Label>
                                <Input
                                    id="name"
                                    value={courseForm.name}
                                    onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                                    placeholder="例: ランチコース"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="price">価格 (円)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={courseForm.price}
                                    onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                                    placeholder="3000"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsCourseModalOpen(false)}>キャンセル</Button>
                            <Button onClick={saveCourse} className="bg-blue-600 hover:bg-blue-700">保存</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </CardContent>
        </Card>
    );
}
