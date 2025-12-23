---
title: 実装設計メモ
description: 実装に近い設計項目と未確定事項（TODO）を整理
---

アーキテクチャより一段具体化して、実装時に迷わないための項目を洗い出したメモです。未確定事項は `TODO:` として残しています。

## 1. ドメイン/データモデル（Convex schema 粒度）

- RootTenant: `id`, `name`, `orgId`（Clerk Organization ID）, `status`, `settings`, `createdAt`
- Tenant: `id`, `rootTenantId`, `name`, `type`, `status`
- Location: `id`, `rootTenantId`, `tenantId`, `name`, `address`, `timezone`, `serviceMode`（visit/store）, `serviceAreaIds`
- Staff: `id`, `rootTenantId`, `tenantId`, `clerkUserId`, `role`, `status`
- Customer: `id`, `rootTenantId`, `lineUserId`, `phone`, `name`, `memo`
- Menu: `id`, `rootTenantId`, `locationId`, `name`, `durationMinutes`, `slotCount`, `price`, `capacity`
- SlotTemplate: `id`, `rootTenantId`, `locationId`, `dayOfWeek`, `startTime`, `endTime`, `breaks`
- SlotOverride/Block: `id`, `rootTenantId`, `locationId`, `date`, `reason`, `isClosed`, `createdAt`
- SlotInstance（空き枠の実体）: `id`, `rootTenantId`, `locationId`, `date`, `startAt`, `endAt`, `status`, `remainingCapacity`
- Reservation: `id`, `rootTenantId`, `locationId`, `customerId`, `menuId`, `startAt`, `endAt`, `status`, `paymentStatus`, `channel`
- Payment: `id`, `rootTenantId`, `reservationId`, `stripePaymentIntentId`, `amount`, `feeAmount`, `status`
- Notification: `id`, `rootTenantId`, `reservationId`, `channel`, `payload`, `status`, `sentAt`
- AuditLog: `id`, `rootTenantId`, `actorId`, `action`, `targetType`, `targetId`, `metadata`, `createdAt`

- TODO: タイムゾーンの保持位置（RootTenant / Location どちらか）
- TODO: 予約枠を「SlotInstance」として保存するか、テンプレートから都度計算するか
- TODO: LINE連携IDの正規化（Customerに直持ち vs 別テーブル）

## 2. 予約枠生成ロジック（10分刻み）

- `slotSizeMinutes = 10` を共通定数化
- `slotCount = ceil(menu.durationMinutes / slotSizeMinutes)` で算出
- テンプレート（公式/店舗独自）から日付範囲の枠を生成し、上書きテンプレートで差分更新
- `SlotOverride/Block` で休業・臨時対応・移動制約を反映

- TODO: 端数の丸め規則（切り上げ/切り捨て/四捨五入）
- TODO: 訪問型の移動時間バッファと同日連続予約の可否
- TODO: 当日予約/前日締切などのリードタイム条件

## 3. Request Context / 認可ガード

- `getRequestContext()` で `rootTenantId`, `actor`, `role`, `locationId` を確定
- Staff系は Clerk `activeOrgId` から `rootTenantId` を引く
- Customer系はサブドメインや `locationId` から `rootTenantId` を引く
- すべての query/mutation は `rootTenantId` を必須にして一致検証

- TODO: 本部横断の運用者ロール（プラットフォーム管理者）
- TODO: 未ログインのC側利用時の権限範囲（閲覧/予約/キャンセル）

## 4. Convex関数（実装粒度の一覧）

- RootTenant: `createRootTenant`, `updateRootTenantSettings`, `listRootTenants`
- Tenant/Location: `upsertTenant`, `upsertLocation`, `listLocations`, `archiveLocation`
- Menu: `upsertMenu`, `listMenus`, `archiveMenu`
- Schedule: `upsertSlotTemplate`, `generateSlotInstances`, `listAvailability`
- Reservation: `createReservation`, `confirmReservation`, `cancelReservation`, `rescheduleReservation`, `listReservations`
- Payment: `createPaymentIntent`, `attachPaymentMethod`, `handleStripeWebhook`
- Customer: `upsertCustomer`, `linkLineUser`, `listCustomerReservations`

- TODO: 公開APIと内部専用APIの分離方針
- TODO: 重要なmutationの冪等性キー（payment/予約確定）

## 5. 予約フロー状態遷移

- `draft` -> `pending_payment` -> `confirmed` -> `completed`
- 例外: `canceled`, `no_show`, `refund_pending`, `refunded`
- 状態遷移は `AuditLog` に記録

- TODO: キャンセル可能期限と手数料ポリシー
- TODO: 予約確定のタイミング（決済完了 vs 仮予約）

## 6. Stripe Connect 実装方針

- `connectAccountId` を Tenant もしくは Location に保持
- PaymentIntent作成時に `transfer_data.destination` と `application_fee_amount` を設定
- Webhookで `payment_intent.succeeded` を受け、Reservationを `confirmed` に更新

- TODO: Express/Standard の最終選定
- TODO: 分配率ルール（RootTenant/Tenant/Locationの按分）
- TODO: 返金ルールとWebhook対応イベントの範囲

## 7. ルーティング / マルチテナント

- `subdomain -> rootTenantId` のマッピングをDBで管理
- `locationId` をURLに含める場合のルールを統一

- TODO: ステージング/本番のドメイン戦略
- TODO: Master App と Customer App のセッション分離ルール

## 8. 通知/リマインド（LINE連携）

- 予約完了/前日/当日リマインドを通知イベントとして定義
- 配信履歴を `Notification` で保持し、再送可否を管理

- TODO: LINE公式アカウント連携の方式（Messaging API / LIFF）
- TODO: 配信テンプレートの文面と多言語対応

## 9. 監査・運用・エラーハンドリング

- 重要操作は `AuditLog` で追跡（予約/決済/設定変更）
- Webhookは再送/冪等性を前提に設計

- TODO: 監視/アラートの初期ツール選定
- TODO: データ保管期間と削除ポリシー

## 10. テスト/検証項目

- スロット生成ロジック（テンプレート/上書き/休業）の単体テスト
- テナント境界ガードの統合テスト
- Stripe WebhookのE2Eシミュレーション

- TODO: テストデータ投入（seed）方針
- TODO: UIの高齢者向けアクセシビリティ検証項目
