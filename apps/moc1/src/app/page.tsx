"use client";

import { useState } from "react";
import { RoleSwitcher } from "@/components/role-switcher";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { db } from "@/lib/db";
import { toast } from "sonner";
import { Database } from "lucide-react";

export default function Home() {
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const executeInitData = async () => {
    try {
      await db.transaction('rw', db.companies, db.shops, db.courses, db.reservations, async () => {
        // 既存データを全削除
        await db.companies.clear();
        await db.shops.clear();
        await db.courses.clear();
        await db.reservations.clear();

        // 1. 企業作成 (3社)
        const cId1 = await db.companies.add({ name: '株式会社グルメイノベーション', slug: 'gourmet' });
        const cId2 = await db.companies.add({ name: 'ビューティーサロン・グループ', slug: 'beauty' });
        const cId3 = await db.companies.add({ name: 'レンタルスペース運営事務局', slug: 'space' });

        // --- Company 1: グルメ (3店舗) ---
        const sId1_1 = await db.shops.add({ companyId: cId1, name: 'ビストロ・ボン 丸の内', address: '東京都千代田区' });
        const sId1_2 = await db.shops.add({ companyId: cId1, name: '焼肉 虎ノ門', address: '東京都港区' });
        const sId1_3 = await db.shops.add({ companyId: cId1, name: 'カフェ・ド・シエル', address: '東京都中央区' });

        // Courses for Shop 1-1
        const coId1_1_1 = await db.courses.add({ shopId: sId1_1, name: 'ウィークデーランチ', price: 1200, duration: 60 });
        const coId1_1_2 = await db.courses.add({ shopId: sId1_1, name: '季節のディナーコース', price: 5000, duration: 120 });
        await db.courses.add({ shopId: sId1_1, name: '【個室確約】アニバーサリープラン', price: 8000, duration: 150 });
        // Courses for Shop 1-2
        await db.courses.add({ shopId: sId1_2, name: '食べ放題「極」', price: 4500, duration: 90 });
        await db.courses.add({ shopId: sId1_2, name: '特選和牛ランチ', price: 2500, duration: 60 });
        // Courses for Shop 1-3
        await db.courses.add({ shopId: sId1_3, name: 'ケーキセット', price: 1100, duration: 60 });
        await db.courses.add({ shopId: sId1_3, name: 'アフタヌーンティー', price: 3500, duration: 120 });

        // --- Company 2: ビューティー (3店舗) ---
        const sId2_1 = await db.shops.add({ companyId: cId2, name: 'Hair Salon Aoyama', address: '東京都港区' });
        const sId2_2 = await db.shops.add({ companyId: cId2, name: 'Relax Spa Ebisu', address: '東京都渋谷区' });
        const sId2_3 = await db.shops.add({ companyId: cId2, name: 'Nail Studio Roppongi', address: '東京都港区' });

        // Courses for Shop 2-1
        await db.courses.add({ shopId: sId2_1, name: 'カット＋カラー', price: 12000, duration: 120 });
        await db.courses.add({ shopId: sId2_1, name: 'ヘッドスパ', price: 6000, duration: 60 });
        // Courses for Shop 2-2
        await db.courses.add({ shopId: sId2_2, name: '全身アロマ 60分', price: 8000, duration: 60 });
        await db.courses.add({ shopId: sId2_2, name: '岩盤浴セット', price: 2500, duration: 180 });
        // Courses for Shop 2-3
        await db.courses.add({ shopId: sId2_3, name: 'ジェルネイル', price: 6000, duration: 90 });

        // --- Company 3: スペース (3店舗) ---
        const sId3_1 = await db.shops.add({ companyId: cId3, name: '渋谷カンファレンスセンター', address: '東京都渋谷区' });
        const sId3_2 = await db.shops.add({ companyId: cId3, name: '品川ミーティングルーム', address: '東京都港区' });
        const sId3_3 = await db.shops.add({ companyId: cId3, name: 'コワーキングスペース新宿', address: '東京都新宿区' });

        // Courses for Shop 3-1
        const coId3_1_1 = await db.courses.add({ shopId: sId3_1, name: '大会議室A (1時間)', price: 10000, duration: 60 });
        const coId3_1_2 = await db.courses.add({ shopId: sId3_1, name: '小会議室B (1時間)', price: 3000, duration: 60 });
        // Courses for Shop 3-3
        await db.courses.add({ shopId: sId3_3, name: 'ドロップイン利用(1日)', price: 2000, duration: 600 });

        // --- 予約データ (サンプル) ---
        // 過去の予約
        await db.reservations.add({ shopId: sId1_1, courseId: coId1_1_1, customerName: '山田 太郎', date: '2023-10-01T12:00', status: 'confirmed' });
        // 未来の予約
        await db.reservations.add({ shopId: sId1_1, courseId: coId1_1_2, customerName: '鈴木 花子', date: '2025-12-24T18:00', status: 'confirmed' });
        await db.reservations.add({ shopId: sId1_1, courseId: coId1_1_2, customerName: '佐藤 健', date: '2025-12-25T19:00', status: 'confirmed' });

        // キャンセル済み
        await db.reservations.add({ shopId: sId3_1, courseId: coId3_1_1, customerName: 'テック株式会社', date: '2025-11-20T10:00', status: 'cancelled' });
        await db.reservations.add({ shopId: sId3_1, courseId: coId3_1_2, customerName: '個人利用（高橋）', date: '2025-11-21T14:00', status: 'confirmed' });
      });

      setIsResetConfirmOpen(false);
      toast.success("サンプルデータを再投入しました。");
    } catch (error) {
      toast.error("データの初期化に失敗しました");
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-5xl py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">B2B2C マルチテナント予約システム</h1>
        <p className="text-gray-500">ロールを選択してデモを開始してください</p>
      </div>

      <RoleSwitcher />

      <div className="mt-20 text-center border-t pt-8">
        <Button variant="link" onClick={() => setIsResetConfirmOpen(true)} className="text-blue-500 hover:text-blue-700">
          <Database className="mr-2 h-4 w-4" />
          デバッグ: テストデータを投入する (3社×3店舗など)
        </Button>
        <p className="text-xs text-gray-400 mt-2">
          ※このアプリはIndexedDBを使用しています。データはブラウザ内に保存されます。
        </p>
      </div>

      <Dialog open={isResetConfirmOpen} onOpenChange={setIsResetConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>データの初期化</DialogTitle>
            <DialogDescription>
              既存のデータを全て削除し、3社分の詳細なテストデータを再投入します。<br />
              よろしいですか？
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetConfirmOpen(false)}>キャンセル</Button>
            <Button variant="destructive" onClick={executeInitData}>実行する</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
