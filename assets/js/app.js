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
document.getElementById("User").innerText = "DUMMY USER"
let socket = new Socket("/socket", {params: {}})
socket.connect()

// Channels
let rooms = []
let roomscount = 0

let room = socket.channel("room:user1", {})
room.join()

let tweetcount = 99999

let messageInput = document.getElementById("NewTweet")
messageInput.addEventListener("keypress", (e) => {
  if (e.keyCode == 13 && messageInput.value != "") {
    let payload ={tweet: messageInput.value, num: 10, tweetcount: tweetcount}
    room.push("tweet:new", payload )
    tweetcount = tweetcount + 1
    messageInput.value = ""
  }
})

let hashInput = document.getElementById("Qhashtag")
hashInput.addEventListener("keypress", (e) => {
  if (e.keyCode == 13 && hashInput.value != "") {
    let payload = new Map({hashtag: hashInput.value})
    room.push("query:hashtag", payload )
    hashInput.value = ""
  }
})

let subInput = document.getElementById("Subscribe")
subInput.addEventListener("keypress", (e) => {
  if (e.keyCode == 13 && subInput.value != "") {
    let subroom = socket.channel("room:user"+subInput.value, {})
    rooms.push(subroom)    
    rooms[roomscount].join()
    rooms[roomscount].on("tweet:incoming", payload => renderMessage(payload))
    roomscount = roomscount +1
    alert("Subscribed to user"+subInput.value)
    subInput.value = ""
  }
})


let tweetList = document.getElementById("TweetList")

let renderMessage = (payload) => {
  console.log(payload)
  let messageElement = document.createElement("li")
  messageElement.innerHTML = `
    <p>${payload.tweet}</p>
    <i>user${payload.source}</i>
  `
  tweetList.appendChild(messageElement)
  tweetList.scrollTop = tweetList.scrollHeight;
}

room.on("tweet:incoming", payload => renderMessage(payload))
