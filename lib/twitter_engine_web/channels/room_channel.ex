defmodule TwitterEngineWeb.RoomChannel do
  use TwitterEngineWeb, :channel
  
  
  def join("room:sim", _, socket)do
    init_tables()
    {:ok, socket}
  end
  
  def join("room:user"<>suffix = topic, _, socket) do
    #send self(), :after_join
    #IO.puts "socket joined on topic room:user"<>suffix
    {:ok, socket}
  end

  def handle_info(:after_join, socket) do
    # Presence.track(socket, socket.assigns.user, %{
      #  online_at: :os.system_time(:milli_seconds)
      #})
    #push socket, "presence_state", Presence.list(socket)
    {:noreply, socket}
  end
  
  def handle_in("tweet:new", payload, socket) do
    #IO.puts "received tweet from client"
    #IO.inspect payload # must contain client num, tweet, tweetcount
    #send tweet to followers
    IO.puts "got a tweet from user #{payload["num"]} :::::: #{payload["tweet"]}"
    broadcast_from! socket, "tweet:incoming", %{tweet: payload["tweet"], source: payload["num"]}
    #generate tweet id = usernum + "T" + tweetid
    tweetid = Integer.to_string(payload["num"])<>"T"<>Integer.to_string(payload["tweetcount"])
    
    #IO.inspect :ets.last(:tab_tweet)
    #insert into tweet table
    
    :ets.insert_new(:tab_tweet, {tweetid,payload["num"],payload["tweet"]})
    
    #parse tweet for hastags and mentions, add to appropriate tables
    hashregex = ~r/\#\w*/
    tags = List.flatten(Regex.scan(hashregex,payload["tweet"]))
    Enum.map(tags, fn(x)-> if :ets.insert_new(:tab_hashtag,{x,[tweetid]}) == false do
      :ets.update_element(:tab_hashtag,x,{2,[tweetid]++List.flatten(:ets.match(:tab_hashtag,{x,:"$1"}))}) end end) 
      mentionsregex = ~r/\@\w*/
      mentions = List.flatten(Regex.scan(mentionsregex,payload["tweet"]))
      Enum.map(mentions, fn(x)-> if :ets.insert_new(:tab_mentions,{x,[tweetid]}) == false do
        :ets.update_element(:tab_mentions,x,{2,[tweetid]++List.flatten(:ets.match(:tab_mentions,{x,:"$1"}))}) end end) 
    {:noreply, socket}
  end
  
  def handle_in("query:hashtag",payload,socket) do
    #list of tweetids for hashtag
    list = List.flatten(:ets.match(:tab_hashtag,{payload["hashtag"],:"$1"}))
    result = Enum.map(list,fn(x)-> :ets.lookup_element(:tab_tweet,x,3)end)
    result = List.flatten(result)
    {:reply, {:ok,%{res: result}}, socket}
  end
  
  def handle_in("query:mentions",payload,socket) do
    #list of tweetids for mention
    list = List.flatten(:ets.match(:tab_mentions,{payload["mention"],:"$1"}))
    result = Enum.map(list,fn(x)-> :ets.lookup_element(:tab_tweet,x,3)end)
    result = List.flatten(result)
    {:reply,{:ok,%{res: result}}, socket}
  end
    
  def handle_in("simulator:end",payload,socket) do
    #IO.puts "All requests served. Server terminating.."
    #:init.stop
    {:noreply, socket}
  end
  
  def init_tables() do
    :ets.new(:tab_tweet, [:set, :public, :named_table, read_concurrency: true,
      write_concurrency: true])
    :ets.new(:tab_hashtag, [:set, :public, :named_table, read_concurrency: true,
      write_concurrency: true])
      :ets.new(:tab_mentions, [:set, :public, :named_table, read_concurrency: true,
        write_concurrency: true])
    IO.puts("ALL IO  AT CLIENT END")
  end
end