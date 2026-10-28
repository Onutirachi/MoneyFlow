import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router';
import { toast } from 'sonner';
import { z } from 'zod';
import { Field } from '@/components/common/Field';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { getErrorMessage } from '@/lib/api';

const schema = z.object({
  email: z.string().trim().pipe(z.email('Informe um e-mail válido')),
  password: z.string().min(1, 'Informe a senha'),
});
type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = handleSubmit(async ({ email, password }) => {
    try {
      // o redirecionamento (para state.from) fica a cargo do PublicOnlyRoute
      await login(email, password);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  });

  return (
    <AuthLayout title="Entrar" subtitle="Acesse sua conta para ver suas finanças.">
      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
          <Input id="email" type="email" autoComplete="email" autoFocus {...register('email')} />
        </Field>
        <Field label="Senha" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            {...register('password')}
          />
        </Field>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />}
          Entrar
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground">
        Não tem conta?{' '}
        <Link
          to="/cadastro"
          className="font-medium text-foreground underline-offset-4 hover:underline"
        >
          Cadastre-se
        </Link>
      </p>
      <p className="rounded-lg border border-dashed p-3 text-center text-xs text-muted-foreground">
        Conta de demonstração: <b>demo@demo.com</b> / <b>123456</b>
      </p>
    </AuthLayout>
  );
}
