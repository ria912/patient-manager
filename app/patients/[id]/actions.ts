'use server';

import { supabase } from '@/lib/supabase';
import { revalidatePath } from 'next/cache';

export async function addResultAction(formData: FormData) {
  const patient_id = formData.get('patient_id') as string;
  
  // 入力値の取得と型変換 (NaN対策で未入力時は null を許容するロジックにするのが理想ですが、一旦簡易的に変換)
  const dataToInsert = {
    patient_id: patient_id, 
    test_date: formData.get('test_date') as string,
    crp: parseFloat(formData.get('crp') as string) || null,
    albumin: parseFloat(formData.get('albumin') as string) || null,
    wbc: parseFloat(formData.get('wbc') as string) || null,
    lymph_pct: parseFloat(formData.get('lymph_pct') as string) || null,
    triglyceride: parseInt(formData.get('triglyceride') as string) || null,
    total_cholesterol: parseInt(formData.get('total_cholesterol') as string) || null,
    pre_albumin: parseFloat(formData.get('pre_albumin') as string) || null,
  };

  const { error } = await supabase
    .from('test_results')
    .insert([dataToInsert]); 

  if (error) {
    console.error('検査結果の登録に失敗:', error);
    // エラーハンドリングが必要であればここでthrowやreturn stateなどを行う
    return;
  }

  revalidatePath(`/patients/${patient_id}`);
}

// 検査結果更新アクション
export async function updateResultAction(formData: FormData) {
  const id = formData.get('id') as string;
  const patient_id = formData.get('patient_id') as string;

  const dataToUpdate = {
    test_date: formData.get('test_date') as string,
    crp: parseFloat(formData.get('crp') as string) || null,
    albumin: parseFloat(formData.get('albumin') as string) || null,
    wbc: parseFloat(formData.get('wbc') as string) || null,
    lymph_pct: parseFloat(formData.get('lymph_pct') as string) || null,
    triglyceride: parseInt(formData.get('triglyceride') as string) || null,
    total_cholesterol: parseInt(formData.get('total_cholesterol') as string) || null,
    pre_albumin: parseFloat(formData.get('pre_albumin') as string) || null,
  };

  const { error } = await supabase
    .from('test_results')
    .update(dataToUpdate)
    .eq('id', id);

  if (error) {
    console.error('検査結果の更新に失敗:', error);
    return;
  }

  revalidatePath(`/patients/${patient_id}`);
}