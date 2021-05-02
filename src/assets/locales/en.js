export default {
  nav: {
    home: "Home",
    login: "",
    logout: "Logout",
    editor: "Editor",
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
        number_of_learners: "Number of Viewers",
      },
      component: {
        buttons: {
          play: "Play",
          edit: "Edit",
          duplicate: "Duplicate",
        },
      },
    },
  },
  login: {
    phone: {
      prompt: "Please enter your mobile number",
      validation: {
        valid: "",
        invalid: "Phone number is invalid",
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
    create_plio: "Error creating Plio",
    generic: "Something went wrong. Please try again!",
    internet: "Please check your internet connection",
    copying: "Error while copying",
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
  },
};
