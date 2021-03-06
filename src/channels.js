/*
This file is part of World of Diceness, an online dice roller focused
on rolling dice quickly.

Copyright 2020 Los Archivos de la Noche

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/
const logger = require('./logger.js');

module.exports = function(app) {
    if(typeof app.channel !== 'function') {
    // If no real-time functionality has been configured just return
        return;
    }

    app.on('connection', connection => {
    // On a new real-time connection, add it to the anonymous channel
        app.channel('anonymous').join(connection);
    });

    app.on('disconnect', connection => {
        app.service('chatroom').remove({
            chatroom: { name: connection.roomname },
            player: { id: connection.playerid },
        });
    });

    app.on('login', (authResult, { connection }) => {
    // connection can be undefined if there is no
    // real-time connection, e.g. when logging in via REST
        if(connection) {
            // Obtain the logged in user from the connection
            // const user = connection.user;
      
            // The connection is no longer anonymous, remove it
            app.channel('anonymous').leave(connection);

            // Add it to the authenticated user channel
            app.channel('authenticated').join(connection);

            // Channels can be named anything and joined on any condition 
      
            // E.g. to send real-time events only to admins use
            // if(user.isAdmin) { app.channel('admins').join(connection); }

            // If the user has joined e.g. chat rooms
            // if(Array.isArray(user.rooms)) user.rooms.forEach(room => app.channel(`rooms/${room.id}`).join(connection));
      
            // Easily organize users by email and userid for things like messaging
            // app.channel(`emails/${user.email}`).join(connection);
            // app.channel(`userIds/${user.id}`).join(connection);
        }
    });

    // eslint-disable-next-line no-unused-vars
    app.publish((data, hook) => {
    // Here you can add event publishers to channels set up in `channels.js`
        // To publish only for a specific event use `app.publish(eventname, () => {})`

        const channel = data.roomname || 'anonymous';

        if (hook.path == 'chatroom') {
            if (hook.method == 'create') {
                logger.info('entering the room', { data, channel });
                app.channel(channel).join(hook.params.connection);
                // TODO: leave the other channels
                hook.params.connection.roomname = data.roomname;
                hook.params.connection.playerid = data.playerid;
            } else if (hook.method == 'remove') {
                logger.info('leaving the room', { data, channel });
                app.channel(channel).leave(hook.params.connection);
            }
        }

        logger.debug('publishing event', { data, channel });


        // e.g. to publish all service events to all authenticated users use
        return app.channel(channel);
    });

    // Here you can also add service specific event publishers
    // e.g. the publish the `users` service `created` event to the `admins` channel
    // app.service('users').publish('created', () => app.channel('admins'));
  
    // With the userid and email organization from above you can easily select involved users
    // app.service('messages').publish(() => {
    //   return [
    //     app.channel(`userIds/${data.createdBy}`),
    //     app.channel(`emails/${data.recipientEmail}`)
    //   ];
    // });
};
