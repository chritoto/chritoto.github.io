<template>
    <div class="calculs">
        <h3>Boite de calculs</h3>
        <select id="Atom" v-model="selectedCalcul" v-on:change="calcul">
            <option value=0>Aucun</option>
            <option value=1>Rayon</option>
            <option value=2>Énergie</option>
        </select> <p/>
        <VueMathjax :formula="formula"></VueMathjax>
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
    data() {
        return {
            selectedCalcul:0,
            formula: '',
        }
    },
    methods: {
        ... mapGetters(['getListeAtoms','getModeBohr','getBohrActive','getEtatsBohr']),
        ... mapMutations(['setPhoton']),
        calcul() {
            var photon = 0;

            var etat1 = this.getEtatsBohr()[0];
            var etat2 = this.getEtatsBohr()[1];
            if(etat1==7)etat1 = '∞';
            if(etat2==7)etat2 = '∞';


            if(!this.getBohrActive()){
                this.formula = '';
            }
            else{
                var value = 0;
                var exp = 0;
                if(this.selectedCalcul==0) {
                    this.formula = '';
                }
                if(this.selectedCalcul==1) { //Rayon
                     //Unique
                    this.formula = '$$r_{n,z} = \\frac{\\color{red}{n^2}*\\color{blue}{a_0}}{\\color{green}{Z}}$$';
                    this.formula += "$$$$";
                    this.formula += "$$r_{"+etat1+","+this.getListeAtoms()[0].atomData.nombreAtomique+"} = \\frac{\\color{red}{"+etat1+"^2}*\\color{blue}{53*10^{-12}\\text{ m}}}{\\color{green}{"+this.getListeAtoms()[0].atomData.nombreAtomique+"}}$$";
                    value = (Math.pow(this.getEtatsBohr()[0],2)*53*Math.pow(10,-12)/this.getListeAtoms()[0].atomData.nombreAtomique);
                    exp = value.toExponential(3).split('e');
                    this.formula += "$$$$";
                    this.formula += '$$r_{'+etat1+','+this.getListeAtoms()[0].atomData.nombreAtomique+'}=';
                    if(this.getEtatsBohr()[0] !=7 ) this.formula += exp[0] + '*10^{' + exp[1] + '}\\text{ m}$$';
                    else this.formula += '∞\\text{ m}$$';
                    this.formula += "$$$$";
                    
                    if(this.getModeBohr()) { //Transition
                        this.formula += "$$r_{"+etat2+","+this.getListeAtoms()[0].atomData.nombreAtomique+"} = \\frac{\\color{red}{"+etat2+"^2}*\\color{blue}{53*10^{-12}\\text{ m}}}{\\color{green}{"+this.getListeAtoms()[0].atomData.nombreAtomique+"}}$$";
                        value = (Math.pow(this.getEtatsBohr()[1],2)*53*Math.pow(10,-12)/this.getListeAtoms()[0].atomData.nombreAtomique);
                        exp = value.toExponential(3).split('e');
                        this.formula += "$$$$";
                        if(this.getEtatsBohr()[1]!=7) this.formula += '$$r_{'+etat2+','+this.getListeAtoms()[0].atomData.nombreAtomique+'}=' + exp[0] + '*10^{' + exp[1] + '}\\text{ m}$$';
                        else this.formula += '$$r_{'+etat1+','+this.getListeAtoms()[0].atomData.nombreAtomique+'}=∞\\text{ m}$$';
                        this.formula += "$$$$";
                    }
                }
                if(this.selectedCalcul==2) { //Energie
                     //Unique
                    this.formula = '$$E_{n} = \\frac{\\color{red}{-k}*\\color{blue}{e^2}}{\\color{green}{2a_0}}*\\frac{\\color{orange}{Z^2}}{\\color{purple}{n^2}}$$';
                    this.formula += "$$$$";
                    this.formula += '$$E_{'+etat1+'} = \\frac{\\color{red}{-9*10^9\\text{ }Jm/C^2}*\\color{blue}{(1.602*10^{-19}\\text{ }C)^2}}{\\color{green}{2 * 53*10^{-12}\\text{ m}}}*\\frac{\\color{orange}{'+this.getListeAtoms()[0].atomData.nombreAtomique+'^2}}{\\color{purple}{'+etat1+'^2}}$$';
                    this.formula += "$$$$";
                    value = (-9*Math.pow(10,9)*Math.pow(1.602*Math.pow(10,-19),2))/(2*53*Math.pow(10,-12))*(Math.pow(this.getListeAtoms()[0].atomData.nombreAtomique,2)/Math.pow(this.getEtatsBohr()[0],2));
                    exp = value.toExponential(3).split('e');
                    if(this.getEtatsBohr()[0]!=7)this.formula += '$$E_{'+etat1+'}=' + exp[0] + '*10^{' + exp[1] + '}\\text{ J}$$';
                    else this.formula += '$$E_{'+etat1+'}=0\\text{ J}$$'
                    this.formula += "$$$$";
                    
                    if(this.getModeBohr()) { //Transition
                        this.formula += '$$E_{'+etat2+'} = \\frac{\\color{red}{-9*10^9\\text{ }Jm/C^2}*\\color{blue}{(1.602*10^{-19}\\text{ }C)^2}}{\\color{green}{2 * 53*10^{-12}\\text{ m}}}*\\frac{\\color{orange}{'+this.getListeAtoms()[0].atomData.nombreAtomique+'^2}}{\\color{purple}{'+etat2+'^2}}$$';
                        this.formula += "$$$$";
                        var value2 = (-9*Math.pow(10,9)*Math.pow(1.602*Math.pow(10,-19),2))/(2*53*Math.pow(10,-12))*(Math.pow(this.getListeAtoms()[0].atomData.nombreAtomique,2)/Math.pow(this.getEtatsBohr()[1],2));
                        var exp2 = value2.toExponential(3).split('e');
                        if(this.getEtatsBohr()[1]!=7)this.formula += '$$E_{'+etat2+'}=' + exp2[0] + '*10^{' + exp2[1] + '}\\text{ J}$$';
                        else this.formula += '$$E_{'+etat1+'}=0\\text{ J}$$'
                        this.formula += "$$$$";
                        this.formula += '$$E_{total} = E_{'+etat2+'}- E_{'+etat1+'}$$';
                        this.formula += "$$$$";
                        this.formula += '$$E_{total} =';
                        if(this.getEtatsBohr()[1]!=7) this.formula += '' + exp2[0] + '*10^{' + exp2[1] + '}\\text{ J}-';
                        else {this.formula += '0\\text{ J}-';value2 = 0;}
                        if(this.getEtatsBohr()[0]!=7) this.formula += '' + exp[0] + '*10^{' + exp[1] + '}\\text{ J}$$';
                        else {this.formula += '0\\text{ J}$$';value = 0;}
                        this.formula += "$$$$";
                        value = value2 - value;
                        exp = value.toExponential(3).split('e');
                        this.formula += '$$E_{total}=' + exp[0] + '*10^{' + exp[1] + '}\\text{ J}$$';
                        this.formula += "$$$$";
                        if(value < 0) photon = 1;
                        if(value > 0) photon = -1;
                    }
                }
            }
            this.setPhoton(photon);
            this.$emit('redraw');
        },
    }
};
</script>

<style scoped>

.size {
    font-size: 4em;
}
</style>
