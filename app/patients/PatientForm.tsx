'use client'; // Next.jsでクライアントサイド（ブラウザ側）の機能を使うためのおまじない

import { useState } from 'react';
import { supabase } from '@/lib/supabase'; // @/lib/supabase は '../lib/supabase' と同じ意味で使えます
import { useRouter } from 'next/navigation';

// フォームコンポーネントの定義
export default function PatientForm() {
  // フォーム送信中の状態を管理するためのState（状態変数）
  const [isLoading, setIsLoading] = useState(false);
  // useRouterフックを初期化
  const router = useRouter();
  
  // フォームが送信されたときに実行される関数
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // ページのリロードを防ぐ（必須）
    event.preventDefault(); //

    setIsLoading(true);

    // フォームから入力値を取得
    const form = event.currentTarget;
    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const age = parseInt((form.elements.namedItem('age') as HTMLInputElement).value);
    // diseaseの入力フィールドは削除しましたが、
    // page.tsxの型定義に合わせた 'memo' フィールドを暫定的に空で挿入します。
    // const disease = (form.elements.namedItem('disease') as HTMLInputElement).value; // 削除

    // 1. Supabaseへのデータ挿入処理
    const { error } = await supabase
      .from('patients') // patientsテーブルを指定
      .insert([
        // disease を削除し、memo を追加
        { name: name, age: age, memo: '' },
      ]);

    setIsLoading(false);

    // 2. 処理結果の通知とリセット
    if (error) {
      console.error('患者データの追加中にエラーが発生しました:', error);
      alert('データの追加に失敗しました。コンソールを確認してください。');
    } else {
      alert(`患者 ${name} さんのデータを追加しました！`);
      // フォームをリセット
      form.reset();
      // ページ全体のリロードの代わりに、キャッシュをリフレッシュする
      router.refresh(); //
    }
  };

  return (
    <div className="card" style={{ maxWidth: 480, margin: '20px 0' }}>
      <h2>+ 新規患者の登録</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="name" style={{ display: 'block', marginBottom: '5px' }}>患者名</label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className=""
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="age" style={{ display: 'block', marginBottom: '5px' }}>年齢</label>
          <input
            type="number"
            id="age"
            name="age"
            required
            min="0"
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="memo" style={{ display: 'block', marginBottom: '5px' }}>メモ</label>
          <input
            type="text"
            id="memo"
            name="memo"
            // requiredは外します。メモは必須ではないことが多いため
          />
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="btn"
          style={{ opacity: isLoading ? 0.7 : 1 }}
        >
          {isLoading ? '登録中...' : '登録する'}
        </button>
      </form>
    </div>
  );
}