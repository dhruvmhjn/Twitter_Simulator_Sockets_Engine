// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
import "phoenix_html"
import {Socket} from "phoenix";
// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

// import socket from "./socket"

// Socket
document.getElementById("User").innerText = "USER10"
let socket = new Socket("/socket", {params: {}})
socket.connect()

// Channels
let room = socket.channel("room:user10", {})
room.join()

/*let messageInput = document.getElementById("NewMessage")
messageInput.addEventListener("keypress", (e) => {
  if (e.keyCode == 13 && messageInput.value != "") {
    room.push("message:new", messageInput.value)
    messageInput.value = ""
  }
})*/

let tweetList = document.getElementById("TweetList")

let renderMessage = (payload) => {
  let messageElement = document.createElement("li")
  messageElement.innerHTML = `
    <p>${payload.tweet}</p>
    <i>${payload.user}</i>
  `
  tweetList.appendChild(messageElement)
  tweetList.scrollTop = tweetList.scrollHeight;
}

room.on("tweet:incoming", payload => renderMessage(payload))
