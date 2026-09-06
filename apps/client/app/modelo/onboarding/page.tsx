import { OnboardingForm } from "@/components/dashboard/OnboardingForm";

export default function OnboardingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-light_bg px-6 py-12">
      <div className="w-full max-w-md rounded-md bg-white p-8 shadow-md">
        <OnboardingForm />
      </div>
    </div>
  );
}
