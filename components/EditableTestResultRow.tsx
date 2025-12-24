'use client';

// 新規: 行単位で表示 / 編集を切り替えるクライアントコンポーネント
import React, { useState } from 'react';
import { updateResultAction } from '@/app/patients/[id]/actions';

type Props = {
  result: {
    id: string;
    patient_id: string;
    test_date: string;
    crp: number | null;
    albumin: number | null;
    wbc: number | null;
    lymph_pct: number | null;
    triglyceride: number | null;
    total_cholesterol: number | null;
    pre_albumin: number | null;
    tlc?: number | null;
    pni?: number | null;
    conut?: number | null;
  };
  patientId: string;
};

export default function EditableTestResultRow({ result, patientId }: Props) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    const handleDateKeyDown = (e: React.KeyboardEvent<HTMLTableCellElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        setEditing(true);
      }
    };

    return (
      <tr>
        <td
          style={{ border: '1px solid #ddd', padding: '8px', cursor: 'pointer' }}
          role="button"
          tabIndex={0}
          onClick={() => setEditing(true)}
          onKeyDown={handleDateKeyDown}
        >
          {result.test_date}
        </td>
        <td style={{ ...tdStyle, textAlign: 'right' }}>{result.crp}</td>
        <td style={{ ...tdStyle, textAlign: 'right' }}>{result.albumin}</td>
        <td style={{ ...tdStyle, textAlign: 'right' }}>{result.wbc}</td>
        <td style={{ ...tdStyle, textAlign: 'right' }}>{result.lymph_pct}</td>
        <td style={{ ...tdStyle, textAlign: 'right' }}>{result.pre_albumin}</td>
        <td style={{ ...tdStyle, textAlign: 'right' }}>{result.total_cholesterol}</td>

        <td className="table-accent-cell" style={{ ...tdStyle, textAlign: 'right', fontWeight: 'bold' }}>
          {result.tlc?.toLocaleString() ?? '-'}
        </td>
        <td className="table-accent-cell" style={{ 
          ...tdStyle, 
          textAlign: 'right', 
          fontWeight: 'bold', 
          color: (result.pni && result.pni < 40) ? 'red' : 'inherit'
        }}>
          {result.pni ?? '-'}
        </td>
        <td className="table-accent-cell" style={{ 
          ...tdStyle, 
          textAlign: 'center', 
          fontWeight: 'bold', 
          color: (result.conut && result.conut >= 5) ? 'red' : 'inherit'
        }}>
          {result.conut !== null ? result.conut : '-'}
        </td>
      </tr>
    );
  }

  // 編集モード: 同じ行内にフォームを展開して更新する
  return (
    <tr>
      <td colSpan={10} style={{ padding: 8 }}>
        <form action={updateResultAction} method="post" style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <input type="hidden" name="id" value={result.id} />
          <input type="hidden" name="patient_id" value={patientId} />

          <input type="date" name="test_date" defaultValue={result.test_date} />
          <input type="number" step="0.01" name="crp" placeholder="CRP" defaultValue={result.crp ?? undefined} />
          <input type="number" step="0.1" name="albumin" placeholder="Alb" defaultValue={result.albumin ?? undefined} />
          <input type="number" step="0.1" name="wbc" placeholder="WBC" defaultValue={result.wbc ?? undefined} />
          <input type="number" step="0.1" name="lymph_pct" placeholder="Lym%" defaultValue={result.lymph_pct ?? undefined} />
          <input type="number" name="triglyceride" placeholder="TG" defaultValue={result.triglyceride ?? undefined} />
          <input type="number" name="total_cholesterol" placeholder="T-Cho" defaultValue={result.total_cholesterol ?? undefined} />
          <input type="number" step="0.1" name="pre_albumin" placeholder="Pre-Alb" defaultValue={result.pre_albumin ?? undefined} />

          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button type="submit" className="btn">保存</button>
            <button type="button" className="btn secondary" onClick={() => setEditing(false)}>キャンセル</button>
          </div>
        </form>
      </td>
    </tr>
  );
}

// ページで使っているスタイル変数をコピー
const tdStyle = { border: '1px solid #ddd', padding: '8px' } as const;