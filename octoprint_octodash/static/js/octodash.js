// OctoDash ViewModel
//
// All logic related to the OctoDash settings and configuration
// is from the OctoDash Companion plugin under the MIT license
// See https://github.com/jneilliii/OctoPrint-OctoDashCompanion/blob/142652a3c2eccfa1bd2f459447caec31f29deb4c/octoprint_octodashcompanion/static/js/octodashcompanion.js
//
$(function () {
  function OctoDashViewModel(parameters) {
    var self = this;

    self.settingsViewModel = parameters[0];
    self.pluginManagerViewModel = parameters[1];
    self.selectedCommand = ko.observable();

    self.addCustomAction = function () {
      self.selectedCommand({
        color: ko.observable('#dcdde1'),
        command: ko.observable(''),
        confirm: ko.observable(false),
        exit: ko.observable(true),
        icon: ko.observable('home'),
      });
      self.settingsViewModel.settings.plugins.octodash.octodash.customActions.push(self.selectedCommand());
    };

    self.addCustomActionToken = function (data, event) {
      switch (event.currentTarget.text) {
        // case '[!RESTARTSERVICE]':
        //   data.command(
        //     '[!WEB]' +
        //       self.settingsViewModel.settings.plugins.octodashcompanion.config.octoprint.url().replace('/api/', '/') +
        //       'plugin/octodashcompanion/restart',
        //   );
        //   data.icon('recycle');
        //   data.color('#FF0000');
        //   data.confirm(true);
        //   data.exit(false);
        //   break;
        // case '[!SWITCH_INSTANCE]':
        //   data.command(
        //     '[!WEB]' +
        //       self.settingsViewModel.settings.plugins.octodashcompanion.config.octoprint.url().replace('/api/', '/') +
        //       'plugin/octodashcompanion/switch_instance?url=localhost:5000',
        //   );
        //   data.icon('recycle');
        //   data.color('#e1b12c');
        //   data.exit(false);
        //   break;
        default:
          data.command(event.currentTarget.text);
      }
    };

    self.removeCustomAction = function (data) {
      self.selectedCommand(null);
      self.settingsViewModel.settings.plugins.octodash.octodash.customActions.remove(data);
    };

    self.copyCustomAction = function (data) {
      self.selectedCommand({
        color: ko.observable(data.color()),
        command: ko.observable(data.command()),
        confirm: ko.observable(data.confirm()),
        exit: ko.observable(data.exit()),
        icon: ko.observable(data.icon()),
      });
      self.settingsViewModel.settings.plugins.octodash.octodash.customActions.push(self.selectedCommand());
    };

    self.onSettingsHidden = function () {
      self.selectedCommand(null);
    };

    self.octodashIcons = window.OCTODASH_ICONS;
  }

  // Register the view model with OctoPrint
  OCTOPRINT_VIEWMODELS.push({
    construct: OctoDashViewModel,
    dependencies: ['settingsViewModel', 'pluginManagerViewModel'],
    elements: ['#settings_plugin_octodash'], // Bind to the DOM element
  });
});
