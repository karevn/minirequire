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
      this.moduleCallbacks = {};
    }

    MiniRequire.prototype.define = function(moduleName, dependencyNames, moduleDefinition) {
      var _this;
      _this = this;
      if (this.moduleStore[moduleName]) {
        return this.moduleStore[moduleName];
      }
      return this.require(dependencyNames, function(deps) {
        var callback, i, len, ref;
        _this.moduleStore[moduleName] = moduleDefinition.apply(_this, arguments);
        if (_this.moduleCallbacks[moduleName]) {
          ref = _this.moduleCallbacks[moduleName];
          for (i = 0, len = ref.length; i < len; i++) {
            callback = ref[i];
            callback();
          }
          return delete _this.moduleCallbacks[moduleName];
        }
      });
    };

    MiniRequire.prototype.require = function(moduleNames, callback) {
      var _this, availableModuleNames, i, len, moduleName, moduleScript;
      availableModuleNames = [];
      if (typeof moduleNames === 'string') {
        moduleNames = [moduleNames];
      }
      _this = this;
      for (i = 0, len = moduleNames.length; i < len; i++) {
        moduleName = moduleNames[i];
        if (this.moduleStore[moduleName]) {
          availableModuleNames.push(moduleName);
        } else {
          if (moduleScript = this.getScriptForModule(moduleName)) {
            _this.watchForModuleLoad(moduleNames, moduleScript, callback, moduleName);
          } else {
            _this.watchForModuleLoad(moduleNames, moduleScript = this.buildScriptForModule(moduleName), callback, moduleName);
            document.body.appendChild(moduleScript);
          }
        }
      }
      if (availableModuleNames.length === moduleNames.length) {
        return callback.apply(_this, moduleNames.map(function(dependency) {
          return _this.moduleStore[dependency];
        }));
      }
    };

    MiniRequire.prototype.watchForModuleLoad = function(moduleNames, moduleScript, callback, moduleName) {
      var _this;
      _this = this;
      if (!this.moduleCallbacks[moduleName]) {
        this.moduleCallbacks[moduleName] = [];
      }
      return this.moduleCallbacks[moduleName].push(function() {
        return _this.require(moduleNames, callback);
      });
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
