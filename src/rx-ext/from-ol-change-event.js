import { Observable } from 'rxjs'
import { merge as mergeObs } from 'rxjs/observable'
import { distinctUntilChanged, map as mapObs, throttleTime } from 'rxjs/operator'
import { isEqual, isFunction } from '../util/minilo'
import fromOlEvent from './from-ol-event'

/**
 * Creates Observable from OpenLayers change:* event
 * @param {ol.Object} target
 * @param {string|string[]} [prop]
 * @param {boolean|function(a, b):boolean|undefined} [distinct] Distinct values by isEqual fn or by custom comparator
 * @param {number|undefined} [throttle] Throttle values by passed amount of ms.
 * @param {function(target: ol.Object, prop: string):*|undefined} [selector] Custom selector
 * @return {Observable<{prop: string, value: *}>}
 */
export default function fromOlChangeEvent (target, prop, distinct, throttle, selector) {
  if (Array.isArray(prop)) {
    return Observable::mergeObs(...prop.map(p => fromOlChangeEvent(target, p)))
  }

  selector = selector || ((target, prop) => target.get(prop))
  let event = `change:${prop}`
  let observable = fromOlEvent(target, event, () => selector(target, prop))

  if (throttle != null) {
    observable = observable::throttleTime(throttle)
  }
  if (distinct) {
    isFunction(distinct) || (distinct = isEqual)
    observable = observable::distinctUntilChanged(distinct)
  }

  return observable::mapObs(value => ({ prop, value }))
}
