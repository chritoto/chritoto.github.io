<template>
    <div>
        
        <canvas id='canvas' ref='select' @mousedown.left='leftClick' @dblclick="doubleClick" @mousemove="move" @mouseup="unSelect" v-bind:class="{canvasCursor:selectedTool==1}"></canvas>
        <div class="controls">
            <div class="btn-row">
                <button type="button" v-bind:class="{active:selectedTool==0}" v-on:click="selectedTool=0">
                    <i class="fa fa-mouse-pointer"></i>
                </button>
			</div>
            
			<div class="btn-row" >
                <button type="button" v-bind:class="{active:selectedTool==1,disabled:!canAdd}" v-on:click="selectedTool=1*canAdd;">
                    <i class="fa fa-plus"></i>
                </button>
			</div>
			
			<div class="btn-row" >
                <button type="button" v-bind:class="{disabled:!elementSelected}" v-on:click="deleteAtom">
                    <i class="fa fa-trash-o"></i>
                </button>
			</div>

            <div class="btn-row">
                <button type="button" v-bind:class="{active:popupOptions}" v-on:click="popupOptions=!popupOptions">
                    <i class="fa fa-cog"></i>
                </button>
                <div class="popup" v-if="popupOptions">
					<h4>
						Options
					</h4>
                    <form>
                        <label class="option">
                            <input type="checkbox" v-model="affichage1" value="1" v-on:change="drawBgDots();reDraw();" name="affichage">
                                Afficher Charge
                        </label>
                        <label class="option">
                            <input type="checkbox" v-model="affichage2" value="2" v-on:change="drawBgDots();reDraw();" name="affichage">
                                Afficher Symbole
                        </label>
                        <label class="option">
                            <input type="checkbox" v-model="affichage3" value="3" v-on:change="drawBgDots();reDraw();" name="affichage">
                                Afficher Dipôle
                        </label>
                    </form>
				</div>
            </div>

            <div class="btn-row" >
                <button type="button" v-bind:class="{active:closeLink, disabled:!linkValid}" v-on:click="linkClicked();">
                    <i class="fa fa-circle-o" style="font-size: 0.65em"></i>
                    <i class="fa fa-circle-o" style="font-size: 0.65em"></i>
                </button>
			</div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';

export default {
  name: 'GraphicViewConception',

  data() {
    return {
      selectedTool: 1,
      elementSelected: false,
      selectedAtom: null,
      selectedLink: null,
      selectMode: false,
      canAdd: true,
      closeLink: false,
      linkValid: false,
      
      ctx: null,
      position: {
        x: null,
        y: null
      },
      left: null,
      top: null,
      rayon: 50,
      contour: 4,
      epaisseurLiens: 15,
      maxAtoms: 2,

      popupOptions: false,
      
      affichage1: true,
      affichage2: true,
      affichage3: false,

      lengthPixels: 0,
      ABnorm: null,

      Color1:null,
      Color2:null,
      Color3:null,
      Color4:null,
      Color5:null,
    };
  },

  methods: {
    ... mapGetters(['getListeAtoms','getListeLiaisons','getCloseLink', 'getLinkValid']),
    ... mapMutations(['addListeAtoms','updateAtom','removeAtom','removeLiaison','setRecompute','setCloseLink', 'setLinkValid']),

    leftClick(e) {
        this.popupOptions = false;
        
        this.left = this.$refs.select.getBoundingClientRect().left;
        this.top = this.$refs.select.getBoundingClientRect().top;
        this.position.x = e.pageX-this.left;
        this.position.y = e.pageY-this.top;
        if(this.selectedTool==1){ //Add tool
            if(this.getListeAtoms().length<this.maxAtoms){
                if((this.getListeAtoms().length)==this.maxAtoms-1) {this.selectedTool = 0; this.setRecompute(true); this.canAdd=false;}
                this.$emit('newAtom', this.position.x, this.position.y);
            }
            this.doubleClick(e);
            this.selectedAtom = this.getListeAtoms().length-1;
            this.elementSelected = true;
        }
        else { //select tool
            

            //Liens
            const nombreLiens = this.getListeLiaisons().length;
            var lineSelected = false;

            var i;
            for(i=0;i<nombreLiens;i++){
                var A = this.getListeAtoms()[i].position;
                var B = this.getListeAtoms()[i+1].position;
                var AP = {x:this.position.x-A.x,y:this.position.y-A.y};
                var AB = {x:B.x-A.x,y:B.y-A.y}
                var factor = (AP.x*AB.x+AP.y*AB.y) / (AB.x*AB.x+AB.y*AB.y);
                var Projection = { x: A.x + factor* AB.x, y: A.y + factor* AB.y};

                var linkLength = Math.sqrt(AB.x*AB.x+AB.y*AB.y);
                var betweenAtoms = true;
                if(Math.sqrt(Math.pow(Projection.x-A.x,2)+Math.pow(Projection.y-A.y,2))>linkLength)betweenAtoms=false;
                if(Math.sqrt(Math.pow(Projection.x-B.x,2)+Math.pow(Projection.y-B.y,2))>linkLength)betweenAtoms=false;
                if((Math.sqrt(Math.pow(Projection.x-this.position.x,2) + Math.pow(Projection.y-this.position.y,2)))<this.epaisseurLiens/2 && betweenAtoms) {
                    this.selectedLink = i;
                    lineSelected = true;
                }
            }
            
            //atome
            var index = 0;
            this.selectMode = false;
            this.getListeAtoms().forEach(element => {
                if(Math.sqrt(Math.pow(this.position.x-element.position.x,2) + Math.pow(this.position.y-element.position.y,2))<=element.position.rayon){
                    this.selectedAtom=index;
                    this.selectMode = true;
                }
                index++;
            });
            if(!this.selectMode) this.selectedAtom = null;
            if(!lineSelected) this.selectedLink = null;
            this.elementSelected = this.selectMode;
            if(this.closeLink){this.selectMode=false;this.selectedAtom=null;}
            if(this.selectMode) {this.$emit('selectedAtom',this.selectedAtom); this.selectedLink = null;}
            if(lineSelected && !this.selectMode) {this.$emit('selectedLien', this.selectedLink); this.selectMode = true;}
            if(!this.selectMode && !lineSelected) this.$emit('unSelect');
        }
        this.drawBgDots();
        this.reDraw();
    },

    doubleClick(e) {
        e.preventDefault();
        if(this.getListeAtoms().length == 1){
            this.left = this.$refs.select.getBoundingClientRect().left;
            this.top = this.$refs.select.getBoundingClientRect().top;
            this.position.x = e.pageX-this.left;
            this.position.y = e.pageY-this.top;

            //Atomes
            var index = 0;
            this.selectMode = false;
            this.getListeAtoms().forEach(element => {
                if(Math.sqrt(Math.pow(this.position.x-element.position.x,2) + Math.pow(this.position.y-element.position.y,2))<=this.rayon){
                    this.selectedAtom=index;
                    this.selectMode = true;
                }
                index++;
            });
            if(!this.selectMode) this.selectedAtom = null;
            this.elementSelected = this.selectMode;
            this.selectMode = false;
            if(this.selectedAtom!=null) this.$emit('Charge', this.selectedAtom, this.getListeAtoms()[this.selectedAtom].position.x+this.left,this.getListeAtoms()[this.selectedAtom].position.y+this.top)
        
            this.drawBgDots();
            this.reDraw();    
        }
    },
    
    move(e) {
        this.left = this.$refs.select.getBoundingClientRect().left;
        this.top = this.$refs.select.getBoundingClientRect().top;
        

        if(this.selectedAtom!=null && this.selectMode && !this.closeLink){
            var tempAtom = this.getListeAtoms()[this.selectedAtom];
            tempAtom.position.x = this.position.x;
            tempAtom.position.y = this.position.y;

            this.drawBgDots();
            this.reDraw();

            if(this.getListeAtoms().length>1) this.$emit('move');
        }
        else if(this.selectedLink!=null && this.selectMode) {
            var tempAtom1 = this.getListeAtoms()[this.selectedLink];
            tempAtom1.position.x += e.pageX-this.left-this.position.x;
            tempAtom1.position.y += e.pageY-this.top-this.position.y;

            var tempAtom2 = this.getListeAtoms()[this.selectedLink+1];
            tempAtom2.position.x += e.pageX-this.left-this.position.x;
            tempAtom2.position.y += e.pageY-this.top-this.position.y;

            this.drawBgDots();
            this.reDraw();
            //if(this.getListeAtoms().length>1) this.$emit('move');
        }
        this.position.x = e.pageX-this.left;
        this.position.y = e.pageY-this.top;
    },

    unSelect() {
        this.selectMode = false;
    },

    deleteAtom(){
        this.linkValid = false;
        this.closeLink = false;
        this.setLinkValid(false);
        this.setCloseLink(false);
        if(this.elementSelected){
            this.$emit('hideDisplay');
            this.removeAtom(this.selectedAtom);
            if(this.selectedAtom>0) this.removeLiaison(this.selectedAtom-1);
            else this.removeLiaison(this.selectedAtom);
            this.selectedAtom = null;
            this.canAdd =true;
        }
        this.getListeAtoms().forEach(element => {
            element.atomData.etatDeCharge = 0;
        });
        this.drawBgDots();
        this.reDraw();
        this.$emit('unSelect');
    },

    linkClicked() {
        this.lengthPixels = Math.sqrt(Math.pow(this.getListeAtoms()[0].position.x-this.getListeAtoms()[1].position.x,2)+Math.pow(this.getListeAtoms()[0].position.y-this.getListeAtoms()[1].position.y,2))
        this.ABnorm = {x: (this.getListeAtoms()[1].position.x-this.getListeAtoms()[0].position.x)/this.lengthPixels, y:(this.getListeAtoms()[1].position.y-this.getListeAtoms()[0].position.y)/this.lengthPixels};
        this.closeLink = !this.closeLink;
        this.setCloseLink(this.closeLink);
        this.computeRayons();
        this.unSelect();
        this.drawBgDots();
        this.reDraw();
    },

    computeRayons(){
        if(this.getListeLiaisons().length>0){
            if(this.closeLink && this.getLinkValid()){
                
                var rayonsAtom = [];
                if(this.getListeLiaisons()[0].type==1) rayonsAtom= [this.getListeAtoms()[0].atomData.rayonIonique, this.getListeAtoms()[1].atomData.rayonIonique];
                else rayonsAtom= [this.getListeAtoms()[0].atomData.rayonCovalent, this.getListeAtoms()[1].atomData.rayonCovalent];
                
                if(rayonsAtom[0] == "--" || rayonsAtom[1] == "--") {
                    this.getListeAtoms()[0].position.rayon = this.rayon;
                    this.getListeAtoms()[1].position.rayon = this.rayon;
                }
                else {
                    this.getListeAtoms()[0].position.rayon = this.lengthPixels * rayonsAtom[0]/(rayonsAtom[0]+rayonsAtom[1]);
                    this.getListeAtoms()[1].position.rayon =  this.lengthPixels * rayonsAtom[1]/(rayonsAtom[0]+rayonsAtom[1]);

                    this.getListeAtoms()[1].position.x = this.getListeAtoms()[0].position.x + this.ABnorm.x * this.lengthPixels * this.getListeLiaisons()[0].longueur/this.getListeLiaisons()[0].longueurEquilibree;
                    this.getListeAtoms()[1].position.y = this.getListeAtoms()[0].position.y + this.ABnorm.y * this.lengthPixels * this.getListeLiaisons()[0].longueur/this.getListeLiaisons()[0].longueurEquilibree;
                }
            }
            else {
                this.getListeAtoms()[0].position.rayon = this.rayon;
                this.getListeAtoms()[1].position.rayon = this.rayon;
            }
        }
    },

    liens() {
        const nombreLiens = this.getListeLiaisons().length;

        var i;
        for(i=0;i<nombreLiens;i++){
            if(this.selectedLink!= null) {
                this.ctx.lineWidth = this.epaisseurLiens+this.contour*2;
                this.ctx.beginPath();
                this.ctx.lineCap = "round";
                this.ctx.moveTo(this.getListeAtoms()[this.selectedLink].position.x, this.getListeAtoms()[this.selectedLink].position.y);
                this.ctx.lineTo(this.getListeAtoms()[this.selectedLink+1].position.x, this.getListeAtoms()[this.selectedLink+1].position.y);
                this.ctx.strokeStyle = this.Color1;
                this.ctx.stroke();
            }
            this.ctx.lineWidth = this.epaisseurLiens;
            this.ctx.beginPath();
            this.ctx.lineCap = "round";
            this.ctx.moveTo(this.getListeAtoms()[i].position.x, this.getListeAtoms()[i].position.y);
            this.ctx.lineTo(this.getListeAtoms()[i+1].position.x, this.getListeAtoms()[i+1].position.y);
            this.ctx.strokeStyle = this.Color5;
            this.ctx.stroke();
        }
    },

    reDraw(){
        if(!this.closeLink)this.liens();
        this.getListeAtoms().forEach(element => {
            this.ctx.beginPath();
            this.ctx.arc(element.position.x, element.position.y, element.position.rayon, 0, 2 * Math.PI);
            if(element.atomData.symbole == '') this.ctx.fillStyle = this.Color4;
            else this.ctx.fillStyle = this.Color2;
            this.ctx.fill();
        });
        if(this.selectedAtom!=null) {
            this.ctx.beginPath();
            this.ctx.arc(this.getListeAtoms()[this.selectedAtom].position.x, this.getListeAtoms()[this.selectedAtom].position.y, this.getListeAtoms()[this.selectedAtom].position.rayon-this.contour/2, 0, 2 * Math.PI);
            this.ctx.strokeStyle = this.Color1;
            this.ctx.lineWidth = this.contour;
            this.ctx.stroke();
        }
        if(this.closeLink)this.liens();

        var index = 0;
        this.getListeAtoms().forEach(element=> {
            if(this.getListeAtoms().length > 1){
                var line = {x:this.getListeAtoms()[1].position.x-this.getListeAtoms()[0].position.x, y:this.getListeAtoms()[1].position.y-this.getListeAtoms()[0].position.y};
                var norm = Math.sqrt(Math.pow(line.x,2)+Math.pow(line.y,2));
                line.x = line.x/norm;
                line.y = line.y/norm;
                var perp = {x:line.y, y: -line.x};
            }
            else{
                perp = {x:1,y:0};
            }
            index++;
            if(this.affichage1){
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                this.ctx.font = "30px Arial";
                this.ctx.fillStyle = this.Color1;
                this.ctx.fillText('' + element.atomData.etatDeCharge.toFixed(3), element.position.x-perp.x*2*this.rayon, element.position.y-perp.y*2*this.rayon);
            }
            if (this.affichage2) {
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                this.ctx.font = "30px Arial";
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillText('' + element.atomData.symbole, element.position.x, element.position.y);
            }
            if (this.affichage3 && index==1) {

                this.ctx.lineWidth = 5;
                this.ctx.beginPath();
                this.ctx.moveTo(this.getListeAtoms()[0].position.x+perp.x*element.position.rayon*2, this.getListeAtoms()[0].position.y+perp.y*element.position.rayon*2);
                this.ctx.lineTo(this.getListeAtoms()[1].position.x+perp.x*element.position.rayon*2, this.getListeAtoms()[1].position.y+perp.y*element.position.rayon*2);
                this.ctx.closePath();
                this.ctx.strokeStyle = this.Color1;
                this.ctx.stroke();
                if(this.getListeAtoms()[0].atomData.etatDeCharge > 0) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.getListeAtoms()[0].position.x+perp.x*element.position.rayon*1.5+line.x*20, this.getListeAtoms()[0].position.y+perp.y*element.position.rayon*1.5+line.y*20);
                    this.ctx.lineTo(this.getListeAtoms()[0].position.x+perp.x*element.position.rayon*2.5+line.x*20, this.getListeAtoms()[0].position.y+perp.y*element.position.rayon*2.5+line.y*20);
                    this.ctx.closePath();
                    this.ctx.strokeStyle = this.Color1;
                    this.ctx.stroke();

                    this.ctx.beginPath();
                    this.ctx.moveTo(this.getListeAtoms()[1].position.x+perp.x*element.position.rayon*1.5-line.x*20, this.getListeAtoms()[1].position.y+perp.y*element.position.rayon*1.5-line.y*20);
                    this.ctx.lineTo(this.getListeAtoms()[1].position.x+perp.x*element.position.rayon*2, this.getListeAtoms()[1].position.y+perp.y*element.position.rayon*2);
                    this.ctx.closePath();
                    this.ctx.strokeStyle = this.Color1;
                    this.ctx.stroke();

                    this.ctx.beginPath();
                    this.ctx.moveTo(this.getListeAtoms()[1].position.x+perp.x*element.position.rayon*2, this.getListeAtoms()[1].position.y+perp.y*element.position.rayon*2);
                    this.ctx.lineTo(this.getListeAtoms()[1].position.x+perp.x*element.position.rayon*2.5-line.x*20, this.getListeAtoms()[1].position.y+perp.y*element.position.rayon*2.5-line.y*20);
                    this.ctx.closePath();
                    this.ctx.strokeStyle = this.Color1;
                    this.ctx.stroke();
                }
                else {
                    this.ctx.beginPath();
                    this.ctx.moveTo(this.getListeAtoms()[1].position.x+perp.x*element.position.rayon*1.5-line.x*20, this.getListeAtoms()[1].position.y+perp.y*element.position.rayon*1.5-line.y*20);
                    this.ctx.lineTo(this.getListeAtoms()[1].position.x+perp.x*element.position.rayon*2.5-line.x*20, this.getListeAtoms()[1].position.y+perp.y*element.position.rayon*2.5-line.y*20);
                    this.ctx.closePath();
                    this.ctx.strokeStyle = this.Color1;
                    this.ctx.stroke();

                    this.ctx.beginPath();
                    this.ctx.moveTo(this.getListeAtoms()[0].position.x+perp.x*element.position.rayon*1.5+line.x*20, this.getListeAtoms()[0].position.y+perp.y*element.position.rayon*1.5+line.y*20);
                    this.ctx.lineTo(this.getListeAtoms()[0].position.x+perp.x*element.position.rayon*2, this.getListeAtoms()[0].position.y+perp.y*element.position.rayon*2);
                    this.ctx.closePath();
                    this.ctx.strokeStyle = this.Color1;
                    this.ctx.stroke();

                    this.ctx.beginPath();
                    this.ctx.moveTo(this.getListeAtoms()[0].position.x+perp.x*element.position.rayon*2, this.getListeAtoms()[0].position.y+perp.y*element.position.rayon*2);
                    this.ctx.lineTo(this.getListeAtoms()[0].position.x+perp.x*element.position.rayon*2.5+line.x*20, this.getListeAtoms()[0].position.y+perp.y*element.position.rayon*2.5+line.y*20);
                    this.ctx.closePath();
                    this.ctx.strokeStyle = this.Color1;
                    this.ctx.stroke();
                }
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                this.ctx.font = "30px Arial";
                this.ctx.fillStyle = this.Color3;
                var angle = Math.atan((this.getListeAtoms()[1].position.y-this.getListeAtoms()[0].position.y)/(this.getListeAtoms()[1].position.x-this.getListeAtoms()[0].position.x));
                this.ctx.rotate(angle);
                var point = {x:this.getListeAtoms()[0].position.x+line.x*norm/2+perp.x*element.position.rayon*2.5, y:this.getListeAtoms()[0].position.y+line.y*norm/2+perp.y*element.position.rayon*2.5};
                this.ctx.fillText('' + this.getListeLiaisons()[0].momentDipolaire.toFixed(3) + ' D', point.x*Math.cos(-angle)-point.y*Math.sin(-angle), point.y*Math.cos(-angle)+point.x*Math.sin(-angle));
                this.ctx.rotate(-angle);
            }
        });
    },

    drawBgDots(){
      
      this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      var gridSize = 50;
      this.ctx.fillStyle = 'rgba(0, 0, 0, .2)';
      
      for(var i = 0; i*gridSize < window.innerWidth; i++){
        for(var j = 0; j*gridSize < window.innerHeight; j++){
          if(i > 0 && j > 0){
            this.ctx.beginPath();
            this.ctx.rect(i * gridSize, j * gridSize, 2, 2);
            this.ctx.fill();
            this.ctx.closePath();
          }
        }
      }
    }
  },
  mounted() {
    this.Color1 = getComputedStyle(document.documentElement).getPropertyValue('--Color-1');
    this.Color2 = getComputedStyle(document.documentElement).getPropertyValue('--Color-2');
    this.Color3 = getComputedStyle(document.documentElement).getPropertyValue('--Color-3');
    this.Color4 = getComputedStyle(document.documentElement).getPropertyValue('--Color-4');
    this.Color5 = getComputedStyle(document.documentElement).getPropertyValue('--Color-5');

    this.$refs.select.height = window.innerHeight;
    this.$refs.select.width = window.innerWidth;
    this.ctx = this.$refs.select.getContext("2d");

    this.closeLink = this.getCloseLink();
    this.linkValid = this.getLinkValid();
    if(this.closeLink){
        this.lengthPixels = Math.sqrt(Math.pow(this.getListeAtoms()[0].position.x-this.getListeAtoms()[1].position.x,2)+Math.pow(this.getListeAtoms()[0].position.y-this.getListeAtoms()[1].position.y,2))
        this.ABnorm = {x: (this.getListeAtoms()[1].position.x-this.getListeAtoms()[0].position.x)/this.lengthPixels, y:(this.getListeAtoms()[1].position.y-this.getListeAtoms()[0].position.y)/this.lengthPixels};
    }

    this.drawBgDots();
    this.reDraw();
    if(this.getListeAtoms().length>0) this.selectedTool = 0;
    if(this.getListeAtoms().length>this.maxAtoms-1) this.canAdd=false;
  },
}
</script>

<style scoped>
@import "../assets/font-awesome-4.7.0/css/font-awesome.css";
h3 {
  margin: 40px 0 0;
}
canvas {
    width:auto;
    height:auto;
}
.canvasCursor {
    cursor: pointer;
} 
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: var(--Color-2);
}
.controls {
	position: absolute;
	z-index: 5;
	bottom: 0;
	left: 0;
	width: 100%;
	height: 60px;
	background-color: var(--Color-1);
	display: flex;
	justify-content: center;
	align-items: center;
	user-select: none;
}
.btn-row {
	position: relative;
	margin-bottom: 5px;
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
	padding: 0 15px;
	border-radius: 4px;
}
button {
	appearance: none;
	border: 0;
	border-radius: 0;
	box-shadow: 0;
	width: 40px;
	height: 60px;
	display: inline-block;
	background-color: transparent;
	color: rgb(255, 255, 255);
	font-size: 22px;
	transition: all .15s;
	cursor: pointer;
	outline: 0;
	position: relative;
}
	
button.size-icon,
button.color-icon {
    position: absolute;
    top: 10px;
    right: 0;
}

button.color-icon {
    width: 5px;
    height: 5px;
    border-radius: 50%;
}

button.size-icon {
    font-size: 6px;
    text-align: right;
}
    
button:hover {
    opacity: .8;
}

button.active {
    color: var(--Color-2);
}

button.disabled {
    opacity: .5;
    cursor: not-allowed;
}

.popup {
	position: absolute;
	width: 300px;
	bottom: 58px;
	padding: 30px;
	left: calc(50% - 150px);
	text-align: center;
	background-color: white;
	color: rgb(30, 30, 30);
	border-radius: 10px 10px 0 0;
	border: 1px solid rgb(220, 220, 220);
	border-bottom-width: 0;
	z-index: 3;
	overflow: hidden;
	max-height: 80vh;
	overflow-y: auto;
}

.popup.popup-title {
    flex: 0 0 100%;
    text-align: center;
    font-size: 16px;
    color: black;
    opacity: .5;
    margin-bottom: 10px;
}

.option {
	display: inline-flex;
	position: relative;
	justify-content: center;
    text-align: center;
	align-items: center;
	vertical-align: top;
	cursor: pointer;
}
.option.input {
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 0;
    opacity: 0;
}
</style>
