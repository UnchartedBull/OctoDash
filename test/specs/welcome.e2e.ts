describe('Welcome flow', () => {
  it('should have the right title', async () => {
    await browser.url('http://localhost:4200');
    const title = await browser.getTitle();
    expect(title).toEqual('OctoDash');
  });
  describe('Load the welcome screen', () => {
    it('should have welcome component', async () => {
      await browser.url('http://localhost:4200');
      const header = await $('app-config-setup-welcome');
      await expect(header).toBeExisting();
    });
  });
});
