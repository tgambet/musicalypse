import { LibraryModule } from './library.module';

describe('LibraryModule', () => {
  let libraryModule: LibraryModule;

  beforeEach(() => {
    libraryModule = new LibraryModule();
  });

  it('should create an instance', () => {
    expect(libraryModule).toBeTruthy();
  });
});
