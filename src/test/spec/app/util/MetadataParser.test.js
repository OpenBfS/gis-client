Ext.Loader.syncRequire(['Koala.util.MetadataParser']);

var timeseriesMetadata = {
  '@xmlns:bfs': 'http://geonetwork.org/bfs',
  '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
  '@xmlns:gmd': 'http://www.isotc211.org/2005/gmd',
  '@xmlns:gml': 'http://www.opengis.net/gml',
  '@xmlns:gts': 'http://www.isotc211.org/2005/gts',
  '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
  '@gco:isoType': 'gmd:MD_Metadata',
  '@xsi:schemaLocation': 'http://www.isotc211.org/2005/gmd http://www.isotc211.org/2005/gmd/gmd.xsd    http://www.isotc211.org/2005/srv http://schemas.opengis.net/iso/19139/20060504/srv/srv.xsd',
  'gmd:fileIdentifier': {'gco:CharacterString': {
    '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
    '#text': '08e36567-cf9a-4e22-8774-e83a3452da7b'
  }},
  'gmd:language': {'gmd:LanguageCode': {
    '@codeList': 'http://www.loc.gov/standards/iso639-2/',
    '@codeListValue': 'eng'
  }},
  'gmd:characterSet': {'gmd:MD_CharacterSetCode': {
    '@codeListValue': 'utf8',
    '@codeList': 'http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/codelist/ML_gmxCodelists.xml#MD_CharacterSetCode'
  }},
  'gmd:hierarchyLevel': {'gmd:MD_ScopeCode': {
    '@codeList': 'http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/codelist/ML_gmxCodelists.xml#MD_ScopeCode',
    '@codeListValue': ''
  }},
  'gmd:contact': null,
  'gmd:dateStamp': {'gco:DateTime': {
    '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
    '#text': '2018-03-28T11:42:51'
  }},
  'gmd:metadataStandardName': {'gco:CharacterString': {
    '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
    '#text': 'ISO 19115:2003/19139'
  }},
  'gmd:metadataStandardVersion': {'gco:CharacterString': {
    '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
    '#text': '1.0'
  }},
  'gmd:identificationInfo': {'gmd:MD_DataIdentification': {
    'gmd:citation': {'gmd:CI_Citation': {
      'gmd:title': {'gco:CharacterString': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '#text': 'ODL brutto 10min'
      }},
      'gmd:date': {'gmd:CI_Date': {
        'gmd:date': {'gco:DateTime': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '2015-01-30T00:00:00'
        }},
        'gmd:dateType': {'gmd:CI_DateTypeCode': {
          '@codeListValue': 'publication',
          '@codeList': 'http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/codelist/ML_gmxCodelists.xml#CI_DateTypeCode'
        }}
      }}
    }},
    'gmd:abstract': {'gco:CharacterString': {
      '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
      '#text': 'TODO'
    }},
    'gmd:status': null,
    'gmd:pointOfContact': {'gmd:CI_ResponsibleParty': {
      'gmd:individualName': {'gco:CharacterString': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '#text': 'Ansprechpartner für Geodaten'
      }},
      'gmd:organisationName': {'gco:CharacterString': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '#text': 'Bundesamt für Strahlenschutz'
      }},
      'gmd:positionName': {'gco:CharacterString': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '#text': 'SW 2.1'
      }},
      'gmd:contactInfo': {'gmd:CI_Contact': {
        'gmd:phone': {'gmd:CI_Telephone': {
          'gmd:voice': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '@gco:nilReason': 'missing',
            'gco:CharacterString': null
          },
          'gmd:facsimile': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '@gco:nilReason': 'missing',
            'gco:CharacterString': null
          }
        }},
        'gmd:address': {'gmd:CI_Address': {
          'gmd:deliveryPoint': {'gco:CharacterString': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '#text': 'Willy-Brandt-Str. 5'
          }},
          'gmd:city': {'gco:CharacterString': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '#text': 'Salzgitter'
          }},
          'gmd:administrativeArea': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '@gco:nilReason': 'missing',
            'gco:CharacterString': null
          },
          'gmd:postalCode': {'gco:CharacterString': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '#text': '38226'
          }},
          'gmd:country': {'gco:CharacterString': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '#text': 'Deutschland'
          }},
          'gmd:electronicMailAddress': {'gco:CharacterString': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '#text': 'info@bfs.de'
          }}
        }}
      }},
      'gmd:role': {'gmd:CI_RoleCode': {
        '@codeListValue': 'pointOfContact',
        '@codeList': 'http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/codelist/ML_gmxCodelists.xml#CI_RoleCode'
      }}
    }},
    'gmd:language': {'gco:CharacterString': {
      '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
      '#text': 'eng'
    }}
  }},
  'bfs:layerInformation': {'bfs:MD_Layer': {
    'bfs:legendTitle': {'gco:CharacterString': {
      '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
      '#text': 'ODL brutto 10min'
    }},
    'bfs:printTitle': {'gco:CharacterString': {
      '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
      '#text': 'ODL brutto 10min'
    }},
    'bfs:layerType': {'bfs:MD_WMSLayerType': {
      'bfs:URL': {
        'bfs:host': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'http://bfs-docker.intranet.terrestris.de'
        }},
        'bfs:path': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '/ogc/imis/wms?'
        }}
      },
      'bfs:layer': {'gco:CharacterString': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '#text': 'imis:odl_brutto_10min'
      }},
      'bfs:transparent': {'gco:Boolean': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '#text': 'true'
      }},
      'bfs:version': {'gco:CharacterString': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '#text': '1.3.0'
      }},
      'bfs:styles': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '@gco:nilReason': 'missing',
        'gco:CharacterString': null
      },
      'bfs:format': {'gco:CharacterString': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '#text': 'image/png'
      }}
    }},
    'bfs:wfs': {'bfs:URL': {
      'bfs:host': {'gco:CharacterString': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '#text': 'http://bfs-docker.intranet.terrestris.de'
      }},
      'bfs:path': {'gco:CharacterString': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '#text': '/ogc/imis/ows?'
      }}
    }},
    'bfs:download': {
      'bfs:URL': {
        'bfs:host': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'http://bfs-docker.intranet.terrestris.de'
        }},
        'bfs:path': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '/ogc/imis/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=imis:odl_brutto_10min'
        }}
      },
      'bfs:filterFieldStart': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '@gco:nilReason': 'missing',
        'gco:CharacterString': null
      },
      'bfs:filterFieldEnd': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '@gco:nilReason': 'missing',
        'gco:CharacterString': null
      }
    },
    'bfs:filter': [
      {'bfs:MD_PointInTimeFilter': {
        'bfs:paramName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'end_measure'
        }},
        'bfs:interval': {'gco:Integer': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '10'
        }},
        'bfs:unit': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'minutes'
        }},
        'bfs:minDate': {
          'bfs:TimeFormat': {'gco:CharacterString': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '#text': 'Y-m-d H:i:s'
          }},
          'bfs:TimeInstant': {'gco:CharacterString': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '#text': '2012-01-01 00:00:00'
          }}
        },
        'bfs:maxDate': {
          'bfs:TimeFormat': {'gco:CharacterString': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '#text': 'Y-m-dTH:i:sZ'
          }},
          'bfs:TimeInstant': {'gco:CharacterString': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '#text': '2018-01-22 12:00:00'
          }}
        },
        'bfs:defaultValue': {
          'bfs:TimeFormat': {'gco:CharacterString': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '#text': 'Y-m-d H:i:s'
          }},
          'bfs:TimeInstant': {'gco:CharacterString': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '#text': '2017-07-22 12:00:00'
          }}
        }
      }},
      {'bfs:MD_ValueFilter': {
        'bfs:paramName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'test_data'
        }},
        'bfs:paramAlias': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'Testdaten'
        }},
        'bfs:defaultValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'false'
        }},
        'bfs:allowedValues': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': [
                        {
              'val': 'true',
              'dsp': 'true'
            },
                        {
              'val': 'false',
              'dsp': 'false'
            }
          ]
        }},
        'bfs:operator': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '='
        }},
        'bfs:allowMultipleSelect': {'gco:Boolean': null},
        'bfs:encodeInViewParams': {'gco:Boolean': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_ValueFilter': {
        'bfs:paramName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'STYLES'
        }},
        'bfs:paramAlias': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'Darstellung'
        }},
        'bfs:defaultValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'microSv_h_odl_brutto_10min_routine'
        }},
        'bfs:allowedValues': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': [
                        {
              'val': 'microSv_h_odl_brutto_10min_routine',
              'dsp': 'µSv/h (Routine)'
            },
                        {
              'val': 'microSv_h_odl_brutto_10min_intensiv',
              'dsp': 'µSv/h (Intensiv)'
            }
          ]
        }},
        'bfs:operator': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '='
        }},
        'bfs:allowMultipleSelect': {'gco:Boolean': null},
        'bfs:encodeInViewParams': {'gco:Boolean': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_ValueFilter': {
        'bfs:paramName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'source'
        }},
        'bfs:paramAlias': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'Messnetz'
        }},
        'bfs:defaultValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '\'BfS\''
        }},
        'bfs:allowedValues': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': [
                        {
              'val': '\'BfS\'',
              'dsp': 'BfS'
            },
                        {
              'val': '\'KFUE\'',
              'dsp': 'KFü'
            }
          ]
        }},
        'bfs:operator': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '='
        }},
        'bfs:allowMultipleSelect': {'gco:Boolean': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }},
        'bfs:encodeInViewParams': {'gco:Boolean': null}
      }}
    ],
    'bfs:olProperty': [
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'hoverTpl'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '[[locality_name]]<br>[[end_measure]]<br>Messwert (�Sv/h): [[value]]'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'htmlContentProperty'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '<object data="http://localhost/resources/indexZS.html" width="650" height="600" type="text/html">Tagesgraphik<\/object>'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'allowHover'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'allowClone'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'allowDownload'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'allowRemoval'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'allowOpacityChange'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'hasLegend'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'singleTile'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'showCartoWindow'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'cartoWindowLineStyle'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '#294d71,4'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'allowClone'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }}
    ],
    'bfs:timeSeriesChartProperty': [
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'dataFeatureType'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'imis:odl_brutto_10min_timeseries'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'param_viewparams'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'locality_code:[[id]]'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'shapeType'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'line'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'curveType'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'curveStepBefore'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'xAxisAttribute'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'end_measure'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'yAxisAttribute'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'value'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'xAxisScale'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'time'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'end_timestamp'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '2018-01-22T12:00:00'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'end_timestamp_format'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'Y-m-d H:i:s'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'duration'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'PT4H'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'yAxisScale'
        }},
        'bfs:propertyValue': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '@gco:nilReason': 'missing',
          'gco:CharacterString': null
        }
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'yAxisMin'
        }},
        'bfs:propertyValue': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '@gco:nilReason': 'missing',
          'gco:CharacterString': null
        }
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'yAxisMax'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '0.4'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'dspUnit'
        }},
        'bfs:propertyValue': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '@gco:nilReason': 'missing',
          'gco:CharacterString': null
        }
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'colorSequence'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '#312783,#e4003a,#65b32e,#f39200,#6b4796,#009dd1,#b0348b,#00823f,#564a44,#312783,#e4003a,#65b32e,#f39200,#6b4796,#009dd1,#b0348b,#00823f,#564a44'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'titleTpl'
        }},
        'bfs:propertyValue': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '@gco:nilReason': 'missing',
          'gco:CharacterString': null
        }
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'seriesTitleTpl'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '[[locality_name]]'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'tooltipTpl'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '<b>[[locality_name]]<\/b><br>Datum: [[end_measure]]<br>Messwert in �Sv/h: [[value]]'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'yAxis_grid'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '\\{\\"odd\\":\\{\\"opacity\\":1,\\"fill\\":\\"#ddd\\",\\"stroke\\":\\"#bbb\\",\\"lineWidth\\":1\\}\\}'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'featureIdentifyField'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'id'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'featureIdentifyFieldDataType'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'string'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'featureShortDspField'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'locality_name'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'allowAddSeries'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'allowZoom'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'allowFilterForm'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'allowAddSeries'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'showGrid'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'backgroundColor'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '#EEEBEB'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'gridStrokeColor'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '#d3d3d3'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'gridStrokeWidth'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '1'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'gridStrokeOpacity'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '0.5'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'labelColor'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '#294d71'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'labelPadding'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '50'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'yAxisFormat'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': ',.3f'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'chartMargin'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '30,200,60,80'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'labelSize'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '13'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'legendEntryMaxLength'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '20'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'tickPadding'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '0'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'tickSize'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '3'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'strokeWidth'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '2'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'strokeOpacity'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '1'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'titleColor'
        }},
        'bfs:propertyValue': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '@gco:nilReason': 'missing',
          'gco:CharacterString': null
        }
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'titlePadding'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '10'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'titleSize'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '12'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'xAxisLabel'
        }},
        'bfs:propertyValue': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '@gco:nilReason': 'missing',
          'gco:CharacterString': null
        }
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'rotateXAxisLabel'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'yAxisLabel'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '�Sv/h'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'xAxisMax'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '2018-01-22 12:00:00'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'xAxisMin'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '2012-01-01 00:00:00'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'showTimeseriesGrid'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'thresholds_off'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': [
                        {
              'value': 0.4,
              'tooltip': 'Tooltip 1',
              'stroke': '#ff0000',
              'lineWidth': 1,
              'dasharray': '3, 3',
              'label': 'Schwellenwert 1'
            },
                        {
              'value': 0.05,
              'stroke': '#00ff00',
              'lineWidth': 1,
              'dasharray': '3, 3',
              'label': 'Schwellenwert 2',
              'tooltip': 'Tooltip 2'
            }
          ]
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'attachedSeries'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': [
                        {
              'yAxisAttribute': 'value_oberergw',
              'showYAxis': 'true',
              'yAxisMin': '0',
              'yAxisMax': '0.4',
              'yAxisFormat': ',.3f',
              'axisWidth': 60,
              'labelPadding': 40,
              'dspUnit': 'Ob. Grenzwert (mSv/h)'
            },
                        {
              'yAxisAttribute': 'value_unterergw',
              'showYAxis': 'true',
              'yAxisMin': '0',
              'yAxisMax': '0.4',
              'yAxisFormat': ',.3f',
              'axisWidth': 60,
              'labelPadding': 40,
              'dspUnit': 'Unt. Grenzwert (mSv/h)',
              'color': '#00ff00'
            }
          ]
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'featureStyle_off'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': [
                        {
              'attribute': 'value',
              'operator': 'lt',
              'value': 0.085,
              'style': {
                'type': 'circle',
                'radius': '10'
              }
            },
                        {
              'attribute': 'value',
              'operator': 'eq',
              'value': 0.085,
              'style': {
                'type': 'star',
                'sides': 5,
                'radius': 10
              }
            },
                        {
              'attribute': 'value',
              'operator': 'gt',
              'value': 0.085,
              'style': {
                'type': 'rect',
                'width': 15,
                'height': 20
              }
            }
          ]
        }}
      }}
    ]
  }}
};

var barchartMetadata = {
  '@xmlns:bfs': 'http://geonetwork.org/bfs',
  '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
  '@xmlns:gmd': 'http://www.isotc211.org/2005/gmd',
  '@xmlns:gml': 'http://www.opengis.net/gml',
  '@xmlns:gts': 'http://www.isotc211.org/2005/gts',
  '@xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
  '@gco:isoType': 'gmd:MD_Metadata',
  '@xsi:schemaLocation': 'http://www.isotc211.org/2005/gmd http://www.isotc211.org/2005/gmd/gmd.xsd    http://www.isotc211.org/2005/srv http://schemas.opengis.net/iso/19139/20060504/srv/srv.xsd',
  'gmd:fileIdentifier': {'gco:CharacterString': {
    '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
    '#text': 'd21141f1-c308-4a2b-8451-565eca33e993'
  }},
  'gmd:language': {'gmd:LanguageCode': {
    '@codeList': 'http://www.loc.gov/standards/iso639-2/',
    '@codeListValue': 'eng'
  }},
  'gmd:characterSet': {'gmd:MD_CharacterSetCode': {
    '@codeListValue': 'utf8',
    '@codeList': 'http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/codelist/ML_gmxCodelists.xml#MD_CharacterSetCode'
  }},
  'gmd:hierarchyLevel': {'gmd:MD_ScopeCode': {
    '@codeList': 'http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/codelist/ML_gmxCodelists.xml#MD_ScopeCode',
    '@codeListValue': ''
  }},
  'gmd:contact': null,
  'gmd:dateStamp': {'gco:DateTime': {
    '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
    '#text': '2018-04-26T15:07:03'
  }},
  'gmd:metadataStandardName': {'gco:CharacterString': {
    '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
    '#text': 'ISO 19115:2003/19139'
  }},
  'gmd:metadataStandardVersion': {'gco:CharacterString': {
    '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
    '#text': '1.0'
  }},
  'gmd:identificationInfo': {'gmd:MD_DataIdentification': {
    'gmd:citation': {'gmd:CI_Citation': {
      'gmd:title': {'gco:CharacterString': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '#text': 'Nuklide in sonstigen Nahrungsmitteln (new)'
      }},
      'gmd:date': {'gmd:CI_Date': {
        'gmd:date': {'gco:DateTime': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '2015-01-30T00:00:00'
        }},
        'gmd:dateType': {'gmd:CI_DateTypeCode': {
          '@codeListValue': 'publication',
          '@codeList': 'http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/codelist/ML_gmxCodelists.xml#CI_DateTypeCode'
        }}
      }}
    }},
    'gmd:abstract': {'gco:CharacterString': {
      '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
      '#text': 'Die Daten zeigen die Ergebnisse der �berwachung der Radioaktivit�t in sonstigen Nahrungsmitteln. Die Farbe des angezeigten Punktes gibt die H�he der Aktivit�t ausgew�hlter Nuklide in der entsprechenden Ma�einheit wieder. Zus�tzliche Informationen zur Messung wie Messstelle, Datum, Ma�einheit sowie Messwerte erhalten Sie wenn die Maus �ber den Punkt gef�hrt wird. Informationen zu weiteren Nukliden erhalten Sie �ber den Mausklick auf den Punkt. Diese Daten werden im Rahmen des Integrierten Mess- und Informationssystems (IMIS) von den Bundesl�ndern im Auftrag des Bundes erhoben (siehe <a href=\'http://www.bfs.de/DE/themen/ion/notfallschutz/messnetz/imis/imis_node.html\' target=\'new\'>http://www.bfs.de/<\/a>). Die dargestellten Punkte repr�sentieren die jeweilige Verwaltungseinheit (Gemeinde). Weitere Informationen zur Radioaktivit�t in sonstigen Nahrungsmitteln finden Sie im aktuellen Jahresbericht zur Umweltradioaktivit�t und Strahlenbelastung (<a href=\'http://doris.bfs.de/jspui/handle/urn:nbn:de:0221-2015060312762\' target=\'new\'>http://doris.bfs.de/<\/a>).'
    }},
    'gmd:status': null,
    'gmd:pointOfContact': {'gmd:CI_ResponsibleParty': {
      'gmd:individualName': {'gco:CharacterString': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '#text': 'Ansprechpartner für Geodaten'
      }},
      'gmd:organisationName': {'gco:CharacterString': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '#text': 'Bundesamt für Strahlenschutz'
      }},
      'gmd:positionName': {'gco:CharacterString': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '#text': 'SW 2.1'
      }},
      'gmd:contactInfo': {'gmd:CI_Contact': {
        'gmd:phone': {'gmd:CI_Telephone': {
          'gmd:voice': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '@gco:nilReason': 'missing',
            'gco:CharacterString': null
          },
          'gmd:facsimile': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '@gco:nilReason': 'missing',
            'gco:CharacterString': null
          }
        }},
        'gmd:address': {'gmd:CI_Address': {
          'gmd:deliveryPoint': {'gco:CharacterString': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '#text': 'Willy-Brandt-Str. 5'
          }},
          'gmd:city': {'gco:CharacterString': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '#text': 'Salzgitter'
          }},
          'gmd:administrativeArea': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '@gco:nilReason': 'missing',
            'gco:CharacterString': null
          },
          'gmd:postalCode': {'gco:CharacterString': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '#text': '38226'
          }},
          'gmd:country': {'gco:CharacterString': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '#text': 'Deutschland'
          }},
          'gmd:electronicMailAddress': {'gco:CharacterString': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '#text': 'info@bfs.de'
          }}
        }}
      }},
      'gmd:role': {'gmd:CI_RoleCode': {
        '@codeListValue': 'pointOfContact',
        '@codeList': 'http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/codelist/ML_gmxCodelists.xml#CI_RoleCode'
      }}
    }},
    'gmd:language': {'gco:CharacterString': {
      '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
      '#text': 'eng'
    }}
  }},
  'bfs:layerInformation': {'bfs:MD_Layer': {
    'bfs:legendTitle': {'gco:CharacterString': {
      '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
      '#text': 'Nuklide in sonstigen Nahrungsmitteln'
    }},
    'bfs:printTitle': {'gco:CharacterString': {
      '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
      '#text': 'Nuklide in sonstigen Nahrungsmitteln'
    }},
    'bfs:layerType': {'bfs:MD_WMSLayerType': {
      'bfs:URL': {
        'bfs:host': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'http://bfs-docker.intranet.terrestris.de'
        }},
        'bfs:path': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '/ogc/opendata/wms?'
        }}
      },
      'bfs:layer': {'gco:CharacterString': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '#text': 'opendata:new_sonstiges_nahrungsmittel'
      }},
      'bfs:transparent': {'gco:Boolean': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '#text': 'true'
      }},
      'bfs:version': {'gco:CharacterString': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '#text': '1.3.0'
      }},
      'bfs:styles': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '@gco:nilReason': 'missing',
        'gco:CharacterString': null
      },
      'bfs:format': {'gco:CharacterString': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '#text': 'image/png'
      }}
    }},
    'bfs:wfs': {'bfs:URL': {
      'bfs:host': {'gco:CharacterString': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '#text': 'http://bfs-docker.intranet.terrestris.de'
      }},
      'bfs:path': {'gco:CharacterString': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '#text': '/ogc/opendata/ows?'
      }}
    }},
    'bfs:download': {
      'bfs:URL': {
        'bfs:host': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'http://bfs-docker.intranet.terrestris.de/'
        }},
        'bfs:path': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'ogc/opendata/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=opendata:new_sonstiges_nahrungsmittel'
        }}
      },
      'bfs:filterFieldStart': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '@gco:nilReason': 'missing',
        'gco:CharacterString': null
      },
      'bfs:filterFieldEnd': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '@gco:nilReason': 'missing',
        'gco:CharacterString': null
      }
    },
    'bfs:filter': [
      {'bfs:MD_TimeRangeFilter': {
        'bfs:paramName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'datum'
        }},
        'bfs:interval': {'gco:Integer': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '24'
        }},
        'bfs:unit': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'hours'
        }},
        'bfs:maxDuration': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'P1YT'
        }},
        'bfs:minDate': {
          'bfs:TimeFormat': {'gco:CharacterString': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '#text': 'Y-m-d H:i:s'
          }},
          'bfs:TimeInstant': {'gco:CharacterString': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '#text': '2016-01-01 00:00:00'
          }}
        },
        'bfs:maxDate': {
          'bfs:TimeFormat': {'gco:CharacterString': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '#text': 'Y-m-d H:i:s'
          }},
          'bfs:TimeInstant': {'gco:CharacterString': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '#text': '2017-01-10 13:15:00'
          }}
        },
        'bfs:defaultStartValue': {
          'bfs:TimeFormat': {'gco:CharacterString': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '#text': 'Y-m-d H:i:s'
          }},
          'bfs:TimeInstant': {'gco:CharacterString': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '#text': '2016-01-11 13:15:00'
          }}
        },
        'bfs:defaultEndValue': {
          'bfs:TimeFormat': {'gco:CharacterString': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '#text': 'Y-m-d H:i:s'
          }},
          'bfs:TimeInstant': {'gco:CharacterString': {
            '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
            '#text': '2017-01-10 13:15:00'
          }}
        }
      }},
      {'bfs:MD_ValueFilter': {
        'bfs:paramName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'nuclide'
        }},
        'bfs:paramAlias': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'Nuklid'
        }},
        'bfs:defaultValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '\'Cs 137\''
        }},
        'bfs:allowedValues': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': [
                        {
              'val': '\'K 40\'',
              'dsp': 'K 40'
            },
                        {
              'val': '\'Co 60\'',
              'dsp': 'Co 60'
            },
                        {
              'val': '\'Ru 103\'',
              'dsp': 'Ru 103'
            },
                        {
              'val': '\'I 131\'',
              'dsp': 'I 131'
            },
                        {
              'val': '\'Cs 134\'',
              'dsp': 'Cs 134'
            },
                        {
              'val': '\'Cs 137\'',
              'dsp': 'Cs 137'
            },
                        {
              'val': '\'Ce 144\'',
              'dsp': 'Ce 144'
            }
          ]
        }},
        'bfs:operator': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '='
        }},
        'bfs:allowMultipleSelect': {'gco:Boolean': null},
        'bfs:encodeInViewParams': {'gco:Boolean': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'false'
        }}
      }},
      {'bfs:MD_ValueFilter': {
        'bfs:paramName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'order'
        }},
        'bfs:paramAlias': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'Anzeige sortiert nach'
        }},
        'bfs:defaultValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'datum'
        }},
        'bfs:allowedValues': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': [
                        {
              'val': 'datum',
              'dsp': 'Datum'
            },
                        {
              'val': 'map_nuclide',
              'dsp': 'H�he des Messwertes'
            }
          ]
        }},
        'bfs:operator': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '='
        }},
        'bfs:allowMultipleSelect': {'gco:Boolean': null},
        'bfs:encodeInViewParams': {'gco:Boolean': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }}
    ],
    'bfs:olProperty': [
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'hoverTpl'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '[[gemeinde]]<br>[[datum]]<br>Medium: [[beschreibung]]<br>Messwert ([[einheit]]): [[value]]<br>Nuklid: [[nuclide]]'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'legendUrl'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'http://bfs-docker.intranet.terrestris.de/ogc/opendata/wms?service=WMS&version=1.3.0&request=GetLegendGraphic&layer=opendata:new_sonstiges_nahrungsmittel&width=15&height=15&format=image/png'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'allowHover'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'allowShortInfo'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'allowDownload'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'enableLegendCount'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'allowOpacityChange'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'hasLegend'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'singleTile'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'hoverStyle'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '#003d99,polygon,5'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'showCartoWindow'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'cartoWindowLineStyle'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '#294d71,4'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': null,
        'bfs:propertyValue': null
      }}
    ],
    'bfs:barChartProperty': [
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'dataFeatureType'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'opendata:new_sonstiges_nahrungsmittel'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'param_viewparams'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'ogr_fid:[[ogr_fid]]'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'colorSequence'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '#4040ff,#bf0000,#40ff40,#ffff40,#ff40ff,#ff8040,#80ffff,#8040ff,#4040ff,#bf0000,#40ff40,#ffff40,#ff40ff,#ff8040,#80ffff,#8040ff'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'groupLabelAttribute'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'datum'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'yAxisLabel'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '[[unit]]'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'yAxisFormat'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': ',.1e'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'tooltipTpl'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'Ort: [[local_authority]]<br>Datum: [[group]]<br>Nuklid: [[key]]<br>Messwert in [[unit]]: [[value]]<br> Ort: [[gemeinde]]<br>Datum: [[datum]]<br>Nuklid:[[group]]<br>Messwert in [[einheit]]: [[value]]<br>'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'labelFunc'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'eval:(function(){return function(yVal, obj){ if (obj.detection_limit===\'<\') { return \'<NWG\'; } else { return yVal.toExponential(3); } } }())'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'yAxisScale'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'linear'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'yAxisMin'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '0'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'rotateXAxisLabel'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'false'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'chartMargin'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '50,200,60,80'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'labelPadding'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '50'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'barWidth'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': '30'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'groupAttribute'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'id'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'detectionLimitAttribute'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'value_constraint'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'uncertaintyAttribute'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'uncertainty'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'yAxisAttribute'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'value'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'xAxisAttribute'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'nuclide'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'drawBarCondition'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'eval:(function(){return function(obj){ if (obj.detection_limit===\'<\') { return false; } else { return true; } } }())'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': null,
        'bfs:propertyValue': null
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'showBarchartGrid'
        }},
        'bfs:propertyValue': {'gco:CharacterString': {
          '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
          '#text': 'true'
        }}
      }},
      {'bfs:MD_Property': {
        'bfs:propertyName': null,
        'bfs:propertyValue': null
      }}
    ]
  }}
};

describe('Koala.util.MetadataParser', function() {

    describe('Basics', function() {
        it('is defined', function() {
            expect(Koala.util.MetadataParser).to.not.be(undefined);
        });
    });
    describe('Static functions', function() {

        describe('#parseMetadata', function() {
            expect(Koala.util.MetadataParser.parseMetadata).to.not.be(undefined);
            expect(Koala.util.MetadataParser.parseMetadata).to.be.a(Function);
        });

        describe('#parseMetadata can be called with timeseries metadata', function() {
            var metadata = Koala.util.MetadataParser.parseMetadata(timeseriesMetadata);
            expect(metadata).to.not.be(undefined);
        });

        describe('#parseMetadata can be called with barchart metadata', function() {
            var metadata = Koala.util.MetadataParser.parseMetadata(barchartMetadata);
            expect(metadata).to.not.be(undefined);
        });

    });
});
