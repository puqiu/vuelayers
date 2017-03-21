import uuid from 'uuid/v4'
import rxSubs from 'vl-mixins/rx-subs'
import vmBind from 'vl-mixins/vm-bind'
import stubVNode from 'vl-mixins/stub-vnode'
import { warn } from 'vl-utils/debug'

const props = {
  id: {
    type: [ String, Number ],
    default: () => uuid()
  },
  opacity: {
    type: Number,
    default: 1
  },
  minResolution: Number,
  maxResolution: Number,
  visible: {
    type: Boolean,
    default: true
  },
  extent: {
    type: Array,
    validator: value => value.length === 4
  },
  zIndex: {
    type: Number,
    default: 0
  },
  overlay: {
    type: Boolean,
    default: false
  }
}

const computed = {
  currentId () {
    return this.id
  },
  currentMinResolution () {
    return this.minResolution
  },
  currentMaxResolution () {
    return this.maxResolution
  },
  currentExtent () {
    return this.extent
  },
  currentOpacity () {
    return this.opacity
  }
}

const methods = {
  /**
   * Updates layer state
   */
  refresh () {
    this.layer && this.layer.changed()
  },
  initialize () {
    /**
     * @type {ol.layer.Layer}
     * @protected
     */
    this.layer = this.createLayer()
    this.bindSelfTo(this.layer)

    Object.defineProperty(this.layer, 'id', {
      enumerable: true,
      configurable: true,
      get: () => this.currentId
    })
  },
  /**
   * @return {ol.layer.Layer}
   * @protected
   */
  createLayer () {
    throw new Error('Not implemented method')
  },
  /**
   * @protected
   */
  mountLayer () {
    if (this.map) {
      if (this.overlay) {
        this.layer.setMap(this.map)
      } else {
        this.map.addLayer(this.layer)
      }
      this.subscribeAll()
    } else if (process.env.NODE_ENV !== 'production') {
      warn("Invalid usage of map component, should have layer component among it's ancestors")
    }
  },
  /**
   * @protected
   */
  unmountLayer () {
    this.unsubscribeAll()
    if (this.map) {
      if (this.overlay) {
        this.layer.setMap(undefined)
      } else {
        this.map.removeLayer(this.layer)
      }
    }
  }
}

const watch = {
  currentId (value) {
    return this.layer.set('id', value)
  },
  currentMaxResolution (value) {
    this.layer.setMaxResolution(value)
  },
  currentMinResolution (value) {
    this.layer.setMinResolution(value)
  },
  currentOpacity (value) {
    this.layer.setOpacity(value)
  },
  visible (value) {
    this.layer.setVisible(value)
  },
  zIndex (value) {
    this.layer.setZIndex(value)
  }
}

export default {
  mixins: [ rxSubs, vmBind, stubVNode ],
  inject: [ 'map' ],
  props,
  computed,
  methods,
  watch,
  stubVNode: {
    attrs () {
      return {
        id: [ this.$options.name, this.currentId ].join('-')
      }
    }
  },
  provide () {
    return Object.defineProperties(Object.create(null), {
      layer: {
        enumerable: true,
        get: () => this.layer
      }
    })
  },
  created () {
    this.initialize()
  },
  mounted () {
    this.$nextTick(this.mountLayer)
  },
  destroyed () {
    this.$nextTick(() => {
      this.unmountLayer()
      delete this.layer.id
      this.layer = undefined
    })
  }
}
