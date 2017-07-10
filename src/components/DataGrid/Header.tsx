import * as React from 'react';
import ReactDOM from 'react-dom';
import joinClasses from 'classnames';
import shallowCloneObject from './shallowCloneObject';
import ColumnMetrics from './ColumnMetrics';
import ColumnUtils from './ColumnUtils';
import HeaderRow from './HeaderRow';
import getScrollbarSize from './getScrollbarSize';
import createObjectWithProperties from './createObjectWithProperties';
import cellMetaDataShape from './PropTypeShapes/CellMetaDataShape';
import { DEFINE_SORT } from './cells/headerCells/SortableHeaderCell';
// TODO: Add CSS require('../../../themes/react-data-grid-header.css');

export interface Column {
  width: number,
};

// The list of the propTypes that we want to include in the Header div
const knownDivPropertyKeys = ['height', 'onScroll'];

export interface Props {
    columnMetrics: any,
    totalWidth: any,
    height: number,
    headerRows: any,
    sortColumn: string,
    sortDirection: typeof DEFINE_SORT,
    onSort: Function,
    onColumnResize: Function,
    onScroll: Function,
    onHeaderDrop: Function,
    draggableHeaderCell: Function,
    getValidFilterValues: Function,
    cellMetaData: cellMetaDataShape,
};

class Header extends React.Component<Props, any> {

  filterRow: any;
  row: any;

  constructor(props: Props) {
    super(props);
    this.state = {resizing: null};
  }

  componentWillReceiveProps() {
    this.setState({resizing: null});
  }

  shouldComponentUpdate(nextProps: any, nextState: any): boolean {
    let update =  !(ColumnMetrics.sameColumns(this.props.columnMetrics.columns, nextProps.columnMetrics.columns, ColumnMetrics.sameColumn))
    || this.props.totalWidth !== nextProps.totalWidth
    || (this.props.headerRows.length !== nextProps.headerRows.length)
    || (this.state.resizing !== nextState.resizing)
    || this.props.sortColumn !== nextProps.sortColumn
    || this.props.sortDirection !== nextProps.sortDirection;
    return update;
  }

  onColumnResize(column: Column, width: number) {
    let state = this.state.resizing || this.props;

    let pos = this.getColumnPosition(column);

    if (pos != null) {
      let resizing = {
        columnMetrics: shallowCloneObject(state.columnMetrics),
        column: null,
      };
      resizing.columnMetrics = ColumnMetrics.resizeColumn(
          resizing.columnMetrics, pos, width);

      // we don't want to influence scrollLeft while resizing
      if (resizing.columnMetrics.totalWidth < state.columnMetrics.totalWidth) {
        resizing.columnMetrics.totalWidth = state.columnMetrics.totalWidth;
      }

      resizing.column = ColumnUtils.getColumn(resizing.columnMetrics.columns, pos);
      this.setState({resizing});
    }
  }

  onColumnResizeEnd(column: Column, width: number) {
    let pos = this.getColumnPosition(column);
    if (pos !== null && this.props.onColumnResize) {
      this.props.onColumnResize(pos, width || column.width);
    }
  }

  getHeaderRows(): Array<HeaderRow> {
    let columnMetrics = this.getColumnMetrics();
    let resizeColumn: any;
    if (this.state.resizing) {
      resizeColumn = this.state.resizing.column;
    }
    let headerRows: any[] = [];
    this.props.headerRows.forEach((row: any, index: any) => {
      // To allow header filters to be visible
      let rowHeight = 'auto';
      if (row.rowType === 'filter') {
        rowHeight = '500px';
      }
      let scrollbarSize = getScrollbarSize() > 0 ? getScrollbarSize() : 0;
      let updatedWidth = isNaN(this.props.totalWidth - scrollbarSize) ? this.props.totalWidth : this.props.totalWidth - scrollbarSize;
      let headerRowStyle = {
        position: 'absolute',
        top: this.getCombinedHeaderHeights(index),
        left: 0,
        width: updatedWidth,
        overflow: 'hidden',
        minHeight: rowHeight,
      };

      headerRows.push(<HeaderRow
        key={row.ref}
        ref={(node: any) => row.rowType === 'filter' ? this.filterRow = node : this.row = node}
        rowType={row.rowType}
        style={headerRowStyle}
        onColumnResize={this.onColumnResize}
        onColumnResizeEnd={this.onColumnResizeEnd}
        width={columnMetrics.width}
        height={row.height || this.props.height}
        columns={columnMetrics.columns}
        resizing={resizeColumn}
        draggableHeaderCell={this.props.draggableHeaderCell}
        filterable={row.filterable}
        onFilterChange={row.onFilterChange}
        onHeaderDrop={this.props.onHeaderDrop}
        sortColumn={this.props.sortColumn}
        sortDirection={this.props.sortDirection}
        onSort={this.props.onSort}
        onScroll={this.props.onScroll}
        />);
    });
    return headerRows;
  }

  getColumnMetrics() {
    let columnMetrics;
    if (this.state.resizing) {
      columnMetrics = this.state.resizing.columnMetrics;
    } else {
      columnMetrics = this.props.columnMetrics;
    }
    return columnMetrics;
  }

  getColumnPosition(column: any): any {
    let columnMetrics = this.getColumnMetrics();
    let pos = -1;
    columnMetrics.columns.forEach((c: any, idx: any) => {
      if (c.key === column.key) {
        pos = idx;
      }
    });
    return pos === -1 ? null : pos;
  }

  getCombinedHeaderHeights(until: any): number {
    let stopAt = this.props.headerRows.length;
    if (typeof until !== 'undefined') {
      stopAt = until;
    }

    let height = 0;
    for (let index = 0; index < stopAt; index++) {
      height += this.props.headerRows[index].height || this.props.height;
    }
    return height;
  }

  getStyle(): {position: string; height: number} {
    return {
      position: 'relative',
      height: this.getCombinedHeaderHeights(undefined),
    };
  }

  setScrollLeft(scrollLeft: number) {
    let node = ReactDOM.findDOMNode(this.row);
    node.scrollLeft = scrollLeft;
    this.row.setScrollLeft(scrollLeft);
    if (this.filterRow) {
      let nodeFilters = ReactDOM.findDOMNode(this.filterRow);
      nodeFilters.scrollLeft = scrollLeft;
      this.filterRow.setScrollLeft(scrollLeft);
    }
  }

  getKnownDivProps() {
    return createObjectWithProperties(this.props, knownDivPropertyKeys);
  }

  // Set the cell selection to -1 x -1 when clicking on the header
  onHeaderClick() {
    this.props.cellMetaData.onCellClick({rowIdx: -1, idx: -1 });
  }

  render() {
    let className = joinClasses({
      'react-grid-Header': true,
      'react-grid-Header--resizing': !!this.state.resizing
    });
    let headerRows = this.getHeaderRows();

    return (
      <div {...this.getKnownDivProps()} style={this.getStyle()} className={className} onClick={this.onHeaderClick}>
        {headerRows}
      </div>
    );
  }
};

export default Header;
