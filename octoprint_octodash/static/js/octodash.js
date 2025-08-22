$(function () {
  function OctoDashViewModel() {
    var self = this;

    self.configPaths = ko.observableArray([]);

    self.legacyInstalled = ko.observable(false);

    self.migrated = ko.observable(false);

    self.copySuccess = ko.observable(false);
    self.copyError = ko.observable(false);

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
        .then(() => self.copySuccess(true))
        .catch(() => self.copyError(true));
    };

    self.migrate = path => {
      $.ajax({
        url: '/plugin/octodash/api/migrate',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({ path: path }),
        success: function () {
          self.migrated(true);
        },
        error: function (xhr, status, error) {
          // TODO: Better handle this
          console.error('Migration failed:', error);
          alert('Migration failed: ' + error);
        },
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
