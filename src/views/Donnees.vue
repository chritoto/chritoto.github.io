<template>
  <div class="donnees">
          <download-csv
          class   = "buttonc"
          :data   = "Atoms"
          name    = "DonnéesAtomiques.csv">
      
          Télécharger CSV
      
      </download-csv>
      <b-input-group size="sm">
        <b-form-input type="text" v-model="keyword"  placeholder="Recherche" class="search"> </b-form-input>
        <b-btn :disabled="!keyword" variant="link" size="sm" @click="keyword = ''"><i class="fa fa-remove"></i></b-btn>
      </b-input-group>
    <b-table striped :items="Atoms" :fields="fields" :keyword="keyword">
      <template v-slot:cell(nom)="data">
        <!-- `data.value` is the value after formatted by the Formatter -->
        <div v-bind:class="{ poop: highlight[data] }" v-on:click="highlight[data] = true">{{ data.value }}</div>
      </template>
    </b-table>
  </div>
</template>

<script>
import {mapGetters} from 'vuex';

  export default {
    name: 'Donnees',
    data() {
      return {
          highlight: [],
          keyword: '',
          nom: 'Co',
            nomComplet: 'Cobalt',
            nombreAtomique: 27,
            masseAtomique: 58.9332,
            rayonIonique: 0.074,
            rayonCovalent: 126,
            nombreDeMasse: 59,
            nombreDeNeutrons: 0,
            electronegativite: 1.9,
            energieIonisation: 760.4,
            electronsValence: 2,
        fields: [
          {
            key: 'nom',
            label: 'Symbole',
            sortable: true
          },
          {
            key: 'nomComplet',
            label: 'Nom',
            sortable: true
          },
          {
            key: 'nombreAtomique',
            label: 'Nombre Atomique',
            sortable: true
          },
          {
            key: 'masseAtomique',
            label: 'Masse Atomique [g/mol]',
            sortable: true
          },
          {
            key: 'rayonIonique',
            label: 'Rayon Ionique [nm]',
            sortable: true
          },
          {
            key: 'rayonCovalent',
            label: 'Rayon Covalent [pm]',
            sortable: true
          },
          {
            key: 'nombreDeMasse',
            label: 'Nombre de Masse',
            sortable: true
          },
          {
            key: 'nombreDeNeutrons',
            label: 'Nombre de Neutrons (isotopes plus abondants)',
            sortable: true
          },
          {
            key: 'electronegativite',
            label: 'Électronégativité',
            sortable: true
          },
          {
            key: 'energieIonisation',
            label: 'Première Énergie Ionisation [kJ/mol]',
            sortable: true,
          },
          {
            key: 'electronsValence',
            label: 'Électrons de Valence',
            sortable: true,
          },
          {
            key: 'polarisabilite',
            label: 'Polarisabilité (x10\u207B\u00B3\u2070) [m\u00B3]',
            sortable: true,
          },
        ],
        atoms: null,
      }
    },
    methods: {
        ... mapGetters(['getAtomsData','getAtomsDataPerso', 'getListeAtoms', 'getListeLiaisons']),
    },
    mounted() {
        this.atoms = this.getAtomsDataPerso().concat(this.getAtomsData());
    },
    computed: {
        Atoms () {
            return this.keyword
                ? this.atoms.filter(atom => 
                atom.nom.toLowerCase().includes(this.keyword.toLowerCase()) || atom.nomComplet.toLowerCase().includes(this.keyword.toLowerCase()))
                : this.atoms
        }
    }
  }
</script>

<style scoped>
    .donnees {
        height:  calc(100vh - 90px);
        overflow: auto;
    }
    .search {
        width: calc(100vw - 100px);
        padding-top: 30px;
    }
    .buttonc {
      padding-top: 5px;
      height: 30px;
      color: var(--Color-1);
      font-weight: bold;
      background-color: var(--Color-2);
      cursor: pointer;
    }
    .buttonc:hover {
      opacity: 0.7;
    }
</style>