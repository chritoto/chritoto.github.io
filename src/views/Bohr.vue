<template>
  <div class="Perturbations">
    <b-modal id="modal" v-model="modalShow" title="Un atome">
        <form>
        <h4>Un seul atome doit être ajouté</h4>
        </form>
        <template v-slot:modal-footer="{ ok }">
        <b-button size="sm" variant="success" @click="ok()">
            Ok
        </b-button>
        </template>
    </b-modal>
    <multipane class="vertical-panes" layout="vertical">
      <div class="vpane" :style="{ minWidth: '20%', width: graphicWidth + '%', maxWidth: '80%'}">
          <GraphicViewBohr ref="graphic" v-on:transition="transitionChanged"/>
      </div>
      <multipane-resizer></multipane-resizer>
      <div class="vpane" :style="{ minWidth: '20%', width: '30%', maxWidth: '80%', flexGrow: 1 }">
        <div>
          <multipane class="horizontal-panes" layout="horizontal">
            <div class="hpane" :style="{ minHeight: 'calc(0.2*(100vh - 90px))', height: 'calc(0.6*(100vh - 90px))', maxHeight: 'calc(0.8*(100vh - 90px))' }">
              <div v-if="bohrActive">
                <h3>Paramètres</h3>
                  <form v-if="!transition">
                  <h4>Propriété électron unique</h4>
                  <span>État d'électron n: </span><input @input="etatChange" id="n1" v-bind:class="{inf:etat1==7}" type="number" min="1" max="7" v-model.number="etat1"> <span v-if="etat1==7">∞</span> <p/>
                  </form>
                  <form v-if="transition">
                  <h4>Propriété électron transition</h4>
                  <span>État d'électron n initial: </span><input @input="etatChange" class="initial" v-bind:class="{infin:etat1==7}" type="number" min="1" max="7" v-model.number="etat1"> <span v-if="etat1==7">∞</span><p/>
                  <span>État d'électron n final: </span><input @input="etatChange" class="final" v-bind:class="{inffin:etat2==7}" type="number" min="1" max="7" v-model.number="etat2"> <span v-if="etat2==7">∞</span><p/>
                  </form>
                  <p/>
                  <h4>Propriété Atome</h4>
                  <span>État d'oxidation: </span>
                  <VueMathjax :formula="formula"></VueMathjax>
              </div>
            </div>
            <multipane-resizer></multipane-resizer>
            <div class="hpane" :style="{ minHeight: 'calc(0.2*(100vh - 90px))', height: 'calc(0.4*(100vh - 90px))', maxheight: 'calc(0.8*(100vh - 90px))', flexGrow: 1 }">
              <boiteDeCalculs ref="calcul" v-on:redraw="redraw" style="flexGrow: 1"></boiteDeCalculs>
            </div>
          </multipane>
        </div>
      </div>
    </multipane>
  </div>
</template>

<script>
import { Multipane, MultipaneResizer } from 'vue-multipane';
import GraphicViewBohr from '../components/GraphicBohr.vue';
import boiteDeCalculs from '../components/boiteDeCalculsBohr.vue';
import {VueMathjax} from 'vue-mathjax';

import {mapGetters,mapMutations} from 'vuex';

export default {
  name: 'Bohr',
  data() {
    return{
      graphicWidth: 70,
      modalShow: false,
      AtomsData: null,
      transition: false,

      bohrActive: false,

      etat1: 1,
      etat2: 1,
      
      formula: '',
    }
  },

  components: {
    Multipane,
    MultipaneResizer,
    GraphicViewBohr,
    boiteDeCalculs,
    VueMathjax,
  },

  methods: {
    ... mapGetters(['getAtomsData','getAtomsDataPerso', 'getListeAtoms', 'getListeLiaisons','getEtatsBohr']),
    ... mapMutations(['addListeAtoms','updateAtom', 'addListeLiaisons','updateLiaison', 'removeLiaison','setRecompute','addAtomData','setBohrActive','setEtatsBohr']),

    etatChange() {


      if(!(this.etat1 >= 1 && this.etat1 <= 7)) {if(this.etat1 > 7) this.etat1 = 7; else this.etat1 = 1;}
      if(!(this.etat2 >= 1 && this.etat2 <= 7)) {if(this.etat2 > 7) this.etat2 = 7; else this.etat2 = 1;}
      this.setEtatsBohr([this.etat1,this.etat2]);
      this.$refs.calcul.calcul();
      this.$refs.graphic.drawBgDots();
      this.$refs.graphic.reDraw();
    },
    transitionChanged() {
      this.transition = !this.transition;
      this.setEtatsBohr([this.etat1,this.etat2]);
      this.$refs.calcul.calcul();
    },
    redraw() {
      this.$refs.graphic.drawBgDots();
      this.$refs.graphic.reDraw();
    },
    reSize() {
      
      this.$refs.graphic.taille = {
        x:window.innerWidth * this.graphicWidth/100,
        y:window.innerHeight - 80 - 74,
      };
      this.$refs.graphic.drawBgDots();
      this.$refs.graphic.reDraw();
    },
  },

  mounted() {
      if(this.getListeAtoms().length != 1) this.modalShow= true;
      if(this.getListeAtoms().length == 1) if(this.getListeAtoms()[0].atomData.masseAtomique==0) this.modalShow=true;
      
      this.bohrActive = !this.modalShow;
      this.setBohrActive(!this.modalShow);

      this.reSize();
      this.etat1 = this.getEtatsBohr()[0];
      this.etat2 = this.getEtatsBohr()[1];
      this.$refs.graphic.drawBgDots();
      this.$refs.graphic.reDraw();
      window.addEventListener('resize', this.reSize);

      if(this.bohrActive){
        this.formula = '$$[\\text{'+this.getListeAtoms()[0].atomData.symbole+'}]^{'+(this.getListeAtoms()[0].atomData.nombreAtomique-1)+'+}$$'
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
  .inf {
    color: white;
  }
  .initial {
    background-color: var(--Color-6);
    color: white;
  }
  .final {
    background-color: var(--Color-2);
    color: white;
  }
  .infin {
    color: var(--Color-6);
  }
  .inffin {
    color: var(--Color-2);
  }

</style>