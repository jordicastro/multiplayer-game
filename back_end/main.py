# ** backend ** 
from typing import Mapping, Any
import os
from http_daemon import delay_open_url, serve_pages
from typing import Dict, List, Tuple

class Player():
    # constructor (init), self (this), none (return none)
    def __init__(self) -> None:
        self.id = id
        self.y = 0
        self.y = 0
        self.what_i_know =0;
## dictionary of players. if make_ajax_page searches through dict and does not find relevant id, it makes a new player. else, it returns the player: yes! it is in the list!
players: Dict[str, Player] = {}
history: List[Player] = []

def update(payload: Mapping[str, Any]) -> Mapping[str, Any]:
    action = payload["action"]
    if action == 'click':
        player = find_player(payload["id"]) # assumes a find_player function is made that looks through players Dictionary to find player using parameter "id", creates a new player if needed,
        player.x = payload["x"]
        player.y = payload["y"]
        history.append(player)
        return {'status' : 'success', 'message' : 'Onclick action received'} # returns achknowledgement from back end BACK TO front end that the click was received  
    elif action == 'gu': #get update
        player = find_player(payload["id"]) #finds player using id : <id>
        histpos = history[player.what_i_know:]
        player.what_i_know = len(history)

        updates: List[Tuple[str, int, int]] = []
        for i in range(len(remaining_history)):
          player = remaining_history[i]
          updates.append( (player.id, player.x, player.y))
        return {"updates": updates}
    print(f'update was called with {payload}')
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