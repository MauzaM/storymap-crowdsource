import $ from 'jquery';
import React from 'react'; // eslint-disable-line no-unused-vars
import ReactDOM from 'reactDom';
import Geocoder from 'esri/dijit/Geocoder';
import LocateButton from 'esri/dijit/LocateButton';
import Locator from 'esri/tasks/locator';
import lang from 'dojo/_base/lang';
import webMercatorUtils from 'esri/geometry/webMercatorUtils';
import Point from 'esri/geometry/Point';
import Graphic from 'esri/graphic';
import GraphicsLayer from 'esri/layers/GraphicsLayer';
import Color from 'dojo/_base/Color';
import SimpleMarkerSymbol from 'esri/symbols/SimpleMarkerSymbol';
import SimpleLineSymbol from 'esri/symbols/SimpleLineSymbol';
import {getIcon} from 'babel/utils/helper/icons/IconGenerator';
import Helper from 'babel/utils/helper/Helper';
import Validator from 'babel/utils/validations/Validator';
import IconTooltip from 'babel/components/helper/tooltip/IconTooltip';
import FormGroup from 'babel/components/forms/base/FormGroup';
import ViewerText from 'i18n!translations/viewer/nls/template';

export default class Location extends FormGroup {

  constructor(props) {
    super(props);

    this.defaultValidations = ['location'];

    this.input = {
      value: false
    };
    this.locator = new Locator('//geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer');

    this.onSelect = this.onSelect.bind(this);
    this.onAutocomplete = this.onAutocomplete.bind(this);
    this.onClear = this.onClear.bind(this);
    this.onBlur = this.onBlur.bind(this);

    this.geocodeMapPoint = this.geocodeMapPoint.bind(this);
    this.parseResultForGeoPoint = this.parseResultForGeoPoint.bind(this);
    this.reverseGeocode = this.reverseGeocode.bind(this);
    this.setLocationValue = this.setLocationValue.bind(this);
  }

  componentDidMount() {
    const geocoderNode = ReactDOM.findDOMNode(this.geocoderContainer);
    const locatorNode = ReactDOM.findDOMNode(this.locatorContainer);

    $(geocoderNode).append($('<div class="geocoder-container"></div>'));
    $(locatorNode).append($('<div class="locator-container"></div>'));

    this.geocoderContainer = $(geocoderNode).find('.geocoder-container');
    this.locatorContainer = $(locatorNode).find('.locator-container');

    this.geocoder = new Geocoder({
      autoComplete: true,
      highlightLocation: false,
      minCharacters: 1,
      map: this.props.map,
      theme: 'calcite-geocoder'
    },this.geocoderContainer[0]);

    this.locateButton = new LocateButton({
      map: this.props.map,
      highlightLocation: false,
      theme: 'calcite-locate'
    },this.locatorContainer[0]);

    this.locatorContainer = $(locatorNode).find('.calcite-locate');
    this.locatorContainer.find('.zoomLocateButton').addClass('btn btn-default btn-sm').html('<div class="locator-icon">\
      <img class="loading-gif" src="resources/images/loader-light.gif" alt="' + ViewerText.contribute.form.location.gettingLocation + '">' + getIcon('location') + '</div>\
      <span class="locating-text">' + ViewerText.contribute.form.location.gettingLocation + '\</span>\
      <span class="locate-text">' + ViewerText.contribute.form.location.locate + '\</span>');

    this.geocoderSeachButton = $(geocoderNode).find('.esriGeocoderSearch');
    this.geocoderSeachButton.attr('tabindex',-1);

    this.geocoderResetButton = $(geocoderNode).find('.esriGeocoderReset');
    this.geocoderResetButton.attr('tabindex',-1);

    this.geocoderInput = $(geocoderNode).find('input');
    this.geocoderInput.addClass('form-control');
    this.geocoderInput.attr('id',this.props.id);

    this.geocoderAutocomplete = $(geocoderNode).find('.esriGeocoderResults');
    this.geocoderAutocomplete.addClass('form-control');

    this.locateButton.on('locate',this.reverseGeocode);
    this.locatorContainer.on('keypress',(e) => {
      if (e.which === 13) {
        this.locateButton.locate();
      }
    });

    this.addInputAttributes();

    this.validator = new Validator({
      validations: this.getValidations(),
      attribute: this.props.attribute || this.props.label
    });

    this.geocoder.on('auto-complete',this.onAutocomplete);
    this.geocoder.on('clear',this.onClear);
    this.geocoder.on('select',this.onSelect);
    this.geocoder.on('find-results',(response) => {
      if (response && response.results && response.results.results[0]) {
        const result = response.results.results[0].name;
        const location = this.parseResultForGeoPoint(result);

        if (location) {
          this.reverseGeocode(location);
        }
      }
    });
    this.geocoderInput.on('blur',this.onBlur);

    this.geocoder.startup();
    this.locateButton.startup();

    // Define Graphic and Add Graphics Layer to map
    this.locationSymbol = new SimpleMarkerSymbol('circle', 16,new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color([204, 62, 68, 1]), 3),new Color([255, 255, 255, .5]));
    this.locationLayer = new GraphicsLayer();
    this.props.map.addLayer(this.locationLayer);
    this.props.map.on('click',this.geocodeMapPoint);
  }

  componentDidUpdate() {
    this.addInputAttributes();
    this.validator.setValidations(this.getValidations());

    if (this.props.locationFromOtherSource && JSON.stringify(this.props.locationFromOtherSource) !== JSON.stringify(this.locationFromOtherSource) && this.props.locationFromOtherSource.latLong) {
      this.locationFromOtherSource = this.props.locationFromOtherSource;
      if (!this.state.changed || confirm(ViewerText.contribute.form.location.photoLocation)) { //eslint-disable-line no-alert
        this.reverseGeocode();
      }
    }
  }

  componentWillUnmount() {
    this.geocoder.clear();
    this.locateButton.clear();
    this.geocoder.destroy();
    this.locateButton.destroy();
    this.props.map.removeLayer(this.locationLayer);
    this.props.map.off('click',this.geocodeMapPoint);
  }

  render() {

    const inputClasses = Helper.classnames([this.props.className,'location','form-geocoder','form-group',{
      'required': this.props.required,
      'has-error': !this.state.isValid
    }]);

    return (
      <div className={inputClasses}>
        <label htmlFor={this.props.id} className="control-label">{this.props.label}</label>
        {this.props.tooltip ? <IconTooltip className="form-tooltip" {...this.props.tooltip} /> : null}
        <div
          className="geocoder"
          ref={(ref) => this.geocoderContainer = ref}>
        </div>
        <div
          className="locator"
          ref={(ref) => this.locatorContainer = ref}>
        </div>
        { this.state.reverseCoords ? (
          <a href="#" onClick={this.reverseGeocode.bind(this,this.state.reverseCoords)}><small><strong>Did you mean?</strong> Longitude: {this.state.reverseCoords.longLatResult[0]} Latitude: {this.state.reverseCoords.longLatResult[1]}?</small></a>
        ) : null }
        {this.getErrorMessage ? this.getErrorMessage() : null}
      </div>
    );
  }

  addInputAttributes() {
    $.each(this.props.inputAttr,(key,value) => {
      this.geocoderInput.attr(key,value);
    });
  }

  onSelect(selection) {
    this.locateButton.clear();
    this.geocoderInput.val(selection.result.name);
    if (selection.result) {
      this.setLocationValue({
        inputVal: this.geocoderInput.val(),
        dataVal: {
          name: selection.result.name,
          geometry: selection.result.feature.geometry
        }
      });
    }
    this.validateForm();
  }

  onClear() {
    this.setState({
      reverseCoords: null
    });
    this.setLocationValue({
      inputVal: this.geocoderInput.val(),
      dataVal: false
    });
    if (this.state.changed) {
      this.validateForm();
    }
  }

  onAutocomplete() {
    const latLong = this.parseResultForGeoPoint(this.geocoderInput.val());

    if (latLong) {
      setTimeout(() => {
        this.geocoder._hideResultsMenu();
      },0);
      this.setLocationValue({
        setReverseCoords: true,
        inputVal: this.geocoderInput.val(),
        dataVal: {
          name: this.geocoderInput.val(),
          geometry: latLong.webMercatorResult
        }
      });
      this.validateForm();
    } else if (this.geocoder.results.length === 0) {
      this.setLocationValue({
        inputVal: this.geocoderInput.val(),
        dataVal: 'no results'
      });
      this.validateForm();
    } else {
      this.setLocationValue({
        inputVal: this.geocoderInput.val(),
        dataVal: false
      });
      this.validateForm();
    }
  }

  onBlur() {
    setTimeout(() => {
      this.validateForm();
      const latLong = this.parseResultForGeoPoint(this.geocoderInput.val());

      if (latLong) {
        this.reverseGeocode(latLong,true);
      } else if (!this.input.value.dataVal && !this.geocoderAutocomplete.is(':visible') && this.geocoder.results && this.geocoder.results.length > 0) {
        if (this.geocoder.results[0].magicKey) {
          const params = {
            delay: 0,
            search: this.geocoder.results[0].text,
            magicKey: this.geocoder.results[0].magicKey
          };

          this.geocoder._query(params).then(lang.hitch(this.geocoder, (response) => {
            // select location
            this.geocoder.select(response.results[0]);
          }));
        } else if (this.geocoder.results.length > 0) {
          this.geocoder.select(this.geocoder.results[0]);
        }
      }
    },0);
  }

  geocodeMapPoint(e) {
    this.reverseGeocode({
      graphic: {
        geometry: e.mapPoint
      }
    });
  }

  reverseGeocode(response,setReverseCoords) {
    let point;

    if (response && response.graphic) {
      point = response.graphic.geometry;
    } else if (response && response.hasBeenMoved && response.geometry) {
      point = response.geometry;
    } else if (response && response.longLatResult) {
      point = response.webMercatorResult;
    } else if (this.props.locationFromOtherSource && this.props.locationFromOtherSource.type === 'latLong' && this.props.locationFromOtherSource.latLong) {
      point = webMercatorUtils.geographicToWebMercator(new Point(this.props.locationFromOtherSource.latLong.longitude,this.props.locationFromOtherSource.latLong.latitude));
    }

    if (point) {
      this.locator.locationToAddress(point,100, (res) => {
        if (res.address && res.address.Match_addr) {
          this.geocoderInput.val(res.address.Match_addr);
          this.setLocationValue({
            inputVal: this.geocoderInput.val(),
            dataVal: {
              name: res.address.Match_addr,
              geometry: point
            }
          });
        } else {
          const name = response.position.coords.latitude + ', ' + response.position.coords.longitude;

          this.geocoderInput.val(res.address.Match_addr);
          this.setLocationValue({
            setReverseCoords,
            inputVal: this.geocoderInput.val(),
            dataVal: {
              name: name,
              geometry: response.graphic.geometry
            }
          });
        }
        this.validateForm();
      },() => {
        const geoPt = webMercatorUtils.webMercatorToGeographic(point);
        const longitude = Math.round(parseFloat(geoPt.x) * 1000) / 1000;
        const latitude = Math.round(parseFloat(geoPt.y) * 1000) / 1000;
        const locationString = longitude === 0 && latitude === 0
          ? ViewerText.contribute.form.location.nullIsland
          : ViewerText.contribute.form.location.longitude + ': ' + longitude + ' ' + ViewerText.contribute.form.location.latitude + ': ' + latitude;

        this.geocoderInput.val(locationString);
        this.setLocationValue({
          setReverseCoords,
          inputVal: locationString,
          dataVal: {
            name: locationString,
            geometry: point
          }
        });
        this.validateForm();
      });
    }
  }

  parseResultForGeoPoint(result,setReverseCoords) {

    if (result.search(ViewerText.contribute.form.location.longitude + ': ') === 0) {
      result = this.geocoderInput.val().replace(ViewerText.contribute.form.location.longitude + ': ','').replace(ViewerText.contribute.form.location.latitude + ': ','');
    }
    let array;

    if (result.split(' ').length === 2) {
      const stringArray = result.split(' ');

      array = [parseFloat(stringArray[0]),parseFloat(stringArray[1])];
    } else if (result.split(',').length === 2) {
      const stringArray = result.split(',');

      array = [parseFloat(stringArray[0]),parseFloat(stringArray[1])];
    }

    if (array && typeof array[0] === 'number'
       && !isNaN(array[0])
       && typeof array[1] === 'number'
       && !isNaN(array[1])) {
         if (Math.abs(array[1]) > 90) {
           this.setState({
             reverseCoords: null
           });
           return {
             longLatResult: [array[1],array[0]],
             webMercatorResult: webMercatorUtils.geographicToWebMercator(new Point(array[1],array[0]))
           };
         } else {
           if (setReverseCoords && Math.abs(array[0]) <= 90) {
             this.setState({
               reverseCoords: {
                 longLatResult: [array[1],array[0]],
                 webMercatorResult: webMercatorUtils.geographicToWebMercator(new Point(array[1],array[0]))
               }
             });
           } else {
             this.setState({
               reverseCoords: null
             });
           }
           return {
             longLatResult: [array[0],array[1]],
             webMercatorResult: webMercatorUtils.geographicToWebMercator(new Point(array[0],array[1]))
           };
         }
    } else {
      this.setState({
        reverseCoords: null
      });
      return false;
    }
  }

  setLocationValue(options) {
    this.input.value = {
      inputVal: options.inputVal,
      dataVal: options.dataVal
    };

    if (!this.state.changed) {
      this.setState({
        changed: true
      });
    }

    this.parseResultForGeoPoint(options.inputVal,options.setReverseCoords);

    if (this.locationLayer.graphics.length > 0) {
      this.locationLayer.graphics[0];
      if (typeof this.locationLayer.graphics[0].clearMoveableEvents === 'function') {
        this.locationLayer.graphics[0].clearMoveableEvents();
      }
      this.locationLayer.remove(this.locationLayer.graphics[0]);
    }

    if (this.input.value.dataVal && this.input.value.dataVal.geometry && this.locationLayer.graphics.length === 0) {
      const graphic = new Graphic(this.input.value.dataVal.geometry,this.locationSymbol);

      this.locationLayer.add(graphic);
      this.props.map.centerAt(this.input.value.dataVal.geometry);
      const moveable = new Helper.mapUtils.MoveableGraphic({
        map: this.props.map,
        layer: this.locationLayer,
        graphic,
        onMoveEndCallback: this.reverseGeocode
      });

      graphic.clearMoveableEvents = moveable.clean;
    }
  }
}
