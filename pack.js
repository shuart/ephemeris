var NwBuilder = require('nw-builder'),
  output = 'build',
  opts = {
    files: './src/**', // use the glob format
    version: '0.43.4',
    buildDir: output + '/release/',
    cacheDir: output + '/cache/',
	flavor:"normal",
    platforms: ['win64', 'osx64', 'linux64']
  },
  nw = new NwBuilder(opts);

// log build details
nw.on('log', console.log);

// start build
nw.build().then(function() {
  console.log('App packaged in', opts.buildDir);
}).catch(function(error) {
  console.error(error);
});
