// import { Logo } from "@/once-ui/components";
// import { Certificate } from "crypto";
// import { link } from "fs";

import { title } from "process";

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
  display: false,
  title: <>Subscribe to {person.firstName}'s Newsletter</>,
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
  featured: {
    display: true,
    title: <>Recent project: <strong className="ml-4">Credit Card</strong></>,
    href: "work/credit-card",
  },
  subline: (
    <>
      I'm Likhith, an independent AI engineer focused on end-to-end ML solutions and cross-platform web development.
      {/* <Logo icon={false} style={{ display: "inline-flex", top: "0.25em", marginLeft: "-0.25em" }}/> */}
    </>
  ),
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
    link: "https://cal.com",
  },
  intro: {
    display: true,
    title: "Introduction",
    description: (
      <>
        Likhith is a versatile, India-based entry-level AI/ML engineer and full-stack developer 
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
          <>
            Developed a supervised learning model for predicting chocolate 
            ratings using Kaggle's Churn Dataset.
          </>,
          <>
            Performed extensive exploratory data analysis (EDA) to identify
            trends and clean data for optimal model performance.
          </>,
          <>
            Implemented ANN & Logistic regression for prediction and 
            compared performance with other regression models, achieved 
            97.5% model accuracy.
          </>,
        ],
        images: [
          // optional: leave the array empty if you don't want to display images
          // {
          //   src: "/images/projects/project-01/cover-01.jpg",
          //   alt: "Once UI Project",
          //   width: 16,
          //   height: 9,
          // },
        ],
      },
      // {
      //   company: "Creativ3",
      //   timeframe: "2018 - 2022",
      //   role: "Lead Designer",
      //   achievements: [
      //     <>
      //       Developed a design system that unified the brand across multiple platforms, improving
      //       design consistency by 40%.
      //     </>,
      //     <>
      //       Led a cross-functional team to launch a new product line, contributing to a 15% increase
      //       in overall company revenue.
      //     </>,
      //   ],
      //   images: [],
      // },
    ],
  },
  studies: {
    display: true, // set to false to hide this section
    title: "Education",
    institutions: [
      {
        name: "SRM University",
        description: <>B.Tech CSE with spl. in Big Data Analytics. </>,
        year: "2020 - 2024 | CGPA: 9.17",
      },
      {
        name: "Sunbeam CBSE School",
        description: <>Higher Secondary with PCM and CS.</>,
        year: "2018 - 2020 | Score: 88.2%",
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
          // {
          //   src: "/images/projects/project-01/cover-03.jpg",
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
        title:" Machine Learning:",
        description: <>Master in building state-of-art ML projects with <b>Scikit-learn</b>, <b>Pytorch</b> and <b>Tensorflow</b>.</>,
        images: [

        ],
      },
      {
        title:"Artificial Intelligence",
        description: <>Expert in Integrating & Fine-tuning AI models, LLMs with <b>Hugging Face</b> & <b>Langchain</b>.</>,
        images: [

        ],
      },
      { 
        title:"Cloud/DevOps",
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
  label: "Projects",
  title: `Projects – ${person.name}`,
  description: `Design and dev projects by ${person.name}`,
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
  achievements: [
    "Built a personal portfolio website", 
    "Contributed to open-source projects", 
    "Participated in hackathons",
    "Developed a machine learning model for predicting chocolate ratings",

  ],
  certifications: [
    {
      name: "AWS Certified Solutions Architect",
      issuer: "Amazon Web Services",
      year: 2020,
    },
    {
      name: "Certified Kubernetes Administrator",
      issuer: "Cloud Native Computing Foundation",
      year: 2021,
    },
    {
      name: "Google Cloud Professional Data Engineer",
      issuer: "Google Cloud",
      year: 2022,
    },
    {
      name: "Certified Ethical Hacker",
      issuer: "EC-Council",
      year: 2023,
    },],
    contributions:[
      {
        title: "Melanoma Detection Project",
        project: "Melanoma",
        avatars: [
          {src: "https://avatars.githubusercontent.com/u/181699041?v=4"},
          {src: "/images/avatar.jpg"},
        ],
        owner: "jyothi-alt",
        icon: "github",
        link: "https://github.com/jyothi-alt/MELANOMA",
        description: "A flask web app for skin cancer detection using deep learning. ",
      },
      
      {
        title: "Contributed to AIcan Automate Pvt. Ltd.",
        project: "AIcan Automate",
        avatars: [
          {src: "https://avatars.githubusercontent.com/u/181699041?v=4"},
          {src: "/images/avatar.jpg"},
        ],
        owner: "likhith-ts",
        icon: "github",
        link: "https://github.com/likhith-ts/AIcan-Automate",
        description: "A web app for automating tasks using AI.",
      },
      
      {
        title: "Contributed to Credit Card Fraud Detection Project",
        project: "Credit Card Fraud Detection",
        avatars: [
          {src: "https://avatars.githubusercontent.com/u/181699041?v=4"},
          {src: "/images/avatar.jpg"},
        ],
        owner: "likhith-ts",
        icon: "github",
        link: "https://github.com/likhith-ts/Credit-Card-Fraud-Detection",
        description: "A web app for detecting credit card fraud using machine learning.",
      },
     
    ],
};

export { person, social, newsletter, home, about, blog, work, gallery, others };
