import { useState, useCallback } from "react";
import { runForwardChaining } from "@/utils/inferenceEngine";
import { rules } from "@/services/knowledgeBase";
import useDiagnosisStore from "@/store/useDiagnosisStore";

/**
 * Custom hook untuk menjalankan proses diagnosis
 * Mengakses Zustand store dan inference engine
 */
export function useDiagnosis() {
  const [error, setError] = useState(null);

  const {
    selectedSymptoms,
    diagnosisResult,
    isLoading,
    setDiagnosisResult,
    setLoading,
    resetDiagnosis,
    toggleSymptom,
  } = useDiagnosisStore();

  const runDiagnosis = useCallback(async () => {
    if (selectedSymptoms.length === 0) {
      setError("Pilih minimal satu gejala untuk memulai diagnosis.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      // Simulasi async (misal: fetch ke API backend)
      await new Promise((resolve) => setTimeout(resolve, 800));
      const results = runForwardChaining(selectedSymptoms, rules);
      setDiagnosisResult(results);
    } catch (err) {
      setError("Terjadi kesalahan saat menjalankan diagnosis.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedSymptoms, setDiagnosisResult, setLoading]);

  return {
    selectedSymptoms,
    diagnosisResult,
    isLoading,
    error,
    toggleSymptom,
    runDiagnosis,
    resetDiagnosis,
  };
}
