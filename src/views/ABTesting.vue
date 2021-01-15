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
        
        var experimentAssignment = this.getAssignment()
        var assignment = experimentAssignment[0]
        var userConfig = experimentAssignment[1]

        this.$store
            .dispatch("saveConfig", {
                config: userConfig,
            }).then(() => {
                this.$router.push({
                    path: '/play/' + assignment,
                    query: {
                        'experiment': this.$route.params.id
                    }
                })
            })
    },
    methods: {
        getAssignment() {
            return ["ZIzADHngzy", {}];
        }
    }

}
</script>

<style scoped>

</style>