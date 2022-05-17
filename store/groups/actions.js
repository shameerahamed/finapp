import dayjs from 'dayjs'
import { getDataAndWatch, removeData, saveData } from '~/services/firebase/api'
import generateId from '~/utils/id'

export default {
  initGroups({ dispatch, rootGetters }) {
    const path = `users/${rootGetters['user/userUid']}/groups`
    getDataAndWatch(path, items => dispatch('setGroups', items || {}))
  },

  setGroups({ commit }, items) {
    commit('setGroups', items)
  },

  async createGroup({ rootGetters }, values) {
    const id = generateId(dayjs().valueOf())
    const uid = rootGetters['user/userUid']
    const path = `users/${uid}/groups/${id}`

    await saveData(path, {
      currency: 'RUB',
      name: values.name,
      date: dayjs().valueOf(),
    })
  },

  async removeGroup({ rootGetters }, id) {
    const uid = rootGetters['user/userUid']
    const path = `users/${uid}/groups/${id}`
    await removeData(path)
  },

  async addTrnToGroup({ rootGetters }, { groupId, trnId }) {
    const uid = rootGetters['user/userUid']

    // add to group
    await saveData(`users/${uid}/groups/${groupId}/trnsIds/${trnId}`, trnId)
    // info in trn
    await saveData(`users/${uid}/trns/${trnId}/groups/${groupId}`, groupId)
  },

  removeTrnFromGroup({ rootGetters }, { groupId, trnId }) {
    const uid = rootGetters['user/userUid']

    // remove from group
    saveData(`users/${uid}/groups/${groupId}/trnsIds/${trnId}`, null)

    // remove from trn
    removeData(`users/${uid}/trns/${trnId}/groups/${groupId}`)
  },

  toogleAddToGroup({ dispatch, rootState }, { groupId, trnId }) {
    const trn = rootState.trns.items[trnId]

    trn.groups && trn.groups[groupId]
      ? dispatch('removeTrnFromGroup', { groupId, trnId })
      : dispatch('addTrnToGroup', { groupId, trnId })
  },
}
