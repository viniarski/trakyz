import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/Header";
import Budget from "@/components/Budget";
import { BudgetData } from "@/types/budgetTypes";
import { User } from "@supabase/supabase-js";

export default async function ProtectedPage() {
  const supabase = await createClient();

  // Fetch the authenticated user
  const { data } = await supabase.auth.getUser();

  const user: User | null = data?.user ?? null;

  // redirect users to sign in if not authenticated
  if (!user) {
    return redirect("/sign-in");
  }

  // Login debug log (can remove later)
  console.log("User is logged in:", user);

  // Fetch user budget data from Supabase
  const { data: budgets, error } = await supabase
    .from("budgets")
    .select(
      `
      month, 
      planned_income, 
      planned_expenses, 
      updated_at,
      budget_income (
        income_options (name),
        is_selected
      ),
      budget_expenses (
        expense_options (name),
        is_selected
      )
      `
    )
    .eq("user_id", user.id)
    .order("month", { ascending: false });

  if (error) {
    console.error("Error fetching budget data:", error);
  }

  const budgetData: BudgetData[] = budgets || [];

  return (
    <div className="flex-1 w-full flex flex-col min-h-screen">
      <Header user={user} />
      <div className="flex-1 container py-8">
        <Budget budgets={budgetData} />
      </div>
    </div>
  );
}
