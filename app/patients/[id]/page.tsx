import { supabase } from '@/lib/supabase';
import TestResultForm from '@/components/TestResultForm';
import EditableTestResultRow from '@/components/EditableTestResultRow';

// ----------------------------------------------------
// 1. 型定義
// ----------------------------------------------------
interface Patient {
  id: string;
  created_at: string;
  name: string;
  age: number | null;
  memo: string | null;
  height?: number | null;
  weight?: number | null;
}

// DBから取得する生のデータ型
interface TestResultRaw {
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
}

// 計算結果を含む表示用の拡張型
interface TestResultDisplay extends TestResultRaw {
  tlc: number | null;    // 総リンパ球数
  pni: number | null;    // PNI
  conut: number | null;  // CONUTスコア
}

export const revalidate = 0;

// ----------------------------------------------------
// 2. 計算ロジック関数
// ----------------------------------------------------

// CONUTスコアの計算ヘルパー
const calculateConut = (alb: number, tlc: number, tcho: number) => {
  let score = 0;

  // Albumin スコア
  if (alb >= 3.5) score += 0;
  else if (alb >= 3.0) score += 2;
  else if (alb >= 2.5) score += 4;
  else score += 6;

  // TLC (総リンパ球数) スコア
  if (tlc >= 1600) score += 0;
  else if (tlc >= 1200) score += 1;
  else if (tlc >= 800) score += 2;
  else score += 3;

  // Total Cholesterol スコア
  if (tcho >= 180) score += 0;
  else if (tcho >= 140) score += 1;
  else if (tcho >= 100) score += 2;
  else score += 3;

  return score;
};

// データを整形して計算値を付与する関数
function enrichTestResults(results: TestResultRaw[]): TestResultDisplay[] {
  return results.map((r) => {
    // 必要な値が揃っているか確認
    const hasWbc = r.wbc !== null;
    const hasLymph = r.lymph_pct !== null;
    const hasAlb = r.albumin !== null;
    const hasTcho = r.total_cholesterol !== null;

    let tlc: number | null = null;
    let pni: number | null = null;
    let conut: number | null = null;

    // 1. 総リンパ球数 (TLC) 計算
    if (hasWbc && hasLymph) {
      tlc = Math.round((r.wbc! * 100) * (r.lymph_pct! / 100));
    }

    // 2. PNI 計算
    if (hasAlb && tlc !== null) {
      const val = (10 * r.albumin!) + (0.005 * tlc);
      pni = Math.round(val * 10) / 10; // 小数点第1位まで
    }

    // 3. CONUT 計算 (Alb, TLC, T-Choが必要)
    if (hasAlb && tlc !== null && hasTcho) {
      conut = calculateConut(r.albumin!, tlc, r.total_cholesterol!);
    }

    return { ...r, tlc, pni, conut };
  });
}

// ----------------------------------------------------
// 3. データ取得関数
// ----------------------------------------------------
async function getPatientDetails(id: string): Promise<Patient | null> {
  const { data, error } = await supabase
    .from('patients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
}

async function getTestResults(id: string): Promise<TestResultRaw[]> {
  const { data, error } = await supabase
    .from('test_results')
    .select('*')
    .eq('patient_id', id)
    .order('test_date', { ascending: false });

  if (error) return [];
  return data as TestResultRaw[];
}

// ----------------------------------------------------
// 4. ページコンポーネント
// ----------------------------------------------------
export default async function PatientDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params; // Next.js 15対応

  const [patient, rawResults] = await Promise.all([
    getPatientDetails(id),
    getTestResults(id),
  ]);

  if (!patient) {
    return (
      <main>
        <h1>🚫 患者データが見つかりませんでした。</h1>
      </main>
    );
  }

  // ここで計算処理を実行
  const resultsList = enrichTestResults(rawResults);

  return (
    <main>
      <div className="card" style={{ marginBottom: 18 }}>
        {(() => {
          const bmi = (patient.height && patient.weight) ? (patient.weight / ((patient.height / 100) ** 2)) : null;
          return (
            <>
              <h1>👤 {patient.name} さん（{patient.age}歳{bmi ? ` / BMI ${bmi.toFixed(1)}` : ''}）</h1>
              <p style={{ fontSize: '1.05em', marginTop: 8, marginBottom: 0 }}>
                身長: {patient.height !== null && patient.height !== undefined ? `${patient.height} cm` : '—'} / 体重: {patient.weight !== null && patient.weight !== undefined ? `${patient.weight} kg` : '—'} / BMI: {bmi ? bmi.toFixed(1) : '—'}
                <br />
                メモ: {patient.memo || 'なし'}
              </p>
            </>
          );
        })()}
      </div>

      <TestResultForm patientId={id} />

      <h2>🧪 検査結果履歴 ({resultsList.length}件)</h2>
      {resultsList.length === 0 ? (
        <p>検査結果はまだ登録されていません。</p>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ marginTop: '10px', minWidth: '800px', fontSize: '14px' }}>
            <thead>
              <tr style={{ textAlign: 'center' }}>
                <th style={thStyle}>検査日</th>
                <th style={thStyle}>CRP</th>
                <th style={thStyle}>Alb</th>
                <th style={thStyle}>WBC</th>
                <th style={thStyle}>Lym%</th>
                <th style={thStyle}>TG</th>
                <th style={thStyle}>T-Cho</th>
                <th style={thStyle}>Pre-Alb</th>
                {/* 計算項目 */}
                <th className="table-accent" style={thStyle}>TLC (/μL)</th>
                <th className="table-accent" style={thStyle}>PNI</th>
                <th className="table-accent" style={thStyle}>CONUT</th>
              </tr>
            </thead>
            <tbody>
              {resultsList.map((result) => (
                <EditableTestResultRow key={result.id} result={result} patientId={id} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

// スタイルの定義（コードを見やすくするため変数化）
const thStyle = { border: '1px solid #ddd', padding: '8px', whiteSpace: 'nowrap' } as const;
const tdStyle = { border: '1px solid #ddd', padding: '8px' } as const;