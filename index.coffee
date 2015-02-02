helpers = require 'helpers'
_ = require 'underscore'
fs = require 'fs'
procfile = require 'procfile'
backbone = require 'backbone4000'
child = require 'child_process'
async = require 'async'

exports.plugin = backbone.Model.extend4000
    interval: 1000
    
    settings:
        libDir: '/usr/share/munin'
        pluginDir: '/etc/munin/plugins'
        
    run: (callback) ->
        fs.readdir @settings.pluginDir, (err,files) =>
            if err then return helpers.cbc err
            async.series helpers.dictFromArray(files,  (file) =>
                [ file, (callback) => @runMunin file, (err,data) ->
                    if err then err.file = file
                    callback err,data ]),
                (err,data) ->
                    console.error err.file, err
                    callback null, data
                
    runMunin: (path,callback) ->
        options =
            cwd: @settings.libdir
            env: MUNIN_LIBDIR: @settings.libDir

        parse = (data) ->
            helpers.dictFromArray data.split('\n'), (line) ->
                [name, value] = line.split('.value ')
                
                try
                    value = Number(value)
                catch err
                    true
                    
                [name,value]
        
        child.execFile 'bash', "-c #{@settings.pluginDir + '/' + path}".split(' '), options, (err,data) ->
            callback err, parse(data)