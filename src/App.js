import React, { Component } from 'react';
import './App.css';
import './main.css';
import ReactDOM from 'react-dom';
import { slideDown, slideUp } from './anim';


import $ from 'jquery';
import _ from 'lodash';


function formatDate(str) {
  return str.substr(0, 10);
}

function capitalize(str) {
  return str.split(' ').map(s => {
    return s.charAt(0).toUpperCase() + s.substr(1);
  }).join(' ');
}

class TableRow extends React.Component {
  state = { expanded: false, expanded1: false }

  toggleExpander(e, self, index) {
    if (e.target.type === 'checkbox') return;

    if (!this.state.expanded) {
      this.setState(
        { expanded: true },
        () => {
          if (this.refs['expanderBody' + index]) {
            slideDown(this.refs['expanderBody' + index]);
          }
        }
      );
    } else {
      slideUp(this.refs['expanderBody' + index], {
        onComplete: () => { this.setState({ expanded: false }); }
      });
    }
  }

  removeDOM(data) {
    console.log(data)
    $('.' + data).each(function (key, ele) {
      $(ele).remove();
    });
  }

  toggleExpander1(e, value, index) {

    console.log(value)

    this.removeDOM('drilldown');

    value.fields.map(function (data, key) {

      if (key == 0) {
        $('<tr class="drilldown subrow' + key + ' ' + data.Strategy + '"><td>' + data.Security + '</td><td>' + data.MV + '</td><td>' + data.Carry + '</td><td>' + data.NetPL1 + '</td><td>' + data.NetPL2 + '</td><td>' + data.NetPL3 + '</td></tr>').insertAfter('.subrow'  + index);
      } else {
        // console.log('.' + data.Strategy+ ' subrow' + (parseInt(key) - 1))
        $('<tr class="drilldown subrow' + key + ' ' + data.Strategy + '"><td>' + data.Security + '</td><td>' + data.MV + '</td><td>' + data.Carry + '</td><td>' + data.NetPL1 + '</td><td>' + data.NetPL2 + '</td><td>' + data.NetPL3 + '</td></tr>').insertAfter('.' + data.Strategy+ '.subrow' + (parseInt(key) - 1));
      }
    });
  }

  render() {
    const { data, key } = this.props;
    return [
      <tr key="main" onClick={(e) => this.toggleExpander(e, key)}>
        <td className="uk-text-nowrap">{data.Strategy}</td>
        <td className="uk-text-nowrap">{data.mvTotal}</td>

        <td>{data.carryTotal}</td>

        <td>{data.pl1Total}</td>

        <td>{data.pl2Total}</td>

        <td>{data.pl3Total}</td>
      </tr>,
      data.subStrategy.map((value, index) => {
        return (
          this.state.expanded && (
            <tr className={"expandable subrow"+index} key="tr-expander" onClick={(e) => this.toggleExpander1(e, value, index)}>
              <td className="uk-background-muted" >
                <div ref={"expanderBody" + key} className="inner uk-grid">
                  {value.subStrategy}
                </div>
              </td>
              <td className="uk-background-muted" >
                {value.mvSubTotal}
              </td>
              <td className="uk-background-muted">
                {value.carrySubTotal}
              </td>
              <td className="uk-background-muted">
                {value.pl1SubTotal}
              </td>
              <td className="uk-background-muted">
                {value.pl2SubTotal}
              </td>
              <td className="uk-background-muted">
                {value.pl3SubTotal}
              </td>
            </tr>)

        )
      }),
      // this.state.expanded1 && (
      //   <tr className="expandable1" key="tr-expander1">
      //     <td className="uk-background-muted" colSpan={6}>
      //       <div ref="expanderBody1" className="inner uk-grid">
      //         454545
      //       </div>
      //     </td>
      //   </tr>
      // )
    ];
  }
}



class App extends React.Component {
  state = { tableData: [], tableHeaders: [] }

  componentWillMount() {
    this.loadData();
  }

  objtoarr(input, object) {
    var output = [],
      item;
    for (var type in input) {
      if (input.hasOwnProperty(type)) {
        item = {};
        item[object] = type;
        item.fields = input[type];
        output.push(item);
      }
    }
    return output;
  }

  loadData() {
    $.ajax({
      url: 'data.json',
      dataType: 'json',
      contentType: 'application/json',
      success: function (result) {
        var data = this.objtoarr(_.groupBy(result.Pivot1.data, 'Strategy'), 'Strategy');
        this.setState({
          tableHeaders: result.Pivot1.headers,
          // tableData: this.objtoarr(_.groupBy(result.Pivot1.data, 'Strategy')),
        })
        this.getSubStrategy(data);
      }.bind(this)
    });
  }

  getSubStrategy(arrayData) {
    var subStrategyArr, mvSubTotal = 0;
    var carrySubTotal = 0;
    var netPL1SubTotal = 0;
    var netPL2SubTotal = 0;
    var netPL3SubTotal = 0;

    arrayData.map((value, index) => {
      subStrategyArr = this.objtoarr(_.groupBy(value.fields, 'SubStrategy'), 'subStrategy');
      // console.log(subStrategy);
      subStrategyArr.map((subStrategyArrData, subStrategyIndex) => {
        subStrategyArrData.fields.map((data, index) => {
          // console.log(data);
          mvSubTotal = mvSubTotal + parseInt(data.MV)
          carrySubTotal = carrySubTotal + parseInt(data.Carry);
          netPL1SubTotal = netPL1SubTotal + parseInt(data.NetPL1);
          netPL2SubTotal = netPL2SubTotal + parseInt(data.NetPL2);
          netPL3SubTotal = netPL3SubTotal + parseInt(data.NetPL3);

        });

        subStrategyArr[subStrategyIndex].mvSubTotal = mvSubTotal;
        subStrategyArr[subStrategyIndex].carrySubTotal = carrySubTotal;
        subStrategyArr[subStrategyIndex].pl1SubTotal = netPL1SubTotal;
        subStrategyArr[subStrategyIndex].pl2SubTotal = netPL2SubTotal;
        subStrategyArr[subStrategyIndex].pl3SubTotal = netPL3SubTotal;

        mvSubTotal = 0;
        carrySubTotal = 0;
        netPL1SubTotal = 0;
        netPL2SubTotal = 0;
        netPL3SubTotal = 0;

      });

      arrayData[index].subStrategy = subStrategyArr;
      arrayData[index].mvTotal = this.getTotal('mvSubTotal', subStrategyArr);
      arrayData[index].carryTotal = this.getTotal('carrySubTotal', subStrategyArr);
      arrayData[index].pl1Total = this.getTotal('pl1SubTotal', subStrategyArr);
      arrayData[index].pl2Total = this.getTotal('pl2SubTotal', subStrategyArr);
      arrayData[index].pl3Total = this.getTotal('pl3SubTotal', subStrategyArr);

    });


    this.setState({
      tableData: arrayData
    });
  }

  getTotal(key, data) {
    // console.log(data)
    var total = 0;

    data.map(function (value, index) {
      if (key == 'mvSubTotal')
        total = total + parseInt(value.mvSubTotal)
      if (key == 'carrySubTotal')
        total = total + parseInt(value.carrySubTotal)
      if (key == 'pl1SubTotal')
        total = total + parseInt(value.pl1SubTotal)
      if (key == 'pl2SubTotal')
        total = total + parseInt(value.pl2SubTotal)
      if (key == 'pl3SubTotal')
        total = total + parseInt(value.pl3SubTotal)
    });

    return total;
  }

  render() {
    const { users } = this.state;
    const isLoading = this.state.tableData === null;
    return (
      <main>
        <div className="table-container">
          <div className="uk-overflow-auto">
            <table className="uk-table uk-table-hover uk-table-middle uk-table-divider">
              {this.state.tableHeaders.map((data, key) => {
                return (

                  <th className='uk-table-shrink' key={key}>{data.displayName}</th>
                )
              }
              )}
              <tbody>
                {this.state.tableData.length == 0
                  ? <tr><td colSpan={6} className="uk-text-center"><em className="uk-text-muted">Loading...</em></td></tr>
                  : this.state.tableData.map((value, index) =>
                    <TableRow key={index} index={index + 1} data={value} />
                  )
                }
              </tbody>
            </table>
          </div>
        </div>
      </main>
    );
  }
}

export default App;
