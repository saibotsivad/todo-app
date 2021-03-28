/*

This logger method uses the `console` logging methods, but when
run in AWS the output is a JSON-stringified version on a single
line, because that's searchable and easier to read in Cloudwatch.

When run locally, the output is a bit more verbose, and formatted
to look nice on normal terminal output.

You can adjust the detail of the log output by setting the environment
variable `LOG_LEVEL` to the lowest value you want logged, e.g. if you
only want `warn` and above, set `LOG_LEVEL=warn`. (The more detailed
levels will include the lesser ones as well.)

Highest criticality to lowest:

- fatal
- error
- warn
- info
- debug
- trace

These values are based on a thorough reading of, and somewhat copied
wholesale from, this Stack Overflow post:

	https://stackoverflow.com/questions/2031163/when-to-use-the-different-log-levels

including all comments and responses, and also a careful reading of this
Wikipedia article

	https://en.wikipedia.org/wiki/Syslog

and the following justifications / perspectives / goals:

- severity is from the perspective of viewing the log file
- expanded levels increase the complexity of logging, aka "keep it simple"

Also, here are some very broad heuristics to keep in mind:

- Warnings you can recover from.
- Errors the process can't recover.
- Fatal the application can't recover.

Here are a few comments about the different logging levels, to help you
decide which level your log entry should be:

- `fatal` - Any error that is forcing a shutdown of the service or application
  overall, to prevent data loss. These are reserved for only the most heinous
  errors and situations where there is guaranteed to have been data corruption
  or loss.
- `error` - Any error which is fatal to the specific operation, but not the
  service or application overall. These errors will require user intervention.
  These are usually reserved for incorrect connection strings, missing services, etc.
- `warn` - Anything that can potentially cause application oddities, but for
  which the application can automatically recover, such as switching from a
  primary to backup server, retrying an operation, missing secondary data, etc.
- `info` - Generally useful information to log (service start/stop, configuration
  assumptions, etc). Info that should always be available but under normal
  circumstances isn't something to care about. This should be the default
  level for most logs.
- `debug` - Information that is diagnostically helpful to people more than
  just developers, such as the IT team, sysadmins, etc.
- `trace` - Really only used when a developer would be "tracing" the code and
  trying to find one part of a function specifically. Probably debuggers would
  be set on these log entries.

*/

const levelsList = [
	'__reserved__',
	'trace',
	'debug',
	'info',
	'warn',
	'error',
	'fatal'
]

const levelToIndex = {
	trace: 1,
	debug: 2,
	info: 3,
	warn: 4,
	error: 5,
	fatal: 6
}

const log = level => (message, params) => {
	const specifiedLevelIndex = levelToIndex[process.env.LOG_LEVEL] || levelToIndex.info
	if (level >= specifiedLevelIndex) {
		if (process.env.IS_DEPLOYED === 'true') {
			// If this is deployed to AWS, we format the output to a single log
			// entry that is JSON-stringified, so that we can search for it in
			// Cloudwatch more easily.
			//
			// For example, suppose someone logged a line like this:
			//
			//     log.warn('some problem', { foo: 'bar' })
			//
			// You could write Cloudwatch search syntax like this, to find that entry:
			//
			//     { $.level = "warn" && $.message = "some problem" && $.params.foo = "bar" }
			//
			// The important thing is to log a single JSON stringified line.
			console.log(JSON.stringify({
				level: levelsList[level],
				message,
				params
			}))
		} else {
			// If it's not deployed, it means we are running locally, in which
			// case we want a bit more information which is normally included
			// in the Cloudwatch logs.
			const prefix = `[${new Date().toISOString()}] [${levelsList[level]}] ${message}`
			if (params && ((Array.isArray(params) && params.length) || Object.keys(params).length)) {
				console.log(prefix, JSON.stringify({ params }, undefined, 4))
			} else {
				console.log(prefix)
			}
		}
	}
}

export default {
	trace: log(1),
	debug: log(2),
	info: log(3),
	warn: log(4),
	error: log(5),
	fatal: log(6)
}
