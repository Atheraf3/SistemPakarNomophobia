import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import axios from "axios";

const useDiagnosisStore = create(
  devtools(
    persist(
      (set, get) => ({
        // State
        selectedSymptoms: [],
        diagnosisResult: null, 
        currentStep: 0,       
        isLoading: false,
        error: null,

        // Actions
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

        // API Calls
        submitDiagnosisToBackend: async (answersMap) => {
          set({ isLoading: true, error: null });
          try {
            const userInputs = Object.entries(answersMap).map(([gejalaId, cfUser]) => ({
              gejalaId,
              cfUser
            }));

            const token = localStorage.getItem('token');
            const config = {
              headers: token ? { Authorization: `Bearer ${token}` } : {}
            };

            const apiUrl = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/diagnosis` : 'http://localhost:5151/api/diagnosis';
            const response = await axios.post(apiUrl, { userInputs }, config);
            
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
        name: "diagnosis-storage",
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
