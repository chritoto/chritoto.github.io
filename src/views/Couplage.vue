<template>
  <div class="Couplage">
    <b-modal no-close-on-backdrop hide-header-close no-close-on-esc id="modal" v-model="modalShow" title="Mode Couplage" @ok="setMolCoupl" @cancel='cancel'>
        <form>
        <h4>Atome Couplage requiert un atome ou une des molécules suivantes:</h4>
        <v-select  v-model="mol" label="nom" :options="molsCouplage" :components="{Deselect}"></v-select> <p/>
        </form>
        <template v-slot:modal-footer="{ ok, cancel }">
        <b-button size="sm" variant="danger" @click="cancel()">
          Annuler
        </b-button>
        <b-button size="sm" variant="success" @click="ok()">
            Ok
        </b-button>
        </template>
    </b-modal>
    <multipane class="vertical-panes" layout="vertical">
      <div class="vpane" :style="{ minWidth: '20%', width: '70%', maxWidth: '80%'}">
          <GraphicViewCouplage ref="graphic" v-on:select="select" v-on:unselect="unselect"/>
      </div>
      <multipane-resizer></multipane-resizer>
      <div class="vpane" :style="{ minWidth: '20%', width: '30%', maxWidth: '80%', flexGrow: 1 }">
        <div>
          <multipane class="horizontal-panes" layout="horizontal">
            <div class="hpane" :style="{ minHeight: 'calc(0.2*(100vh - 90px))', height: 'calc(0.6*(100vh - 90px))', maxHeight: 'calc(0.8*(100vh - 90px))' }">
              <div>
                <h3>Paramètres</h3>
                <span> <b-btn v-on:click="modalShow=true">Changer molécule</b-btn> </span>
                <form>
                  <p/>
                  <h4>Propriétés d'atome ou de molécule</h4>
                  <div><span> Première énergie d'ionisation: </span><input step="1.00"  type="number" v-model.number="energieI1" disabled><span>kJ/mol</span><p/></div>
                  <div><span> Polarisabilite: </span><input step="1.00"  type="number" v-model.number="pol1" disabled><span>*10^-30 <VueMathjax :formula="formula2"></VueMathjax></span><p/></div>
                  <div><span> Moment dipolaire: </span><input step="1.00"  type="number" v-model.number="dip1" disabled>D<p/></div>
                </form>
                <form v-if="selected">
                  <p/>
                  <h4>Propriétés d'élément de Couplage</h4>
                  <span>type de couplage: </span>
                  <select v-model="type" v-on:change="couplChange(true)">
                    <option value=0>Charge Ponctuelle</option>
                    <option value=1 >α Poncutelle</option>
                    <option value=2 >Dipôle Ponctuel</option>
                  </select><p/>
                  <span v-if="type==1">Atome existant:</span>
                  <v-select v-if="type==1" @input="changeAtome" v-model="selectedKnowAtome" label="Affichage" :options="AtomsData"></v-select> <p/>
                  <div><span>Valeur: </span> <input @input="couplChange(false)" step="1.00"  type="number" v-model.number="valeur"> 
                  <span v-if="type==0"> <VueMathjax :formula="formula"></VueMathjax></span>
                  <span v-if="type==1"> <VueMathjax :formula="formula2"></VueMathjax></span>
                  <span v-if="type==2"> D</span>
                  <p/>
                  <div v-if="type==1"><span> Première énergie d'ionisation: </span><input @input="couplChange(false)" step="1.00"  type="number" v-model.number="energieI"><span>kJ/mol</span><p/></div>
                  <span> Distance: </span><input @input="couplChange(true)" step="1.00"  type="number" v-model.number="distance"><span>nm</span><p/>
                  </div>
                </form>
              </div>
            </div>
            <multipane-resizer></multipane-resizer>
            <div class="hpane" :style="{ minHeight: 'calc(0.2*(100vh - 90px))', height: 'calc(0.4*(100vh - 90px))', maxheight: 'calc(0.8*(100vh - 90px))', flexGrow: 1 }">
              <boiteDeCalculs ref="calculs" style="flexGrow: 1"></boiteDeCalculs>
            </div>
          </multipane>
        </div>
      </div>
    </multipane>
  </div>
</template>

<script>
import {VueMathjax} from 'vue-mathjax';
import { Multipane, MultipaneResizer } from 'vue-multipane';
import GraphicViewCouplage from '../components/GraphicCouplage.vue';
import boiteDeCalculs from '../components/boiteDeCalculsCouplage.vue';

import {mapGetters,mapMutations} from 'vuex';

export default {
  name: 'Couplage',
  data() {
    return{
      modalShow: false,
      valide: false,
      mol: 0,
      molsCouplage: null,

      selected: false,

      type: 0,
      valeur: 0,
      distance: 0,
      energieI: 0,
      formula: "$*1.602*10^{-19}\\text{ C}$",
      formula2: '$m^3$',

      energieI1: 0,
      pol1: 0,
      dip1: 0,


      selectedKnowAtome: null,
      AtomsData: null,
    }
  },

  components: {
    Multipane,
    MultipaneResizer,
    VueMathjax,
    GraphicViewCouplage,
    boiteDeCalculs,
  },

  methods: {
    ... mapGetters(['getAtomsData','getAtomsDataPerso', 'getListeAtoms', 'getListeLiaisons','getMolsCouplage','getCouplage']),
    ... mapMutations(['addListeAtoms','updateAtom', 'addListeLiaisons','updateLiaison', 'removeLiaison','setRecompute','addAtomData','removeAtom','setCouplage','setMol','setComputeConcept']),

    setMolCoupl() {

      var length = this.getListeAtoms().length;
      for(var i=0;i<length;i++) this.removeAtom(0);
      length = this.getListeLiaisons().length;
      for(var j=0;j<length;j++) this.removeLiaison(0);

      
      var liste = [];
      if(this.mol.nom == 'H2') liste = [0,0];
      else if(this.mol.nom == 'O2') liste = [7,7];
      else if(this.mol.nom == 'N2') liste = [6,6];
      else if(this.mol.nom == 'HCl') liste = [0,16];
      else if(this.mol.nom == 'HI') liste = [0,52];

      this.energieI1 = this.mol.energieI;
      this.pol1 = this.mol.alpha;
      this.dip1 = this.mol.u;

      if(liste.length>0){
        var center = {x:this.$refs.graphic.taille.x/2, y:this.$refs.graphic.taille.y/2};
        const Atom1 = {
          position: {
            x: center.x-100,
            y: center.y,
            rayon: this.$refs.graphic.rayon,
          },

          atomData: {
            nom: this.getAtomsData()[liste[0]].nomComplet,
            symbole: this.getAtomsData()[liste[0]].nom,
            knownAtom: this.getAtomsData()[liste[0]],
            masseAtomique: this.getAtomsData()[liste[0]].masseAtomique,
            nombreAtomique: this.getAtomsData()[liste[0]].nombreAtomique,
            rayonIonique: this.getAtomsData()[liste[0]].rayonIonique,
            rayonCovalent: this.getAtomsData()[liste[0]].rayonCovalent,
            nombreDeMasse: this.getAtomsData()[liste[0]].nombreDeMasse,
            nombreDeNeutrons: this.getAtomsData()[liste[0]].nombreDeNeutrons,
            electronegativite: this.getAtomsData()[liste[0]].electronegativite,
            energieIonisation: this.getAtomsData()[liste[0]].energieIonisation,
            electronsValence: this.getAtomsData()[liste[0]].electronsValence,
            etatDeCharge: 0
          }
        }
        this.addListeAtoms(Atom1);

        const Atom2 = {
          position: {
            x: center.x+100,
            y: center.y,
            rayon: this.$refs.graphic.rayon,
          },

          atomData: {
            nom: this.getAtomsData()[liste[1]].nomComplet,
            symbole: this.getAtomsData()[liste[1]].nom,
            knownAtom: this.getAtomsData()[liste[1]],
            masseAtomique: this.getAtomsData()[liste[1]].masseAtomique,
            nombreAtomique: this.getAtomsData()[liste[1]].nombreAtomique,
            rayonIonique: this.getAtomsData()[liste[1]].rayonIonique,
            rayonCovalent: this.getAtomsData()[liste[1]].rayonCovalent,
            nombreDeMasse: this.getAtomsData()[liste[1]].nombreDeMasse,
            nombreDeNeutrons: this.getAtomsData()[liste[1]].nombreDeNeutrons,
            electronegativite: this.getAtomsData()[liste[1]].electronegativite,
            energieIonisation: this.getAtomsData()[liste[1]].energieIonisation,
            electronsValence: this.getAtomsData()[liste[1]].electronsValence,
            etatDeCharge: 0
          }
        }
        this.addListeAtoms(Atom2);

        const liaison = {
            type: 0,
            longueur: 0,
            ordre: 1,
            energie: 0,
            etatDeCharge: 0,
          }
        this.addListeLiaisons(liaison);
        this.setComputeConcept(true);
      }

      this.setMol(this.mol);
      this.$refs.graphic.modal = false;
      this.$refs.graphic.drawBgDots();
      this.$refs.graphic.reDraw();
      this.valide = true;
    },
    reSize() {
      this.$refs.graphic.taille = {
        x:window.innerWidth * 70/100,
        y:window.innerHeight - 80 - 74,
      };
      this.$refs.graphic.drawBgDots();
      this.$refs.graphic.reDraw();
    },
    select() {
      this.selected = true;
      this.type = this.$refs.graphic.couplage.type;
      this.valeur = this.$refs.graphic.couplage.valeur;
      this.distance = this.$refs.graphic.couplage.distance;
      this.energieI = this.$refs.graphic.couplage.energieI;
    },
    unselect() {
      this.selected = false;
    },
    couplChange(keep) {
      this.$refs.graphic.couplage.type = this.type;
      this.$refs.graphic.couplage.valeur = this.valeur;
      this.$refs.graphic.couplage.distance = this.distance;
      this.$refs.graphic.couplage.energieI = this.energieI;
      this.setCouplage(this.$refs.graphic.couplage);

      if(!keep) this.selectedKnowAtome = null;

      this.$refs.calculs.calcul();

      this.$refs.graphic.drawBgDots();
      this.$refs.graphic.reDraw();
    },
    changeAtome() {
      if(this.selectedKnowAtome.polarisabilite !='--') this.valeur = this.selectedKnowAtome.polarisabilite;
      else this.valeur = 0;
      if(this.selectedKnowAtome.energieIonisation != '--') this.energieI = this.selectedKnowAtome.energieIonisation;
      else this.energieI = 0;

      this.$refs.graphic.couplage.type = this.type;
      this.$refs.graphic.couplage.valeur = this.valeur;
      this.$refs.graphic.couplage.distance = this.distance;
      this.$refs.graphic.couplage.energieI = this.energieI;
      this.setCouplage(this.$refs.graphic.couplage);
      this.$refs.calculs.calcul();
    },
    cancel() {
      if(!this.valide) {
        this.$router.push('/');
        this.$refs.calculs.selectedCalcul = 0;
        this.$refs.calculs.calcul();

        this.$refs.graphic.drawBgDots();
        this.$refs.graphic.reDraw();
      }
    },
  },

  mounted() {
    this.setMol(-1);

    if(this.getListeAtoms().length == 0) this.modalShow= true;
    else if(this.getListeAtoms().length == 1) {
      if(this.getListeAtoms()[0].atomData.masseAtomique==0) this.modalShow=true;
      else {
        this.getListeAtoms()[0].atomData.etatDeCharge = 0;

        this.energieI1 = this.getListeAtoms()[0].atomData.energieIonisation;
        this.pol1 = this.getListeAtoms()[0].atomData.polarisabilite;
        this.dip1 = 0;
      }
    }
    else if(this.getListeAtoms().length == 2) {
      var a1 = this.getListeAtoms()[0].atomData.symbole;
      var a2 = this.getListeAtoms()[1].atomData.symbole;
      if(a1 == 'H' && a2 == 'H') this.setMol(this.getMolsCouplage()[0]);
      else if(a1 == 'O' && a2 == 'O') this.setMol(this.getMolsCouplage()[1]);
      else if(a1 == 'N' && a2 == 'N') this.setMol(this.getMolsCouplage()[2]);
      else if((a1 == 'H' && a2 == 'Cl')||(a1 == 'Cl' && a2 == 'H')) this.setMol(this.getMolsCouplage()[5]);
      else if((a1 == 'H' && a2 == 'I')||(a1 == 'I' && a2 == 'H')) this.setMol(this.getMolsCouplage()[6]);
      else this.modalShow= true;
    }


    this.$refs.graphic.modal = this.modalShow;
    this.valide = !this.modalShow;

    this.molsCouplage = this.getMolsCouplage();
    this.mol = this.molsCouplage[0];
    window.addEventListener('resize', this.reSize);
    this.reSize();
  },
  created() {
    this.AtomsData = this.getAtomsDataPerso().concat(this.getAtomsData());
    this.AtomsData.forEach(element => {
      element.Affichage = element.nom +' ('+element.nomComplet+')';
    });

    if(this.getCouplage() != null) {
      this.selected = true;
      this.type = this.getCouplage().type;
      this.valeur = this.getCouplage().valeur;
      this.distance = this.getCouplage().distance;
      this.energieI = this.getCouplage().energieI;
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