'use client'

import { useEffect, useState } from 'react'
import { FiAlertTriangle, FiInfo } from 'react-icons/fi'
import { useApp } from '@/context/AppContext'

const icons = {
    warning: FiAlertTriangle,
    info: FiInfo,
}

const Group = ({ items, hidden = false }) => (
    <ul
        aria-hidden={hidden || undefined}
        className="flex shrink-0 items-center gap-10 pr-10 sm:gap-14 sm:pr-14"
    >
        {items.map(({ _id, type, text }) => {
            const Icon = icons[type] || FiAlertTriangle

            return (
                <li
                    key={_id}
                    className="flex items-center gap-3 whitespace-nowrap text-[12px] font-semibold uppercase tracking-wide text-white sm:text-[14px]"
                >
                    <Icon aria-hidden="true" className="size-[16px] shrink-0 text-amber-300" />
                    {text}
                </li>
            )
        })}
    </ul>
)

const AnnouncementBar = () => {
    const { getAnnouncements } = useApp()
    const [announcements, setAnnouncements] = useState([])

    useEffect(() => {
        const load = async () => {
            const { ok, data } = await getAnnouncements()
            if (ok) setAnnouncements(data.data)
        }
        load()
    }, [getAnnouncements])

    if (announcements.length === 0) return null

    return (
        <div className="bg-[#003366]">
            <div className="mycontainer py-2.5">
                <div
                    role="marquee"
                    aria-label="Announcements"
                    className="marquee overflow-hidden rounded-full border border-white/15 bg-white/10 py-2 [mask-image:linear-gradient(to_right,transparent,#000_4%,#000_96%,transparent)]"
                >
                    <div className="marquee-track flex w-max">
                        <Group items={announcements} />
                        <Group items={announcements} hidden />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AnnouncementBar