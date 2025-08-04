import { TimelineEntry } from './Timeline'

interface WorkExperience {
  company: string
  timeframe: string
  role: string
  achievements: React.ReactNode[]
  images: Array<{
    src: string
    alt: string
    width: number
    height: number
  }>
}

interface StudyInstitution {
  title: string
  institute: string
  description: React.ReactNode
  timeframe: string
  score?: string
}

interface AboutData {
  work: {
    display: boolean
    title: string
    experiences: WorkExperience[]
  }
  studies: {
    display: boolean
    title: string
    institutions: StudyInstitution[]
  }
}

export const transformToTimelineEntries = (aboutData: AboutData): TimelineEntry[] => {
  const entries: TimelineEntry[] = []

  // Add work experiences
  if (aboutData.work.display && aboutData.work.experiences) {
    aboutData.work.experiences.forEach((experience, index) => {
      entries.push({
        id: `work-${experience.company}-${index}`,
        type: 'professional',
        title: experience.company,
        // institute: experience.company,
        subtitle: experience.role,
        timeframe: experience.timeframe,
        achievements: experience.achievements,
        images: experience.images
      })
    })
  }

  // Add educational institutions
  if (aboutData.studies.display && aboutData.studies.institutions) {
    aboutData.studies.institutions.forEach((institution, index) => {
      entries.push({
        id: `study-${institution.title}-${index}`,
        type: 'academic',
        title: institution.title,
        institute: institution.institute,
        subtitle: institution.score || '',
        timeframe: institution.timeframe,
        description: institution.description,
      })
    })
  }

  return entries
}
