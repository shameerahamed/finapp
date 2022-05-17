<script>
import useTrn from '~/components/trns/item/useTrn'
import { formatDate } from '~/utils/formatDate'

export default {
  props: {
    trnId: { type: String, required: true },
  },

  setup(props) {
    const { formatTrnItem } = useTrn()
    const trnItem = computed(() => formatTrnItem(props.trnId))
    return { trnItem }
  },

  computed: {
    formatedDate() {
      return formatDate(this.trnItem.date, 'number')
    },
  },
}
</script>

<template lang="pug">
.trnItem(@click="$emit('onClick', id)")
  .trnItem__date {{ formatedDate }}

  .trnItem__wallet
    .walletIcon
      Icon(
        :abbr="trnItem.wallet.name"
        :background="trnItem.wallet.color"
        small
      )
    .walletName {{ trnItem.wallet.name }}

  .trnItem__wallet
    .walletIcon
      Icon(
        :abbr="trnItem.category.name"
        :background="trnItem.category.color"
        small
      )
    .walletName {{ trnItem.category.name }}

  .trnItem__amount
    Amount(
      :currency="trnItem.wallet.currency"
      :value="trnItem.amount"
      :type="trnItem.type"
    )
</template>

<style lang="stylus" scoped>
@import '~assets/stylus/variables'

.trnItem
  position relative
  display flex
  flex-flow wrap
  align-items center
  padding $m6 $m8
  border-bottom 1px solid var(--c-bg-6)
  color var(--c-font-4)

  +media-hover()
    background var(--c-item-bg-hover)

  &:last-child
    border-color transparent

  &__amount
    align-self center
    margin-left auto

  &__categoryName
    white-space nowrap
    overflow hidden
    text-overflow ellipsis

  &__date
    padding-right 20px
    font-size 13px

  &__desc
    overflow hidden
    padding-right 10px
    color var(--c-font-3)
    font-size 12px
    white-space nowrap
    text-overflow ellipsis

  &__wallet
    display flex
    align-items center
    padding-right 20px

    .walletIcon
      margin-right 8px

    .walletName
      font-size 14px
      white-space nowrap
</style>
