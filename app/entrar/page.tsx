import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { developmentAccounts, shouldShowDevelopmentAccess } from "@/lib/dev-access";

export default function LoginPage() {
  return <main className="auth-page"><div className="auth-grid"><section className="auth-card"><p className="eyebrow">Área do paciente</p><h1 className="display-font">Bem-vindo de volta.</h1><p className="auth-copy">Entre para acompanhar suas consultas e solicitar um novo horário.</p><AuthForm mode="login" />{shouldShowDevelopmentAccess() && (
    <aside className="dev-access" aria-label="Contas de desenvolvimento">
      <p className="dev-access-title">Contas locais</p>
      <p>Use a senha definida em <code>SEED_PASSWORD</code> após rodar <code>npm run db:seed</code>.</p>
      <ul>
        {developmentAccounts.map((account) => (
          <li key={account.email}><strong>{account.role}:</strong> {account.email}</li>
        ))}
      </ul>
    </aside>
  )}<p className="auth-switch">Ainda não tem acesso? <Link href="/cadastro">Criar conta</Link></p></section><section className="auth-card"><p className="eyebrow">Primeiro acesso</p><h2 className="display-font">Autocadastro do cliente</h2><p className="auth-copy">Crie sua conta para solicitar horários e acompanhar os retornos em um só lugar.</p><AuthForm mode="register" /></section></div></main>;
}
