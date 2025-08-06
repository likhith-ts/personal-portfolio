// import { Logo } from "@/once-ui/components";
// import { Certificate } from "crypto";
// import { link } from "fs";

const person = {
  firstName: "Likhith",
  lastName: "Usurupati",
  get name() {
    return `${this.firstName} ${this.lastName}`;
  },
  role: "AI Engineer | Full Stack Developer",
  avatar: "/images/avatar.jpg",
  email: "likhith.usurpati28@gmail.com",
  location: "India/Bangalore",
  timezone: "Asia/Kolkata", // Expecting the IANA time zone identifier, e.g., 'Europe/Vienna'
  languages: ["English", "Hindi", "Telugu"], // optional: Leave the array empty if you don't want to display languages
};

const newsletter = {
  display: true,
  title: <>Subscribe to {person.firstName}&apos;s Newsletter</>,
  description: (
    <>
      I occasionally write about design, technology, and share thoughts on the intersection of
      creativity and engineering.
    </>
  ),
};

const social = [
  // Links are automatically displayed.
  // Import new icons in /once-ui/icons.ts
  {
    name: "GitHub",
    icon: "github",
    link: "https://github.com/likhith-ts",
  },
  {
    name: "LinkedIn",
    icon: "linkedin",
    link: "https://www.linkedin.com/in/likhith-usurupati28",
  },
  {
    name: "Hugging Face",
    icon: "huggingFace",
    link: "https://huggingface.co/likhith-u28",
  },
  {
    name: "LeetCode",
    icon: "leetcode",
    link: "https://leetcode.com/u/likhith_usurupati/",
  },
  {
    name: "Email",
    icon: "email",
    link: `mailto:${person.email}`,
  },
];

const home = {
  path: "/",
  image: "/images/og/home.jpg",
  label: "Home",
  title: `${person.name}'s Portfolio`,
  description: `Portfolio website showcasing my work as a ${person.role}`,
  headline: <>Building Scalable AI-Powered Applications Across the Stack</>,
  mobileHeadline: <>Building Scalable AI-Powered Applications Across the Stack</>,
  featured: {
    display: true,
    title: <>Recent project: <strong className="ml-4">Credit Card</strong></>,
    href: "work/credit-card",
  },
  subline: {
    desktop: {
      content: (
        <>
          Hey! I&apos;m Likhith, an independent AI engineer building end-to-end ML pipelines, GenAI systems,
          and agentic architectures — blending scalable RAG, cross-platform web development, and full-stack intelligence for next-gen applications.
          {/* <Logo icon={false} style={{ display: "inline-flex", top: "0.25em", marginLeft: "-0.25em" }}/> */}
        </>
      ),
    },
    mobile: {
      content: (
        <>
          Hey, I&apos;m Likhith Usurupati<br /> AI Engineer | Developer
        </>
      ),
    },
  },
};

const about = {
  path: "/about",
  label: "About",
  title: `About – ${person.name}`,
  description: `Meet ${person.name}, ${person.role} from ${person.location}`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  avatar: {
    display: true,
  },
  calendar: {
    display: true,
    link: "https://cal.com/likhith-usurupati-28",
  }, resume: {
    display: true,
    link: "/api/resume",
  },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        Likhith is a versatile, Indian-origin entry-level AI/ML engineer and full-stack developer
        driven by a passion for mastering cutting-edge technology.
        His work bridges AI/ML, Web development, and cross-platform full-stack solutions with a relentless curiosity.
        He thrives on building practical, scalable systems from the cloud to the edge.
      </>
    ),
  },
  work: {
    display: true, // set to false to hide this section
    title: "Work Experience",
    experiences: [
      {
        company: "AIcan Automate Pvt. Ltd.",
        timeframe: "2022 - 2023",
        role: "Machine Learning Intern",
        achievements: [
          <>Developed supervised learning model for chocolate ratings prediction using Kaggle dataset.</>,
          <>Performed EDA to identify trends and optimize data for model performance.</>,
          <>Implemented ANN & Logistic regression achieving 97.5% accuracy.</>,
        ],
        images: [
          // optional: leave the array empty if you don't want to display images
          {
            src: "https://media.licdn.com/dms/image/v2/C4D0BAQF_7Io9xhvorw/company-logo_200_200/company-logo_200_200/0/1672586158209/ai_can_co_in_logo?e=2147483647&v=beta&t=9bNh1qpSXxiNZ-ypQDAiNrRGOpFEG7acKALfQcRfgRY",
            alt: "Once UI Project",
            width: 16,
            height: 9,
          },
          {
            src: "/images/certificates/AIcan.png",
            alt: "Once UI Project",
            width: 16,
            height: 9,
          },
        ],
      },
    ],
  },
  studies: {
    display: true, // set to false to hide this section
    title: "Education",
    institutions: [
      {
        title: "BTech Computer Science and Engineering",
        description: <>Specialization in Big Data Analytics.</>,
        institute: "SRM University",
        // description: <>B.Tech CSE with spl. in Big Data Analytics. </>,
        timeframe: "2020 - 2024",
        score: "CGPA: 9.17",
      },
      {
        title: "Class XII",
        institute: "Sunbeam CBSE School",
        description: <>CBSE | Physics, Chemistry, Mathematics, Computer Science.</>,
        timeframe: "2020",
        score: "Score: 88.2%",
      },
      {
        title: "Class X",
        institute: "R.K Model School",
        description: <>Board of Secondary Education, Andhra Pradesh (BSEAP).</>,
        timeframe: "2018",
        score: "GPA: 9.3",
      },
    ],
  },
  technical: {
    display: true, // set to false to hide this section
    title: "Technical skills",
    skills: [
      {
        title: "Programming:",
        description: <>
          <ul>
            <br />
            <li>Proficient in <b>Python</b> development with expertise in data science libraries & web frameworks(flask).</li>
            <li>Expert in <b>Rust</b> & <b>C++</b> development with a focus on high-performance applications.</li>
            <li>Other expertise: <b>JavaScript</b>, <b>TypeScript</b>, <b>SQL</b></li>
          </ul>
        </>,
        // optional: leave the array empty if you don't want to display images
        images: [
          // {
          //   src: "/images/projects/project-01/cover-02.jpg",
          //   alt: "Project image",
          //   width: 16,
          //   height: 9,
          // },
        ],
      },
      {
        title: "Full Stack Development:",
        description: <>Proficient in building next gen web & cross platform apps with <b>React</b>, <b>Next.js</b>, <b>MERN</b> and <b>Flutter</b>.</>,
        // optional: leave the array empty if you don't want to display images
        images: [
          // {
          //   src: "/images/projects/project-01/cover-04.jpg",
          //   alt: "Project image",
          //   width: 16,
          //   height: 9,
          // },
        ],
      },
      {
        title: " Machine Learning:",
        description: <>Master in building state-of-art ML projects with <b>Scikit-learn</b>, <b>Pytorch</b> and <b>Tensorflow</b>.</>,
        images: [

        ],
      },
      {
        title: "Artificial Intelligence",
        description: <>Expert in Integrating & Fine-tuning AI models, LLMs with <b>Hugging Face</b> & <b>Langchain</b>.</>,
        images: [

        ],
      },
      {
        title: "Cloud/DevOps",
        description: <>Experience with <b>Google Cloud Platform</b> and <b>Colab</b>, basic knowledge of <b>AWS</b>, proficient in version control with <b>Git</b>, and familiar with containerization using <b>Docker</b>.</>,
        images: [

        ],
      },
    ],
  },
};

const blog = {
  path: "/blog",
  label: "Blog",
  title: "Writing about AI, ML and Full Stack Development...",
  description: `Read about ${person.name}'s thoughts and experiences in AI and software engineering`,
  // Create new blog posts by adding a new .mdx file to app/blog/posts
  // All posts will be listed on the /blog route
};

const work = {
  path: "/work",
  label: "Works",
  title: `Projects – ${person.name}`,
  description: `Projects and Research work by ${person.name}`,
  // Create new project pages by adding a new .mdx file to app/blog/posts
  // All projects will be listed on the /home and /work routes
};

const gallery = {
  path: "/gallery",
  label: "Gallery",
  title: `Photo gallery – ${person.name}`,
  description: `A photo collection by ${person.name}`,
  // Images by https://lorant.one
  // These are placeholder images, replace with your own
  images: [
    {
      src: "/images/gallery/horizontal-1.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/horizontal-2.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/horizontal-3.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/horizontal-4.jpg",
      alt: "image",
      orientation: "horizontal",
    },
    {
      src: "/images/gallery/vertical-1.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/vertical-2.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/vertical-3.jpg",
      alt: "image",
      orientation: "vertical",
    },
    {
      src: "/images/gallery/vertical-4.jpg",
      alt: "image",
      orientation: "vertical",
    },
  ],
};

const others = {
  path: "/others",
  label: "",
  title: `Others – ${person.name}`,
  description: `Design and dev projects by ${person.name}`,
  tableOfContent: {
    display: true,
    subItems: false,
  },
  achievements: {
    display: true,
    title: "Achievements",
    items: [
      "Built a personal portfolio website",
      "Contributed to open-source projects",
      "Participated in hackathons",
      "Developed a machine learning model for predicting chocolate ratings",
    ],
  },
  certifications: {
    display: true,
    title: "Certifications",
    items: [
      {
        url: "https://www.hackerrank.com/certificates/iframe/8af49cac48c1",
        name: "Hackerrank Basic Python",
        issuer: "Hackerrank",
        image: "/images/certificates/hackerrank-basic-python.png",
      },
      {
        url: "https://www.udemy.com/certificate/UC-c25adfb3-e41a-426b-98cb-439f5cd92173/",
        name: "Complete Python Bootcamp: from Zero to Hero in Python",
        issuer: "Udemy by Jose Portilla",
        image: "https://udemy-certificate.s3.amazonaws.com/image/UC-c25adfb3-e41a-426b-98cb-439f5cd92173.jpg",
      },
      {
        url: "https://www.udemy.com/certificate/UC-b86f74b7-9c63-45ff-abea-79eec763189c/",
        name: "Flutter & Dart - The Complete Guide",
        issuer: "Udemy & Academind by maximilian schwarzmüller",
        image: "https://udemy-certificate.s3.amazonaws.com/image/UC-b86f74b7-9c63-45ff-abea-79eec763189c.jpg",
      },
      {
        url: "https://www.udemy.com/certificate/UC-0e0175aa-1b18-4536-9941-8d9fbe890cf5/",
        name: "Python for Data Science and Machine Learning Bootcamp",
        issuer: "Udemy by Jose Portilla",
        image: "https://udemy-certificate.s3.amazonaws.com/image/UC-0e0175aa-1b18-4536-9941-8d9fbe890cf5.jpg",
      },
      {
        url: "https://drive.google.com/drive/folders/1uBtCyG_LileYJAz4KZ1vJAHhRNGAdWnd",
        name: "AI Internship Certificate",
        issuer: "AIcan Automate Pvt. Ltd. & TeachNook",
        image: "/images/certificates/AIcan.png",
      },
      {
        url: "https://certificate.iirs.gov.in/checkstatus.php?uid=814a9a125df52b50187a4f941ae1d7d8&enm=20231131754916",
        name: "Geodata Processing using Python",
        issuer: "ISRO & IIRS, Dehradun",
        image: "/images/certificates/geodata.jpg",
      },
    ],
  },
  contributions: {
    display: true,
    title: "Contributions",
    items: [
      {
        title: "AI ppt presentation generator",
        project: "ai_ppt_framework",
        avatars: [
          { src: "/images/avatar.jpg" },
        ],
        owner: "likhith-ts",
        icon: "github",
        link: "https://github.com/likhith-ts/ai_ppt_framework",
        ownerLink: "https://github.com/likhith-ts",
        description: "A Streamlit app that generates a PowerPoint presentation from a given zip file using AI.",
      },
      {
        title: "Melanoma Detection Project",
        project: "Melanoma",
        avatars: [
          { src: "https://avatars.githubusercontent.com/u/181699041?v=4" },
          { src: "/images/avatar.jpg" },
        ],
        owner: "jyothi-alt",
        icon: "github",
        link: "https://github.com/jyothi-alt/MELANOMA",
        ownerLink: "https://github.com/jyothi-alt",
        description: "A flask web app for skin cancer detection using deep learning. ",
      },
    ],
  }
};

export { person, social, newsletter, home, about, blog, work, gallery, others };
