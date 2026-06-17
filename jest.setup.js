// Limite la taille des arbres React affichés quand un test échoue
global.DEBUG_PRINT_LIMIT = 12;

let consoleLogSpy;

beforeEach(() => {
  consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
});

afterEach(() => {
  consoleLogSpy?.mockRestore();
});
