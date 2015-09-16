// Generated by CoffeeScript 1.10.0
(function() {
  var EventEmitter, PusherChannel, PusherClient, WebSocket, _, crypto, util, uuid,
    extend = function(child, parent) { for (var key in parent) { if (hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; },
    hasProp = {}.hasOwnProperty,
    bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  WebSocket = require('faye-websocket');

  uuid = require('node-uuid');

  crypto = require('crypto');

  EventEmitter = require("events").EventEmitter;

  _ = require('underscore');

  util = require('util');

  PusherChannel = (function(superClass) {
    extend(PusherChannel, superClass);

    function PusherChannel(channel_name, channel_data) {
      this.channel_name = channel_name;
      this.channel_data = channel_data;
    }

    return PusherChannel;

  })(EventEmitter);

  PusherClient = (function(superClass) {
    extend(PusherClient, superClass);

    PusherClient.prototype.state = {
      name: "disconnected",
      socket_id: null
    };

    function PusherClient(credentials) {
      this.recieveMessage = bind(this.recieveMessage, this);
      this.connect = bind(this.connect, this);
      this.resetActivityCheck = bind(this.resetActivityCheck, this);
      this.unsubscribe = bind(this.unsubscribe, this);
      this.subscribe = bind(this.subscribe, this);
      this.credentials = credentials;
    }

    PusherClient.prototype.subscribe = function(channel_name, channel_data) {
      var auth, channel, req, stringToSign;
      if (channel_data == null) {
        channel_data = {};
      }
      stringToSign = this.state.socket_id + ":" + channel_name + ":" + (JSON.stringify(channel_data));
      auth = this.credentials.key + ':' + crypto.createHmac('sha256', this.credentials.secret).update(stringToSign).digest('hex');
      req = {
        id: uuid.v1(),
        event: "pusher:subscribe",
        data: {
          channel: channel_name,
          auth: auth,
          channel_data: JSON.stringify(channel_data)
        }
      };
      this.client.send(JSON.stringify(req));
      console.log("subscribe " + req);
      channel = this.channels[channel_name];
      if (channel) {
        new Error("Existing subscription to " + channel_name);
        return channel;
      } else {
        channel = new PusherChannel(channel_name, channel_data);
        this.channels[channel_name] = channel;
        return channel;
      }
    };

    PusherClient.prototype.unsubscribe = function(channel_name, channel_data) {
      var auth, channel, req, stringToSign;
      if (channel_data == null) {
        channel_data = {};
      }
      console.log("unsubscribing from " + channel_name);
      stringToSign = this.state.socket_id + ":" + channel_name + ":" + (JSON.stringify(channel_data));
      auth = this.credentials.key + ':' + crypto.createHmac('sha256', this.credentials.secret).update(stringToSign).digest('hex');
      req = {
        id: uuid.v1(),
        event: "pusher:unsubscribe",
        data: {
          channel: channel_name,
          auth: auth,
          channel_data: JSON.stringify(channel_data)
        }
      };
      this.client.send(JSON.stringify(req));
      channel = this.channels[channel_name];
      if (channel) {
        delete this.channels[channel_name];
        return channel;
      } else {
        return new Error("No subscription to " + channel_name);
      }
    };

    PusherClient.prototype.resetActivityCheck = function() {
      if (this.activityTimeout) {
        clearTimeout(this.activityTimeout);
      }
      if (this.waitingTimeout) {
        clearTimeout(this.waitingTimeout);
      }
      return this.activityTimeout = setTimeout((function(_this) {
        return function() {
          console.log("pinging pusher to see if active at " + ((new Date).toLocaleTimeString()));
          _this.client.send(JSON.stringify({
            event: "pusher:ping",
            id: uuid.v1(),
            data: {}
          }));
          return _this.waitingTimeout = setTimeout(function() {
            console.log("disconnecting because of inactivity at " + ((new Date).toLocaleTimeString()));
            _(_this.channels).each(function(channel) {
              return _this.unsubscribe(channel.channel_name, channel.channel_data);
            });
            console.log("connetcing again at " + ((new Date).toLocaleTimeString()));
            if (_this.client.state !== "open") {
              console.log("client state is not open but " + _this.client.state);
              return _this.connect();
            }
          }, 30000);
        };
      })(this), 120000);
    };

    PusherClient.prototype.connect = function() {
      this.client = new WebSocket.Client("wss://ws.pusherapp.com:443/app/" + this.credentials.key + "?client=node-pusher-server&version=0.0.1&protocol=5&flash=false", [], this.credentials.proxy);
      this.channels = {};
      this.client.on('open', (function(_this) {
        return function(connection) {
          return console.log('connected to pusher ');
        };
      })(this));
      this.client.on('message', (function(_this) {
        return function(msg) {
          console.log("msg" + util.inspect(msg.data));
          _this.resetActivityCheck();
          return _this.recieveMessage(msg.data);
        };
      })(this));
      this.client.on('close', (function(_this) {
        return function() {
          return _this.connect();
        };
      })(this));
      return console.log("trying connecting to pusher on - wss://ws.pusherapp.com:443/app/" + this.credentials.key + "?client=node-pusher-server&version=0.0.1&protocol=5&flash=false");
    };

    PusherClient.prototype.recieveMessage = function(msg) {
      var channel, data, payload;
      payload = JSON.parse(msg);
      if (payload.event === "pusher:connection_established") {
        data = JSON.parse(payload.data);
        this.state = {
          name: "connected",
          socket_id: data.socket_id
        };
        console.log(this.state);
        this.emit('connect');
      }
      if (payload.event === "pusher_internal:subscription_succeeded") {
        channel = this.channels[payload.channel];
        if (channel) {
          channel.emit('success');
        }
      }
      channel = this.channels[payload.channel];
      console.log("got event " + payload.event + " on " + ((new Date).toLocaleTimeString()));
      if (payload.event === "pusher:error") {
        console.log(payload);
      }
      if (channel) {
        return channel.emit(payload.event, JSON.parse(payload.data));
      }
    };

    return PusherClient;

  })(EventEmitter);

  module.exports.PusherClient = PusherClient;

}).call(this);
