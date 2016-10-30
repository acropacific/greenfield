import styles from 'style';
import React from 'react';

class PlaylistItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      done: false
    };
  }

  toggle() {
    this.setState({ done: !this.state.done });
  }

  render() {
    var style = { textDecoration: this.state.done ? 'underline' : 'none' };

    return (
      <tr style={style} onMouseEnter={this.toggle.bind(this)} onMouseLeave={this.toggle.bind(this)} onClick={ () => this.props.handleClick(this.props.item) }>
				<td> <strong>{this.props.item.username}</strong> </td>
				<td> {this.props.item.title} </td>
				<td> {this.props.item.description} </td>
          <td> {this.props.item.id} </td>
			</tr>
    );
  }
}

export default PlaylistItem;
