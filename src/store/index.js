import Vue from 'vue'
import Vuex from 'vuex'
import AtomsData from './modules/AtomsData'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    listeAtoms: [],
    listeLiaisons: [],
    listePertu: [],
    reCompute: false,
    force: null,
    forces: [],
    equilibre: true,
    closeLink: false,
    linkValid: false,
    newEquilibre: null,
    modeBohr: false,
    bohrActive:false,
    etatsBohr: [1,1],
    photon: 0,
    couplage: null,
    computeConcept: false,
    mol: -1,
    molsCouplage: [
      {
        nom: 'H2',
        energieI: 1488,
        alpha: 0.819,
        u: 0,
      },
      {
        nom: 'O2',
        energieI: 1167.5,
        alpha: 1.9,
        u: 0,
      },
      {
        nom: 'N2',
        energieI: 1505,
        alpha: 1.74,
        u: 0,
      },
      {
        nom: 'C6H6',
        energieI: 892.5,
        alpha: 10.4,
        u: 0,
      },
      {
        nom: 'H2O',
        energieI: 1220.5,
        alpha: 1.48,
        u: 1.85,
      },
      {
        nom: 'HCl',
        energieI: 1230.2,
        alpha: 2.63,
        u: 1.08,
      },
      {
        nom: 'HI',
        energieI: 1002.5,
        alpha: 5.45,
        u: 0.42,
      },
    ]
  },
  mutations: {
    addListeAtoms(state,payload) {
      state.listeAtoms.push(payload);
    },
    updateAtom(state, payload){
      state.listeAtoms[payload.index] = payload.atom;
    },
    removeAtom(state,payload) {
      state.listeAtoms.splice(payload,1);
    },
    addListeLiaisons(state, payload) {
      state.listeLiaisons.push(payload);
    },
    updateLiaison(state, payload) {
      state.listeLiaisons[payload.index] = payload.liaison;
    },
    removeLiaison(state, payload) {
      state.listeLiaisons.splice(payload,1);
    },
    setRecompute(state, payload) {
      state.reCompute = payload;
    },
    addListePertu(state, payload) {
      state.listePertu.push(payload);
    },
    updatePertu(state, payload){
      state.listePertu[payload.index] = payload.pertu;
    },
    removePertu(state,payload) {
      state.listePertu.splice(payload,1);
    },
    setForce(state, payload) {
      state.force = payload;
    },
    setForces(state, payload) {
      state.forces = payload;
    },
    setEquilibre(state, payload){
      state.equilibre = payload;
    },
    setCloseLink(state, payload){
      state.closeLink = payload;
    },
    setLinkValid(state, payload) {
      state.linkValid = payload;
    },
    setNewEquilibre(state, payload) {
      state.newEquilibre = payload;
    },
    setModeBohr(state, payload) {
      state.modeBohr = payload;
    },
    setBohrActive(state,payload) {
      state.bohrActive = payload;
    },
    setEtatsBohr(state,payload) {
      state.etatsBohr = payload;
    },
    setPhoton(state,payload) {
      state.photon = payload;
    },
    setCouplage(state,payload) {
      state.couplage = payload;
    },
    setMol(state, payload) {
      state.mol = payload;
    },
    setComputeConcept(state, payload) {
      state.computeConcept = payload;
    }
  },
  actions: {
  },
  getters: {
    getListeAtoms: (state)=>state.listeAtoms,
    getListeLiaisons: (state)=>state.listeLiaisons,
    getRecompute: (state)=>state.reCompute,
    getListePertu: (state)=>state.listePertu,
    getForce: (state)=>state.force,
    getForces: (state)=>state.forces,
    getEquilibree: (state)=>state.equilibre,
    getCloseLink: (state)=>state.closeLink,
    getLinkValid: (state)=>state.linkValid,
    getNewEquilibre: (state)=>state.newEquilibre,
    getModeBohr: (state)=>state.modeBohr,
    getBohrActive: (state)=>state.bohrActive,
    getEtatsBohr: (state)=>state.etatsBohr,
    getPhoton: (state)=>state.photon,
    getMolsCouplage: (state)=>state.molsCouplage,
    getCouplage: (state)=>state.couplage,
    getMol: (state)=>state.mol,
    getComputeConcept: (state)=>state.computeConcept,
  },
  modules: {
    AtomsData,
  }
})
