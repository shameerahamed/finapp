<script>
import { formatDate } from '~/utils/formatDate'
import { saveData } from '~/services/firebase/api'

export default {
  props: {
    group: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      isTrnsVisible: false,
    }
  },

  computed: {
    formatedDate() {
      return formatDate(this.group.date, 'number')
    },

    totalAmount() {
      return this.gotAmount.incomes - this.gotAmount.expenses || 0
    },

    trnsIds() {
      if (this.group.trnsIds) {
        return Object.keys(this.group.trnsIds)
          .sort((a, b) => {
            if (!this.$store.state.trns.items[a] || !this.$store.state.trns.items[b])
              return false
            if (this.$store.state.trns.items[a].date > this.$store.state.trns.items[b].date)
              return -1
            if (this.$store.state.trns.items[a].date < this.$store.state.trns.items[b].date)
              return 1
            return 0
          })
      }
      return []
    },

    gotAmount() {
      if (this.trnsIds)
        return this.$store.getters['trns/getTotalOfTrnsIds'](this.trnsIds)

      return 0
    },

    styles() {
      return {
        width: `${Math.abs(this.gotAmount.incomes - this.gotAmount.expenses) / Math.abs(this.gotAmount.incomes) * 100}%`,
      }
    },
  },

  async mounted() {
    if (this.group.trnsIds) {
      for (const trnId of Object.keys(this.group.trnsIds)) {
        if (!this.$store.state.trns.items[trnId]) {
          await this.$store.dispatch('groups/removeTrnFromGroup', {
            groupId: this.group.id,
            trnId,
          })
        }

        if (this.$store.state.trns.items[trnId] && !this.$store.state.trns.items[trnId].groups)
          saveData(`users/${this.$store.state.user.user.uid}/trns/${trnId}/groups/${this.group.id}`, this.group.id)
      }
    }
  },

  methods: {
    handleTrnItemClick(trnId) {
      this.$store.commit('categories/hideCategoryModal')
      this.$store.commit('trns/showTrnModal')
      this.$store.commit('trns/setTrnModalId', trnId)
    },
  },
}
</script>

<template lang="pug">
.groupItem
  .groupItem__top
    .groupItem__meta
      .groupItem__name {{ group.name }}
      .groupItem__description(v-if="group.description") {{ group.description }}

  //- info
  .groupItem__info(@click="isTrnsVisible = !isTrnsVisible")
    .groupItem__amounts
      //- expenses
      .sum
        .sum__title {{ $t('groups.stat.expenses') }}
        .sum__amount
          Amount(
            :amount="gotAmount.expenses"
            :currency="group.currency"
            :type="0"
          )

      //- incomes
      .sum._right
        .sum__title {{ $t('groups.stat.incomes') }}
        .sum__amount
          Amount(
            :amount="gotAmount.incomes"
            :currency="group.currency"
            :type="1"
          )

      .sum._right
        .sum__title {{ $t('groups.stat.total') }}
        .sum__amount
          Amount(
            :amount="totalAmount"
            :currency="group.currency"
          )

    .groupItem__graph: .groupItem__graph__in(:style="styles")

  .groupItem__trns(v-if="group.trnsIds" v-show="isTrnsVisible")
    GroupsGroupItemTrn(
      v-for="trnId in trnsIds"
      :key="trnId"
      :trnId="trnId"
    )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.sum
  text-align center
  &__title
    opacity .6
    padding-bottom 5px
    color var(--c-font-4)
    font-size 10px

.groupItem
  overflow hidden
  font-size 14px
  background var(--c-bg-4)
  border 1px solid var(--c-bg-5)
  border-radius 3px

  &:last-child
    margin-bottom 0

  &__top
    display flex
    align-items center
    justify-content space-between
    padding 12px

    +media-laptop()
      padding 16px

  &__name
    font-size 14px

  &__description
    padding-top 5px
    color var(--c-font-4)
    font-size 11px

  &__info
    padding 16px
    background var(--c-bg-3)
    border-top 1px solid var(--c-bg-2)

    +media-laptop()
      padding 16px

  &__amounts
    display flex
    justify-content space-between
    gap $m10
    padding-bottom 8px

  &__graph
    overflow hidden
    background var(--c-bg-7)
    border-radius 3px

    &__in
      height 6px
      min-width 0px
      background rgba(44, 173, 34, .7)

  &__trns
    border-top 1px solid var(--c-bg-2)
</style>
