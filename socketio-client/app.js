var v = new Vue({
    el: "#app",
    data: {
        url: "",
        confirmResource: "",
        token: "",
        result: "",
        room: "",
        rurl: "",
        socket: null,
        connected: false,
        event: "",
        events: []
    },
    mounted() {
        let storedUrl = localStorage.getItem("url")
        if (storedUrl) {
            this.url = storedUrl
        }

        let storedConfirmResource = localStorage.getItem("confirm_resource")
        if (storedConfirmResource) {
            this.confirmResource = storedConfirmResource
        }

        let storedToken = localStorage.getItem("token")
        if (storedToken) {
            this.token = storedToken
        }

        let storedRoom = localStorage.getItem("room")
        if (storedRoom) {
            this.room = storedRoom
        }

    },
    methods: {
        connect() {
            this.rurl = `${this.url}`
            this.socket = io(this.rurl, {
                transports: ['websocket'],
                upgrade: false, // no upgrade
                query: {
                    'room': this.room,
                    'authorization': this.token,
                    'location': 'es-co'
                }

            });
            this.result = ""
            this.socket.on('connect', (s) => {
                this.connected = true
                // storedEvents = localStorage.getItem("events")
                // this.events = storedEvents ? JSON.parse(storedEvents) : []
                // this.events.forEach(event => {
                //     this.socket.on(event, (data) => {
                //         this.result += `${event}<hr class="flat">${syntaxHighlight(data)}<hr>`
                //     })
                // })
            });

            this.socket.on('auth', (data) => {
                this.result += `auth<hr class="flat">${syntaxHighlight(data)}<hr>`
            });

            this.socket.on('disconnect', () => {
                this.connected = false
            });

        },
        disconect() {
            this.socket.close()
        },
        storeConnectionData() {
            if (this.url.trim() != "")
                localStorage.setItem("url", this.url)

            if (this.confirmResource.trim() != "")
                localStorage.setItem("confirm_resource", this.confirmResource)

            if (this.room.trim() != "")
                localStorage.setItem("room", this.room)
        },
        storeToken() {
            if (this.token.trim() != "")
                localStorage.setItem("token", this.token)
        },
        clearPrompt() {
            this.result = ""
        },
        addEvent() {
            if (this.event.trim() != "" && this.events.indexOf(this.event) < 0 && this.connected) {
                this.events.push(this.event)
                //localStorage.setItem("events", JSON.stringify(this.events))
                this.socket.on(this.event, (data) => {
                    this.result += `${this.event}<hr class="flat">${syntaxHighlight(data)}<hr>`
                    if (this.confirmResource.trim() != "") {
                        axios.put(`${this.url}/${this.confirmResource}/${data.uuid}`, {}, {
                            headers: {'authorization': this.token}
                        })
                    }
                })
            }
        },
        removeEvent(_event){
            index = this.events.indexOf(_event)
            if(index > -1 && this.connected){
                this.events.splice(index, 1);
                // localStorage.setItem("events", JSON.stringify(this.events))
                this.socket.off(_event)
            }
            
        }
    }
})

function syntaxHighlight(json) {
    if (typeof json != 'string') {
        json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}