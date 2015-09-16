#WebSocket = require('websocket').client
WebSocket = require('faye-websocket')
uuid = require('node-uuid')
crypto = require('crypto')
{EventEmitter} = require "events"
_ = require 'underscore'
util = require('util')


class PusherChannel extends EventEmitter
  
  constructor: (channel_name, channel_data) ->
    @channel_name = channel_name
    @channel_data = channel_data


class PusherClient extends EventEmitter
  
  state: 
    name: "disconnected"
    socket_id: null

  constructor: (credentials) ->
    @credentials = credentials

  subscribe: (channel_name, channel_data = {}) =>
    stringToSign = "#{@state.socket_id}:#{channel_name}:#{JSON.stringify(channel_data)}"
    auth = @credentials.key + ':' + crypto.createHmac('sha256', @credentials.secret).update(stringToSign).digest('hex');
    req = 
      id: uuid.v1()
      event: "pusher:subscribe"
      data: 
        channel: channel_name
        auth: auth
        channel_data: JSON.stringify channel_data
    @client.send JSON.stringify req
    console.log "subscribe #{req}"

    channel = @channels[channel_name]
    if channel
      new Error "Existing subscription to #{channel_name}"
      channel
    else
      channel = new PusherChannel channel_name, channel_data
      @channels[channel_name] = channel
      channel
  
  unsubscribe: (channel_name, channel_data = {}) =>
    console.log "unsubscribing from #{channel_name}"
    stringToSign = "#{@state.socket_id}:#{channel_name}:#{JSON.stringify(channel_data)}"
    auth = @credentials.key + ':' + crypto.createHmac('sha256', @credentials.secret).update(stringToSign).digest('hex');
    req = 
      id: uuid.v1()
      event: "pusher:unsubscribe"
      data: 
        channel: channel_name
        auth: auth
        channel_data: JSON.stringify channel_data
    @client.send JSON.stringify req

    channel = @channels[channel_name]
    if channel
      delete @channels[channel_name]
      channel

    else
      new Error "No subscription to #{channel_name}"

  # name this function better
  resetActivityCheck: () =>
    if @activityTimeout then clearTimeout @activityTimeout
    if @waitingTimeout then clearTimeout @waitingTimeout
    @activityTimeout = setTimeout(
      () =>
        console.log "pinging pusher to see if active at #{(new Date).toLocaleTimeString()}"
        @client.send JSON.stringify({ event: "pusher:ping", id: uuid.v1(), data: {} })
        @waitingTimeout = setTimeout(
          () =>
            console.log "disconnecting because of inactivity at #{(new Date).toLocaleTimeString()}"
            _(@channels).each (channel) =>
                @unsubscribe channel.channel_name, channel.channel_data
            console.log "connetcing again at #{(new Date).toLocaleTimeString()}"
            if @client.state isnt "open"
              console.log "client state is not open but #{@client.state}"
              @connect()
          30000
        )
      120000
    )

  connect: () =>
    @client =  new WebSocket.Client("wss://ws.pusherapp.com:443/app/#{@credentials.key}?client=node-pusher-server&version=0.0.1&protocol=5&flash=false", [], @credentials.proxy)
    @channels = {}
    @client.on 'open', (connection) =>
      console.log 'connected to pusher '
      #console.log util.inspect connection
    @client.on 'message', (msg) =>
      console.log ("msg"+ util.inspect(msg.data))
      @resetActivityCheck()
      @recieveMessage msg.data
    @client.on 'close', () =>
      @connect()
    console.log "trying connecting to pusher on - wss://ws.pusherapp.com:443/app/#{@credentials.key}?client=node-pusher-server&version=0.0.1&protocol=5&flash=false"
    
  recieveMessage: (msg) =>
    #if msg.type is 'utf8' 
    payload = JSON.parse msg
    if payload.event is "pusher:connection_established"
      data = JSON.parse payload.data
      @state = { name: "connected", socket_id: data.socket_id }
      console.log @state
      @emit 'connect'
    if payload.event is "pusher_internal:subscription_succeeded"
      channel = @channels[payload.channel]
      if channel then channel.emit 'success'
    channel = @channels[payload.channel]
    console.log "got event #{payload.event} on #{(new Date).toLocaleTimeString()}"
    if payload.event is "pusher:error"
      console.log payload
    if channel 
      channel.emit payload.event, JSON.parse payload.data

module.exports.PusherClient = PusherClient