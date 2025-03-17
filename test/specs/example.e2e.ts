describe('Home Page', () => {
  it('should have the header elment', () => {
    const header = $('app-main-menu span span');
    expect(header).toBeExisting();
  });
  it('should have the settings elment', () => {
    const settings = $('.main-menuu__settings-icon-asdfasdf');
    console.log(settings);
    expect(settings).toBeExisting();
  });
});
