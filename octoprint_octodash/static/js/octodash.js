// OctoDash ViewModel
//
// All logic related to the OctoDash settings and configuration
// is from the OctoDash Companion plugin under the MIT license
// See https://github.com/jneilliii/OctoPrint-OctoDashCompanion/blob/142652a3c2eccfa1bd2f459447caec31f29deb4c/octoprint_octodashcompanion/__init__.py
//
$(function () {
  function OctoDashViewModel(parameters) {
    var self = this;

    self.configPaths = ko.observableArray([]);

    self.legacyInstalled = ko.observable(false);
    self.settingsViewModel = parameters[0];
    self.selectedCommand = ko.observable();
    self.process = ko.observable();
    self.processing = ko.observable(false);

    self.onWizardDetails = function (data) {
      console.log(data);
      const paths = data.octodash.details.legacyConfigs.filter(path => path.exists).map(path => path.path);
      self.configPaths(paths);
      self.legacyInstalled(data.octodash.details.legacyInstalled);
    };

    self.copyScript = () => {
      $.ajax({
        url: '/plugin/octodash/api/copy_script',
        type: 'POST',
      })
        .then(() => {
          new PNotify({
            title: 'OctoDash Script Copy Successful!',
            text: '<div class="row-fluid"><p>The OctoDash startup script has been successfully copied.</p></div>',
            hide: true,
            type: 'success',
          });
        })
        .catch(() => {
          new PNotify({
            title: 'OctoDash Script Copy Failed',
            text: '<div class="row-fluid"><p>Failed to copy the OctoDash startup script.</p></div>',
            hide: false,
            type: 'error',
          });
        });
    };

    self.migrate = path => {
      $.ajax({
        url: '/plugin/octodash/api/migrate',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ path: path }),
      })
        .then(() => {
          new PNotify({
            title: 'OctoDash Config Migration Successful!',
            text: `<div class="row-fluid"><p>The config from \`${path}\` has been successfully migrated.</p></div>`,
            hide: true,
            type: 'success',
          });
        })
        .catch(error => {
          console.error('Migration failed:', error);
          new PNotify({
            title: 'OctoDash Config Migration Failed',
            text: `<div class="row-fluid"><p>Migration failed with the following error: ${error}</p></div>`,
            hide: false,
            type: 'error',
          });
        });
    };

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
        // case '[!WEBCAM]':
        //   data.command(
        //     '[!WEB]' +
        //       self.settingsViewModel.settings.plugins.octodashcompanion.config.octoprint.url().replace('/api/', '/') +
        //       'plugin/octodashcompanion/webcam',
        //   );
        //   data.icon('camera');
        //   data.exit(false);
        //   break;
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
        // case '[!SLEEP]':
        //   data.command(
        //     '[!WEB]' +
        //       self.settingsViewModel.settings.plugins.octodashcompanion.config.octoprint.url().replace('/api/', '/') +
        //       'plugin/octodashcompanion/sleep',
        //   );
        //   data.icon('bed');
        //   data.color('#0097e6');
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
    dependencies: ['settingsViewModel'],
    elements: ['#wizard_plugin_octodash', '#settings_plugin_octodash'], // Bind to the DOM element
  });
});
