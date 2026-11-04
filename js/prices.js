/* Platinum / Southern Ideal Door nets.
   Doors, glass, track, hardware: 9/19/2026.
   LiftMaster openers: 9/16/2026.
   Cells that look uneven are printed as they appear on the sheet. */
(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.CCGD_PRICES = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  function triples(rows) {
    const out = {};
    rows.forEach(function (row) {
      out[row[0]] = [row[1], row[2], row[3]];
    });
    return out;
  }
  function singles(rows) {
    const out = {};
    rows.forEach(function (row) {
      out[row[0]] = row[1];
    });
    return out;
  }

  const residentialColors = {
    standard: ["White", "Almond", "Brown", "Sandstone", "Desert Tan"],
    black: ["Black", "Charcoal"],
    wood: ["Walnut"]
  };
  const series500Colors = {
    standard: ["White", "Almond", "Sandstone"]
  };
  const series3000Colors = {
    standard: ["White", "Almond", "Brown", "Sandstone", "Desert Tan"],
    black: ["Black", "Charcoal"],
    wood: ["Walnut", "Oak", "Driftwood", "Carbon Cypress", "Light Cypress"]
  };

  const standardHeights400 = triples([
    ["8x7", 397, 412, 526],
    ["8x8", 468, 486, 632],
    ["9x7", 427, 446, 572],
    ["9x8", 499, 520, 685],
    ["10x7", 492, 511, 651],
    ["10x8", 578, 603, 791],
    ["12x7", 564, 586, 755],
    ["12x8", 666, 695, 918],
    ["16x7", 705, 736, 962],
    ["16x8", 841, 880, 1172],
    ["18x7", 819, 854, 1107],
    ["18x8", 959, 1003, 1338]
  ]);
  const tall400 = triples([
    ["8x9", 573, 597, 777],
    ["8x10", 581, 604, 777],
    ["8x12", 727, 755, 954],
    ["8x14", 869, 901, 1126],
    ["9x9", 618, 643, 846],
    ["9x10", 624, 651, 846],
    ["9x12", 776, 807, 1030],
    ["9x14", 919, 954, 1207],
    ["10x9", 730, 759, 992],
    ["10x10", 743, 773, 992],
    ["10x12", 903, 938, 1186],
    ["10x14", 1062, 1101, 1381],
    ["12x9", 811, 847, 1127],
    ["12x10", 828, 864, 1127],
    ["12x12", 1012, 1054, 1355],
    ["12x14", 1184, 1231, 1570],
    ["14x9", 1015, 1055, 1378],
    ["14x10", 1034, 1074, 1378],
    ["14x12", 1254, 1303, 1651],
    ["14x14", 1466, 1522, 1915],
    ["16x9", 993, 1041, 1401],
    ["16x10", 1070, 1118, 1465],
    ["16x12", 1315, 1370, 1769],
    ["16x14", 1518, 1581, 2034],
    ["18x9", 1159, 1212, 1628],
    ["18x10", 1195, 1247, 1639],
    ["18x12", 1455, 1516, 1965],
    ["18x14", 1699, 1769, 2274]
  ]);
  const standardHeights400w = triples([
    ["8x7", 414, 428, 542],
    ["8x8", 489, 508, 654],
    ["9x7", 441, 459, 585],
    ["9x8", 526, 547, 712],
    ["10x7", 519, 538, 678],
    ["10x8", 611, 635, 823],
    ["12x7", 673, 696, 865],
    ["12x8", 789, 818, 1041],
    ["16x7", 803, 834, 1059],
    ["16x8", 943, 982, 1004],
    ["18x7", 950, 985, 1238],
    ["18x8", 1181, 1226, 1561]
  ]);

  const standardHeights401 = triples([
    ["8x7", 455, 470, 584],
    ["8x8", 539, 558, 704],
    ["9x7", 485, 504, 630],
    ["9x8", 577, 599, 764],
    ["10x7", 566, 585, 726],
    ["10x8", 674, 699, 886],
    ["12x7", 672, 695, 864],
    ["12x8", 804, 832, 1055],
    ["16x7", 819, 850, 1076],
    ["16x8", 985, 1024, 1316],
    ["18x7", 977, 1012, 1265],
    ["18x8", 1138, 1182, 1518]
  ]);
  const tall401 = triples([
    ["8x9", 650, 674, 854],
    ["8x10", 666, 689, 862],
    ["8x12", 824, 853, 1051],
    ["8x14", 969, 1000, 1226],
    ["9x9", 707, 732, 935],
    ["9x10", 720, 747, 941],
    ["9x12", 895, 926, 1149],
    ["9x14", 1050, 1085, 1338],
    ["10x9", 832, 862, 1095],
    ["10x10", 849, 878, 1096],
    ["10x12", 1024, 1059, 1308],
    ["10x14", 1214, 1253, 1532],
    ["12x9", 959, 996, 1276],
    ["12x10", 980, 1015, 1278],
    ["12x12", 1189, 1231, 1532],
    ["12x14", 1396, 1443, 1782],
    ["14x9", 1132, 1173, 1496],
    ["14x10", 1197, 1238, 1542],
    ["14x12", 1439, 1488, 1836],
    ["14x14", 1688, 1743, 2136],
    ["16x9", 1209, 1257, 1618],
    ["16x10", 1228, 1276, 1623],
    ["16x12", 1497, 1553, 1951],
    ["16x14", 1755, 1819, 2272],
    ["18x9", 1342, 1395, 1811],
    ["18x10", 1423, 1476, 1868],
    ["18x12", 1707, 1768, 2216],
    ["18x14", 2031, 2101, 2607]
  ]);
  const standardHeights401w = triples([
    ["8x7", 468, 482, 596],
    ["8x8", 555, 574, 719],
    ["9x7", 504, 524, 650],
    ["9x8", 601, 623, 788],
    ["10x7", 554, 573, 714],
    ["10x8", 704, 728, 916],
    ["12x7", 786, 809, 978],
    ["12x8", 918, 946, 1169],
    ["16x7", 912, 942, 1169],
    ["16x8", 1077, 1116, 1408],
    ["18x7", 1101, 1136, 1389],
    ["18x8", 1350, 1395, 1730]
  ]);

  const standard500 = singles([
    ["8x7", 385], ["8x8", 450], ["9x7", 414], ["9x8", 480],
    ["10x7", 476], ["10x8", 557], ["12x7", 545], ["12x8", 639],
    ["14x7", 669], ["14x8", 782], ["16x7", 681], ["16x8", 807],
    ["18x7", 791], ["18x8", 920]
  ]);
  const tall500 = singles([
    ["8x9", 551], ["8x10", 561], ["8x12", 705], ["8x14", 845],
    ["9x9", 593], ["9x10", 601], ["9x12", 750], ["9x14", 891],
    ["10x9", 703], ["10x10", 719], ["10x12", 874], ["10x14", 1030],
    ["12x9", 777], ["12x10", 797], ["12x12", 977], ["12x14", 1145],
    ["14x9", 977], ["14x10", 1000], ["14x12", 1216], ["14x14", 1424],
    ["16x9", 951], ["16x10", 1031], ["16x12", 1270], ["16x14", 1469],
    ["18x9", 1111], ["18x10", 1150], ["18x12", 1404], ["18x14", 1641]
  ]);
  const standard500w = singles([
    ["8x7", 401], ["8x8", 472], ["9x7", 427], ["9x8", 507],
    ["10x7", 503], ["10x8", 591], ["12x7", 654], ["12x8", 762],
    ["14x7", 758], ["14x8", 909], ["16x7", 777], ["16x8", 909],
    ["18x7", 922], ["18x8", 1143]
  ]);

  const standard501 = singles([
    ["8x7", 443], ["8x8", 522], ["9x7", 472], ["9x8", 558],
    ["10x7", 550], ["10x8", 654], ["12x7", 653], ["12x8", 777],
    ["14x7", 770], ["14x8", 920], ["16x7", 793], ["16x8", 951],
    ["18x7", 949], ["18x8", 1100]
  ]);
  const tall501 = singles([
    ["8x9", 628], ["8x10", 647], ["8x12", 682], ["8x14", 945],
    ["9x9", 682], ["9x10", 697], ["9x12", 869], ["9x14", 1022],
    ["10x9", 805], ["10x10", 824], ["10x12", 996], ["10x14", 1181],
    ["12x9", 926], ["12x10", 949], ["12x12", 1154], ["12x14", 1357],
    ["14x9", 1095], ["14x10", 1164], ["14x12", 1401], ["14x14", 1646],
    ["16x9", 1168], ["16x10", 1189], ["16x12", 1453], ["16x14", 1707],
    ["18x9", 1293], ["18x10", 1378], ["18x12", 1655], ["18x14", 1973]
  ]);
  const standard501w = singles([
    ["8x7", 455], ["8x8", 538], ["9x7", 492], ["9x8", 582],
    ["10x7", 576], ["10x8", 684], ["12x7", 768], ["12x8", 891],
    ["14x7", 857], ["14x8", 1034], ["16x7", 886], ["16x8", 1043],
    ["18x7", 1073], ["18x8", 1312]
  ]);

  const standard3000 = triples([
    ["8x7", 635, 651, 766],
    ["8x8", 754, 774, 936],
    ["9x7", 700, 718, 849],
    ["9x8", 830, 853, 1036],
    ["10x7", 799, 819, 965],
    ["10x8", 950, 974, 1177],
    ["12x7", 946, 972, 1145],
    ["12x8", 1120, 1151, 1396],
    ["16x7", 1174, 1207, 1438],
    ["16x8", 1401, 1442, 1766],
    ["18x7", 1385, 1422, 1682],
    ["18x8", 1666, 1711, 2078]
  ]);
  const tall3000 = triples([
    ["8x9", 903, 927, 1138],
    ["8x10", 949, 973, 1161],
    ["8x12", 1154, 1182, 1392],
    ["8x14", 1365, 1397, 1630],
    ["9x9", 1005, 950, 1269],
    ["9x10", 1032, 1032, 1269],
    ["9x12", 1255, 1273, 1523],
    ["9x14", 1480, 1516, 1777],
    ["10x9", 1150, 1180, 1441],
    ["10x10", 1189, 1219, 1451],
    ["10x12", 1435, 1470, 1731],
    ["10x14", 1695, 1735, 2026],
    ["12x9", 1341, 1377, 1693],
    ["12x10", 1384, 1420, 1701],
    ["12x12", 1658, 1700, 2016],
    ["12x14", 1955, 2004, 2355],
    ["14x9", 1596, 1638, 2005],
    ["14x10", 1665, 1707, 2032],
    ["14x12", 2003, 2053, 2419],
    ["14x14", 2303, 2359, 2766],
    ["16x9", 1673, 1722, 2142],
    ["16x10", 1770, 1819, 2193],
    ["16x12", 2111, 2168, 2589],
    ["16x14", 2455, 2520, 2988],
    ["18x9", 1986, 2042, 2515],
    ["18x10", 2039, 2095, 2514],
    ["18x12", 2428, 2492, 2962],
    ["18x14", 2872, 2945, 3466]
  ]);
  const standard3000w = triples([
    ["8x7", 645, 661, 776],
    ["8x8", 773, 793, 955],
    ["9x7", 708, 727, 858],
    ["9x8", 843, 866, 1050],
    ["10x7", 814, 834, 980],
    ["10x8", 978, 1003, 1205],
    ["12x7", 958, 984, 1157],
    ["12x8", 1186, 1218, 1462],
    ["16x7", 1226, 1258, 1489],
    ["16x8", 1476, 1516, 1841],
    ["18x7", 1454, 1491, 1751],
    ["18x8", 1758, 1803, 2170]
  ]);

  function merge(a, b) {
    const out = {};
    Object.keys(a).forEach(function (k) { out[k] = a[k]; });
    Object.keys(b).forEach(function (k) { out[k] = b[k]; });
    return out;
  }

  const commercial2411 = singles([
    ["8x7", 532], ["8x8", 532], ["8x9", 647], ["8x10", 671], ["8x12", 843], ["8x14", 1001],
    ["9x7", 572], ["9x8", 572], ["9x9", 699], ["9x10", 726], ["9x12", 900], ["9x14", 1054],
    ["10x7", 658], ["10x8", 658], ["10x9", 801], ["10x10", 808], ["10x12", 999], ["10x14", 1201],
    ["12x7", 733], ["12x8", 733], ["12x9", 869], ["12x10", 906], ["12x12", 1119], ["12x14", 1329], ["12x16", 1569],
    ["14x7", 875], ["14x8", 875], ["14x9", 1044], ["14x10", 1089], ["14x12", 1349], ["14x14", 1588],
    ["16x7", 964], ["16x8", 964], ["16x9", 1143], ["16x10", 1208], ["16x12", 1476], ["16x14", 1739]
  ]);
  const commercial4401 = singles([
    ["8x7", 686], ["8x8", 686], ["8x9", 738], ["8x10", 765], ["8x12", 953], ["8x14", 1131],
    ["9x7", 649], ["9x8", 649], ["9x9", 797], ["9x10", 822], ["9x12", 1018], ["9x14", 1210],
    ["10x7", 788], ["10x8", 788], ["10x9", 926], ["10x10", 968], ["10x12", 1172], ["10x14", 1406],
    ["12x7", 879], ["12x8", 879], ["12x9", 1049], ["12x10", 1093], ["12x12", 1349], ["12x14", 1583],
    ["14x7", 1033], ["14x8", 1033], ["14x9", 1231], ["14x10", 1275], ["14x12", 1592], ["14x14", 1849],
    ["16x7", 1185], ["16x8", 1185], ["16x9", 1432], ["16x10", 1300], ["16x12", 1824], ["16x14", 2142]
  ]);
  const commercial6500 = singles([
    ["8x7", 796], ["8x8", 796], ["8x9", 929], ["8x10", 1006], ["8x12", 1243], ["8x14", 1447],
    ["9x7", 863], ["9x8", 863], ["9x9", 1004], ["9x10", 1104], ["9x12", 1347], ["9x14", 1603],
    ["10x7", 954], ["10x8", 954], ["10x9", 1101], ["10x10", 1190], ["10x12", 1463], ["10x14", 1733],
    ["12x7", 1124], ["12x8", 1124], ["12x9", 1274], ["12x10", 1396], ["12x12", 1708], ["12x14", 2008],
    ["14x7", 1331], ["14x8", 1331], ["14x9", 1499], ["14x10", 1649], ["14x12", 2008], ["14x14", 2325],
    ["16x7", 1479], ["16x8", 1479], ["16x9", 1682], ["16x10", 1840], ["16x12", 2276], ["16x14", 2615]
  ]);

  const woodModels = { glass: 60, insert: 37 };

  return {
    sheetDate: "9/19/2026",
    openerSheetDate: "9/16/2026",
    extensionCredit: 8,
    operatorBracket: 15,
    roofPitch: 50,
    lock: 28,
    specialWindowSection: 35,
    hardware: {
      flatHinge: 7.5,
      flatHandle: 4.05,
      magneticHinge: 7.5,
      magneticHandle: 10.35
    },
    roofPitchNote: "Add $50 when track must follow a 4/12 through 12/12 roof pitch.",
    bracketNote: "3000 series: $15 operator bracket is required when a motor is used. Warranty is void unless a strut is installed on the top section.",
    tracksLow: {
      low7: 95,
      low8: 125,
      radius: 185,
      hl24: 100,
      hl33: 125,
      hl48: 140,
      hl54: 170,
      hl72: 215
    },
    tracksHigh: {
      low7: 95,
      low8: 125,
      radius: 185,
      hl24: 125,
      hl33: 145,
      hl48: 160,
      hl54: 215,
      hl72: 255
    },
    tallAngle: { "10": 70, "12": 85, "14": 95 },
    tallLhr: { "10": 120, "12": 130, "14": 140 },
    tallHiliftStandard: {
      narrow: { "33": 150, "54": 180, "72": 210 },
      wide: { "33": 175, "54": 205, "72": 235 }
    },
    tallHiliftSandwich: {
      narrow: { "33": 180, "54": 210, "72": 240 },
      wide: { "33": 200, "54": 230, "72": 260 }
    },
    windAdders: {
      note: "120 and 130 mph amounts are add-ons to the no-windload price for 510/510VI and 3610. Sizes not listed: call.",
      sizes: ["8x7", "8x8", "9x7", "9x8", "10x7", "10x8", "12x7", "12x8", "14x7", "14x8", "16x7", "16x8", "18x7", "18x8"],
      mph120: {
        "510": [159, 187, 178, 214, 209, 243, 331, 379, 425, 615, 425, 615, 615, 813],
        "3610": [141, 142, 149, 151, 169, 186, 298, 345, 442, 551, 442, 551, 477, 610]
      },
      mph130: {
        "510": [271, 338, 293, 372, 293, 372, 697, 833, 697, 833, 697, 833, 697, 833],
        "3610": [271, 338, 293, 372, 293, 372, 697, 833, 697, 833, 697, 833, 697, 833]
      }
    },
    standaloneRails: [
      { id: "chain7", label: "7' chain rail", price: 88 },
      { id: "chain8", label: "8' chain rail", price: 115 },
      { id: "chain10", label: "10' chain rail", price: 147 },
      { id: "belt7", label: "7' belt rail", price: 111 },
      { id: "belt8", label: "8' belt rail", price: 140 },
      { id: "belt10", label: "10' belt rail", price: 175 }
    ],
    accessories: [
      { id: "991s", label: "991S 1-button transmitter Sec+ 3.0", price: 36 },
      { id: "993s", label: "993S 3-button transmitter Sec+ 3.0", price: 38 },
      { id: "979s", label: "979S wireless keypad Sec+ 3.0", price: 56 },
      { id: "485lm", label: "485LM EverCharge battery backup", price: 52 },
      { id: "880lm", label: "880LM smart control panel", price: 52.55 },
      { id: "828lm", label: "828LM internet gateway", price: 82.15 }
    ],
    adderPresets: [
      { label: "993S 3-button transmitter", cost: 38 },
      { label: "979S wireless keypad", cost: 56 },
      { label: "485LM battery backup", cost: 52 },
      { label: "Two springs on a one-spring door", cost: 49 },
      { label: "Double track on a single door", cost: 51 },
      { label: "Odd-size cut, 7' high door", cost: 161 },
      { label: "Odd-size cut, 8' and taller", cost: 220 },
      { label: "8' verticals and cables", cost: 37.5 },
      { label: "9' verticals and cables", cost: 74.5 }
    ],
    openers: [
      {
        id: "2220L",
        name: "LiftMaster 2220L",
        detail: "DC chain, 3/4 HP, Wi-Fi, camera",
        rails: { "7": 308, "8": 345, "10": 383 },
        headOnlyDeduct: 15
      },
      {
        id: "2420L",
        name: "LiftMaster 2420L",
        detail: "DC chain, 3/4 HP, Wi-Fi, camera, battery backup. Non-stock.",
        rails: { "7": 378, "8": 415, "10": 454 },
        headOnlyDeduct: 15
      },
      {
        id: "6580L",
        name: "LiftMaster 6580L",
        detail: "DC belt, 1 HP, Wi-Fi, camera, battery backup",
        rails: { "7": 386, "8": 426, "10": 478 },
        headOnlyDeduct: 15
      },
      {
        id: "6690L",
        name: "LiftMaster 6690L",
        detail: "DC belt, 1.25 HP, Wi-Fi, camera, battery backup",
        rails: { "7": 513, "8": 554, "10": 606 },
        headOnlyDeduct: 15
      },
      {
        id: "98022",
        name: "98022 wall mount",
        detail: "DC wall mount Wi-Fi, 850 lb",
        price: 665
      },
      {
        id: "98032",
        name: "98032 wall mount",
        detail: "DC wall mount Wi-Fi, 1,100 lb",
        price: 863
      },
      {
        id: "LJ8900W",
        name: "LJ8900W",
        detail: "Light-duty commercial, sectional",
        price: 475
      },
      {
        id: "LJ8950W",
        name: "LJ8950W",
        detail: "Light-duty commercial, rolling",
        price: 531
      },
      {
        id: "DDO8900W",
        name: "DDO8900W",
        detail: "Commercial dock door operator",
        price: 479
      },
      {
        id: "ATSW",
        name: "ATSW",
        detail: "1/2 HP heavy-duty residential / light commercial",
        rails: { "8": 575, "10": 626, "12": 684, "14": 739 },
        headOnlyDeduct: 15
      },
      {
        id: "MT5011U-12",
        name: "MT 5011U 12'",
        detail: "1/2 HP, 115V, 1 phase, photo eyes included",
        price: 721
      },
      {
        id: "MT5011U-14",
        name: "MT 5011U 14'",
        detail: "1/2 HP, 115V, 1 phase, photo eyes included",
        price: 730
      }
    ],
    series: [
      {
        id: "400",
        name: "400 Series",
        detail: "Residential 24 ga, non-insulated. Models 410–490. Torsion price; extension is −$8.",
        colors: residentialColors,
        winds: ["none", "90"],
        track: "residential",
        bracket: false,
        prices: { none: merge(standardHeights400, tall400), "90": standardHeights400w }
      },
      {
        id: "401",
        name: "401 Series",
        detail: "Residential 24 ga, vinyl insulated. Models 411–491. Torsion price; extension is −$8.",
        colors: residentialColors,
        winds: ["none", "90"],
        track: "residential",
        bracket: false,
        prices: { none: merge(standardHeights401, tall401), "90": standardHeights401w }
      },
      {
        id: "500",
        name: "500 Series",
        detail: "Residential 25 ga, non-insulated. Models 510 and 590. White, almond, sandstone.",
        colors: series500Colors,
        winds: ["none", "90"],
        track: "residential",
        bracket: false,
        prices: { none: merge(standard500, tall500), "90": standard500w }
      },
      {
        id: "501",
        name: "501 Series",
        detail: "Residential 25 ga, vinyl insulated. Models 511 and 591. White, almond, sandstone.",
        colors: series500Colors,
        winds: ["none", "90"],
        track: "residential",
        bracket: false,
        prices: { none: merge(standard501, tall501), "90": standard501w }
      },
      {
        id: "3000",
        name: "3000 Series",
        detail: "Insulated 2\" sandwich. Models 3610–3700. Operator bracket +$15 when a motor is used. Strut the top section or the warranty is void.",
        colors: series3000Colors,
        winds: ["none", "90"],
        track: "sandwich",
        bracket: true,
        prices: { none: merge(standard3000, tall3000), "90": standard3000w }
      },
      {
        id: "2411",
        name: "2411 / 4400 Commercial",
        detail: "24 ga non-insulated ribbed steel. One price column. Over 18'2\" wide: call.",
        colors: { standard: ["White", "As ordered"] },
        winds: ["none"],
        track: "commercial",
        bracket: false,
        commercial: true,
        windows: [
          { id: "24x6", label: "24×6 black frame, DSB glass", price: 55 },
          { id: "24x12", label: "24×12 black frame, clear acrylic", price: 65 }
        ],
        prices: { none: commercial2411 }
      },
      {
        id: "4401",
        name: "2411L / 4401 Commercial",
        detail: "24 ga insulated ribbed steel. One price column. Over 18'2\" wide: call.",
        colors: { standard: ["White", "As ordered"] },
        winds: ["none"],
        track: "commercial",
        bracket: false,
        commercial: true,
        windows: [
          { id: "24x6", label: "24×6 black frame, DSB glass", price: 55 },
          { id: "24x12", label: "24×12 black frame, insulated glass", price: 85 }
        ],
        prices: { none: commercial4401 }
      },
      {
        id: "6500",
        name: "6500 Commercial",
        detail: "24 ga 2\" steel-back insulated ribbed steel. Over 18'2\" wide: call.",
        colors: { standard: ["White", "As ordered"] },
        winds: ["none"],
        track: "commercial-sandwich",
        bracket: false,
        commercial: true,
        windows: [
          { id: "24x8", label: "24×8 black frame, insulated glass", price: 75 },
          { id: "24x12", label: "24×12 black frame, insulated glass", price: 85 }
        ],
        prices: { none: commercial6500 }
      }
    ],
    models: [
      { id: "410", series: "400", glass: 21, insert: 10, families: ["standard", "black"] },
      { id: "420", series: "400", glass: 40, insert: 16, woodGlass: woodModels.glass, woodInsert: woodModels.insert, families: ["standard", "black", "wood"] },
      { id: "430", series: "400", glass: 40, insert: 16, woodGlass: woodModels.glass, woodInsert: woodModels.insert, families: ["standard", "black", "wood"] },
      { id: "440", series: "400", glass: 40, insert: 16, woodGlass: woodModels.glass, woodInsert: woodModels.insert, families: ["standard", "black", "wood"] },
      { id: "450", series: "400", glass: 40, insert: 16, families: ["standard", "black"] },
      { id: "460", series: "400", glass: 40, insert: 16, families: ["standard", "black"] },
      { id: "480", series: "400", glass: 40, insert: 16, woodGlass: woodModels.glass, woodInsert: woodModels.insert, families: ["standard", "black", "wood"] },
      { id: "490", series: "400", glass: 40, insert: 16, families: ["standard", "black"] },
      { id: "411", series: "401", glass: 21, insert: 10, families: ["standard", "black"] },
      { id: "421", series: "401", glass: 40, insert: 16, woodGlass: woodModels.glass, woodInsert: woodModels.insert, families: ["standard", "black", "wood"] },
      { id: "431", series: "401", glass: 40, insert: 16, insertByWind: { none: 20, "90": 16 }, woodGlass: woodModels.glass, woodInsert: woodModels.insert, families: ["standard", "black", "wood"] },
      { id: "441", series: "401", glass: 40, insert: 16, woodGlass: woodModels.glass, woodInsert: woodModels.insert, families: ["standard", "black", "wood"] },
      { id: "451", series: "401", glass: 40, insert: 16, families: ["standard", "black"] },
      { id: "461", series: "401", glass: 40, insert: 16, families: ["standard", "black"] },
      { id: "481", series: "401", glass: 40, insert: 16, woodGlass: woodModels.glass, woodInsert: woodModels.insert, families: ["standard", "black", "wood"] },
      { id: "491", series: "401", glass: 40, insert: 16, families: ["standard", "black"] },
      { id: "510", series: "500", glass: 21, insert: 10, families: ["standard"] },
      { id: "590", series: "500", glass: 40, insert: 16, families: ["standard"] },
      { id: "511", series: "501", glass: 21, insert: 10, families: ["standard"] },
      { id: "591", series: "501", glass: 40, insert: 16, families: ["standard"] },
      { id: "3610", series: "3000", glass: 21, insert: 10, families: ["standard", "black"] },
      { id: "3620", series: "3000", glass: 40, insert: 16, woodGlass: woodModels.glass, woodInsert: woodModels.insert, families: ["standard", "black", "wood"] },
      { id: "3630", series: "3000", glass: 40, insert: 16, woodGlass: woodModels.glass, woodInsert: woodModels.insert, families: ["standard", "black", "wood"] },
      { id: "3640", series: "3000", glass: 40, insert: 16, woodGlass: woodModels.glass, woodInsert: woodModels.insert, families: ["standard", "black", "wood"] },
      { id: "3650", series: "3000", glass: 40, insert: 16, families: ["standard", "black"] },
      { id: "3660", series: "3000", glass: 40, insert: 16, families: ["standard", "black"] },
      { id: "3680", series: "3000", glass: 40, insert: 16, woodGlass: woodModels.glass, woodInsert: woodModels.insert, families: ["standard", "black", "wood"] },
      { id: "3690", series: "3000", glass: 40, insert: 16, families: ["standard", "black"] },
      { id: "3700", series: "3000", glass: 40, insert: 16, woodGlass: woodModels.glass, woodInsert: woodModels.insert, families: ["standard", "black", "wood"] },
      { id: "2411", series: "2411", glass: 0, insert: 0, families: ["standard"] },
      { id: "4401", series: "4401", glass: 0, insert: 0, families: ["standard"] },
      { id: "6500", series: "6500", glass: 0, insert: 0, families: ["standard"] }
    ]
  };
});
