<template>
  <div id="app">
    <div id="nav">
      <router-link class="conception" to="/">Mode Conception</router-link> 
      <router-link class="bohr" to="/Bohr">Mode de Bohr</router-link>
      <router-link class="perturbation" to="/Perturbations">Mode Perturbations</router-link>
      <router-link class="couplage" to="/Couplage">Mode Couplage</router-link>
      <router-link class="conception" to="/Donnees">Données Atomiques</router-link>
      <a href="./Instructions.pdf" class="aide" target="_blank"><i class="fa fa-info-circle"></i></a>
    </div>
    <router-view/>
  </div>
</template>

<style>
:root {
  --Color-1: #2c3e50;
  --Color-2: #42b983; /*Mode Conception*/
  --Color-3: #e76f51;
  --Color-4: #CA2E55;
  --Color-5: #D1D0A3;/*liaisons*/
  --Color-6: #006992; /*Mode Perturbations*/
  --Color-7: #B592A0; /*Mode Couplage*/
  --Color-8: #FFCF56;
  --Color-9: #ffaa71;
}

#app {
  margin: 0px;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: var(--Color-1);
}

#nav {
  overflow: hidden;
  background-color: var(--Color-1);
}

#nav a {
  padding-top: 30px;
  padding-bottom: 30px;
  float: left;
  font-weight: bold;
  color: #ffffff;
  text-decoration: none;
  width: 18.4%;
  font-size: 20px;
}

#nav a:hover {
  background-color: #000;
}

#nav a.aide {
  padding-top: 22px;
  padding-bottom: 22px;
  width: 8%;
  font-size: 30px;
}

#nav a.conception.router-link-exact-active {
  background-color: var(--Color-2);
}
#nav a.perturbation.router-link-exact-active {
  background-color: var(--Color-6);
}
#nav a.couplage.router-link-exact-active {
  background-color: var(--Color-7);
}
#nav a.bohr.router-link-exact-active {
  background-color: var(--Color-9);
}
</style>
