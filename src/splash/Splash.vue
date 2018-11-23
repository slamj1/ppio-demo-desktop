<template>
  <div id="splash-container">
    <img class="splash-logo" src="../assets/logo.png" alt="ppio">
    <h1>PPDisk-Demo</h1>
    <span class="loading"><img src="../assets/img/splash-loading.svg" alt=""></span>
  </div>
</template>

<style lang="scss">
@import '../assets/css/base';

#splash-container {
  -webkit-app-region: drag;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 300px;
  height: 300px;
  text-align: center;
  background-color: #fff;

  .splash-logo {
    display: inline-block;
    width: 178px;
    margin-top: -15px;
    margin-bottom: 40px;
  }

  h1 {
    margin: 0;
    color: #c0c4cc;
    font-size: 24px;
  }

  .loading {
    position: absolute;
    bottom: 25px;
    left: 50%;
    margin-left: -18px;

    img {
      width: 30px;
      height: 30px;
      margin: 0;
      animation: loading 1.4s linear infinite;
    }
  }
}

@keyframes loading {
  0% {
    transform: rotateZ(0);
  }
  100% {
    transform: rotateZ(360deg);
  }
}
</style>
