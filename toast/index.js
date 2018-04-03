/*
 * @param{
 * show: bool
 * text: string
 * icon:'info/success/error/loading'
 * autoHideDuration:INT 
 * autoClose: ()=>{}
 * afterClose: ()=>{}
 */
import './style.scss';
import React, {Component}      from 'react';
import classNames from 'classnames';

class Toast extends Component {

	shouldComponentUpdate(nextProps, nextState) {
		return this.props.show != nextProps.show || this.props.text != nextProps.text
	}

	componentDidUpdate() {
		let {autoHideDuration = 2000, autoClose, afterClose} = this.props;
		if (this.t) {
			clearTimeout(this.t);
		}
		this.t = null;
		if (autoClose) {
			this.t = setTimeout(() => {
				autoClose && autoClose();
				afterClose && afterClose();
			}, autoHideDuration);
		}
	}

	renderToast() {
		const props = this.props;
		const {className, icon, text, bgColor = 'rgba(0, 0, 0, .7)'} = props;

		return (

			<div className={`c-toast-root ${className}`} style={this.getData('rootStyle')(bgColor)}>
				{icon && <div className="icon">{this.getData('icon')(icon)}</div>}
				<div className="text">
					<span>{text}</span>
				</div>
			</div>

		);
	}

	render() {
		return (
			this.props.show ?
				<div className='c-toast-wrapper'>
					{
						this.renderToast()
					}
				</div>
				: null
		)
	}

	getData(type) {
		return {
			'rootStyle': (bgColor) => ({
				background: bgColor
			}),
			'icon': icon => {
				if (Object.prototype.toString.call(icon).indexOf('String') < 0) {
					return icon;
				}
				return {
					'info': <i className="icon-info-circle icon-60"/>,
					'success': <i className="icon-success-toast icon-60"/>,
					'error': <i className="icon-error-toast icon-60"/>,
					'loading': <i className="icon-loading icon-60"/>,
					[null]: null
				}[icon]
			}
		}[type]
	}
}

export default Toast;