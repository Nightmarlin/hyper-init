'use strict';

const { rulesHandler } = require('./src/rules/rules-handler')
const waitFor = require('./src/wait-for')

const init = {}
const terminal = {}

exports.onApp = ({ config }) =>
	Object.assign(init, config.getConfig().init)

exports.getTabProps = (uid, parentProps, props) =>
	Object.assign(terminal, uid, { tabs: parentProps.tabs }) &&
	Object.assign({}, props)

exports.reduceTermGroups = reducer =>
	Object.assign(terminal, reducer.termGroups) && reducer

exports.middleware = store => next => action => {
	if (action.type === 'SESSION_ADD')
			Object.assign(terminal, { splitDirection: action.splitDirection })
	
	next(action)
}

exports.onWindow = app =>
	app.rpc.on('execute commands', ({ uid, terminal }) =>
		Object.keys(init).map(key => 
			init[key].commands.map(cmd => 
				rulesHandler({ init, key, cmd, app, uid, terminal }))
		)
	)

exports.onRendererWindow = app =>
	waitFor(app, 'rpc', rpc =>
		rpc.on('session add', ({ uid }) =>
			rpc.emit('execute commands', { uid, terminal })
		)
	)