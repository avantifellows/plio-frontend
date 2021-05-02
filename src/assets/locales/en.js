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
  },
  generic: {
    status: {
      draft: "Draft",
      published: "Published",
    },
  },
};
