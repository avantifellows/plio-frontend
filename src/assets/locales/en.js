export default {
  nav: {
    home: "Home",
    login: "",
    logout: "Logout",
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
      info:
        "To get started, you need to paste the link of the YouTube video that you want to make interactive",
    },
    plio_title: {
      placeholder: "Enter the name of the Plio",
      title: "Name of the Plio",
    },
    headings: {
      add_question: "Add a new question",
      subjective_question_warning:
        "Subjective Questions are not included while calculating the accuracy in the dashboard",
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
      analyze_plio: "Analyze",
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
      cannot_delete_option: {
        title: "Cannot delete the option",
        description: "A question must have at least 2 options",
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
        },
        draft: {
          title: "Are you sure you want to publish the plio?",
          description:
            "Once a plio is published, you will not be able to edit the following: the video, the number of questions, the number of options in each question and the time for each question",
        },
      },
      publishing: {
        published: {
          title: "Publishing the changes..",
        },
        draft: {
          title: "Publishing the plio...",
        },
      },
      published: {
        buttons: {
          play_plio: "Play",
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
    waitlist: {
      1: "You have been added to the waitlist",
      2: "You will hear from us soon",
      3: "Please fill",
      4: "this",
      5: "form to get access quicker",
    },
    all_plios: "All Plios",
    no_plios: "Go ahead and create a plio",
    table: {
      columns: {
        name: "name",
        number_of_viewers: "Number of Viewers",
      },
      plio_list_item: {
        buttons: {
          play: "Play",
          edit: "Edit",
          duplicate: "Duplicate",
          analyse: "Analyse",
          share: "Share",
          delete: "Delete",
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
        no_plios_found: "No Plios Found",
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
    heading: "Make Videos Interactive",
    sub_headings: {
      interactive: {
        title: "Interactive YouTube videos",
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
        title: "Rich Analytics",
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
  },
  error: {
    404: "Page Not Found",
    create_plio: "Could not create Plio. Please try again",
    generic: "Something went wrong. Please try again!",
    internet: "Please check your internet connection",
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
    yes: "Yes",
    no: "No",
    got_it: "Got it",
    placeholders: {
      empty_title_placeholder: "Untitled",
    },
    mcq: "Multiple Choice",
    subjective: "Subjective",
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
