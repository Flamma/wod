const { Service } = require('feathers-memory');

const ChatHouse = require('../../entities/ChatHouse');

exports.ChatRoom = class ChatRoom extends Service {
    // join
    async create(data) {
        const roomName = data.chatroom.name;
        const playerInfo = {
            name: data.player.name,
            avatar: data.player.avatar,
        };

        const result = ChatHouse.singleton().join(roomName, playerInfo);

        const response = {
            playerid: result.player.id,
            roomname: roomName,
        };

        return response;
    }
};
