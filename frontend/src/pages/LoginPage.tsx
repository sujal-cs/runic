import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/auth/AuthCard";
import FormField from "../components/auth/FormField";
import { Button } from "../components/ui/Button";
import { TextInput } from "../components/ui/Field";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const n = sessionStorage.getItem("notice");
    if (n) {
      setNotice(n);
      sessionStorage.removeItem("notice");
    }
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login(email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <AuthCard
      eyebrow="Welcome back"
      title="Sign in to Runic"
      description="Pick up where you left off. Your submissions and verdicts are waiting."
      footer={<>New here? <Link className="font-semibold text-brand hover:text-brand-hover" to="/register">Create an account</Link></>}
    >
      {notice && (
        <div className="mb-4 rounded-control border border-brand/30 bg-brand/10 px-3 py-2.5 text-sm text-brand">
          {notice}
        </div>
      )}
      <form className="flex flex-col gap-4" onSubmit={submit}>
        <FormField id="login-email" label="Email">
          <TextInput
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </FormField>
        <FormField id="login-password" label="Password">
          <TextInput
            id="login-password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </FormField>
        {error && <div className="text-sm text-danger" role="alert">{error}</div>}
        <Button className="w-full" variant="primary" type="submit">Sign in</Button>
      </form>
    </AuthCard>
  );
}
