$(function () {
  function OctoDashViewModel() {
    var self = this;

    self.configPaths = ko.observableArray([]);

    self.legacyInstalled = ko.observable(false);

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
  }

  // Register the view model with OctoPrint
  OCTOPRINT_VIEWMODELS.push({
    construct: OctoDashViewModel,
    dependencies: [], // Add dependencies here if needed
    elements: ['#wizard_plugin_octodash'], // Bind to the DOM element
  });
});
