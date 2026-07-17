import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return <main className="auth-page"><section className="auth-card"><p className="eyebrow">Área do paciente</p><h1 className="display-font">Bem-vindo de volta.</h1><p className="auth-copy">Entre para acompanhar suas consultas e solicitar um novo horário.</p><AuthForm mode="login" /><p className="auth-switch">Ainda não tem acesso? <Link href="/cadastro">Criar conta</Link></p></section></main>;
}
