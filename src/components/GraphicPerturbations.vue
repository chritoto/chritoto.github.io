<template>
    <div>
        <canvas id='canvas' ref='select' @mousedown.left='leftClick' @mousemove="move" @mouseup="unSelect" v-bind:class="{canvasCursor:selectedTool==1}"></canvas>
        <div class="controls">
            <div class="btn-row">
                <button type="button" v-bind:class="{active:selectedTool==0}" v-on:click="selectedTool=0;popupAjouter=false;popupOptions=false;">
                    <i class="fa fa-mouse-pointer"></i>
                </button>
			</div>
            
			<div class="btn-row" >
                <button type="button" v-bind:class="{active:selectedTool==1,disabled:!canAdd}" v-on:click="addOptions">
                    <i class="fa fa-plus"></i>
                </button>
                <div class="popup" v-if="popupAjouter">
					<h4>
						Ajouter
					</h4>
                    <form>
                        <label class="option">
                            <input type="radio" v-model="ajouter" value="0" name="ajouter">
                                Champ Électrique
                        </label>
                        <label class="option">
                            <input type="radio" v-model="ajouter" value="1" name="ajouter">
                                Charge Ponctuelle
                        </label><br/>
                        <label class="option">
                            <input type="radio" v-model="ajouter" value="2" name="ajouter">
                                Dipôle
                        </label><br/>
                        <label class="option">
                            <input type="radio" v-model="ajouter" value="3" name="ajouter">
                                Tension Électrique
                        </label>
                    </form>
				</div>
			</div>
			
			<div class="btn-row" >
                <button type="button" v-bind:class="{disabled:!elementSelected}" v-on:click="deletePertu">
                    <i class="fa fa-trash-o"></i>
                </button>
			</div>

            <div class="btn-row">
                <button type="button" v-bind:class="{active:popupOptions}" v-on:click="popupOptions=!popupOptions;popupAjouter=false">
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
  name: 'GraphicViewPertubations',

  data() {
    return {

      selectedTool: 1,
      elementSelected: false,
      selectedAtom: null,
      selectedLink: null,
      selectMode: false,
      selectedPertu: null,
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
      maxPertu: 1,

      popupOptions: false,
      affichage1: true,
      affichage2: true,
      affichage3: false,

      popupAjouter: false,
      ajouter: 0,

      Color1:null,
      Color2:null,
      Color3:null,
      Color4:null,
      Color5:null,
      Color6:null,
      Color7:null,
      Color8:null,
    };
  },

  methods: {
    ... mapGetters(['getListeAtoms','getListeLiaisons', 'getListePertu','getForce','getForces','getCloseLink', 'getLinkValid']),
    ... mapMutations(['addListeAtoms','updateAtom','removeAtom','removeLiaison','setRecompute','addListePertu','updatePertu','removePertu','setCloseLink']),

    leftClick(e) {
        this.popupOptions = false;
        this.popupAjouter = false;
        
        this.left = this.$refs.select.getBoundingClientRect().left;
        this.top = this.$refs.select.getBoundingClientRect().top;
        this.position.x = e.pageX-this.left;
        this.position.y = e.pageY-this.top;
        if(this.selectedTool==1){ //Add tool
            if(this.getListePertu().length<this.maxPertu){
                if((this.getListePertu().length)==this.maxPertu-1) {this.selectedTool = 0; this.canAdd=false;}
                this.$emit('newPertu', this.position.x, this.position.y, this.ajouter);
            }
            this.selectedPertu = this.getListePertu().length-1;
            this.elementSelected = true;
        }
        else { //select tool
            var index = 0;
            this.selectMode = false;
            this.getListePertu().forEach(element => {
                if(Math.sqrt(Math.pow(this.position.x-element.position.x,2) + Math.pow(this.position.y-element.position.y,2))<=this.rayon){
                    this.selectedPertu=index;
                    this.selectMode = true;
                }
                index++;
            });
            if(!this.selectMode) this.selectedPertu = null;
            this.elementSelected = this.selectMode;
            if(this.selectMode) this.$emit('selectedPertu',this.selectedPertu);
            else this.$emit('unSelect');
        }

        this.projection();
        this.drawBgDots();
        this.reDraw();
    },
    
    move(e) {
        this.left = this.$refs.select.getBoundingClientRect().left;
        this.top = this.$refs.select.getBoundingClientRect().top;
        

        if(this.selectedPertu!=null && this.selectMode){
            var tempPertu = this.getListePertu()[this.selectedPertu];
            if(tempPertu.pertuData.type == 1 || tempPertu.pertuData.type == 2){
                
                tempPertu.position.x = this.position.x;
                tempPertu.position.y = this.position.y;

                this.projection();
                this.drawBgDots();
                this.reDraw();
                if(tempPertu.pertuData.type==2 && this.getListeLiaisons().length==1){ //dipole-dipole
                    var angleAtom = Math.atan((this.getListeAtoms()[1].position.y-this.getListeAtoms()[0].position.y)/(this.getListeAtoms()[1].position.x-this.getListeAtoms()[0].position.x))*180/Math.PI;
                    var centerAtom = {x: (this.getListeAtoms()[0].position.x+this.getListeAtoms()[1].position.x)/2, y:(this.getListeAtoms()[0].position.y+this.getListeAtoms()[1].position.y)/2};
                    var angleDipole = Math.atan((tempPertu.position.y-centerAtom.y)/(tempPertu.position.x-centerAtom.x))*180/Math.PI;
                    var angle = angleDipole-angleAtom;
                    if(tempPertu.position.x-centerAtom.x<0)angle+=180;
                    if(angle<-180) angle += 360;
                    if(angle>180) angle -= 360;
                    this.$emit('dipoleMove', angle);
                }
            }
        }

        this.position.x = e.pageX-this.left;
        this.position.y = e.pageY-this.top;
    },

    projection() {
        this.getListePertu().forEach(element =>{
            if(element.pertuData.type == 1){
                var Projection = null;
                if(this.getListeLiaisons().length>0){
                    var A = this.getListeAtoms()[0].position;
                    var B = this.getListeAtoms()[1].position;
                    var AP = {x:element.position.x-A.x,y:element.position.y-A.y};
                    var AB = {x:B.x-A.x,y:B.y-A.y}
                    var factor = (AP.x*AB.x+AP.y*AB.y) / (AB.x*AB.x+AB.y*AB.y);
                    Projection = { x: A.x + factor* AB.x, y: A.y + factor* AB.y};
                }
                else{
                    Projection = {x: element.position.x, y: element.position.y};
                }
                element.position.x = Projection.x;
                element.position.y = Projection.y;
            }
        });
    },

    unSelect() {
        this.selectMode = false;
        this.$emit('deClick');
    },

    deletePertu(){
        if(this.elementSelected){
            this.$emit('hideDisplay');
            this.removePertu(this.selectedPertu);
            this.drawBgDots();
            this.selectedPertu = null;
            this.reDraw();
            this.canAdd = true;
        }
    },

    addOptions() {
        if(this.canAdd){
            this.selectedTool=1;
            this.popupAjouter=!this.popupAjouter;
            this.popupOptions=false;
        }
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
            if(this.closeLink==true){
                
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
            this.ctx.lineWidth = this.epaisseurLiens;
            this.ctx.beginPath();
            this.ctx.moveTo(this.getListeAtoms()[i].position.x, this.getListeAtoms()[i].position.y);
            this.ctx.lineTo(this.getListeAtoms()[i+1].position.x, this.getListeAtoms()[i+1].position.y);
            this.ctx.closePath();
            this.ctx.strokeStyle = this.Color5;
            this.ctx.stroke();
        }
    },

    reDraw(){

        if(this.getListePertu().length > 0) {
            //offset
            var pertu = this.getListePertu()[0];
            var offsetx = 80 - pertu.position.x;
            if(pertu.position.x < 80){
            pertu.position.x = 80;
            if(this.getListeAtoms().length>0)this.getListeAtoms()[0].position.x += offsetx;
            if(this.getListeAtoms().length>1)this.getListeAtoms()[1].position.x += offsetx;
            }
            var offsety = 80 - pertu.position.y;
            if(pertu.position.y < 80){
            pertu.position.y = 80;
            if(this.getListeAtoms().length>0)this.getListeAtoms()[0].position.y += offsety;
            if(this.getListeAtoms().length>1)this.getListeAtoms()[1].position.y += offsety;
            }

            //Rectangle
            if(this.getListePertu()[0].pertuData.type == 0 || this.getListePertu()[0].pertuData.type == 3){
                if(this.getListePertu()[0].pertuData.type == 0) this.ctx.strokeStyle = this.Color3;
                else this.ctx.strokeStyle = this.Color4;
                this.ctx.lineWidth = 5;
                var taille = {x:0,y:0};
                this.getListeAtoms().forEach(atom => {
                    if(atom.position.x - this.getListePertu()[0].position.x > taille.x) taille.x = atom.position.x - this.getListePertu()[0].position.x;
                    if(atom.position.y - this.getListePertu()[0].position.y > taille.y) taille.y = atom.position.y - this.getListePertu()[0].position.y;
                });
                this.ctx.strokeRect(this.getListePertu()[0].position.x - 75,this.getListePertu()[0].position.y-65,taille.x+230,taille.y+200);
            }
        }

        if(!this.closeLink)this.liens();
        this.getListeAtoms().forEach(element => {
            this.ctx.beginPath();
            this.ctx.arc(element.position.x, element.position.y, element.position.rayon, 0, 2 * Math.PI);
            if(element.atomData.symbole == '') this.ctx.fillStyle = this.Color4;
            else this.ctx.fillStyle = this.Color6;
            this.ctx.fill();

            var line;
            if(this.getListeAtoms().length>1) line = {x:this.getListeAtoms()[1].position.x-this.getListeAtoms()[0].position.x, y:this.getListeAtoms()[1].position.y-this.getListeAtoms()[0].position.y};
            else line = {x:0-this.getListeAtoms()[0].position.x, y:0-this.getListeAtoms()[0].position.y};
            var norm = Math.sqrt(Math.pow(line.x,2)+Math.pow(line.y,2));
            line.x = line.x/norm;
            line.y = line.y/norm;
            var perp = {x:line.y, y: -line.x};
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
            if (this.affichage3) {

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
                this.ctx.fillText('' + this.getListeLiaisons()[0].momentDipolaire.toFixed(3) + ' D', this.getListeAtoms()[0].position.x+line.x*norm/2+perp.x*this.rayon*2.5, this.getListeAtoms()[0].position.y+line.y*norm/2+perp.y*this.rayon*2.5);
            }
        });

        if(this.closeLink)this.liens();

        this.getListePertu().forEach(element =>{
            var angle = element.pertuData.angle;
            if(element.pertuData.type==1){
                this.ctx.beginPath();
                this.ctx.arc(element.position.x, element.position.y, this.rayon*0.75, 0, 2 * Math.PI);
                this.ctx.fillStyle = this.Color8;
                this.ctx.fill();

                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                this.ctx.font = "30px Cambria Math";
                this.ctx.fillStyle = '#000';
                this.ctx.fillText('q', element.position.x, element.position.y);
            }
            else if(element.pertuData.type==3) {
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                this.ctx.font = "30px Cambria Math";
                this.ctx.fillStyle = this.Color1;
                this.ctx.fillText('V = '+element.pertuData.valeur.toFixed(2), element.position.x, element.position.y);
            }
            else {
                if(element.pertuData.type==2&&this.getListeAtoms().length==1){
                    element.position.y = this.getListeAtoms()[0].position.y;
                }
                else if(element.pertuData.type==2&&this.getListeAtoms().length==2)
                    angle = Math.atan((this.getListeAtoms()[1].position.y-this.getListeAtoms()[0].position.y)/(this.getListeAtoms()[1].position.x-this.getListeAtoms()[0].position.x))*180/Math.PI;
                if(element.pertuData.valeur < 0) angle += 180;
                this.fleche(element.position.x - Math.cos(angle* Math.PI / 180)*this.rayon, element.position.y- Math.sin(angle* Math.PI / 180)*this.rayon,
                    element.position.x + Math.cos(angle* Math.PI / 180)*this.rayon, element.position.y+ Math.sin(angle* Math.PI / 180)*this.rayon,
                    element.pertuData.type==2 ? this.Color1: this.Color1, element.pertuData.type==2, {text:element.pertuData.type==2 ? '\uD835\uDF07': 'E',vec:element.pertuData.type==0},false);
            }
        });
        if(this.selectedPertu!=null) {
            if(this.getListePertu()[this.selectedPertu].pertuData.type==1){
                this.ctx.beginPath();
                this.ctx.arc(this.getListePertu()[this.selectedPertu].position.x, this.getListePertu()[this.selectedPertu].position.y, this.rayon*0.75-this.contour/2, 0, 2 * Math.PI);
                this.ctx.strokeStyle = this.Color1;
                this.ctx.lineWidth = this.contour;
                this.ctx.stroke();
            }
            else if (this.getListePertu()[this.selectedPertu].pertuData.type==3){
                this.ctx.textAlign = "center";
                this.ctx.textBaseline = "middle";
                this.ctx.font = "30px Cambria Math";
                this.ctx.fillStyle = this.Color8;
                this.ctx.fillText('V = '+this.getListePertu()[this.selectedPertu].pertuData.valeur.toFixed(2), this.getListePertu()[this.selectedPertu].position.x, this.getListePertu()[this.selectedPertu].position.y);
            }
            else {
                var angle = this.getListePertu()[this.selectedPertu].pertuData.angle;
                if( this.getListePertu()[this.selectedPertu].pertuData.type==2&&this.getListeAtoms().length==2){
                    angle = Math.atan((this.getListeAtoms()[1].position.y-this.getListeAtoms()[0].position.y)/(this.getListeAtoms()[1].position.x-this.getListeAtoms()[0].position.x))*180/Math.PI;
                }
                if(this.getListePertu()[this.selectedPertu].pertuData.valeur < 0) angle += 180;
                this.fleche(this.getListePertu()[this.selectedPertu].position.x - Math.cos(angle* Math.PI / 180)*this.rayon, this.getListePertu()[this.selectedPertu].position.y- Math.sin(angle* Math.PI / 180)*this.rayon,
                            this.getListePertu()[this.selectedPertu].position.x + Math.cos(angle* Math.PI / 180)*this.rayon, this.getListePertu()[this.selectedPertu].position.y+ Math.sin(angle* Math.PI / 180)*this.rayon,
                            this.Color8, this.getListePertu()[this.selectedPertu].pertuData.type==2, {text:this.getListePertu()[this.selectedPertu].pertuData.type==2 ? '\uD835\uDF07': 'E',vec:this.getListePertu()[this.selectedPertu].pertuData.type==0},false);
            }
        }
        var force = this.getForce();
        if(force) {
            var positionForce = null;
            if(this.getListeAtoms().length == 1){
                positionForce = {x:this.getListeAtoms()[0].position.x, y:this.getListeAtoms()[0].position.y};
            }
            if(this.getListeAtoms().length == 2){
                positionForce = {x:(this.getListeAtoms()[0].position.x+this.getListeAtoms()[1].position.x)/2, y:(this.getListeAtoms()[0].position.y+this.getListeAtoms()[1].position.y)/2};
            }
    
            this.fleche(positionForce.x+ Math.cos(force.angle* Math.PI / 180)*30, positionForce.y+ Math.sin(force.angle* Math.PI / 180)*30,
                            positionForce.x + Math.cos(force.angle* Math.PI / 180)*30*3, positionForce.y+ Math.sin(force.angle* Math.PI / 180)*30*3,
                            this.Color8, false, {text:'F',vec:true},false);
        }
        var forces = this.getForces();
        if(forces.length > 0){
            this.fleche(this.getListeAtoms()[0].position.x+ Math.cos(forces[0].angle* Math.PI / 180)*this.rayon,this.getListeAtoms()[0].position.y+ Math.sin(forces[0].angle* Math.PI / 180)*this.rayon,
                        this.getListeAtoms()[0].position.x + Math.cos(forces[0].angle* Math.PI / 180)*30*3, this.getListeAtoms()[0].position.y+ Math.sin(forces[0].angle* Math.PI / 180)*30*3,
                        this.Color8, false, {text:'F',vec:true},true);
            this.fleche(this.getListeAtoms()[1].position.x+ Math.cos(forces[1].angle* Math.PI / 180)*this.rayon, this.getListeAtoms()[1].position.y+ Math.sin(forces[1].angle* Math.PI / 180)*this.rayon,
                        this.getListeAtoms()[1].position.x + Math.cos(forces[1].angle* Math.PI / 180)*30*3, this.getListeAtoms()[1].position.y+ Math.sin(forces[1].angle* Math.PI / 180)*30*3,
                        this.Color8, false, {text:'F',vec:true},true);
        }

        //Coordinates

        if(this.getListeAtoms().length>1){
            var angleZero = Math.atan((this.getListeAtoms()[1].position.y-this.getListeAtoms()[0].position.y)/(this.getListeAtoms()[1].position.x-this.getListeAtoms()[0].position.x));
            if(this.getListePertu()[0].pertuData.type == 2){
                this.fleche(60,60,60+Math.cos(angleZero)*this.rayon,60+Math.sin(angleZero)*this.rayon,'#000000', false,{text:'0°',vec:false},false);
                this.fleche(60,60,60+Math.cos(angleZero-Math.PI/2)*this.rayon,60+Math.sin(angleZero-Math.PI/2)*this.rayon,'#000000', false,null,false);
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

    fleche(x1,y1,x2,y2, color, tail, text, minor) {
        var length = Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
        var headLength = length * 0.15;
        var dir = {x: (x2-x1)/length, y: (y2-y1)/length};

        if(minor) color = this.Color7;

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
        this.Color8 = getComputedStyle(document.documentElement).getPropertyValue('--Color-8');

    this.$refs.select.height = window.innerHeight;
    this.$refs.select.width = window.innerWidth;

    this.ctx = this.$refs.select.getContext("2d");

    this.closeLink = this.getCloseLink();
    this.linkValid = this.getLinkValid();

    if(this.closeLink){
        this.lengthPixels = Math.sqrt(Math.pow(this.getListeAtoms()[0].position.x-this.getListeAtoms()[1].position.x,2)+Math.pow(this.getListeAtoms()[0].position.y-this.getListeAtoms()[1].position.y,2))
        this.ABnorm = {x: (this.getListeAtoms()[1].position.x-this.getListeAtoms()[0].position.x)/this.lengthPixels, y:(this.getListeAtoms()[1].position.y-this.getListeAtoms()[0].position.y)/this.lengthPixels};
    }

    this.projection();
    this.drawBgDots();
    this.reDraw();
    if(this.getListePertu().length>0) this.selectedTool = 0;
    if(this.getListePertu().length>this.maxPertu-1) this.canAdd=false;
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
  color: var(--Color-6);
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
    color: var(--Color-6);
    filter: brightness(130%);
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
