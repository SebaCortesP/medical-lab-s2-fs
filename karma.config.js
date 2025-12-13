const path = require('node:path');

module.exports = function(config){
    config.set({
        basePath: '',
        frameworks: ['jasmine', '@angular-devkit/build-angular'],
        plugins:[    
            require('karma-jasmine'),
            require('karma-chrome-launcher'),
            require('karma-jasmine.html-reporter'),
            require('karma-coverage'),
            require('@angular-devkit/build-angular/plugins/karma')
        ],
        client: {
            jasmine:{},
            clearContent: false
        },
        jasmineHtmlReporter:{
            suppressAll: true
        },
        coverageReporter:{
            dir: path.join(__dirname, './coverage'),
            subdir: '.',
            reporters: [
                { type: 'html', subdir: 'html-report' },
                { type: 'lcov', subdir: 'lcov-report' }
            ]
        },
        reporters: ['progress', 'kjhtml'],
        port: 9876,
        colors: true,
        logLevel: config.LOG_INFO,
        autoWatch: true,
        browsers: ['Chrome'],
        singleRun: false,
        restartOnFileChange: true
    });
}
