class MiniRequire
  constructor: (@options = {})->
    @options.baseUrl = "/" unless @options.baseUrl
    @moduleStore = {}
    @watched = {}
    @moduleStore[module] = (-> @options.shim[module]) for module of @options.shim if @options.shim
    @define.amd = {}
  define: (moduleName, dependencyNames, moduleDefinition) ->
    return if @moduleStore[moduleName]
    @require dependencyNames, (deps)=> 
      @moduleStore[moduleName] = moduleDefinition.apply(this, arguments)
      @onLoad moduleName
  waitFor: (moduleName, callback)->
    @watched[moduleName] = [] unless @watched[moduleName]
    @watched[moduleName].push callback
  onLoad: (moduleName)->
    return unless @watched[moduleName]
    callback.call this, @moduleStore[moduleName] for callback in @watched[moduleName]
    delete @watched[moduleName]
  require: (moduleNames, callback) ->
    availableModuleNames = []
    moduleNames = [moduleNames] if typeof moduleNames == 'string'
    moduleLoaded = =>
      if availableModuleNames.length == moduleNames.length
        callback.apply this, moduleNames.map((dependency)=> @moduleStore[dependency])
    for moduleName in moduleNames
      if @moduleStore[moduleName]
        availableModuleNames.push moduleName
      else
        @waitFor moduleName, =>
          availableModuleNames.push moduleName
          moduleLoaded()
        @buildScriptForModule(moduleName) unless @hasScriptForModule(moduleName)
    moduleLoaded()
  hasScriptForModule: (module)-> document.querySelectorAll('[data-module-name="' + module + '"]').length > 0
  buildScriptForModule: (module, callback)->
    moduleScript = document.createElement('script')
    moduleScript.src = "#{@options.baseUrl}/#{module}.js"
    moduleScript.setAttribute 'data-module-name', module
    document.body.appendChild moduleScript
module.exports = MiniRequire if module.exports
window.MiniRequire = MiniRequire if typeof(window) != 'undefined'
