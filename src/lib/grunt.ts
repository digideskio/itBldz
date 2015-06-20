﻿import logging = require('./logging');
import npm = require('./npm-package');
import environment = require('./environment')
var log = new logging.Log();

export class Grunt {
    grunt;
    registeredTasks: string[] = [];

    public constructor(grunt) {
        this.grunt = grunt;
    }

    public registerExternalTask(name: string, dependencies : string[], callback) {
        new npm.Package().installIfFileNotExist(name, dependencies, () => {
            process.chdir(global.relativeDir);
            this.grunt.loadNpmTasks(name);
            process.chdir(global.basedir);
            callback();
        });
    }

    public registerTask(name: string, description: string, onTaskStart: () => void) {
        if (this.registeredTasks.some((_) => _ === name)) {
            return;
        }
        this.registeredTasks.push(name);
        this.grunt.registerTask(name, description, onTaskStart);
        log.verbose.writeln("Grunt", "Loaded task " + name);
    }

    public initConfig(config : any) {
        this.grunt.initConfig(config);
    }

    public run(task : string) {
        if (environment.Settings.isVerbose())
            this.grunt.option("verbose", environment.Settings.isVerbose());
        if (environment.Settings.showStack())
            this.grunt.option("stack", environment.Settings.showStack());
        this.grunt.task.run(task);
    }
}