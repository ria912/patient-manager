'use client';

import { useMemo, useState } from 'react';
import { updateResultAction } from '@/app/patients/[id]/actions';

type TestResultDisplay = {
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
  tlc: number | null;
  pni: number | null;
  conut: number | null;
};

type Props = {
  results: TestResultDisplay[];
  patientId: string;
};

type ResultRow = {
  label: string;
  key: keyof Pick<
    TestResultDisplay,
    | 'crp'
    | 'albumin'
    | 'wbc'
    | 'lymph_pct'
    | 'triglyceride'
    | 'total_cholesterol'
    | 'pre_albumin'
    | 'tlc'
    | 'pni'
    | 'conut'
  >;
  accent?: boolean;
};

const resultRows: ResultRow[] = [
  { label: 'CRP', key: 'crp' },
  { label: 'Alb', key: 'albumin' },
  { label: 'WBC', key: 'wbc' },
  { label: 'Lym%', key: 'lymph_pct' },
  { label: 'TG', key: 'triglyceride' },
  { label: 'T-Cho', key: 'total_cholesterol' },
  { label: 'Pre-Alb', key: 'pre_albumin' },
  { label: 'TLC (/μL)', key: 'tlc', accent: true },
  { label: 'PNI', key: 'pni', accent: true },
  { label: 'CONUT', key: 'conut', accent: true },
];

const thStyle = { border: '1px solid #ddd', padding: '8px', whiteSpace: 'nowrap' } as const;
const rowHeaderStyle = { ...thStyle, width: '1%' } as const;
const tdStyle = { border: '1px solid #ddd', padding: '8px' } as const;

export default function TransposedTestResultsTable({ results, patientId }: Props) {
  const [editingId, setEditingId] = useState<string | null>(null);

  const editingResult = useMemo(
    () => results.find((result) => result.id === editingId) ?? null,
    [results, editingId]
  );

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table className="table" style={{ marginTop: '10px', minWidth: '800px', fontSize: '14px' }}>
          <thead>
            <tr style={{ textAlign: 'center' }}>
              <th style={rowHeaderStyle}>検査項目</th>
              {results.map((result) => (
                <th key={result.id} style={thStyle}>
                  <button
                    type="button"
                    onClick={() => setEditingId(result.id)}
                    style={{
                      width: '100%',
                      background: 'transparent',
                      border: 'none',
                      padding: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      textDecoration: 'underline',
                    }}
                  >
                    {result.test_date}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {resultRows.map((row) => (
              <tr key={row.label}>
                <th style={rowHeaderStyle}>{row.label}</th>
                {results.map((result) => {
                  const value =
                    row.key === 'tlc'
                      ? result.tlc?.toLocaleString() ?? '-'
                      : row.key === 'pni'
                      ? result.pni ?? '-'
                      : row.key === 'conut'
                      ? result.conut !== null
                        ? result.conut
                        : '-'
                      : (result as any)[row.key] ?? '-';

                  const color =
                    row.key === 'pni'
                      ? result.pni !== null && result.pni < 40
                        ? 'red'
                        : 'inherit'
                      : row.key === 'conut'
                      ? result.conut !== null && result.conut >= 5
                        ? 'red'
                        : 'inherit'
                      : 'inherit';

                  return (
                    <td
                      key={result.id}
                      style={{
                        ...tdStyle,
                        textAlign: 'right',
                        fontWeight: row.accent ? 'bold' : 'normal',
                        color,
                      }}
                    >
                      {value}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingResult && (
        <form action={updateResultAction} className="card" style={{ marginTop: '18px' }}>
          <h3 style={{ marginTop: 0 }}>検査結果を編集: {editingResult.test_date}</h3>
          <input type="hidden" name="id" value={editingResult.id} />
          <input type="hidden" name="patient_id" value={patientId} />

          <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <label>
              検査日
              <input type="date" name="test_date" defaultValue={editingResult.test_date} required />
            </label>
            <label>
              CRP
              <input type="number" step="0.01" name="crp" defaultValue={editingResult.crp ?? undefined} />
            </label>
            <label>
              Alb
              <input type="number" step="0.1" name="albumin" defaultValue={editingResult.albumin ?? undefined} />
            </label>
            <label>
              WBC
              <input type="number" step="0.1" name="wbc" defaultValue={editingResult.wbc ?? undefined} />
            </label>
            <label>
              Lym%
              <input type="number" step="0.1" name="lymph_pct" defaultValue={editingResult.lymph_pct ?? undefined} />
            </label>
            <label>
              TG
              <input type="number" name="triglyceride" defaultValue={editingResult.triglyceride ?? undefined} />
            </label>
            <label>
              T-Cho
              <input type="number" name="total_cholesterol" defaultValue={editingResult.total_cholesterol ?? undefined} />
            </label>
            <label>
              Pre-Alb
              <input type="number" step="0.1" name="pre_albumin" defaultValue={editingResult.pre_albumin ?? undefined} />
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '18px' }}>
            <button type="submit" className="btn">更新</button>
            <button type="button" className="btn secondary" onClick={() => setEditingId(null)}>
              キャンセル
            </button>
          </div>
        </form>
      )}
    </>
  );
}
