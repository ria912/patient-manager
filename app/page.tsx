// lib/supabase.js で作成した接続設定をインポート
import { supabase } from '../lib/supabase';
// PatientFormコンポーネントをインポート
import PatientForm from '@/app/patients/PatientForm';
// リンク機能を使うためにインポートを追加
import Link from 'next/link';

// 患者データの型定義（TypeScriptのインターフェース）
interface Patient {
  id: string;
  created_at: string;
  name: string;
  age: number;
  memo: string;
}
// Next.jsに対して、このページをキャッシュしないで、
// 常に新しいデータを取り直すように指示する設定です。
export const revalidate = 0;
// データを取得する非同期関数
// 'async' は、この関数がデータベースへの問い合わせという「時間がかかる処理」を
// 行うことを示しています。
async function getPatients() {
  // 'await' は、データが完全に取れるまで、次の行の実行を待つという意味です。
  const { data: patients, error } = await supabase
    // どのテーブルから取得するかを指定
    .from('patients')
    // すべての列 (*) を取得
    .select('*');

  // エラー処理（もしデータ取得に失敗したら、コンソールにメッセージを出力）
  if (error) {
    console.error('患者データの取得中にエラーが発生しました:', error);
    return []; // エラーの場合は空の配列を返す
  }
  
  // 取得した患者データの配列を返す
  return patients as Patient[];
}

// Next.jsのページコンポーネント
// この関数が、画面に表示される内容を定義しています。
export default async function Home() {
  // ページが表示される前に、上の getPatients 関数を実行してデータを取得
  const patientsList = await getPatients();

  return (
    <main>
      <h1>👨‍⚕️ 患者ダッシュボード</h1>
      <PatientForm />
      <h2>📄 患者リスト</h2>
      {patientsList.length === 0 ? (
        <p>登録されている患者データがありません。</p>
      ) : (
        // データがあれば、リスト表示（<ul>）
        <ul>
          {/* リスト内の各患者データに対して、<li>タグを生成して表示 */}
          {patientsList.map((patient) => (
            // keyはリスト表示で必須の識別子です。データベースのIDを使います。
            <li key={patient.id} className="card" style={{ margin: '10px 0' }}>
              {/* Linkタグで名前を囲み、クリックしたら詳細ページへ飛ぶようにします */}
              <Link href={`/patients/${patient.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <h2 style={{ cursor: 'pointer', margin: 0 }}>{patient.name} 🔗</h2>
              </Link>
              <p style={{ marginTop: 8 }}>年齢: {patient.age}歳 / メモ: {patient.memo}</p>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}