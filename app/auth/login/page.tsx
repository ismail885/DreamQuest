import { Suspense } from "react";
import LoginForm from "../../../components/auth/LoginForm";

export const metadata = {
  title: "Connexion",
  description: "Connectez-vous à votre compte DreamQuest RPG",
};

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
