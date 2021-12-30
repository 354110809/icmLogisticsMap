<template>
    <div class="about">
		<div id="map_canvas" class="bm-view"></div>

		<div class="list">
			物流详情地图
		</div>
	</div>
</template>

<script lang="ts">
	import { Component, Vue } from "vue-property-decorator";
	import { getMapConfigJson , loginFun } from '@/utils/api';

	@Component({
		components: {},
	})
	export default class Home extends Vue {

		private BMAP:any;
		// 百度地图key
		private bdMapAk:string = '4m0TaTWRk4hp4UjPGEOj79A4auwSGpgc';

		private mapStyleData:any = []; // 地图默认样式
		// 地图路线颜色
		private strokeColor = ['#999','#08d74a'];

		created() {
			// console.log(mapConfig)			
		}

		async mounted(){
			console.log("页面加载完毕")
			let mapStyleData = await getMapConfigJson();
			this.mapStyleData = mapStyleData;	

			this.initMap()
		}

		// 初始化地图
		private initMap(){
			this.BMAP = new BMapGL.Map("map_canvas", {
				minZoom : 4,
				maxZoom : 14
			});                          // 创建Map实例
			this.BMAP.centerAndZoom(new BMapGL.Point(116.404, 39.915), 4);    // 初始化地图，设置中心点坐标和地图级别
			
			this.BMAP.enableScrollWheelZoom() // 启用地图放大功能
			this.BMAP.enablePinchToZoom()		// 启用双指缩放		

			this.BMAP.setMapStyleV2({styleJson:this.mapStyleData}); // 设置地图样式

			this.getMapPath()
		}

		/**
		 * @description 添加地图覆盖物折线
		 * @param any path 折线路径点集合
		 * @param string [strokeColor='#999'] 折线颜色
		 * @param number [strokeWeight=3] 折线宽度
		 * @param number [strokeOpacity=1] 折线透明度
		 */
		private setMapPolyline(path:any,strokeColor:string = '#999', strokeWeight:number = 3 , strokeOpacity:number = 1){
			var polyline = new BMapGL.Polyline(path,{
				strokeColor, 
				strokeWeight,
				strokeOpacity
			});
			this.BMAP.addOverlay(polyline);
		}

		/** 
		 * @description 添加地图覆盖物文本框,起始点信息
		 * @param any spot 地图定位点信息
		 * @param any stateNmae 地点节点
		 * @param any spotText 地点名称
		*/
		private setMapLable(spot:any,stateNmae:string,spotText:string){
			let content = `
				<p style="color:#fff;padding:3px 5px;background:#08d74a;">${stateNmae}</p>
				<p style="color:#333;padding:3px 5px;">${spotText}</p>
			`;
			
			let label = new BMapGL.Label(content, {       // 创建文本标注
				position: spot,
				offset: new BMapGL.Size(5,-30)
			})  

			label.setStyle({                     // 设置label的样式
				color: '#000',
				fontSize: '14px',
				border: '1px solid #dedede',
				display: 'flex',
				padding:'0',
				borderRadius: '5px',
				alignItems: 'center',
				overflow: 'hidden'
				
			})
			this.BMAP.addOverlay(label);         // 将标注添加到地图中
		}

		// 设置地图配置数据
		private setMapConfig(data:any){
			// 设置整体路径
			var newPath = data.map((item:any)=>{
				return new BMapGL.Point(item.lng,item.lat);
			});
			// this.setMapPolyline(newPath,this.strokeColor[0] );

			// 设置已通行的路径
      		var currentPath = newPath.slice(0, parseInt( String( newPath.length / 2 ) ) );
			this.setMapPolyline(currentPath, this.strokeColor[1]);

			// 设置未通行的路径
			var futurePath = newPath.slice( parseInt( String( newPath.length / 2 ) ) ,newPath.length-1);
			this.setMapPolyline(futurePath, this.strokeColor[0]);

			// 返回当前路径点最佳的缩放级别
			var view = this.BMAP.getViewport(newPath); 
			this.BMAP.centerAndZoom(view.center,view.zoom); 
			// 设置地图最小缩放级别
			this.BMAP.setMinZoom(view.zoom-1); 

			// 小车移动轨迹动画
			let lushuPath = currentPath.slice(currentPath.length-5 , currentPath.length);
			var lushu = new BMapGLLib.LuShu(this.BMAP, lushuPath, {
                    // defaultContent: '', // ""
                    autoView: false, // 是否开启自动视野调整，如果开启那么路书在运动过程中会根据视野自动调整
                    icon: new BMapGL.Icon(require('@/assets/car.png'), new BMapGL.Size(32, 32), {anchor: new BMapGL.Size(10, 10)}),
                    speed: 5000,
                    enableRotation: true, // 是否设置marker随着道路的走向进行旋转
                });
			//开启运动
			lushu.start()

			// 添加开始点信息
			this.setMapLable(newPath[0],'发','北京东城区');
			// 添加结束点信息
			this.setMapLable(newPath[newPath.length-1],'收','邯郸开发区');
			
		}
		
		// 请求：获取物流地图路线
		public getMapPath(){
			// 接口返回的所有路径点
			var data = [
				{"lng":116.403944,"lat":39.914024,"of":"inner"},{"lng":116.402106,"lat":39.913978,"of":"inner"},{"lng":116.402126,"lat":39.913768,"of":"inner"},{"lng":116.402126,"lat":39.913768,"of":"inner"},
				{"lng":116.402156,"lat":39.913378,"of":"inner"},{"lng":116.402156,"lat":39.913338,"of":"inner"},{"lng":116.402288,"lat":39.91131,"of":"inner"},{"lng":116.402288,"lat":39.91121,"of":"inner"},
				{"lng":116.402308,"lat":39.91092,"of":"inner"},{"lng":116.402389,"lat":39.9098,"of":"inner"},{"lng":116.40241,"lat":39.909451,"of":"inner"},{"lng":116.40242,"lat":39.909271,"of":"inner"},
				{"lng":116.402471,"lat":39.908331,"of":"inner"},{"lng":116.402511,"lat":39.907622,"of":"inner"},{"lng":116.402512,"lat":39.907572,"of":"inner"},{"lng":116.402512,"lat":39.907502,"of":"inner"},
				{"lng":116.402532,"lat":39.907192,"of":"inner"},{"lng":116.402532,"lat":39.907162,"of":"inner"},{"lng":116.402562,"lat":39.906662,"of":"inner"},{"lng":116.402572,"lat":39.906532,"of":"inner"},
				{"lng":116.402583,"lat":39.906422,"of":"inner"},{"lng":116.402583,"lat":39.906422,"of":"inner"},{"lng":116.402902,"lat":39.906433,"of":"inner"},{"lng":116.40572,"lat":39.906519,"of":"inner"},
				{"lng":116.40607,"lat":39.906529,"of":"inner"},{"lng":116.40674,"lat":39.906619,"of":"inner"},{"lng":116.40741,"lat":39.906719,"of":"inner"},{"lng":116.40785,"lat":39.906788,"of":"inner"},
				{"lng":116.40785,"lat":39.906788,"of":"inner"},{"lng":116.40838,"lat":39.906857,"of":"inner"},{"lng":116.409481,"lat":39.906954,"of":"inner"},{"lng":116.410793,"lat":39.90699,"of":"inner"},
				{"lng":116.411324,"lat":39.907017,"of":"inner"},{"lng":116.412967,"lat":39.907059,"of":"inner"},{"lng":116.413117,"lat":39.907058,"of":"inner"},{"lng":116.413398,"lat":39.907056,"of":"inner"},
				{"lng":116.413588,"lat":39.907064,"of":"inner"},{"lng":116.416155,"lat":39.907114,"of":"inner"},{"lng":116.416355,"lat":39.907123,"of":"inner"},{"lng":116.416355,"lat":39.907123,"of":"inner"},
				{"lng":116.417288,"lat":39.907144,"of":"inner"},{"lng":116.417931,"lat":39.907157,"of":"inner"},{"lng":116.418222,"lat":39.907164,"of":"inner"},{"lng":116.418302,"lat":39.907163,"of":"inner"},
				{"lng":116.418302,"lat":39.907163,"of":"inner"},{"lng":116.418543,"lat":39.907171,"of":"inner"},{"lng":116.419004,"lat":39.907176,"of":"inner"},{"lng":116.419346,"lat":39.907192,"of":"inner"},
				{"lng":116.419577,"lat":39.907189,"of":"inner"},{"lng":116.421023,"lat":39.907212,"of":"inner"},{"lng":116.421023,"lat":39.907212,"of":"inner"},{"lng":116.422007,"lat":39.907229,"of":"inner"},
				{"lng":116.422007,"lat":39.907229,"of":"inner"},{"lng":116.422338,"lat":39.907234,"of":"inner"},{"lng":116.423283,"lat":39.907251,"of":"inner"},{"lng":116.423283,"lat":39.907251,"of":"inner"},
				{"lng":116.423414,"lat":39.90716,"of":"inner"},{"lng":116.423504,"lat":39.907148,"of":"inner"},{"lng":116.423504,"lat":39.907148,"of":"inner"},{"lng":116.423595,"lat":39.907147,"of":"inner"},
				{"lng":116.423595,"lat":39.907147,"of":"inner"},{"lng":116.424318,"lat":39.907157,"of":"inner"},{"lng":116.424318,"lat":39.907157,"of":"inner"},{"lng":116.42464,"lat":39.907162,"of":"inner"},
				{"lng":116.42464,"lat":39.907162,"of":"inner"},{"lng":116.424881,"lat":39.907148,"of":"inner"},{"lng":116.424881,"lat":39.907148,"of":"inner"},{"lng":116.424891,"lat":39.907008,"of":"inner"},{"lng":116.424891,"lat":39.907008,"of":"inner"},{"lng":116.424911,"lat":39.906818,"of":"inner"},{"lng":116.424983,"lat":39.905577,"of":"inner"},{"lng":116.424983,"lat":39.905527,"of":"inner"},{"lng":116.425024,"lat":39.904417,"of":"inner"},{"lng":116.425066,"lat":39.903407,"of":"inner"},{"lng":116.425066,"lat":39.903327,"of":"inner"},{"lng":116.425076,"lat":39.903087,"of":"inner"},{"lng":116.425107,"lat":39.902327,"of":"inner"},{"lng":116.425117,"lat":39.902117,"of":"inner"},{"lng":116.425127,"lat":39.902066,"of":"inner"},{"lng":116.425158,"lat":39.900976,"of":"inner"},{"lng":116.425158,"lat":39.900976,"of":"inner"},{"lng":116.425169,"lat":39.900646,"of":"inner"},{"lng":116.425189,"lat":39.900346,"of":"inner"},{"lng":116.42519,"lat":39.899886,"of":"inner"},{"lng":116.42517,"lat":39.899417,"of":"inner"},{"lng":116.42518,"lat":39.899167,"of":"inner"},{"lng":116.425211,"lat":39.898786,"of":"inner"},{"lng":116.425221,"lat":39.898656,"of":"inner"},{"lng":116.425251,"lat":39.898406,"of":"inner"},{"lng":116.425261,"lat":39.898336,"of":"inner"},{"lng":116.425282,"lat":39.898195,"of":"inner"},{"lng":116.425282,"lat":39.898195,"of":"inner"},{"lng":116.425302,"lat":39.897755,"of":"inner"},{"lng":116.425395,"lat":39.895335,"of":"inner"},{"lng":116.425395,"lat":39.895335,"of":"inner"},{"lng":116.425415,"lat":39.894994,"of":"inner"},{"lng":116.425446,"lat":39.894524,"of":"inner"},{"lng":116.425486,"lat":39.894353,"of":"inner"},{"lng":116.425486,"lat":39.894353,"of":"inner"},{"lng":116.425577,"lat":39.894012,"of":"inner"},{"lng":116.425577,"lat":39.894012,"of":"inner"},{"lng":116.425869,"lat":39.893398,"of":"inner"},{"lng":116.42598,"lat":39.893156,"of":"inner"},{"lng":116.42598,"lat":39.893156,"of":"inner"},{"lng":116.426131,"lat":39.892884,"of":"inner"},{"lng":116.426563,"lat":39.892037,"of":"inner"},{"lng":116.426674,"lat":39.891816,"of":"inner"},{"lng":116.426805,"lat":39.891554,"of":"inner"},{"lng":116.427027,"lat":39.89114,"of":"inner"},{"lng":116.427097,"lat":39.890919,"of":"inner"},{"lng":116.427148,"lat":39.890588,"of":"inner"},{"lng":116.427168,"lat":39.890178,"of":"inner"},{"lng":116.427178,"lat":39.890048,"of":"inner"},{"lng":116.427188,"lat":39.889908,"of":"inner"},{"lng":116.427188,"lat":39.889908,"of":"inner"},{"lng":116.427198,"lat":39.889768,"of":"inner"},{"lng":116.427229,"lat":39.888807,"of":"inner"},{"lng":116.42726,"lat":39.888237,"of":"inner"},{"lng":116.42726,"lat":39.887967,"of":"inner"},{"lng":116.42727,"lat":39.887777,"of":"inner"},{"lng":116.427291,"lat":39.887257,"of":"inner"},{"lng":116.427291,"lat":39.887137,"of":"inner"},{"lng":116.427301,"lat":39.887057,"of":"inner"},{"lng":116.427321,"lat":39.886866,"of":"inner"},{"lng":116.427392,"lat":39.885595,"of":"inner"},
				{"lng":116.427422,"lat":39.884805,"of":"inner"},{"lng":116.427514,"lat":39.883064,"of":"inner"},{"lng":116.427584,"lat":39.881753,"of":"inner"},{"lng":116.427605,"lat":39.881483,"of":"inner"},{"lng":116.427625,"lat":39.881252,"of":"inner"},{"lng":116.427696,"lat":39.879701,"of":"inner"},{"lng":116.427706,"lat":39.879491,"of":"inner"},{"lng":116.427726,"lat":39.879171,"of":"inner"},{"lng":116.427766,"lat":39.87825,"of":"inner"},{"lng":116.427786,"lat":39.87779,"of":"inner"},{"lng":116.427786,"lat":39.87764,"of":"inner"},{"lng":116.427786,"lat":39.87761,"of":"inner"},{"lng":116.427786,"lat":39.87761,"of":"inner"},{"lng":116.427786,"lat":39.87749,"of":"inner"},{"lng":116.427796,"lat":39.87735,"of":"inner"},{"lng":116.427796,"lat":39.87725,"of":"inner"},{"lng":116.427806,"lat":39.877079,"of":"inner"},{"lng":116.427837,"lat":39.876869,"of":"inner"},{"lng":116.427837,"lat":39.876819,"of":"inner"},{"lng":116.427847,"lat":39.876659,"of":"inner"},{"lng":116.427857,"lat":39.876349,"of":"inner"},{"lng":116.427877,"lat":39.875998,"of":"inner"},{"lng":116.427877,"lat":39.875968,"of":"inner"},{"lng":116.427907,"lat":39.875438,"of":"inner"},{"lng":116.427927,"lat":39.874988,"of":"inner"},{"lng":116.427977,"lat":39.874037,"of":"inner"},{"lng":116.427987,"lat":39.873727,"of":"inner"},{"lng":116.428007,"lat":39.873256,"of":"inner"},{"lng":116.428007,"lat":39.873256,"of":"inner"},{"lng":116.428078,"lat":39.871895,"of":"inner"},{"lng":116.428078,"lat":39.871785,"of":"inner"},{"lng":116.428077,"lat":39.871695,"of":"inner"},{"lng":116.428138,"lat":39.870494,"of":"inner"},{"lng":116.428148,"lat":39.870304,"of":"inner"},{"lng":116.428148,"lat":39.870304,"of":"inner"},{"lng":116.428157,"lat":39.870053,"of":"inner"},{"lng":116.428257,"lat":39.868432,"of":"inner"},{"lng":116.428357,"lat":39.8662,"of":"inner"},{"lng":116.428357,"lat":39.8662,"of":"inner"},{"lng":116.428407,"lat":39.865339,"of":"inner"},{"lng":116.428417,"lat":39.865138,"of":"inner"},{"lng":116.428427,"lat":39.864738,"of":"inner"},{"lng":116.428427,"lat":39.864538,"of":"inner"},{"lng":116.428427,"lat":39.864538,"of":"inner"},{"lng":116.428637,"lat":39.863424,"of":"inner"},{"lng":116.428637,"lat":39.863424,"of":"inner"},{"lng":116.428818,"lat":39.863451,"of":"inner"},{"lng":116.42908,"lat":39.863487,"of":"inner"},{"lng":116.429321,"lat":39.863533,"of":"inner"},{"lng":116.429724,"lat":39.863596,"of":"inner"},{"lng":116.430196,"lat":39.863688,"of":"inner"},{"lng":116.431384,"lat":39.863877,"of":"inner"},{"lng":116.431645,"lat":39.863923,"of":"inner"},{"lng":116.43247,"lat":39.864028,"of":"inner"},{"lng":116.43247,"lat":39.864028,"of":"inner"},{"lng":116.433024,"lat":39.864078,"of":"inner"},{"lng":116.433175,"lat":39.864096,"of":"inner"},{"lng":116.433527,"lat":39.864119,"of":"inner"},{"lng":116.433849,"lat":39.864144,"of":"inner"},{"lng":116.434151,"lat":39.864158,"of":"inner"},{"lng":116.434281,"lat":39.864166,"of":"inner"},{"lng":116.435127,"lat":39.864211,"of":"inner"},{"lng":116.43568,"lat":39.86422,"of":"inner"},{"lng":116.43568,"lat":39.86422,"of":"inner"},{"lng":116.436073,"lat":39.864403,"of":"inner"},{"lng":116.436073,"lat":39.864403,"of":"inner"},{"lng":116.436988,"lat":39.864447,"of":"inner"},{"lng":116.437884,"lat":39.864501,"of":"inner"},{"lng":116.439554,"lat":39.86457,"of":"inner"},{"lng":116.440832,"lat":39.864638,"of":"inner"},{"lng":116.441013,"lat":39.864644,"of":"inner"},{"lng":116.441325,"lat":39.864659,"of":"inner"},{"lng":116.441848,"lat":39.86468,"of":"inner"},{"lng":116.442402,"lat":39.86471,"of":"inner"},{"lng":116.442402,"lat":39.86471,"of":"inner"},{"lng":116.442683,"lat":39.864735,"of":"inner"},{"lng":116.44385,"lat":39.864775,"of":"inner"},{"lng":116.444051,"lat":39.864782,"of":"inner"},{"lng":116.444333,"lat":39.864777,"of":"inner"},{"lng":116.444414,"lat":39.864776,"of":"inner"},{"lng":116.444665,"lat":39.864782,"of":"inner"},{"lng":116.445339,"lat":39.864761,"of":"inner"},{"lng":116.4455,"lat":39.864758,"of":"inner"},{"lng":116.446515,"lat":39.864722,"of":"inner"},{"lng":116.446998,"lat":39.864704,"of":"inner"},{"lng":116.447722,"lat":39.864673,"of":"inner"},{"lng":116.448013,"lat":39.864679,"of":"inner"},{"lng":116.448496,"lat":39.864661,"of":"inner"},{"lng":116.451128,"lat":39.864585,"of":"inner"},{"lng":116.45157,"lat":39.864579,"of":"inner"},{"lng":116.452394,"lat":39.864578,"of":"inner"},{"lng":116.453137,"lat":39.864619,"of":"inner"},{"lng":116.453137,"lat":39.864619,"of":"inner"},{"lng":116.453217,"lat":39.864629,"of":"inner"},{"lng":116.454382,"lat":39.864775,"of":"inner"},{"lng":116.455596,"lat":39.865053,"of":"inner"},{"lng":116.456861,"lat":39.865481,"of":"inner"},{"lng":116.456981,"lat":39.86553,"of":"inner"},{"lng":116.457232,"lat":39.865638,"of":"inner"},{"lng":116.457402,"lat":39.865706,"of":"inner"},{"lng":116.457673,"lat":39.865844,"of":"inner"},{"lng":116.457864,"lat":39.865942,"of":"inner"},{"lng":116.458145,"lat":39.86609,"of":"inner"},{"lng":116.458706,"lat":39.866436,"of":"inner"},{"lng":116.458897,"lat":39.866555,"of":"inner"},{"lng":116.459067,"lat":39.866673,"of":"inner"},{"lng":116.459458,"lat":39.866961,"of":"inner"},{"lng":116.459538,"lat":39.86703,"of":"inner"},{"lng":116.459538,"lat":39.86703,"of":"inner"},{"lng":116.46005,"lat":39.867167,"of":"inner"},{"lng":116.46013,"lat":39.867177,"of":"inner"},{"lng":116.46038,"lat":39.867185,"of":"inner"},{"lng":116.460681,"lat":39.867153,"of":"inner"},{"lng":116.460971,"lat":39.867152,"of":"inner"},{"lng":116.461392,"lat":39.86714,"of":"inner"},{"lng":116.461863,"lat":39.867117,"of":"inner"},{"lng":116.462143,"lat":39.867116,"of":"inner"},{"lng":116.462334,"lat":39.867105,"of":"inner"},{"lng":116.462394,"lat":39.867095,"of":"inner"},{"lng":116.462824,"lat":39.866993,"of":"inner"},{"lng":116.462824,"lat":39.866993,"of":"inner"},{"lng":116.463845,"lat":39.86614,"of":"inner"},{"lng":116.464285,"lat":39.865829,"of":"inner"},{"lng":116.466375,"lat":39.864176,"of":"inner"},{"lng":116.468993,"lat":39.862108,"of":"inner"},{"lng":116.472486,"lat":39.859351,"of":"inner"},{"lng":116.473902,"lat":39.85818,"of":"inner"},{"lng":116.475766,"lat":39.856553,"of":"inner"},{"lng":116.477679,"lat":39.854781,"of":"inner"},{"lng":116.480466,"lat":39.852151,"of":"inner"},{"lng":116.481928,"lat":39.850809,"of":"inner"},{"lng":116.481928,"lat":39.850809,"of":"inner"},{"lng":116.483022,"lat":39.849784,"of":"inner"},{"lng":116.483022,"lat":39.849784,"of":"inner"},{"lng":116.483777,"lat":39.849064,"of":"inner"},{"lng":116.484722,"lat":39.848178,"of":"inner"},{"lng":116.484851,"lat":39.84806,"of":"inner"},{"lng":116.485119,"lat":39.847804,"of":"inner"},{"lng":116.485577,"lat":39.84737,"of":"inner"},{"lng":116.485765,"lat":39.847193,"of":"inner"},{"lng":116.486073,"lat":39.846908,"of":"inner"},{"lng":116.487772,"lat":39.845305,"of":"inner"},{"lng":116.488498,"lat":39.844627,"of":"inner"},{"lng":116.488974,"lat":39.844175,"of":"inner"},{"lng":116.489034,"lat":39.844116,"of":"inner"},{"lng":116.489034,"lat":39.844116,"of":"inner"},{"lng":116.489123,"lat":39.844037,"of":"inner"},{"lng":116.492013,"lat":39.841317,"of":"inner"},{"lng":116.494188,"lat":39.839286,"of":"inner"},{"lng":116.495916,"lat":39.837667,"of":"inner"},{"lng":116.496918,"lat":39.836765,"of":"inner"},{"lng":116.497335,"lat":39.836392,"of":"inner"},{"lng":116.497544,"lat":39.836206,"of":"inner"},{"lng":116.498408,"lat":39.835462,"of":"inner"},{"lng":116.499093,"lat":39.834884,"of":"inner"},{"lng":116.500156,"lat":39.833983,"of":"inner"},{"lng":116.500662,"lat":39.833562,"of":"inner"},{"lng":116.501566,"lat":39.832838,"of":"inner"},{"lng":116.501745,"lat":39.832691,"of":"inner"},{"lng":116.503166,"lat":39.831576,"of":"inner"},{"lng":116.503881,"lat":39.831038,"of":"inner"},{"lng":116.504358,"lat":39.830666,"of":"inner"},{"lng":116.506426,"lat":39.82917,"of":"inner"},{"lng":116.507022,"lat":39.828759,"of":"inner"},{"lng":116.507589,"lat":39.828358,"of":"inner"},{"lng":116.507589,"lat":39.828358,"of":"inner"},
				{"lng":116.508245,"lat":39.827908,"of":"inner"},{"lng":116.508534,"lat":39.827722,"of":"inner"},{"lng":116.509498,"lat":39.827086,"of":"inner"},{"lng":116.509558,"lat":39.827047,"of":"inner"},{"lng":116.510105,"lat":39.826684,"of":"inner"},{"lng":116.510105,"lat":39.826684,"of":"inner"},{"lng":116.510652,"lat":39.826332,"of":"inner"},{"lng":116.5112,"lat":39.825989,"of":"inner"},{"lng":116.512016,"lat":39.825479,"of":"inner"},{"lng":116.512892,"lat":39.82494,"of":"inner"},{"lng":116.513599,"lat":39.824498,"of":"inner"},{"lng":116.513838,"lat":39.824361,"of":"inner"},{"lng":116.514207,"lat":39.824105,"of":"inner"},{"lng":116.515193,"lat":39.823505,"of":"inner"},{"lng":116.516488,"lat":39.822708,"of":"inner"},{"lng":116.516997,"lat":39.822402,"of":"inner"},{"lng":116.517176,"lat":39.822294,"of":"inner"},{"lng":116.518293,"lat":39.821583,"of":"inner"},{"lng":116.518881,"lat":39.821197,"of":"inner"},{"lng":116.518881,"lat":39.821197,"of":"inner"},{"lng":116.51936,"lat":39.82089,"of":"inner"},{"lng":116.520907,"lat":39.819769,"of":"inner"},{"lng":116.521216,"lat":39.819551,"of":"inner"},{"lng":116.523083,"lat":39.818198,"of":"inner"},{"lng":116.523243,"lat":39.818068,"of":"inner"},{"lng":116.523373,"lat":39.817959,"of":"inner"},{"lng":116.523613,"lat":39.81771,"of":"inner"},{"lng":116.524502,"lat":39.816811,"of":"inner"},{"lng":116.524622,"lat":39.816702,"of":"inner"},{"lng":116.525152,"lat":39.816172,"of":"inner"},{"lng":116.525452,"lat":39.815883,"of":"inner"},{"lng":116.525982,"lat":39.815383,"of":"inner"},{"lng":116.526572,"lat":39.814843,"of":"inner"},{"lng":116.527042,"lat":39.814493,"of":"inner"},{"lng":116.528603,"lat":39.813331,"of":"inner"},{"lng":116.529283,"lat":39.812769,"of":"inner"},{"lng":116.529474,"lat":39.812589,"of":"inner"},{"lng":116.529764,"lat":39.812298,"of":"inner"},{"lng":116.530545,"lat":39.811485,"of":"inner"},{"lng":116.531357,"lat":39.810602,"of":"inner"},{"lng":116.531767,"lat":39.81014,"of":"inner"},{"lng":116.532619,"lat":39.809155,"of":"inner"},{"lng":116.533231,"lat":39.808421,"of":"inner"},{"lng":116.533813,"lat":39.807698,"of":"inner"},{"lng":116.533913,"lat":39.807567,"of":"inner"},{"lng":116.534113,"lat":39.807316,"of":"inner"},{"lng":116.534344,"lat":39.807004,"of":"inner"},{"lng":116.534595,"lat":39.806692,"of":"inner"},{"lng":116.535147,"lat":39.805928,"of":"inner"},{"lng":116.535608,"lat":39.805294,"of":"inner"},{"lng":116.536542,"lat":39.803926,"of":"inner"},{"lng":116.536622,"lat":39.803805,"of":"inner"},{"lng":116.537134,"lat":39.803021,"of":"inner"},{"lng":116.537767,"lat":39.802075,"of":"inner"},{"lng":116.538732,"lat":39.800695,"of":"inner"},{"lng":116.539465,"lat":39.799727,"of":"inner"},{"lng":116.540149,"lat":39.798849,"of":"inner"},{"lng":116.541636,"lat":39.797061,"of":"inner"},{"lng":116.541737,"lat":39.796949,"of":"inner"},{"lng":116.542079,"lat":39.796555,"of":"inner"},{"lng":116.54238,"lat":39.796211,"of":"inner"},{"lng":116.542662,"lat":39.795907,"of":"inner"},{"lng":116.543185,"lat":39.79535,"of":"inner"},{"lng":116.543265,"lat":39.795259,"of":"inner"},{"lng":116.543446,"lat":39.795067,"of":"inner"},{"lng":116.543658,"lat":39.794844,"of":"inner"},{"lng":116.544583,"lat":39.793901,"of":"inner"},{"lng":116.5457,"lat":39.792814,"of":"inner"},{"lng":116.546505,"lat":39.792072,"of":"inner"},{"lng":116.546817,"lat":39.791787,"of":"inner"},{"lng":116.547531,"lat":39.791146,"of":"inner"},{"lng":116.549283,"lat":39.789667,"of":"inner"},{"lng":116.551165,"lat":39.788145,"of":"inner"},{"lng":116.551669,"lat":39.787726,"of":"inner"},{"lng":116.552414,"lat":39.787083,"of":"inner"},{"lng":116.552615,"lat":39.78691,"of":"inner"},{"lng":116.553078,"lat":39.786502,"of":"inner"},{"lng":116.553451,"lat":39.786165,"of":"inner"},{"lng":116.553914,"lat":39.785727,"of":"inner"},{"lng":116.554378,"lat":39.785299,"of":"inner"},{"lng":116.554649,"lat":39.785044,"of":"inner"},{"lng":116.55472,"lat":39.784973,"of":"inner"},{"lng":116.55474,"lat":39.784952,"of":"inner"},{"lng":116.555294,"lat":39.784423,"of":"inner"},{"lng":116.555838,"lat":39.783873,"of":"inner"},{"lng":116.555919,"lat":39.783791,"of":"inner"},{"lng":116.556241,"lat":39.783466,"of":"inner"},{"lng":116.556624,"lat":39.783069,"of":"inner"},{"lng":116.557067,"lat":39.782601,"of":"inner"},{"lng":116.55749,"lat":39.782143,"of":"inner"},{"lng":116.557752,"lat":39.781859,"of":"inner"},{"lng":116.558084,"lat":39.781483,"of":"inner"},{"lng":116.558356,"lat":39.781168,"of":"inner"},{"lng":116.558759,"lat":39.780711,"of":"inner"},{"lng":116.559162,"lat":39.780234,"of":"inner"},{"lng":116.559595,"lat":39.779726,"of":"inner"},{"lng":116.560119,"lat":39.779067,"of":"inner"},{"lng":116.560612,"lat":39.778438,"of":"inner"},{"lng":116.561529,"lat":39.777223,"of":"inner"},{"lng":116.561781,"lat":39.776868,"of":"inner"},{"lng":116.562154,"lat":39.776352,"of":"inner"},{"lng":116.562204,"lat":39.776291,"of":"inner"},{"lng":116.562909,"lat":39.775259,"of":"inner"},{"lng":116.562969,"lat":39.775158,"of":"inner"},{"lng":116.56304,"lat":39.775057,"of":"inner"},{"lng":116.563493,"lat":39.774379,"of":"inner"},{"lng":116.563735,"lat":39.774005,"of":"inner"},{"lng":116.563866,"lat":39.773813,"of":"inner"},{"lng":116.564691,"lat":39.77257,"of":"inner"},{"lng":116.56593,"lat":39.7707,"of":"inner"},{"lng":116.566664,"lat":39.769609,"of":"inner"},{"lng":116.567127,"lat":39.768902,"of":"inner"},{"lng":116.567127,"lat":39.768902,"of":"inner"},{"lng":116.56759,"lat":39.768205,"of":"inner"},{"lng":116.569391,"lat":39.765498,"of":"inner"},{"lng":116.569682,"lat":39.765064,"of":"inner"},{"lng":116.570004,"lat":39.76461,"of":"inner"},{"lng":116.571039,"lat":39.763196,"of":"inner"},{"lng":116.571964,"lat":39.762004,"of":"inner"},{"lng":116.57346,"lat":39.760216,"of":"inner"},{"lng":116.57346,"lat":39.760216,"of":"inner"},{"lng":116.574716,"lat":39.758812,"of":"inner"},{"lng":116.575679,"lat":39.757823,"of":"inner"},{"lng":116.576432,"lat":39.757035,"of":"inner"},{"lng":116.577063,"lat":39.75643,"of":"inner"},{"lng":116.577856,"lat":39.755693,"of":"inner"},{"lng":116.578738,"lat":39.754886,"of":"inner"},{"lng":116.57962,"lat":39.75413,"of":"inner"},{"lng":116.579871,"lat":39.753908,"of":"inner"},{"lng":116.580101,"lat":39.753717,"of":"inner"},{"lng":116.580191,"lat":39.753646,"of":"inner"},{"lng":116.580772,"lat":39.753163,"of":"inner"},{"lng":116.581293,"lat":39.75274,"of":"inner"},{"lng":116.581584,"lat":39.752509,"of":"inner"},{"lng":116.581944,"lat":39.752227,"of":"inner"},{"lng":116.582695,"lat":39.751654,"of":"inner"},{"lng":116.583476,"lat":39.751071,"of":"inner"},{"lng":116.585807,"lat":39.749447,"of":"inner"},{"lng":116.588166,"lat":39.747937,"of":"inner"},{"lng":116.590813,"lat":39.746264,"of":"inner"},{"lng":116.591532,"lat":39.745817,"of":"inner"},{"lng":116.591991,"lat":39.74553,"of":"inner"},{"lng":116.59217,"lat":39.74541,"of":"inner"},{"lng":116.595183,"lat":39.74353,"of":"inner"},{"lng":116.597505,"lat":39.742081,"of":"inner"},{"lng":116.598252,"lat":39.741618,"of":"inner"},{"lng":116.598949,"lat":39.741185,"of":"inner"},{"lng":116.601696,"lat":39.739488,"of":"inner"},{"lng":116.603925,"lat":39.738109,"of":"inner"},{"lng":116.604352,"lat":39.737845,"of":"inner"},{"lng":116.605267,"lat":39.737248,"of":"inner"},{"lng":116.606351,"lat":39.736515,"of":"inner"},{"lng":116.607066,"lat":39.736026,"of":"inner"},{"lng":116.607812,"lat":39.735488,"of":"inner"},{"lng":116.608001,"lat":39.735352,"of":"inner"},{"lng":116.608776,"lat":39.734764,"of":"inner"},{"lng":116.609898,"lat":39.733893,"of":"inner"},{"lng":116.610643,"lat":39.733286,"of":"inner"},{"lng":116.611021,"lat":39.732983,"of":"inner"},{"lng":116.612421,"lat":39.731777,"of":"inner"},{"lng":116.61404,"lat":39.730286,"of":"inner"},{"lng":116.615172,"lat":39.729177,"of":"inner"},{"lng":116.616015,"lat":39.728302,"of":"inner"},{"lng":116.6167,"lat":39.727564,"of":"inner"},{"lng":116.617117,"lat":39.727092,"of":"inner"},{"lng":116.617524,"lat":39.726629,"of":"inner"},{"lng":116.617772,"lat":39.726334,"of":"inner"},{"lng":116.61813,"lat":39.72592,"of":"inner"},{"lng":116.618537,"lat":39.725437,"of":"inner"},{"lng":116.619112,"lat":39.724708,"of":"inner"},{"lng":116.619589,"lat":39.724096,"of":"inner"},{"lng":116.620254,"lat":39.723218,"of":"inner"},{"lng":116.620641,"lat":39.722705,"of":"inner"},{"lng":116.623133,"lat":39.719428,"of":"inner"},{"lng":116.62354,"lat":39.718905,"of":"inner"},{"lng":116.625198,"lat":39.716902,"of":"inner"},{"lng":116.625626,"lat":39.716429,"of":"inner"},{"lng":116.626261,"lat":39.715729,"of":"inner"},{"lng":116.626689,"lat":39.715266,"of":"inner"},{"lng":116.627017,"lat":39.714921,"of":"inner"},{"lng":116.627275,"lat":39.714665,"of":"inner"},{"lng":116.627464,"lat":39.714467,"of":"inner"},{"lng":116.627802,"lat":39.714133,"of":"inner"},{"lng":116.628249,"lat":39.713679,"of":"inner"},{"lng":116.628498,"lat":39.713443,"of":"inner"},{"lng":116.628707,"lat":39.713236,"of":"inner"},{"lng":116.629532,"lat":39.712468,"of":"inner"},{"lng":116.631402,"lat":39.710813,"of":"inner"},{"lng":116.632765,"lat":39.70969,"of":"inner"},{"lng":116.633691,"lat":39.70897,"of":"inner"},{"lng":116.634598,"lat":39.70828,"of":"inner"},{"lng":116.635643,"lat":39.707531,"of":"inner"},{"lng":116.636799,"lat":39.706731,"of":"inner"},{"lng":116.637507,"lat":39.706257,"of":"inner"},{"lng":116.638045,"lat":39.705902,"of":"inner"},{"lng":116.638634,"lat":39.705526,"of":"inner"},{"lng":116.639362,"lat":39.705071,"of":"inner"},{"lng":116.6402,"lat":39.704566,"of":"inner"},{"lng":116.642735,"lat":39.703098,"of":"inner"},{"lng":116.642905,"lat":39.702998,"of":"inner"},{"lng":116.643105,"lat":39.702879,"of":"inner"},{"lng":116.647022,"lat":39.700614,"of":"inner"},{"lng":116.648763,"lat":39.699601,"of":"inner"},{"lng":116.649574,"lat":39.699139,"of":"inner"},{"lng":116.651316,"lat":39.698122,"of":"inner"},{"lng":116.651737,"lat":39.69787,"of":"inner"},{"lng":116.654312,"lat":39.696284,"of":"inner"},{"lng":116.657381,"lat":39.694227,"of":"inner"},
				{"lng":116.658535,"lat":39.693395,"of":"inner"},{"lng":116.660664,"lat":39.691821,"of":"inner"},{"lng":116.662724,"lat":39.690194,"of":"inner"},
				{"lng":116.664614,"lat":39.688597,"of":"inner"},{"lng":116.666534,"lat":39.686888,"of":"inner"},{"lng":116.667017,"lat":39.68644,"of":"inner"},
				{"lng":116.667973,"lat":39.685535,"of":"inner"},{"lng":116.668406,"lat":39.685118,"of":"inner"},{"lng":116.669834,"lat":39.683694,"of":"inner"},
				{"lng":116.670257,"lat":39.683256,"of":"inner"},{"lng":116.670569,"lat":39.682931,"of":"inner"},{"lng":116.671012,"lat":39.682464,"of":"inner"},
				{"lng":116.671375,"lat":39.682047,"of":"inner"},{"lng":116.671918,"lat":39.681448,"of":"inner"},{"lng":116.6722,"lat":39.681143,"of":"inner"},
				{"lng":116.672835,"lat":39.680422,"of":"inner"},{"lng":116.67364,"lat":39.679488,"of":"inner"},{"lng":116.676359,"lat":39.676309,"of":"inner"},
				{"lng":116.676803,"lat":39.675791,"of":"inner"},{"lng":116.676893,"lat":39.67569,"of":"inner"},{"lng":116.677357,"lat":39.675161,"of":"inner"},
				{"lng":116.678072,"lat":39.674379,"of":"inner"},{"lng":116.678605,"lat":39.673809,"of":"inner"},{"lng":116.67932,"lat":39.673066,"of":"inner"},
				{"lng":116.679774,"lat":39.672608,"of":"inner"},{"lng":116.679844,"lat":39.672537,"of":"inner"},{"lng":116.680328,"lat":39.672059,"of":"inner"},
				{"lng":116.680912,"lat":39.671498,"of":"inner"},{"lng":116.681556,"lat":39.670887,"of":"inner"},{"lng":116.681788,"lat":39.670663,"of":"inner"},
				{"lng":116.682523,"lat":39.669991,"of":"inner"},{"lng":116.682523,"lat":39.669991,"of":"inner"},{"lng":116.682643,"lat":39.669819,"of":"inner"},
				{"lng":116.683137,"lat":39.66926,"of":"inner"},{"lng":116.68352,"lat":39.668804,"of":"inner"},{"lng":116.683641,"lat":39.668572,"of":"inner"},
				{"lng":116.683721,"lat":39.668331,"of":"inner"},{"lng":116.683782,"lat":39.66798,"of":"inner"},{"lng":116.683762,"lat":39.66751,"of":"inner"},
				{"lng":116.683612,"lat":39.666723,"of":"inner"},{"lng":116.683562,"lat":39.666324,"of":"inner"},{"lng":116.683422,"lat":39.665977,"of":"inner"},
				{"lng":116.683412,"lat":39.665927,"of":"inner"},{"lng":116.683372,"lat":39.665618,"of":"inner"},{"lng":116.683352,"lat":39.665398,"of":"inner"},
				{"lng":116.683373,"lat":39.664838,"of":"inner"},{"lng":116.683323,"lat":39.664359,"of":"inner"},{"lng":116.683353,"lat":39.664208,"of":"inner"},
				{"lng":116.683414,"lat":39.664137,"of":"inner"},{"lng":116.683414,"lat":39.664137,"of":"inner"},{"lng":116.683524,"lat":39.664036,"of":"inner"},
				{"lng":116.685506,"lat":39.662993,"of":"inner"},{"lng":116.685667,"lat":39.66291,"of":"inner"},{"lng":116.686653,"lat":39.662385,"of":"inner"},
				{"lng":116.688383,"lat":39.661469,"of":"inner"},{"lng":116.689027,"lat":39.661119,"of":"inner"},{"lng":116.689238,"lat":39.661006,"of":"inner"},
				{"lng":116.691369,"lat":39.659867,"of":"inner"},{"lng":116.692223,"lat":39.659307,"of":"inner"},{"lng":116.692856,"lat":39.658809,"of":"inner"},
				{"lng":116.693429,"lat":39.658272,"of":"inner"},{"lng":116.693992,"lat":39.657636,"of":"inner"},{"lng":116.694213,"lat":39.657344,"of":"inner"},
				{"lng":116.694856,"lat":39.656287,"of":"inner"},{"lng":116.69562,"lat":39.65456,"of":"inner"},{"lng":116.695942,"lat":39.653807,"of":"inner"},
				{"lng":116.696625,"lat":39.652221,"of":"inner"},{"lng":116.696645,"lat":39.652171,"of":"inner"},{"lng":116.696876,"lat":39.651649,"of":"inner"},
				{"lng":116.697148,"lat":39.651007,"of":"inner"},{"lng":116.697349,"lat":39.650525,"of":"inner"},{"lng":116.697981,"lat":39.64907,"of":"inner"},
				{"lng":116.698283,"lat":39.648358,"of":"inner"},{"lng":116.698403,"lat":39.648077,"of":"inner"},{"lng":116.698704,"lat":39.647375,"of":"inner"},
				{"lng":116.698734,"lat":39.647295,"of":"inner"},{"lng":116.699557,"lat":39.645389,"of":"inner"},{"lng":116.699688,"lat":39.645088,"of":"inner"},
				{"lng":116.700059,"lat":39.644216,"of":"inner"},{"lng":116.70027,"lat":39.643715,"of":"inner"},{"lng":116.70036,"lat":39.643485,"of":"inner"},
				{"lng":116.700601,"lat":39.642683,"of":"inner"},{"lng":116.700721,"lat":39.642083,"of":"inner"},{"lng":116.700741,"lat":39.641763,"of":"inner"},
				{"lng":116.700771,"lat":39.641032,"of":"inner"},{"lng":116.700752,"lat":39.640853,"of":"inner"},{"lng":116.700722,"lat":39.640533,"of":"inner"},
				{"lng":116.700632,"lat":39.639953,"of":"inner"},{"lng":116.700251,"lat":39.638356,"of":"inner"},{"lng":116.700151,"lat":39.637936,"of":"inner"},{"lng":116.69963,"lat":39.63531,"of":"inner"},{"lng":116.69963,"lat":39.6345,"of":"inner"},{"lng":116.69967,"lat":39.634139,"of":"inner"},{"lng":116.700171,"lat":39.631156,"of":"inner"},{"lng":116.700801,"lat":39.627552,"of":"inner"},
				{"lng":116.70107,"lat":39.62596,"of":"inner"},{"lng":116.70114,"lat":39.62504,"of":"inner"},{"lng":116.70113,"lat":39.62455,"of":"inner"},{"lng":116.700959,"lat":39.62346,"of":"inner"},{"lng":116.700718,"lat":39.622682,"of":"inner"},{"lng":116.700718,"lat":39.622682,"of":"inner"},{"lng":116.700437,"lat":39.621863,"of":"inner"},{"lng":116.700437,"lat":39.621863,"of":"inner"},{"lng":116.700276,"lat":39.621414,"of":"inner"},{"lng":116.700276,"lat":39.621414,"of":"inner"},
				{"lng":116.700055,"lat":39.620785,"of":"inner"},{"lng":116.699483,"lat":39.619088,"of":"inner"},{"lng":116.699483,"lat":39.619088,"of":"inner"},{"lng":116.699222,"lat":39.61832,"of":"inner"},{"lng":116.699121,"lat":39.617971,"of":"inner"},{"lng":116.69889,"lat":39.616942,"of":"inner"},
				{"lng":116.698829,"lat":39.616602,"of":"inner"},{"lng":116.698648,"lat":39.615423,"of":"inner"},{"lng":116.698608,"lat":39.615183,"of":"inner"},{"lng":116.698587,"lat":39.615013,"of":"inner"},{"lng":116.698255,"lat":39.612895,"of":"inner"},{"lng":116.697679,"lat":39.609069,"of":"inner"},{"lng":116.697649,"lat":39.608889,"of":"inner"},{"lng":116.697356,"lat":39.607081,"of":"inner"},{"lng":116.697356,"lat":39.607081,"of":"inner"},{"lng":116.697013,"lat":39.604793,"of":"inner"},
				{"lng":116.697003,"lat":39.604713,"of":"inner"},{"lng":116.696892,"lat":39.603874,"of":"inner"},{"lng":116.69671,"lat":39.602865,"of":"inner"},{"lng":116.696579,"lat":39.601916,"of":"inner"},{"lng":116.696518,"lat":39.601166,"of":"inner"},{"lng":116.696507,"lat":39.600146,"of":"inner"},
				{"lng":116.696537,"lat":39.599435,"of":"inner"},{"lng":116.696656,"lat":39.598324,"of":"inner"},{"lng":116.696666,"lat":39.598254,"of":"inner"},{"lng":116.696706,"lat":39.597943,"of":"inner"},
				{"lng":116.696835,"lat":39.596952,"of":"inner"},{"lng":116.696855,"lat":39.596832,"of":"inner"},{"lng":116.697144,"lat":39.594668,"of":"inner"},{"lng":116.697194,"lat":39.594358,"of":"inner"},
				{"lng":116.697204,"lat":39.594248,"of":"inner"},{"lng":116.697593,"lat":39.591364,"of":"inner"},{"lng":116.697663,"lat":39.590853,"of":"inner"},{"lng":116.697673,"lat":39.590773,"of":"inner"},
				{"lng":116.697792,"lat":39.589942,"of":"inner"},{"lng":116.697802,"lat":39.589852,"of":"inner"},{"lng":116.697892,"lat":39.589201,"of":"inner"},{"lng":116.697912,"lat":39.589011,"of":"inner"},
				{"lng":116.697922,"lat":39.588951,"of":"inner"},{"lng":116.697962,"lat":39.58867,"of":"inner"},{"lng":116.698062,"lat":39.587929,"of":"inner"},{"lng":116.698072,"lat":39.587879,"of":"inner"},
				{"lng":116.698142,"lat":39.587338,"of":"inner"},{"lng":116.698172,"lat":39.587128,"of":"inner"},{"lng":116.698571,"lat":39.583905,"of":"inner"},{"lng":116.698581,"lat":39.583804,"of":"inner"},
				{"lng":116.699382,"lat":39.577948,"of":"inner"},{"lng":116.700384,"lat":39.570522,"of":"inner"},{"lng":116.700615,"lat":39.568791,"of":"inner"},{"lng":116.700716,"lat":39.568111,"of":"inner"},
				{"lng":116.700796,"lat":39.56748,"of":"inner"},{"lng":116.700796,"lat":39.56748,"of":"inner"},{"lng":116.700866,"lat":39.56697,"of":"inner"},{"lng":116.701007,"lat":39.565949,"of":"inner"},
				{"lng":116.701258,"lat":39.564098,"of":"inner"},{"lng":116.701279,"lat":39.563938,"of":"inner"},{"lng":116.701309,"lat":39.563738,"of":"inner"},{"lng":116.701369,"lat":39.563308,"of":"inner"},{"lng":116.70156,"lat":39.561937,"of":"inner"},{"lng":116.701601,"lat":39.561647,"of":"inner"},{"lng":116.701621,"lat":39.561467,"of":"inner"},{"lng":116.701671,"lat":39.561127,"of":"inner"},{"lng":116.701701,"lat":39.560897,"of":"inner"},{"lng":116.701913,"lat":39.559346,"of":"inner"},{"lng":116.701933,"lat":39.559166,"of":"inner"},{"lng":116.702154,"lat":39.557596,"of":"inner"},{"lng":116.702507,"lat":39.555115,"of":"inner"},{"lng":116.702517,"lat":39.555055,"of":"inner"},{"lng":116.702527,"lat":39.554975,"of":"inner"},
				{"lng":116.702577,"lat":39.554755,"of":"inner"},{"lng":116.702739,"lat":39.553305,"of":"inner"},{"lng":116.702759,"lat":39.553125,"of":"inner"},{"lng":116.702799,"lat":39.552835,"of":"inner"},{"lng":116.702951,"lat":39.551484,"of":"inner"},{"lng":116.703062,"lat":39.550534,"of":"inner"},{"lng":116.703153,"lat":39.549714,"of":"inner"},{"lng":116.703163,"lat":39.549694,"of":"inner"},{"lng":116.703284,"lat":39.548604,"of":"inner"},{"lng":116.703294,"lat":39.548484,"of":"inner"},{"lng":116.703385,"lat":39.547634,"of":"inner"},{"lng":116.703476,"lat":39.546844,"of":"inner"},{"lng":116.703546,"lat":39.546284,"of":"inner"},{"lng":116.703587,"lat":39.545944,"of":"inner"},{"lng":116.703597,"lat":39.545874,"of":"inner"},{"lng":116.703627,"lat":39.545534,"of":"inner"},{"lng":116.703688,"lat":39.544944,"of":"inner"},{"lng":116.703749,"lat":39.544284,"of":"inner"},{"lng":116.703769,"lat":39.544094,"of":"inner"},{"lng":116.703779,"lat":39.544014,"of":"inner"},{"lng":116.703779,"lat":39.544014,"of":"inner"},{"lng":116.702818,"lat":39.543937,"of":"inner"},{"lng":116.701676,"lat":39.543872,"of":"inner"},{"lng":116.69856,"lat":39.543701,"of":"inner"},{"lng":116.697748,"lat":39.543648,"of":"inner"},{"lng":116.696374,"lat":39.54357,"of":"inner"},{"lng":116.696284,"lat":39.543561,"of":"inner"},{"lng":116.696053,"lat":39.543553,"of":"inner"},{"lng":116.696053,"lat":39.543553,"of":"inner"},{"lng":116.695421,"lat":39.543529,"of":"inner"},{"lng":116.694177,"lat":39.543472,"of":"inner"},{"lng":116.692912,"lat":39.543407,"of":"inner"},{"lng":116.692811,"lat":39.543408,"of":"inner"},{"lng":116.691797,"lat":39.543361,"of":"inner"},
				{"lng":116.691787,"lat":39.543441,"of":"inner"},{"lng":116.691707,"lat":39.543442,"of":"inner"},{"lng":116.690562,"lat":39.543377,"of":"inner"}
			];
			this.setMapConfig(data)
		}
	}
</script>
<style>
	.BMap_cpyCtrl {
		display: none;
	}
	.anchorBL {
		display: none !important;
	}
</style>

<style lang="less" scoped>
	.bm-view {
		width: 100%;
		height: 300px;
	}
</style>>
