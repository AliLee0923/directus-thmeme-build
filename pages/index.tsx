import { useEffect, useState } from 'react'
import { execSync } from 'child_process'
import axios from 'axios'

import { BsPlusLg, BsStars } from 'react-icons/bs'

import * as shade from '@/resources/shade'

import Footer from '@/components/Footer'
import Splash from '@/components/Splash'
import Content from '@/components/Content'
import People from '@/components/People'

export default function Index({ git, palette }: any) {
  const [hex, setHex] = useState('#6644FF')
  const [hexText, setHexText] = useState('#6644FF')
  const [content, setContent] = useState('')

  const [contributors, setContributors] = useState<Array<any>>([])
  const [stargazers, setStargazers] = useState<Array<any>>([])

  // Dynamically change the theme based on the hex.
  const borderHover = {
    in: (obj: any) => obj.style.borderColor = hex,
    out: (obj: any) => obj.style.borderColor = '#d4d4d4'
  }

  useEffect(() => {
    // Ensure hex starts with a "#".
    !hex.startsWith('#') && setHex('#' + hex)

    // Ensures that any given hex color can be seen infront of a white background.
    // -->> Implementation by https://github.com/vanling - Thanks!
    setHexText(shade.contrast(hex, hex, '#a3a3a3'))

    // Update the css object.
    setContent(shade.wrap(hex))
  }, [hex])

  useEffect(() => {
    // Fetch and store people within the contributors group.
    axios.get('https://api.github.com/repos/ThijmenGThN/directus-themebuilder/contributors')
      .then((res: any) => {
        // Prune repo owner from entries.
        res = res.data.filter(
          ({ login }: { login: string }) => login != "ThijmenGThN"
        ).reverse()

        setContributors(res)
      })

    // Fetch and store people within the stargazers group.
    axios.get('https://api.github.com/repos/ThijmenGThN/directus-themebuilder/stargazers')
      .then((res: any) => {
        // Prune repo owner from entries.
        res = res.data.filter(
          ({ login }: { login: string }) => login != "ThijmenGThN"
        ).reverse()

        setStargazers(res)
      })
  }, [])

  return (
    <div className='flex flex-col min-h-screen'>
      <div className="container mx-auto flex flex-col px-5 grow mb-10">

        {/* ----- SECTION: Logo with Motto ----- */}
        <Splash hex={hex} />

        {/* ----- SECTION: Palette ----- */}
        <div className='flex gap-2 mt-10 mx-auto'>
          <div id="palette-picker" className='border-2 relative border-neutral-300 rounded-lg'>
            <input className='absolute top-0 left-0 w-full h-full opacity-0 hover:cursor-pointer'
              onChange={(({ target }) => setHex(target.value))}
              value={hex}
              type="color"
              onMouseOver={() => borderHover.in(document.querySelector('#palette-picker'))}
              onMouseOut={() => borderHover.out(document.querySelector('#palette-picker'))}
            />

            <div className='m-3 w-9 h-9 rounded pointer-events-none' style={{ backgroundColor: hex }} />
          </div>

          <div id="palette-prefabs" className='border-2 p-3 border-neutral-300 grid grid-flow-col gap-2 rounded-lg'
            onMouseOver={({ target }) => borderHover.in(target)}
            onMouseOut={({ target }) => borderHover.out(target)}
          >
            {
              [shade.random(), shade.random(), shade.random()].map((color: string, index: number) => (
                <div key={index} className='rounded w-9 h-9 hover:cursor-pointer flex justify-center items-center text-white'
                  style={{ backgroundColor: color }}
                  onClick={() => setHex(color)}
                  onMouseOver={() => borderHover.in(document.querySelector('#palette-prefabs'))}
                  onMouseOut={() => borderHover.out(document.querySelector('#palette-prefabs'))}
                >
                  <BsPlusLg />
                </div>
              ))
            }
          </div>

          <a href="https://github.com/ThijmenGThN/directus-themebuilder/stargazers" target="_blank" rel="noreferrer"
            className='bg-white border-neutral-300 border-2 items-center rounded-lg flex gap-1 text-xl my-auto p-4 hover:cursor-pointer hover:border-violet-500 hover:border-3'
            onMouseOver={({ target }) => borderHover.in(target)}
            onMouseOut={({ target }) => borderHover.out(target)}
          >
            <BsStars className='pointer-events-none' />
            <p className='pointer-events-none font-semibold'>{stargazers.length + 1}</p>
          </a>
        </div>

        {/* ----- SECTION: Custom CSS ----- */}
        <Content hex={hex} hexText={hexText} content={content} />

        {/* ----- SECTION: Contributors ----- */}
        <People hex={hex} people={contributors} title="Contributors" />

        {/* ----- SECTION: Stargazers ----- */}
        <People hex={hex} people={stargazers} title="Stargazers" />

      </div>

      <Footer git={git} hex={hex} />
    </div >
  )
}

export async function getServerSideProps() {
  return {
    props: {
      git: {
        buildId: execSync('git rev-parse --short HEAD').toString(),
        latestTag: execSync('git describe --abbrev=0 --tags').toString()
      }
    }
  }
}
