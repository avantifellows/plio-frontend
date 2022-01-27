export default {
  nav: {
    home: "होम",
    login: "",
    logout: "लॉगआउट",
    whats_new: "नया क्या है",
    product_guides: "उत्पाद गाइड",
    docs: "दस्तावेज़ीकरण",
    editor: "एडिटर",
    dashboard: "डैशबोर्ड",
    teams: "टीमों के लिए प्लायो",
    abtesting: "",
    player: "",
    settings: "सेटिंग्स",
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
      info: {
        1: "आरंभ करने के लिए, आपको उस यूट्यूब वीडियो का लिंक पेस्ट करना होगा जिसे आप इंटरैक्टिव पाठ बनाना चाहते हैं । यदि आपके पास लिंक नहीं है, तो आप वीडियो को ",
        2: "यूट्यूब पर अपलोड कर सकते हैं",
        3: " और लिंक प्राप्त कर सकते हैं",
      },
    },
    plio_title: {
      placeholder: "प्लायो का नाम यहाँ लिखें",
      title: "प्लायो का नाम",
    },
    headings: {
      add_question: "एक नया प्रश्न जोड़ें",
      subjective_question_warning:
        "सब्जेक्टिव प्रश्नों के सभी उत्तर सही माने जा रहे हैं",
    },
    buttons: {
      home: "होम",
      publish: {
        draft: "प्लायो प्रकाशित करें",
        published: "प्रकाशन",
      },
      add_question: "नया सवाल बनाएं",
      show_video: "वीडियो देखें",
      show_question: "सवाल देखें",
      share_plio: "बाटें",
      play_plio: "चलाएं",
      preview_plio: "प्राभ्यास",
      embed_plio: "एम्बेड",
      analyze_plio: "विश्लेषण",
      share_draft: "कॉपी ड्राफ्ट लिंक",
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
        add_option: "विकल्प जोड़ें",
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
          confirm: "हाँ",
          cancel: "नहीं",
        },
        draft: {
          title: "क्या आप वाकई इस प्लायो को प्रकाशित करना चाहते हैं?",
          description:
            "एक बार एक प्लायो प्रकाशित होने के बाद, आप निम्नलिखित को संपादित नहीं कर पाएंगे: वीडियो, प्रश्नों की संख्या, प्रत्येक प्रश्न में विकल्पों की संख्या और प्रत्येक प्रश्न के प्रकट होने का समय। आप प्लायो को प्रकाशित करने से पहले उसका प्राभ्यास भी कर सकते हैं।",
          confirm: "प्रकाशित करें",
          cancel: "प्राभ्यास",
        },
      },
      published: {
        buttons: {
          play_plio: "चलाएं",
          embed_plio: "एम्बेड",
          share_plio: "बाटें",
          home: "होम",
        },
        title: "बधाईआं! आपका प्लायो तैयार है 🥳",
      },
      share_plio: {
        title: "इस प्लायो को बाटिये",
        buttons: {
          copy_link: {
            not_copied: "लिंक कॉपी करें",
            copied: "लिंक कॉपी हो गया",
          },
        },
      },
      embed_plio: {
        title: "इस प्लायो को एम्बेड करें",
        headings: {
          without_sso: "सिंगल साइन-ऑन (SSO) के बिना",
          with_sso: "सिंगल साइन-ऑन (SSO) के साथ",
        },
        buttons: {
          copy_link: {
            not_copied: "कॉपी",
            copied: "कॉपी हो गया",
          },
        },
        info: {
          embed_data: {
            personal_workspace: {
              1: "यदि आपके दर्शकों ने पहले से ही प्लायो में लॉग इन नहीं किया है, तो आपके वर्तमान प्लान में, आपको एम्बेडेड प्लायो से कोई डेटा प्राप्त नहीं होगा। यदि आप सिंगल साइन-ऑन (SSO) का उपयोग करके डेटा प्राप्त करना चाहते हैं, तो ",
              2: "यह",
              3: " फ़ॉर्म भरें ।",
            },
            org_workspace: {
              1: "आम तौर पर, यदि आपके दर्शकों ने पहले से ही प्लायो में लॉग इन नहीं किया है, तो आपको एम्बेडेड प्लायो से कोई डेटा प्राप्त नहीं होगा। हालाँकि, आप सिंगल साइन-ऑन (SSO) का उपयोग करके डेटा प्राप्त कर सकते हैं। इसका उपयोग कैसे  करना है, यह समझने के लिए ",
              2: "यहाँ",
              3: "क्लिक करें ।",
            },
          },
        },
      },
      image_uploader: {
        title_non_touch: "तस्वीर खींचें और छोड़ें या क्लिक करके अपलोड करें",
        title_touch: "तस्वीर लेने या गैलरी से डालने के लिए क्लिक करें",
        buttons: {
          done: "आगे बढ़ें",
          delete: "हटा दें",
        },
        size_info_text: {
          info: "तस्वीर के आकार की अधिकतम अनुमति 10 MB है",
          error:
            "यह तस्वीर 10 MB से ज़्यादा बड़ी ह। कृपया कोई छोटी तस्वीर अपलोड करें",
        },
      },
    },
  },
  home: {
    create_button: "प्लायो बनाओ",
    create_button_empty: "नया प्लायो बनाए",
    all_plios: "सारे प्लायो",
    no_plios: "चलिए एक नया प्लायो बनाते हैं",
    table: {
      columns: {
        name: "नाम",
        views: "व्यूज",
      },
      plio_list_item: {
        buttons: {
          play: "चलाओ",
          edit: "संपादन",
          duplicate: "नक़ल",
          analyse: "विश्लेषण",
          share: "बाटें",
          delete: "हटाएं",
          embed: "एम्बेड",
          copy: "कॉपी करें",
        },
        dialog: {
          delete: {
            title: "क्या आप वाकई इस प्लायो को हटाना चाहते हैं?",
            description:
              "यह सभी प्रतिक्रियाओं सहित इस प्लायो और इससे जुड़े सभी डेटा को स्थायी रूप से हटा देगा। एक बार हटाए जाने के बाद, डेटा को वसूल नहीं किया जा सकता है।",
          },
        },
        selectors: {
          copy_to_workspace: {
            title: "एक कार्यक्षेत्र चुनें",
            info:
              "इस प्लियो का एक कॉपी चुने गए कार्यक्षेत्र में ड्राफ्ट के रूप में बना दिया जाएगा",
          },
        },
      },
      search: {
        placeholder: "कुछ ढूंढिए",
        no_plios_found: {
          title: {
            1: "क्षमा करें, हमें ",
            2: " से मेल खाने वाला कोई प्लायो नहीं मिला",
          },
          description:
            "कृपया चिंता न करें। वर्तनी की दोबारा जाँच करने का प्रयास करें या यहां तक ​​कि प्रकाशण ​​कि स्थिति के आधार पर खोज करें (draft/published)",
        },
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
    heading: "वीडियों को इंटरैक्टिव पाठों में बदलें",
    sub_headings: {
      interactive: {
        title: "किसी भी यूट्यूब वीडियो का उपयोग करें",
        description:
          "किसी भी निष्क्रिय यूट्यूब वीडियो को एक इंटरैक्टिव पाठ में बदलें",
      },
      interactions: {
        title: "एकाधिक इंटरैक्शन में से चुनें",
        description:
          "सब्जेक्टिव प्रश्न और बहुवैकल्पिक प्रश्न जैसे इंटरैक्शन के बीच चयन करें",
      },
      download: {
        title: "कोई डाउनलोड आवश्यक नहीं",
        description:
          "इंटरेक्टिव वीडियो साझा करना एक लिंक साझा करने जितना आसान है",
      },
      analytics: {
        title: "समृद्ध विश्लेषण इकट्ठा करें",
        description:
          "अपने दर्शकों को बेहतर ढंग से समझने के लिए पारंपरिक यूट्यूब मीट्रिक से आगे बढ़ें",
      },
    },
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
      resend: "OTP दोबारा भेजो",
      resent: "OTP फिर भेजा गया है",
    },
    or: "या फिर",
    google: {
      button: "गूगल से साइन इन करें",
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
      exit: "पूर्ण स्क्रीन से निकास लें",
    },
    scorecard: {
      greeting: "प्लायो पूरा करने के लिए आपको बधाई!",
      metric: {
        description: {
          correct: "सही",
          wrong: "गलत",
          skipped: "छोड़े",
          accuracy: "सटीकता",
        },
      },
      buttons: {
        watchAgain: "फिरसे देखें",
        share: "बाटें",
      },
      share: {
        hooray: "हुर्रे",
        completed_plio: "मैंने अपना प्लायों पूरा कर लिया",
        result: {
          1: "मैंने आज के प्लायों पर",
          2: "के साथ",
          3: "का उत्तर दिया",
          question: "प्रश्न",
          questions: "प्रश्नों",
        },
      },
    },
  },
  error: {
    404: {
      title: "वेब पेज मौजुद नहीं हैं",
      description:
        "आप जहाँ जाना चाह रहे हैं, हम उस पेज को नहीं ढूंढ पाए। आप अपने होम पर वापस जाने की कोशिश कर सकते हैं।",
    },
    403: {
      title: "पहुंच अस्वीकृत",
      description:
        "आपको इस पेज तक पहुंचने की अनुमति नहीं है। कृपया जांच लें कि आपने सही खाते में लॉग इन किया है। यदि आप संगठनात्मक कार्यक्षेत्र का हिस्सा नहीं हैं, तो कृपया स्वयं को जोड़ने के लिए संगठन के व्यवस्थापक से संपर्क करें या आप अपने होम पर वापस जा सकते हैं।",
    },
    buttons: {
      home: "होम पर जाएं",
    },
    generic: "कुछ दिक्कत आ गयी कृपया दोबारा कोशिश करें",
    auto_logout: "आप लॉग आउट हो चुके हैं!",
  },
  generic: {
    status: {
      draft: "प्रारूप",
      published: "प्रकाशित",
    },
    preview: "पूर्व दर्शन",
    yes: "हाँ",
    no: "नहीं",
    got_it: "समझ आ गया",
    placeholders: {
      empty_title_placeholder: "कोई नाम नहीं",
    },
    mcq: "बहुविकल्पी",
    subjective: "सब्जेक्टिव",
    checkbox: "चेकबॉक्स",
    submitted: "निवेदन हो गया",
    dialogs: {
      share: {
        message: "मेरा नया प्लियो देखें",
      },
    },
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
          enabled: "प्लायो को अपने दर्शकों के साथ बाटनें के लिए प्रकाशित करें",
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
        draft:
          "उस यूट्यूब वीडियो का लिंक डालें जिसे आप इंटरैक्टिव पाठ बनाना चाहते हैं",
      },
      add_item: {
        published: "आप एक प्रकाशित प्लायो में नए प्रश्न नहीं जोड़ सकते",
        mcq:
          "केवल एक सही उत्तर वाला बहुविकल्पीय प्रश्न जोड़ने के लिए यहां क्लिक करें",
        subjective: "सब्जेक्टिव प्रश्न जोड़ने के लिए यहां क्लिक करें",
        checkbox:
          "एकाधिक सही उत्तरों वाला बहुविकल्पीय प्रश्न जोड़ने के लिए यहां क्लिक करें",
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
          delete_item: {
            question: {
              disabled:
                "प्लायो के प्रकाशित होने के बाद आप प्रश्न नहीं हटा सकते",
              enabled: "इस प्रश्न को हटा दें",
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
          add_image: {
            disabled:
              "प्लायो के प्रकाशित होने के बाद आप सवाल में चित्र नहीं दाल सकते",
            enabled: "सवाल में चित्र डालने के लिए क्लिक करें",
          },
          update_image: {
            disabled:
              "प्लायो के प्रकाशित होने के बाद चित्र को हटाना या बदलना मना है",
            enabled: "सवाल के चित्र को हटाने या बदलने के लिए क्लिक करें",
          },
          question_type_picker: {
            disabled:
              "प्लायो के प्रकाशित होने के बाद आप किसी सवाल का प्रकार नहीं बदल सकते",
            enabled: "सवाल का प्रकार बदलने के लिए क्लिक करें",
          },
        },
        correct_option: {
          checkbox: {
            marked: "इस विकल्प को इस प्रश्न के सही विकल्पों में चुना गया है",
            unmarked: "इस विकल्प को इस प्रश्न के सही विकल्पों में चुने",
          },
          mcq: {
            marked: "इस विकल्प को इस प्रश्न के लिए सही विकल्प चुना गया है",
            unmarked: "इस विकल्प को इस प्रश्न के लिए सही विकल्प चुने",
          },
        },
      },
      home: "होम पेज पर जाएँ",
      preview:
        "प्लायो का पूर्व दर्शन करें और देखें की यह आपके दर्शकों को कैसा दिखेगा",
      copy_draft_link:
        "अपनी टीम के साथ इस प्रारूप प्लायो का बाटने के लिए ये लिंक कॉपी करें",
      analyze: "इस प्लायो का विश्लेषण करने के लिए क्लिक करें",
      share_plio: "इस प्लायो को अपने दर्शकों के साथ बातें",
      play_plio: "इस प्लायो को खुद से आज़माएं",
      embed_plio: "इस प्लायो को एम्बेड करें",
      settings: "इस प्लायो के लिए सेटिंग्स",
    },
    home: {
      table: {
        plio_list_item: {
          buttons: {
            play: {
              published: "इस प्लेओ को देखें",
              draft: "किसी भी प्रारूप प्लेओ को देखा नहीं जा सकता",
            },
            share: {
              published: "इस प्लायो को बाटिये",
              draft: "किसी भी प्रारूप प्लेओ को बाटाँ नहीं जा सकता",
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
        header: {
          views: "दृश्यों की संख्या के आधार पर छाँटने के लिए क्लिक करें",
        },
      },
    },
    dashboard: {
      buttons: {
        download_report: "इस प्लायो की विस्तृत रिपोर्ट डाउनलोड करें",
      },
      summary: {
        completion_rate: "सभी सवालों के जवाब देने वाले दर्शकों का प्रतिशत",
        one_minute_retention:
          "आपके वीडियो को कम से कम 1 मिनट तक देखने वाले दर्शकों का प्रतिशत",
        accuracy:
          "प्रत्येक दर्शक के लिए औसत सटीकता - सटीकता की गणना केवल उन प्रश्नों के लिए की जाती है जिनका उत्तर दिया गया है",
        num_questions_answered:
          "प्रत्येक दर्शक द्वारा उत्तर दिए गए प्रश्नों की औसत संख्या",
      },
    },
    settings: {
      buttons: {
        save: {
          hasUnsavedChanges: "अपने परिवर्तन सहेजें",
          noUnsavedChanges: "सहेजने के लिए कुछ नहीं हैं",
        },
        cancel: "",
      },
    },
  },
  dashboard: {
    updated: "सबसे हाल ही में प्रकाशित हुआ",
    buttons: {
      edit: "प्लायो संपादित करें",
      play: "प्लायो चलाएं",
      download_report: "रिपोर्ट डाउनलोड करें",
    },
    summary: {
      number_of_viewers: "दर्शक",
      avg_watch_time: "देखने का औसत समय",
      completion_rate: {
        title: "समापन दर",
      },
      one_minute_retention: {
        title: "अवधारण 1 मिनट पर",
      },
      accuracy: {
        title: "यथार्थता",
      },
      num_questions_answered: {
        title: "उत्तर किये गए प्रश्न",
      },
    },
  },
  settings: {
    buttons: {
      save: "सेव करें",
      saveAndPublish: "सेव करके प्रकाशित करें",
      cancel: "रद्द करें",
    },
    menu: {
      title: {
        skipEnabled:
          "प्लायो का प्रयास करते समय दर्शक प्रश्नों को छोड़ सकते हैं",
        darkMode: "dark mode", // temporary. Will remove after review+testing
      },
      subTitle: {
        skipEnabled: "दर्शकों को प्रश्न छोड़ने का विकल्प प्रदान करें",
        darkMode: "dark mode", // temporary. Will remove after review+testing
      },
      info:
        "नई सेटिंग्स केवल भविष्य में बनाए जाने वाले प्लायो पर लागू होंगी, न कि पहले से बनाए गए प्लायो पर",
    },
    sidebar: {
      header: {
        player: "प्लेयर",
        app: "app", // temporary. Will remove after review+testing
      },
      tab: {
        configuration: "विन्यास",
        appearance: "appearance", // temporary. Will remove after review+testing
      },
    },
    badge: {
      admin: "व्यवस्थापक",
    },
  },
  toast: {
    login: {
      otp: {
        incorrect: "OTP गलत दर्ज किया गया है कृपया दोबारा कोशिश करें",
      },
      google: {
        error: "कुछ दिक्कत आ गयी कृपया दोबारा कोशिश करें",
      },
    },
    error: {
      create_plio: "प्लायो बनाते हुए कुछ गड़बड़ हो गयी",
      copying: "कापी करते वक़्त दिक्कत हुई",
      internet_lost: "इंटरनेट कनेक्शन टूट गया है",
    },
    success: {
      copying: "लिंक सफलतापूर्वक कॉपी किया गया",
      internet_restored: "इंटरनेट कनेक्शन वापस आ गया है",
    },
    editor: {
      item_editor: {
        correct_answer: {
          unmark_last_selected_option_warning:
            "सही उत्तर के रूप में कम से कम एक विकल्प चुना जाना चाहिए",
        },
      },
    },
    home: {
      table: {
        plio_list_item: {
          delete: {
            success: "प्लायो सफलतापूर्वक हटा दिया गया",
            error: "कुछ ग़लती हुई। कृपया दुबारा कोशिश करें!",
          },
        },
      },
    },
  },
};
