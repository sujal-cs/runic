import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthCard from "../components/auth/AuthCard";
import FormField from "../components/auth/FormField";
import { Button } from "../components/ui/Button";
import { TextInput } from "../components/ui/Field";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await register(username, email, password);
      navigate("/");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <AuthCard
      eyebrow="Get started"
      title="Create your account"
      description="Practice problems, review clear verdicts, and keep your progress close."
      footer={<>Already have an account? <Link className="font-semibold text-brand hover:text-brand-hover" to="/login">Sign in</Link></>}
    >
      <form className="flex flex-col gap-4" onSubmit={submit}>
        <FormField id="register-username" label="Username">
          <TextInput
            id="register-username"
            autoComplete="username"
            placeholder="ada"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </FormField>
        <FormField id="register-email" label="Email">
          <TextInput
            id="register-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </FormField>
        <FormField id="register-password" label="Password">
          <TextInput
            id="register-password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </FormField>
        {error && <div className="text-sm text-danger" role="alert">{error}</div>}
        <Button className="w-full" variant="primary" type="submit">Create account</Button>
      </form>
    </AuthCard>
  );
}
