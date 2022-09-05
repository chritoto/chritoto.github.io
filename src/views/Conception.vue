<template>
  <div class="Conception">
    <div class="charge" v-bind:style="{ left: leftCharge + 'px', top: topCharge + 'px' }" v-if="displayCharge">
      <form>
        <p>État de charge: </p>
        <input @input="chargeChange" style="width:40px"  type="number" :max="nombreAtomique" v-model.number="charge">
      </form> </div>
    <b-button class="equilibre" v-if="!equilibre" v-on:click="equilibrer" variant="danger">Réinisialiser Molécule</b-button>
    <b-button class="equilibre" disabled v-if="equilibre" v-on:click="equilibrer" variant="success">Équilibrée</b-button>

    <multipane class="vertical-panes" layout="vertical">
      <div class="vpane" :style="{ minWidth: '20%', width: '70%', maxWidth: '80%'}">
          <GraphicViewConception ref="graphic" v-on:newAtom="newAtom" v-on:selectedAtom='selectAtom' v-on:selectedLien="selectLien"  v-on:unSelect='unSelect' v-on:Charge='chargeClick'  v-on:hideDisplay="hideDisplay"/>
      </div>
      <multipane-resizer></multipane-resizer>
      <div class="vpane" :style="{ minWidth: '20%', width: '30%', maxWidth: '80%', flexGrow: 1 }">
        <div>
          <multipane class="horizontal-panes" layout="horizontal">
            <div class="hpane" :style="{ minHeight: 'calc(0.2*(100vh - 90px))', height: 'calc(0.6*(100vh - 90px))', maxHeight: 'calc(0.8*(100vh - 90px))' }">
              <div>
                <h3>Paramètres</h3>
                
                <form v-if="displayParamAtome">
                  <h4>Propriétés atome</h4>
                  <b-btn v-b-modal.modal-1 v-on:click="resetNouv">Nouvel Atome</b-btn> <p/>
                  <span>Atome: </span> 
                  <v-select @input="changeAtome" v-model="selectedKnowAtome" label="Affichage" :options="AtomsData" :components="{Deselect}" v-bind:class="{danger:!selectedKnowAtome}"></v-select> <p/>
                  <span>Nombre Atomique(z): </span><input disabled type="number" v-model.number="nombreAtomique"> <p/>
                  <span>Masse Atomique: </span><input disabled type="number" step="0.01" v-model.number="masseAtomique"> g/mol <p/>
                  <div v-bind:class="{ unused: link==1 }"> <span>Rayon ionique: </span><input disabled type="number" step="0.01" v-model.number="rayonIonique"> nm<p/> </div>
                   <div v-bind:class="{ unused: link==2 }"> <span>Rayon covalent: </span><input disabled type="number" v-model.number="rayonCovalent"> pm<p/> </div>
                  <span>Nombre de masse(A): </span><input disabled type="number" v-model.number="nombreDeMasse"> <p/>
                  <span>Nombre de Neutrons(N): </span><input disabled type="number" v-model.number="nombreDeNeutrons"> <p/>
                  <span>Électronégativité: </span><input disabled type="number" step="0.1" v-model.number="electronegativite"> <p/>
                  <span>Énergie d'ionisation: </span><input disabled type="number" step="0.1" v-model.number="energieIonisation"> kJ/mol <p/>
                  <span>Électrons de valence: </span><input disabled type="number" v-model.number="electronsValence"><p/>
                  <span>Polarisabilité: </span><input disabled type="number" step="0.1" v-model.number="polarisabilite"><p/>
                  
                </form>
                <b-modal id="modal-1" title="Nouvel Atom" @ok="enregistrerAtome">
                  <form v-if="displayParamAtome">
                    <h4>Propriétés atome</h4>
                    <span>Symbole: </span><input type="text" v-model.number="symoboleNouv"> <p/>
                    <span>Nom: </span><input type="text" v-model.number="nomNouv"> <p/>
                    <span>Nombre Atomique(z): </span><input type="number" v-model.number="nombreAtomiqueNouv"> <p/>
                    <span>Masse Atomique: </span><input type="number" step="0.01" v-model.number="masseAtomiqueNouv"> g/mol <p/>
                    <span>Rayon ionique: </span><input type="number" step="0.01" v-model.number="rayonIoniqueNouv"> nm<p/>
                    <span>Rayon covalent: </span><input type="number" v-model.number="rayonCovalentNouv"> pm<p/>
                    <span>Nombre de masse(A): </span><input type="number" v-model.number="nombreDeMasseNouv"> <p/>
                    <span>Nombre de Neutrons(N): </span><input type="number" v-model.number="nombreDeNeutronsNouv"> <p/>
                    <span>Électronégativité: </span><input type="number" step="0.1" v-model.number="electronegativiteNouv"> <p/>
                    <span>Énergie d'ionisation: </span><input type="number" step="0.1" v-model.number="energieIonisationNouv"> kJ/mol <p/>
                    <span>Électrons de valence: </span><input type="number" v-model.number="electronsValenceNouv"><p/>
                    <span>Polarisabilité: </span><input type="number" v-model.number="polarisabiliteNouv"><p/>
                  </form>
                  <template v-slot:modal-footer="{ ok, cancel }">
                    <b-button size="sm" variant="danger" @click="cancel()">
                      Annuler
                    </b-button>
                    <b-button size="sm" variant="success" @click="ok()">
                      Energistrer
                    </b-button>
                  </template>
                </b-modal>
                <form v-if="displayParamLien">
                  <h4>Propriétés liaison</h4>
                  <span>type de liaison: </span>
                  <select class="pasModifier" v-model="lienType" v-on:change="lienChange">
                    <option value=0 selected disabled>non-déterminé</option>
                    <option  value=1 >Ionique</option>
                    <option :disabled="lienType==3" value=2 >Covalente polaire</option>
                    <option :disabled="lienType==2" value=3 >Covalente</option>
                  </select><p/>
                  <span>Longueur: </span> <input class="pasModifier" @input="lienChange" step="0.01"  type="number" v-model.number="lienLongueur"> nm <p/>
                  <span>Ordre de liaison: </span> <input class="pasModifier" @input="lienChange" min="0" max="3" type="number" v-model.number="lienOrdre"><p/>
                  <span>Énergie: </span> <input class="pasModifier" @input="lienChange" step="0.01" type="number" v-model.number="lienEnergie"> kJ/mol<p/>
                  <span>État de charge: </span> <input class="pasModifier" @input="lienChange" type="number" v-model.number="lienEtatDeCharge"><p/>
                  <b-btn v-on:click="newEquilibre">Fixer équilibre</b-btn> <p/>
                </form>
              </div>
            </div>
            <multipane-resizer></multipane-resizer>
            <div class="hpane" :style="{ minHeight: 'calc(0.2*(100vh - 90px))', height: 'calc(0.4*(100vh - 90px))', maxheight: 'calc(0.8*(100vh - 90px))', flexGrow: 1 }">
              <boiteDeCalculs ref="boiteCalculs" v-on:reloadGraphics="reloadGraphics" style="flexGrow: 1"></boiteDeCalculs>
            </div>
          </multipane>
        </div>
      </div>
    </multipane>
  </div>
</template>

<script>
import { Multipane, MultipaneResizer } from 'vue-multipane';
import GraphicViewConception from '../components/GraphicConception.vue';
import boiteDeCalculs from '../components/boiteDeCalculsConception.vue';

import {mapGetters,mapMutations} from 'vuex';

export default {
  name: 'Conception',
  data() {
    return{
      nom: '',
      AtomsData: null,
      selectedKnowAtome: null,
      noAtom: true,
      equilibre: true,

      masseAtomique: 0,
      nombreAtomique: 0,
      rayonIonique: 0,
      rayonCovalent: 0,
      nombreDeMasse: 0,
      nombreDeNeutrons: 0,
      electronegativite: 0,
      energieIonisation: 0,
      electronsValence: 0,
      polarisabilite: 0,

      lienType: 0,
      lienLongueur: 0,
      lienOrdre: 0,
      lienEnergie: 0,
      lienEtatDeCharge: 0,

      displayParamAtome: false,
      displayParamLien: false,
      selectedAtom: null,
      selectedLink: null,
      link: 0,

      displayCharge: false,
      leftCharge: 0,
      topCharge: 0,
      charge: 0,

      nomNouv: '',
      symoboleNouv: '',
      masseAtomiqueNouv: 0,
      nombreAtomiqueNouv: 0,
      rayonIoniqueNouv: 0,
      rayonCovalentNouv: 0,
      nombreDeMasseNouv: 0,
      nombreDeNeutronsNouv: 0,
      electronegativiteNouv: 0,
      energieIonisationNouv: 0,
      electronsValenceNouv: 0,
      polarisabiliteNouv: 0,
    }
  },

  components: {
    Multipane,
    MultipaneResizer,
    GraphicViewConception,
    boiteDeCalculs,
  },

  methods: {
    ... mapGetters(['getAtomsData','getAtomsDataPerso', 'getListeAtoms', 'getListeLiaisons','getRecompute','getEquilibree', 'getLinkValid','getNewEquilibre','getComputeConcept']),
    ... mapMutations(['addListeAtoms','updateAtom', 'addListeLiaisons','updateLiaison', 'removeLiaison','setRecompute','addAtomData','setEquilibre','setLinkValid','setNewEquilibre','setComputeConcept']),



    changeAtome() {
      this.nom = this.selectedKnowAtome.nomComplet;
      this.masseAtomique = this.selectedKnowAtome.masseAtomique;
      this.nombreAtomique = this.selectedKnowAtome.nombreAtomique;
      this.rayonIonique = this.selectedKnowAtome.rayonIonique;
      this.rayonCovalent = this.selectedKnowAtome.rayonCovalent;
      this.nombreDeMasse = this.selectedKnowAtome.nombreDeMasse;
      this.nombreDeNeutrons = this.selectedKnowAtome.nombreDeNeutrons;
      this.electronegativite = this.selectedKnowAtome.electronegativite;
      this.energieIonisation = this.selectedKnowAtome.energieIonisation;
      this.electronsValence = this.selectedKnowAtome.electronsValence;
      this.polarisabilite = this.selectedKnowAtome.polarisabilite;

      this.getListeAtoms()[0].atomData.etatDeCharge = 0;


      this.updateAtomData();
      
      if(this.electronegativite=='--' && this.getListeLiaisons().length>0) this.removeLiaison(0);
      if(this.getListeAtoms().length>1 && this.getListeLiaisons().length == 0){
        if(this.getListeAtoms()[0].atomData.electronegativite!='--' && this.getListeAtoms()[1].atomData.electronegativite!='--'){
          const liaison = {
            type: 0,
            longueur: 0,
            ordre: 1,
            energie: 0,
            etatDeCharge: 0,
          }
          this.addListeLiaisons(liaison);
          this.setRecompute(true);
        }
      }

      if(this.getListeAtoms().length>1) {
        if(this.getListeAtoms()[0].atomData.masseAtomique!=0 && this.getListeAtoms()[1].atomData.masseAtomique!=0){
          this.setLinkValid(true);
          this.$refs.graphic.linkValid = true;
        }
      }
      
      this.$refs.boiteCalculs.compute(false,false,false,false);
      this.$refs.graphic.drawBgDots();
      this.$refs.graphic.reDraw();
      this.setNewEquilibre(null);
      
    },

    newAtom(x,y) {
      this.selectedKnowAtome = null;
      const Atom = {
        position: {
          x: x,
          y: y,
          rayon: this.$refs.graphic.rayon,
        },

        atomData: {
          nom: '',
          symbole: '',
          knownAtom: 0,
          masseAtomique: 0,
          nombreAtomique: 0,
          rayonIonique: 0,
          rayonCovalent: 0,
          nombreDeMasse: 0,
          nombreDeNeutrons: 0,
          electronegativite: 0,
          energieIonisation: 0,
          electronsValence: 0,
          polarisabilite: 0,
          etatDeCharge: 0
        }
      }
      this.addListeAtoms(Atom);

      if(this.getListeAtoms().length>1){
        if(this.getListeAtoms()[0].atomData.electronegativite!='--'){
          const liaison = {
            type: 0,
            longueur: 0,
            ordre: 1,
            energie: 0,
            etatDeCharge: 0,
          }
          this.addListeLiaisons(liaison);
        }
      }
      this.selectAtom(this.getListeAtoms().length - 1);
      this.setNewEquilibre(null);

    },

    selectAtom(selectedAtom) {
      this.displayCharge = false;
      this.displayParamAtome = true;
      this.displayParamLien = false;
      
      this.selectedAtom = selectedAtom;

      const tempAtom = this.getListeAtoms()[selectedAtom];
      this.nom = tempAtom.atomData.nom;
      this.masseAtomique = tempAtom.atomData.masseAtomique;
      this.nombreAtomique = tempAtom.atomData.nombreAtomique;
      this.rayonIonique = tempAtom.atomData.rayonIonique;
      this.rayonCovalent = tempAtom.atomData.rayonCovalent;
      this.nombreDeMasse = tempAtom.atomData.nombreDeMasse;
      this.nombreDeNeutrons = tempAtom.atomData.nombreDeNeutrons;
      this.electronegativite = tempAtom.atomData.electronegativite;
      this.energieIonisation = tempAtom.atomData.energieIonisation;
      this.electronsValence = tempAtom.atomData.electronsValence;
      this.polarisabilite = tempAtom.atomData.polarisabilite;
      this.selectedKnowAtome = tempAtom.atomData.knownAtom;

      if(this.getListeLiaisons().length>0) {
        if(this.getListeLiaisons()[0].type == 1) this.link = 2;
        else if(this.getListeLiaisons()[0] > 1) this.link = 1;
        else this.link = 0;
      }
    },

    selectLien(selectedLink) {
      this.displayCharge = false;
      this.selectedLink = selectedLink;
      this.displayParamAtome = false;
      this.displayParamLien = true;

      this.lienType = this.getListeLiaisons()[selectedLink].type;
      this.lienLongueur = this.getListeLiaisons()[selectedLink].longueur;
      this.lienOrdre = this.getListeLiaisons()[selectedLink].ordre;
      this.lienEnergie = this.getListeLiaisons()[selectedLink].energie;
      this.lienEtatDeCharge = this.getListeLiaisons()[selectedLink].etatDeCharge;
    },

    unSelect() {
      this.displayCharge = false;
      this.displayParamAtome = false;
      this.displayParamLien = false;
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
        tempAtom.atomData.symbole = this.selectedKnowAtome.nom;
        tempAtom.atomData.knownAtom = this.selectedKnowAtome;
        tempAtom.atomData.nombreAtomique = this.nombreAtomique;
        tempAtom.atomData.masseAtomique = this.masseAtomique;
        tempAtom.atomData.rayonIonique = this.rayonIonique;
        tempAtom.atomData.rayonCovalent = this.rayonCovalent;
        tempAtom.atomData.nombreDeMasse = this.nombreDeMasse;
        tempAtom.atomData.nombreDeNeutrons = this.nombreDeNeutrons;
        tempAtom.atomData.electronegativite = this.electronegativite;
        tempAtom.atomData.energieIonisation = this.energieIonisation;
        tempAtom.atomData.electronsValence = this.electronsValence;
        tempAtom.atomData.polarisabilite = this.polarisabilite;

        this.updateAtom({index:this.selectedAtom, atom: tempAtom});
        if(this.getListeLiaisons().length>0)this.setRecompute(true);
      }
    },

    chargeClick(selectedAtom, left, top) {
      this.selectedAtom = selectedAtom;
      if(selectedAtom != null) {
        this.charge = this.getListeAtoms()[selectedAtom].atomData.etatDeCharge;
        this.leftCharge = left+20;
        this.topCharge = top-50;
        this.displayCharge = true;
      }
      else{
        this.displayCharge = false;
      }
    },

    
    chargeChange() {
      var tempAtom = this.getListeAtoms()[this.selectedAtom];
      tempAtom.atomData.etatDeCharge = this.charge;
      this.updateAtom({index:this.selectedAtom, atom: tempAtom});
      this.equilibre = false;
    },

    lienChange() {
      if(this.getListeLiaisons().length>this.selectedLink){
        var type = false;
        var longueur = false;
        var ordre = false;
        var energie = false;
        var charge = false;
        if(this.getListeLiaisons()[this.selectedLink].type != this.lienType) type=true;
        if(this.getListeLiaisons()[this.selectedLink].longueur != this.lienLongueur) longueur=true;
        if(this.getListeLiaisons()[this.selectedLink].ordre != this.lienOrdre) ordre=true;
        if(this.getListeLiaisons()[this.selectedLink].energie != this.lienEnergie) energie=true;
        if(this.getListeLiaisons()[this.selectedLink].etatDeCharge != this.lienEtatDeCharge) charge=true;

        this.getListeLiaisons()[this.selectedLink].type = this.lienType;
        this.getListeLiaisons()[this.selectedLink].longueur = this.lienLongueur;
        this.getListeLiaisons()[this.selectedLink].ordre = this.lienOrdre;
        this.getListeLiaisons()[this.selectedLink].energie = this.lienEnergie,
        this.getListeLiaisons()[this.selectedLink].etatDeCharge = this.lienEtatDeCharge;

        this.$refs.graphic.computeRayons();
        this.$refs.boiteCalculs.compute(type,longueur,ordre,energie,charge);
        this.equilibre = false;
        this.setEquilibre(false);
      }
    },
    hideDisplay() {
      this.displayCharge = false;
      this.displayLien = false;
    },
    enregistrerAtome() {
      if(this.masseAtomiqueNouv==0) this.masseAtomiqueNouv = '--';
      if(this.nombreAtomiqueNouv==0) this.nombreAtomiqueNouv = '--';
      if(this.rayonIoniqueNouv==0) this.rayonIoniqueNouv = '--';
      if(this.rayonCovalentNouv==0) this.rayonCovalentNouv = '--';
      if(this.nombreDeMasseNouv==0) this.nombreDeMasseNouv= '--';
      if(this.electronegativiteNouv==0) this.electronegativiteNouv = '--';
      if(this.energieIonisationNouv==0) this.energieIonisationNouv='--';
      if(this.electronsValenceNouv == 0) this.electronsValenceNouv = '--';
      if(this.polarisabiliteNouv == 0) this.polarisabiliteNouv = '--';
      const AtomData = {
        nom: this.symoboleNouv,
        nomComplet: this.nomNouv,
        masseAtomique: this.masseAtomiqueNouv,
        nombreAtomique: this.nombreAtomiqueNouv,
        rayonIonique: this.rayonIoniqueNouv,
        rayonCovalent: this.rayonCovalentNouv,
        nombreDeMasse: this.nombreDeMasseNouv,
        nombreDeNeutrons: this.nombreDeNeutronsNouv,
        electronegativite: this.electronegativiteNouv,
        energieIonisation: this.energieIonisationNouv,
        electronsValence: this.electronsValenceNouv,
        polarisabilite: this.polarisabiliteNouv,
        _rowVariant: 'info',
      };
      this.addAtomData(AtomData);
      this.AtomsData = this.getAtomsDataPerso().concat(this.getAtomsData());
      this.AtomsData.Affichage = this.AtomsData.nom + ' (' + this.AtomsData.nomComplet + ')';
      this.selectedKnowAtome = this.getAtomsDataPerso()[this.getAtomsDataPerso().length-1];
      this.changeAtom();
    },
    resetNouv() {
        this.symoboleNouv = '';
        this.nomNouv = '';
        this.masseAtomiqueNouv = 0;
        this.nombreAtomiqueNouv = 0;
        this.rayonIoniqueNouv = 0;
        this.rayonCovalentNouv = 0;
        this.nombreDeMasseNouv = 0;
        this.nombreDeNeutronsNouv = 0;
        this.electronegativiteNouv = 0;
        this.energieIonisationNouv = 0;
        this.electronsValenceNouv = 0;
        this.polarisabiliteNouv = 0;
    },
    equilibrer() {
      var definedEquilibre = this.getNewEquilibre();
      this.equilibre = true;
      this.setEquilibre(true);
      if(definedEquilibre == null){
        this.getListeAtoms()[0].atomData.etatDeCharge = 0;
        this.$refs.boiteCalculs.compute(false,false,false,false,false);
        this.getListeLiaisons()[this.selectedLink].etatDeCharge = 0;
        this.lienEtatDeCharge = 0;
      }
      else {
        this.getListeLiaisons()[this.selectedLink].type = definedEquilibre.type;
        this.lienType = definedEquilibre.type;
        this.getListeLiaisons()[this.selectedLink].longueur = definedEquilibre.longueur;
        this.lienLongueur = definedEquilibre.longueur;
        this.getListeLiaisons()[this.selectedLink].ordre = definedEquilibre.ordre;
        this.lienOrdre = definedEquilibre.ordre;
        this.getListeLiaisons()[this.selectedLink].energie = definedEquilibre.energie;
        this.lienEnergie = definedEquilibre.energie;
        this.getListeLiaisons()[this.selectedLink].etatDeCharge = definedEquilibre.etatDeCharge;
        this.lienEtatDeCharge = definedEquilibre.etatDeCharge;
        this.$refs.boiteCalculs.compute(true,true,true,true,true);
      }
      if(this.displayParamLien){
        this.selectLien(this.selectedLink);
      }
      this.$refs.graphic.computeRayons();
      this.$refs.graphic.drawBgDots();
      this.$refs.graphic.reDraw();
    },
    newEquilibre() {
      this.equilibre = true;
      const newequilibre = {
        type: this.lienType,
        longueur: this.lienLongueur,
        ordre: this.lienOrdre,
        energie: this.lienEnergie,
        etatDeCharge: this.lienEtatDeCharge,
      }
      this.setNewEquilibre(newequilibre);
    },
    reloadGraphics() {
      this.$refs.graphic.drawBgDots();
      this.$refs.graphic.reDraw();
    },

  },
  mounted() {
    this.equilibre = this.getEquilibree();
    if(this.getComputeConcept()) {
      this.$refs.boiteCalculs.compute(false,false,false,false);
      this.setComputeConcept(false);
      this.$refs.graphic.computeRayons();
      this.$refs.graphic.drawBgDots();
      this.$refs.graphic.reDraw();
    }
  },
  created() {
    this.AtomsData = this.getAtomsDataPerso().concat(this.getAtomsData());
    this.AtomsData.forEach(element => {
      element.Affichage = element.nom +' ('+element.nomComplet+')';
    });
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
  .pasModifier {
    background-color: #ccc;
  }
  .danger {
    background-color: var(--Color-4);
  }
  .unused {
    opacity: 0.5;
  }

  .style-chooser .vs__search::placeholder,
  .style-chooser .vs__dropdown-toggle,
  .style-chooser .vs__dropdown-menu {
    background: #dfe5fb;
    border: none;
    color: #394066;
    text-transform: lowercase;
    font-variant: small-caps;
  }

  .style-chooser .vs__clear,
  .style-chooser .vs__open-indicator {
    fill: #394066;
  }
</style>