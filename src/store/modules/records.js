import Vue from "vue";
import recordsApi from "@/api/records";

const state = {
  records: [],
  limit: 12,
  offset: 0,
  // TODO: move to navigation store?
  enableInfiniteScroll: false
};
const getters = {};
const mutations = {
  disableInfiniteScroll(state) {
    state.enableInfiniteScroll = false;
  },
  enableInfiniteScroll(state) {
    state.enableInfiniteScroll = true;
  },
  increaseOffset(state) {
    state.offset += state.limit;
  },
  extendRecords(state, payload) {
    state.records = state.records.concat(payload.records);
  },
  resetRecords(state) {
    state.records = [];
  },
  resetOffset(state) {
    state.offset = 0;
  },
  changeRecord(state, payload) {
    Vue.set(
      state.records,
      state.records.findIndex(r => r.id === payload.id),
      payload
    );
  }
};
const actions = {
  loadRecords(
    { commit, state },
    { query = "all", sourceId = null, replace = true, preview = false }
  ) {
    if (replace) {
      commit("resetOffset");
    }
    return new Promise((resolve, reject) => {
      let meth = preview ? recordsApi.getRecordsPreview : recordsApi.getRecords;
      meth({
        limit: state.limit,
        offset: state.offset,
        query,
        sourceId
      })
        .then(response => {
          if (replace) {
            commit("resetRecords");
          }
          commit("increaseOffset");

          commit("extendRecords", {
            records: response.data
          });
          if (response.data.length === 0) {
            commit("disableInfiniteScroll");
            this.enableInfiniteScroll = false;
          }
          setTimeout(() => commit("enableInfiniteScroll"), 1000);
          resolve();
        })
        .catch(reject);
    });
  },

  toggleStarred({ commit }, { recordId, starred }) {
    recordsApi.toggleStarred(recordId, starred).then(response => {
      commit("changeRecord", response.data);
    });
  }
};

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
};