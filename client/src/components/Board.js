import React, { Component } from 'react'
import Square from './Square'
import { HuePicker } from 'react-color'
import '../Board.css'

class Board extends Component {
  constructor(props) {
    super()
    this.state = this.getBoard()
  }

  getBoard = () => {
    const squares = []

    // i is the square number 0 - 63.
    var i = 0

    // Loop through to generate the x,y coords.
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        squares.push({
            id: i,
            coords: [x,y],
            isSelected: false,
            color: {r: 44, g: 62, b: 80}
        })
        i++
      }
    }
    // set initial state with 64-array of squares
    return { squares, isSubmitted: false, color: {r: 255, g: 235, b: 59} }
  }

  clearBoard = (event) => {
    this.setState(this.getBoard())
    event.target.blur()
  }

  submitBoard = (event) => {
    this.setState({isSubmitted: true})
    event.target.blur()
    this.props.sendMessage('stateChanged', {message: "Light Design Submitted", squares: this.state.squares } )
  }

  handleChangeComplete = (color) => {
    this.setState({ color: color.rgb })
  }

  handleClick = (id) => {
    const squares = this.state.squares.slice()
    squares[id].isSelected = !squares[id].isSelected
    squares[id].color = this.state.color
    this.setState({squares: squares})
  }

  render() {
    var submitButton = 'submit-button' + (this.state.isSubmitted || !this.props.piConnected ? '-disabled' : '');
    var resetButton = 'reset-button' + (!this.props.piConnected ? '-disabled' : '');

    if (this.state.isSubmitted) {
      var alert = <div className="alert-success" role="alert">Light Design Sent to the Raspberry Pi!</div>;
    }

    if (!this.props.piConnected) {
      alert = <div className="alert-danger" role="alert">Raspberry Pi is currently offline. <i className="fa fa-frown-o" aria-hidden="true"></i></div>;
    }

    return (
      <div>
        {alert}
        <div style={{display: 'flex', justifyContent: 'center', margin: '20px 0'}}>
          <div style={{width: '316px'}}>
            <HuePicker
              color={ this.state.color }
              onChangeComplete={ this.handleChangeComplete }/>
          </div>
        </div>
        <div className='Board-grid'>
          {this.state.squares.map((square) => (
            <div key={square.id}
                 className='Square-container'>
              <Square
                id={square.id}
                isSelected={square.isSelected}
                coords={square.coords}
                color={square.color}
                onClick={() => this.handleClick(square.id)} />
            </div>
          ))}
        </div>
        <div>
          <button
            className={submitButton}
            disabled={this.state.isSubmitted}
            style={{margin: '5px'}}
            onClick={(event) => this.submitBoard(event)}>
            Submit
          </button>
          <button
            className={resetButton}
            disabled={!this.props.piConnected}
            style={{margin: '5px'}}
            onClick={(event) => this.clearBoard(event)}>
            Clear
          </button>
        </div>
      </div>
    )
  }
}

export default Board
