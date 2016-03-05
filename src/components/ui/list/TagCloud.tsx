import * as React from "react";

import {
  FastClick,
  ReactComponentType,
  PureRender
} from "../../../"

import { ListProps, ItemProps } from './ListProps'

const block = require('bem-cn')

const map = require("lodash/map")
const includes = require("lodash/includes")
const sortBy = require("lodash/sortBy")
const minBy = require("lodash/minBy")
const maxBy = require("lodash/maxBy")

function computeMinMax(items, field) {
  if (!items || items.length == 0) return { min: 0, max: 0 }
  return {
    min: minBy(items, field)[field],
    max: maxBy(items, field)[field]
  }
}

export interface TagCloudItemProps extends ItemProps {
  url?: string
  fontSize: number
}

export class TagCloudItem extends React.Component<TagCloudItemProps, {}> {
  render() {
    const {onClick, bemBlocks, active, disabled, label, fontSize, showCount, count} = this.props

    const className = bemBlocks.container("item").state({ active, disabled })
    var component;
    const style = { fontSize: fontSize + 'em' }

    const countEl = (showCount && (count !== undefined)) ? <span data-qa="count" className={bemBlocks.container("item__count")}>{ count }</span > : undefined
      
    return (
      <FastClick handler={onClick}>
        <span className={className} data-qa="option" style={style}>{label}{countEl}</span>
      </FastClick>
    )
  }
}

export interface TagCloudProps extends ListProps {
  minFontSize?: number
  maxFontSize?: number
  itemComponent?: ReactComponentType<any>
}

export class TagCloud extends React.Component<TagCloudProps, any> {

  static defaultProps: any = {
    mod: "sk-tag-cloud",
    itemComponent: TagCloudItem,
    showCount: false,
    minFontSize: 1, // In em
    maxFontSize: 1.5,
    translate: (str) => str
  }

  render() {
    const { mod, className, disabled, items, translate } = this.props

    const bemBlocks = {
      container: block(mod)
    }

    const sortedItems = sortBy(items, it => translate(it.title || it.label || it.key).toLowerCase())
    const { min, max } = computeMinMax(items, "doc_count")

    return (
      <div className={bemBlocks.container().mix(className).state({ disabled }) }>
        {map(sortedItems, (item) => this.renderItem(item, bemBlocks, min, max)) }
      </div>
    )
  }

  renderItem(item, bemBlocks, min, max) {
    const { itemComponent, minFontSize, maxFontSize, showCount, selectedItems = [], toggleItem, disabled, translate } = this.props

    const sizeRatio = (min === max) ? 0.5 : ((item.doc_count - min) / (max - min))
    const fontSize = minFontSize + sizeRatio * (maxFontSize - minFontSize) // TODO : make ratio function customizable (square, log, etc.)
    return React.createElement(itemComponent, {
      label: translate(item.title || item.label || item.key),
      onClick: () => toggleItem(item.key),
      bemBlocks: bemBlocks,
      key: item.key,
      disabled: disabled || item.disabled,
      active: includes(selectedItems, item.key),
      fontSize,
      showCount,
      count: item.doc_count
    })
  }
}
