import type { Category } from "@/types/finance";

export const categories: Category[] = [
  { id: "salary", name: "Salary", icon: "briefcase-outline", type: "income" }, { id: "freelance", name: "Freelance", icon: "laptop-outline", type: "income" }, { id: "business", name: "Business", icon: "storefront-outline", type: "income" }, { id: "investment", name: "Investment", icon: "trending-up-outline", type: "income" }, { id: "income-other", name: "Other", icon: "add-circle-outline", type: "income" },
  { id: "food", name: "Food", icon: "restaurant-outline", type: "expense" }, { id: "transport", name: "Transport", icon: "car-outline", type: "expense" }, { id: "housing", name: "Housing", icon: "home-outline", type: "expense" }, { id: "utilities", name: "Utilities", icon: "flash-outline", type: "expense" }, { id: "health", name: "Health", icon: "medkit-outline", type: "expense" }, { id: "shopping", name: "Shopping", icon: "bag-outline", type: "expense" }, { id: "entertainment", name: "Entertainment", icon: "film-outline", type: "expense" }, { id: "education", name: "Education", icon: "school-outline", type: "expense" }, { id: "expense-other", name: "Other", icon: "ellipsis-horizontal-outline", type: "expense" },
];
export const categoryById = (id: string) => categories.find((category) => category.id === id);
