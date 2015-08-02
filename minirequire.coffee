class MiniRequire
  constructor: (@options = {})->
    @options.baseUrl = "/" unless @options.baseUrl
    @moduleStore = {}
    @moduleStore[module] = (-> @options.shim[module]) for module of @options.shim if @options.shim
    @define.amd = {}
  define: (moduleName, dependencyNames, moduleDefinition) ->
    return @moduleStore[moduleName] if @moduleStore[moduleName]
    @require dependencyNames, (deps)-> _this.moduleStore[moduleName] = moduleDefinition.apply(_this, arguments)
  require: (moduleNames, callback) ->
    availableModuleNames = []
    moduleNames = [moduleNames] if typeof moduleNames == 'string'
    moduleLoaded = ->
      if availableModuleNames.length == moduleNames.length
        callback.apply _this, moduleNames.map((dependency)-> _this.moduleStore[dependency])
      else undefined
    for moduleName in moduleNames
      if @moduleStore[moduleName]
        availableModuleNames.push moduleName
      else
        @loadModule moduleName, ->
          availableModuleNames.push moduleName
          moduleLoaded()
    moduleLoaded()
  loadModule: (name, callback)->
    (@getScriptForModule(name) || @buildScriptForModule(name)).addEventListener 'load', callback
  getScriptForModule: (module)->
    query = document.querySelectorAll('[data-module-name="' + module + '"]')
    if query.length > 0 then query[0] else null
  buildScriptForModule: (module)->
    moduleScript = document.createElement('script')
    moduleScript.src = "#{@options.baseUrl}/#{module}.js"
    moduleScript.setAttribute 'data-module-name', module
    document.body.appendChild moduleScript
    moduleScript
module.exports = MiniRequire if module.exports
window.MiniRequire = MiniRequire if typeof(window) != 'undefined'