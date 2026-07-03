import type { ProductSpecs } from "./types";

/**
 * Per-car flexible specs seeded into Product.specs (JSON): variant
 * comparison matrix, colour options (with photos), registration tax
 * (filer / non-filer), announcement banner and listing spotlight.
 * Managed day-to-day from the admin panel; this file is the reseed
 * source of truth. Snapshot of the live database taken 2026-07-03.
 */
export const productSpecs: Record<string, ProductSpecs> = {
  "fronx": {
    "tax": {
      "filer": 120000,
      "nonFiler": 360000
    },
    "colors": [
      {
        "hex": "#F2F4F6",
        "name": "Solid White",
        "images": [
          "/images/products/fronx/colors/white-1.jpg",
          "/images/products/fronx/colors/white-2.jpg",
          "/images/products/fronx/colors/white-3.jpg",
          "/images/products/fronx/colors/white-4.jpg",
          "/images/products/fronx/colors/white-5.jpg"
        ]
      },
      {
        "hex": "#C4C9CE",
        "name": "Silky Silver"
      },
      {
        "hex": "#6E7479",
        "name": "Mineral Grey"
      },
      {
        "hex": "#7C8FA3",
        "name": "Ice Greyish Blue"
      },
      {
        "hex": "#101215",
        "name": "Super Black",
        "images": [
          "/images/products/fronx/colors/black-1.jpg",
          "/images/products/fronx/colors/black-2.jpg"
        ]
      },
      {
        "hex": "#3E4A3D",
        "name": "Jungle Green"
      },
      {
        "hex": "#F2F4F6",
        "name": "Solid White · Black Roof",
        "images": [
          "/images/products/fronx/colors/white-2tone-1.jpg",
          "/images/products/fronx/01.png",
          "/images/products/fronx/02.png",
          "/images/products/fronx/03.png"
        ],
        "roofHex": "#101215"
      },
      {
        "hex": "#C4C9CE",
        "name": "Silky Silver · Black Roof",
        "images": [
          "/images/products/fronx/colors/silver-2tone-1.jpg",
          "/images/products/fronx/colors/silver-2tone-3.jpg",
          "/images/products/fronx/colors/silver-2tone-4.jpg",
          "/images/products/fronx/colors/silver-2tone-5.jpg"
        ],
        "roofHex": "#101215"
      },
      {
        "hex": "#7C8FA3",
        "name": "Ice Greyish Blue · Black Roof",
        "roofHex": "#101215"
      }
    ],
    "highlight": {
      "label": "New Launch",
      "enabled": true
    },
    "comparison": {
      "groups": [
        {
          "rows": [
            {
              "label": "Engine",
              "values": [
                "1.5L K-Series",
                "1.5L K-Series",
                "1.5L Hybrid",
                "1.5L Hybrid"
              ]
            },
            {
              "label": "Transmission",
              "values": [
                "5-Speed Manual",
                "4-Speed Auto",
                "6-Speed Auto",
                "6-Speed Auto"
              ]
            },
            {
              "label": "Cruise Control",
              "values": [
                false,
                true,
                true,
                true
              ]
            },
            {
              "label": "Hill Hold Control",
              "values": [
                false,
                true,
                true,
                true
              ]
            }
          ],
          "title": "Engine & Performance"
        },
        {
          "rows": [
            {
              "label": "Power Steering",
              "values": [
                true,
                true,
                true,
                true
              ]
            },
            {
              "label": "Air Conditioning",
              "values": [
                true,
                true,
                true,
                true
              ]
            },
            {
              "label": "Rear AC Vents",
              "values": [
                false,
                true,
                true,
                true
              ]
            },
            {
              "label": "Push Start",
              "values": [
                false,
                true,
                true,
                true
              ]
            },
            {
              "label": "Keyless Entry",
              "values": [
                false,
                true,
                true,
                true
              ]
            },
            {
              "label": "Wireless Charger",
              "values": [
                false,
                false,
                true,
                true
              ]
            },
            {
              "label": "Android Auto / Apple CarPlay",
              "values": [
                true,
                true,
                true,
                true
              ]
            }
          ],
          "title": "Comfort & Convenience"
        },
        {
          "rows": [
            {
              "label": "Airbags",
              "values": [
                "2 Airbags",
                "6 Airbags",
                "6 Airbags",
                "6 Airbags"
              ]
            },
            {
              "label": "ABS + EBD",
              "values": [
                true,
                true,
                true,
                true
              ]
            },
            {
              "label": "360 Camera",
              "values": [
                false,
                false,
                true,
                true
              ]
            },
            {
              "label": "Parking Sensors",
              "values": [
                true,
                true,
                true,
                true
              ]
            }
          ],
          "title": "Safety"
        },
        {
          "rows": [
            {
              "label": "Alloy Wheels",
              "values": [
                false,
                true,
                true,
                true
              ]
            },
            {
              "label": "Two-Tone Roof",
              "values": [
                false,
                false,
                false,
                true
              ]
            }
          ],
          "title": "Exterior"
        }
      ],
      "columns": [
        {
          "name": "GL MT",
          "price": 5999999
        },
        {
          "name": "GL AT",
          "price": 6099999
        },
        {
          "name": "GLX 6AT Mono",
          "price": 6299999
        },
        {
          "name": "GLX 6AT Two-Tone",
          "price": 6374999
        }
      ]
    }
  },
  "swift": {
    "tax": {
      "filer": 66902,
      "nonFiler": 200707
    },
    "comparison": {
      "groups": [
        {
          "rows": [
            {
              "label": "Power Steering",
              "values": [
                true,
                true,
                true
              ]
            },
            {
              "label": "Air Conditioning",
              "values": [
                true,
                true,
                true
              ]
            },
            {
              "label": "Smart Keyless Entry",
              "values": [
                false,
                false,
                true
              ]
            },
            {
              "label": "Push Start System",
              "values": [
                false,
                false,
                true
              ]
            }
          ],
          "title": "Comfort & Convenience"
        },
        {
          "rows": [
            {
              "label": "ABS with EBD",
              "values": [
                true,
                true,
                true
              ]
            },
            {
              "label": "Six Airbags",
              "values": [
                true,
                true,
                true
              ]
            },
            {
              "label": "Hill Hold Control",
              "values": [
                false,
                true,
                true
              ]
            }
          ],
          "title": "Safety"
        },
        {
          "rows": [
            {
              "label": "Alloy Wheels",
              "values": [
                true,
                true,
                true
              ]
            }
          ],
          "title": "Exterior"
        }
      ],
      "columns": [
        {
          "name": "GLMT",
          "price": 4460160
        },
        {
          "name": "GLVT",
          "price": 4605600
        },
        {
          "name": "GLVVT",
          "price": 4766190
        }
      ]
    }
  },
  "cultus": {
    "tax": {
      "filer": 40895,
      "nonFiler": 122685
    },
    "comparison": {
      "groups": [
        {
          "rows": [
            {
              "label": "Power Steering",
              "values": [
                true,
                true,
                true
              ]
            },
            {
              "label": "Air Conditioning",
              "values": [
                true,
                true,
                true
              ]
            },
            {
              "label": "Remote Central Lock",
              "values": [
                true,
                true,
                true
              ]
            },
            {
              "label": "Automatic Gear Shift (AGS)",
              "values": [
                false,
                false,
                true
              ]
            }
          ],
          "title": "Comfort & Convenience"
        },
        {
          "rows": [
            {
              "label": "ABS",
              "values": [
                false,
                true,
                true
              ]
            },
            {
              "label": "Dual Airbags",
              "values": [
                false,
                true,
                true
              ]
            }
          ],
          "title": "Safety"
        },
        {
          "rows": [
            {
              "label": "Alloy Wheels",
              "values": [
                false,
                true,
                true
              ]
            }
          ],
          "title": "Exterior"
        }
      ],
      "columns": [
        {
          "name": "VXR",
          "price": 4089490
        },
        {
          "name": "VXL",
          "price": 4359160
        },
        {
          "name": "AGS",
          "price": 4591460
        }
      ]
    }
  },
  "alto": {
    "tax": {
      "filer": 14974,
      "nonFiler": 44923
    },
    "comparison": {
      "groups": [
        {
          "rows": [
            {
              "label": "Power Steering",
              "values": [
                true,
                true,
                true
              ]
            },
            {
              "label": "Air Conditioning",
              "values": [
                true,
                true,
                true
              ]
            },
            {
              "label": "Power Window",
              "values": [
                false,
                false,
                true
              ]
            }
          ],
          "title": "Comfort & Convenience"
        },
        {
          "rows": [
            {
              "label": "Air Bags",
              "values": [
                true,
                true,
                true
              ]
            },
            {
              "label": "ABS",
              "values": [
                false,
                true,
                true
              ]
            }
          ],
          "title": "Safety"
        }
      ],
      "columns": [
        {
          "name": "VXR",
          "price": 2994861
        },
        {
          "name": "VXL",
          "price": 3166480
        },
        {
          "name": "AGS",
          "price": 3326446
        }
      ]
    }
  },
  "every": {
    "tax": {
      "filer": 14826,
      "nonFiler": 44478
    },
    "comparison": {
      "groups": [
        {
          "rows": [
            {
              "label": "Power Steering",
              "values": [
                true
              ]
            },
            {
              "label": "Air Conditioning",
              "values": [
                true
              ]
            },
            {
              "label": "Power Windows",
              "values": [
                true
              ]
            },
            {
              "label": "Central Locking",
              "values": [
                true
              ]
            },
            {
              "label": "Keyless Entry",
              "values": [
                true
              ]
            }
          ],
          "title": "Comfort & Convenience"
        },
        {
          "rows": [
            {
              "label": "Air Bags",
              "values": [
                true
              ]
            },
            {
              "label": "ABS + EBD",
              "values": [
                true
              ]
            },
            {
              "label": "Security Alarm",
              "values": [
                true
              ]
            }
          ],
          "title": "Safety"
        },
        {
          "rows": [
            {
              "label": "MP3 Player",
              "values": [
                true
              ]
            }
          ],
          "title": "Technology"
        },
        {
          "rows": [
            {
              "label": "Rear Wiper",
              "values": [
                true
              ]
            }
          ],
          "title": "Exterior"
        }
      ],
      "columns": [
        {
          "name": "VXR",
          "price": 2965200
        }
      ]
    }
  }
};
