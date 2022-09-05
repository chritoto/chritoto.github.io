<template>
    <div class="calculs">
        <h3>Boite de calculs</h3>
        <select id="Atom" v-model="selectedCalcul" v-on:change="calcul">
            <option value=0>Aucun</option>
            <option value=1>Type de Liaison</option>
            <option value=2>Longueur Liaison</option>
            <option value=3>Diagramme de Lewis</option>
            <option value=4>Charges Formelles</option>
            <option value=5>Charges Partielles</option>
            <option value=6>Moment Dipolaire</option>
            <option value=7>Masse Réduite</option>
        </select> <p/>
        <VueMathjax v-bind:class="{ size2: bigFont==true, size1: bigFont==false }" :formula="formula"></VueMathjax>
    </div>
</template>


<script>
import {VueMathjax} from 'vue-mathjax';
import { mapGetters, mapMutations } from 'vuex';

export default {
    name: 'boiteDeCalculs',
    components: {
        VueMathjax,
    },
    computed: {
        reCompute () {
            return this.$store.state.reCompute
        }
    },
    watch: {
        reCompute (newvalue) {
            if(newvalue){
                this.compute(false,false,false,false,false);
                this.setRecompute(false);
            }
        }
    },
    data() {
        return {
            selectedCalcul:0,
            formula: '',
            liaison: 0,
            atoms: null,
            bigFont: false,
        }
    },
    methods: {
        ... mapGetters(['getAtomsData', 'getListeAtoms', 'getListeLiaisons']),
        ... mapMutations(['setRecompute', 'updateLiaison']),
        compute(type,longueur,ordre,energie,charge) {
            var lien = this.getListeLiaisons();
                
            if(lien.length>this.liaison){
                //Type liaison
                this.atoms = this.getListeAtoms();
                const dif = Math.abs(this.atoms[this.liaison].atomData.electronegativite-this.atoms[this.liaison+1].atomData.electronegativite);
                if(!type){
                    if(dif == 0) lien[this.liaison].type = 3
                    else if(dif < 1.7) lien[this.liaison].type=2;
                    else lien[this.liaison].type=1;
                }
                
                //Longueur
                if(!longueur){
                    if(lien[this.liaison].type==1) lien[this.liaison].longueur = this.atoms[this.liaison].atomData.rayonIonique + this.atoms[this.liaison+1].atomData.rayonIonique;
                    else lien[this.liaison].longueur = (this.atoms[this.liaison].atomData.rayonCovalent + this.atoms[this.liaison+1].atomData.rayonCovalent)/1000;
                    lien[this.liaison].longueurEquilibree = lien[this.liaison].longueur;
                }
                

                //Lewis
                if(lien[this.liaison].type != 1) {
                    var hasH = false;
                    if(this.atoms[this.liaison].atomData.nombreAtomique == 1 || this.atoms[this.liaison+1].atomData.nombreAtomique == 1) hasH = true;
                    var end = false;
                    var valence = [this.atoms[this.liaison].atomData.electronsValence, this.atoms[this.liaison+1].atomData.electronsValence];
                    var pordre = 0;
                    while(!end) {
                        pordre++;
                        valence[0] -=1;
                        valence[1] -= 1;
                        if(valence[0] < 0 || valence[1] < 0) end = true;
                        if(valence[0]+2*pordre>8 || valence[1]+2*pordre>8) end = true;
                        if(pordre>3) end = true;
                        if(pordre>1 && hasH) end = true;
                        if(ordre && pordre > lien[this.liaison].ordre) end = true;
                    }
                    valence[0]++;
                    valence[1]++;
                    pordre--;

                    end = false;
                    while(!end) {
                        pordre++;
                        valence[0] -=2;
                        if(valence[0] < 0) end = true;
                        if(valence[0]+2*pordre>8 || valence[1]+2*pordre>8) end = true;
                        if(pordre>3) end = true;
                        if(pordre>1 && hasH) end = true;
                        if(ordre && pordre > lien[this.liaison].ordre) end = true;
                    }
                    valence[0]+=2;
                    pordre--;

                    end = false;
                    while(!end) {
                        pordre++;
                        valence[1] -=2;
                        if(valence[1] < 0) end = true;
                        if(valence[0]+2*pordre>8 || valence[1]+2*pordre>8) end = true;
                        if(pordre>3) end = true;
                        if(pordre>1 && hasH) end = true;
                        if(ordre && pordre > lien[this.liaison].ordre) end = true;
                    }
                    valence[1]+=2;
                    pordre--;
                    
                    if(charge) {
                        var electrons = -lien[this.liaison].etatDeCharge;
                        
                        while(electrons < 0){//remove electrons
                            electrons++;
                            if(valence[0]>0&&valence[1]==0) valence[0]--;
                            else if(valence[0]==0&&valence[1]>0) valence[1]--;
                            else if(valence[0]>0&&valence[1]>0){
                                if(valence[0]%2==1 && valence[1]%2==0) valence[0]--;
                                else if(valence[0]%2==0 && valence[1]%2==1) valence[1]--;
                                else{
                                    if(this.atoms[0].atomData.electronegativite < this.atoms[1].atomData.electronegativite && valence[0]>0) valence[0]--;
                                    else if(valence[1]>0) valence[1]--;
                                }
                            }
                            else break;
                        }
                        while(electrons > 0) { //add electrons
                            electrons--;
                            if(valence[0]+2*pordre<8&&valence[1]+2*pordre==8) valence[0]++;
                            else if(valence[0]+2*pordre==8&&valence[1]+2*pordre<8) valence[1]++;
                            else{
                                if(valence[0]%2==1 && valence[1]%2==0) valence[0]++;
                                else if(valence[0]%2==0 && valence[1]%2==1) valence[1]++;
                                else{
                                    if(this.atoms[0].atomData.electronegativite > this.atoms[1].atomData.electronegativite && valence[0]+pordre*2<8) valence[0]++;
                                    else if(valence[1]+pordre*2<8) valence[1]++;
                                    else if(valence[0]>valence[1]) valence[1]++;
                                    else valence[0]++;
                                }
                            }
                        }
                    }

                    lien[this.liaison].ordre = pordre;
                    lien[this.liaison].valence = valence;

                    pordre = lien[this.liaison].ordre;

                    //Charges partielles
                    this.atoms[this.liaison].atomData.etatDeCharge = (this.atoms[this.liaison].atomData.electronsValence - valence[0] - (this.atoms[this.liaison].atomData.electronegativite/(this.atoms[this.liaison].atomData.electronegativite+this.atoms[this.liaison+1].atomData.electronegativite))*pordre*2);
                    this.atoms[this.liaison+1].atomData.etatDeCharge = (this.atoms[this.liaison+1].atomData.electronsValence - valence[1] - (this.atoms[this.liaison+1].atomData.electronegativite/(this.atoms[this.liaison].atomData.electronegativite+this.atoms[this.liaison+1].atomData.electronegativite))*pordre*2);
                }
                else {
                    lien[this.liaison].ordre = 0;

                    if(this.atoms[this.liaison].atomData.electronegativite>this.atoms[this.liaison+1].atomData.electronegativite) {
                        this.atoms[this.liaison].atomData.etatDeCharge = this.getListeAtoms()[this.liaison].atomData.electronsValence - 8;
                        this.atoms[this.liaison+1].atomData.etatDeCharge = this.getListeAtoms()[this.liaison+1].atomData.electronsValence;
                    }
                    else {
                        this.atoms[this.liaison+1].atomData.etatDeCharge = this.getListeAtoms()[this.liaison+1].atomData.electronsValence - 8;
                        this.atoms[this.liaison].atomData.etatDeCharge = this.getListeAtoms()[this.liaison].atomData.electronsValence;
                    }
                }
                lien[this.liaison].chargePartielle = Math.abs(this.atoms[this.liaison].atomData.etatDeCharge);
                
                lien[this.liaison].momentDipolaire = (this.getListeLiaisons()[this.liaison].chargePartielle*1.602*Math.pow(10,-19)*this.getListeLiaisons()[this.liaison].longueur*Math.pow(10,-9)*3*Math.pow(10,29))

                this.calcul();
                this.updateLiaison({index:this.liaison, liaison: lien[this.liaison]});
                this.$emit('reloadGraphics');
            }
                
        },
        calcul() {
            this.bigFont = false;
            if(this.getListeAtoms().length < 2 && this.selectedCalcul!=0) {this.formula = '$$\\text{Nécéssite deux atomes}$$';return;}
            this.atoms = this.getListeAtoms();
            if(this.selectedCalcul==0) {
                this.formula = '';
            }
            if(this.selectedCalcul==1) {
                this.formula = '$$|\\chi_1-\\chi_2|$$';
                if(this.getListeLiaisons().length > this.liaison){
                    
                    this.formula += '$$$$';
                    this.formula += '$$|' + this.atoms[this.liaison].atomData.electronegativite + '-' + this.atoms[this.liaison+1].atomData.electronegativite + '|$$';
                    this.formula += '$$$$';
                    const dif = Math.abs(this.atoms[this.liaison].atomData.electronegativite-this.atoms[this.liaison+1].atomData.electronegativite)
                    this.formula += '$$' + dif.toFixed(2);
                    if(dif == 0) this.formula += ' = 0 : \\text{Covalente}$$';
                    else if(dif < 1.7) this.formula += ' < 1.7 : \\text{Covalente polaire}$$';
                    else this.formula += ' > 1.7 : \\text{Ionique}$$';
                }
            }
            if(this.selectedCalcul==2) {
                if(this.getListeLiaisons()[this.liaison].type==1) {
                    this.formula = '$$l = \\color{red}{rayonIonique_'+this.atoms[this.liaison].atomData.symbole+'} + \\color{blue}{rayonIonique_'+this.atoms[this.liaison+1].atomData.symbole+'}$$';
                    this.formula += '$$$$';
                    this.formula += '$$l=\\color{red}{'+this.atoms[this.liaison].atomData.rayonIonique + '\\text{ nm}}+\\color{blue}{' + this.atoms[this.liaison+1].atomData.rayonIonique + '\\text{ nm}}$$';
                    this.formula += '$$l=' + this.getListeLiaisons()[this.liaison].longueur + '\\text{ nm}$$';
                }
                else {
                    this.formula = '$$l = \\color{red}{rayonCovalent_'+this.atoms[this.liaison].atomData.symbole+'} + \\color{blue}{rayonCovalent_'+this.atoms[this.liaison+1].atomData.symbole+'}$$';
                    this.formula += '$$$$';
                    this.formula += '$$l=\\color{red}{'+this.atoms[this.liaison].atomData.rayonCovalent + '\\text{ pm}}+\\color{blue}{' + this.atoms[this.liaison+1].atomData.rayonCovalent + '\\text{ pm}}$$';
                    this.formula += '$$l=' + this.getListeLiaisons()[this.liaison].longueur + '\\text{ nm}$$';
                }
            }
            if(this.selectedCalcul==3) {
                if(this.getListeLiaisons().length==0) this.formula = '';
                if(this.getListeLiaisons()[this.liaison].type == 1) this.formula = "Diagramme de Lewis ne s'applique pas aux molécules ioniques";
                else {
                    this.bigFont = true;
                    var tempValence = this.getListeLiaisons()[this.liaison].valence[0];
                    if(tempValence >= 2) {this.formula = '$$\\underset{\\bar{}}{'; tempValence -= 2;}
                    else if(tempValence >= 1) { this.formula = '$$\\underset{\\cdot{}}{'; tempValence--; }
                    else this.formula = '$$\\underset{{}}{';

                    

                    if(tempValence>1) {this.formula += '\\bar{'; tempValence-=2;}
                    else if(tempValence>=1) {this.formula += '\\dot{'; tempValence--;}
                    else this.formula += '{';

                    if(tempValence >= 2) {this.formula += '|'; tempValence -= 2;}
                    else if(tempValence >= 1) {this.formula += '\\cdot{}'; tempValence--;}

                    this.formula +=  this.atoms[this.liaison].atomData.symbole + '}}';

                    if(this.getListeLiaisons()[this.liaison].ordre==1) this.formula+= '-';
                    else if(this.getListeLiaisons()[this.liaison].ordre==2) this.formula+= '=';
                    else this.formula += '\\equiv';

                    tempValence = this.getListeLiaisons()[this.liaison].valence[1];
                    if(tempValence >= 2) {this.formula += '\\underset{\\bar{}}{'; tempValence -= 2;}
                    else if(tempValence >= 1) { this.formula += '\\underset{\\cdot{}}{'; tempValence--; }
                    else this.formula += '\\underset{{}}{';

                    if(tempValence>1) {this.formula += '\\bar{'; tempValence-=2;}
                    else if(tempValence>=1) {this.formula += '\\dot{'; tempValence--;}
                    else this.formula += '{';

                    this.formula +=  this.atoms[this.liaison+1].atomData.symbole;

                    if(tempValence >= 2) {this.formula += '|'; tempValence -= 2;}
                    else if(tempValence >= 1) {this.formula += '\\cdot{}'; tempValence--;}

                    this.formula += '}';

                    this.formula += '}$$';
                }
           }
           if(this.selectedCalcul==4) {
               if(this.getListeLiaisons()[this.liaison].type == 1) {
                   this.formula = '$$' + this.atoms[this.liaison].atomData.symbole + ': ' + this.atoms[this.liaison].atomData.etatDeCharge + '$$';
                   this.formula += '$$$$';
                   this.formula += '$$' + this.atoms[this.liaison+1].atomData.symbole + ': ' + this.atoms[this.liaison+1].atomData.etatDeCharge + '$$';
               }
               else {
                    this.formula = '$$\\text{CF}=\\color{red}{[\\text{# électrons de valences}]}-\\color{blue}{[\\text{# électrons libres}]}-\\frac{1}{2}\\color{green}{[\\text{# électrons partagés}]}$$'; 
                    this.formula += '$$$$';
                    this.formula += '$$' + this.atoms[this.liaison].atomData.symbole + ': \\color{red}{';
                    this.formula += this.atoms[this.liaison].atomData.electronsValence + '}-\\color{blue}{' + this.getListeLiaisons()[this.liaison].valence[0] + '}-\\frac{1}{2}\\color{green}{' + this.getListeLiaisons()[this.liaison].ordre * 2+'}='+ (this.atoms[this.liaison].atomData.electronsValence - this.getListeLiaisons()[this.liaison].valence[0] - this.getListeLiaisons()[this.liaison].ordre).toFixed(3) + '$$';
                    this.formula += '$$$$';
                    this.formula += '$$' + this.atoms[this.liaison+1].atomData.symbole + ': \\color{red}{';
                    this.formula += this.atoms[this.liaison+1].atomData.electronsValence + '}-\\color{blue}{' + this.getListeLiaisons()[this.liaison].valence[1] + '}-\\frac{1}{2}\\color{green}{' + this.getListeLiaisons()[this.liaison].ordre * 2+'}='+ (this.atoms[this.liaison+1].atomData.electronsValence - this.getListeLiaisons()[this.liaison].valence[1] - this.getListeLiaisons()[this.liaison].ordre).toFixed(3) + '$$';
               }
           }
           if(this.selectedCalcul==5) {
               if(this.getListeLiaisons()[this.liaison].type == 1) {
                   this.formula = '$$' + this.atoms[this.liaison].atomData.symbole + ': ' + this.atoms[this.liaison].atomData.etatDeCharge + '$$';
                   this.formula += '$$$$';
                   this.formula += '$$' + this.atoms[this.liaison+1].atomData.symbole + ': ' + this.atoms[this.liaison+1].atomData.etatDeCharge + '$$';
               }
               else {
                    this.formula = '$$\\text{CP}=\\color{red}{[\\text{# électrons de valences}]}-\\color{blue}{[\\text{# électrons libres}]}-\\frac{\\chi_x}{\\chi_x+\\chi_y}\\color{green}{[\\text{# électrons partagés}]}$$'; 
                    this.formula += '$$$$';
                    this.formula += '$$' + this.atoms[this.liaison].atomData.symbole + ': \\color{red}{';
                    this.formula += this.atoms[this.liaison].atomData.electronsValence + '}-\\color{blue}{' + this.getListeLiaisons()[this.liaison].valence[0] + '}-\\frac{'+this.atoms[this.liaison].atomData.electronegativite+'}{'+this.atoms[this.liaison].atomData.electronegativite+'+'+this.atoms[this.liaison+1].atomData.electronegativite+'}\\color{green}{' + this.getListeLiaisons()[this.liaison].ordre * 2+'}='+ (this.atoms[this.liaison].atomData.electronsValence - this.getListeLiaisons()[this.liaison].valence[0] - (this.atoms[this.liaison].atomData.electronegativite/(this.atoms[this.liaison].atomData.electronegativite+this.atoms[this.liaison+1].atomData.electronegativite))*this.getListeLiaisons()[this.liaison].ordre*2).toFixed(3) + '$$';
                    this.formula += '$$$$';
                    this.formula += '$$' + this.atoms[this.liaison+1].atomData.symbole + ': \\color{red}{';
                    this.formula += this.atoms[this.liaison+1].atomData.electronsValence + '}-\\color{blue}{' + this.getListeLiaisons()[this.liaison].valence[1] + '}-\\frac{'+this.atoms[this.liaison+1].atomData.electronegativite+'}{'+this.atoms[this.liaison].atomData.electronegativite+'+'+this.atoms[this.liaison+1].atomData.electronegativite+'}\\color{green}{' + this.getListeLiaisons()[this.liaison].ordre * 2+'}='+ (this.atoms[this.liaison+1].atomData.electronsValence - this.getListeLiaisons()[this.liaison].valence[1] - (this.atoms[this.liaison+1].atomData.electronegativite/(this.atoms[this.liaison].atomData.electronegativite+this.atoms[this.liaison+1].atomData.electronegativite))*this.getListeLiaisons()[this.liaison].ordre*2).toFixed(3) + '$$';
               }
           }
           if(this.selectedCalcul==6) { //dipole
               this.formula = '$$\\mu=\\color{red}{q}*\\color{blue}{l}$$'; 
               this.formula += '$$$$';
               this.formula += '$$\\mu=\\color{red}{' + this.getListeLiaisons()[this.liaison].chargePartielle.toFixed(3)+ '*1.602*10^{-19}\\text{ C}}*\\color{blue}{' + this.getListeLiaisons()[this.liaison].longueur+ '*10^{-9}\\text{ m}}$$';
               this.formula += '$$$$';
               var value = (this.getListeLiaisons()[this.liaison].chargePartielle*1.602*Math.pow(10,-19)*this.getListeLiaisons()[this.liaison].longueur*Math.pow(10,-9));
               var exp = value.toExponential(3).split('e');
               this.formula += '$$\\mu=' + exp[0] + '*10^{' + exp[1] + '}\\text{ Cm}$$'
               this.formula += '$$$$';
               this.formula += '$$=(' +  exp[0] + '*10^{' + exp[1] + '}\\text{ Cm})*{3*10^{29}}\\text{ D}$$';
               this.formula += '$$$$$$=' + (value*3*Math.pow(10,29)).toFixed(3) + '\\text{ D}$$';
            }
            if(this.selectedCalcul==7) { //masse reduite
                this.formula = '$$m_\\mu=\\frac{\\color{red}{m_'+this.atoms[this.liaison].atomData.symbole+'}*\\color{blue}{m_'+this.atoms[this.liaison+1].atomData.symbole+'}}{\\color{red}{m_'+this.atoms[this.liaison].atomData.symbole+'}+\\color{blue}{m_'+this.atoms[this.liaison+1].atomData.symbole+'}}$$';
                this.formula += '$$$$';
                this.formula += '$$m_\\mu=\\frac{\\color{red}{'+this.atoms[this.liaison].atomData.masseAtomique+'}*\\color{blue}{'+this.atoms[this.liaison+1].atomData.masseAtomique+'}}{\\color{red}{'+this.atoms[this.liaison].atomData.masseAtomique+'}+\\color{blue}{'+this.atoms[this.liaison+1].atomData.masseAtomique+'}}$$';
                this.formula += '$$$$';
                this.formula += '$$='+(this.atoms[this.liaison].atomData.masseAtomique*this.atoms[this.liaison+1].atomData.masseAtomique/(this.atoms[this.liaison].atomData.masseAtomique+this.atoms[this.liaison+1].atomData.masseAtomique)) + '\\text{ g/mol}$$';
            }
            this.formula += '$$$$';
            this.formula += '$$$$';
        },
    }
};
</script>

<style scoped>
.size1 {
    font-size: 1em;
}

.size2 {
    font-size: 4em;
}
</style>
