<template>
    <div></div>
</template>

<script>
export default {
    name: "ABTesting",

    created() {
        if(!localStorage.phone) {
            this.$router.push({
                path: '/login/' + this.$route.params.id + '/experiment'
            })
        }
    }

}
</script>

<style scoped>

</style>