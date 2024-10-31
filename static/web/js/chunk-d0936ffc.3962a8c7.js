(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-d0936ffc"],{"3a74":function(t,e,a){},"3f2c":function(t,e,a){"use strict";a.r(e);var i=function(){var t=this,e=t._self._c;return e("div",{staticClass:"dashboard-editor-container"},[e("el-row",{attrs:{gutter:12}},[e("el-col",{style:{marginBottom:"12px"},attrs:{sm:24,xs:24,md:6,xl:6,lg:6}},[e("chart-card",{staticStyle:{cursor:"pointer"},attrs:{title:"工单总数",total:t.dashboardValue.count.all}},[e("el-tooltip",{staticClass:"item",attrs:{slot:"action",effect:"dark",content:"指标说明",placement:"top-start"},slot:"action"},[e("i",{staticClass:"el-icon-warning-outline"})])],1)],1),t._v(" "),e("el-col",{style:{marginBottom:"12px"},attrs:{sm:24,xs:24,md:6,xl:6,lg:6}},[e("chart-card",{staticStyle:{cursor:"pointer"},attrs:{title:"我创建的",total:t.dashboardValue.count.my_create},nativeOn:{click:function(e){return t.toTicketList("/process/my-create")}}},[e("el-tooltip",{staticClass:"item",attrs:{slot:"action",effect:"dark",content:"指标说明",placement:"top-start"},slot:"action"},[e("i",{staticClass:"el-icon-warning-outline"})])],1)],1),t._v(" "),e("el-col",{style:{marginBottom:"12px"},attrs:{sm:24,xs:24,md:6,xl:6,lg:6}},[e("chart-card",{staticStyle:{cursor:"pointer"},attrs:{title:"我相关的",total:t.dashboardValue.count.related},nativeOn:{click:function(e){return t.toTicketList("/process/related")}}},[e("el-tooltip",{staticClass:"item",attrs:{slot:"action",effect:"dark",content:"指标说明",placement:"top-start"},slot:"action"},[e("i",{staticClass:"el-icon-warning-outline"})])],1)],1),t._v(" "),e("el-col",{style:{marginBottom:"12px"},attrs:{sm:24,xs:24,md:6,xl:6,lg:6}},[e("chart-card",{staticStyle:{cursor:"pointer"},attrs:{title:"我的待办",total:t.dashboardValue.count.upcoming},nativeOn:{click:function(e){return t.toTicketList("/process/upcoming")}}},[e("el-tooltip",{staticClass:"item",attrs:{slot:"action",effect:"dark",content:"指标说明",placement:"top-start"},slot:"action"},[e("i",{staticClass:"el-icon-warning-outline"})])],1)],1)],1),t._v(" "),e("el-card",{style:{marginBottom:"12px",textAlign:"center"},attrs:{bordered:!1,"body-style":{padding:"5"}}},[e("el-date-picker",{attrs:{type:"daterange",align:"right","unlink-panels":"","range-separator":"至","start-placeholder":"开始日期","end-placeholder":"结束日期","picker-options":t.pickerOptions},on:{change:t.timeScreening},model:{value:t.querys,callback:function(e){t.querys=e},expression:"querys"}})],1),t._v(" "),e("el-card",{style:{marginBottom:"12px"},attrs:{bordered:!1,"body-style":{padding:"0"}}},[e("div",{staticClass:"salesCard"},[e("div",[e("h4",{staticStyle:{"margin-left":"20px"},style:{marginBottom:"20px"}},[t._v("提交工单统计")]),t._v(" "),e("RangeSubmit",{attrs:{"statistics-data":t.dashboardValue.submit}})],1)])]),t._v(" "),e("el-row",{attrs:{gutter:12}},[e("el-col",{attrs:{span:8,xs:24}},[e("el-card",{attrs:{bordered:!1,"body-style":{padding:"0"}}},[e("div",{staticClass:"salesCard leaderboard"},[e("rank-list",{attrs:{title:"热门流程排行榜 Top 10",list:t.dashboardValue.ranks}})],1)])],1)],1)],1)},s=[],n=a("90c0"),r=a("8548"),o=a("e8ba"),l=a("b775");function c(t){return Object(l["a"])({url:"/api/v1/dashboard",method:"get",params:t})}var d={name:"DashboardAdmin",components:{ChartCard:n["default"],RankList:r["default"],RangeSubmit:o["default"]},data:function(){return{dashboardValue:{count:{}},rankList:[],submitData:[],querys:"",queryList:{},pickerOptions:{shortcuts:[{text:"最近一周",onClick:function(t){var e=new Date,a=new Date;a.setTime(a.getTime()-6048e5),t.$emit("pick",[a,e])}},{text:"最近一个月",onClick:function(t){var e=new Date,a=new Date;a.setTime(a.getTime()-2592e6),t.$emit("pick",[a,e])}},{text:"最近三个月",onClick:function(t){var e=new Date,a=new Date;a.setTime(a.getTime()-7776e6),t.$emit("pick",[a,e])}}]}}},created:function(){this.getInitData()},methods:{getInitData:function(){var t=this;c(this.queryList).then((function(e){t.dashboardValue=e.data}))},timeScreening:function(){this.querys.length>1&&(this.queryList.start_time=this.querys[0],this.queryList.end_time=this.querys[1],this.getInitData())},toTicketList:function(t){this.$router.push({path:t})}}},u=d,p=(a("d966"),a("2877")),h=Object(p["a"])(u,i,s,!1,null,"fa940a02",null);e["default"]=h.exports},"6d41":function(t,e,a){},8548:function(t,e,a){"use strict";a.r(e);a("7f7f");var i=function(){var t=this,e=t._self._c;return e("div",{staticClass:"rank"},[e("h4",{staticClass:"title"},[t._v("\n    "+t._s(t.title)+"\n    "),e("el-tooltip",{staticClass:"item",attrs:{slot:"action",effect:"dark",content:"最常被提交的流程排行及提交的次数。",placement:"top-end"},slot:"action"},[e("i",{staticClass:"el-icon-warning-outline",staticStyle:{float:"right"}})])],1),t._v(" "),e("ul",{staticClass:"list"},t._l(t.list,(function(a,i){return e("li",{key:i},[e("span",{class:i<3?"active":null},[t._v(t._s(i+1))]),t._v(" "),e("span",[t._v(t._s(a.name))]),t._v(" "),e("span",[t._v(t._s(a.total))])])})),0)])},s=[],n={name:"RankList",props:{title:{type:String,default:""},list:{type:Array,default:null}}},r=n,o=(a("9b2b"),a("2877")),l=Object(o["a"])(r,i,s,!1,null,"3f8eafd7",null);e["default"]=l.exports},"90c0":function(t,e,a){"use strict";a.r(e);var i=function(){var t=this,e=t._self._c;return e("el-card",{attrs:{loading:t.loading,"body-style":{padding:"20px 24px 8px"},bordered:!1}},[e("div",{staticClass:"chart-card-header"},[e("div",{staticClass:"meta"},[e("span",{staticClass:"chart-card-title"},[t._t("title",(function(){return[t._v("\n          "+t._s(t.title)+"\n        ")]}))],2),t._v(" "),e("span",{staticClass:"chart-card-action"},[t._t("action")],2)]),t._v(" "),e("div",{staticClass:"total"},[t._t("total",(function(){return[e("span",[t._v(t._s("function"===typeof t.total&&t.total()||t.total))])]}))],2)]),t._v(" "),e("div",{staticClass:"chart-card-footer"},[e("div",{staticClass:"field"},[t._t("footer")],2)])])},s=[],n=(a("c5f6"),{name:"ChartCard",props:{title:{type:String,default:""},total:{type:[Function,Number,String],required:!1,default:null},loading:{type:Boolean,default:!1}}}),r=n,o=(a("b6a1"),a("2877")),l=Object(o["a"])(r,i,s,!1,null,"553f4ef8",null);e["default"]=l.exports},9406:function(t,e,a){"use strict";a.r(e);var i=function(){var t=this,e=t._self._c;return e("div",{staticClass:"dashboard-container"},[e(t.currentRole,{tag:"component"})],1)},s=[],n=a("3f2c"),r={name:"Dashboard",components:{adminDashboard:n["default"]},data:function(){return{currentRole:"adminDashboard"}},created:function(){}},o=r,l=a("2877"),c=Object(l["a"])(o,i,s,!1,null,null,null);e["default"]=c.exports},"9b2b":function(t,e,a){"use strict";a("6d41")},a7dc:function(t,e,a){"use strict";a.r(e);var i=a("ed08");e["default"]={data:function(){return{$_sidebarElm:null,$_resizeHandler:null}},mounted:function(){var t=this;this.$_resizeHandler=Object(i["b"])((function(){t.chart&&t.chart.resize()}),100),this.$_initResizeEvent(),this.$_initSidebarResizeEvent()},beforeDestroy:function(){this.$_destroyResizeEvent(),this.$_destroySidebarResizeEvent()},activated:function(){this.$_initResizeEvent(),this.$_initSidebarResizeEvent()},deactivated:function(){this.$_destroyResizeEvent(),this.$_destroySidebarResizeEvent()},methods:{$_initResizeEvent:function(){window.addEventListener("resize",this.$_resizeHandler)},$_destroyResizeEvent:function(){window.removeEventListener("resize",this.$_resizeHandler)},$_sidebarResizeHandler:function(t){"width"===t.propertyName&&this.$_resizeHandler()},$_initSidebarResizeEvent:function(){this.$_sidebarElm=document.getElementsByClassName("sidebar-container")[0],this.$_sidebarElm&&this.$_sidebarElm.addEventListener("transitionend",this.$_sidebarResizeHandler)},$_destroySidebarResizeEvent:function(){this.$_sidebarElm&&this.$_sidebarElm.removeEventListener("transitionend",this.$_sidebarResizeHandler)}}}},b6a1:function(t,e,a){"use strict";a("df74")},d966:function(t,e,a){"use strict";a("3a74")},df74:function(t,e,a){},e8ba:function(t,e,a){"use strict";a.r(e);var i=function(){var t=this,e=t._self._c;return e("div",{class:t.className,staticStyle:{padding:"0 25px 20px 20px"},style:{height:t.height,width:t.width}})},s=[],n=a("313e"),r=a.n(n),o=a("a7dc"),l={mixins:[o["default"]],props:{className:{type:String,default:"chart"},width:{type:String,default:"100%"},height:{type:String,default:"350px"},autoResize:{type:Boolean,default:!0},statisticsData:{type:Object,default:function(){return{}},required:!0}},data:function(){return{chart:null}},watch:{statisticsData:{deep:!0,handler:function(t){this.setOptions(t)}}},mounted:function(){var t=this;this.$nextTick((function(){t.initChart()}))},beforeDestroy:function(){this.chart&&(this.chart.dispose(),this.chart=null)},methods:{initChart:function(){this.chart=r.a.init(this.$el,"macarons"),this.setOptions(this.statisticsData)},setOptions:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};t.expectedData,t.actualData;this.chart.setOption({title:{textStyle:{fontSize:15}},tooltip:{trigger:"axis"},legend:{data:["工单总数","未结束","已结束"]},grid:{left:"25",right:"35",bottom:"20",top:"50",containLabel:!0},xAxis:{type:"category",boundaryGap:!1,data:this.statisticsData.datetime},yAxis:{type:"value"},series:[{name:"工单总数",type:"line",data:this.statisticsData.total},{name:"未结束",type:"line",data:this.statisticsData.processing},{name:"已结束",type:"line",data:this.statisticsData.overs}]})}}},c=l,d=a("2877"),u=Object(d["a"])(c,i,s,!1,null,null,null);e["default"]=u.exports}}]);