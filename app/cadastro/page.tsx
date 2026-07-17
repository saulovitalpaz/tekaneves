import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return <main className="auth-page"><section className="auth-card"><p className="eyebrow">Primeiro acesso</p><h1 className="display-font">Vamos começar com calma.</h1><p className="auth-copy">Crie seu acesso para solicitar um atendimento e acompanhar cada etapa.</p><AuthForm mode="register" /><p className="auth-switch">Já tem uma conta? <Link href="/entrar">Entrar</Link></p></section></main>;
}
