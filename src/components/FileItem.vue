<template>
  <div class="file-item"
       :class="{'secure': file.isSecure,
                'public': file.isPublic}">
    <div class="icon-wrap">
    </div>
    <p class="filename">{{file.filename}}</p>
  </div>
</template>
<script>
export default {
  name: 'fileitem',
  props: ['file'],
}
</script>
<style lang="scss" scoped>
.file-item {
  flex: 0 0 180px;
  margin-bottom: 30px;
}
</style>
