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
      placeholder: "Enter link to the YouTube video",
      title: "YouTube video link",
      validation: {
        valid: "",
        invalid: "Invalid Link",
      },
    },
    plio_title: {
      placeholder: "Enter the name of the Plio",
      title: "Plio Title",
    },
    buttons: {
      home: "Home",
      publish: {
        draft: "Publish Plio",
        published: "Publish Changes",
      },
      add_question: "Add a question",
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
    },
  },
  home: {
    create_button: "Create",
    create_button_empty: "Create a plio",
    waitlist: {
      1: "You have been added to the waitlist",
      2: "You will hear from us soon",
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
        },
      },
      search: {
        placeholder: "Search",
      },
      buttons: {
        analyse: "Analyse Plio",
      },
    },
  },
  login: {
    phone: {
      prompt: "Please enter your mobile number",
      validation: {
        valid: "",
        invalid: "Mobile number is invalid",
      },
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
  },
  player: {
    question: {
      submit: "Submit",
      revise: "Revise",
      proceed: "Proceed",
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
    copying: "URL Copied Successfully",
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
          disabled: "Enter a valid video URL first",
        },
      },
      status: {
        published: "This plio has been published and is publicly accessible",
        draft:
          "This plio is currently in draft mode and only accessible to you. To make it publicly accessible, publish the plio",
      },
      video_input: {
        published: "You cannot edit the video URL in a published plio",
      },
      add_item: {
        published: "You cannot add new questions in a published plio",
        draft: "Click here to add a question",
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
      download_csv: "Download CSV",
    },
  },
};
