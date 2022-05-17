<script setup lang="ts">
import dayjs from 'dayjs'
import { getTrnsIds } from '~/components/trns/getTrns'
import useStatPage from '~/components/stat/useStatPage'

const props = defineProps<{
  typeText: 'incomes' | 'expenses'
}>()

type PeriodNames = 'day' | 'week' | 'month' | 'year'

const { $store, $day } = useNuxtApp()

const trnsItems = computed(() => $store.state.trns.items)
const categoriesItems = computed(() => $store.state.categories.items)
const { statPage } = useStatPage()

function getData({ date, unit, count }) {
  return dayjs(date).subtract(count, unit).endOf(unit).add(1, 'day').startOf('day').valueOf()
}

function getData2({ date, unit, count }) {
  return dayjs(date).subtract(count, unit).endOf(unit).endOf('day').valueOf()
}

/**
 * Settings
 */
const periodDate = computed<PeriodNames>(() => $store.state.filter.date)
const periodName = computed<PeriodNames>(() => $store.state.filter.period)
const periodCountAverage = computed<number>(() => $store.state.chart.periods[periodName.value].showedPeriods)

const selectedPeriod = computed(() => ({
  from: dayjs(periodDate.value).startOf(periodName.value).valueOf(),
  until:
    // Until today if selected period is present
    dayjs(periodDate.value).endOf(periodName.value).valueOf() > dayjs().endOf('day').valueOf()
      ? dayjs().endOf('day').valueOf()
      : dayjs(periodDate.value).endOf(periodName.value).valueOf(),
}))

const averagePeriod = computed(() => ({
  from: dayjs().subtract(periodCountAverage.value, periodName.value).startOf(periodName.value).valueOf(),
  until: dayjs().subtract(1, periodName.value).endOf(periodName.value).valueOf(),
}))

const trnsIdsAverage = computed(() => getTrnsIds({
  trnsItems: trnsItems.value,
  fromDate: averagePeriod.value.from,
  untilDate: averagePeriod.value.until,
}))

const trnsIdsThisPeriod = computed(() => getTrnsIds({
  trnsItems: trnsItems.value,
  fromDate: selectedPeriod.value.from,
  untilDate: selectedPeriod.value.until,
}))

function getCategoryOrChildsIdArray({ category, categoryId }) {
  return category?.childIds?.length > 0 ? category?.childIds : [categoryId]
}

function getTrnsInCategories({ trnsIds, categoriesIds, trnsItems }) {
  return trnsIds.filter((trnId) => {
    const trn = trnsItems[trnId]
    return categoriesIds.includes(trn.categoryId)
  })
}

const stat = computed(() => {
  let statObj

  for (const categoryId of statPage.current[props.typeText].categoriesIds) {
    console.log(categoryId)
    const currentStat = statPage.current.categories[categoryId]

    const categoriesIds = getCategoryOrChildsIdArray({
      categoryId,
      category: categoriesItems.value[categoryId],
    })

    const trnsIdsInCategoryThisPeriod = getTrnsInCategories({
      categoriesIds,
      trnsItems: trnsItems.value,
      trnsIds: trnsIdsThisPeriod.value,
    })

    const trnsIdsInCategoryAverage = getTrnsInCategories({
      categoriesIds,
      trnsItems: trnsItems.value,
      trnsIds: trnsIdsAverage.value,
    })

    const averageTotal = $store.getters['trns/getTotalOfTrnsIds'](trnsIdsInCategoryAverage)

    statObj = {
      ...statObj,
      [categoryId]: {
        category: $store.state.categories.items[categoryId],
        current: {
          income: currentStat.income,
          expense: currentStat.expense,
          sum: currentStat.sum,
          trnsIds: trnsIdsInCategoryThisPeriod,
        },
        avg: {
          income: averageTotal.income,
          expense: averageTotal.expense,
          sum: averageTotal.sum,
          trnsIds: trnsIdsInCategoryAverage,
        },
      },
    }
  }

  return statObj
})

function formatDate(date) {
  return dayjs(date).format('D MMM YYYY')
}

function getDiffDays(from, until) {
  return dayjs(until).diff(from, 'day') + 1
}
</script>

<template lang="pug">
.pb-8
  div
    //- Current
    .mb-3.p-3.flex.items-center.gap-6.bg-skin-item-main-bg.rounded-md.text-skin-item-base
      .relative.after_absolute.after_-right-3.after_block.after_h-6.after_bg-skin-item-main-hover(
        class="after_w-[1px] after_top-1/2 after_-translate-y-1/2"
      )
        .text-xs {{ formatDate(selectedPeriod.from) }}
        .text-2xs.text-skin-item-base-down From

      .relative.after_absolute.after_-right-3.after_block.after_h-6.after_bg-skin-item-main-hover(
        class="after_w-[1px] after_top-1/2 after_-translate-y-1/2"
      )
        .text-xs {{ formatDate(selectedPeriod.until) }}
        .text-2xs.text-skin-item-base-down Until

      .relative.after_absolute.after_-right-3.after_block.after_h-6.after_bg-skin-item-main-hover(
        class="after_w-[1px] after_top-1/2 after_-translate-y-1/2"
      )
        .text-xs {{ getDiffDays(selectedPeriod.from, selectedPeriod.until) }}
        .text-2xs.text-skin-item-base-down Days

      .relative.after_absolute.after_-right-3.after_block.after_h-6.after_bg-skin-item-main-hover(
        class="after_w-[1px] after_top-1/2 after_-translate-y-1/2"
      )
        .text-xs.capitalize {{ periodName }}
        .text-2xs.text-skin-item-base-down Period Name

    //- Average
    .mb-3.p-3.flex.items-center.gap-6.bg-skin-item-main-bg.rounded-md.text-skin-item-base
      .relative.after_absolute.after_-right-3.after_block.after_h-6.after_bg-skin-item-main-hover(
        class="after_w-[1px] after_top-1/2 after_-translate-y-1/2"
      )
        .text-xs {{ formatDate(averagePeriod.from) }}
        .text-2xs.text-skin-item-base-down From average

      .relative.after_absolute.after_-right-3.after_block.after_h-6.after_bg-skin-item-main-hover(
        class="after_w-[1px] after_top-1/2 after_-translate-y-1/2"
      )
        .text-xs {{ formatDate(averagePeriod.until) }}
        .text-2xs.text-skin-item-base-down Until average

      .relative.after_absolute.after_-right-3.after_block.after_h-6.after_bg-skin-item-main-hover(
        class="after_w-[1px] after_top-1/2 after_-translate-y-1/2"
      )
        .text-xs {{ getDiffDays(averagePeriod.from, averagePeriod.until) }}
        .text-2xs.text-skin-item-base-down Days

      .relative.after_absolute.after_-right-3.after_block.after_h-6.after_bg-skin-item-main-hover(
        class="after_w-[1px] after_top-1/2 after_-translate-y-1/2"
      )
        .text-xs.capitalize {{ periodName }}
        .text-2xs.text-skin-item-base-down Period Name

      .relative.after_absolute.after_-right-3.after_block.after_h-6.after_bg-skin-item-main-hover(
        class="after_w-[1px] after_top-1/2 after_-translate-y-1/2"
      )
        .text-xs {{ periodCountAverage }}
        .text-2xs.text-skin-item-base-down Period Count

    //-
    .flex.flex-col.gap-2
      .p-3.flex.flex-col.gap-3.bg-skin-item-main-bg.rounded-md.text-skin-item-base(
        v-for="(categoryStat, categoryId) in stat"
        :key="categoryId"
      )
        .flex-center.gap-3
          //- Icon
          .w-8.h-8.flex-center.rounded-full.text-xl.text-neutral-50(
            :style="{ background: categoryStat.category.color }"
          ): div(:class="categoryStat.category.icon")

          .grow.gap-3.flex.items-center
            .overflow-hidden.grow.truncate.gap-2.flex.items-baseline
              .overflow-hidden.text-sm {{ categoryStat.category.name }}{{ categoryStat.category.childIds ? '...' : '' }}

        .flex.items-center.justify-between.gap-4
          .text-center
            Amount(
              :currency="$store.state.currencies.base"
              :value="categoryStat.current.sum / getDiffDays(selectedPeriod.from, selectedPeriod.until)"
              size="sm"
              vertical="center"
            )
            .text-2xs.text-skin-item-base-down day

          .text-center
            Amount(
              :currency="$store.state.currencies.base"
              :value="categoryStat.avg.sum / periodCountAverage"
              size="sm"
              vertical="center"
            )
            .text-2xs.text-skin-item-base-down average

          .text-center
            Amount(
              :currency="$store.state.currencies.base"
              :value="categoryStat.current.sum"
              size="sm"
              vertical="center"
            )
            .text-2xs.text-skin-item-base-down this period
</template>
