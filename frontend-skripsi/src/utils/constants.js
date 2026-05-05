

export const cfOptions = [
  { label: "Pasti", value: 1.0, description: "Saya pasti mengalami ini" },
  { label: "Sering", value: 0.8, description: "Saya sering mengalami ini" },
  { label: "Kadang-kadang", value: 0.5, description: "Saya kadang mengalami ini" },
  { label: "Jarang", value: 0.3, description: "Saya jarang mengalami ini" },
  { label: "Tidak Pernah", value: 0.0, description: "Saya tidak mengalami ini" },
];

export function interpretCFLevel(percentage) {
  if (percentage >= 70) {
    return {
      label: "Tinggi",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      badgeColor: "bg-red-100 text-red-700",
      barColor: "bg-red-500",
    };
  } else if (percentage >= 40) {
    return {
      label: "Sedang",
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      badgeColor: "bg-amber-100 text-amber-700",
      barColor: "bg-amber-500",
    };
  } else if (percentage > 0) {
    return {
      label: "Rendah",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      badgeColor: "bg-green-100 text-green-700",
      barColor: "bg-green-500",
    };
  } else {
    return {
      label: "Normal",
      color: "text-slate-600",
      bgColor: "bg-slate-50",
      borderColor: "border-slate-200",
      badgeColor: "bg-slate-100 text-slate-700",
      barColor: "bg-slate-400",
    };
  }
}
