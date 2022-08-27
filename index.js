$(document).ready(function(){
	ajaxLOAD();
});
setInterval(ajaxLOAD, 30000);

var app = new Vue({
    el: "#app_basic",
    watch: {
    $listItemsJQuery: function (val) {
      console.log('works')
	}
    },
    data: {
        message: "🐵 Hello World 🔮",
        timestamp: `Timestamp ${new Date().toLocaleString()}`,
        firstLoad: true,
        listItems: [],
        responseTest: [],
        permission : Notification.permission
    },
    methods: {
        getDataForList(response = []) {
            var _tempListItems = [...this.listItems];
            //this.listItems = this.listItems.map(item => item.CreateTime = new Date(item.CreateTime));
            this.listItems = [...new Map(response.map(v => [v.Address, v])).values()]; //remove duplicate address
            if (!this.firstLoad ? _tempListItems[0].Address != this.listItems[0].Address : false) {
                if (this.permission == "granted") {
                    this.showNotification("New Incident", this.listItems[0].Signal + " at " + this.listItems[0].Address);
                }
                else if (this.permission == "default") {
                    Notification.requestPermission(function (permission) {
                        if (permission === "granted") {
                            this.showNotification("New Incident", this.listItems[0].Signal + " at " + this.listItems[0].Address);
                        }
                    });
                }
            }
            this.firstLoad = false;
        },
	    copyAddress(address) {
		    navigator.clipboard.writeText(address);
        },
        showNotification(title, body) {
            var notification = new Notification(title, { body });
            notification.onclick = () => {
                var isFirefox = typeof InstallTrigger !== 'undefined';
                if (!isFirefox) {
                    window.focus();
                    this.copyAddress(this.listItems[0].Address);
                }                
                notification.close();
            }                 
        }
    },
})

function ajaxLOAD() {
    $.ajax({
        url: "https://traffic.mdpd.com/api/traffic",
        jsonp: "callback",
        dataType: "jsonp",
        data: {
            format: "json"
        },
        success: function(response) {
            that = response;
		app.getDataForList(response);
        }
    });
}
