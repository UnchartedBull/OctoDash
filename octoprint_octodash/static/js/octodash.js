$(function () {
  function OctoDashViewModel(parameters) {
    var self = this;

    self.configPaths = ko.observableArray([]);

    self.legacyInstalled = ko.observable(false);
    self.settingsViewModel = parameters[0];
    self.selected_command = ko.observable();
    self.process = ko.observable();
    self.processing = ko.observable(false);
    self.backup_message = ko.observable('');

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

    self.add_custom_action = function () {
      self.selected_command({
        color: ko.observable('#dcdde1'),
        command: ko.observable(''),
        confirm: ko.observable(false),
        exit: ko.observable(true),
        icon: ko.observable('home'),
      });
      self.settingsViewModel.settings.plugins.octodashcompanion.config.octodash.customActions.push(
        self.selected_command(),
      );
    };

    // self.perform_backup = function () {
    //   self.process('backup');
    //   self.processing(true);
    //   OctoPrint.simpleApiCommand('octodashcompanion', 'backup_config')
    //     .done(function (data) {
    //       if (data.success === true) {
    //         $('#backup_btn').addClass('btn-success');
    //         self.backup_message('Success!');
    //         self.settingsViewModel.settings.plugins.octodashcompanion.last_backup(data.last_backup);
    //         setTimeout(function () {
    //           $('#backup_btn').removeClass('btn-success');
    //           self.backup_message('');
    //           self.processing(false);
    //         }, 3000);
    //       } else {
    //         $('#backup_btn').addClass('btn-danger');
    //         setTimeout(function () {
    //           $('#backup_btn').removeClass('btn-danger');
    //           self.backup_message('');
    //           self.processing(false);
    //         }, 3000);
    //         self.backup_message('Error: ' + data.error);
    //       }
    //     })
    //     .fail(function (data) {
    //       $('#backup_btn').addClass('btn-danger');
    //       self.backup_message('Error: ' + data.responseJSON.error);
    //       setTimeout(function () {
    //         $('#backup_btn').removeClass('btn-danger');
    //         self.backup_message('');
    //         self.processing(false);
    //       }, 3000);
    //     });
    // };

    // self.perform_restore = function () {
    //   self.process('restore');
    //   self.processing(true);
    //   OctoPrint.simpleApiCommand('octodashcompanion', 'restore_config')
    //     .done(function (data) {
    //       if (data.success === true) {
    //         $('#restore_btn').addClass('btn-success');
    //         self.backup_message('Success!');
    //         self.settingsViewModel.settings.plugins.octodashcompanion.last_backup(data.last_backup);
    //         setTimeout(function () {
    //           $('#restore_btn').removeClass('btn-success');
    //           self.backup_message('');
    //           self.processing(false);
    //         }, 3000);
    //       } else {
    //         $('#restore_btn').addClass('btn-danger');
    //         setTimeout(function () {
    //           $('#restore_btn').removeClass('btn-danger');
    //           self.backup_message('');
    //           self.processing(false);
    //         }, 3000);
    //         self.backup_message('Error: ' + data.error);
    //       }
    //     })
    //     .fail(function (data) {
    //       $('#restore_btn').addClass('btn-danger');
    //       self.backup_message('Error: ' + data.responseJSON.error);
    //       setTimeout(function () {
    //         $('#restore_btn').removeClass('btn-danger');
    //         self.backup_message('');
    //         self.processing(false);
    //       }, 3000);
    //     });
    // };

    self.add_custom_action_token = function (data, event) {
      switch (event.currentTarget.text) {
        case '[!WEBCAM]':
          data.command(
            '[!WEB]' +
              self.settingsViewModel.settings.plugins.octodashcompanion.config.octoprint.url().replace('/api/', '/') +
              'plugin/octodashcompanion/webcam',
          );
          data.icon('camera');
          data.exit(false);
          break;
        case '[!RESTARTSERVICE]':
          data.command(
            '[!WEB]' +
              self.settingsViewModel.settings.plugins.octodashcompanion.config.octoprint.url().replace('/api/', '/') +
              'plugin/octodashcompanion/restart',
          );
          data.icon('recycle');
          data.color('#FF0000');
          data.confirm(true);
          data.exit(false);
          break;
        case '[!SLEEP]':
          data.command(
            '[!WEB]' +
              self.settingsViewModel.settings.plugins.octodashcompanion.config.octoprint.url().replace('/api/', '/') +
              'plugin/octodashcompanion/sleep',
          );
          data.icon('bed');
          data.color('#0097e6');
          data.exit(false);
          break;
        case '[!SWITCH_INSTANCE]':
          data.command(
            '[!WEB]' +
              self.settingsViewModel.settings.plugins.octodashcompanion.config.octoprint.url().replace('/api/', '/') +
              'plugin/octodashcompanion/switch_instance?url=localhost:5000',
          );
          data.icon('recycle');
          data.color('#e1b12c');
          data.exit(false);
          break;
        default:
          data.command(event.currentTarget.text);
      }
    };

    self.remove_custom_action = function (data) {
      self.selected_command(null);
      self.settingsViewModel.settings.plugins.octodashcompanion.config.octodash.customActions.remove(data);
    };

    self.copy_custom_action = function (data) {
      self.selected_command({
        color: ko.observable(data.color()),
        command: ko.observable(data.command()),
        confirm: ko.observable(data.confirm()),
        exit: ko.observable(data.exit()),
        icon: ko.observable(data.icon()),
      });
      self.settingsViewModel.settings.plugins.octodashcompanion.config.octodash.customActions.push(
        self.selected_command(),
      );
    };

    self.onSettingsHidden = function () {
      self.selected_command(null);
    };
    self.octodash_icons = window.OCTODASH_ICONS;
  }

  // Register the view model with OctoPrint
  OCTOPRINT_VIEWMODELS.push({
    construct: OctoDashViewModel,
    dependencies: ['settingsViewModel'],
    elements: ['#wizard_plugin_octodash', '#settings_plugin_octodash'], // Bind to the DOM element
  });
});
