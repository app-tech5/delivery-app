/**
 * Contrat shell partagé par tous les écrans AuthGuard + ScreenLayout.
 * Un écran conforme ne montre jamais auth-guard et le layout en même temps.
 */

export const SHELL_TEST_IDS = {
  authGuard: 'auth-guard',
  screenHeader: 'screen-header',
};

const flattenStyle = (style) => {
  if (!style) return [];
  if (Array.isArray(style)) {
    return style.flatMap((item) => flattenStyle(item));
  }
  return [style];
};

/** Session active : pas de garde auth, header + layout visibles. */
export function expectActiveScreenShell(utils, { layoutTestID, contentTestID } = {}) {
  const { queryByTestId } = utils;

  expect(queryByTestId(SHELL_TEST_IDS.authGuard)).toBeNull();
  expect(queryByTestId(SHELL_TEST_IDS.screenHeader)).toBeTruthy();

  if (layoutTestID) {
    expect(queryByTestId(layoutTestID)).toBeTruthy();
  }

  if (contentTestID) {
    expect(queryByTestId(contentTestID)).toBeTruthy();
  }
}

/** Détecte l'écran cassé : auth-guard et layout visibles en même temps. */
export function isShellBroken(utils, { layoutTestID } = {}) {
  if (!layoutTestID) return false;
  return Boolean(
    utils.queryByTestId(SHELL_TEST_IDS.authGuard) &&
      utils.queryByTestId(layoutTestID)
  );
}

/** Session inactive : garde auth visible, pas de layout / contenu principal. */
export function expectInactiveScreenShell(utils, { layoutTestID, contentTestID } = {}) {
  const { queryByTestId, getByTestId } = utils;

  expect(getByTestId(SHELL_TEST_IDS.authGuard)).toBeTruthy();

  if (layoutTestID) {
    expect(queryByTestId(layoutTestID)).toBeNull();
  }

  if (contentTestID) {
    expect(queryByTestId(contentTestID)).toBeNull();
  }
}

/**
 * Proxy de position : le header doit avoir assez de paddingTop pour passer sous la status bar.
 * Un seul check ici couvre tous les écrans qui utilisent ScreenLayout.
 */
export function expectHeaderClearsStatusBar(headerNode, minPaddingTop) {
  const styles = flattenStyle(headerNode.props.style);
  const paddingTop = styles.reduce(
    (max, rule) => (typeof rule?.paddingTop === 'number' ? Math.max(max, rule.paddingTop) : max),
    0
  );

  expect(paddingTop).toBeGreaterThanOrEqual(minPaddingTop);
}
