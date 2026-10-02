import './auth-screen.css';
import { firebaseConfigured, login, register } from './cloud';

// ============================================================
// AUTH SCREEN: email/password login (Firebase) like Rafa's other
// apps, with a local-only fallback (no account, this browser).
// ============================================================

export function createAuthScreen(container: HTMLElement, onDone: () => void): void {
  container.innerHTML = '';

  const root = document.createElement('div');
  root.className = 'auth-screen';
  root.innerHTML = `
    <div class="auth-card">
      <h1>🏎️ Motorsport Manager</h1>
      <p class="auth-sub">Entra con tu cuenta para guardar tu partida en la nube</p>
      <label class="field">Email
        <input class="in auth-email" type="email" autocomplete="email" />
      </label>
      <label class="field">Contraseña
        <input class="in auth-pass" type="password" autocomplete="current-password" />
      </label>
      <div class="auth-error"></div>
      <div class="auth-actions">
        <button type="button" class="btn primary auth-login-btn">Entrar</button>
        <button type="button" class="btn auth-register-btn">Registrarse</button>
      </div>
      <button type="button" class="btn auth-local-btn">Continuar sin cuenta (solo este navegador)</button>
      ${
        firebaseConfigured
          ? ''
          : '<p class="auth-note">⚠️ Firebase sin configurar: pega tu configuración en <code>src/firebase-config.ts</code> para activar el login.</p>'
      }
    </div>`;
  container.appendChild(root);

  const emailEl = root.querySelector<HTMLInputElement>('.auth-email')!;
  const passEl = root.querySelector<HTMLInputElement>('.auth-pass')!;
  const errorEl = root.querySelector<HTMLElement>('.auth-error')!;
  const loginBtn = root.querySelector<HTMLButtonElement>('.auth-login-btn')!;
  const registerBtn = root.querySelector<HTMLButtonElement>('.auth-register-btn')!;

  const runAuth = (op: (email: string, pass: string) => Promise<void>): void => {
    errorEl.textContent = '';
    if (!firebaseConfigured) {
      errorEl.textContent = 'Firebase sin configurar (usa el modo local por ahora).';
      return;
    }
    loginBtn.disabled = true;
    registerBtn.disabled = true;
    op(emailEl.value.trim(), passEl.value)
      .then(() => onDone())
      .catch((err: Error) => {
        errorEl.textContent = err.message ?? 'Error';
        loginBtn.disabled = false;
        registerBtn.disabled = false;
      });
  };

  loginBtn.addEventListener('click', () => runAuth(login));
  registerBtn.addEventListener('click', () => runAuth(register));
  root
    .querySelector<HTMLButtonElement>('.auth-local-btn')!
    .addEventListener('click', () => onDone());
}
