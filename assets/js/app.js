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
document.getElementById("User").innerText = "USER99999"
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
    let payload = {tweet: messageInput.value, num: 99999, tweetcount: tweetcount}
    room.push("tweet:new", payload )
    tweetcount = tweetcount + 1
    messageInput.value = ""
  }
})

let hashInput = document.getElementById("Qhashtag")
hashInput.addEventListener("keypress", (e) => {
  if (e.keyCode == 13 && hashInput.value != "") {
    let payload = {hashtag: hashInput.value}
    room.push("query:hashtag", payload ).receive("ok", (res) => alert(res.res) )
    hashInput.value = ""
  }
})
let mentInput = document.getElementById("Qmentions")
mentInput.addEventListener("keypress", (e) => {
  if (e.keyCode == 13 && mentInput.value != "") {
    let payload = {mention: mentInput.value}
    room.push("query:mentions", payload ).receive("ok", (res) => alert(res.res) )
    mentInput.value = ""
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
    room.push("subscribe",{to: subInput.value})
    alert("Subscribed to user"+subInput.value)
    subInput.value = ""
  }
})


let tweetList = document.getElementById("TweetList")

let renderMessage = (payload) => {
  if (connectButton.innerHTML == "Disconnect!")
  {
  let messageElement = document.createElement("li")
  messageElement.innerHTML = `
    <p>${payload.tweet}</br><i>user${payload.source}</i></p>
  `
  tweetList.appendChild(messageElement)
  messageElement.scrollIntoView()
  }
}

let renderDump = (dump) =>{
  
  for (var i = 0; i < dump.length; i++) {
      let payload = {tweet: dump[i][2], source: dump[i][1]}
      console.log(payload)
      renderMessage(payload)  
  }
}

let connectButton = document.getElementById("Bconnect")
connectButton.addEventListener("click", connectfunc);

function connectfunc ()
{
  if (connectButton.innerHTML == "Connect!")
  {
    connectButton.innerHTML = "Disconnect!"
    alert("You are now Connected")
    room.push("reconnect",{}).receive("ok", (result) => renderDump(result.dump) )

  }
  else if (connectButton.innerHTML == "Disconnect!")
  {
    connectButton.innerHTML = "Connect!"
    alert("You are now Disconnected")
    room.push("disconnect",{})
  }
} 

room.on("tweet:incoming", payload => renderMessage(payload))

