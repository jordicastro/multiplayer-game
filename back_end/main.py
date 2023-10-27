# ** backend ** 
from typing import Mapping, Any
import os
from http_daemon import delay_open_url, serve_pages
from typing import Dict, List, Tuple

class Player():
    # constructor (init), self (this), none (return none)
    def __init__(self) -> None:
        self.id : str = ""
        self.name : str = ""
        self.x : int = 0
        self.y : int = 0
        self.what_i_know = 0
## dictionary of players. if make_ajax_page searches through dict and does not find relevant id, it makes a new player. else, it returns the player: yes! it is in the list!
players: Dict[str, Player] = {}
history: List[Player] = []
# updates: List[Tuple[str, int, int]] = [] 

def update(payload: Mapping[str, Any]) -> Mapping[str, Any]:
    action = payload["action"]
    if action == 'click':
        player = find_player(payload["id"]) # assumes a find_player function is made that looks through players Dictionary to find player using parameter "id", creates a new player if needed,
        print(f'click id: {payload["id"]}')
        player.x = payload["x"]
        player.y = payload["y"]
        player.name = payload["name"]
        print(f'player clicked is {player.name}')
        history.append(player)
        return {'status' : 'success', 'message' : 'Onclick action received'} # returns achknowledgement from back end BACK TO front end that the click was received  
    elif action == 'gu': #get update
        player = find_player(payload["id"]) #finds player using id : <id>
        print(f'requesting id: {payload["id"]}')
        remaining_history = player.what_i_know # gets the position in the history list where the player last knew about updates
        player.what_i_know = len(history) # updates what player knows to the curr length of history list

        # iterates over the history from the last known position [remaining_history] TO the curr END [len(history)], creating a list of updates with player attributes
        updates: List[Tuple[str, int, int]] = []
        for i in range(remaining_history, len(history)):
          player = history[i]
          updates.append( (player.id, player.x, player.y))
          print(f'sending id: {player.id}')
        # print({'message' : 'updating backend history', 'updates' : updates})

        return {'updates': updates}
    # print(f'update was called with {payload}')
    ## if user is sending x and y, update 
    return {
        'message': 'thank you',
    } # JSON FORMAT (change me). dynamic web page refresh (generating a web page foryouon the fly; no static premade pages)

def find_player(player_id: str) -> Player:
    for player in history:
        if player.id == player_id:
            return player
    # if player is NOT FOUND, create a new player
    new_player = Player()
    new_player.id = player_id
    players[player_id] = new_player # adding the new player to the players DICT
    return new_player

def main() -> None:
    # Get set up
    os.chdir(os.path.join(os.path.dirname(__file__), '../front_end'))

    # Serve pages, 8987 is a meaningless number; we just want to assign a specific port on computer to communicate with the internet (each computer has thousands of ports)
    port = 8987
    delay_open_url(f'http://127.0.0.1:{port}/game.html', .1) # opens your web browser 

    serve_pages(port, {
        'ajax.html': update,
    }) #kicks off the webserver #url : handling function

##
if __name__ == "__main__":
    main()

# web browser GETs game.html from http_daemon
    # http_daemon returns an HTML file to the web browser
    # web browser renders: HTML -> DOM -> render
    # web browser GET main.js (<- created in bash script using main.ts)
    ########### TODO
    # javascript runs
    # js: makes a POST request to send backend ajax.html (to tell the backend where the user clicked) [Controller.onClick]
    # -> http_daemon (middle man) -> main.py (backend)
    # main.py (backend) must send a response (yes! I received the message!) to js  [Controller.onAcknowledgeClick()]
    # task: alter main.ts that will change main.js to do what you want

    # web browser uses GET
    # js uses POST
    # BACK END: main.py
    # FRONT END: main.ts