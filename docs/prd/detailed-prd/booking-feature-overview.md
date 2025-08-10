# Detailed PRD: Booking Feature
# 詳細PRD：予約機能

## 1. Feature Overview
## 1. 機能概要

### 1.1. Feature Description
### 1.1. 機能説明

**English**

The Booking feature on the PetPro platform allows users to book pet care services at clinics that are part of the platform. This feature covers the entire booking flow from clinic search, service selection, time slot selection, payment processing, to confirmation and notifications.

**日本語**

PetProプラットフォームの予約機能により、ユーザーはプラットフォームに参加しているクリニックでペットケアサービスを予約することができます。この機能は、クリニック検索、サービス選択、時間枠選択、支払い処理、確認と通知までの予約フローの全体をカバーしています。

### 1.2. Business Objectives
### 1.2. ビジネス目標

**English**
- Improve accessibility of pet healthcare services
- Optimize clinic capacity utilization
- Reduce waiting times and improve clinic operational efficiency
- Enhance consumer experience in accessing pet healthcare services
- Create new revenue streams through commissions from each booking

**日本語**
- ペット医療サービスのアクセシビリティ向上
- クリニックの受入能力の最適化
- 待ち時間の短縮とクリニック運営効率の向上
- ペット医療サービスへのアクセスにおける消費者体験の向上
- 予約ごとの手数料による新しい収益源の創出

### 1.3. Success Metrics
### 1.3. 成功指標

**English**
- Number of successful bookings per month: target 5,000 bookings by month 6
- Conversion rate from search to booking: target 15%
- Booking cancellation rate: target <10%
- Average number of bookings per user: target 2 bookings per year
- NPS (Net Promoter Score) for booking experience: target >50

**日本語**
- 月間成功予約数：6ヶ月目までに5,000予約を目標
- 検索から予約へのコンバージョン率：15%を目標
- 予約キャンセル率：10%未満を目標
- ユーザーあたりの平均予約数：年間2予約を目標
- 予約体験のNPS（Net Promoter Score）：50以上を目標

### 1.4. User Personas
### 1.4. ユーザーペルソナ

#### 1.4.1. Pet Owners
#### 1.4.1. ペットオーナー

**English**
- **Profile**: Adults aged 25-45 years, living in urban areas, owning 1-3 pets
- **Pain Points**: 
  - Difficulty finding suitable schedules at veterinary clinics
  - Long waiting times at clinics
  - Uncertainty about service costs
- **Goals**: 
  - Getting the best care for their pets
  - Saving time by reducing waiting times
  - Price transparency before visits

**日本語**
- **プロフィール**：25〜45歳の成人、都市部在住、1〜3匹のペットを所有
- **ペインポイント**：
  - 動物病院で適切なスケジュールを見つけることが難しい
  - 病院での長い待ち時間
  - サービス料金の不明確さ
- **目標**：
  - ペットに最高のケアを提供する
  - 待ち時間を短縮して時間を節約する
  - 訪問前の料金の透明性

#### 1.4.2. Clinic Administrators
#### 1.4.2. クリニック管理者

**English**
- **Profile**: Administrative staff or veterinarians managing clinic schedules
- **Pain Points**: 
  - Difficulty managing busy schedules
  - Patient no-shows
  - Miscommunication regarding required services
- **Goals**: 
  - Maximizing clinic schedule efficiency
  - Reducing no-shows and last-minute cancellations
  - Having complete information about patients before arrival

**日本語**
- **プロフィール**：クリニックのスケジュールを管理する事務スタッフまたは獣医師
- **ペインポイント**：
  - 混雑したスケジュールの管理が難しい
  - 患者の無断キャンセル
  - 必要なサービスに関する誤解
- **目標**：
  - クリニックのスケジュール効率の最大化
  - 無断キャンセルや直前のキャンセルの削減
  - 到着前に患者に関する完全な情報を持つこと

## 2. Level 2 Features and Functionality
## 2. レベル2の機能と特徴

### 2.1. Clinic Search and Selection
### 2.1. クリニック検索と選択

#### 2.1.1. Clinic Search
#### 2.1.1. クリニック検索

**English**
- **Description**: Users can search for clinics based on location, type of service, rating, and schedule availability
- **Functionality**:
  - Search based on location (radius, city, area)
  - Filter by clinic rating (1-5 stars)
  - Filter by type of service (vaccination, grooming, consultation, etc.)
  - Filter by schedule availability (today, tomorrow, specific date selection)
  - Display results in list and map views

**日本語**
- **説明**：ユーザーは場所、サービスの種類、評価、スケジュールの空き状況に基づいてクリニックを検索できます
- **機能**：
  - 場所に基づく検索（半径、市、地域）
  - クリニックの評価によるフィルター（1〜5つ星）
  - サービスの種類によるフィルター（予防接種、グルーミング、相談など）
  - スケジュールの空き状況によるフィルター（今日、明日、特定日選択）
  - リストとマップ表示の結果表示

#### 2.1.2. Clinic Details
#### 2.1.2. クリニック詳細

**English**
- **Description**: Users can view detailed information about the clinic before deciding to book
- **Functionality**:
  - Clinic profile (name, address, operating hours, facilities)
  - List of veterinarians with qualifications
  - Clinic photo gallery
  - Reviews and ratings from other users
  - List of services with prices
  - Contact information and directions

**日本語**
- **説明**：ユーザーは予約を決定する前にクリニックに関する詳細情報を閲覧できます
- **機能**：
  - クリニックプロフィール（名前、住所、営業時間、施設）
  - 資格を持つ獣医師リスト
  - クリニック写真ギャラリー
  - 他のユーザーからのレビューと評価
  - 価格付きサービスリスト
  - 連絡先情報とアクセス方法

### 2.2. Service and Time Slot Selection
### 2.2. サービスと時間枠選択

#### 2.2.1. Service Selection
#### 2.2.1. サービス選択

**English**
- **Description**: Users can select the type of service needed for their pets
- **Functionality**:
  - List of service categories (vaccination, grooming, consultation, surgery, etc.)
  - Service details (description, price, estimated duration, available doctors)
  - Option to add multiple services in one booking
  - Recommended services based on pet type and age

**日本語**
- **説明**：ユーザーは自分のペットに必要なサービスの種類を選択できます
- **機能**：
  - サービスカテゴリのリスト（予防接種、グルーミング、相談、手術など）
  - サービス詳細（説明、価格、予想所要時間、利用可能な医師）
  - 1回の予約で複数のサービスを追加するオプション
  - ペットの種類と年齢に基づく推奨サービス

#### 2.2.2. Time Slot Selection
#### 2.2.2. 時間枠選択

**English**
- **Description**: Users can select available dates and times for booking
- **Functionality**:
  - Calendar with availability display (available days and hours)
  - Available time slots based on selected services
  - Visual indicators for slots that are already filled, available, and nearly full
  - Option to view alternative slots if desired time is not available
  - Estimated visit duration based on selected services

**日本語**
- **説明**：ユーザーは予約のために利用可能な日付と時間を選択できます
- **機能**：
  - 空き状況を表示するカレンダー（利用可能な日と時間）
  - 選択したサービスに基づく利用可能な時間枠
  - すでに埋まっている、利用可能、あるいはほぼ満席の時間枠に対する視覚的指標
  - 希望する時間が利用できない場合の代替時間枠を表示するオプション
  - 選択したサービスに基づく来院所要時間の予測

### 2.3. Booking Process and Payment
### 2.3. 予約プロセスと支払い

#### 2.3.1. Booking Information
#### 2.3.1. 予約情報

**English**
- **Description**: Users input the necessary information for booking
- **Functionality**:
  - Selection of pets from existing profiles
  - Option to add a new pet
  - Form for additional notes or specific concerns
  - Confirmation of booking details (clinic, service, time, pet)

**日本語**
- **説明**：ユーザーは予約に必要な情報を入力します
- **機能**：
  - 既存のプロフィールからのペット選択
  - 新しいペットを追加するオプション
  - 追加メモまたは特定の懸念事項のフォーム
  - 予約詳細の確認（クリニック、サービス、時間、ペット）

#### 2.3.2. Payment
#### 2.3.2. 支払い

**English**
- **Description**: Users complete payment for the booking
- **Functionality**:
  - Choice of payment methods (credit card, e-wallet, bank transfer, QRIS)
  - Option to save payment method for future use
  - Display of cost details (service price, tax, platform fee)
  - Promo codes and discounts
  - Direct payment vs pay at clinic (depending on clinic policy)

**日本語**
- **説明**：ユーザーは予約の支払いを完了します
- **機能**：
  - 支払い方法の選択（クレジットカード、eウォレット、銀行振込、QRIS）
  - 将来の利用のために支払い方法を保存するオプション
  - 費用詳細の表示（サービス料金、税金、プラットフォーム手数料）
  - プロモーションコードと割引
  - 直接支払い vs クリニックでの支払い（クリニックの方針により異なります）

### 2.4. Confirmation and Notifications
### 2.4. 確認と通知

#### 2.4.1. Booking Confirmation
#### 2.4.1. 予約確認

**English**
- **Description**: Users receive confirmation after successful booking
- **Functionality**:
  - Confirmation page with booking details
  - Booking reference code
  - Option to add to device calendar
  - Preparation instructions (if any)
  - Button to view booking in my bookings page

**日本語**
- **説明**：ユーザーは予約成功後に確認を受け取ります
- **機能**：
  - 予約詳細を含む確認ページ
  - 予約参照コード
  - デバイスのカレンダーに追加するオプション
  - 準備手順（あれば）
  - マイ予約ページで予約を表示するボタン

#### 2.4.2. Notifications
#### 2.4.2. 通知

**English**
- **Description**: Users receive notifications related to booking
- **Functionality**:
  - Booking confirmation email
  - Booking reminders (1 day and 3 days before)
  - Booking status change notifications
  - Cancellation notifications from the clinic (if applicable)
  - Notification to remind review after service completion

**日本語**
- **説明**：ユーザーは予約に関連する通知を受け取ります
- **機能**：
  - 予約確認メール
  - 予約リマインダー（1日前、3日前）
  - 予約ステータス変更通知
  - クリニックからのキャンセル通知（該当する場合）
  - サービス完了後のレビューを促す通知

### 2.5. Booking Management
### 2.5. 予約管理

#### 2.5.1. Booking List
#### 2.5.1. 予約リスト

**English**
- **Description**: Users can view and manage all bookings they have made
- **Functionality**:
  - Display of booking list (upcoming, past, cancelled)
  - Details of each booking
  - Booking search and filter features
  - Booking status (confirmed, completed, cancelled)

**日本語**
- **説明**：ユーザーは作成したすべての予約を表示および管理できます
- **機能**：
  - 予約リストの表示（今後、過去、キャンセル）
  - 各予約の詳細
  - 予約検索とフィルター機能
  - 予約ステータス（確認済み、完了、キャンセル）

#### 2.5.2. Changes and Cancellations
#### 2.5.2. 変更とキャンセル

**English**
- **Description**: Users can change or cancel bookings they have made
- **Functionality**:
  - Reschedule booking (subject to clinic policy)
  - Booking cancellation (subject to clinic policy)
  - Addition of services (if allowed)
  - Confirmation of changes via email
  - Notification about cancellation fees (if any)

**日本語**
- **説明**：ユーザーは作成した予約を変更またはキャンセルすることができます
- **機能**：
  - 予約の日程変更（クリニックのポリシーに従う）
  - 予約キャンセル（クリニックのポリシーに従う）
  - サービスの追加（許可されている場合）
  - メールによる変更の確認
  - キャンセル料金に関する通知（あれば）



## 3. User Flow Detail (Level 3)
## 3. ユーザーフロー詳細（レベル3）

### 3.1. Clinic Search and Selection
### 3.1. クリニック検索と選択

**English**
1. User opens the application and selects the "Booking" menu
2. User selects search location (current location or specific location)
3. User can adjust search radius (default: 5km)
4. User can add additional filters:
   - Service type (vaccination, grooming, consultation, surgery, etc.)
   - Clinic rating (minimum 3 stars, 4 stars, etc.)
   - Availability (today, tomorrow, date selection)
5. System displays search results in two formats:
   - List view: showing clinic name, rating, distance, and service highlights
   - Map view: showing clinic locations on an interactive map
6. User selects a clinic from search results to view details
7. System displays clinic detail page with complete information

**日本語**
1. ユーザーはアプリケーションを開き、「予約」メニューを選択します
2. ユーザーは検索場所を選択します（現在地または特定の場所）
3. ユーザーは検索半径を調整できます（デフォルト：5km）
4. ユーザーは追加フィルターを適用できます：
   - サービスタイプ（予防接種、グルーミング、相談、手術など）
   - クリニック評価（最低3つ星、4つ星など）
   - 空き状況（今日、明日、日付選択）
5. システムは検索結果を2つの形式で表示します：
   - リスト表示：クリニック名、評価、距離、サービスのハイライトを表示
   - マップ表示：インタラクティブなマップ上にクリニックの場所を表示
6. ユーザーは検索結果からクリニックを選択して詳細を表示します
7. システムは完全な情報を含むクリニック詳細ページを表示します

### 3.2. Service and Time Slot Selection
### 3.2. サービスと時間枠選択

**English**
1. From the clinic detail page, user selects the "Services" tab
2. User views the list of services grouped by category
3. User selects the desired service
4. System displays service details (description, duration, price)
5. User clicks the "Select Schedule" button
6. System displays a calendar with available dates
7. User selects the desired date
8. System displays available time slots for that date
9. User selects the desired time slot
10. System makes a temporary reservation for that slot (valid for 10 minutes)

**日本語**
1. クリニック詳細ページから、ユーザーは「サービス」タブを選択します
2. ユーザーはカテゴリ別にグループ化されたサービスリストを確認します
3. ユーザーは希望するサービスを選択します
4. システムはサービス詳細（説明、所要時間、価格）を表示します
5. ユーザーは「スケジュールを選択」ボタンをクリックします
6. システムは利用可能な日付を示すカレンダーを表示します
7. ユーザーは希望する日付を選択します
8. システムはその日の利用可能な時間枠を表示します
9. ユーザーは希望する時間枠を選択します
10. システムはその時間枠に一時的な予約を行います（10分間有効）

### 3.3. Booking Process
### 3.3. 予約プロセス

**English**
1. After selecting the time slot, the system asks the user to select a pet
2. User selects a pet from available profiles or adds a new one
3. If adding a new pet, user fills in basic pet information (name, type, breed, age, weight)
4. User can add additional notes for the clinic
5. System displays a booking summary for confirmation:
   - Clinic details
   - Selected service
   - Date and time
   - Pet
   - Price
6. User confirms booking details and clicks "Continue to Payment"

**日本語**
1. 時間枠を選択した後、システムはユーザーにペットを選択するよう求めます
2. ユーザーは利用可能なプロフィールからペットを選択するか、新しいペットを追加します
3. 新しいペットを追加する場合、ユーザーは基本的なペット情報（名前、種類、品種、年齢、体重）を入力します
4. ユーザーはクリニックへの追加メモを入力できます
5. システムは確認のために予約概要を表示します：
   - クリニック詳細
   - 選択したサービス
   - 日付と時間
   - ペット
   - 価格
6. ユーザーは予約詳細を確認し、「支払いに進む」をクリックします

### 3.4. Payment Process
### 3.4. 支払いプロセス

**English**
1. System displays the payment page with cost details
2. User can enter a promo code (if available)
3. User selects payment method:
   - Saved credit/debit card
   - Add a new card
   - E-wallet (GoPay, OVO, DANA, etc.)
   - Bank virtual account
   - QRIS
4. For payment with a new card, user enters:
   - Card number
   - Cardholder name
   - Expiration date
   - CVV/CVC
5. User can choose to save card information for future use
6. User clicks "Pay Now"
7. System processes the payment and displays status (successful/failed)
8. If payment is successful, system displays confirmation page
9. If payment fails, system displays error message and options to try again

**日本語**
1. システムは費用詳細を含む支払いページを表示します
2. ユーザーはプロモーションコードを入力できます（利用可能な場合）
3. ユーザーは支払い方法を選択します：
   - 保存されたクレジット/デビットカード
   - 新しいカードを追加
   - Eウォレット（GoPay、OVO、DANAなど）
   - 銀行仮想口座
   - QRIS
4. 新しいカードで支払う場合、ユーザーは以下を入力します：
   - カード番号
   - カード所有者名
   - 有効期限
   - CVV/CVC
5. ユーザーは将来の使用のためにカード情報を保存することを選択できます
6. ユーザーは「今すぐ支払う」をクリックします
7. システムは支払いを処理し、ステータス（成功/失敗）を表示します
8. 支払いが成功した場合、システムは確認ページを表示します
9. 支払いが失敗した場合、システムはエラーメッセージと再試行のオプションを表示します

### 3.5. Confirmation and Notifications
### 3.5. 確認と通知

**English**
1. System displays booking confirmation page with:
   - Booking reference code
   - Booking details (clinic, service, time, pet)
   - Payment details
   - Instructions and preparations (if any)
2. System sends booking confirmation email with the same information
3. User can add the booking to device calendar
4. System sends reminder notifications 3 days and 1 day before the booking schedule
5. On the booking day, system sends reminder notification 2 hours before the schedule
6. After the service is completed, system sends notification to request a review

**日本語**
1. システムは以下を含む予約確認ページを表示します：
   - 予約参照コード
   - 予約詳細（クリニック、サービス、時間、ペット）
   - 支払い詳細
   - 指示と準備（あれば）
2. システムは同じ情報を含む予約確認メールを送信します
3. ユーザーはデバイスのカレンダーに予約を追加できます
4. システムは予約スケジュールの3日前と1日前にリマインダー通知を送信します
5. 予約日には、システムはスケジュールの2時間前にリマインダー通知を送信します
6. サービス完了後、システムはレビューをリクエストする通知を送信します

### 3.6. Booking Management
### 3.6. 予約管理

**English**
1. User can view all bookings in the "My Bookings" menu
2. Bookings are grouped by status:
   - Upcoming: future bookings
   - Completed: bookings that have been completed
   - Cancelled: bookings that were cancelled
3. For each booking, user can view complete details
4. For upcoming bookings, user can:
   - Reschedule (change the schedule)
   - Cancel (cancel the booking)
   - Contact the clinic
5. For rescheduling a booking:
   - User selects "Reschedule"
   - System displays calendar with available time slots
   - User selects a new time slot
   - System updates the booking and sends confirmation
6. For cancelling a booking:
   - User selects "Cancel Booking"
   - System displays cancellation policy and potential fees
   - User confirms cancellation
   - System updates booking status and sends confirmation
7. For completed bookings, user can:
   - Give ratings and reviews
   - Book again (create a new booking with the same details)

**日本語**
1. ユーザーは「マイ予約」メニューですべての予約を表示できます
2. 予約はステータス別にグループ化されています：
   - 予定：将来の予約
   - 完了：完了した予約
   - キャンセル：キャンセルされた予約
3. 各予約について、ユーザーは完全な詳細を表示できます
4. 予定の予約について、ユーザーは以下のことができます：
   - 日程変更（スケジュールを変更）
   - キャンセル（予約をキャンセル）
   - クリニックに連絡
5. 予約の日程変更の場合：
   - ユーザーは「日程変更」を選択します
   - システムは利用可能な時間枠を示すカレンダーを表示します
   - ユーザーは新しい時間枠を選択します
   - システムは予約を更新し、確認を送信します
6. 予約をキャンセルする場合：
   - ユーザーは「予約をキャンセル」を選択します
   - システムはキャンセルポリシーと潜在的な料金を表示します
   - ユーザーはキャンセルを確認します
   - システムは予約ステータスを更新し、確認を送信します
7. 完了した予約について、ユーザーは以下のことができます：
   - 評価とレビューを提供
   - 再予約（同じ詳細で新しい予約を作成）

## 4. User Stories and Acceptance Criteria (Level 3)
## 4. ユーザーストーリーと受け入れ基準（レベル3）

### 4.1. Clinic Search and Selection
### 4.1. クリニック検索と選択

#### 4.1.1. User Story: Clinic Search by Location
#### 4.1.1. ユーザーストーリー：場所によるクリニック検索

**English**  
**As a** pet owner  
**I want to** search for veterinary clinics by nearest location  
**So that** I can find clinics that are easily accessible

**Acceptance Criteria:**
- User can search for clinics based on current location
- User can search for clinics based on a specific location input
- System displays a list of clinics with distance from the selected location
- User can adjust the search radius
- Results can be displayed in both list and map formats

**日本語**  
**ペットの飼い主として**  
**私は** 最寄りの場所で動物病院を検索したい  
**そうすれば** 簡単にアクセスできるクリニックを見つけることができます

**受け入れ基準：**
- ユーザーは現在の場所に基づいてクリニックを検索できる
- ユーザーは入力した特定の場所に基づいてクリニックを検索できる
- システムは選択された場所からの距離とともにクリニックのリストを表示する
- ユーザーは検索半径を調整できる
- 結果はリストと地図の両方の形式で表示できる

#### 4.1.2. User Story: Filter Clinics Based on Criteria
#### 4.1.2. ユーザーストーリー：基準に基づくクリニックのフィルタリング

**English**  
**As a** pet owner  
**I want to** filter clinics based on various criteria  
**So that** I can find clinics that best meet my needs

**Acceptance Criteria:**
- User can filter clinics by services offered
- User can filter clinics by rating
- User can filter clinics by day/date availability
- User can filter clinics by types of animals served
- User can apply multiple filters simultaneously
- User can clear all filters with one click

**日本語**  
**ペットの飼い主として**  
**私は** 様々な基準に基づいてクリニックをフィルタリングしたい  
**そうすれば** 私のニーズに最も合うクリニックを見つけることができます

**受け入れ基準：**
- ユーザーは提供されるサービスによってクリニックをフィルタリングできる
- ユーザーは評価によってクリニックをフィルタリングできる
- ユーザーは曜日/日付の利用可能性によってクリニックをフィルタリングできる
- ユーザーは対象とする動物の種類によってクリニックをフィルタリングできる
- ユーザーは複数のフィルターを同時に適用できる
- ユーザーはワンクリックですべてのフィルターをクリアできる

#### 4.1.3. User Story: View Clinic Details
#### 4.1.3. ユーザーストーリー：クリニック詳細の表示

**English**  
**As a** pet owner  
**I want to** view detailed information about the clinic  
**So that** I can evaluate whether the clinic is suitable for my pet

**Acceptance Criteria:**
- User can view basic clinic information (name, address, phone number, operating hours)
- User can view ratings and reviews from other users
- User can view a list of services offered and prices
- User can view photos of the clinic and facilities
- User can view profiles of doctors and staff
- User can get directions to the clinic

**日本語**  
**ペットの飼い主として**  
**私は** クリニックに関する詳細情報を表示したい  
**そうすれば** そのクリニックが私のペットに適しているか評価できます

**受け入れ基準：**
- ユーザーは基本的なクリニック情報（名前、住所、電話番号、営業時間）を表示できる
- ユーザーは他のユーザーからの評価とレビューを表示できる
- ユーザーは提供されているサービスと価格のリストを表示できる
- ユーザーはクリニックと設備の写真を表示できる
- ユーザーは医師とスタッフのプロフィールを表示できる
- ユーザーはクリニックへの道案内を取得できる

### 4.2. Service and Time Slot Selection
### 4.2. サービスと時間枠選択

#### 4.2.1. User Story: View and Select Services
#### 4.2.1. ユーザーストーリー：サービスの表示と選択

**English**  
**As a** pet owner  
**I want to** view and select services available at the clinic  
**So that** I can find services that meet my pet's needs

**Acceptance Criteria:**
- User can view a list of services grouped by category
- User can view service details (description, duration, price)
- User can compare similar services
- User can select desired service
- System confirms service selection and directs to time selection

**日本語**  
**ペットの飼い主として**  
**私は** クリニックで利用可能なサービスを表示し選択したい  
**そうすれば** 私のペットのニーズに合うサービスを見つけることができます

**受け入れ基準：**
- ユーザーはカテゴリ別にグループ化されたサービスのリストを表示できる
- ユーザーはサービスの詳細（説明、所要時間、価格）を表示できる
- ユーザーは類似のサービスを比較できる
- ユーザーは希望するサービスを選択できる
- システムはサービス選択を確認し、時間選択に誘導する

#### 4.2.2. User Story: Select Time Slot
#### 4.2.2. ユーザーストーリー：時間枠の選択

**English**  
**As a** pet owner  
**I want to** select available dates and times for booking  
**So that** I can schedule a visit according to my availability

**Acceptance Criteria:**
- System displays a calendar with available dates
- Unavailable dates are clearly marked
- After selecting a date, user can view available time slots
- Time slots are clearly displayed (available/unavailable)
- User can easily select desired time slot
- System confirms time slot selection and makes a temporary reservation

**日本語**  
**ペットの飼い主として**  
**私は** 予約のために利用可能な日付と時間を選択したい  
**そうすれば** 私の予定に合わせて訪問を計画できます

**受け入れ基準：**
- システムは利用可能な日付を示すカレンダーを表示する
- 利用できない日付は明確にマークされている
- 日付を選択した後、ユーザーは利用可能な時間枠を表示できる
- 時間枠は明確に表示される（利用可能/利用不可）
- ユーザーは簡単に希望の時間枠を選択できる
- システムは時間枠の選択を確認し、仮予約を行う
