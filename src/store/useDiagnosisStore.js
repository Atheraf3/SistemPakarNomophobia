import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

/**
 * Store utama untuk Sistem Pakar
 * Mengelola state proses diagnosis: gejala yang dipilih, hasil inference, dan status session
 */
const useDiagnosisStore = create(
  devtools(
    persist(
      (set, get) => ({
        // --- State ---
        selectedSymptoms: [], // Array of symptom IDs yang dipilih user
        diagnosisResult: null, // Hasil inference engine
        currentStep: 0,       // Langkah saat ini dalam wizard diagnosis
        isLoading: false,

        // --- Actions ---
        addSymptom: (symptomId) =>
          set((state) => ({
            selectedSymptoms: state.selectedSymptoms.includes(symptomId)
              ? state.selectedSymptoms
              : [...state.selectedSymptoms, symptomId],
          })),

        removeSymptom: (symptomId) =>
          set((state) => ({
            selectedSymptoms: state.selectedSymptoms.filter((id) => id !== symptomId),
          })),

        toggleSymptom: (symptomId) => {
          const { selectedSymptoms } = get();
          if (selectedSymptoms.includes(symptomId)) {
            set({ selectedSymptoms: selectedSymptoms.filter((id) => id !== symptomId) });
          } else {
            set({ selectedSymptoms: [...selectedSymptoms, symptomId] });
          }
        },

        setDiagnosisResult: (result) => set({ diagnosisResult: result }),

        setCurrentStep: (step) => set({ currentStep: step }),

        setLoading: (isLoading) => set({ isLoading }),

        resetDiagnosis: () =>
          set({
            selectedSymptoms: [],
            diagnosisResult: null,
            currentStep: 0,
            isLoading: false,
          }),
      }),
      {
        name: "diagnosis-storage", // Key untuk localStorage
        partialize: (state) => ({
          selectedSymptoms: state.selectedSymptoms,
          currentStep: state.currentStep,
        }),
      }
    ),
    { name: "DiagnosisStore" }
  )
);

export default useDiagnosisStore;
