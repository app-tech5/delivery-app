export function installHermesE2eAuthHooks(login, logout) {
  globalThis.__HERMES_E2E_LOGIN__ = async (email, password) => {
    try {
      const result = await login(email, password);
      if (!result?.token || !(result?.user?.id || result?.user?._id)) {
        return { ok: false, error: 'login returned no token/user' };
      }
      return { ok: true, userId: result.user.id || result.user._id };
    } catch (error) {
      return { ok: false, error: String(error?.message || error) };
    }
  };

  globalThis.__HERMES_E2E_LOGOUT__ = async () => {
    try {
      await logout();
      return { ok: true };
    } catch (error) {
      return { ok: false, error: String(error?.message || error) };
    }
  };
}
