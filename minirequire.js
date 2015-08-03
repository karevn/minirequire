(function() {
  var MiniRequire;

  MiniRequire = (function() {
    function MiniRequire(options) {
      var module;
      this.options = options != null ? options : {};
      if (!this.options.baseUrl) {
        this.options.baseUrl = "/";
      }
      this.moduleStore = {};
      if (this.options.shim) {
        for (module in this.options.shim) {
          this.moduleStore[module] = (function() {
            return this.options.shim[module];
          });
        }
      }
      this.define.amd = {};
      this.watched = {};
    }

    MiniRequire.prototype.define = function(moduleName, dependencyNames, moduleDefinition) {
      var _this;
      _this = this;
      if (this.moduleStore[moduleName]) {
        return this.moduleStore[moduleName];
      }
      return this.require(dependencyNames, function(deps) {
        _this.moduleStore[moduleName] = moduleDefinition.apply(_this, arguments);
        return this.resolve(moduleName);
      });
    };

    MiniRequire.prototype.waitFor = function(moduleName, callback) {
      var callbacks;
      if (!(callbacks = this.watched[moduleName])) {
        this.watched[moduleName] = [];
      }
      return this.watched[moduleName].push(callback);
    };

    MiniRequire.prototype.resolve = function(moduleName) {
      var callback, i, len, ref, results;
      if (!this.watched[moduleName]) {
        return;
      }
      ref = this.watched[moduleName];
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        callback = ref[i];
        results.push(callback.call(this, this.moduleStore[moduleName]));
      }
      return results;
    };

    MiniRequire.prototype.require = function(moduleNames, callback) {
      var _this, availableModuleNames, i, len, moduleLoaded, moduleName;
      availableModuleNames = [];
      if (typeof moduleNames === 'string') {
        moduleNames = [moduleNames];
      }
      _this = this;
      moduleLoaded = function() {
        if (availableModuleNames.length === moduleNames.length) {
          return callback.apply(_this, moduleNames.map(function(dependency) {
            return _this.moduleStore[dependency];
          }));
        } else {
          return void 0;
        }
      };
      for (i = 0, len = moduleNames.length; i < len; i++) {
        moduleName = moduleNames[i];
        if (this.moduleStore[moduleName]) {
          availableModuleNames.push(moduleName);
        } else {
          this.loadModule(moduleName, function() {
            availableModuleNames.push(moduleName);
            return moduleLoaded();
          });
        }
      }
      return moduleLoaded();
    };

    MiniRequire.prototype.loadModule = function(name, callback) {
      return (this.getScriptForModule(name) || this.buildScriptForModule(name)).addEventListener('load', (function(_this) {
        return function() {
          if (_this.moduleStore[name]) {
            return callback();
          } else {
            return _this.waitFor(name, callback);
          }
        };
      })(this));
    };

    MiniRequire.prototype.getScriptForModule = function(module) {
      var query;
      query = document.querySelectorAll('[data-module-name="' + module + '"]');
      if (query.length > 0) {
        return query[0];
      } else {
        return null;
      }
    };

    MiniRequire.prototype.buildScriptForModule = function(module) {
      var moduleScript;
      moduleScript = document.createElement('script');
      moduleScript.src = this.options.baseUrl + "/" + module + ".js";
      moduleScript.setAttribute('data-module-name', module);
      document.body.appendChild(moduleScript);
      return moduleScript;
    };

    return MiniRequire;

  })();

  if (module.exports) {
    module.exports = MiniRequire;
  }

  if (typeof window !== 'undefined') {
    window.MiniRequire = MiniRequire;
  }

}).call(this);
