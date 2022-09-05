<template>
    <div>
        <canvas id='canvas' ref='select' @mousedown.left='leftClick' @dblclick="doubleClick" @mousemove="move" @mouseup="unSelect"></canvas>
        <div class="controls">
            <div class="btn-row">
                <button type="button" v-bind:class="{active:transition}" v-on:click="transitionClicked">
                    
                    <i class="fa fa-arrows-h ">Transition</i>
                </button>
			</div>

        </div>
    </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';

export default {
  name: 'GraphicViewBohr',

  data() {
    return {
      transition: false,

      taille: {x:0, y:0},
      
      ctx: null,

      rayon: 5,
      contour: 4,

      Color1:null,
      Color2:null,
      Color3:null,
      Color4:null,
      Color5:null,
      Color6:null,
      Color7:null,
      Color8:null,
      Color9:null,
    };
  },

  methods: {
    ... mapGetters(['getListeAtoms','getListeLiaisons','getBohrActive','getEtatsBohr','getModeBohr','getPhoton']),
    ... mapMutations(['addListeAtoms','updateAtom','removeAtom','removeLiaison','setRecompute','setModeBohr','setEtatsBohr']),

    leftClick() {
        this.reDraw();
    },

    doubleClick(e) {
        e.preventDefault();
    },
    
    move() {
        
    },

    unSelect() {
        
    },

    deleteAtom(){

    },

    transitionClicked() {
        this.transition = !this.transition; 
        this.setModeBohr(this.transition);
        this.$emit('transition');
        this.drawBgDots();
        this.reDraw();
    },

    reDraw(){
        if(this.getBohrActive()){
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.font = "30px Arial";
            this.ctx.fillStyle = this.Color1;
            this.ctx.fillText('E', 40, 40);
            
            var smallTaille = this.taille.y;
            if(this.taille.x < smallTaille) smallTaille = this.taille.x

            for(var i = 1; i < 8; i++){
                if(i!=7){
                    var rayonN = (smallTaille/2 - 40) * (Math.pow(i,2)*53*Math.pow(10,-12)/this.getListeAtoms()[0].atomData.nombreAtomique) / (Math.pow(6,2)*53*Math.pow(10,-12)/this.getListeAtoms()[0].atomData.nombreAtomique);
                    this.ctx.beginPath();
                    this.ctx.arc(this.taille.x/2, this.taille.y/2, rayonN, 0, 2 * Math.PI);
                    this.ctx.lineWidth = this.contour;
                    this.ctx.strokeStyle = '#A9B2AC';
                    this.ctx.stroke();
                }

                var energ = ((-9*Math.pow(10,9)*Math.pow(1.602*Math.pow(10,-19),2))/(2*53*Math.pow(10,-12))*(Math.pow(this.getListeAtoms()[0].atomData.nombreAtomique,2)/Math.pow(i,2)))/
                            ((-9*Math.pow(10,9)*Math.pow(1.602*Math.pow(10,-19),2))/(2*53*Math.pow(10,-12))*(Math.pow(this.getListeAtoms()[0].atomData.nombreAtomique,2)/Math.pow(1,2)));

                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.strokeStyle = '#A9B2AC';
                this.ctx.moveTo(0, 60+energ*300);
                this.ctx.lineTo(70, 60+energ*300);
                this.ctx.stroke();
            }
            
            this.ctx.beginPath();
            this.ctx.arc(this.taille.x/2, this.taille.y/2, this.rayon, 0, 2 * Math.PI);
            this.ctx.fillStyle = this.Color9;
            this.ctx.fill();
            

            if(this.getEtatsBohr()[0]!=7){
                rayonN = (smallTaille/2 - 40) * (Math.pow(this.getEtatsBohr()[0],2)*53*Math.pow(10,-12)/this.getListeAtoms()[0].atomData.nombreAtomique) / (Math.pow(6,2)*53*Math.pow(10,-12)/this.getListeAtoms()[0].atomData.nombreAtomique);
                this.ctx.beginPath();
                this.ctx.arc(this.taille.x/2, this.taille.y/2, rayonN, 0, 2 * Math.PI);
                this.ctx.lineWidth = this.contour;
                this.ctx.strokeStyle = this.Color6;
                this.ctx.stroke();
            }

            energ = ((-9*Math.pow(10,9)*Math.pow(1.602*Math.pow(10,-19),2))/(2*53*Math.pow(10,-12))*(Math.pow(this.getListeAtoms()[0].atomData.nombreAtomique,2)/Math.pow(this.getEtatsBohr()[0],2)))/
                    ((-9*Math.pow(10,9)*Math.pow(1.602*Math.pow(10,-19),2))/(2*53*Math.pow(10,-12))*(Math.pow(this.getListeAtoms()[0].atomData.nombreAtomique,2)/Math.pow(1,2)));
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.setLineDash([]);
            this.ctx.strokeStyle = this.Color6;
            this.ctx.moveTo(0, 60+energ*300);
            this.ctx.lineTo(70, 60+energ*300);
            this.ctx.stroke();


            if(this.transition){
                if(this.getEtatsBohr()[1]!=7){
                    var rayonN2 = (smallTaille/2 - 40) * (Math.pow(this.getEtatsBohr()[1],2)*53*Math.pow(10,-12)/this.getListeAtoms()[0].atomData.nombreAtomique) / (Math.pow(6,2)*53*Math.pow(10,-12)/this.getListeAtoms()[0].atomData.nombreAtomique);
                    this.ctx.beginPath();
                    this.ctx.arc(this.taille.x/2, this.taille.y/2, rayonN2, 0, 2 * Math.PI);
                    this.ctx.lineWidth = this.contour;
                    this.ctx.strokeStyle = this.Color2;
                    this.ctx.stroke();
                }

                var energ2 = ((-9*Math.pow(10,9)*Math.pow(1.602*Math.pow(10,-19),2))/(2*53*Math.pow(10,-12))*(Math.pow(this.getListeAtoms()[0].atomData.nombreAtomique,2)/Math.pow(this.getEtatsBohr()[1],2)))/
                        ((-9*Math.pow(10,9)*Math.pow(1.602*Math.pow(10,-19),2))/(2*53*Math.pow(10,-12))*(Math.pow(this.getListeAtoms()[0].atomData.nombreAtomique,2)/Math.pow(1,2)));
                this.ctx.lineWidth = 3;
                this.ctx.beginPath();
                this.ctx.setLineDash([]);
                this.ctx.strokeStyle = this.Color2;
                this.ctx.moveTo(0, 60+energ2*300);
                this.ctx.lineTo(70, 60+energ2*300);
                this.ctx.stroke();

                this.fleche(35,60+energ*300,35,60+energ2*300, this.Color8, false, null);

                if(energ2-energ  > 0)
                    this.flecheWave(75,60+energ2*300,125,60+energ2*300-10, this.Color8);
                else if(energ2-energ  < 0)
                    this.flecheWave(125,60+energ*300+10,75,60+energ*300, this.Color8);
            }
            if(this.getPhoton() == -1) {
                this.flecheWave(this.taille.x/2-rayonN2-5-50,this.taille.y/2,this.taille.x/2-rayonN2-5,this.taille.y/2, this.Color8);
            }
            if(this.getPhoton() == 1){
                this.flecheWave(this.taille.x/2-rayonN-5,this.taille.y/2,this.taille.x/2-rayonN-5-50,this.taille.y/2, this.Color8);
            }

            for(i = 1; i < 8; i++){
                
                if(i==1 || i==7) {
                    energ = ((-9*Math.pow(10,9)*Math.pow(1.602*Math.pow(10,-19),2))/(2*53*Math.pow(10,-12))*(Math.pow(this.getListeAtoms()[0].atomData.nombreAtomique,2)/Math.pow(i,2)))/
                            ((-9*Math.pow(10,9)*Math.pow(1.602*Math.pow(10,-19),2))/(2*53*Math.pow(10,-12))*(Math.pow(this.getListeAtoms()[0].atomData.nombreAtomique,2)/Math.pow(1,2)));
                    
                    this.ctx.textAlign = "center";
                    this.ctx.textBaseline = "middle";
                    this.ctx.font = "20px Arial";
                    this.ctx.fillStyle = '#000000';
                    if(i==1)this.ctx.fillText('n='+i, 90, 60+energ*300);
                    else this.ctx.fillText('n=∞', 90, 60+energ*300);
                }
            }
        }
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
    },

    fleche(x1,y1,x2,y2, color, tail, text) {
        var length = Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
        var headLength = length * 0.15;
        var dir = {x: (x2-x1)/length, y: (y2-y1)/length};

        this.ctx.beginPath();
        this.ctx.moveTo(x1,y1);
        this.ctx.lineTo(x2,y2);
        this.ctx.closePath();
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(x2,y2);
        this.ctx.lineTo(x2-dir.x*headLength+dir.y*headLength,y2-dir.y*headLength-dir.x*headLength);
        this.ctx.closePath();
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(x2,y2);
        this.ctx.lineTo(x2-dir.x*headLength-dir.y*headLength,y2-dir.y*headLength+dir.x*headLength);
        this.ctx.closePath();
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();

        if(tail){
            this.ctx.beginPath();
            this.ctx.moveTo(x1+dir.x*headLength+dir.y*headLength,y1+dir.y*headLength-dir.x*headLength);
            this.ctx.lineTo(x1+dir.x*headLength-dir.y*headLength,y1+dir.y*headLength+dir.x*headLength);
            this.ctx.closePath();
            this.ctx.lineWidth = 5;
            this.ctx.strokeStyle = color;
            this.ctx.stroke();
        }

        if(text) {
            this.ctx.textAlign = "center";
            this.ctx.textBaseline = "middle";
            this.ctx.font = "30px Cambria Math";
            this.ctx.fillStyle = color;
            this.ctx.fillText(text.text, (x1+x2)/2 + Math.abs(dir.y) *15, (y1+y2)/2- Math.abs(dir.x) *15);
            if(text.vec)
                this.ctx.fillText('\u20D7', (x1+x2)/2+ Math.abs(dir.y) *15, (y1+y2)/2-10- Math.abs(dir.x) *15);
        }
    },

    flecheWave(x1,y1,x2,y2, color) {
        var length = Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
        var headLength = length * 0.3;
        var dir = {x: (x2-x1)/length, y: (y2-y1)/length};
        var mult = 6.5 * Math.PI / length;
        var amp = headLength / 4;

        for(var i=0; i< length;i++){
            this.ctx.beginPath();
            this.ctx.moveTo(x1+dir.x*i+dir.y*amp*Math.cos(mult*i),y1+dir.y*i-dir.x*amp*Math.sin(mult*i));
            this.ctx.lineTo(x1+dir.x*(i+1)+dir.y*amp*Math.cos(mult*(i+1)),y1+dir.y*(i+1)-dir.x*amp*Math.sin(mult*(i+1)));
            this.ctx.closePath();
            this.ctx.lineWidth = 5;
            this.ctx.strokeStyle = color;
            this.ctx.stroke();
        }

        this.ctx.beginPath();
        this.ctx.moveTo(x2,y2);
        this.ctx.lineTo(x2-dir.x*headLength+dir.y*headLength,y2-dir.y*headLength-dir.x*headLength);
        this.ctx.closePath();
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(x2,y2);
        this.ctx.lineTo(x2-dir.x*headLength-dir.y*headLength,y2-dir.y*headLength+dir.x*headLength);
        this.ctx.closePath();
        this.ctx.lineWidth = 5;
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
    },
  },
  mounted() {
      this.Color1 = getComputedStyle(document.documentElement).getPropertyValue('--Color-1');
        this.Color2 = getComputedStyle(document.documentElement).getPropertyValue('--Color-2');
        this.Color3 = getComputedStyle(document.documentElement).getPropertyValue('--Color-3');
        this.Color4 = getComputedStyle(document.documentElement).getPropertyValue('--Color-4');
        this.Color5 = getComputedStyle(document.documentElement).getPropertyValue('--Color-5');
        this.Color6 = getComputedStyle(document.documentElement).getPropertyValue('--Color-6');
        this.Color7 = getComputedStyle(document.documentElement).getPropertyValue('--Color-7');
        this.Color8 = getComputedStyle(document.documentElement).getPropertyValue('--Color-8');
        this.Color9 = getComputedStyle(document.documentElement).getPropertyValue('--Color-9');
    this.$refs.select.height = window.innerHeight;
    this.$refs.select.width = window.innerWidth;
    this.ctx = this.$refs.select.getContext("2d");
    this.drawBgDots();
    this.reDraw();
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
  color: var(--Color-7);
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
	width: 80px;
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
    color: var(--Color-9);
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
