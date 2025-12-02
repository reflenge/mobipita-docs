"use client";

import { useState, useEffect } from "react";
import { db, type Company, type Shop, type Course } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Utensils, MapPin, ChevronLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryState, parseAsInteger } from 'nuqs';

export function CustomerView() {
    const [step, setStep] = useQueryState('step', parseAsInteger.withDefault(0));
    const [companyId, setCompanyId] = useQueryState('companyId');
    const [shopId, setShopId] = useQueryState('shopId');
    const [courseId, setCourseId] = useQueryState('courseId');

    const [companies, setCompanies] = useState<Company[]>([]);
    const [shops, setShops] = useState<Shop[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);

    const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
    const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

    const [formName, setFormName] = useState("");
    const [formDate, setFormDate] = useState("");

    const [isRestoring, setIsRestoring] = useState(true);

    // Load initial companies
    useEffect(() => {
        const loadData = async () => { setCompanies(await db.companies.toArray()); };
        loadData();
    }, []);

    // Sync state with URL params
    useEffect(() => {
        const syncData = async () => {
            setIsRestoring(true);
            try {
                if (companyId) {
                    const comp = await db.companies.get(Number(companyId));
                    setSelectedCompany(comp || null);
                    if (comp) {
                        setShops(await db.shops.where('companyId').equals(comp.id!).toArray());
                    }
                } else {
                    setSelectedCompany(null);
                    setShops([]);
                }

                if (shopId) {
                    const shop = await db.shops.get(Number(shopId));
                    setSelectedShop(shop || null);
                    if (shop) {
                        setCourses(await db.courses.where('shopId').equals(shop.id!).toArray());
                    }
                } else {
                    setSelectedShop(null);
                    setCourses([]);
                }

                if (courseId) {
                    const course = await db.courses.get(Number(courseId));
                    setSelectedCourse(course || null);
                } else {
                    setSelectedCourse(null);
                }
            } finally {
                setIsRestoring(false);
            }
        };
        syncData();
    }, [companyId, shopId, courseId]);

    const handleCompanySelect = async (comp: Company) => {
        if (comp.id) {
            await setCompanyId(String(comp.id));
            await setStep(1);
        }
    };

    const handleShopSelect = async (shop: Shop) => {
        if (shop.id) {
            await setShopId(String(shop.id));
            await setStep(2);
        }
    };

    const handleCourseSelect = async (course: Course) => {
        if (course.id) {
            await setCourseId(String(course.id));
            await setStep(3);
        }
    };

    const handleBack = async (targetStep: number) => {
        await setStep(targetStep);
        if (targetStep < 3) await setCourseId(null);
        if (targetStep < 2) await setShopId(null);
        if (targetStep < 1) await setCompanyId(null);
    };

    const handleSubmit = async () => {
        if (!formName || !formDate) {
            toast.error("必須項目を入力してください");
            return;
        }

        if (selectedShop?.id && selectedCourse?.id) {
            try {
                await db.reservations.add({
                    shopId: selectedShop.id,
                    courseId: selectedCourse.id,
                    customerName: formName,
                    date: formDate,
                    status: 'confirmed'
                });

                toast.success("予約が完了しました！お待ちしております。");
                // Reset flow
                await setStep(0);
                await setCompanyId(null);
                await setShopId(null);
                await setCourseId(null);
                setFormName("");
                setFormDate("");
            } catch (error) {
                toast.error("予約処理に失敗しました");
            }
        }
    };

    if (isRestoring) {
        return (
            <Card className="border-t-4 border-t-orange-500 min-h-[500px] flex items-center justify-center">
                <div className="text-orange-600 animate-pulse">データを読み込み中...</div>
            </Card>
        );
    }

    return (
        <Card className="border-t-4 border-t-orange-500 min-h-[500px]">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-orange-600">
                    <Utensils className="h-6 w-6" />
                    店舗・コース予約 (Customer)
                </CardTitle>
                <CardDescription>簡単3ステップで予約完了</CardDescription>
            </CardHeader>
            <CardContent>
                {/* Step 0: 企業選択 */}
                {step === 0 && (
                    <div className="fade-in">
                        <h3 className="text-lg font-bold mb-4">お店のグループを選んでください</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {companies.map(c => (
                                <Card key={c.id} onClick={() => handleCompanySelect(c)} className="cursor-pointer hover:shadow-lg hover:bg-orange-50 transition border-2 border-transparent hover:border-orange-200">
                                    <CardContent className="p-6">
                                        <div className="font-bold text-xl mb-2">{c.name}</div>
                                        <div className="text-gray-400 text-sm">グループID: {c.slug}</div>
                                    </CardContent>
                                </Card>
                            ))}
                            {companies.length === 0 && <p className="text-gray-500 col-span-3 text-center py-10">予約可能な店舗グループがありません。</p>}
                        </div>
                    </div>
                )}

                {/* Step 1: 店舗選択 */}
                {step === 1 && selectedCompany && (
                    <div className="fade-in">
                        <Button variant="ghost" onClick={() => handleBack(0)} className="mb-4 text-gray-500">
                            <ChevronLeft className="h-4 w-4 mr-1" /> 戻る
                        </Button>
                        <h3 className="text-lg font-bold mb-4"><span className="text-orange-600">{selectedCompany.name}</span> の店舗一覧</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {shops.map(s => (
                                <Card key={s.id} onClick={() => handleShopSelect(s)} className="cursor-pointer hover:shadow-lg hover:bg-orange-50 transition border-2 border-transparent hover:border-orange-200">
                                    <CardContent className="p-6">
                                        <div className="font-bold text-xl mb-2">{s.name}</div>
                                        <div className="text-gray-500 text-sm flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.address}</div>
                                    </CardContent>
                                </Card>
                            ))}
                            {shops.length === 0 && <p className="text-gray-500 col-span-3 text-center py-10">このグループには店舗が登録されていません。</p>}
                        </div>
                    </div>
                )}

                {/* Step 2: コース選択 */}
                {step === 2 && selectedShop && (
                    <div className="fade-in">
                        <Button variant="ghost" onClick={() => handleBack(1)} className="mb-4 text-gray-500">
                            <ChevronLeft className="h-4 w-4 mr-1" /> 戻る
                        </Button>
                        <h3 className="text-lg font-bold mb-4"><span className="text-orange-600">{selectedShop.name}</span> のコース選択</h3>
                        <div className="space-y-4">
                            {courses.map(course => (
                                <Card key={course.id} className="hover:bg-gray-50 transition">
                                    <CardContent className="p-4 flex justify-between items-center">
                                        <div>
                                            <div className="font-bold text-lg">{course.name}</div>
                                            <div className="text-gray-500 text-sm">所要時間: {course.duration}分</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-xl text-orange-600">¥{course.price.toLocaleString()}</div>
                                            <Button onClick={() => handleCourseSelect(course)} className="mt-2 bg-orange-500 hover:bg-orange-600 text-white">
                                                このコースで予約
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                            {courses.length === 0 && <p className="text-gray-500 text-center py-10">現在提供されているコースはありません。</p>}
                        </div>
                    </div>
                )}

                {/* Step 3: 情報入力 */}
                {step === 3 && selectedShop && selectedCourse && (
                    <div className="fade-in max-w-lg mx-auto">
                        <Button variant="ghost" onClick={() => handleBack(2)} className="mb-4 text-gray-500">
                            <ChevronLeft className="h-4 w-4 mr-1" /> コース選択に戻る
                        </Button>
                        <Card className="bg-gray-50 border-orange-200">
                            <CardHeader>
                                <CardTitle className="text-center">予約情報の入力</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="p-4 bg-white rounded border space-y-2">
                                    <div>
                                        <div className="text-xs text-gray-500">店舗</div>
                                        <div className="font-bold">{selectedShop.name}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">コース</div>
                                        <div className="font-bold">{selectedCourse.name} (¥{selectedCourse.price.toLocaleString()})</div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="name">お名前</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        placeholder="山田 太郎"
                                        value={formName}
                                        onChange={(e) => setFormName(e.target.value)}
                                        className="bg-white"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="date">来店日時</Label>
                                    <Input
                                        id="date"
                                        type="datetime-local"
                                        value={formDate}
                                        onChange={(e) => setFormDate(e.target.value)}
                                        className="bg-white"
                                    />
                                </div>

                                <Button onClick={handleSubmit} className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold py-6 text-lg">
                                    <CheckCircle2 className="mr-2 h-5 w-5" /> 予約を確定する
                                </Button>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
