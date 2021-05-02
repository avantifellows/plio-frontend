"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true,
});
exports["default"] = void 0;
var _default = {
  nav: {
    home: "होम",
    login: "",
    logout: "लॉगआउट",
    editor: "एडिटर",
    abtesting: "",
    player: "",
    404: "एरर",
  },
  editor: {
    video_input: {
      placeholder: "यूट्यूब वीडियो का लिंक यहाँ लिखें",
      title: "यूट्यूब वीडियो का लिंक",
      validation: {
        valid: "",
        invalid: "गलत लिंक",
      },
    },
    plio_title: {
      placeholder: "प्लायो का नाम यहाँ लिखें ",
      title: "प्लायो का नाम",
    },
    buttons: {
      home: "होम",
      publish: {
        draft: "प्लायो प्रकाशित करो",
        published: "प्रकाशित करो",
      },
      add_question: "नया सवाल बनाएं",
    },
    updated: "अपडेटेड ऐट",
    item_editor: {
      question_input: {
        title: "सवाल",
        placeholder: "अपना सवाल यहाँ दर्ज करें",
      },
      time_input: {
        title: "सवाल के प्रकट होने का समय",
      },
      option_input: {
        title: "विकल्प",
        placeholder: "विकल्प यहाँ दर्ज करें",
      },
      buttons: {
        add_option: "नया विकल्प जोड़ें",
      },
      dropdown: {
        question: "सवाल",
      },
      heading: {
        question: "प्रश्न संपादित करें",
      },
    },
    dialog: {
      delete_option: {
        title: "क्या आप वाकई इस विकल्प को हटाना चाहते हैं?",
      },
      cannot_delete_option: {
        title: "विकल्प को हटा नहीं सकता",
        description: "एक प्रश्न में कम से कम 2 विकल्प होने चाहिए",
      },
      cannot_add_question: {
        title: "यहां एक नया प्रश्न नहीं जोड़ा जा सकता",
        description:
          "प्रश्न कम से कम 2 सेकंड अलग होने चाहिए। कृपया प्रश्न के लिए एक अलग समय चुनें",
      },
      delete_item: {
        question: {
          title: "क्या आप वाकई इसे हटाना चाहते हैं?",
          description: "यह इस प्रश्न को स्थायी रूप से हटा देगा",
        },
      },
      publish: {
        published: {
          title: "क्या आप वाकई अपने परिवर्तनो को प्रकाशित करना चाहते हैं?",
          description:
            "जब आप परिवर्तन प्रकाशित कर देंगे, तब प्लायो को स्थायी रूप से बदल दिया जाएगा",
        },
        draft: {
          title: "क्या आप वाकई इस प्लायो को प्रकाशित करना चाहते हैं?",
          description:
            "एक बार एक प्लायो प्रकाशित होने के बाद, आप निम्नलिखित को संपादित नहीं कर पाएंगे: वीडियो, प्रश्नों की संख्या, प्रत्येक प्रश्न में विकल्पों की संख्या और प्रत्येक प्रश्न के प्रकट होने का समय",
        },
      },
      publishing: {
        published: {
          title: "परिवर्तनों को प्रकाशित किया जा रहा है..",
        },
        draft: {
          title: "प्लायो को प्रकाशित किया जा रहा है...",
        },
      },
    },
  },
  home: {
    create_button: "प्लायो बनाओ",
    create_button_empty: "नया प्लायो बनाए",
    waitlist: {
      1: "आपको प्रतीक्षा सूची में डाल दिया गया है",
      2: "हम जल्द ही आपको संपर्क करेंगे",
    },
    all_plios: "सारे प्लायो",
    no_plios: "चलिए एक नया प्लायो बनाते हैं",
    table: {
      columns: {
        name: "नाम",
        number_of_learners: "दर्शको की संख्या",
      },
      component: {
        buttons: {
          play: "चलाओ",
          edit: "संपादन",
          duplicate: "नक़ल",
        },
      },
    },
  },
  login: {
    phone: {
      prompt: "कृपया अपना मोबाइल नंबर डालें",
      validation: {
        valid: "",
        invalid: "फ़ोन नंबर अमान्य है",
      },
    },
    otp: {
      request: "OTP भेजो",
      validation: {
        valid: "",
        invalid: "OTP 6 अंको का होना चाहिए",
      },
      submit: "OTP जमा करो",
      incorrect: "OTP गलत दर्ज किया गया है कृपया दोबारा कोशिश करें",
      resend: "OTP दोबारा भेजो",
      resent: "OTP फिर भेजा गया है",
    },
    or: "या फिर",
    google: {
      button: "गूगल से साइन इन करें",
      error: "कुछ दिक्कत आ गयी कृपया दोबारा कोशिश करें",
    },
  },
  player: {
    question: {
      submit: "सबमिट करें",
      revise: "पुनः देखें",
      proceed: "आगे बढ़ें",
    },
    fullscreen: {
      enter: "पूर्ण स्क्रीन में प्रवेश",
      exit: "पूर्ण स्क्रीन से निकास",
    },
  },
  error: {
    404: "वेब पेज मौजुद नहीं हैं ",
    create_plio: "प्लायो बनाते हुए कुछ गड़बड़ हो गयी",
    generic: "कुछ दिक्कत आ गयी कृपया दोबारा कोशिश करें",
    internet: "कृपया अपने इंटरनेट कनेक्शन की जाँच करें",
    copying: "कापी करते वक़्त दिक्कत हुई ",
  },
  success: {
    copying: "लिंक सफलतापूर्वक कॉपी किया गया",
  },
  generic: {
    status: {
      draft: "प्रारूप",
      published: "प्रकाशित",
    },
    yes: "हाँ",
    no: "नहीं",
    got_it: "समझ आ गया",
  },
  tooltip: {
    url: "लिंक को कापी करे",
    editor: {
      published: "",
      status: "",
      video_input: {
        published: "आप प्रकाशित प्लायो में वीडियो लिंक को संपादित नहीं कर सकते",
      },
      add_item: {
        published:
          "प्रकाशित प्लायो में नए प्रश्नों को जोड़ने की अनुमति नहीं है",
        draft: "प्रश्न जोड़ने के लिए यहां क्लिक करें",
      },
    },
  },
};
exports["default"] = _default;
