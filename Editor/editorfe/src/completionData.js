/** Auto-generated from docs/dts/ by Tools/completion-gen/generate.mjs — do not edit by hand */

export const jsxTags = [
  "row",
  "col",
  "stack",
  "grid",
  "grid-row",
  "text",
  "date",
  "image",
  "gif",
  "spacer",
  "rect",
  "capsule",
  "ellipse",
  "circle",
  "gauge",
  "chart",
  "link",
  "divider",
  "line",
  "roundedrect",
  "icon",
  "label",
  "progress",
  "ring",
  "badge",
  "chip",
  "stat",
  "button",
  "toggle"
];

export const commonAttributes = [
  {
    "name": "size",
    "info": "尺寸（\"max\" 或 {width, height}）"
  },
  {
    "name": "justify",
    "info": "水平对齐",
    "values": [
      "start",
      "center",
      "end"
    ]
  },
  {
    "name": "align",
    "info": "垂直对齐",
    "values": [
      "start",
      "center",
      "end"
    ]
  },
  {
    "name": "padding",
    "info": "内边距（数字或 {horizontal, vertical, top, bottom, leading, trailing, left, right}）"
  },
  {
    "name": "backgroundColor",
    "info": "背景色"
  },
  {
    "name": "foregroundColor",
    "info": "前景色"
  },
  {
    "name": "cornerRadius",
    "info": "圆角"
  },
  {
    "name": "opacity",
    "info": "透明度 0-1"
  },
  {
    "name": "rotationEffect",
    "info": "旋转角度"
  },
  {
    "name": "scaleEffect",
    "info": "缩放"
  },
  {
    "name": "offset",
    "info": "偏移"
  },
  {
    "name": "shadow",
    "info": "阴影"
  },
  {
    "name": "blur",
    "info": "模糊"
  },
  {
    "name": "animation",
    "info": "动画名"
  }
];

export const tagAttributes = {
  "row": [
    {
      "name": "align",
      "info": "交叉轴对齐（垂直）",
      "values": [
        "start",
        "end",
        "center",
        "firstBaseline",
        "lastBaseline"
      ]
    },
    {
      "name": "spacing",
      "info": "水平间距"
    }
  ],
  "col": [
    {
      "name": "spacing",
      "info": "垂直间距"
    }
  ],
  "stack": [],
  "grid": [
    {
      "name": "rows",
      "info": "行配置 JSON 字符串"
    },
    {
      "name": "columns",
      "info": "列数"
    },
    {
      "name": "spacing",
      "info": "间距"
    }
  ],
  "grid-row": [
    {
      "name": "align",
      "info": "垂直对齐",
      "values": [
        "start",
        "end",
        "center",
        "firstBaseline",
        "lastBaseline"
      ]
    },
    {
      "name": "rows",
      "info": "行数"
    },
    {
      "name": "columns",
      "info": "列配置 JSON 字符串"
    },
    {
      "name": "spacing",
      "info": "间距"
    }
  ],
  "text": [
    {
      "name": "font",
      "info": "字体：语义名 / 数字字号 / {name,weight,design,size} / {custom,size}"
    },
    {
      "name": "bold",
      "info": "粗体"
    },
    {
      "name": "italic",
      "info": "斜体"
    },
    {
      "name": "color",
      "info": "文字颜色"
    },
    {
      "name": "textAlign",
      "info": "文本对齐",
      "values": [
        "start",
        "center",
        "end"
      ]
    },
    {
      "name": "lineLimit",
      "info": "行数限制"
    },
    {
      "name": "minimumScaleFactor",
      "info": "最小缩放"
    }
  ],
  "date": [
    {
      "name": "format",
      "info": "日期格式"
    },
    {
      "name": "style",
      "info": "显示样式",
      "values": [
        "date",
        "time",
        "relative"
      ]
    }
  ],
  "image": [
    {
      "name": "name",
      "info": "bundle 内图片名"
    },
    {
      "name": "url",
      "info": "网络 URL"
    },
    {
      "name": "resizable",
      "info": "可拉伸"
    },
    {
      "name": "scaledToFit",
      "info": "适应"
    },
    {
      "name": "scaledToFill",
      "info": "填充"
    }
  ],
  "gif": [
    {
      "name": "name",
      "info": "GIF 资源名"
    }
  ],
  "spacer": [
    {
      "name": "length",
      "info": "最小占用长度"
    }
  ],
  "rect": [],
  "capsule": [],
  "ellipse": [],
  "circle": [],
  "gauge": [
    {
      "name": "value",
      "info": "当前值"
    },
    {
      "name": "min",
      "info": "最小值"
    },
    {
      "name": "max",
      "info": "最大值"
    }
  ],
  "chart": [
    {
      "name": "data",
      "info": "图表数据 JSON"
    },
    {
      "name": "type",
      "info": "图表类型",
      "values": [
        "line",
        "bar",
        "pie"
      ]
    }
  ],
  "link": [
    {
      "name": "url",
      "info": "链接地址"
    },
    {
      "name": "destination",
      "info": "目标"
    }
  ],
  "divider": [
    {
      "name": "thickness",
      "info": "线宽（默认 1）"
    },
    {
      "name": "axis",
      "info": "方向",
      "values": [
        "horizontal",
        "vertical"
      ]
    },
    {
      "name": "color",
      "info": "颜色"
    }
  ],
  "line": [
    {
      "name": "thickness",
      "info": "线宽（默认 2）"
    },
    {
      "name": "length",
      "info": "长度（默认 48）"
    },
    {
      "name": "axis",
      "info": "方向",
      "values": [
        "horizontal",
        "vertical"
      ]
    },
    {
      "name": "color",
      "info": "颜色"
    }
  ],
  "roundedrect": [],
  "icon": [
    {
      "name": "name",
      "info": "SF Symbol 名"
    }
  ],
  "label": [],
  "progress": [
    {
      "name": "value",
      "info": "0-1 进度"
    }
  ],
  "ring": [],
  "badge": [],
  "chip": [],
  "stat": [],
  "button": [
    {
      "name": "action",
      "info": "点击动作名"
    },
    {
      "name": "style",
      "info": "按钮样式"
    }
  ],
  "toggle": [
    {
      "name": "isOn",
      "info": "是否开启"
    },
    {
      "name": "action",
      "info": "切换回调名"
    }
  ]
};

export const apis = [
  {
    "name": "$http",
    "methods": [
      "get",
      "post",
      "put",
      "patch",
      "delete"
    ]
  },
  {
    "name": "$fetch",
    "methods": []
  },
  {
    "name": "fetch",
    "methods": []
  },
  {
    "name": "$console",
    "methods": [
      "log",
      "info",
      "warn",
      "error"
    ]
  },
  {
    "name": "console",
    "methods": [
      "log",
      "info",
      "warn",
      "error"
    ]
  },
  {
    "name": "$device",
    "methods": [
      "name",
      "model",
      "language",
      "systemVersion",
      "screen",
      "battery",
      "isdarkmode",
      "totalDiskSpace",
      "freeDiskSpace"
    ]
  },
  {
    "name": "$file",
    "methods": [
      "readString",
      "writeString",
      "remove",
      "list"
    ]
  },
  {
    "name": "$system",
    "methods": [
      "appInfo",
      "locale",
      "preferredLanguages",
      "timeZone",
      "is24HourClock",
      "calendarInfo",
      "systemUptime",
      "memory",
      "thermalState",
      "lowPowerMode",
      "brightness",
      "reduceMotionEnabled",
      "platform",
      "hostName",
      "processName",
      "osVersionString",
      "processorCount",
      "activeProcessorCount"
    ]
  },
  {
    "name": "$health",
    "methods": [
      "isAvailable",
      "requestAuthorization",
      "stepCountToday",
      "activeEnergyToday",
      "heartRateLatest"
    ]
  },
  {
    "name": "$location",
    "methods": [
      "isAvailable",
      "authorizationStatus",
      "requestAuthorization",
      "current"
    ]
  },
  {
    "name": "$storage",
    "methods": [
      "getString",
      "setString",
      "getJSON",
      "setJSON",
      "remove",
      "keys",
      "clear"
    ]
  },
  {
    "name": "$getenv",
    "methods": []
  },
  {
    "name": "$import",
    "methods": []
  },
  {
    "name": "$render",
    "methods": []
  },
  {
    "name": "$dynamic_island",
    "methods": []
  },
  {
    "name": "$element",
    "methods": [
      "createElement"
    ]
  },
  {
    "name": "$component",
    "methods": []
  },
  {
    "name": "$error",
    "methods": []
  }
];
