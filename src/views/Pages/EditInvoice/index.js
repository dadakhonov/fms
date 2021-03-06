import React, {Component} from 'react';
import BarcodeReader from 'react-barcode-reader'
import {connect} from 'react-redux';
import {Routines} from 'common/api';
import './styles.css'
import CurrencyInput from 'react-currency-input';
import {Button, Clearfix, Col, ControlLabel, FormControl, FormGroup, Grid, Modal, Row} from "react-bootstrap";
import {Field, reduxForm} from 'redux-form'
import ReactCodeInput from 'react-code-input'
import TableList from "./TableList/TableList";
import ReactToPrint from "react-to-print";
import ComponentToPrint from "./Print/index";
import PrintInvoice from "../OrderProduct/Print/print_invoice";
import {clearProducts} from "../reducer";
import NotificationSystem from "react-notification-system";
import InputMask from 'react-input-mask';
import Select from 'react-select';
import {_discount, cities} from "../../../assets/Data/data";
import Autocomplete from 'react-autocomplete'
import Settings from '../OrderProduct/Settings/index'

var Barcode = require('react-barcode');

//eslint-disable import/first
function totalWeight(width, height, length, weight) {
    let volume = 0;
    let result = 0
    if (width > 0 && height > 0 && length > 0 && weight > 0) {
        volume = width * height * length / 6000;
        if (volume > weight) {
            result = Math.ceil(volume)
        } else {
            result = Math.ceil(weight)
        }
    }
    return result
}

function totalQuantity(products) {
    var quantity = 0
    if (products !== undefined) {
        for (let i = 0; i < products.length; i++) {
            quantity += parseInt(products[i].quantity)
        }
    }
    return quantity
}

function finalWeight(products) {
    let weight = 0
    if (products !== undefined) {
        for (let i = 0; i < products.length; i++) {
            weight += parseInt(products[i].weight)
        }
    }
    return weight
}


class EditInvoice extends Component {
    constructor(props) {
        super(props)
        this.state = {
            textList: [],
            rows: [],
            value: '',
            result: 'TAS2000003',
            selectedOption: null,
            city_from_a: '',
            city_to_a: '',
            tarif: '',
            sum: 0,
            region: '',
            box: '',
            showSettings: false,
            final_summ: 0,
            kg: false,
            package: this.props.products,
            tariff: 0,
            validate: false,
            for_additional_kg: 0,
            transit: false,
            to_be_taken_from_inside_city: false,
            to_be_taken_from_outside_city: false,
            to_be_delivered_to_inside_city: false,
            to_be_delivered_to_outside_city: false,
            _notificationSystem: null,
            ...this.props.invoceData,
            receiver_post_index: this.props.invoceData.receiver_post_index ? this.props.invoceData.receiver_post_index : 0,
            date: this.props.invoceData.created_date && this.props.invoceData.created_date.slice(0, 10),
            time: this.props.invoceData.created_date && this.props.invoceData.created_date.slice(11, 16)
        }
        this.handleScan = this.handleScan.bind(this)
        this.form = React.createRef();
        this.validate = this.validate.bind(this);
    }

    componentDidMount() {
        const {dispatch} = this.props
        Routines.admin.getRegions({}, dispatch)
        Routines.admin.tarifList({}, dispatch)
        Routines.admin.boxList({}, dispatch)
    }

    showNotification(label, error) {
        var _notificationSystem = this.refs.notificationSystem;

        _notificationSystem.addNotification({
            title: <span className="pe-7s-check"/>,
            message: (
                <div>
                    <p><b>{error.message}</b></p>
                </div>
            ),
            level: label,
            position: "tr",
            autoDismiss: 15
        });
    }

    onSubmit(event) {
        event.preventDefault()
        const {dispatch, products, summary} = this.props
        const {
            payment_card,
            payment_cash,
            to_be_paid_sender,
            payment_transfer,
            discount,
            region,
            box,
            INN,
            sender_organization,
            sender_f_l_m,
            sender_country,
            sender_region,
            date,
            time,
            sender_city, sender_line, sender_email, sender_phone, receiver_organization, receiver_f_l_m,
            receiver_country, receiver_region, receiver_city, receiver_email, receiver_phone, receiver_post_index,
            transit, send_message, to_be_taken_from_inside_city, to_be_taken_from_outside_city, to_be_delivered_to_inside_city, to_be_delivered_to_outside_city,
            paid, status
        } = this.state
        let payment_method
        let to_be_paid
        if (payment_card) {
            payment_method = "Card"
        } else if (payment_cash) {
            payment_method = "Cash"
        } else if (payment_transfer) {
            payment_method = "Transfer"
        }
        if (to_be_paid_sender) {
            to_be_paid = "Sender"
        } else {
            to_be_paid = "Receiver"
        }
        let phoneNum = sender_phone.trim(')')
        Routines.admin.createInvoice({
            request: {
                INN,
                region: region,
                box: box,
                tariff: summary && summary.tariff_id,

                sender_organization,
                sender_f_l_m,
                sender_country,
                sender_region,
                sender_city,
                sender_line,
                sender_email,
                sender_phone,

                receiver_organization,
                receiver_f_l_m,
                receiver_country,
                receiver_region,
                receiver_city,
                receiver_email,
                receiver_phone,
                receiver_post_index,
                transit,
                send_message,
                to_be_taken_from_inside_city,
                to_be_taken_from_outside_city,
                to_be_delivered_to_inside_city,
                to_be_delivered_to_outside_city,
                status: 'New',
                payment_method,
                to_be_paid,
                discount: discount ? discount : 0,
                package: products.map(item => {
                    return {
                        title: item.title,
                        width: item.width,
                        height: item.height,
                        length: item.length,
                        weight: item.weight,
                        quantity: item.quantity,
                    }
                }),
                total_price: summary.discount,
                created_date: date + 'T' + time
            }
        }, dispatch)
    }
    updateInvoice(event) {
        const {dispatch, products, summary} = this.props
        const {
            payment_card,
            payment_cash,
            to_be_paid_sender,
            payment_transfer,
            discount,
            region,
            box,
            INN,
            sender_organization,
            sender_f_l_m,
            sender_country,
            sender_region,
            date,
            time,
            sender_city, sender_line, sender_email, sender_phone, receiver_organization, receiver_f_l_m,
            receiver_country, receiver_region, receiver_city, receiver_email, receiver_phone, receiver_post_index,
            transit, send_message, to_be_taken_from_inside_city, to_be_taken_from_outside_city, to_be_delivered_to_inside_city, to_be_delivered_to_outside_city,
            paid, status
        } = this.state
        let payment_method
        let to_be_paid
        if (payment_card) {
            payment_method = "Card"
        } else if (payment_cash) {
            payment_method = "Cash"
        } else if (payment_transfer) {
            payment_method = "Transfer"
        }
        if (to_be_paid_sender) {
            to_be_paid = "Sender"
        } else {
            to_be_paid = "Receiver"
        }
        let phoneNum = sender_phone.trim(')')
        Routines.admin.updateInvoice({
            request: {
                INN,
                region: region,
                box: box,
                tariff: summary && summary.tariff_id,

                sender_organization,
                sender_f_l_m,
                sender_country,
                sender_region,
                sender_city,
                sender_line,
                sender_email,
                sender_phone,

                receiver_organization,
                receiver_f_l_m,
                receiver_country,
                receiver_region,
                receiver_city,
                receiver_email,
                receiver_phone,
                receiver_post_index,
                transit,
                send_message,
                to_be_taken_from_inside_city,
                to_be_taken_from_outside_city,
                to_be_delivered_to_inside_city,
                to_be_delivered_to_outside_city,
                status: 'New',
                payment_method,
                to_be_paid,
                discount: discount ? discount : 0,
                package: products.map(item => {
                    return {
                        title: item.title,
                        width: item.width,
                        height: item.height,
                        length: item.length,
                        weight: item.weight,
                        quantity: item.quantity,
                    }
                }),
                total_price: summary.discount,
                created_date: date + 'T' + time
            }
        }, dispatch)
    }
    validate() {
        return this.form.current && this.form.current.reportValidity();
    }

    handleScan(data) {
        const {dispatch, invoceData, reset} = this.props
        let resetFields = {
            ...invoceData
        }
        Routines.admin.scanList({
            request: {
                serial_code: data
            }
        }, dispatch)
            .then(res => {
                reset()
                this.setState({
                    result: data,
                })
                this.props.initialize(resetFields, true)
            })
            .catch(err => {

            })
    }

    calculate() {
        const {dispatch, reset, settings, products, data} = this.props
        const {is_weight, is_volume, tariff_summ, is_default} = settings
        const {
            discount,
            transit,
            to_be_delivered_to_outside_city,
            to_be_taken_from_inside_city,
            to_be_taken_from_outside_city,
            to_be_delivered_to_inside_city,
            sender_region,
            receiver_region
        } = this.state

        let reg1 = data && data.filter(q => q.title === sender_region).map(item => item.id)[0]
        let reg2 = data && data.filter(q => q.title === receiver_region).map(item => item.id)[0]

        let discount1 = discount ? discount : 0
        Routines.admin.calculate({
            request: {
                package: products.map(item => {
                    return {
                        title: item.title,
                        width: parseFloat(item.width),
                        height: parseFloat(item.height),
                        length: parseFloat(item.length),
                        weight: parseFloat(item.weight),
                        quantity: parseFloat(item.quantity)
                    }
                }),
                discount: parseFloat(discount1),
                sender_region: parseInt(reg1),
                reciever_region: parseInt(reg2),
                is_weight,
                is_volume,
                is_default,
                transit,
                to_be_taken_from_inside_city,
                to_be_taken_from_outside_city,
                to_be_delivered_to_inside_city,
                to_be_delivered_to_outside_city,
                for_additional_kg: parseFloat(tariff_summ)
            }
        }, dispatch)
    }

    onBlurText(event) {
        if (event.target.value.length === 0) {
            event.target.style.backgroundColor = '#ffecd5'
            event.target.style.borderColor = '#ff6957'
        } else {
            event.target.style.backgroundColor = '#fff';
            event.target.style.borderColor = 'lightgray'
        }
    }

    render() {
        const {serial_code, to_be_delivered} = this.props.invoceData
        const {data, products, boxList, isValid} = this.props
        let cash_disabled, card_diabled, transfer_disabled, sender_disabled, receiver_disabled
        const {payment_cash, payment_card, payment_transfer, to_be_paid_receiver, to_be_paid_sender, validate} = this.state
        if (payment_cash) {
            cash_disabled = false
            card_diabled = true
            transfer_disabled = true
        } else if (payment_card) {
            cash_disabled = true
            card_diabled = false
            transfer_disabled = true
        } else if (payment_transfer) {
            cash_disabled = true
            card_diabled = true
            transfer_disabled = false
        }
        if (to_be_paid_receiver) {
            sender_disabled = true
            receiver_disabled = false
        } else if (to_be_paid_sender) {
            sender_disabled = false
            receiver_disabled = true
        }
        const customStyles = {
            option: (provided, state) => {
                return ({
                    ...provided,
                    borderBottom: '1px dotted pink',
                    color: state.isSelected ? 'white' : 'black',
                })
            },
            input: (provided) => {
                return ({
                    ...provided,
                    padding: 0,
                    margin: 0
                })
            },
            dropdownIndicator: (provided) => {
                return ({
                    ...provided,
                    padding: 0,
                    margin: 0
                })
            },
            control: (provided, state) => {
                return ({
                    ...provided,
                    height: 30,
                    padding: 0,
                    minHeight: 30,
                    borderRadius: 5,
                    // borderColor: state.isFocused ?
                    //     '#ddd' : isValid ?
                    //         '#ddd' : 'red',
                    // // overwrittes hover style
                    // '&:hover': {
                    //     borderColor: state.isFocused ?
                    //         '#ddd' : isValid ?
                    //             '#ddd' : 'red'
                    // }
                })
            },
            singleValue: (provided, state) => {
                const opacity = state.isDisabled ? 0.5 : 1;
                const transition = 'opacity 300ms';

                return {...provided, opacity, transition};
            }
        }
        return (
            <Grid className="wrapper show-grid-container">

                <Modal
                    onHide={() => this.setState({showSettings: false})}
                    show={this.state.showSettings}
                >
                    <Settings close={() => this.setState({showSettings: false})}/>
                </Modal>
                <h4>
                    Форма заполнения накладной
                    <button style={{
                        backgroundColor: 'transparent',
                        border: 0,
                        position: 'absolute',
                        right: 10,
                        top: 50,
                        padding: '1px 15px',
                        // backgroundColor: '#ff6957',
                        borderRadius: 5
                    }}
                            onClick={() => {
                                this.props.clearProducts()
                                this.props.history.go('/main')
                            }}
                    >
                        <span style={{
                            fontSize: 14,
                            fontWeight: '600',
                            color: '#ff571d',
                        }}>Очистить</span>
                    </button>
                </h4>
                <NotificationSystem ref="notificationSystem"/>
                <form ref={this.form} onSubmit={(e) => this.onSubmit(e)}>
                    <Row>
                        <Col xs={12} md={6} className={'form-padding'}>
                            {/******* Header  *****/}
                            <Col xs={12} md={8} className={'form-padding'}>
                                <Col className={'form-padding'}>
                                    <FormGroup>
                                        <FormControl
                                            placeholder={'INN'}
                                            type={'text'}
                                            validate={validate}
                                            value={this.state.INN}
                                            onChange={(e) => this.setState({INN: e.target.value})}
                                        />
                                    </FormGroup>
                                </Col>
                                <Col xs={8} md={8} className={'form-padding'}>
                                    <Select
                                        name="form-field-name"
                                        id={'region'}
                                        styles={customStyles}
                                        placeholder={'TAS'}
                                        isSearchable
                                        value={data && data.filter(q => q.id === this.state.region).map(item => ({
                                            value: item.id,
                                            label: item.short
                                        }))[0]}
                                        onChange={(selectedOption) => this.setState({region: selectedOption.value})}
                                        options={data && data.map(item => ({
                                            value: item.id,
                                            label: item.short
                                        }))}
                                    />
                                </Col>
                                <Col xs={4} md={4} className={'form-padding'}>
                                    <Select
                                        name="box"
                                        id={'box'}
                                        styles={customStyles}
                                        placeholder={'Box'}
                                        isSearchable={true}
                                        onChange={(selectedOption) => this.setState({box: selectedOption.value})}
                                        options={boxList && boxList.map(item => ({
                                            value: item.id,
                                            label: item.number
                                        }))}
                                    />
                                </Col>
                            </Col>
                            <Col xs={12} md={4} className={'form-padding barcode-container'}>
                                <Barcode
                                    width={1.2}
                                    height={22}
                                    fontSize={14}
                                    value={serial_code ? serial_code : '123456789'}/>
                                <BarcodeReader
                                    onError={this.handleError}
                                    onScan={this.handleScan}
                                />
                            </Col>
                            {/****** Header of new form Отправитель  ******/}
                            <Col xs={12} md={12} className={'form-padding '}>
                                <Col className={'header-form'}><p>1. Отправитель</p></Col>
                            </Col>
                            {/**** ?????????????????????? ***/}
                            <Col xs={12} md={12}>
                                {/*********** 1 row ************/}
                                <Col md={4} sm={6} xs={12} className={'form-padding '}>
                                    <Col md={12} xs={12}>
                                        <FormGroup>
                                            <FormControl
                                                id={'sender_f_l_m'}
                                                placeholder={'Ф И О *'}
                                                required
                                                onBlur={(event) => this.onBlurText(event)}
                                                type={'text'}
                                                value={this.state.sender_f_l_m}
                                                onChange={(e) => this.setState({sender_f_l_m: e.target.value})}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md={12} sm={6} xs={12} className={'form-padding '}>
                                        <FormGroup>
                                            <FormControl
                                                id={'sender_organization'}
                                                placeholder={'Организация *'}
                                                onBlur={(event) => this.onBlurText(event)}
                                                required
                                                type={'text'}
                                                value={this.state.sender_organization}
                                                onChange={(e) => this.setState({sender_organization: e.target.value})}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Col>

                                <Col md={4} xs={12}>
                                    <Col md={12} sm={6} xs={12} className={'form-padding '}>
                                        <FormGroup>
                                            <FormControl
                                                id={'sender_country'}
                                                placeholder={'Страна'}
                                                type={'text'}
                                                value={this.state.sender_country}
                                                onChange={(e) => this.setState({sender_country: e.target.value})}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md={12} sm={6} xs={12} className={'form-padding '}>
                                        <FormGroup>
                                            <Autocomplete
                                                getItemValue={(item) => item.label}
                                                items={cities}
                                                inputProps={{
                                                    className: 'form-control',
                                                    placeholder: 'Город *',
                                                    required: true,
                                                    onBlur: (e) => this.onBlurText(e)
                                                }}
                                                shouldItemRender={(item, value) => item.label.toLowerCase().indexOf(value.toLowerCase()) > -1}
                                                menuStyle={{
                                                    borderRadius: '5px',
                                                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                                                    background: 'rgba(255, 255, 255, 0.9)',
                                                    padding: '2px 4px',
                                                    fontSize: '90%',
                                                    position: 'fixed',
                                                    overflow: 'auto',
                                                    maxHeight: '50%',
                                                    zIndex: 999
                                                }}
                                                renderItem={(item, isHighlighted) =>
                                                    <div style={{
                                                        background: isHighlighted ? '#ddecff' : 'white',
                                                        padding: '4px 8px',
                                                    }}>
                                                        <p style={{
                                                            fontWeight: isHighlighted ? '600' : '400',
                                                            fontSize: 12
                                                        }}>{item.label}</p>
                                                    </div>
                                                }
                                                value={this.state.sender_city}
                                                onChange={(e) => this.setState({sender_city: e.target.value})}
                                                onSelect={(sender_city) => this.setState({sender_city})}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Col>
                                <Col md={4} xs={12}>
                                    <Col md={12} sm={6} xs={12} className={'form-padding '}>
                                        <FormGroup>
                                            <InputMask mask="+\9\98(99)-999-99-99"
                                                       value={this.state.sender_phone}
                                                       placeholder={'Телефон *'}
                                                       id={'sender_phone'}
                                                       required
                                                       onBlur={(event) => this.onBlurText(event)}
                                                       className={'form-control'}
                                                       onChange={(e) => this.setState({sender_phone: e.target.value})}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md={12} sm={6} xs={12} className={'form-padding '}>
                                        <FormGroup>
                                            <FormControl
                                                id={'email'}
                                                placeholder={'Ваш email'}
                                                type={'mail'}
                                                value={this.state.email}
                                                onChange={(e) => this.setState({email: e.target.value})}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Col>
                                <Col md={12} xs={12}>
                                    <Col md={6} sm={6} xs={12} className={'form-padding '}>
                                        <FormGroup>
                                            <FormControl
                                                id={'sender_line'}
                                                placeholder={'Адрес'}
                                                type={'text'}
                                                value={this.state.sender_line}
                                                onChange={(e) => this.setState({sender_line: e.target.value})}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md={6} sm={6} xs={12} className={'form-padding '}>
                                        <FormGroup>
                                            <Select
                                                name="form-field-name"
                                                id={'sender_region'}
                                                styles={customStyles}
                                                placeholder={'Область *'}
                                                inputProps={{required: true}}
                                                value={data && data.filter(q => q.title === this.state.sender_region).map(item => ({
                                                    value: item.title,
                                                    label: item.title
                                                }))[0]}
                                                isSearchable={true}
                                                onChange={(selectedOption) => this.setState({sender_region: selectedOption.value})}
                                                options={data && data.map(item => ({
                                                    value: item.title,
                                                    label: item.title
                                                }))}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Col>
                            </Col>

                            {/****** Header of new form Получатель  ******/}
                            <Col xs={12} md={12} className={'form-padding '}>
                                <Col className={'header-form'}><p>2. Получатель</p></Col>
                            </Col>
                            <Col xs={12} md={12}>
                                {/*********** 1 row ************/}
                                <Col xs={12} md={4}>
                                    <Col md={12} sm={6} xs={12} className={'form-padding '}>
                                        <FormGroup>
                                            <FormControl
                                                id={'receiver_f_l_m'}
                                                placeholder={'Ф.И.О. *'}
                                                required
                                                onBlur={(event) => this.onBlurText(event)}
                                                type={'text'}
                                                value={this.state.receiver_f_l_m}
                                                onChange={(e) => this.setState({receiver_f_l_m: e.target.value})}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md={12} sm={6} xs={12} className={'form-padding '}>
                                        <FormGroup>
                                            <FormControl
                                                id={'receiver_organization'}
                                                placeholder={'Организация *'}
                                                required
                                                type={'text'}
                                                onBlur={(event) => this.onBlurText(event)}
                                                value={this.state.receiver_organization}
                                                onChange={(e) => this.setState({receiver_organization: e.target.value})}
                                            />
                                        </FormGroup>
                                    </Col>

                                    <Col md={12} sm={6} xs={12} className={'form-padding '}>
                                        <FormGroup>
                                            <FormControl
                                                id={'receiver_country'}
                                                placeholder={'Страна'}
                                                type={'text'}
                                                value={this.state.receiver_country}
                                                onChange={(e) => this.setState({receiver_country: e.target.value})}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md={12} sm={6} xs={12} className={'form-padding '}>
                                        <FormGroup>

                                            <Autocomplete
                                                getItemValue={(item) => item.label}
                                                items={cities}
                                                inputProps={{
                                                    className: 'form-control',
                                                    placeholder: 'Город *',
                                                    required: true,
                                                    onBlur: (e) => this.onBlurText(e)
                                                }}
                                                shouldItemRender={(item, value) => item.label.toLowerCase().indexOf(value.toLowerCase()) > -1}
                                                menuStyle={{
                                                    borderRadius: '5px',
                                                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                                                    background: 'rgba(255, 255, 255, 0.9)',
                                                    padding: '2px 4px',
                                                    fontSize: '90%',
                                                    position: 'fixed',
                                                    overflow: 'auto',
                                                    maxHeight: '50%',
                                                    zIndex: 999
                                                }}
                                                renderItem={(item, isHighlighted) =>
                                                    <div style={{
                                                        background: isHighlighted ? '#ddecff' : 'white',
                                                        padding: '4px 8px'
                                                    }}>
                                                        <p style={{
                                                            fontWeight: isHighlighted ? '600' : '400',
                                                            fontSize: 12
                                                        }}>{item.label}</p>
                                                    </div>
                                                }
                                                value={this.state.receiver_city}
                                                onChange={(e) => this.setState({receiver_city: e.target.value})}
                                                onSelect={(receiver_city) => this.setState({receiver_city})}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Col>

                                <Col xs={12} md={4}>
                                    <Col md={12} sm={6} xs={12} className={'form-padding '}>
                                        <Select
                                            name="form-field-name"
                                            id={'receiver_region'}
                                            styles={customStyles}
                                            required
                                            placeholder={'Область *'}
                                            value={data && data.filter(q => q.title === this.state.receiver_region).map(item => ({
                                                value: item.title,
                                                label: item.title
                                            }))[0]}
                                            isSearchable={true}
                                            onChange={(selectedOption) => this.setState({receiver_region: selectedOption.value})}
                                            options={data && data.map(item => ({
                                                value: item.title,
                                                label: item.title
                                            }))}
                                        />
                                    </Col>

                                    <Col md={12} sm={6} xs={12} className={'form-padding '}>
                                        <FormGroup>
                                            <FormControl
                                                id={'receiver_line'}
                                                placeholder={'Адрес'}
                                                type={'text'}
                                                value={this.state.receiver_line}
                                                onChange={(e) => this.setState({receiver_line: e.target.value})}
                                            />
                                        </FormGroup>
                                    </Col>

                                    <Col md={12} sm={6} xs={12} className={'form-padding '}>
                                        <FormGroup>
                                            <InputMask mask="+\9\98(99)-999-99-99"
                                                       value={this.state.receiver_phone}
                                                       placeholder={'Телефон *'}
                                                       required
                                                       id={'receiver_phone'}
                                                       onBlur={(event) => this.onBlurText(event)}
                                                       className={'form-control'}
                                                       onChange={(e) => this.setState({receiver_phone: e.target.value})}
                                            />
                                        </FormGroup>
                                    </Col>

                                    <Col md={12} sm={6} xs={12} className={'form-padding '}>
                                        <FormGroup>
                                            <FormControl
                                                id={'receiver_email'}
                                                placeholder={'Ваш email'}
                                                type={'text'}
                                                value={this.state.receiver_email}
                                                onChange={(e) => this.setState({receiver_email: e.target.value})}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Col>
                                <Col xs={12} md={4} className={'form-padding index-container'}>
                                    <Col xs={12} md={12} className={'index-text-container'}>
                                        <span>Индекс </span>
                                    </Col>
                                    <Col xs={12} md={12} className={'form-padding '}>

                                        <ReactCodeInput
                                            autoFocus={false}
                                            type={'text'}
                                            value={JSON.stringify(this.state.receiver_post_index)}
                                            onChange={e => this.setState({receiver_post_index: e})}
                                            id={'receiver_post_index'}
                                            fields={6}

                                        />
                                    </Col>
                                    <Col xs={12} md={12} className={'form-padding checkbox-container '}>
                                        <p>Отправить <b>СМС</b> получателью</p>
                                        <label className="container-checkbox">
                                            <input
                                                checked={this.state.send_message}
                                                onChange={() => this.setState({send_message: !this.state.send_message})}
                                                type="checkbox"/>
                                            <span className="checkmark"/>
                                        </label>
                                    </Col>
                                </Col>
                            </Col>
                            {/****** 3   Описание  груза  ******/}
                            <Col xs={12} md={12} className={'form-padding '}>
                                <Col className={'header-form table-volume-container'}>
                                    <p>3. Описание груза</p>
                                    <button
                                        type={'button'}
                                        onClick={() => this.setState({showSettings: !this.state.showSettings})}
                                        style={{
                                            backgroundColor: 'transparent',
                                            border: 0,
                                            margin: 10,
                                            padding: 0,
                                        }}>
                                        <img
                                            style={{
                                                margin: 0,
                                                padding: 0,
                                            }}
                                            src={require('../OrderProduct/Recources/settings2.png')}/>
                                    </button>
                                </Col>
                            </Col>
                            <Col xs={12} md={12} className={'form-padding table-container'}>
                                <TableList products={this.state.package_list}/>

                                <Col xs={12} md={6} className={'date-time-container'}>
                                    <Col md={8} xs={8} className={'date-container'}>
                                        <ControlLabel>Дата</ControlLabel>
                                        <FormGroup>
                                            <FormControl
                                                id={'date'}
                                                type={'date'}
                                                placeholder={'Дата'}
                                                onChange={e => this.setState({date: e.target.value})}
                                                value={this.state.date}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col md={8} xs={8} className={'date-container '}>
                                        <ControlLabel>Время</ControlLabel>
                                        <FormGroup>
                                            <FormControl
                                                id={'time'}
                                                type={'time'}
                                                value={this.state.time}
                                                onChange={(e) => this.setState({time: e.target.value})}
                                            />
                                        </FormGroup>
                                    </Col>
                                </Col>
                                <Col xs={12} md={6} className={'options-text-container'}>
                                    <p>
                                        Я подтверждаю, что отправление/груз не содержит запрещенных к
                                        пересылке/перевозке
                                        предметов.
                                        С условиями контракта(договора) на оборотной
                                        стороне настоящего документа ознакомлен
                                        и согласен. Согласие получателя на таможенное
                                        сопровождение (если применимо) получено
                                    </p>
                                </Col>
                                <Col xs={12} md={6} className={'signature-container'}>
                                    <p>Подпись представителя FMS,
                                        расшифровка подписи</p>
                                    <FormControl
                                        readOnly
                                        type={'text'}
                                    />
                                </Col>
                                <Col xs={12} md={6} className={'signature-container'}>
                                    <p>Подпись отправителя,
                                        расшифровка подписи</p>
                                    <FormControl
                                        readOnly
                                        type={'text'}
                                    />
                                </Col>
                            </Col>
                        </Col>

                        <Col xs={12} md={6} className={'form-padding '}>
                            {/* Виды сервисы */}
                            <Col xs={12} md={6} className={'form-padding '}>
                                <Col xs={12} md={12} className={'header-form form-padding'}>
                                    <p>
                                        4. Вид сервиса
                                    </p>
                                </Col>
                                <Col xs={12} md={12} className={'trucking-container form-padding'}>
                                    <Col xs={12} md={12} className={'avia-trucking-container first'}>
                                        <p>
                                            Вызов курьера до города
                                        </p>
                                        <label className="container-checkbox">
                                            <input type={'checkbox'}
                                                   id={'to_be_picked'}
                                                   checked={this.state.to_be_taken_from_inside_city}
                                                   onChange={e => this.setState({to_be_taken_from_inside_city: !this.state.to_be_taken_from_inside_city})}
                                            />
                                            <span className="checkmark"/>
                                        </label>
                                    </Col>
                                    <Col xs={12} md={12} className={'avia-trucking-container first'}>
                                        <p>
                                            Вызов курьера до района
                                        </p>
                                        <label className="container-checkbox">
                                            <input type={'checkbox'}
                                                   id={'to_be_picked'}
                                                   checked={this.state.to_be_taken_from_outside_city}
                                                   onChange={e => this.setState({to_be_taken_from_outside_city: !this.state.to_be_taken_from_outside_city})}
                                            />
                                            <span className="checkmark"/>
                                        </label>
                                    </Col>
                                    <Col xs={12} md={12} className={'avia-trucking-container form-padding'}>
                                        <p>Доставка до города</p>
                                        <label className="container-checkbox">
                                            <input type={'checkbox'}
                                                   id={'to_be_delivered'}
                                                   checked={this.state.to_be_delivered_to_inside_city}
                                                   onChange={e => this.setState({to_be_delivered_to_inside_city: !this.state.to_be_delivered_to_inside_city})}
                                            />
                                            <span className="checkmark"/>
                                        </label>
                                    </Col>
                                    <Col xs={12} md={12} className={'avia-trucking-container form-padding'}>
                                        <p>Доставка до района</p>
                                        <label className="container-checkbox">
                                            <input type={'checkbox'}
                                                   id={'to_be_delivered'}
                                                   checked={this.state.to_be_delivered_to_outside_city}
                                                   onChange={e => this.setState({to_be_delivered_to_outside_city: !this.state.to_be_delivered_to_outside_city})}
                                            />
                                            <span className="checkmark"/>
                                        </label>
                                    </Col>
                                    <Col xs={12} md={12} className={'avia-trucking-container form-padding'}>
                                        <p>Трансфер</p>
                                        <label className="container-checkbox">
                                            <input type={'checkbox'}
                                                   id={'to_be_delivered'}
                                                   checked={this.state.transit}
                                                   onChange={e => this.setState({transit: !this.state.transit})}
                                            />
                                            <span className="checkmark"/>
                                        </label>
                                    </Col>
                                    <Col xs={12} md={12} className={'form-padd ing trucking-sub-container'}>
                                        <p>Отправитель</p>
                                        <label className="container-checkbox">
                                            <input type={'checkbox'}
                                                   id={'to_be_paid_sender'}
                                                   checked={this.state.to_be_paid_sender}
                                                   onChange={e => this.setState({to_be_paid_sender: !this.state.to_be_paid_sender})}
                                            />
                                            <span className="checkmark"/>
                                        </label>
                                    </Col>
                                </Col>
                            </Col>
                            {/* Виды оплаты */}
                            <Col xs={12} md={6} className={'form-padding '}>
                                <Col xs={12} md={12} className={'header-form form-padding'}>
                                    <p>
                                        5. Вид оплаты
                                    </p>
                                </Col>
                                <Col xs={12} md={12} className={'trucking-container form-padding'}>
                                    <Col xs={12} md={12} className={'avia-trucking-container first'}>
                                        <p>
                                            Наличные
                                        </p>
                                        <label className="container-checkbox">
                                            <input type={'checkbox'}
                                                   disabled={cash_disabled}
                                                   checked={this.state.payment_cash}
                                                   onChange={() => this.setState({payment_cash: !this.state.payment_cash})}
                                            />
                                            <span className="checkmark"/>
                                        </label>
                                    </Col>
                                    <Col xs={12} md={12} className={'avia-trucking-container form-padding'}>
                                        <p>Пластиковая карта</p>
                                        <label className="container-checkbox">
                                            <input type={'checkbox'}
                                                   disabled={card_diabled}
                                                   checked={this.state.payment_card}
                                                   onChange={() => this.setState({payment_card: !this.state.payment_card})}
                                            />
                                            <span className="checkmark"/>
                                        </label>
                                    </Col>
                                    <Col xs={12} md={12} className={'avia-trucking-container form-padding last'}>
                                        <p>Перечислением</p>
                                        <label className="container-checkbox">
                                            <input type={'checkbox'}
                                                   onChange={() => this.setState({payment_transfer: !this.state.payment_transfer})}
                                                   disabled={transfer_disabled}
                                                   checked={this.state.payment_transfer}
                                            />
                                            <span className="checkmark"/>
                                        </label>
                                    </Col>
                                    <Col xs={12} md={12}
                                         className={'avia-trucking-container form-padding sale-container'}>
                                        <FormGroup>
                                            <Autocomplete
                                                getItemValue={(item) => item.label}
                                                items={_discount}
                                                inputProps={{className: 'form-control', placeholder: 'Скидки(%)'}}
                                                shouldItemRender={(item, value) => item.label.toLowerCase().indexOf(value.toLowerCase()) > -1}
                                                menuStyle={{
                                                    borderRadius: '5px',
                                                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                                                    background: 'rgba(255, 255, 255, 0.9)',
                                                    padding: '2px 4px',
                                                    fontSize: '90%',
                                                    position: 'fixed',
                                                    overflow: 'auto',
                                                    maxHeight: '50%',
                                                    zIndex: 999
                                                }}
                                                renderItem={(item, isHighlighted) =>
                                                    <div style={{
                                                        background: isHighlighted ? '#ddecff' : 'white',
                                                        padding: '4px 8px',
                                                    }}>
                                                        <p style={{
                                                            fontWeight: isHighlighted ? '600' : '400',
                                                            fontSize: 12
                                                        }}>{item.label}</p>
                                                    </div>
                                                }
                                                value={this.state.discount}
                                                onChange={(e) => this.setState({discount: e.target.value})}
                                                onSelect={(discount) => this.setState({discount})}
                                            />
                                        </FormGroup>
                                    </Col>
                                    <Col xs={12} md={12} className={'form-padding empty-container'}>
                                    </Col>
                                    <Col xs={12} md={12} className={'form-padding trucking-sub-container'}>
                                        <p>Получатель</p>
                                        <label className="container-checkbox">
                                            <input type={'checkbox'}
                                                   id={'to_be_paid_receiver'}
                                                   disabled={receiver_disabled}
                                                   checked={this.state.to_be_paid_receiver}
                                                   onChange={e => this.setState({to_be_paid_receiver: !this.state.to_be_paid_receiver})}
                                            />
                                            <span className="checkmark"/>
                                        </label>
                                    </Col>
                                </Col>
                            </Col>
                            <Col xs={12} md={12} className={'form-padding'}>

                            </Col>
                            <Clearfix/>
                            <Col xs={12} md={6} className={'options-container-right'}>
                                <p>
                                    Я подтверждаю, что отправление/груз поступило в закрытом виде, отсутствуют внешние
                                    повреждения упаковки,перевязки, печатей (пломб). Количество и вес отправления/ груза
                                    соответствует количеству мест и весу,
                                    определенному при его приеме. Я подтверждаю,что обладаю необходимыми полномочиями
                                    для
                                    получения груза
                                </p>
                            </Col>
                            <Col xs={12} md={6} className={'signature-container signature-container-right'}>
                                <p>Подпись отправителя,
                                    расшифровка подписи</p>
                                <FormControl
                                    readOnly
                                    type={'text'}
                                />
                            </Col>
                            <Clearfix/>
                            <Col xs={12} md={12} className={'form-padding '}>
                                <Col className={'header-form'}><p>6. Сумма к оплате</p></Col>
                            </Col>
                            <Col xs={12} md={6} className={'form-padding tarif'}>
                                <Col md={12} xs={12} className={' tarif-fsm-container'}>
                                    <p>Тариф за услуги FMS</p>
                                </Col>
                                <Col md={12} xs={12} className={'oformit-container'}>
                                    <Button type={'button'} onClick={() => this.calculate()}>
                                        Рассчитать
                                    </Button>
                                </Col>
                                <Col md={12} xs={12} className={'oformit-container'}>
                                    <div style={{
                                        display: 'none'
                                    }}>
                                        <ComponentToPrint
                                            sender_client={this.state.sender_f_l_m}
                                            receiver_client={this.state.receiver_f_l_m}
                                            sender_region={data && data.filter(q => q.title === this.state.sender_region).map(item => item.short)[0]}
                                            receiver_region={data && data.filter(q => q.title === this.state.receiver_region).map(item => item.short)[0]}
                                            sender_phone={this.state.sender_phone}
                                            receiver_phone={this.state.receiver_phone}
                                            receiver_organization={this.state.receiver_organization}
                                            serial_code={serial_code}
                                            delivery={to_be_delivered}
                                            quantity={totalQuantity(products)}
                                            weight={finalWeight(products)}
                                            sum={this.props.summary && this.props.summary.discount}
                                            ref={el => (this.componentRef = el)}/>
                                    </div>
                                    <div style={{display: 'none'}}>
                                        <PrintInvoice ref={el => (this.componentRef1 = el)}/>
                                    </div>
                                </Col>
                            </Col>
                            <Col xs={12} md={6} className={'form-padding total-sum'}>
                                <Col className={'total-text'}>
                                    <p>
                                        Итого
                                    </p>
                                </Col>
                                <Col className={'total-number'}>
                                    <p>
                                        <b>{this.props.summary && this.props.summary.discount ? this.props.summary.discount.toFixed(2) : (this.props.invoceData ? this.props.invoceData.total_price : '0')} сум</b>
                                    </p>
                                </Col>
                            </Col>
                            <Col lg={12}>
                                <Col md={12} xs={12}>
                                    <Col md={3} xs={2} className={'print-conatiner form-padding'}>

                                        <Button onClick={() => this.props.row && this.deleteInvoice(this.props.row.id)}>Удалить</Button>
                                    </Col>
                                    <Col md={3} xs={3} className={'print-conatiner form-padding'}>
                                        <ReactToPrint
                                            trigger={() => <Button>Распечатать</Button>}
                                            content={() => this.componentRef}
                                        />
                                    </Col>
                                    <Col md={3} xs={3} className={'oformit-container form-padding'}>
                                        <Button type={'submit'} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between'
                                        }}>
                                            <img src={require('../DeliveringOrder/Resource/orange.png')}/>
                                            Оформить
                                            <img src={require('../DeliveringOrder/Resource/sq.png')}/>
                                        </Button>
                                    </Col>
                                    <Col md={3} xs={3} className={'oformit-container form-padding'}>
                                        <Button type={'button'} onClick={() => this.updateInvoice()}>
                                            Сохранить
                                        </Button>
                                    </Col>
                                </Col>
                            </Col>
                        </Col>

                    </Row>
                </form>
            </Grid>
        );
    }
}

EditInvoice = reduxForm({
    form: 'getOrderProduct'
})(EditInvoice)


const mapStateToProps = state => {

    return {
        data: state.orderProduct.regions,
        processing: state.orderProduct.processing,
        invoceData: state.invoice_reducer.invoice,
        products: state.invoice_reducer.products,
        delivery: state.orderProduct.delivery,
        boxList: state.orderProduct.boxList,
        tarifList: state.orderProduct.tarifList,
        searchProcessing: state.searchText.processing,
        settings: state.orderProduct.settings,
        summary: state.orderProduct.summary,
    };
};
const mapsDispatch = dispatch => {
    return {
        clearProducts: () => dispatch(clearProducts())
    }
}
export default connect(mapStateToProps, mapsDispatch)(EditInvoice);
