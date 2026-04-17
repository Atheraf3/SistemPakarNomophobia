export const symptoms = [
  { id: "G001", label: "Demam tinggi (>38°C)" },
  { id: "G002", label: "Sakit kepala" },
  { id: "G003", label: "Mual atau muntah" },
  { id: "G004", label: "Ruam kulit" },
  { id: "G005", label: "Nyeri sendi" },
  { id: "G006", label: "Batuk kering" },
  { id: "G007", label: "Sesak napas" },
  { id: "G008", label: "Kelelahan ekstrem" },
  { id: "G009", label: "Kehilangan nafsu makan" },
  { id: "G010", label: "Pendarahan di bawah kulit" },
];

export const rules = [
  {
    id: "P001",
    conclusion: "Demam Berdarah Dengue (DBD)",
    description: "Infeksi virus dengue yang ditularkan melalui gigitan nyamuk Aedes aegypti.",
    conditions: ["G001", "G004", "G005", "G010", "G008"],
  },
  {
    id: "P002",
    conclusion: "Flu / Influenza",
    description: "Infeksi virus influenza yang menyerang saluran pernapasan.",
    conditions: ["G001", "G002", "G006", "G008", "G009"],
  },
  {
    id: "P003",
    conclusion: "COVID-19",
    description: "Infeksi virus SARS-CoV-2 yang menyerang sistem pernapasan.",
    conditions: ["G001", "G006", "G007", "G008", "G009"],
  },
  {
    id: "P004",
    conclusion: "Tifoid / Tipes",
    description: "Infeksi bakteri Salmonella typhi yang menyerang saluran pencernaan.",
    conditions: ["G001", "G002", "G003", "G008", "G009"],
  },
];
