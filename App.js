import React from 'react';
import { Font } from 'expo';
import { StyleSheet, Text, View, TextInput, Button, Keyboard, Image,
    TouchableHighlight, ScrollView } from 'react-native';
import { StackNavigator } from 'react-navigation';

class DecisionScreen extends React.Component {
    constructor(props) {
        super(props);

        Keyboard.dismiss();

        this.state = {
            decision: '',
        }
    }

    render() {
        return (
            <View style={{flex: 1, flexDirection: 'column'}}>
              <View style={stylesDecision.decisionViewContainer}>
                <Text style={stylesDecision.decisionTitle}>Decision</Text>
              </View>

              <View style={stylesDecision.decisionView}>
                <Text style={stylesDecision.decisionText}>{this._getDecision()}</Text>

                <Button title="Pick again" onPress={this._setDecision.bind(this)}/>
              </View>
            </View>
        );
    }

    _getDecision() {
        let choices = this.props.navigation.state.params.choices;
        let val = Math.round(Math.random() * choices.length - 0.5);
        console.log("Val: " + val);

        return choices[val].msg;
    }

    _setDecision() {
        this.setState({
            decision: this._getDecision(),
        });
    }
}

class ChoicesScreen extends React.Component {
    constructor(props) {
        super(props);

        this.saveStates = 0;

        this.state = {
            choices: [],
            choiceIDs: [],
            keyTracker: 0,
            keyboardFillingView: 0,
            titleViewSize: 1,
        }
    }

    static navigationOptions = {
        header: null,
    };

    componentWillMount() {
        this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow.bind(this));
        this.keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide.bind(this));
    }

    componentWillUnmount() {
        this.keyboardDidShowListener.remove();
        this.keyboardDidHideListener.remove();
    }

    render() {
        return (
            <View style={{flex: 1, flexDirection: 'column', justifyContent: 'space-between'}}>
              <View style={{flex: this.state.titleViewSize, backgroundColor: 'mediumaquamarine',}}>
                <Text style={stylesChoices.mainTitle}>Choices</Text>
                <Text style={stylesChoices.titleSeparator}>________________________</Text>
              </View>

              <View style={stylesChoices.mainLayout}>
                <ScrollView keyboardShouldPersistTaps={'always'}>

                    {this._getChoices()}
                  <AddChoice optionNum={'' + (this.state.choices.length + 1)}
                             addChoice={this._addChoice.bind(this)} />
                </ScrollView>
              </View>

              <View style={{flex: this.state.keyboardFillingView,
                  backgroundColor: 'mediumaquamarine'}}>
                <Button
                    onPress={this._onDecidePress.bind(this)}
                    title="Make a decision" />
              </View>
            </View>
        );
    }

    _addChoice(text) {
        // Do not allow blank choices
        if (text === '') {
            return;
        }

        const choice = {
            id: this.state.keyTracker,
            msg: text,
            deleteChoice: this._deleteChoice.bind(this),
        };

        this.setState({
            choices: this.state.choices.concat([choice]),
            choiceIDs: this.state.choiceIDs.concat([choice.id]),
            ketTracker: ++this.state.keyTracker,
        });
    }

    _deleteChoice(key) {
        let index = this.state.choiceIDs.indexOf(key);
        let temp = [];
        let tempIDs = [];
        for (let j = 0; j < this.state.choices.length; j++) {
            if (j !== index) {
                temp.push(this.state.choices[j]);
                tempIDs.push(this.state.choiceIDs[j]);
            }
        }

        this.setState({
            choices: temp,
            choiceIDs: tempIDs,
        });
    }

    _getChoices() {
        return this.state.choices.map(
            (c) => {
                return <Choice key={c.id} val={c.id} text={c.msg} deleteChoice={this._deleteChoice.bind(this)}/>;
            }
        )
    }

    _keyboardDidShow() {
        this.setState({
            keyboardFillingView: 4.4,
            titleViewSize: 1.8,
        });
    }

    _keyboardDidHide() {
        this.setState({
            keyboardFillingView: 0,
            titleViewSize: 1,
        });
    }

    _onDecidePress() {
        const { navigate } = this.props.navigation;

        if (this.state.choices.length > 0) {
            navigate('Decision', {choices: this.state.choices});
        }
    }
}

class Choice extends React.Component {
    render() {
        return (
            <View style={stylesChoices.choice}>
              <Text style={stylesChoices.choiceText}>{this.props.text}</Text>

              <TouchableHighlight style={stylesChoices.choiceButtonContainer} onPress={this._deleteChoice.bind(this)}>
                <Image style={stylesChoices.choiceButtonImage} source={require('./res/Buttons/Delete.png')}/>
              </TouchableHighlight>
            </View>
        );
    }

    _deleteChoice() {
        this.props.deleteChoice(this.props.val);
    }
}

class AddChoice extends React.Component {
    constructor() {
        super();

        this.state = {
            text: '',
        };
    }

    render() {
        return (
            <View style={stylesChoices.addChoice}>
              <TextInput ref={'textInput'}
                         style={stylesChoices.addChoiceTextInput}
                         placeholder={'Option #' + this.props.optionNum}
                         onChangeText={(text) => this.setState({text})}
                         multiline={false}
                         placeholderTextColor={'black'} />

              <TouchableHighlight style={stylesChoices.choiceButtonContainer} onPress={this._createChoice.bind(this)}>
                <Image style={stylesChoices.choiceButtonImage} source={require('./res/Buttons/Add.png')}/>
              </TouchableHighlight>
            </View>
        );
    }

    // Clear the TextInput field for the next entry
    _clearTextInput(field) {
        this.refs[field].setNativeProps({text: ''});
    }

    _createChoice() {
        this.props.addChoice(this.state.text);
        this._clearTextInput('textInput');

        // Reset text
        this.setState({
            text: '',
        });

        Keyboard.dismiss();
    }
}

const DeciderApp = StackNavigator({
    AddChoices: { screen: ChoicesScreen },
    Decision: { screen: DecisionScreen },
});

export default class App extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <DeciderApp />
    }
}

const stylesDecision = StyleSheet.create({
    decisionViewContainer: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: 'mediumaquamarine',
    },
    decisionView: {
        flex: 6,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'mediumaquamarine',
    },
    decisionTitle: {
        fontFamily: 'sans-serif-thin',
        fontSize: 58,
        textAlign: 'center',
        color: 'black',
        marginTop: 15,
    },
    decisionText: {
        fontFamily: 'sans-serif-thin',
        fontSize: 48,
        textAlign: 'center',
        color: 'black',
        marginBottom: 20,
    },
});

const stylesChoices = StyleSheet.create({
    mainLayout: {
        flex: 4,
        backgroundColor: 'mediumaquamarine',
    },
    titleLayout: {

    },
    mainTitle: {
        color: 'black',
        fontFamily: 'sans-serif-thin',
        fontSize: 36,
        textAlign: 'center',
        marginTop: 40,
    },
    titleSeparator: {
        color: 'black',
        fontFamily: 'sans-serif-thin',
        fontSize: 18,
        textAlign: 'center',
        marginBottom: 18,
    },
    addChoice: {
        flexDirection: 'row',
    },
    addChoiceTextInput: {
        flex: 10,
        margin: 10,
        marginTop: 10,
        marginRight: 5,
        height: 40,
    },
    choice: {
        flexDirection: 'row',
    },
    addChoiceButton: {
        flex: 1,
    },
    choiceText: {
        flex: 10,
        color: 'black',
        fontFamily: 'sans-serif-thin',
        fontWeight: 'bold',
        fontSize: 18,
        textAlign: 'center',
        marginTop: 10,
        marginBottom: 10,
    },
    choiceButtonContainer: {
        width: 32,
        height: 32,
        borderRadius: 16,
        marginTop: 4,
        marginRight: 7,
    },
    choiceButtonImage: {
        width: 32,
        height: 32,
        borderRadius: 16,
    },
});
