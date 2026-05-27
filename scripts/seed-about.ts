import { drizzle } from 'drizzle-orm/neon-http'
import { neon } from '@neondatabase/serverless'
import { aboutContent } from '../lib/schema'

const ABOUT = `## What is Brazilian Zouk?

Brazilian Zouk is a partner dance that originated in Brazil in the 1980s, evolving from the Caribbean dance Lambada. It's known for its fluid, wave-like movements, deep connection between partners, and emphasis on musicality. The dance has grown into a worldwide community with its own festivals, competitions, and social scene.

## Nashville Zouk

We're a growing community of dancers in Music City dedicated to bringing Brazilian Zouk to Nashville. Whether you've never tried partner dancing before or you're an experienced dancer looking to expand your repertoire — you belong here.

We host regular **social dances**, **workshops**, and **weekly classes** throughout the year. Our events are welcoming, low-pressure, and a lot of fun.

## What to Expect

At a social dance, you'll find open-floor dancing with a mix of skill levels. Beginners are always welcome, and more experienced dancers love sharing the dance. No partner required — just show up.

Workshops and classes are hands-on and taught by experienced instructors. We focus on technique, connection, and musicality so you can feel confident on the floor.

## Getting Started

The best way to start is to come to a beginner class or a social dance. Comfortable shoes with smooth soles work great. No partner needed — roles rotate so everyone dances with everyone.

Follow us on Instagram or sign up for our mailing list below to stay up to date on events.`

async function run() {
  const url = process.env.DATABASE_URL
  if (!url) throw new Error('DATABASE_URL not set')
  const db = drizzle(neon(url))
  await db.insert(aboutContent).values({ content: ABOUT })
  console.log('About content inserted.')
}

run().catch(console.error)
