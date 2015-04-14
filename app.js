#!/usr/bin/env node

var fs = require('fs'),
    dir = process.cwd(),
    mp3s = [],
    brain = {
        query: {},
        options: [],
        data: {
            artist: '',
            album: '',
            year: '',
            tracks: []
        }
    },
    eD3c, eD3p,
    readline = require('readline'),
    Discogs = require('disconnect').Client,
    spawn = require('child_process').spawn;

function error (msg) {
    console.log(msg + '\n');
}

if (process.env.DISCOGS_CONSUMER_KEY && process.env.DISCOGS_CONSUMER_SECRET) {
    var dcApi = {
        key: process.env.DISCOGS_CONSUMER_KEY,
        secret: process.env.DISCOGS_CONSUMER_SECRET
    };
} else {
    return error('We couldn\'t find Discogs keys.');
}

fs.readdir(dir, function (err, files) {
    if (err) return error('blop!');

    files.forEach(function (file) {
        if (file.substr(-4) === '.mp3') {
            mp3s.push(file);
        }
    });

    if (mp3s.length === 0) {
        return error('No mp3s to tag.');
    } else {
        eD3c = spawn('which', ['eyeD3']);
        eD3c.on('close', function (exitcode) {
            if (exitcode === 0) {
                var rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                });

                console.log(' .-.     .-.     .-.     .-.     .-.     .-.     .-.     .-.');
                console.log("'   `._.'   `._.'   `._.'   `._.'   `._.'   `._.'   `._.'   `");
                console.log('mp3tagger');
                console.log('     .-.     .-.     .-.     .-.     .-.     .-.     .-.');
                console.log("`._.'   `._.'   `._.'   `._.'   `._.'   `._.'   `._.'   `._.'");
                console.log(dir);
                console.log('MP3s found: ' + mp3s.length);
                console.log('');
                rl.question('Discogs release id? [enter to skip]: ', function (answer) {
                    var dc = new Discogs({ consumerKey: dcApi.key, consumerSecret: dcApi.secret }).database();

                    if (answer != '') {
                        console.log('Fetching album data...\n');
                        if (answer[0] === 'r' || answer[0] === 'm') answer = answer.substring(1);
                        dc.release(parseInt(answer), function (err, data) {
                            brain.data.artist = data.artists[0].name;
                            brain.data.album = data.title;
                            brain.data.year = data.year;

                            console.log(data.title + ' (' + data.year + ')');
                            console.log(data.tracklist.length + ' tracks');
                            console.log('ID: ' + data.id + ' - Data: ' + data.data_quality);
                            console.log('----------------------');

                            data.tracklist.forEach(function (track, i) {
                                brain.data.tracks.push(track.title);
                                console.log(track.position + '. ' + track.title + ' (' + track.duration + ')');
                            });

                            rl.question('\nWrite ID3 tags? [y,n]: ', function (answer) {
                                if (answer === "y") {
                                    mp3s.forEach(function (file, i) {
                                        var args = [];
                                        args.push('--remove-all');
                                        args.push('-a', brain.data.artist);
                                        args.push('-A', brain.data.album);
                                        args.push('-t', brain.data.tracks[i]);
                                        args.push('-n', (i+1));
                                        args.push('-N', brain.data.tracks.length);
                                        //args.push('-d', '1');
                                        //args.push('-D', '1');
                                        args.push('-Y', brain.data.year);
                                        args.push('--recording-date', brain.data.year);
                                        args.push(file);
                                        eD3p = spawn('eyeD3', args);

                                        eD3p.on('close', function (exitcode) {
                                            if (exitcode === 0) {
                                                console.log('[OK] ' + file);
                                            } else {
                                                console.log('[ERR] ' + file);
                                            }
                                        });
                                    });
                                }
                                rl.close();
                            });
                        });
                    } else {
                        rl.question('Artist?: ', function (answer) {
                            brain.query.artist = answer;

                            rl.question('Album?: ', function (answer) {
                                brain.query.album = answer;

                                console.log('Searching...\n');

                                dc.search('', { type: 'master', artist: brain.query.artist, release_title: brain.query.album }, function (err, data) {
                                    if (data.results.length > 0) {
                                        data.results.forEach(function (item, i) {
                                            brain.options.push(item.id);
                                            console.log('[' + i + ']: ' + item.title);
                                            console.log(item.format);
                                            console.log('-----------');
                                        });

                                        rl.question('Choose an album: ', function (answer) {
                                            console.log('Fetching album data...\n');

                                            dc.master(brain.options[parseInt(answer)], function (err, data) {
                                                brain.data.artist = data.artists[0].name;
                                                brain.data.album = data.title;
                                                brain.data.year = data.year;

                                                console.log(data.title + ' (' + data.year + ')');
                                                console.log(data.tracklist.length + ' tracks');
                                                console.log('ID: ' + data.id + ' - Data: ' + data.data_quality);
                                                console.log('----------------------');

                                                data.tracklist.forEach(function (track, i) {
                                                    brain.data.tracks.push(track.title);
                                                    console.log(track.position + '. ' + track.title + ' (' + track.duration + ')');
                                                });

                                                rl.question('\nWrite ID3 tags? [y,n]: ', function (answer) {
                                                    if (answer === "y") {
                                                        mp3s.forEach(function (file, i) {
                                                            var args = [];
                                                            args.push('--remove-all');
                                                            args.push('-a', brain.data.artist);
                                                            args.push('-A', brain.data.album);
                                                            args.push('-t', brain.data.tracks[i]);
                                                            args.push('-n', (i+1));
                                                            args.push('-N', brain.data.tracks.length);
                                                            //args.push('-d', '1');
                                                            //args.push('-D', '1');
                                                            args.push('-Y', brain.data.year);
                                                            args.push('--recording-date', brain.data.year);
                                                            args.push(file);
                                                            eD3p = spawn('eyeD3', args);

                                                            eD3p.on('close', function (exitcode) {
                                                                if (exitcode === 0) {
                                                                    console.log('[OK] ' + file);
                                                                } else {
                                                                    console.log('[ERR] ' + file);
                                                                }
                                                            });
                                                        });
                                                    }
                                                    rl.close();
                                                });
                                            });
                                        });
                                    } else {
                                        console.log('Sorry, we couldn\'t find album info.');
                                        rl.close();
                                    }
                                });
                            });
                        });
                    }
                });
            } else {
                return error('Sorry, this script requires eyeD3. Try `brew install eyeD3` first.');
            }
        });
    }
});
