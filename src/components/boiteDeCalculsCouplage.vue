<template>
    <div class="calculs">
        <h3>Boite de calculs</h3>
        <select id="Atom" v-model="selectedCalcul" v-on:change="calcul">
            <option value=0>Aucun</option>
            <option value=1>Énergie</option>
        </select> <p/>
        <VueMathjax v-bind:class="{ size: selectedCalcul==3 }" :formula="formula"></VueMathjax>
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
            liaison: 0,
            atoms: null,
        }
    },
    methods: {
        ... mapGetters(['getAtomsData', 'getListeAtoms', 'getListeLiaisons','getCouplage','getMol','getMolsCouplage']),
        ... mapMutations(['setRecompute', 'updateLiaison']),

        calcul() {
            var value;
            var exp;
            var polarisibilite;
            if(this.selectedCalcul==0) {
                this.formula = '';
            }
            if(this.selectedCalcul == 1){
                if(this.getCouplage().type==0) { //charge
                    if(this.getMol() != -1 && this.getMol().u != 0) { //eqn A2
                        this.formula = '$$U_{\\mu_1^* q_2} = \\frac{-2*k_c*\\color{red}{q_2}*(\\color{blue}{\\mu_{1,initial}}+\\frac{kc*\\color{purple}{\\alpha_1}*\\color{red}{q_2}}{\\color{green}{r^2}})}{\\color{green}{r^2}}$$';
                        this.formula += "$$$$";
                        this.formula += '$$U_{\\mu_1^* q_2} = \\frac{-2*9*10^{9}\\text{ }Jm/C^2*\\color{red}{'+this.getCouplage().valeur+'*1.602*10^{-19}\\text{ C}}*(\\color{blue}{('+this.getMol().u+'+\\text{ D})/(3*10^{29})\\text{ Cm}}+\\frac{9*10^{9}\\text{ }Jm/C^2*\\color{purple}{('+this.getMol().alpha+'*10^{-30}/(9*10^9))\\text{ } C^2m^2/J}*\\color{red}{'+this.getCouplage().valeur+'*1.602*10^{-19}\\text{ C}}}{\\color{green}{('+this.getCouplage().distance+'*10^-9\\text{ }m)^2}})}{\\color{green}{('+this.getCouplage().distance+'*10^-9\\text{ }m)^2}}$$';
                        this.formula += "$$$$";
                        value = (-2*9*Math.pow(10,9)*this.getCouplage().valeur*1.602*Math.pow(10,-19)*(this.getMol().u/(3*Math.pow(10,29))+(9*Math.pow(10,9)*this.getMol().alpha*Math.pow(10,-30)/(9*Math.pow(10,9))*this.getCouplage().valeur*1.602*Math.pow(10,-19))/Math.pow(this.getCouplage().distance*Math.pow(10,-9),2)))/(Math.pow(this.getCouplage().distance*Math.pow(10,-9),2));
                        exp = value.toExponential(3).split('e');
                        this.formula += '$$U_{\\mu_1^* q_2}=' + exp[0] + '*10^{' + exp[1] + '}\\text{ J}$$';
                        this.formula += "$$$$";
                    }
                    else { //eqn A1
                        if(this.getMol() != -1) polarisibilite=this.getMol().alpha;
                        else polarisibilite = this.getListeAtoms()[0].atomData.polarisabilite;
                        this.formula = '$$U_{\\mu_1^* q_2} = \\frac{-2*k_c*\\color{red}{q_2^2}*\\color{purple}{\\alpha_1}}{\\color{green}{r^4}}$$';
                        this.formula += "$$$$";
                        this.formula += '$$U_{\\mu_1^* q_2} = \\frac{-2*9*10^{9}\\text{ }Jm/C^2*\\color{red}{{'+this.getCouplage().valeur+'*1.602*10^{-19}\\text{ C}}^2}*\\color{purple}{('+polarisibilite+'*10^{-30}/(9*10^9))\\text{ } m^3}}{\\color{green}{('+this.getCouplage().distance+'*10^-9\\text{ }m)^4}}$$';
                        this.formula += "$$$$";
                        value = (-2*9*Math.pow(10,9)*Math.pow(this.getCouplage().valeur*1.602*Math.pow(10,-19),2)*polarisibilite*Math.pow(10,-30)/(9*Math.pow(10,9)))/(Math.pow(this.getCouplage().distance*Math.pow(10,-9),4));
                        exp = value.toExponential(3).split('e');
                        this.formula += '$$U_{\\mu_1^* q_2}=' + exp[0] + '*10^{' + exp[1] + '}\\text{ J}$$';
                        this.formula += "$$$$";
                    }
                }
                if(this.getCouplage().type==1) { //alpha
                    if(!(this.getMol() != -1 && this.getMol().u != 0)) { //eqn C
                        var energieI;
                        if(this.getMol() != -1) {polarisibilite=this.getMol().alpha; energieI = this.getMol().energieI;}
                        else {polarisibilite = this.getListeAtoms()[0].atomData.polarisabilite; energieI = this.getListeAtoms()[0].atomData.energieIonisation;}
                        this.formula = '$$U_{\\mu_1^* \\mu_2^*} = \\color{red}{\\frac{1}{r^6}}*\\frac{2}{3}*(\\color{green}{\\alpha_1\\prime})*(\\color{blue}{\\alpha_2\\prime})*\\color{purple}{k_c^2}*\\frac{\\color{brown}{I_1}*\\color{orange}{I_2}}{\\color{brown}{I_1}+\\color{orange}{I_2}}$$';
                        this.formula += "$$$$";
                        this.formula += '$$U_{\\mu_1^* \\mu_2^*} = \\color{red}{\\frac{1}{('+this.getCouplage().distance+'*10^-9\\text{ m})^6}}*\\frac{2}{3}*(\\color{green}{'+polarisibilite+'*10^{-30}\\text{ }m^3})*(\\color{blue}{'+this.getCouplage().valeur+'*10^{-30}\\text{ }m^3})*\\color{purple}{(9*10^{9})^2}*\\frac{\\color{brown}{'+energieI+'\\text{ }kJ/mol*\\frac{1000J/kJ}{6.022*10^{23}mol}}*\\color{orange}{'+this.getCouplage().energieI+'\\text{ }kJ/mol*\\frac{1000J/kJ}{6.022*10^{23}mol}}}{\\color{brown}{'+energieI+'\\text{ }kJ/mol*\\frac{1000J/kJ}{6.022*10^{23}mol}}+\\color{orange}{'+this.getCouplage().energieI+'\\text{ }kJ/mol*\\frac{1000J/kJ}{6.022*10^{23}mol}}}$$';
                        this.formula += "$$$$";
                        var toJ = 1000/(6.022*Math.pow(10,23));
                        value = 1/Math.pow(this.getCouplage().distance*Math.pow(10,-9),6)*(2/3)*(polarisibilite*Math.pow(10,-30))*(this.getCouplage().valeur*Math.pow(10,-30))*Math.pow(9*Math.pow(10,9),2)*((energieI*toJ*this.getCouplage().energieI*toJ)/(energieI*toJ+this.getCouplage().energieI*toJ));
                        exp = value.toExponential(3).split('e');
                        this.formula += '$$U_{\\mu_1^* \\mu_2^*}=' + exp[0] + '*10^{' + exp[1] + '}\\text{ J}$$';
                        this.formula += "$$$$";
                    }
                }
                if(this.getCouplage().type==2) { //dipole
                    if(this.getMol() != -1 && this.getMol().u != 0) { //eqn B2
                        this.formula = '$$U_{\\mu_1^* \\mu_2} = \\frac{-2*k_c*\\color{red}{\\mu_2}*(\\color{blue}{\\mu_{1,initial}}+\\frac{2*k_c*\\color{purple}{\\alpha_1}*\\color{red}{\\mu_2}}{\\color{green}{r^3}})}{\\color{green}{r^3}}$$';
                        this.formula += "$$$$";
                        this.formula += '$$U_{\\mu_1^* \\mu_2} = \\frac{-2*9*10^{9}\\text{ }Jm/C^2*\\color{red}{('+this.getCouplage().valeur+'\\text{ D})/(3*10^{29})\\text{ Cm}}*(\\color{blue}{('+this.getMol().u+'\\text{ D})/(3*10^{29})\\text{ Cm}}+\\frac{2*9*10^{9}\\text{ }Jm/C^2*\\color{purple}{('+this.getMol().alpha+'*10^{-30}/(9*10^9))\\text{ } m^3}*\\color{red}{('+this.getCouplage().valeur+'\\text{ D})/(3*10^{29})\\text{ Cm}}}{\\color{green}{('+this.getCouplage().distance+'*10^{-9}\\text{ }m)^3}})}{\\color{green}{('+this.getCouplage().distance+'*10^{-9}\\text{ }m)^3}}$$';
                        this.formula += "$$$$";
                        value = (-2*9*Math.pow(10,9)*this.getCouplage().valeur/(3*Math.pow(10,29))*(this.getMol().u/(3*Math.pow(10,29))+(2*9*Math.pow(10,9)*(this.getMol().alpha*Math.pow(10,-30)/(9*Math.pow(10,9)))*this.getCouplage().valeur/(3*Math.pow(10,29)))/Math.pow(this.getCouplage().distance*Math.pow(10,-9),3)))/(Math.pow(this.getCouplage().distance*Math.pow(10,-9),3));
                        exp = value.toExponential(3).split('e');
                        this.formula += '$$U_{\\mu_1^* \\mu_2}=' + exp[0] + '*10^{' + exp[1] + '}\\text{ J}$$';
                        this.formula += "$$$$";
                    }
                    else { //eqn B1
                        if(this.getMol() != -1) polarisibilite=this.getMol().alpha;
                        else polarisibilite = this.getListeAtoms()[0].atomData.polarisabilite;
                        this.formula = '$$U_{\\mu_1^* \\mu_2} = \\frac{-4*k_c^2*\\color{red}{\\mu_2^2}*\\color{purple}{\\alpha_1}}{\\color{green}{r^6}}$$';
                        this.formula += "$$$$";
                        this.formula += '$$U_{\\mu_1^* \\mu_2} = \\frac{-4*(9*10^{9})^2\\text{ }Jm/C^2*\\color{red}{{('+this.getCouplage().valeur+'\\text{ D}/(3*10^{29})\\text{ Cm}})^2}*\\color{purple}{('+polarisibilite+'*10^{-30}/(9*10^9))\\text{ } m^3}}{\\color{green}{('+this.getCouplage().distance+'*10^{-9}\\text{ }m)^6}}$$';
                        this.formula += "$$$$";
                        value = (-4*Math.pow(9*Math.pow(10,9),2)*Math.pow(this.getCouplage().valeur/(3*Math.pow(10,29)),2)*(polarisibilite*Math.pow(10,-30)/(9*Math.pow(10,9))))/Math.pow(this.getCouplage().distance*Math.pow(10,-9),6);
                        exp = value.toExponential(3).split('e');
                        this.formula += '$$U_{\\mu_1^* \\mu_2}=' + exp[0] + '*10^{' + exp[1] + '}\\text{ J}$$';
                        this.formula += "$$$$";
                    }
                }
            }
        }
    }
};
</script>

<style scoped>

.size {
    font-size: 4em;
}
</style>