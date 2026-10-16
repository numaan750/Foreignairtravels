import { FiAlertTriangle, FiInfo } from 'react-icons/fi'

const announcements = [
    { icon: FiAlertTriangle, text: 'Airlines group tickets' },
    {
        icon: FiAlertTriangle,
        text: 'All group fares displayed on the portal can change at any time without prior notice',
    },
    { icon: FiInfo, text: 'Enjoy discount fares on group bookings' },
]

const Group = ({ hidden = false }) => (
    <ul
        aria-hidden={hidden || undefined}
        className="flex shrink-0 items-center gap-10 pr-10 sm:gap-14 sm:pr-14"
    >
        {announcements.map(({ icon: Icon, text }) => (
            <li
                key={text}
                className="flex items-center gap-3 whitespace-nowrap text-[12px] font-semibold uppercase tracking-wide text-white sm:text-[14px]"
            >
                <Icon aria-hidden="true" className="size-[16px] shrink-0 text-amber-300" />
                {text}
            </li>
        ))}
    </ul>
)

const AnnouncementBar = () => {
    return (
        <div className="bg-[#003366]">
            <div className="mycontainer py-2.5">
                <div
                    role="marquee"
                    aria-label="Announcements"
                    className="marquee overflow-hidden rounded-full border border-white/15 bg-white/10 py-2 [mask-image:linear-gradient(to_right,transparent,#000_4%,#000_96%,transparent)]"
                >
                    <div className="marquee-track flex w-max">
                        <Group />
                        <Group hidden />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AnnouncementBar