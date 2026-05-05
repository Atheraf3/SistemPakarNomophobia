import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import axios from "axios";

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
        error: null,

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

        setCurrentStep: (step) => set({ currentStep: step }),

        setLoading: (isLoading) => set({ isLoading }),

        resetDiagnosis: () =>
          set({
            selectedSymptoms: [],
            diagnosisResult: null,
            currentStep: 0,
            isLoading: false,
            error: null,
          }),

        // --- API Calls ---
        submitDiagnosisToBackend: async (answersMap) => {
          set({ isLoading: true, error: null });
          try {
            // Ubah format answersMap ({ "G01": 0.8 }) menjadi array of objects: [{ gejalaId: "G01", cfUser: 0.8 }]
            const userInputs = Object.entries(answersMap).map(([gejalaId, cfUser]) => ({
              gejalaId,
              cfUser
            }));

            // Pastikan jika ada token, Authorization header digunakan.
            // Diambil dari localStorage yang mungkin di set oleh auth store.
            const token = localStorage.getItem('token');
            const config = {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            };

            const response = await axios.post('http://localhost:5151/api/diagnosis', { userInputs }, config);
            
            // Asumsi response backend { message: "...", data: { nilai_cf, persentase, tingkat_keparahan, ... } }
            set({ diagnosisResult: response.data.data, isLoading: false });
            return response.data.data;
          } catch (error) {
            console.error("Diagnosis error:", error);
            set({ 
              isLoading: false, 
              error: error.response?.data?.message || "Terjadi kesalahan saat memproses diagnosis" 
            });
            return null;
          }
        }
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
