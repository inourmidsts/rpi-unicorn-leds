import Exponent from 'exponent';
import React, { Component } from 'react';
import { Entypo, FontAwesome } from '@exponent/vector-icons';
import io from 'socket.io-client/socket.io';
import { Font } from 'exponent';

import {
  StyleSheet,
  Text,
  View,
  ListView,
  TouchableHighlight,
} from 'react-native';

const socket = io('https://light-art.herokuapp.com', {});

socket.on('connect', () => {
  console.log('React Native is connected to the Server!');
});

socket.on('updateState', function (data) {
    console.log(data);
  });

class App extends Component {
  async componentDidMount() {
    await Font.loadAsync({
      'PressStart2P-Regular': require('./assets/fonts/PressStart2P-Regular.ttf'),
      'VT323-Regular': require('./assets/fonts/VT323-Regular.ttf'),
    });
    this.setState({ fontLoaded: true });
  }

  constructor () {
    super()
    this.state = { piConnected: true, fontLoaded: false }
    this.fetchPiStatus()

    socket.on('connect', () => {
      socket.emit('authentication', {key: process.env.REACT_APP_SOCKET_KEY})

      socket.on('unauthorized', (err) => {
        console.log("There was an error with the authentication:", err.message)
      })

      socket.on('authenticated', () => {
        console.log('React Web app authenticated!')
      })

      socket.emit("clientConnected")
    })
  }

  fetchPiStatus = () => {
    // if pi is connected, set state to true
    socket.on('piConnected', () => {
      this.setState({ piConnected: true})
    })

    // if pi is disconnected, set state to false
    socket.on('piDisconnected', () => {
      this.setState({ piConnected: false})
    })
  }

  sendMessage = (message, data) => {
    socket.emit(message, data)
  }

  render() {
    return (
      <View style={styles.container}>
        <Header fontLoaded={this.state.fontLoaded} />
        <Board />
        <Footer />
      </View>
    );
  }
}


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

  handlePress = (id) => {
    console.log(id)
    const squares = this.state.squares.slice()
    squares[id].isSelected = !squares[id].isSelected
    squares[id].color = this.state.color
    this.setState({squares: squares})
  }

  render () {
    return (
      <View style={styles.squares}>
        {this.state.squares.map((square) => (
          <View key={square.id} style={styles.square}>
            <Square
              id={square.id}
              isSelected={square.isSelected}
              coords={square.coords}
              color={square.color}
              onPress={() => this.handlePress(square.id)} />
          </View>
        ))}
      </View>
    )
  }
}

function Square({ isSelected, onPress, color }) {
  // var squareStyle;
  //
  // if (isSelected) {
  //   squareStyle = {backgroundColor: 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')', width: '100%', height: '100%'}
  // } else {
  //   squareStyle = {backgroundColor: '#2c3e50', width: '100%', height: '100%'}
  // }

  var squareStyle;

  // if (isSelected) {
  //   squareStyle = {backgroundColor: 'rgb(' + color.r + ',' + color.g + ',' + color.b + ')', width: '100%', height: '100%'}
  // } else {
    squareStyle = {backgroundColor: '#2c3e50', width: 38, height: 38}
  // }
  return (
    <View>
      <TouchableHighlight onPress={onPress} style={squareStyle}>
        <View />
      </TouchableHighlight>
    </View>

  );
}

function Header({ fontLoaded }) {
  return (
    <View style={styles.header}>
      {
        fontLoaded ? (
        <View style={{flex: 1, alignItems: 'center'}}>
          <Text style={{ ...Font.style('PressStart2P-Regular'), fontSize: 16, marginTop: 20 }}>
            Make Pixel LED Art
          </Text>
          <Text style={{ ...Font.style('VT323-Regular'), fontSize: 18, marginTop: 10, marginBottom: 4,marginLeft: 40, marginRight: 40, textAlign: 'center', color: 'blue' }}><FontAwesome name="magic" size={14} /> Pick colors.</Text>
          <Text style={{ ...Font.style('VT323-Regular'), fontSize: 18, marginBottom: 4, marginLeft: 40, marginRight: 40, textAlign: 'center', color: 'teal' }}><FontAwesome name="hand-pointer-o" size={14} /> Click squares.</Text>
          <Text style={{ ...Font.style('VT323-Regular'), fontSize: 18, marginLeft: 40, marginBottom: 4, marginRight: 40, textAlign: 'center', color: 'green'}}><FontAwesome name="envelope-o" size={14} /> Send a design to my Raspberry Pi!</Text>
        </View>
        ) : null
      }
    </View>
  )
}

function Footer() {
  return (
      <View style={styles.footer}>
        <Text>Made with <Entypo name="heart-outlined" size={20} color="red" /> by Stephanie </Text>
      </View>
    );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#dcdcdc',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'column',
  },
  header: {
    flex: .2,
    marginTop: 20,
  },
  footer: {
    flex: .1,
    marginBottom: 5,
  },
  square: {
    width: 38,
    height: 38,
    margin: -1,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'black'
  },
  squares: {
    flex: .7,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    width: 300
  }
});

Exponent.registerRootComponent(App);
