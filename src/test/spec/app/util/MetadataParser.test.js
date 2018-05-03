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
        '#text': 'Ansprechpartner f�r Geodaten'
      }},
      'gmd:organisationName': {'gco:CharacterString': {
        '@xmlns:gco': 'http://www.isotc211.org/2005/gco',
        '#text': 'Bundesamt f�r Strahlenschutz'
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
              'dsp': '�Sv/h (Routine)'
            },
                        {
              'val': 'microSv_h_odl_brutto_10min_intensiv',
              'dsp': '�Sv/h (Intensiv)'
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
              'dsp': 'KF�'
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

        describe('#parseMetadata can be called', function() {
            var metadata = Koala.util.MetadataParser.parseMetadata(timeseriesMetadata);
            expect(metadata).to.not.be(undefined);
        });

    });
});
