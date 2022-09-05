<template>
    <div class="calculs">
        <h3>Boite de calculs</h3>
        <select id="Atom" v-model="selectedCalcul" v-on:change="calcul">
            <option value=0>Aucun</option>
            <option value=1 :disabled="type==0">Énergie</option>
            <option value=2 :disabled="type==3||type==2">Force</option>
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
    computed: {
        reCompute () {
            return this.$store.state.reCompute
        }
    },
    watch: {
        reCompute (newvalue) {
            if(newvalue){
                this.compute();
                this.setRecompute(false);
            }
        }
    },
    data() {
        return {
            selectedCalcul:0,
            formula: '',
            type:0,
            atoms: null,
            selectedPertu: 0,
        }
    },
    methods: {
        ... mapGetters(['getAtomsData', 'getListeAtoms', 'getListeLiaisons','getListePertu','getForce']),
        ... mapMutations(['setRecompute', 'updateLiaison', 'setForce','setForces']),
        compute() {
            var pertu = this.getListePertu()[this.selectedPertu];
            this.atoms = this.getListeAtoms();

            if(pertu.pertuData.type == 0)
                if(this.atoms.length == 1)
                    pertu.pertuData.force = (pertu.pertuData.valeur * this.getListeAtoms()[0].atomData.etatDeCharge *1.602*Math.pow(10,-19));

            this.calcul();
        },
        calcul() {
            this.atoms = this.getListeAtoms();
            var pertu = this.getListePertu()[this.selectedPertu];
            var force = null;
            var forces = [];

            var value = null;
            var exp = null;
            var neg = false;

            if(this.selectedCalcul==0) {
                this.formula = '';
            }
            if(this.selectedCalcul==1) { //Energie
                if(pertu.pertuData.type == 1) { //Charge Ponctuelle
                    if(this.atoms.length == 1) { //Un atome
                        this.formula = "$$U = \\frac{\\color{red}{k_c} * \\color{blue}{q_1} * \\color{green}{q_2}}{d}$$";
                        this.formula += "$$$$";
                        this.formula += "$$U = \\frac{\\color{red}{9*10^{9}\\text{ }Jm/C^2} * \\color{blue}{"+this.atoms[0].atomData.etatDeCharge.toFixed(3)+"*1.602*10^{-19}\\text{ C}} * \\color{green}{"+pertu.pertuData.valeur+"*1.602*10^{-19}\\text{ C}}}{"+pertu.pertuData.distance+"*10^{-9}\\text{ m}}$$";
                        this.formula += "$$$$";
                        value = (9*Math.pow(10,9)*pertu.pertuData.valeur*1.602*Math.pow(10,-19)*this.atoms[0].atomData.etatDeCharge*1.602*Math.pow(10,-19))/(pertu.pertuData.distance*Math.pow(10,-9));
                        exp = value.toExponential(3).split('e');
                        this.formula += '$$U=' + exp[0] + '*10^{' + exp[1] + '}\\text{ J}$$';
                    }
                    else if (this.getListeLiaisons().length == 1) { //Molecule
                        this.formula = "$$U = \\frac{\\color{red}{k_c} * \\color{blue}{q_1} * \\color{green}{\\mu_2}}{d^2}$$";
                        
                        value = (9*Math.pow(10,9)*this.getListeLiaisons()[0].momentDipolaire/(3*Math.pow(10,29))*pertu.pertuData.valeur*1.602*Math.pow(10,-19))/(Math.pow(pertu.pertuData.distance*Math.pow(10,-9),2));

                        neg = false; //Check sign of particle/charge
                        if(Math.pow(pertu.position.x - this.getListeAtoms()[0].position.x,2)+Math.pow(pertu.position.y - this.getListeAtoms()[0].position.y,2) < Math.pow(pertu.position.x - this.getListeAtoms()[1].position.x,2)+Math.pow(pertu.position.y - this.getListeAtoms()[1].position.y,2)) { //closer to 0
                            if(value<0 && this.getListeAtoms()[0].atomData.etatDeCharge>0) neg = true;
                            if(value>0 && this.getListeAtoms()[0].atomData.etatDeCharge<0) neg = true;
                        }
                        else {
                            if(value<0 && this.getListeAtoms()[1].atomData.etatDeCharge>0) neg = true;
                            if(value>0 && this.getListeAtoms()[1].atomData.etatDeCharge<0) neg = true;
                        }

                        this.formula += "$$$$";
                        this.formula += "$$U = ";

                        

                        if(neg){
                            value = -value;
                            this.formula += '-';
                        }

                        this.formula += "\\frac{\\color{red}{9*10^{9}\\text{ }Jm/C^2} * \\color{blue}{"+pertu.pertuData.valeur+"*1.602*10^{-19}\\text{ C}} * \\color{green}{"+this.getListeLiaisons()[0].momentDipolaire.toFixed(3)+"/(3*10^{29})\\text{ Cm}}}{{("+pertu.pertuData.distance+"*10^{-9})}^2\\text{ }m^2}$$";
                        this.formula += "$$$$";

                        exp = value.toExponential(3).split('e');
                        this.formula += '$$U=' + exp[0] + '*10^{' + exp[1] + '}\\text{ J}$$';
                    }
                }
                if(pertu.pertuData.type == 2) { //Dipole
                    if(this.atoms.length == 1) { //Un atome
                        this.formula = "$$U = \\frac{\\color{red}{k_c} * \\color{blue}{q_1} * \\color{green}{\\mu_2}}{d^2}$$";
                        this.formula += "$$$$";
                        this.formula += "$$U =";

                        value = (9*Math.pow(10,9)*pertu.pertuData.valeur/(3*Math.pow(10,29))*this.atoms[0].atomData.etatDeCharge*1.602*Math.pow(10,-19))/(Math.pow(pertu.pertuData.distance*Math.pow(10,-9),2));
                        
                        neg = false; //Check sign of particle/charge
                        if(pertu.position.x-this.atoms[0].position.x>0) { //closer to 0
                            if(value<0 && this.getListeAtoms()[0].atomData.etatDeCharge>0) neg = true;
                            if(value>0 && this.getListeAtoms()[0].atomData.etatDeCharge<0) neg = true;
                        }
                        else {
                            if(value<0 && this.getListeAtoms()[0].atomData.etatDeCharge<0) neg = true;
                            if(value>0 && this.getListeAtoms()[0].atomData.etatDeCharge>0) neg = true;
                        }

                        if(neg){
                            value = -value;
                            this.formula += '-';
                        }

                        this.formula += "\\frac{\\color{red}{9*10^{9}\\text{ }Jm/C^2} * \\color{blue}{"+this.atoms[0].atomData.etatDeCharge.toFixed(3)+"*1.602*10^{-19}\\text{ C}} * \\color{green}{"+pertu.pertuData.valeur+"/(3*10^{29})\\text{ Cm}}}{{("+pertu.pertuData.distance+"*10^{-9})}^2\\text{ }m^2}$$";
                        this.formula += "$$$$";

                        exp = value.toExponential(3).split('e');
                        this.formula += '$$U=' + exp[0] + '*10^{' + exp[1] + '}\\text{ J}$$';
                    }
                    else if (this.getListeLiaisons().length == 1){ //Molecule
                        this.formula =  "$$U = \\frac{\\color{red}{k_c} * \\color{blue}{\\mu_1} * \\color{green}{\\mu_2}* \\color{orange}{(1-3*{cos}^2\\phi)}}{d^3}$$";
                        this.formula += "$$$$";
                        this.formula +=  "$$U = \\frac{\\color{red}{9*10^{9}\\text{ }Jm/C^2} * \\color{blue}{"+this.getListeLiaisons()[0].momentDipolaire.toFixed(3)+"/(3*10^{29})\\text{ Cm}} * \\color{green}{"+pertu.pertuData.valeur+"/(3*10^{29})\\text{ Cm}}* \\color{orange}{(1-3*{cos}^2("+(-pertu.pertuData.angle).toFixed(3)+"\\text{°}))}}{{("+pertu.pertuData.distance+"*10^{-9})}^3\\text{ }m^3}$$";
                        this.formula += "$$$$";

                        value = (9*Math.pow(10,9)*pertu.pertuData.valeur/(3*Math.pow(10,29))*this.getListeLiaisons()[0].momentDipolaire/(3*Math.pow(10,29)) * (1-3*Math.pow(Math.cos((-pertu.pertuData.angle)/180*Math.PI),2)))/(Math.pow(pertu.pertuData.distance*Math.pow(10,-9),3));
                        exp = value.toExponential(3).split('e');
                        this.formula += '$$U=' + exp[0] + '*10^{' + exp[1] + '}\\text{ J}$$';
                    }
                }
                if(pertu.pertuData.type == 3) { //tension electrique
                    if(this.atoms.length == 1) { //Un atome
                        this.formula = "$$U = \\color{red}{V} * \\color{blue}{q}$$";
                        this.formula += "$$$$";
                        this.formula += "$$U = \\color{red}{"+pertu.pertuData.valeur+"\\text{ V}} * \\color{blue}{"+this.atoms[0].atomData.etatDeCharge+"*1.602*10^{-19}\\text{ C}}$$";
                        this.formula += "$$$$";
                        value = (pertu.pertuData.valeur*this.atoms[0].atomData.etatDeCharge*1.602*Math.pow(10,-19));
                        exp = value.toExponential(3).split('e');
                        this.formula += '$$U=' + exp[0] + '*10^{' + exp[1] + '}\\text{ J}$$';
                    }
                    else if (this.getListeLiaisons().length == 1){ //Molecule
                        this.formula = '$$Non defini$$';
                    }
                }
            }
            if(this.selectedCalcul==2) { //Force
                if(pertu.pertuData.type == 0) { //Champ electrique
                    if(this.atoms.length == 1) { //Un atome
                        this.formula = "$$\\vec{F} = \\color{red}{\\vec{E}} * \\color{blue}{q}$$";
                        this.formula += "$$$$";
                        this.formula += "$$\\vec{F} = \\color{red}{"+pertu.pertuData.valeur+"\\text{ J/mC}} * \\color{blue}{"+this.getListeAtoms()[0].atomData.etatDeCharge.toFixed(3)+"*1.602*10^{-19}\\text{ C}}$$";
                        this.formula += '$$$$';
                        value = (pertu.pertuData.valeur * this.getListeAtoms()[0].atomData.etatDeCharge *1.602*Math.pow(10,-19));
                        exp = value.toExponential(3).split('e');
                        this.formula += '$$\\vec{F}=' + exp[0] + '*10^{' + exp[1] + '}\\text{ N}$$';

                        if(value > 0) force = {angle: pertu.pertuData.angle};
                        else force = {angle: pertu.pertuData.angle+ 180};
                    }
                    else if (this.getListeLiaisons().length == 1){ //Molecule
                        this.formula = "$$\\vec{F} = \\color{red}{\\vec{E}} * \\color{blue}{q}$$";
                        this.formula += "$$$$";
                        forces = [];
                        this.getListeAtoms().forEach(element =>{
                            this.formula += "$$\\vec{F_"+element.atomData.symbole+"} = \\color{red}{"+pertu.pertuData.valeur+"\\text{ J/mC}} * \\color{blue}{"+element.atomData.etatDeCharge.toFixed(3)+"*1.602*10^{-19}\\text{ C}}$$";
                            this.formula += "$$$$";
                            value = (pertu.pertuData.valeur * element.atomData.etatDeCharge *1.602*Math.pow(10,-19));
                            exp = value.toExponential(3).split('e');
                            this.formula += '$$\\vec{F_'+element.atomData.symbole+'}=' + exp[0] + '*10^{' + exp[1] + '}\\text{ N}$$';
                            var angle = pertu.pertuData.angle;
                            if(value > 0) forces.push({mag:value, angle: angle});
                            else forces.push({mag:value, angle: angle + 180});
                            this.formula += "$$$$";
                        });
                        this.formula += "$$\\vec{F} =  \\vec{F_"+this.getListeAtoms()[0].atomData.symbole+"}+\\vec{F_"+this.getListeAtoms()[1].atomData.symbole+"}$$";
                        this.formula += "$$$$";
                        value = forces[0].mag;
                        exp = value.toExponential(3).split('e');
                        this.formula += '$$\\vec{F} =' + exp[0] + '*10^{' + exp[1] + '}\\text{ N} +';
                        value = forces[1].mag;
                        exp = value.toExponential(3).split('e');
                        this.formula += exp[0] + '*10^{' + exp[1] + '}\\text{ N}$$;'
                        value = (forces[0].mag+forces[1].mag);
                        exp = value.toExponential(3).split('e');
                        this.formula += '$$\\vec{F}=' + exp[0] + '*10^{' + exp[1] + '}\\text{ N}$$';
                        if(Math.abs(forces[0].mag)>Math.abs(forces[1].mag)) force = {angle: forces[0].angle};
                        else force = {angle: forces[1].angle};
                    }
                }
                if(pertu.pertuData.type == 1) { //Charge ponctuelle
                    if(this.atoms.length == 1) { //Un  atome
                        this.formula = "$$F = \\frac{\\color{red}{k_c} * \\color{blue}{q_1} * \\color{green}{q_2}}{d^2}$$";
                        this.formula += "$$$$";
                        this.formula += "$$F = \\frac{\\color{red}{9*10^{9}\\text{ }Jm/C^2} * \\color{blue}{"+this.atoms[0].atomData.etatDeCharge.toFixed(3)+"*1.602*10^{-19}\\text{ C}} * \\color{green}{"+pertu.pertuData.valeur+"*1.602*10^{-19}\\text{ C}}}{{("+pertu.pertuData.distance+"*10^{-9})}^2\\text{ }m^2}$$";
                        this.formula += "$$$$";
                        value = (9*Math.pow(10,9)*pertu.pertuData.valeur*1.602*Math.pow(10,-19)*this.atoms[0].atomData.etatDeCharge*1.602*Math.pow(10,-19))/Math.pow(pertu.pertuData.distance*Math.pow(10,-9),2);
                        exp = value.toExponential(3).split('e');
                        this.formula += '$$F=' + exp[0] + '*10^{' + exp[1] + '}\\text{ N}$$';
                        var angle = Math.atan((pertu.position.y-this.getListeAtoms()[0].position.y)/(pertu.position.x-this.getListeAtoms()[0].position.x))*180/Math.PI;
                        if(pertu.position.x-this.getListeAtoms()[0].position.x<0)angle +=180;
                        if(value < 0) force = {angle: angle};
                        else force = {angle: angle + 180};
                    }
                    else if (this.getListeLiaisons().length == 1){ //Molecule
                        this.formula = "$$F = \\frac{\\color{red}{k_c} * \\color{blue}{q_1} * \\color{green}{q_2}}{d^2}$$";
                        this.formula += "$$$$";
                        forces = [];
                        this.getListeAtoms().forEach(element =>{
                            this.formula += "$$F_"+element.atomData.symbole+" = \\frac{\\color{red}{9*10^{9}\\text{ }Jm/C^2} * \\color{blue}{"+element.atomData.etatDeCharge.toFixed(3)+"*1.602*10^{-19}\\text{ C}} * \\color{green}{"+pertu.pertuData.valeur+"*1.602*10^{-19}\\text{ C}}}{{("+pertu.pertuData.distance+"*10^{-9})}^2\\text{ }m^2}$$";
                            this.formula += "$$$$";
                            value = (9*Math.pow(10,9)*pertu.pertuData.valeur*1.602*Math.pow(10,-19)*element.atomData.etatDeCharge*1.602*Math.pow(10,-19))/Math.pow(pertu.pertuData.distance*Math.pow(10,-9),2);
                            exp = value.toExponential(3).split('e');
                            this.formula += '$$F_'+element.atomData.symbole+'=' + exp[0] + '*10^{' + exp[1] + '}\\text{ N}$$';
                            var angle = Math.atan((pertu.position.y-element.position.y)/(pertu.position.x-element.position.x))*180/Math.PI;
                            if(pertu.position.x-element.position.x<0)angle +=180;
                            if(value > 0) forces.push({mag:value, angle: angle});
                            else forces.push({mag:value, angle: angle + 180});
                            this.formula += "$$$$";
                        });
                        this.formula += "$$F =  \\vec{F_"+this.getListeAtoms()[0].atomData.symbole+"}+\\vec{F_"+this.getListeAtoms()[1].atomData.symbole+"}$$";
                        this.formula += "$$$$";
                        value = (forces[0].mag+forces[1].mag);
                        exp = value.toExponential(3).split('e');
                        this.formula += '$$F=' + exp[0] + '*10^{' + exp[1] + '}\\text{ N}$$';
                        if(Math.abs(forces[0].mag)>Math.abs(forces[1].mag)) force = {angle: forces[0].angle};
                        else force = {angle: forces[1].angle};
                    }
                }
            }
            this.setForce(force);
            this.setForces(forces);
            this.$emit('reloadGraphics');
            this.formula += '$$$$';
            this.formula += '$$$$';
        },
    },
    mounted() {
        this.type = this.getListePertu()[this.selectedPertu].pertuData.type;
    },
};
</script>

<style scoped>
</style>
