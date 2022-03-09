import SettingsUtilities from "@/services/Functional/Utilities/Settings.js";
let clonedeep = require("lodash.clonedeep");

global.dummyItemsWithItemDetails = [
  {
    id: 211,
    plio: 113,
    type: "question",
    time: 15.6,
    meta: {
      source: {
        name: "default",
      },
    },
    details: {
      id: 212,
      item: 211,
      text: "question 1",
      type: "mcq",
      options: ["option 1", "option 2"],
      correct_answer: 0,
      image: null,
      has_char_limit: false,
      max_char_limit: 100,
      created_at: "2021-07-03T15:24:58.094413Z",
      updated_at: "2021-07-03T15:25:03.189497Z",
    },
    created_at: "2021-07-03T15:24:58.018952Z",
    updated_at: "2021-07-03T15:25:02.915225Z",
  },
  {
    id: 207,
    plio: 113,
    type: "question",
    time: 56.9,
    meta: {
      source: {
        name: "default",
      },
    },
    details: {
      id: 208,
      item: 207,
      text: "question 2",
      type: "mcq",
      options: ["option 1", "option 2"],
      correct_answer: 1,
      image: null,
      has_char_limit: false,
      max_char_limit: 100,
      created_at: "2021-07-03T15:10:17.957417Z",
      updated_at: "2021-07-03T15:25:02.841389Z",
    },
    created_at: "2021-07-03T15:10:17.885435Z",
    updated_at: "2021-07-03T15:25:02.758313Z",
  },
  {
    id: 200,
    plio: 113,
    type: "question",
    time: 118.3,
    meta: {
      source: {
        name: "default",
      },
    },
    details: {
      id: 201,
      item: 200,
      text: "this is a subjective question without image",
      type: "subjective",
      options: ["", ""],
      correct_answer: 0,
      image: null,
      has_char_limit: false,
      max_char_limit: 100,
      created_at: "2021-07-03T15:00:02.370171Z",
      updated_at: "2021-07-03T15:25:03.094042Z",
    },
    created_at: "2021-07-03T15:00:01.920733Z",
    updated_at: "2021-07-03T15:25:02.998921Z",
  },
  {
    id: 201,
    plio: 113,
    type: "question",
    time: 194.5,
    meta: {
      source: {
        name: "default",
      },
    },
    details: {
      id: 202,
      item: 201,
      text: "this is a subjective question with image!",
      type: "subjective",
      options: ["", ""],
      correct_answer: 0,
      image: {
        id: 58,
        url: "https://plio-prod-assets.s3.amazonaws.com/images/ukescforkt.png",
        alt_text: "Image",
        created_at: "2021-07-03T15:00:02.476801Z",
        updated_at: "2021-07-03T15:00:02.484068Z",
      },
      has_char_limit: false,
      max_char_limit: 100,
      created_at: "2021-07-03T15:00:04.244582Z",
      updated_at: "2021-07-03T15:25:03.521730Z",
    },
    created_at: "2021-07-03T15:00:01.993437Z",
    updated_at: "2021-07-03T15:25:03.380337Z",
  },
  {
    id: 202,
    plio: 113,
    type: "question",
    time: 200.5,
    meta: {
      source: {
        name: "default",
      },
    },
    details: {
      id: 203,
      item: 202,
      text: "this is a checkbox question!",
      type: "checkbox",
      options: ["", "", ""],
      correct_answer: [1, 2],
      has_char_limit: false,
      max_char_limit: 100,
      created_at: "2021-07-03T15:00:04.244582Z",
      updated_at: "2021-07-03T15:25:03.521730Z",
    },
    created_at: "2021-07-03T15:00:01.993437Z",
    updated_at: "2021-07-03T15:25:03.380337Z",
  },
];

global.dummyItemDetails = [
  {
    id: 212,
    item: 211,
    text: "question 1",
    type: "mcq",
    options: ["option 1", "option 2"],
    correct_answer: 0,
    image: null,
    has_char_limit: false,
    max_char_limit: 100,
    created_at: "2021-07-03T15:24:58.094413Z",
    updated_at: "2021-07-03T15:25:03.189497Z",
  },
  {
    id: 208,
    item: 207,
    text: "question 2",
    type: "mcq",
    options: ["option 1", "option 2"],
    correct_answer: 1,
    image: null,
    has_char_limit: false,
    max_char_limit: 100,
    created_at: "2021-07-03T15:10:17.957417Z",
    updated_at: "2021-07-03T15:25:02.841389Z",
  },
  {
    id: 201,
    item: 200,
    text: "this is a subjective question without image",
    type: "subjective",
    options: ["", ""],
    correct_answer: 0,
    image: null,
    has_char_limit: false,
    max_char_limit: 100,
    created_at: "2021-07-03T15:00:02.370171Z",
    updated_at: "2021-07-03T15:25:03.094042Z",
  },
  {
    id: 202,
    item: 201,
    text: "this is a subjective question with image!",
    type: "subjective",
    options: ["", ""],
    correct_answer: 0,
    image: {
      id: 58,
      url: "https://plio-prod-assets.s3.amazonaws.com/images/ukescforkt.png",
      alt_text: "Image",
      created_at: "2021-07-03T15:00:02.476801Z",
      updated_at: "2021-07-03T15:00:02.484068Z",
    },
    has_char_limit: false,
    max_char_limit: 100,
    created_at: "2021-07-03T15:00:04.244582Z",
    updated_at: "2021-07-03T15:25:03.521730Z",
  },
  {
    id: 203,
    item: 202,
    text: "this is a checkbox question!",
    type: "checkbox",
    options: ["", "", ""],
    correct_answer: [1, 2],
    has_char_limit: false,
    max_char_limit: 100,
    created_at: "2021-07-03T15:00:04.244582Z",
    updated_at: "2021-07-03T15:25:03.521730Z",
  },
];
global.dummyItems = [
  {
    id: 211,
    plio: 113,
    type: "question",
    time: 15.6,
    meta: {
      source: {
        name: "default",
      },
    },
    created_at: "2021-07-03T15:24:58.018952Z",
    updated_at: "2021-07-03T15:25:02.915225Z",
  },
  {
    id: 207,
    plio: 113,
    type: "question",
    time: 56.9,
    meta: {
      source: {
        name: "default",
      },
    },
    created_at: "2021-07-03T15:10:17.885435Z",
    updated_at: "2021-07-03T15:25:02.758313Z",
  },
  {
    id: 200,
    plio: 113,
    type: "question",
    time: 118.3,
    meta: {
      source: {
        name: "default",
      },
    },
    created_at: "2021-07-03T15:00:01.920733Z",
    updated_at: "2021-07-03T15:25:02.998921Z",
  },
  {
    id: 201,
    plio: 113,
    type: "question",
    time: 194.5,
    meta: {
      source: {
        name: "default",
      },
    },
    created_at: "2021-07-03T15:00:01.993437Z",
    updated_at: "2021-07-03T15:25:03.380337Z",
  },
  {
    id: 202,
    plio: 113,
    type: "question",
    time: 200.5,
    meta: {
      source: {
        name: "default",
      },
    },
    created_at: "2021-07-03T15:00:01.993437Z",
    updated_at: "2021-07-03T15:25:03.380337Z",
  },
];

global.dummyDraftPlio = {
  data: {
    id: 113,
    name: "dummy plio",
    uuid: "abcdefghij",
    failsafe_url: "",
    status: "draft",
    is_public: true,
    config: null,
    created_by: {
      id: 4,
      last_login: null,
      is_superuser: true,
      first_name: "",
      last_name: "",
      is_staff: false,
      is_active: true,
      date_joined: "2021-04-21T08:49:09.763295Z",
      email: "first.last@email.com",
      mobile: null,
      avatar_url: null,
      config: {
        locale: "en",
      },
      created_at: "2021-04-21T08:49:09.763814Z",
      updated_at: "2021-07-08T09:51:19.145752Z",
      organizations: [
        {
          id: 3,
          schema_name: "qwertyuiop",
          name: "Organization 1",
          shortcode: "o1",
          created_at: "2021-04-26T09:46:38.972422Z",
          updated_at: "2021-04-26T09:46:38.972433Z",
        },
        {
          id: 2,
          schema_name: "asdfghjkla",
          name: "Organization 2",
          shortcode: "o2",
          created_at: "2021-04-21T10:12:51.751152Z",
          updated_at: "2021-06-30T08:41:41.652160Z",
        },
      ],
      status: "approved",
      unique_id: null,
      auth_org: null,
    },
    video: {
      id: 300,
      url: "https://www.youtube.com/watch?v=jdYJf_ybyVo",
      title: null,
      duration: 725,
      created_at: "2021-06-17T16:14:21.084680Z",
      updated_at: "2021-07-03T15:25:04.527931Z",
    },
    created_at: "2021-07-03T15:00:01.669764Z",
    updated_at: "2021-07-03T15:25:04.589996Z",
    items: dummyItemsWithItemDetails,
  },
};

global.dummySSOUser = {
  id: 5,
  last_login: null,
  is_superuser: false,
  first_name: "",
  last_name: "",
  is_staff: false,
  is_active: true,
  date_joined: "2021-04-21T08:49:09.763295Z",
  email: "first.last@email.com",
  mobile: null,
  avatar_url: null,
  config: {
    locale: "en",
  },
  created_at: "2021-04-21T08:49:09.763814Z",
  updated_at: "2021-07-08T09:51:19.145752Z",
  organizations: [],
  status: "approved",
  unique_id: "0000000000",
  auth_org: 1,
};

global.dummyUser = {
  id: 4,
  last_login: null,
  is_superuser: true,
  first_name: "",
  last_name: "",
  is_staff: false,
  is_active: true,
  date_joined: "2021-04-21T08:49:09.763295Z",
  email: "first.last@email.com",
  mobile: null,
  avatar_url: null,
  config: {
    locale: "en",
  },
  created_at: "2021-04-21T08:49:09.763814Z",
  updated_at: "2021-07-08T09:51:19.145752Z",
  organizations: [
    {
      id: 3,
      schema_name: "qwertyuiop",
      name: "Organization 1",
      shortcode: "o1",
      role: "org-admin",
      config: null,
      created_at: "2021-04-26T09:46:38.972422Z",
      updated_at: "2021-04-26T09:46:38.972433Z",
    },
    {
      id: 2,
      schema_name: "asdfghjkla",
      name: "Organization 2",
      shortcode: "o2",
      role: "org-view",
      config: null,
      created_at: "2021-04-21T10:12:51.751152Z",
      updated_at: "2021-06-30T08:41:41.652160Z",
    },
  ],
  status: "approved",
  unique_id: null,
  auth_org: null,
};

global.dummyVideo = {
  id: 300,
  url: "https://www.youtube.com/watch?v=jdYJf_ybyVo",
  title: null,
  duration: 725,
  created_at: "2021-06-17T16:14:21.084680Z",
  updated_at: "2021-07-03T15:25:04.527931Z",
};

global.dummyYouTubeResponse = {
  items: [
    {
      contentDetails: {
        duration: "PT11M35S",
      },
    },
  ],
};

global.dummyEmptyYouTubeResponse = {
  items: [],
};

global.dummyPlioMetrics = {
  unique_viewers: 2,
  average_watch_time: 202,
  average_num_answered: 5,
  percent_completed: 40,
  accuracy: 30,
  percent_one_minute_retention: 50,
};

global.imageData = {
  dataUrl:
    "data:image/png;base64,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... (10024 total length)",
  info: {
    name: "dummyImage",
    type: "image/png",
    newWidth: 1024,
    newHeight: 145,
    orgWidth: 702,
    orgHeight: 100,
    aspectRatio: 7.06,
    modifiedTimestamp: 1625767016054,
    modifiedDate:
      "[native Date Thu Jul 08 2021 23:26:56 GMT+0530 (India Standard Time)]",
  },
  exif: null,
  file: "[object File]",
};

global.dummyEmptyPlioList = {
  data: {
    count: 0,
    page_size: 5,
    results: [],
    raw_count: 0,
  },
};

global.getDummyPlioList = () => {
  let plio = clonedeep(global.dummyDraftPlio.data);
  plio.unique_viewers = 0;
  return {
    count: 1,
    page_size: 5,
    results: [plio],
    raw_count: 1,
  };
};

global.dummyUniqueUserCountList = [1, 2, 3, 4, 5];

global.dummyAccessToken = {
  access_token: "1234",
  expires_in: 86400,
  refresh_token: "4321",
  scope: "read write",
  token_type: "Bearer",
};

global.dummyItemResponses = [
  {
    id: 1,
    deleted: null,
    session: 36,
    item: 211,
    answer: 0,
    created_at: "2021-09-14T13:25:44.357052Z",
    updated_at: "2021-09-14T13:25:44.357290Z",
  },
  {
    id: 3,
    deleted: null,
    session: 36,
    item: 207,
    answer: 1,
    created_at: "2021-09-14T13:25:44.604531Z",
    updated_at: "2021-09-14T13:25:44.604629Z",
  },
  {
    id: 2,
    deleted: null,
    session: 36,
    item: 200,
    answer: "xyz",
    created_at: "2021-09-14T13:25:44.572076Z",
    updated_at: "2021-09-14T13:25:44.572180Z",
  },
  {
    id: 4,
    deleted: null,
    session: 36,
    item: 201,
    answer: "abc",
    created_at: "2021-09-14T13:25:44.663224Z",
    updated_at: "2021-09-14T13:25:44.663307Z",
  },
  {
    id: 5,
    deleted: null,
    session: 36,
    item: 202,
    answer: [0, 1],
    created_at: "2021-09-14T13:25:44.663224Z",
    updated_at: "2021-09-14T13:25:44.663307Z",
  },
];

global.dummySession = {
  data: {
    id: 1,
    last_event: null,
    is_first: false,
    retention: "",
    watch_time: 0,
    session_answers: global.dummyItemResponses,
  },
};

global.dummyGlobalSettings = new Map(
  Object.entries({
    player: {
      scope: ["org-admin", "super-admin"],
      children: new Map(
        Object.entries({
          configuration: {
            scope: ["org-admin", "super-admin"],
            children: new Map(
              Object.entries({
                skipEnabled: {
                  scope: ["org-admin", "super-admin"],
                  value: true,
                },
              })
            ),
          },
        })
      ),
    },
    app: {
      scope: [],
      children: new Map(
        Object.entries({
          appearance: {
            scope: [],
            children: new Map(
              Object.entries({
                darkMode: {
                  scope: [],
                  value: false,
                },
              })
            ),
          },
        })
      ),
    },
  })
);

global.dummyGlobalSettingsFilteredForWorkspaces = new Map(
  Object.entries({
    player: {
      scope: ["org-admin", "super-admin"],
      children: new Map(
        Object.entries({
          configuration: {
            scope: ["org-admin", "super-admin"],
            children: new Map(
              Object.entries({
                skipEnabled: {
                  scope: ["org-admin", "super-admin"],
                  value: true,
                },
              })
            ),
          },
        })
      ),
    },
  })
);

global.dummySettingsToRender = new Map(
  Object.entries({
    player: new Map(
      Object.entries({
        configuration: new Map(
          Object.entries({
            skipEnabled: {
              title: "settings.menu.title.skipEnabled",
              description: "settings.menu.description.skipEnabled",
              type: "checkbox",
              value: false,
              isWorkspaceSetting: false,
            },
          })
        ),
      })
    ),
    app: new Map(
      Object.entries({
        appearance: new Map(
          Object.entries({
            darkMode: {
              title: "settings.menu.title.darkMode",
              description: "settings.menu.description.darkMode",
              type: "checkbox",
              value: false,
              isWorkspaceSetting: false,
            },
          })
        ),
      })
    ),
  })
);

global.dummyPublishedPlio = {
  data: {
    id: 113,
    name: "dummy plio",
    uuid: "abcdefghij",
    failsafe_url: "",
    status: "published",
    is_public: true,
    config: {
      settings: SettingsUtilities.encodeMapToPayload(
        clonedeep(global.dummyGlobalSettings)
      ),
    },
    created_by: {
      id: 4,
      last_login: null,
      is_superuser: true,
      first_name: "",
      last_name: "",
      is_staff: false,
      is_active: true,
      date_joined: "2021-04-21T08:49:09.763295Z",
      email: "first.last@email.com",
      mobile: null,
      avatar_url: null,
      config: {
        locale: "en",
      },
      created_at: "2021-04-21T08:49:09.763814Z",
      updated_at: "2021-07-08T09:51:19.145752Z",
      organizations: [
        {
          id: 3,
          schema_name: "qwertyuiop",
          name: "Organization 1",
          shortcode: "o1",
          created_at: "2021-04-26T09:46:38.972422Z",
          updated_at: "2021-04-26T09:46:38.972433Z",
        },
        {
          id: 2,
          schema_name: "asdfghjkla",
          name: "Organization 2",
          shortcode: "o2",
          created_at: "2021-04-21T10:12:51.751152Z",
          updated_at: "2021-06-30T08:41:41.652160Z",
        },
      ],
      status: "approved",
      unique_id: null,
      auth_org: null,
    },
    video: {
      id: 300,
      url: "https://www.youtube.com/watch?v=jdYJf_ybyVo",
      title: null,
      duration: 725,
      created_at: "2021-06-17T16:14:21.084680Z",
      updated_at: "2021-07-03T15:25:04.527931Z",
    },
    created_at: "2021-07-03T15:00:01.669764Z",
    updated_at: "2021-07-03T15:25:04.589996Z",
    items: dummyItemsWithItemDetails,
  },
};
