import Vue from 'vue'
import VueRouter from 'vue-router'
import Conception from '../views/Conception.vue'
import Donnees from '../views/Donnees.vue'
import Perturbations from '../views/Perturbations.vue'
import Couplage from '../views/Couplage.vue'
import Bohr from '../views/Bohr.vue'

Vue.use(VueRouter)

  const routes = [
    {
      path: '/',
      name: 'Conception',
      component: Conception
    },
    {
      path: '/Donnees',
      name: 'Donnees',
      component: Donnees
    },
    {
      path: '/Perturbations',
      name: 'Perturbations',
      component: Perturbations
    },
    {
      path: '/Couplage',
      name: 'Couplage',
      component: Couplage
    },
    {
      path: '/Bohr',
      name: 'Bohr',
      component: Bohr
    },
]

const router = new VueRouter({
  routes
})

export default router
