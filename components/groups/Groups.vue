<script>
export default {
  data() {
    return {
      isShowForm: false,
    }
  },

  computed: {
    groups() {
      const formatedGroups = {}
      if (!this.$store.state.groups)
        return

      for (const id in this.$store.state.groups.items) {
        formatedGroups[id] = {
          id,
          ...this.$store.state.groups.items[id],
        }
      }

      return formatedGroups
    },
  },

  async created() {
    await this.$store.dispatch('groups/initGroups')
  },
}
</script>

<template lang="pug">
.h-full.overflow.overflow-x-auto
  .mb-2.py-10.pt-12.px-3.text-center.text-neutral-800.dark_text-white.text-2xl.font-semibold.font-nunito
    | {{ $t('groups.title') }}

  template(v-if="!$store.getters['user/isDevUser']")
    h2 Denied

  template(v-if="$store.getters['user/isDevUser']")
    .content
      .list
        GroupsGroupItem(
          v-for="group in groups"
          :group="group"
          :key="group.id"
        )

      GroupsGroupForm
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.content
  padding $m8

.list
  display grid
  grid-template-columns repeat(auto-fill, minmax(auto, 1fr))
  grid-column-gap 12px
  grid-row-gap 12px

  +media-laptop()
    grid-column-gap 16px
    grid-row-gap 16px
</style>
