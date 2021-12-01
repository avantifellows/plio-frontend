export default {
  nav: {
    home: "Home",
    login: "",
    logout: "Logout",
    whats_new: "What's New",
    product_guides: "Product Guides",
    docs: "Documentation",
    editor: "Editor",
    dashboard: "Dashboard",
    abtesting: "",
    player: "",
    404: "Error",
  },
  editor: {
    video_input: {
      placeholder: "Enter the link of the YouTube video",
      title: "YouTube video link",
      validation: {
        valid: "",
        invalid: "Invalid Link",
      },
      info: {
        1: "To get started, you need to paste the link of the YouTube video that you want to make interactive. If you don't have a link, you can ",
        2: "upload the video to YouTube",
        3: " and get the link.",
      },
    },
    plio_title: {
      placeholder: "Enter the name of the Plio",
      title: "Name of the Plio",
    },
    headings: {
      add_question: "Add a new question",
      subjective_question_warning:
        "All answers to subjective questions are considered correct",
    },
    buttons: {
      home: "Home",
      publish: {
        draft: "Publish Plio",
        published: "Publish",
      },
      show_video: "Show Video",
      show_question: "Show Question",
      share_plio: "Share",
      play_plio: "Play",
      preview_plio: "Preview",
      embed_plio: "Embed",
      analyze_plio: "Analyze",
      share_draft: "Copy Draft Link",
    },
    updated: "Updated at",
    item_editor: {
      question_input: {
        title: "Question",
        placeholder: "Enter the question here",
      },
      time_input: {
        title: "Time for the question to appear",
      },
      option_input: {
        title: "Option",
        placeholder: "Enter Option",
      },
      buttons: {
        add_option: "Add another option",
      },
      dropdown: {
        question: "Question",
      },
      heading: {
        question: "EDIT QUESTION",
        set_character_limit: "Set Character Limit",
        char_limit: {
          max: "MAX",
          chars_allowed: "CHARACTERS ALLOWED",
        },
      },
      image_upload: {
        add_image: "Image",
        edit_image: "Edit",
      },
    },
    dialog: {
      delete_option: {
        title: "Are you sure you want to delete this option?",
      },
      cannot_add_question: {
        title: "Cannot add a new question here",
        description:
          "Questions should be at least 2 seconds apart. Please choose a different time for the question",
      },
      delete_item: {
        question: {
          title: "Are you sure you want to delete this?",
          description: "This will permanently delete this question",
        },
      },
      publish: {
        published: {
          title: "Are you sure you want to publish your changes?",
          description:
            "The plio will be permananently changed once you publish the changes",
          confirm: "Yes",
          cancel: "No",
        },
        draft: {
          title: "Are you sure you want to publish the plio?",
          description:
            "Once a plio is published, you will not be able to edit the following: the video, the number of questions, the number of options in each question and the time for each question. You can also preview the plio before publishing it.",
          confirm: "Publish",
          cancel: "Preview",
        },
      },
      publishing: {
        published: {
          title: "Publishing the changes...",
        },
        draft: {
          title: "Publishing the plio...",
        },
      },
      published: {
        buttons: {
          play_plio: "Play",
          embed_plio: "Embed",
          share_plio: "Share",
          home: "Home",
        },
        title: "Hooray! Your Plio is ready 🥳",
      },
      share_plio: {
        title: "Share this Plio",
        buttons: {
          copy_link: {
            not_copied: "Copy Link",
            copied: "Copied!",
          },
        },
      },
      embed_plio: {
        title: "Embed this Plio",
        headings: {
          without_sso: "Without Single Sign-On (SSO)",
          with_sso: "With Single Sign-On (SSO)",
        },
        buttons: {
          copy_link: {
            not_copied: "Copy",
            copied: "Copied!",
          },
        },
        info: {
          embed_data: {
            personal_workspace: {
              1: "In your current plan, you will not receive any data from the embedded plio if your viewers haven't already logged in to Plio. Fill ",
              2: "this",
              3: " form if you want to apply for a team workspace to receive data using Single Sign-On (SSO).",
            },
            org_workspace: {
              1: "By default, you will not receive any data from the embedded plio if your viewers haven't already logged in to Plio. However, you can receive data using Single Sign-On (SSO). Click ",
              2: "here",
              3: " to understand how to use it!",
            },
          },
        },
      },
      image_uploader: {
        title_non_touch: "Drag and drop or click here to upload",
        title_touch: "Click to take a picture or add from gallery",
        buttons: {
          done: "Done",
          delete: "Delete",
        },
        size_info_text: {
          info: "Maximum image size allowed is 10 MB",
          error: "Image size exeeds 10 MB. Please upload a smaller image",
        },
      },
    },
  },
  home: {
    create_button: "Create",
    create_button_empty: "Create a plio",
    all_plios: "All Plios",
    no_plios: "Go ahead and create a plio",
    table: {
      columns: {
        name: "name",
        views: "Views",
      },
      plio_list_item: {
        buttons: {
          play: "Play",
          edit: "Edit",
          duplicate: "Duplicate",
          analyse: "Analyse",
          share: "Share",
          delete: "Delete",
          embed: "Embed",
        },
        dialog: {
          delete: {
            title: "Are you sure you want to delete this plio?",
            description:
              "This will permananently delete this plio and all the data associated with it, including all the responses. Once deleted, the data cannot be recovered.",
          },
        },
        toast: {
          delete: {
            success: "Plio deleted successfully",
            error: "There was an error. Please try again!",
          },
        },
      },
      search: {
        placeholder: "Search",
        no_plios_found: {
          title: {
            1: "Sorry, we couldn't find any plios matching",
            2: "",
          },
          description:
            "Please don't worry. Try double-checking the spelling or even searching by status (draft/published)",
        },
      },
      buttons: {
        analyse: "Analyse Plio",
      },
    },
    paginator: {
      first: "First",
      last: "Last",
      next: "Next",
      previous: "Previous",
      description: {
        to: "to",
        of: " of",
        plios: "plios",
      },
    },
  },
  login: {
    heading: "Convert videos into interactive lessons",
    sub_headings: {
      interactive: {
        title: "Use Any YouTube video",
        description:
          "Convert any passive youtube video into an interactive lesson",
      },
      interactions: {
        title: "Choose From Multiple Interactions",
        description:
          "Choose between interactions like Subjective Questions and MCQs",
      },
      download: {
        title: "No Download Required",
        description:
          "Sharing interactive videos is as simple as sharing a link",
      },
      analytics: {
        title: "Gather Rich Analytics",
        description:
          "Go beyond traditional YouTube metrics to understand your audience better",
      },
    },
    phone: {
      prompt: "Please enter your mobile number",
      validation: {
        valid: "",
        invalid: "Mobile number is invalid",
      },
      input_placeholder: "Enter Mobile Number",
    },
    otp: {
      request: "Request OTP",
      validation: {
        valid: "",
        invalid: "OTP should be 6 digits long",
      },
      submit: "Submit OTP",
      incorrect: "Incorrect OTP entered. Please try again!",
      resend: "Resend OTP",
      resent: "OTP has been sent again",
    },
    or: "OR",
    google: {
      button: "Sign in with Google",
      error: "Something went wrong. Please try again!",
    },
    warning: {
      only_indian_numbers:
        "Only Indian (+91) phone numbers are supported for now",
    },
    opt_in_t_and_c: {
      1: "By logging in, you are choosing to accept our",
      2: "Terms of Service",
      3: "and",
      4: "Privacy Policy",
      5: "",
    },
  },
  player: {
    question: {
      submit: "Submit",
      revise: "Revise",
      proceed: "Proceed",
      skip: "Skip",
      placeholder: "Enter your answer here",
    },
    fullscreen: {
      enter: "Go Fullscreen",
      exit: "Exit Fullscreen",
    },
    scorecard: {
      greeting: "Hooray! Congratulations on completing the plio!",
      metric: {
        description: {
          correct: "Correct",
          wrong: "Wrong",
          skipped: "Skipped",
          accuracy: "Accuracy",
        },
      },
      buttons: {
        watchAgain: "Watch Again",
        share: "Share",
      },
      share: {
        hooray: "Hooray",
        completed_plio: "I completed a Plio",
        result: {
          1: "I answered",
          2: "with",
          3: "on Plio today",
          question: "question",
          questions: "questions",
        },
      },
    },
  },
  error: {
    404: {
      title: "Page Not Found",
      description:
        "We were unable to find what you are looking for. You can try going back to your home.",
    },
    403: {
      title: "Access Denied",
      description:
        "You do not have the permission to access this page. If you are not a part of the organisational workspace, please contact the organisation's admin to get yourself added or you can go back to your home.",
    },
    buttons: {
      home: "Go to Home",
    },
    create_plio: "Could not create Plio. Please try again",
    generic: "Something went wrong. Please try again!",
    internet_lost: "Internet connection lost",
    internet_restored: "Internet connection restored",
    copying: "Error while copying",
    auto_logout: "You have been logged out!",
  },
  success: {
    copying: "Link Copied Successfully",
  },
  generic: {
    status: {
      draft: "Draft",
      published: "Published",
    },
    preview: "Preview",
    yes: "Yes",
    no: "No",
    got_it: "Got it",
    placeholders: {
      empty_title_placeholder: "Untitled",
    },
    mcq: "Multiple Choice",
    subjective: "Subjective",
    checkbox: "Checkbox",
    submitted: "Submitted",
    dialogs: {
      share: {
        message: "Check out my new plio",
      },
    },
  },
  tooltip: {
    url: "Copy link",
    time_input: "You cannot edit the time in a published plio",
    editor: {
      publish: {
        published: {
          enabled: "Click to publish your changes",
          disabled: "No unpublished changes yet",
        },
        draft: {
          enabled: "Click to publish the plio",
          disabled: "Enter a valid video link first",
        },
      },
      status: {
        published: "This plio has been published and is publicly accessible",
        draft:
          "This plio is currently in draft mode and only accessible to you. To make it publicly accessible, publish the plio",
      },
      video_input: {
        published: "You cannot edit the video link in a published plio",
        draft:
          "Paste the link of the YouTube video you want to make interactive",
      },
      add_item: {
        published: "You cannot add new questions in a published plio",
        mcq: "Click here to add a multiple-choice question",
        subjective: "Click here to add a subjective question",
        checkbox: "Click here to add a checkbox question",
      },
      item_editor: {
        buttons: {
          previous: "Move to the previous question",
          next: "Move to the next question",
          add_item: {
            question: {
              disabled:
                "You cannot add a new question once the plio is published",
              enabled: "Add a question",
            },
          },
          add_option: {
            disabled: "You cannot add an option once the plio is published",
            enabled: "Add an option",
          },
          delete_option: {
            disabled: "Cannot delete option once the plio is published",
            enabled: "Delete this option",
          },
        },
        correct_option: {
          marked:
            "This option has been marked as the correct option for this question",
          unmarked: "Mark this option as the correct option for this question",
        },
      },
    },
    home: {
      table: {
        plio_list_item: {
          buttons: {
            share: {
              published: "Share this plio",
              draft: "Cannot share a draft plio",
            },
            play: {
              published: "Play this plio",
              draft: "Cannot play a draft plio",
            },
            edit: "Edit this Plio",
            duplicate: "Duplicate this Plio",
          },
        },
        buttons: {
          analyse_plio: {
            disabled: "This plio is not published yet",
            enabled: "Look at the data for the plio",
          },
        },
      },
    },
  },
  dashboard: {
    updated: "Last published on",
    buttons: {
      edit: "Edit Plio",
      download_report: "Download Report",
    },
    update_message: "This page is updated every hour",
    summary: {
      number_of_viewers: "VIEWERS",
      avg_watch_time: "AVERAGE WATCH TIME",
      completion_rate: {
        title: "COMPLETED",
        tooltip: "Percentage of viewers who answered all the questions",
      },
      one_minute_retention: {
        title: "RETENTION AT 1 MINUTE",
        tooltip: "Percentage of viewers who watched your video beyond 1 minute",
      },
      accuracy: {
        title: "ACCURACY",
        tooltip:
          "Average accuracy for each viewer - accuracy is calculated only for the questions that have been answered by the viewer",
      },
      num_questions_answered: {
        title: "QUESTIONS ANSWERED",
        tooltip: "Average number of questions answered by each viewer",
      },
    },
  },
};
