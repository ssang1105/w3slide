/**
 * Created by yskim on 14. 8. 21..
 * Modified by woong on 14. 8. 27..
 */
var socket = io.connect('http://localhost:3000/');
var siofu = new SocketIOFileUpload(socket);