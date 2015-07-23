class MiniRequire
  constructor: (@options = {})->
    @options.baseUrl = "/" unless @options.baseUrl
    @moduleStore = {}
    @moduleStore[module] = (-> @options.shim[module]) for module of @options.shim if @options.shim
    @define.amd = {}
    @moduleCallbacks = {}
  define: (moduleName, dependencyNames, moduleDefinition) ->
    _this = this
    return @moduleStore[moduleName] if @moduleStore[moduleName]
    @require dependencyNames, (deps)->
      _this.moduleStore[moduleName] = moduleDefinition.apply(_this, arguments)
      if _this.moduleCallbacks[moduleName]
        callback() for callback in _this.moduleCallbacks[moduleName]
        delete _this.moduleCallbacks[moduleName]
  require: (moduleNames, callback) ->
    availableModuleNames = []
    moduleNames = [moduleNames] if typeof moduleNames == 'string'
    _this = this
    for moduleName in moduleNames
      if @moduleStore[moduleName]
        availableModuleNames.push moduleName
      else
        if moduleScript = @getScriptForModule(moduleName)
          _this.watchForModuleLoad(moduleNames, moduleScript, callback, moduleName)
        else
          _this.watchForModuleLoad(moduleNames, moduleScript = @buildScriptForModule(moduleName), callback, moduleName)
          document.body.appendChild moduleScript
    if availableModuleNames.length == moduleNames.length
      callback.apply _this, moduleNames.map((dependency)-> _this.moduleStore[dependency])
  watchForModuleLoad: (moduleNames, moduleScript, callback, moduleName)->
    _this = this
    @moduleCallbacks[moduleName] = [] unless @moduleCallbacks[moduleName]
    @moduleCallbacks[moduleName].push(-> _this.require(moduleNames, callback))
  getScriptForModule: (module)->
    query = document.querySelectorAll('[data-module-name="' + module + '"]')
    if query.length > 0 then query[0] else null
  buildScriptForModule: (module)->
    moduleScript = document.createElement('script')
    moduleScript.src = "#{@options.baseUrl}/#{module}.js"
    moduleScript.setAttribute 'data-module-name', module
    moduleScript
module.exports = MiniRequire if module.exports
window.MiniRequire = MiniRequire if typeof(window) != 'undefined'
