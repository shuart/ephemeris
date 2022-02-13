var ephemeris_presets = {}
ephemeris_presets.se = `{
    "infos": [
        {
            "uuid": "eLZ4hQP2LYAtBLlh",
            "projectUuid": "e6onbxMAp4W7c5q1",
            "type": "critical",
            "name": "seetest",
            "reference": "REF-001",
            "description": ""
        }
    ],
    "stakeholders": [
        {
            "uuid": "enPaAEDb1vvQwuPH",
            "actorsId": "ehmb1YMjDY2HlXvB",
            "name": "Space55",
            "lastName": "qfzfqz",
            "org": "na",
            "role": "",
            "mail": ""
        },
        {
            "uuid": "f896546e",
            "name": "John",
            "lastName": "Doe",
            "org": "Entreprise inc",
            "role": "PM",
            "mail": ""
        }
    ],
    "tags": [
        {
            "uuid": "eGhcmqwQV9MD8c7p",
            "name": "Approved",
            "color": "#03b5aa"
        },
        {
            "uuid": "ekfI7bOamXUwvQpj",
            "name": "Closed",
            "color": "#03b5aa"
        },
        {
            "uuid": "eR7Dtpe7OS8IgyBM",
            "name": "Rejected",
            "color": "#03b5aa"
        }
    ],
    "interfacesTypes": [
        {
            "uuid": "evNLKd2RmPTHRu9z",
            "name": "Interface",
            "color": "#03b5aa"
        },
        {
            "uuid": "eUIHcPg1_9theCwX",
            "name": "Physical connection",
            "color": "#03b5aa"
        },
        {
            "uuid": "e9jLPYTO4PIMzOjl",
            "name": "Data connection",
            "color": "#03b5aa"
        },
        {
            "uuid": "eNc7QoJxWTYlyAST",
            "name": "Command connection",
            "color": "#03b5aa"
        },
        {
            "uuid": "eo8YaVhZMIoWW6Ia",
            "name": "Power connection",
            "color": "#03b5aa"
        },
        {
            "uuid": "ecUrxZ3V6su3j2qc",
            "name": "Electrical connection",
            "color": "#03b5aa"
        },
        {
            "uuid": "eHzc7g3k15kkuVkZ",
            "name": "Mechanical connection",
            "color": "#03b5aa"
        }
    ],
    "categories": [
        {
            "uuid": "e7S5I6QyNqfwSZOk",
            "name": "Space",
            "svgPath": "M504 352H136.4c-4.4 0-8 3.6-8 8l-.1 48c0 4.4 3.6 8 8 8H504c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm0 96H136.1c-4.4 0-8 3.6-8 8l-.1 48c0 4.4 3.6 8 8 8h368c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm0-192H136.6c-4.4 0-8 3.6-8 8l-.1 48c0 4.4 3.6 8 8 8H504c4.4 0 8-3.6 8-8v-48c0-4.4-3.6-8-8-8zm106.5-139L338.4 3.7a48.15 48.15 0 0 0-36.9 0L29.5 117C11.7 124.5 0 141.9 0 161.3V504c0 4.4 3.6 8 8 8h80c4.4 0 8-3.6 8-8V256c0-17.6 14.6-32 32.6-32h382.8c18 0 32.6 14.4 32.6 32v248c0 4.4 3.6 8 8 8h80c4.4 0 8-3.6 8-8V161.3c0-19.4-11.7-36.8-29.5-44.3z",
            "color": "#6dce9e"
        },
        {
            "uuid": "eu9SXDnd54rwJETj",
            "name": "Electrical",
            "svgPath": "M296 160H180.6l42.6-129.8C227.2 15 215.7 0 200 0H56C44 0 33.8 8.9 32.2 20.8l-32 240C-1.7 275.2 9.5 288 24 288h118.7L96.6 482.5c-3.6 15.2 8 29.5 23.3 29.5 8.4 0 16.4-4.4 20.8-12l176-304c9.3-15.9-2.2-36-20.7-36z",
            "color": "#f975eb"
        },
        {
            "uuid": "e6jJl3f8fYfztbhM",
            "name": "Network",
            "svgPath": "M640 264v-16c0-8.84-7.16-16-16-16H344v-40h72c17.67 0 32-14.33 32-32V32c0-17.67-14.33-32-32-32H224c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h72v40H16c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h104v40H64c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h160c17.67 0 32-14.33 32-32V352c0-17.67-14.33-32-32-32h-56v-40h304v40h-56c-17.67 0-32 14.33-32 32v128c0 17.67 14.33 32 32 32h160c17.67 0 32-14.33 32-32V352c0-17.67-14.33-32-32-32h-56v-40h104c8.84 0 16-7.16 16-16zM256 128V64h128v64H256zm-64 320H96v-64h96v64zm352 0h-96v-64h96v64z",
            "color": "#6dce9e"
        },
        {
            "uuid": "eVp1RZ6bDAe_QgAG",
            "name": "Mechanical",
            "svgPath": "M288 64c17.7 0 32-14.3 32-32S305.7 0 288 0s-32 14.3-32 32 14.3 32 32 32zm223.5-12.1c-2.3-8.6-11-13.6-19.6-11.3l-480 128c-8.5 2.3-13.6 11-11.3 19.6C2.5 195.3 8.9 200 16 200c1.4 0 2.8-.2 4.1-.5L240 140.8V224H64c-17.7 0-32 14.3-32 32v224c0 17.7 14.3 32 32 32h384c17.7 0 32-14.3 32-32V256c0-17.7-14.3-32-32-32H272v-91.7l228.1-60.8c8.6-2.3 13.6-11.1 11.4-19.6zM176 384H80v-96h96v96zm160-96h96v96h-96v-96zm-32 0v96h-96v-96h96zM192 96c17.7 0 32-14.3 32-32s-14.3-32-32-32-32 14.3-32 32 14.3 32 32 32z",
            "color": "#6dce9e"
        },
        {
            "uuid": "eX6kKZINKhReWzvn",
            "name": "Architecture",
            "svgPath": "M560 448h-16V96H32v352H16.02c-8.84 0-16 7.16-16 16v32c0 8.84 7.16 16 16 16H176c8.84 0 16-7.16 16-16V320c0-53.02 42.98-96 96-96s96 42.98 96 96l.02 160v16c0 8.84 7.16 16 16 16H560c8.84 0 16-7.16 16-16v-32c0-8.84-7.16-16-16-16zm0-448H16C7.16 0 0 7.16 0 16v32c0 8.84 7.16 16 16 16h544c8.84 0 16-7.16 16-16V16c0-8.84-7.16-16-16-16z",
            "color": "#6dce9e"
        },
        {
            "uuid": "eR6OkWHqj1srPXt6",
            "addedDate": 1617570389479,
            "name": "Requirements",
            "svgPath": "M294.2 277.7c18 5 34.7 13.4 49.5 24.7l161.5-53.8c8.4-2.8 12.9-11.9 10.1-20.2L454.9 47.2c-2.8-8.4-11.9-12.9-20.2-10.1l-61.1 20.4 33.1 99.4L346 177l-33.1-99.4-61.6 20.5c-8.4 2.8-12.9 11.9-10.1 20.2l53 159.4zm281 48.7L565 296c-2.8-8.4-11.9-12.9-20.2-10.1l-213.5 71.2c-17.2-22-43.6-36.4-73.5-37L158.4 21.9C154 8.8 141.8 0 128 0H16C7.2 0 0 7.2 0 16v32c0 8.8 7.2 16 16 16h88.9l92.2 276.7c-26.1 20.4-41.7 53.6-36 90.5 6.1 39.4 37.9 72.3 77.3 79.2 60.2 10.7 112.3-34.8 113.4-92.6l213.3-71.2c8.3-2.8 12.9-11.8 10.1-20.2zM256 464c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z",
            "color": "#fec766"
        },
        {
            "uuid": "excZMngFrKcoTT1i",
            "addedDate": 1617570440412,
            "name": "Stakeholders",
            "svgPath": "M294.2 277.7c18 5 34.7 13.4 49.5 24.7l161.5-53.8c8.4-2.8 12.9-11.9 10.1-20.2L454.9 47.2c-2.8-8.4-11.9-12.9-20.2-10.1l-61.1 20.4 33.1 99.4L346 177l-33.1-99.4-61.6 20.5c-8.4 2.8-12.9 11.9-10.1 20.2l53 159.4zm281 48.7L565 296c-2.8-8.4-11.9-12.9-20.2-10.1l-213.5 71.2c-17.2-22-43.6-36.4-73.5-37L158.4 21.9C154 8.8 141.8 0 128 0H16C7.2 0 0 7.2 0 16v32c0 8.8 7.2 16 16 16h88.9l92.2 276.7c-26.1 20.4-41.7 53.6-36 90.5 6.1 39.4 37.9 72.3 77.3 79.2 60.2 10.7 112.3-34.8 113.4-92.6l213.3-71.2c8.3-2.8 12.9-11.8 10.1-20.2zM256 464c-26.5 0-48-21.5-48-48s21.5-48 48-48 48 21.5 48 48-21.5 48-48 48z",
            "color": "#22ccff"
        }
    ],
    "meetings": [
        {
            "uuid": "erSqKd4yx54k4EJ6",
            "relations": [],
            "createdOn": "2021-04-04T21:04:16.225Z",
            "title": "Meeting example",
            "content": "Use Markdown",
            "participants": {
                "present": [
                    "f896546e"
                ],
                "absent": [
                    "fefiose"
                ],
                "cc": [
                    "fefiose"
                ]
            },
            "chapters": [
                {
                    "uuid": "e6iqxcMxgHf9NJPr",
                    "name": "Meeting chapter",
                    "topics": [
                        {
                            "uuid": "eKNRoHa0EhCo5l3S",
                            "name": "Topic",
                            "items": [
                                {
                                    "uuid": "ePgf4bbj99Gw6T8t",
                                    "createdOn": "2021-04-04T21:04:16.225Z",
                                    "type": "action",
                                    "assignedTo": [
                                        "f896546e"
                                    ],
                                    "date": "2021-04-04T21:04:16.225Z",
                                    "content": "An example item"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ],
    "workPackages": [
        {
            "uuid": "e2lyNbYYe54xFv65",
            "name": "A work package"
        }
    ],
    "physicalSpaces": [
        {
            "uuid": "eiAWdnSUIc9YZuRj",
            "name": "A physical space"
        }
    ],
    "graphs": [
        {
            "0": {
                "uuid": "f896546e",
                "fx": 303.3567591326126,
                "fy": 456.92026148965726
            },
            "1": {
                "uuid": "fefiose",
                "fx": 280.90578607861664,
                "fy": 340.49053534573414
            }
        }
    ],
    "documents": [
        {
            "uuid": "ecqEUgGxyB0ACY3T",
            "name": "Ephemeris Handbook",
            "type": "html",
            "link": "https://github.com/shuart/ephemeris/blob/master/README.md",
            "description": "Quickstart guide for Ephemeris"
        }
    ],
    "actors": [
        {
            "uuid": "ehmb1YMjDY2HlXvB",
            "name": "Space55",
            "lastName": "qfzfqz"
        }
    ],
    "currentPbs": [],
    "plannings": [],
    "events": [],
    "timeTracks": [],
    "timeLinks": [],
    "requirements": [],
    "functions": [],
    "actions": [],
    "extraFields": [],
    "templates": [],
    "metaLinks": [],
    "interfaces": [],
    "vvSets": [],
    "vvReports": [],
    "vvDefinitions": [],
    "vvActions": [],
    "history": [],
    "changes": [],
    "settings": [],
    "itemsOrder": [],
    "onlineHistory": [],
    "compositePages":[],
    "pageModules":[],
    "links": []
}`
