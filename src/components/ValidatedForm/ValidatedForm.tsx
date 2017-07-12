import * as React from 'react';
import { createForm } from 'rc-form';

export interface Props {
  form: {
    getFieldProps: any,
    getFieldError: any,
    validateFields: any,
  },
  style?: React.CSSProperties,
  onSubmit: (values: [any]) => void,
  onSubmitError: (values: [any], error: Error) => void,
}

class ValidatedForm extends React.Component<Props, {}> {

  onSubmit = (e: any) => {
    e.preventDefault();
    this.props.form.validateFields((error: Error, values: [any]) => {
      if (!error) {
        this.props.onSubmit(values);
      } else {
        this.props.onSubmitError(values, error);
      }
    });
  }

  render() {
    return(
      <form onSubmit={this.onSubmit} style={this.props.style}>
        {this.props.children && React.Children.map(this.props.children, (child: any) => {
          return React.cloneElement(child, {form: this.props.form});
        })}
      </form>
    );
  }
}

export default createForm()(ValidatedForm);
