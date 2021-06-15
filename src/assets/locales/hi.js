export default {
  nav: {
    home: "होम",
    login: "",
    logout: "लॉगआउट",
    editor: "एडिटर",
    dashboard: "डैशबोर्ड",
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
    headings: {
      add_question: "एक नया प्रश्न जोड़ें",
      subjective_question_warning:
        "डैशबोर्ड में सटीकता की गणना करते समय विस्तृत प्रश्न शामिल नहीं होते हैं",
    },
    buttons: {
      home: "होम",
      publish: {
        draft: "प्लायो प्रकाशित करें",
        published: "परिवर्तन प्रकाशित करें",
      },
      add_question: "नया सवाल बनाएं",
      show_video: "वीडियो देखें",
      show_question: "सवाल देखें",
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
        set_character_limit: "चरित्र सीमा निर्धारित करें",
        char_limit: {
          max: "अधिकतम",
          chars_allowed: "वर्ण",
        },
      },
      image_upload: {
        add_image: "चित्र",
        edit_image: "बदलें",
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
      image_uploader: {
        title: "फ़ाइल खींचें और छोड़ें या क्लिक करके अपलोड करें",
        buttons: {
          done: "आगे बढ़ें",
          delete: "हटा दें",
        },
        size_info_text: {
          info: "फाइल का साइज ज़्यादा से ज़्यादा 10 MB हो सकता है",
          error:
            "यह तस्वीर 10 MB से ज़्यादा बड़ी ह। कृपया कोई छोटी तस्वीर अपलोड करें",
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
      3: "शीघ्र अनुमति प्राप्त करने के लिए",
      4: "इस",
      5: "फॉर्म को भरें",
    },
    all_plios: "सारे प्लायो",
    no_plios: "चलिए एक नया प्लायो बनाते हैं",
    table: {
      columns: {
        name: "नाम",
        number_of_viewers: "दर्शको की संख्या",
      },
      plio_list_item: {
        buttons: {
          play: "चलाओ",
          edit: "संपादन",
          duplicate: "नक़ल",
          analyse: "विश्लेषण",
        },
      },
      search: {
        placeholder: "कुछ ढूंढिए",
        no_plios_found: "कोई पलायो नहीं मिला",
      },
      buttons: {
        analyse: "प्लायो का विश्लेषण करें",
      },
    },
    paginator: {
      first: "पहला",
      last: "आखरी",
      next: "अगला",
      previous: "पिछला",
      description: {
        to: "से",
        of: ",",
        plios: "पलायों में से",
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
      input_placeholder: "मोबाइल नंबर डालें",
    },
    otp: {
      request: "OTP भेजो",
      validation: {
        valid: "",
        invalid: "OTP 6 अंको का होना चाहिए",
      },
      submit: "OTP जमा करें",
      incorrect: "OTP गलत दर्ज किया गया है कृपया दोबारा कोशिश करें",
      resend: "OTP दोबारा भेजो",
      resent: "OTP फिर भेजा गया है",
    },
    or: "या फिर",
    google: {
      button: "गूगल से साइन इन करें",
      error: "कुछ दिक्कत आ गयी कृपया दोबारा कोशिश करें",
    },
    warning: {
      only_indian_numbers: "अभी के लिए केवल भारतीय (+91) फ़ोन नंबर समर्थित हैं",
    },
    opt_in_t_and_c: {
      1: "लॉगिन करने का मतलब है की आप हमारी",
      2: "सेवा की शर्तों",
      3: "और",
      4: "गोपनीयता नीति",
      5: "से सहमत हैं",
    },
  },
  player: {
    question: {
      submit: "सबमिट करें",
      revise: "पुनः देखें",
      proceed: "आगे बढ़ें",
      skip: "छोड़ें",
      placeholder: "अपना उत्तर यहां दर्ज करें",
    },
    fullscreen: {
      enter: "पूर्ण स्क्रीन में प्रवेश करें",
      exit: "पूर्ण स्क्रीन से निकास लें ",
    },
  },
  error: {
    404: "वेब पेज मौजुद नहीं हैं ",
    create_plio: "प्लायो बनाते हुए कुछ गड़बड़ हो गयी",
    generic: "कुछ दिक्कत आ गयी कृपया दोबारा कोशिश करें",
    internet: "कृपया अपने इंटरनेट कनेक्शन की जाँच करें",
    copying: "कापी करते वक़्त दिक्कत हुई ",
    auto_logout: "आप लॉग आउट हो चुके हैं!",
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
    placeholders: {
      empty_title_placeholder: "कोई नाम नहीं",
    },
    mcq: "बहुविकल्पी",
    subjective: "विस्तृत",
    submitted: "निवेदन हो गया",
  },
  tooltip: {
    url: "लिंक को कापी करे",
    time_input: "आप किसी प्रकाशित प्लायो में समय संपादित नहीं कर सकते",
    editor: {
      publish: {
        published: {
          enabled: "अपने परिवर्तन प्रकाशित करने के लिए क्लिक करें",
          disabled: "अभी तक कोई अप्रकाशित परिवर्तन नहीं हुआ है",
        },
        draft: {
          enabled: "प्लायो प्रकाशित करने के लिए क्लिक करें",
          disabled: "पहले एक मान्य वीडियो लिंक दर्ज करें",
        },
      },
      status: {
        published:
          "इस प्लायो को प्रकाशित किया जा चूका है और इसे किसी को भी भेजा जा सकता है",
        draft:
          "यह प्लाओ अभी एक प्रारूप है और केवल आप इसे देख सकते हैं। इसे किसी को भी भेजने के लिए इस प्लायो को प्रकाशित करें",
      },
      video_input: {
        published: "आप प्रकाशित प्लायो में वीडियो लिंक को संपादित नहीं कर सकते",
      },
      add_item: {
        published: "आप एक प्रकाशित प्लायो में नए प्रश्न नहीं जोड़ सकते",
        draft: "प्रश्न जोड़ने के लिए यहां क्लिक करें",
      },
      item_editor: {
        buttons: {
          previous: "पिछले प्रश्न पर जाएं",
          next: "अगले सवाल पर जाएं",
          add_item: {
            question: {
              disabled:
                "प्लायो के प्रकाशित होने के बाद आप एक नया प्रश्न नहीं जोड़ सकते",
              enabled: "एक प्रश्न जोड़ें",
            },
          },
          add_option: {
            disabled:
              "प्लायो के प्रकाशित होने के बाद आप एक नया विकल्प नहीं जोड़ सकते",
            enabled: "एक विकल्प जोड़ें",
          },
          delete_option: {
            disabled: "प्लायो प्रकाशित होने के बाद विकल्प नहीं हटा सकते",
            enabled: "इस विकल्प को हटा दें",
          },
        },
        correct_option: {
          marked: "इस विकल्प को इस प्रश्न के लिए सही विकल्प चुना गया है",
          unmarked: "इस प्रश्न के लिए इस विकल्प को सही विकल्प चुने",
        },
      },
    },
    home: {
      table: {
        plio_list_item: {
          buttons: {
            play: {
              published: "इस प्लेओ को देखें",
              draft: "किसी भी प्रारूप प्लेओ को देखा नहीं जा सकता",
            },
            edit: "इस प्लायो को संपादित करें",
            duplicate: "इसके जैसा एक और प्लायो बनाएं",
          },
        },
        buttons: {
          analyse_plio: {
            disabled: "यह प्लायो अभी तक प्रकाशित नहीं है",
            enabled: "प्लायो का डेटा देखें",
          },
        },
      },
    },
  },
  dashboard: {
    updated: "सबसे हाल ही में प्रकाशित हुआ",
    buttons: {
      edit: "प्लायो को संपादित करें",
      download_report: "रिपोर्ट डाउनलोड करें",
    },
    summary: {
      number_of_viewers: "दर्शक",
      avg_watch_time: "देखने का औसत समय",
      completion_rate: {
        title: "समापन दर",
        tooltip: "सभी सवालों के जवाब देने वाले दर्शकों का प्रतिशत",
      },
      one_minute_retention: {
        title: "अवधारण 1 मिनट पर",
        tooltip:
          "आपके वीडियो को कम से कम 1 मिनट तक देखने वाले दर्शकों का प्रतिशत",
      },
      accuracy: {
        title: "यथार्थता",
        tooltip:
          "प्रत्येक दर्शक के लिए औसत सटीकता - सटीकता की गणना केवल उन प्रश्नों के लिए की जाती है जिनका उत्तर दर्शक ने दिया है",
      },
      num_questions_answered: {
        title: "उत्तर किये गए प्रश्न",
        tooltip: "प्रत्येक दर्शक द्वारा उत्तर दिए गए प्रश्नों की औसत संख्या",
      },
    },
  },
};
