"use client";

import { useState, useEffect } from "react";
import { db, type Company } from "@/lib/db";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Server, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";

export function PlatformAdminView() {
    const companies = useLiveQuery(() => db.companies.toArray());
    const [newName, setNewName] = useState("");

    const addCompany = async () => {
        if (!newName) return;
        try {
            await db.companies.add({ name: newName, slug: `comp_${Date.now()}` });
            setNewName("");
            toast.success("企業を追加しました");
        } catch (error) {
            toast.error("企業の追加に失敗しました");
        }
    };

    const deleteCompany = async (id: number) => {
        try {
            await db.companies.delete(id);
            toast.info("企業を削除しました");
        } catch (error) {
            toast.error("企業の削除に失敗しました");
        }
    };

    return (
        <Card className="border-t-4 border-t-gray-800">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl text-gray-800">
                    <Server className="h-6 w-6" />
                    プラットフォーム管理
                </CardTitle>
                <CardDescription>プラットフォームを利用する「企業（テナント）」を管理します。</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex gap-2 mb-6">
                    <Input
                        type="text"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="新しい企業名を入力 (例: 株式会社A)"
                        className="max-w-md"
                    />
                    <Button onClick={addCompany} className="bg-gray-800 hover:bg-gray-700">
                        <Plus className="mr-2 h-4 w-4" /> 追加
                    </Button>
                </div>

                <h3 className="font-bold mb-2">登録企業一覧</h3>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>企業名</TableHead>
                                <TableHead>Slug</TableHead>
                                <TableHead className="text-right">操作</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!companies || companies.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center text-gray-500">
                                        企業が登録されていません
                                    </TableCell>
                                </TableRow>
                            ) : (
                                companies.map((c) => (
                                    <TableRow key={c.id}>
                                        <TableCell>{c.id}</TableCell>
                                        <TableCell className="font-medium">{c.name}</TableCell>
                                        <TableCell>{c.slug}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => c.id && deleteCompany(c.id)}
                                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
