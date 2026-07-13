(() => {
  "use strict";
  const DB_KEY = "bankingDesk.v1";
  const SESSION_KEY = "bankingDesk.session";
  const enc = new TextEncoder();

  const hex = bytes => [...new Uint8Array(bytes)].map(b => b.toString(16).padStart(2, "0")).join("");
  const randomHex = (size = 16) => hex(crypto.getRandomValues(new Uint8Array(size)));
  async function passwordHash(password, salt) {
    const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
    return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", salt: enc.encode(salt), iterations: 210000, hash: "SHA-256" }, key, 256));
  }

  function openRecovery() {
    document.getElementById("password-recovery")?.remove();
    const dialog = document.createElement("dialog");
    dialog.id = "password-recovery";
    dialog.style.cssText = "border:0;border-radius:18px;padding:0;max-width:430px;width:calc(100% - 2rem);box-shadow:0 24px 70px rgba(23,63,58,.24);";
    dialog.innerHTML = `<form method="dialog" style="padding:1.8rem;background:#fffdf8">
      <h2 class="serif" style="font-size:2rem;margin:0 0 .4rem">Reset local password</h2>
      <p style="color:#65716c;line-height:1.55;margin:0 0 1.3rem">Set a new password for a profile saved in this browser. Quiz history and wrong-answer memory will be preserved.</p>
      <div class="field"><label for="recovery-user">Username</label><input id="recovery-user" required autocomplete="username"></div>
      <div class="field"><label for="recovery-password">New password</label><input id="recovery-password" type="password" minlength="8" required autocomplete="new-password"></div>
      <div class="field"><label for="recovery-confirm">Confirm password</label><input id="recovery-confirm" type="password" minlength="8" required autocomplete="new-password"></div>
      <p id="recovery-message" role="alert" style="min-height:1.3rem;color:#a64336;font-size:.84rem"></p>
      <div style="display:flex;gap:.7rem;justify-content:flex-end"><button class="btn btn-ghost" value="cancel">Cancel</button><button class="btn btn-primary" id="reset-password" value="default">Reset password</button></div>
      <p class="fine-print">This device-local reset is available because no email address or remote account database is used.</p>
    </form>`;
    document.body.appendChild(dialog);
    dialog.querySelector("form").addEventListener("submit", async event => {
      event.preventDefault();
      const username = dialog.querySelector("#recovery-user").value.trim().toLowerCase();
      const password = dialog.querySelector("#recovery-password").value;
      const confirm = dialog.querySelector("#recovery-confirm").value;
      const message = dialog.querySelector("#recovery-message");
      if (password.length < 8) return message.textContent = "Use at least 8 characters.";
      if (password !== confirm) return message.textContent = "The passwords do not match.";
      let data;
      try { data = JSON.parse(localStorage.getItem(DB_KEY)) || { profiles: {} }; } catch { data = { profiles: {} }; }
      const profile = data.profiles?.[username];
      if (!profile) return message.textContent = "No profile with that username is saved in this browser.";
      const salt = randomHex();
      profile.salt = salt;
      profile.hash = await passwordHash(password, salt);
      profile.sessionHash = null;
      localStorage.setItem(DB_KEY, JSON.stringify(data));
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      message.style.color = "#255f54";
      message.textContent = "Password reset. Returning to sign in…";
      setTimeout(() => location.reload(), 700);
    });
    dialog.addEventListener("close", () => dialog.remove());
    dialog.showModal();
  }

  function addRecoveryButton() {
    const form = document.querySelector('#auth-form[data-mode="login"]');
    if (!form || form.querySelector("#forgot-password")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.id = "forgot-password";
    button.className = "btn btn-ghost btn-wide";
    button.style.marginTop = ".65rem";
    button.textContent = "Forgot password?";
    button.addEventListener("click", openRecovery);
    form.appendChild(button);
  }

  new MutationObserver(addRecoveryButton).observe(document.getElementById("app"), { childList: true, subtree: true });
  addRecoveryButton();
})();

