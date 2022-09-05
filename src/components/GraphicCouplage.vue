<template>
    <div>
        <canvas id='canvas' ref='select' @mousedown.left='leftClick' v-bind:class="{canvasCursor:selectedTool==1}"></canvas>
        <div class="controls">
            <div class="btn-row">
                <button type="button" v-bind:class="{active:selectedTool==0}" v-on:click="selectedTool=0;popupAjouter=false;popupOptions=false;">
                    <i class="fa fa-mouse-pointer"></i>
                </button>
			</div>
            
			<div class="btn-row" >
                <button type="button" v-bind:class="{active:selectedTool==1,disabled:!canAdd}" v-on:click="addOption">
                    <i class="fa fa-plus"></i>
                </button>
                <div class="popup" v-if="popupAjouter">
					<h4>
						Ajouter
					</h4>
                    <form>
                        <label class="option">
                            <input type="radio" v-model="ajouter" value="0" name="ajouter">
                                Charge Ponctuelle
                        </label>
                        <label class="option">
                            <input type="radio" v-model="ajouter" value="1" name="ajouter">
                               α Poncutelle
                        </label><br/>
                        <label class="option">
                            <input type="radio" v-model="ajouter" value="2" name="ajouter">
                                Dipôle Ponctuelle
                        </label>
                    </form>
				</div>
			</div>
			
			<div class="btn-row" >
                <button type="button" v-bind:class="{disabled:!elementSelected}" v-on:click="deleteCoupl">
                    <i class="fa fa-trash-o"></i>
                </button>
			</div>
        </div>
    </div>
</template>

<script>
import { mapGetters, mapMutations } from 'vuex';

export default {
  name: 'GraphicViewCouplage',

  data() {
    return {
      selectedTool: 1,
      elementSelected: false,
      canAdd: true,

      taille: {x:0, y:0},

      modal: false,

      couplage: null,
      
      ctx: null,
      position: {
        x: null,
        y: null
      },
      left: null,
      top: null,
      rayon: 50,
      epaisseurLiens: 10,

      maxCouplage: 1,

      popupOptions: false,
      affichage: 2,

      popupAjouter: false,
      ajouter: 0,

      Color1:null,
      Color2:null,
      Color3:null,
      Color4:null,
      Color5:null,
      Color6:null,
      Color7:null,
    };
  },

  methods: {
    ... mapGetters(['getListeAtoms','getListeLiaisons','getCouplage','getMol']),
    ... mapMutations(['addListeAtoms','updateAtom','removeAtom','removeLiaison','setRecompute', 'setCouplage']),

    leftClick() {
        this.popupOptions = false;
        this.popupAjouter = false;
        
        if(this.selectedTool == 1){
            this.couplage = {
                type: this.ajouter,
                valeur: 0,
                distance: 0,
                energieI: 0,
            };
            this.setCouplage(this.couplage);
            
            this.$emit('select');
            this.canAdd = false;
            this.selectedTool=0;
            this.elementSelected = true;
        }

        this.drawBgDots();
        this.reDraw();
    },

    deleteCoupl() {
        this.$emit('unselect');
        this.couplage = null;
        this.setCouplage(null);
        this.canAdd = true;
        this.elementSelected = false;

        this.drawBgDots();
        this.reDraw();
    },

    addOption() {
        if(this.canAdd){
            this.selectedTool=1;
            this.popupAjouter=!this.popupAjouter;
            this.popupOptions=false;
        }
    },


    reDraw(){
        if(!this.modal){
            var center = {x:this.taille.x/2, y:this.taille.y/2};
            if(this.getMol() == -1) { //atome
                this.ctx.beginPath();
                this.ctx.arc(center.x, center.y, this.rayon, 0, 2 * Math.PI);
                this.ctx.fillStyle = this.Color7;
                this.ctx.fill();

                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                this.ctx.font = "30px Arial";
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillText('' + this.getListeAtoms()[0].atomData.symbole, center.x, center.y);

                this.fleche(center.x-100,center.y-110,center.x+100,center.y-110, this.Color7, true, {text:'\u03BC1*',vec:false})
            }
            else { //Mol
                var mol = this.getMol();
                
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                this.ctx.font = "20px Arial";


                if(mol.nom == 'H2O') {
                    this.ctx.lineWidth = this.epaisseurLiens;
                    this.ctx.beginPath();
                    this.ctx.lineCap = "round";
                    this.ctx.moveTo(center.x+27, center.y);
                    this.ctx.lineTo(center.x-27, center.y-70);
                    this.ctx.strokeStyle = this.Color5;
                    this.ctx.stroke();

                    this.ctx.beginPath();
                    this.ctx.moveTo(center.x+27, center.y);
                    this.ctx.lineTo(center.x-27, center.y+70);
                    this.ctx.stroke();

                    this.ctx.beginPath();
                    this.ctx.arc(center.x+27, center.y, this.rayon/2, 0, 2 * Math.PI);
                    this.ctx.fillStyle = this.Color7;
                    this.ctx.fill();
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillText('O', center.x+27, center.y);

                    this.ctx.beginPath();
                    this.ctx.arc(center.x-27, center.y-70, this.rayon/2, 0, 2 * Math.PI);
                    this.ctx.fillStyle = this.Color7;
                    this.ctx.fill();
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillText('H', center.x-27, center.y-70);

                    this.ctx.beginPath();
                    this.ctx.arc(center.x-27, center.y+70, this.rayon/2, 0, 2 * Math.PI);
                    this.ctx.fillStyle = this.Color7;
                    this.ctx.fill();
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.fillText('H', center.x-27, center.y+70);

                    this.fleche(center.x-100,center.y-110,center.x+100,center.y-110, this.Color7, true, {text:'\u03BC1',vec:false})
                    
                } 
                else if(mol.nom == 'C6H6'){
                    for(var j = 0; j<7;j++){

                        if(j<6){
                            this.ctx.lineWidth = this.epaisseurLiens;
                            this.ctx.beginPath();
                            this.ctx.lineCap = "round";
                            this.ctx.moveTo(center.x+Math.cos(Math.PI/3*(j+1))*50, center.y+Math.sin(Math.PI/3*(j+1))*50);
                            this.ctx.lineTo(center.x+Math.cos(Math.PI/3*(j))*50, center.y+Math.sin(Math.PI/3*(j))*50);
                            this.ctx.strokeStyle = this.Color5;
                            this.ctx.stroke();
                        }

                        this.ctx.lineWidth = this.epaisseurLiens;
                        this.ctx.beginPath();
                        this.ctx.lineCap = "round";
                        this.ctx.moveTo(center.x+Math.cos(Math.PI/3*(j))*90, center.y+Math.sin(Math.PI/3*(j))*90);
                        this.ctx.lineTo(center.x+Math.cos(Math.PI/3*(j))*50, center.y+Math.sin(Math.PI/3*(j))*50);
                        this.ctx.strokeStyle = this.Color5;
                        this.ctx.stroke();

                        this.ctx.beginPath();
                        this.ctx.arc(center.x+Math.cos(Math.PI/3*(j))*50, center.y+Math.sin(Math.PI/3*(j))*50, this.rayon/3, 0, 2 * Math.PI);
                        this.ctx.fillStyle = this.Color7;
                        this.ctx.fill();
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.fillText('C', center.x+Math.cos(Math.PI/3*(j))*50, center.y+Math.sin(Math.PI/3*(j))*50);

                        this.ctx.beginPath();
                        this.ctx.arc(center.x+Math.cos(Math.PI/3*(j))*90, center.y+Math.sin(Math.PI/3*(j))*90, this.rayon/3, 0, 2 * Math.PI);
                        this.ctx.fillStyle = this.Color7;
                        this.ctx.fill();
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.fillText('H', center.x+Math.cos(Math.PI/3*(j))*90, center.y+Math.sin(Math.PI/3*(j))*90);
                    }
                    this.fleche(center.x-100,center.y-110,center.x+100,center.y-110, this.Color7, true, {text:'\u03BC1*',vec:false})
                }
                else {
                    this.ctx.lineWidth = this.epaisseurLiens;
                    this.ctx.beginPath();
                    this.ctx.lineCap = "round";
                    this.ctx.moveTo(center.x-70, center.y);
                    this.ctx.lineTo(center.x+70, center.y);
                    this.ctx.strokeStyle = this.Color5;
                    this.ctx.stroke();

                    this.ctx.beginPath();
                    this.ctx.arc(center.x-70, center.y, this.rayon/2, 0, 2 * Math.PI);
                    this.ctx.fillStyle = this.Color7;
                    this.ctx.fill();

                    this.ctx.beginPath();
                    this.ctx.arc(center.x+70, center.y, this.rayon/2, 0, 2 * Math.PI);
                    this.ctx.fillStyle = this.Color7;
                    this.ctx.fill();

                    this.ctx.fillStyle = '#ffffff';

                    if(mol.nom == 'H2') {
                        this.ctx.fillText('H', center.x-70, center.y);
                        this.ctx.fillText('H', center.x+70, center.y);
                        this.fleche(center.x-100,center.y-110,center.x+100,center.y-110, this.Color7, true, {text:'\u03BC1*',vec:false})
                    }
                    else if(mol.nom == 'O2') {
                        this.ctx.fillText('O', center.x-70, center.y);
                        this.ctx.fillText('O', center.x+70, center.y);
                        this.fleche(center.x-100,center.y-110,center.x+100,center.y-110, this.Color7, true, {text:'\u03BC1*',vec:false})
                    }
                    else if(mol.nom == 'N2') {
                        this.ctx.fillText('N', center.x-70, center.y);
                        this.ctx.fillText('N', center.x+70, center.y);
                        this.fleche(center.x-100,center.y-110,center.x+100,center.y-110, this.Color7, true, {text:'\u03BC1*',vec:false})
                    }
                    else if(mol.nom == 'HCl') {
                        this.ctx.fillText('H', center.x-70, center.y);
                        this.ctx.fillText('Cl', center.x+70, center.y);
                        this.fleche(center.x-100,center.y-110,center.x+100,center.y-110, this.Color7, true, {text:'\u03BC1',vec:false})
                    }
                    else if(mol.nom == 'HI') {
                        this.ctx.fillText('H', center.x-70, center.y);
                        this.ctx.fillText('I', center.x+70, center.y);
                        this.fleche(center.x-100,center.y-110,center.x+100,center.y-110, this.Color7, true, {text:'\u03BC1',vec:false})
                    }
                }
            }


            if(this.getCouplage() != null) {
                if(this.getCouplage().type == 0){ //charge
                    if(this.getCouplage().valeur < 0) {
                        this.ctx.beginPath();
                        this.ctx.arc(center.x-200, center.y, this.rayon, 0, 2 * Math.PI);
                        this.ctx.fillStyle = this.Color6;
                        this.ctx.fill();

                        this.ctx.textAlign = "center";
                        this.ctx.textBaseline = "middle";
                        this.ctx.font = "30px Arial";
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.fillText('q2', center.x-200, center.y);
                    }
                    else {
                        this.ctx.beginPath();
                        this.ctx.arc(center.x+200, center.y, this.rayon, 0, 2 * Math.PI);
                        this.ctx.fillStyle = this.Color6;
                        this.ctx.fill();

                        this.ctx.textAlign = "center";
                        this.ctx.textBaseline = "middle";
                        this.ctx.font = "30px Arial";
                        this.ctx.fillStyle = '#ffffff';
                        this.ctx.fillText('q2', center.x+200, center.y);
                    }
                }
                else if(this.getCouplage().type == 1)
                    this.fleche(center.x+200,center.y,center.x+400,center.y, this.Color6, true, {text:'\u03BC2*',vec:false})
                else {
                    this.fleche(center.x+200,center.y,center.x+400,center.y, this.Color6, true, {text:'\u03BC2',vec:false})
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
  },
  mounted() {
      this.Color1 = getComputedStyle(document.documentElement).getPropertyValue('--Color-1');
        this.Color2 = getComputedStyle(document.documentElement).getPropertyValue('--Color-2');
        this.Color3 = getComputedStyle(document.documentElement).getPropertyValue('--Color-3');
        this.Color4 = getComputedStyle(document.documentElement).getPropertyValue('--Color-4');
        this.Color5 = getComputedStyle(document.documentElement).getPropertyValue('--Color-5');
        this.Color6 = getComputedStyle(document.documentElement).getPropertyValue('--Color-6');
        this.Color7 = getComputedStyle(document.documentElement).getPropertyValue('--Color-7');
    this.$refs.select.height = window.innerHeight;
    this.$refs.select.width = window.innerWidth;
    this.ctx = this.$refs.select.getContext("2d");
    this.drawBgDots();
    this.reDraw();
    if(this.getListeAtoms().length>0) this.selectedTool = 0;

    if(this.getCouplage() != null) {
        this.canAdd = false;
        this.elementSelected = true;
        this.couplage = this.getCouplage();
    }
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
    color: var(--Color-7);
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
