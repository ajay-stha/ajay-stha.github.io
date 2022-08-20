
var that;

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
        listItems: [],
        responseTest : []
    },
    methods: {
        /*randomGenerate() {
            this.message = "🐵 Hello Whoever you are 🔮";
		this.getDataForList();
        },*/
        getDataForList(response = []) {
            /*this.axios.get({
                url: "https://traffic.mdpd.com/api/traffic",
                jsonp: "callback",
                crossOrigin: null,
                dataType: "jsonp",
                data: {
                    format: "json"
                },
                success: function(response) {
			  this.responseTest = response;
                    this.listItems = response;
                }
            });*/
		this.listItems = [...new Map(response.map(v => [v.Address, v])).values()]; //remove duplicate address
		//this.listItems = response;
        },
	copyAddress(address) {
		navigator.clipboard.writeText(address);
	},
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
