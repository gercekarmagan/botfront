import { Meteor } from 'meteor/meteor';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import React from 'react';
import {
    Menu, Icon, Dropdown, Popup, Message,
} from 'semantic-ui-react';

import { wrapMeteorCallback } from '../utils/Errors';
import Chat from './Chat';

class ProjectChat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            key: 0,
            languageOptions: null,
            selectedLanguage: null,
        };
    }

    componentDidMount() {
        this.loadInstance();
        this.loadAvailableLanguages();
    }

    loadInstance = () => {
        const { channel } = this.props;
        if (!channel) return this.setState({ noChannel: true });
        return this.setState({
            socketUrl: channel.base_url,
            path: channel.socket_path,
        });
    };

    loadAvailableLanguages = () => {
        const { projectId } = this.props;
        Meteor.call(
            'nlu.getPublishedModelsLanguages',
            projectId,
            wrapMeteorCallback((err, res) => {
                this.setState({
                    languageOptions: res.map(model => ({
                        text: model.language,
                        value: model.language,
                    })),
                    selectedLanguage: res[0] ? res[0].language : '',
                });
                // When it renders for the first time,  language is not passed to the widget and thus not associated
                // to the message. Hence Rasa fails adding the language param to the NLG request. So we (shouldn't) need to...
                this.rerenderChatComponent();
            }),
        );
    };

    handleReloadChat = () => {
        window.localStorage.removeItem('chat_session');
        this.rerenderChatComponent();
    };

    handleLangChange = (e, { value }) => {
        this.setState({
            selectedLanguage: value,
        });
        this.handleReloadChat();
    };

    rerenderChatComponent = () => {
        // This key state update is a trick
        // to force React to unmount and remount the widget
        // rather than just updating it
        this.setState(state => ({
            key: state.key ? 0 : 1,
        }));
    };

    render() {
        const {
            key, socketUrl, languageOptions, selectedLanguage, noChannel, path,
        } = this.state;
        const { triggerChatPane, projectId } = this.props;
        return (
            <div className='chat-pane-container' data-cy='chat-pane'>
                <Menu pointing secondary>
                    <Menu.Item>
                        {selectedLanguage && (
                            <Dropdown
                                options={languageOptions}
                                selection
                                onChange={this.handleLangChange}
                                value={selectedLanguage}
                                data-cy='chat-language-option'
                            />
                        )}
                    </Menu.Item>
                    <Menu.Menu position='right'>
                        <Menu.Item>
                            <Popup
                                trigger={(
                                    <Icon
                                        name='redo'
                                        color='grey'
                                        link={!noChannel}
                                        onClick={this.handleReloadChat}
                                        disabled={noChannel}
                                        data-cy='restart-chat'
                                    />
                                )}
                                content='Restart the conversation'
                                position='bottom right'
                                className='redo-chat-popup'
                                disabled={noChannel}
                            />
                        </Menu.Item>
                        <Menu.Item>
                            <Popup
                                trigger={(
                                    <Icon
                                        name='close'
                                        color='grey'
                                        link
                                        onClick={triggerChatPane}
                                        data-cy='close-chat'
                                    />
                                )}
                                content='Close the conversation'
                                position='bottom right'
                                className='redo-chat-popup'
                            />
                        </Menu.Item>
                    </Menu.Menu>
                </Menu>
                {socketUrl && path && (
                    <Chat
                        socketUrl={socketUrl}
                        key={key}
                        language={selectedLanguage}
                        path={path}
                    />
                )}
                {noChannel && (
                    <Message
                        content={(
                            <div>
                                Go to <Icon name='setting' />
                                Settings &gt; <Icon name='server' />
                                Instances to{' '}
                                <Link
                                    to={`/project/${projectId}/settings`}
                                    onClick={triggerChatPane}
                                    data-cy='settings-link'
                                >
                                    create{' '}
                                </Link>
                                a valid instance of Rasa to enable the chat window.
                            </div>
                        )}
                        className='no-core-message'
                        warning
                        data-cy='no-core-instance-message'
                    />
                )}
            </div>
        );
    }
}

ProjectChat.propTypes = {
    projectId: PropTypes.string.isRequired,
    triggerChatPane: PropTypes.func.isRequired,
    channel: PropTypes.object.isRequired,
};

export default ProjectChat;
