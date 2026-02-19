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
    // memo, height, weight を取得
    const memo = (form.elements.namedItem('memo') as HTMLInputElement).value;
    const heightValue = (form.elements.namedItem('height') as HTMLInputElement).value;
    const weightValue = (form.elements.namedItem('weight') as HTMLInputElement).value;
    const height = heightValue ? parseFloat(heightValue) : null; // cm
    const weight = weightValue ? parseFloat(weightValue) : null; // kg

    // 1. Supabaseへのデータ挿入処理
    const { error } = await supabase
      .from('patients') // patientsテーブルを指定
      .insert([
        { name: name, age: age, memo: memo, height: height, weight: weight },
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
        
        <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="height" style={{ display: 'block', marginBottom: '5px' }}>身長 (cm)</label>
            <input
              type="number"
              id="height"
              name="height"
              min="0"
              step="0.1"
              placeholder="例: 170"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label htmlFor="weight" style={{ display: 'block', marginBottom: '5px' }}>体重 (kg)</label>
            <input
              type="number"
              id="weight"
              name="weight"
              min="0"
              step="0.1"
              placeholder="例: 60"
              style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="memo" style={{ display: 'block', marginBottom: '5px' }}>メモ</label>
          <input
            type="text"
            id="memo"
            name="memo"
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