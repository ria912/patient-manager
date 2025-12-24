'use client';

import { addResultAction } from '@/app/patients/[id]/actions';
import { useRef, useState } from 'react';

// ----------------------------------------------------
// 2. フォームコンポーネント
// ----------------------------------------------------
interface ExamResultFormProps {
  patientId: string; 
}

export default function TestResultForm({ patientId }: ExamResultFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});
  const inputOrder = ['test_date', 'crp', 'albumin', 'wbc', 'lymph_pct', 'triglyceride', 'total_cholesterol', 'pre_albumin'];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentFieldName: string) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const currentIndex = inputOrder.indexOf(currentFieldName);
      const nextFieldName = inputOrder[currentIndex + 1];
      
      if (nextFieldName) {
        inputRefs.current[nextFieldName]?.focus();
      } else {
        // 最後のフィールドの場合、送信ボタンにフォーカス
        const submitButton = (e.currentTarget.form?.querySelector('button[type="submit"]') as HTMLButtonElement);
        submitButton?.focus();
      }
    }
  };

  return (
    <div className="spaced">
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="accordion-toggle"
      >
        <span>🧪 検査結果を登録</span>
        <span style={{ fontSize: '20px' }}>{isOpen ? '▼' : '▶'}</span>
      </button>

      {isOpen && (
        <form action={addResultAction} className="card" style={{ marginTop: '-1px', borderRadius: '0 0 8px 8px', backgroundColor: 'transparent' }}>
          <input type="hidden" name="patient_id" value={patientId} />

          <div style={{ marginBottom: '10px' }}>
            <label htmlFor="test_date">検査日:</label>
            <input 
              type="date" 
              id="test_date" 
              name="test_date" 
              required 
              defaultValue={new Date().toISOString().substring(0, 10)} 
              style={{ marginLeft: '10px' }}
              ref={(el) => { if (el) inputRefs.current['test_date'] = el; }}
              onKeyDown={(e) => handleKeyDown(e, 'test_date')}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px', marginTop: '15px' }}>
            <label>CRP: <input type="number" step="0.01" name="crp" placeholder="例: 0.35" style={{ width: '100%' }} ref={(el) => { if (el) inputRefs.current['crp'] = el; }} onKeyDown={(e) => handleKeyDown(e, 'crp')} /></label>
            <label>Alb: <input type="number" step="0.1" name="albumin" placeholder="例: 4.2" style={{ width: '100%' }} ref={(el) => { if (el) inputRefs.current['albumin'] = el; }} onKeyDown={(e) => handleKeyDown(e, 'albumin')} /></label>
            <label>白血球数 (WBC): <input type="number" step="0.1" name="wbc" placeholder="例: 21.5" style={{ width: '100%' }} ref={(el) => { if (el) inputRefs.current['wbc'] = el; }} onKeyDown={(e) => handleKeyDown(e, 'wbc')} /></label>
            <label>lymph%: <input type="number" step="0.1" name="lymph_pct" placeholder="例: 35.5" style={{ width: '100%' }} ref={(el) => { if (el) inputRefs.current['lymph_pct'] = el; }} onKeyDown={(e) => handleKeyDown(e, 'lymph_pct')} /></label>
            <label>TG: <input type="number" name="triglyceride" placeholder="例: 120" style={{ width: '100%' }} ref={(el) => { if (el) inputRefs.current['triglyceride'] = el; }} onKeyDown={(e) => handleKeyDown(e, 'triglyceride')} /></label>
            <label>T-Cho: <input type="number" name="total_cholesterol" placeholder="例: 210" style={{ width: '100%' }} ref={(el) => { if (el) inputRefs.current['total_cholesterol'] = el; }} onKeyDown={(e) => handleKeyDown(e, 'total_cholesterol')} /></label>
            {/* スキーマにある pre_albumin に対応 */}
            <label>プレアルブミン: <input type="number" step="0.1" name="pre_albumin" placeholder="例: 20.5" style={{ width: '100%' }} ref={(el) => { if (el) inputRefs.current['pre_albumin'] = el; }} onKeyDown={(e) => handleKeyDown(e, 'pre_albumin')} /></label>
          </div>

          <button type="submit" className="btn" style={{ marginTop: '20px' }}>
            検査結果を登録
          </button>
        </form>
      )}
    </div>
  );
}