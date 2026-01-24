/**
 * 最近活动列表
 *
 * 遵循 dev-frontend_patterns skill 规范。
 */

import { FileText, MessageSquare, User, Clock } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface Activity {
  id: string
  type: 'upload' | 'chat' | 'login'
  title: string
  description: string
  time: string
}

const ICON_MAP = {
  upload: FileText,
  chat: MessageSquare,
  login: User,
}

export function ActivityList({ activities }: { activities: Activity[] }) {
  const { t } = useTranslation('common')

  return (
    <div className="bg-white rounded-2xl shadow-soft border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex items-center justify-between">
        <h3 className="font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-primary-500" />
          {t('activity.title', 'Recent Activity')}
        </h3>
        <button className="text-xs text-primary-500 hover:text-primary-600 font-medium">
          {t('actions.viewAll', 'View All')}
        </button>
      </div>
      <div className="divide-y divide-gray-50">
        {activities.map((activity) => {
          const Icon = ICON_MAP[activity.type]
          return (
            <div key={activity.id} className="p-4 hover:bg-slate-50 transition-colors flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0 text-slate-500">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {activity.title}
                </p>
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {activity.description}
                </p>
              </div>
              <div className="text-[10px] text-gray-400 font-medium">
                {activity.time}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
