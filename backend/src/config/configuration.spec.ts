import configuration from './configuration';

describe('configuration academic catalog flag', () => {
  it('keeps academic catalog reads disabled when the environment variable is absent', () => {
    const previousValue = process.env.ACADEMIC_CATALOG_READS_ENABLED;
    delete process.env.ACADEMIC_CATALOG_READS_ENABLED;

    try {
      expect(configuration().academicCatalog.readsEnabled).toBe(false);
    } finally {
      if (previousValue === undefined) {
        delete process.env.ACADEMIC_CATALOG_READS_ENABLED;
      } else {
        process.env.ACADEMIC_CATALOG_READS_ENABLED = previousValue;
      }
    }
  });
});
