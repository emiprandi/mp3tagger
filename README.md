## About mp3tagger

`mp3tagger` is a simple command line tool that search album info (such as title, artist, track names, etc.) and write id3 tags to mp3 files. Perfect for your iTunes collection. It uses [Discogs.com](http://www.discogs.com) database and [eyeD3](http://eyed3.nicfit.net/) for write id3v2 metadata.

## Requirements

### node & npm

### eyeD3
* To install eyeD3 cli: `brew install eye-d3`

### discogs.com account
* Go to [discogs.com/developers](http://www.discogs.com/developers) and "Create an app".
* Add the keys to your `.bash_profile`:

        export DISCOGS_CONSUMER_KEY=<your_key>
        export DISCOGS_CONSUMER_SECRET=<your_secret>

## Installation
* `npm install -g mp3tagger`

## Usage
* Go to and album directory with mp3s inside and type `mp3tagger`

## Notes
* mp3tagger will search for files in the directory by alphabetical order
* only tested in mac
