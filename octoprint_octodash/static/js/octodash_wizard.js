// OctoDashWizard ViewModel
//
//
$(function () {
  function OctoDashWizardViewModel(parameters) {
    var self = this;

    self.configPaths = ko.observableArray([]);
    self.enabledFilament = ko.observableArray([]);
    self.availableFilament = ko.observableArray([]);
    self.enabledPower = ko.observableArray([]);
    self.availablePower = ko.observableArray([]);
    self.enabledSingles = ko.observableArray([]);
    self.availableSingles = ko.observableArray([]);

    self.legacyInstalled = ko.observable(false);
    self.settingsViewModel = parameters[0];
    self.selectedCommand = ko.observable();

    self.copyInProgress = ko.observable(false);
    self.copyComplete = ko.observable(false);

    self.migrateInProgress = ko.observable(false);
    self.migrateComplete = ko.observable(false);

    self.onWizardDetails = function (data) {
      console.log(data);
      const paths = data.octodash.details.legacyConfigs.filter(path => path.exists).map(path => path.path);
      self.configPaths(paths);
      // self.legacyInstalled(data.octodash.details.legacyInstalled);
      self.enabledFilament(data.octodash.details.plugins.enabled_filament);
      self.enabledSingles(data.octodash.details.plugins.enabled_singles);
      self.enabledPower(data.octodash.details.plugins.enabled_power);
      self.availableFilament(data.octodash.details.plugins.available_filament);
      self.availableSingles(data.octodash.details.plugins.available_singles);
      self.availablePower(data.octodash.details.plugins.available_power);
    };

    self.copyScript = async () => {
      self.copyInProgress(true);
      try {
        await $.ajax({
          url: '/plugin/octodash/api/copy_script',
          type: 'POST',
        });
        self.copyComplete(true);

        new PNotify({
          title: 'OctoDash Script Copy Successful!',
          text: '<div class="row-fluid"><p>The OctoDash startup script has been successfully copied.</p></div>',
          hide: true,
          type: 'success',
        });
      } catch (error) {
        console.error(error);
        new PNotify({
          title: 'OctoDash Script Copy Failed',
          text: '<div class="row-fluid"><p>Failed to copy the OctoDash startup script.</p></div>',
          hide: false,
          type: 'error',
        });
      }
      self.copyInProgress(false);
    };

    self.migrate = async path => {
      self.migrateInProgress(true);
      try {
        await $.ajax({
          url: '/plugin/octodash/api/migrate',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({ path: path }),
        });

        new PNotify({
          title: 'OctoDash Config Migration Successful!',
          text: `<div class="row-fluid"><p>The config from \`${path}\` has been successfully migrated.</p></div>`,
          hide: true,
          type: 'success',
        });
        self.migrateComplete(true);
      } catch (error) {
        console.error('Migration failed:', error);
        new PNotify({
          title: 'OctoDash Config Migration Failed',
          text: `<div class="row-fluid"><p>Migration failed with the following error: ${error}</p></div>`,
          hide: false,
          type: 'error',
        });
      }
      self.migrateInProgress(false);
    };
  }

  // Register the view model with OctoPrint
  OCTOPRINT_VIEWMODELS.push({
    construct: OctoDashWizardViewModel,
    dependencies: ['settingsViewModel'],
    elements: ['#wizard_plugin_octodash'], // Bind to the DOM element
  });
});
