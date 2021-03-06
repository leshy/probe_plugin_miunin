// Generated by CoffeeScript 1.8.0
(function() {
  var async, backbone, child, fs, helpers, procfile, _;

  helpers = require('helpers');

  _ = require('underscore');

  fs = require('fs');

  procfile = require('procfile');

  backbone = require('backbone4000');

  child = require('child_process');

  async = require('async');

  exports.plugin = backbone.Model.extend4000({
    interval: helpers.Minute,
    settings: {
      libDir: '/usr/share/munin',
      pluginDir: '/etc/munin/plugins'
    },
    run: function(callback) {
      console.log('readdir', this.settings.pluginDir);
      return fs.readdir(this.settings.pluginDir, (function(_this) {
        return function(err, files) {
          if (err) {
            return helpers.cbc(err);
          }
          return async.series(helpers.dictFromArray(files, function(file) {
            return [
              file, function(callback) {
                return _this.runMunin(file, callback);
              }
            ];
          }), function(err, data) {
            if (err) {
              console.error(err);
            }
            return callback(null, data);
          });
        };
      })(this));
    },
    runMunin: function(path, callback) {
      var options, parse;
      options = {
        cwd: this.settings.libdir,
        env: {
          MUNIN_LIBDIR: this.settings.libDir
        }
      };
      parse = function(data) {
        return helpers.dictFromArray(data.split('\n'), function(line) {
          var err, name, value, _ref;
          _ref = line.split('.value '), name = _ref[0], value = _ref[1];
          try {
            value = Number(value);
          } catch (_error) {
            err = _error;
            true;
          }
          return [name, value];
        });
      };
      return child.execFile('bash', ("-c " + (this.settings.pluginDir + '/' + path)).split(' '), options, function(err, data) {
        if (err) {
          console.error(path, err);
        }
        return callback(null, parse(data));
      });
    }
  });

}).call(this);
