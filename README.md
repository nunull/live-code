# live-code

## Prerequisites

* [Node.js](https://nodejs.org/en/)
* [Watchdog](https://github.com/gorakhargosh/watchdog) (make sure you can
  execute `watchmedo`)
* [Ableton Live](https://www.ableton.com/de/live/) (or any other MIDI device)

## Installation

    $ npm install

## Usage

Start the server by running

    $ node server/index.js

Open `ableton/live-code.als` in Live and go to the MIDI settings. You should see
both an input and an output device called `live-code-server`. Enable 'track' for
the input device and 'sync' for the output device. Close the settings and hit
play.

Watch for file changes to your script file and run the client on every file
change.

    $ watchmedo shell-command --command 'node client/index.js samples/<input>' samples

Replace `<input>` with the path to your script (e.g. `test-04.lc`).

Go ahead and make changes to the script. Live should play your patterns as soon
as you save the script file.
