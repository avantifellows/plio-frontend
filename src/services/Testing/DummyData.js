export const dummyDraftPlio = {
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
  },
};

export const dummyUser = {
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
};

export const dummyPublishedPlio = {
  data: {
    id: 113,
    name: "dummy plio",
    uuid: "abcdefghij",
    failsafe_url: "",
    status: "published",
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
  },
};

export const dummyPlioAnalytics = {
  "Session.uniqueUsers": 2,
  "GroupedSession.averageWatchTime": 202,
  "AggregateSessionMetrics.numQuestionsAnswered": 5,
  "AggregateSessionMetrics.completionPercentage": 40,
  "AggregateSessionMetrics.accuracy": 30,
  "GroupedSessionRetention.averageOneMinuteRetention": 50,
};

export const dummyItems = {
  data: [
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
      details: {
        id: 212,
        item: 211,
        text: "question 1",
        type: "subjective",
        options: ["option 1", "option 2"],
        correct_answer: 0,
        image: null,
        has_char_limit: false,
        max_char_limit: 100,
        created_at: "2021-07-03T15:24:58.094413Z",
        updated_at: "2021-07-03T15:25:03.189497Z",
      },
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
      details: {
        id: 202,
        item: 201,
        text: "this is a subjective question with image!",
        type: "subjective",
        options: ["", ""],
        correct_answer: 0,
        image: {
          id: 58,
          url:
            "https://plio-prod-assets.s3.amazonaws.com/images/ukescforkt.png",
          alt_text: "Image",
          created_at: "2021-07-03T15:00:02.476801Z",
          updated_at: "2021-07-03T15:00:02.484068Z",
        },
        has_char_limit: false,
        max_char_limit: 100,
        created_at: "2021-07-03T15:00:04.244582Z",
        updated_at: "2021-07-03T15:25:03.521730Z",
      },
    },
  ],
};

export const dummyEmptyPlioList = {
  data: {
    count: 0,
    page_size: 5,
    results: [],
  },
};

export const dummyPlioList = {
  data: {
    count: 5,
    page_size: 5,
    results: ["abc", "def", "ghi", "jkl", "mno"],
  },
};

export const dummyUniqueUserCountList = [1, 2, 3, 4, 5];

export const dummyAccessToken = {
  access_token: "1234",
};

export const dummyPlioPlay = {
  plioDBId: 1,
  plioTitle: "dummy plio",
  status: "published",
  updatedAt: "2020-08-19T11:04:10.729434Z",
  videoDBId: 1,
  videoURL: "https://www.youtube.com/watch?v=6bSM4_Q5nW4",
  items: [],
};

export const dummySession = {
  created_at: "2021-08-24T14:17:17.034110Z",
  experiment: null,
  has_video_played: false,
  id: 1,
  is_first: false,
  last_event: null,
  plio: {
    id: 1,
    name: "dummy plio",
    uuid: "jdzdfnaznb",
    failsafe_url: "",
    status: "published",
  },
  retention: "NaN",
  session_answers: [],
  updated_at: "2021-08-24T14:17:17.034270Z",
  user: {},
  watch_time: 0.7,
};
