<template>
  <div class="Perturbations">

    <multipane class="vertical-panes" layout="vertical">
      <div class="vpane" style="minWidth: 20%; maxWidth: 80%;" v-bind:style="{ width: graphicWidth + '%' }">
          <GraphicViewPerturbations style="width:70%" ref="graphic" v-on:newPertu="newPertu" v-on:selectedPertu='selectPertu' v-on:dipoleMove="dipoleMove" v-on:deClick="deClick" v-on:unSelect='unSelect' v-on:hideDisplay="hideDisplay" v-on:move="equilibre=false"/>
      </div>
      <multipane-resizer></multipane-resizer>
      <div class="vpane" :style="{ minWidth: '20%', width: '30%', maxWidth: '80%', flexGrow: 1 }">
        <div>
          <multipane class="horizontal-panes" layout="horizontal">
            <div class="hpane" :style="{ minHeight: 'calc(0.2*(100vh - 90px))', height: 'calc(0.6*(100vh - 90px))', maxHeight: 'calc(0.8*(100vh - 90px))' }">
              <div>
                <h3 >Paramètres</h3>
                <form v-if="displayParamPertu">
                  <h4>Propriétés Perturbation</h4>
                  <span>type de perturbation: </span>
                  <select v-model="type" v-on:change="pertuChange(true);">
                    <option value=0>Champ électrique</option>
                    <option value=1 >Charge ponctuelle</option>
                    <option value=2 >Dipôle ponctuel</option>
                    <option value=3 >Tension électrique</option>
                  </select><p/>
                  <div><span>Valeur: </span> <input @input="pertuChange(false)" step="1.00"  type="number" v-model.number="valeur" v-on:keydown.enter.prevent=''> 
                  <span v-if="type==0"> J/mC</span>
                  <span v-if="type==1"> <VueMathjax :formula="formula"></VueMathjax></span>
                  <span v-if="type==2"> D</span>
                  <span v-if="type==3"> V</span>
                  <p/></div>
                  <div v-if="type==1||type==2"><span>Distance: </span> <input @input="pertuChange(false)" step="1.00" type="number" min="0" v-model.number="distance" v-on:keydown.enter.prevent=''> nm<p/> </div>
                  <div v-if="type==0||type==2"><span>Angle: </span> <input :disabled="numAtoms!=2&&type==2" @input="pertuChange(false)" type="number" v-model.number="angle" v-on:keydown.enter.prevent=''> degrés<p/></div>
                </form>
              </div>
            </div>
            <multipane-resizer></multipane-resizer>
            <div class="hpane" :style="{ minHeight: 'calc(0.2*(100vh - 90px))', height: 'calc(0.4*(100vh - 90px))', maxheight: 'calc(0.8*(100vh - 90px))', flexGrow: 1 }">
              <boiteDeCalculs ref="calculs" v-on:reloadGraphics="reloadGraphics" style="flexGrow: 1"></boiteDeCalculs>
            </div>
          </multipane>
        </div>
      </div>
    </multipane>
  </div>
</template>

<script>
import { Multipane, MultipaneResizer } from 'vue-multipane';
import {VueMathjax} from 'vue-mathjax';
import GraphicViewPerturbations from '../components/GraphicPerturbations.vue';
import boiteDeCalculs from '../components/boiteDeCalculsPerturbation.vue';

import {mapGetters,mapMutations} from 'vuex';

export default {
  name: 'Perturbations',
  data() {
    return{
      AtomsData: null,

      graphicWidth: 70,

      type: null,
      valeur: 0,
      distance: 0,
      angle: 0,

      corner: {x: 150, y: 60},

      displayParamPertu: false,

      numAtoms: 0,

      selectedPertu: null,
      formula: "$*1.602*10^{-19}\\text{ C}$"
    }
  },

  components: {
    Multipane,
    MultipaneResizer,
    VueMathjax,
    GraphicViewPerturbations,
    boiteDeCalculs,
  },

  methods: {
    ... mapGetters(['getAtomsData','getAtomsDataPerso', 'getListeAtoms', 'getListeLiaisons','getListePertu']),
    ... mapMutations(['addListeAtoms','updateAtom', 'addListeLiaisons','updateLiaison', 'removeLiaison','setRecompute','addAtomData','addListePertu','updatePertu','removePertu']),

    newPertu(x,y, type) {
      if(type == 0 || type == 3){
        if(this.getListeAtoms().length>0){
          x = this.getListeAtoms()[0].position.x;
          y = this.getListeAtoms()[0].position.y;
          if(this.getListeAtoms().length>1){
            if(this.getListeAtoms()[1].position.x < x) x = this.getListeAtoms()[1].position.x;
            if(this.getListeAtoms()[1].position.y < y) y = this.getListeAtoms()[1].position.y;
          }
          x = x - this.corner.x;
          y = y - this.corner.y;
        }
        else{
          x = 70;
          y = 65;
        }
      }
      const pertu = {
        position: {
          x: x,
          y: y,
        },

        pertuData: {
          type: type,
          valeur: 0,
          distance: 0,
          angle: 0,
        }
      }
      this.addListePertu(pertu);

      this.selectPertu(this.getListePertu().length - 1);

    },

    selectPertu(selectedPertu) {
      this.displayParamPertu = true;
      
      this.selectedPertu = selectedPertu;

      const tempPertu = this.getListePertu()[selectedPertu];
      this.type = tempPertu.pertuData.type;
      this.valeur = tempPertu.pertuData.valeur;
      this.distance = tempPertu.pertuData.distance;
      this.angle = -tempPertu.pertuData.angle;

    },

    unSelect() {
      this.displayParamPertu = false;
    },

    /*
    undetermined() {
      this.selectedKnowAtom = 0;
      this.nom = '';
      this.nombreDeNeutrons = this.nombreDeMasse - this.nombreAtomique;

      this.updateAtomData();
    },*/

    updateAtomData() {
      if(this.selectedAtom != null) {
        var tempAtom = this.getListeAtoms()[this.selectedAtom];
        tempAtom.atomData.nom = this.nom;
        tempAtom.atomData.symbole = this.AtomsData[this.selectedKnowAtom-1].nom;
        tempAtom.atomData.knownAtom = this.selectedKnowAtom;
        tempAtom.atomData.nombreAtomique = this.nombreAtomique;
        tempAtom.atomData.masseAtomique = this.masseAtomique;
        tempAtom.atomData.rayonIonique = this.rayonIonique;
        tempAtom.atomData.rayonCovalent = this.rayonCovalent;
        tempAtom.atomData.nombreDeMasse = this.nombreDeMasse;
        tempAtom.atomData.nombreDeNeutrons = this.nombreDeNeutrons;
        tempAtom.atomData.electronegativite = this.electronegativite;
        tempAtom.atomData.energieIonisation = this.energieIonisation;
        tempAtom.atomData.electronsValence = this.electronsValence;

        this.updateAtom({index:this.selectedAtom, atom: tempAtom});
        if(this.getListeLiaisons().length>0)this.setRecompute(true);
      }
    },

    pertuChange(type) {
      if(this.getListePertu().length>this.selectedPertu){
        var pertu = this.getListePertu()[this.selectedPertu];

        if(type) this.$refs.calculs.selectedCalcul = 0;

        pertu.pertuData.type= this.type;
        pertu.pertuData.valeur= this.valeur;
        pertu.pertuData.distance= this.distance;
        pertu.pertuData.angle= -this.angle;
        if(this.type==2&&this.getListeLiaisons().length!=1){
          pertu.pertuData.angle=0;
          this.angle=0;
        }
        if(this.type==2&&this.getListeLiaisons().length==1){
          var angleAtom = Math.atan((this.getListeAtoms()[1].position.y-this.getListeAtoms()[0].position.y)/(this.getListeAtoms()[1].position.x-this.getListeAtoms()[0].position.x))*180/Math.PI;
          var centerAtom = {x: (this.getListeAtoms()[0].position.x+this.getListeAtoms()[1].position.x)/2, y:(this.getListeAtoms()[0].position.y+this.getListeAtoms()[1].position.y)/2};
          var angle = pertu.pertuData.angle + angleAtom;
          var norm = Math.sqrt(Math.pow(centerAtom.x-pertu.position.x,2)+Math.pow(centerAtom.y-pertu.position.y,2));
          pertu.position.x = Math.cos(angle*Math.PI/180)*norm + centerAtom.x;
          pertu.position.y = Math.sin(angle*Math.PI/180)*norm + centerAtom.y;

          if(pertu.position.x < 0) pertu.position.x = 40;
          if(pertu.position.x > window.innerWidth * this.graphicWidth/100) pertu.position.x = window.innerWidth * this.graphicWidth/100 - 40;
          if(pertu.position.y < 0) pertu.position.y = 40;
          if(pertu.position.y > window.innerHeight - 60 - 74) pertu.position.y = window.innerHeight - 174;
        }

         if(pertu.pertuData.type == 0 || pertu.pertuData.type == 3){
          if(this.getListeAtoms().length>0){
            var x = this.getListeAtoms()[0].position.x;
            var y = this.getListeAtoms()[0].position.y;
            if(this.getListeAtoms().length>1){
              if(this.getListeAtoms()[1].position.x < x) x = this.getListeAtoms()[1].position.x;
              if(this.getListeAtoms()[1].position.y < y) y = this.getListeAtoms()[1].position.y;
            }
            pertu.position.x = x - this.corner.x;
            pertu.position.y = y - this.corner.y;
          }
          else{
            pertu.position.x = 70;
            pertu.position.y = 65;
          }
        }

        this.updatePertu({index:this.selectedPertu, pertu: pertu});

        this.$refs.calculs.type = this.type;
        this.$refs.calculs.compute();
        this.$refs.graphic.projection();
      }
      this.reloadGraphics();
      this.typeChange = false;
    },

    hideDisplay() {
      this.displayParamPertu = false;
    },
    equilibrer() {
      this.equilibre = true;
    },
    reloadGraphics() {
      this.$refs.graphic.drawBgDots();
      this.$refs.graphic.reDraw();
    },
    deClick() {
      if(this.type == 1 || this.type==2) {
        this.$refs.calculs.calcul();
      }
    },
    dipoleMove(angle) {
      this.getListePertu()[this.selectedPertu].pertuData.angle = angle;
      this.angle = -angle;
    },
  },

  created() {
    this.numAtoms = this.getListeAtoms().length;
    if(this.getListePertu().length>0){
      var pertu = this.getListePertu()[0];
      const type = pertu.pertuData.type;
      if(type == 0 || type == 3){
        if(this.getListeAtoms().length>0){
          var x = this.getListeAtoms()[0].position.x;
          var y = this.getListeAtoms()[0].position.y;
          if(this.getListeAtoms().length>1){
            if(this.getListeAtoms()[1].position.x < x) x = this.getListeAtoms()[1].position.x;
            if(this.getListeAtoms()[1].position.y < y) y = this.getListeAtoms()[1].position.y;
          }
          pertu.position.x = x - this.corner.x;
          pertu.position.y = y - this.corner.y;
        }
        else{
          pertu.position.x = 70;
          pertu.position.y = 65;
        }
      }
    }
  }
};
</script>

<style scoped>
  .vertical-panes {
    width: calc(100vw-1);
    height:  calc(100vh - 90px);
    border: 1px solid #ccc;
  }
  .vertical-panes > .vpane {
    text-align: left;
    padding: 15px;
    overflow: hidden;
    background: #eee;
  }
  .vertical-panes > .vpane ~ .vpane {
    border-left: 1px solid #ccc;
  }

  .horizontal-panes {
    width: 100%;
    height: 100%;
  }
  .horizontal-panes > .hpane {
    text-align: left;
    padding: 15px;
    overflow: auto;
    background: #eee;
    min-width: 100%;
  }
  .horizontal-panes > .hpane ~ .hpane {
    border-top: 1px solid #ccc;
  }
  .charge {
    z-index: 2;
    position:absolute;
    border-radius: 25px;
    border: 2px solid var(--Color-3);
    background-color: whitesmoke;
    width: 100px;
    height: 100px;
    left: 0px;
    top: 0px;
  }
  .equilibre {
    z-index: 2;
    border: 0px;
    position:absolute;
    color: var(--Color-1);
    left: 10px;
    top: 100px;
  }
  .equilibre:hover {
    opacity: 0.5;
  }
  .pasModifier {
    background-color: #ccc;
  }
  .danger {
    background-color: var(--Color-4);
  }
  .unused {
    opacity: 0.5;
  }

</style>