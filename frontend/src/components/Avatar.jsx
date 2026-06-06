import { AVATAR_GRADIENT } from '../utils/helpers';

const SIZE_MAP = {
  xs: { box: 'w-6 h-6', text: 'text-xs' },
  sm: { box: 'w-7 h-7', text: 'text-xs' },
  md: { box: 'w-8 h-8', text: 'text-xs' },
  lg: { box: 'w-10 h-10', text: 'text-sm' },
  xl: { box: 'w-12 h-12', text: 'text-lg' },
  '2xl': { box: 'w-14 h-14', text: 'text-lg' },
  '3xl': { box: 'w-20 h-20', text: 'text-2xl' },
  profile: { box: 'w-24 h-24', text: 'text-3xl' },
};

const Avatar = ({
  src,
  username,
  size = 'md',
  className = '',
  border = false,
  borderClass = 'border-2 border-blue-500',
  online = false,
  onClick,
  ring = false,
}) => {
  const { box, text } = SIZE_MAP[size] || SIZE_MAP.md;
  const initial = username?.[0]?.toUpperCase() || '?';
  const interactive = onClick ? 'cursor-pointer hover:opacity-80 transition' : '';

  const avatarContent = src ? (
    <img
      src={src}
      alt={username ? `${username}'s avatar` : 'avatar'}
      className={`${box} rounded-full object-cover ${border ? borderClass : ''} ${interactive} ${className}`}
      onClick={onClick}
    />
  ) : (
    <div
      onClick={onClick}
      className={`${box} rounded-full ${AVATAR_GRADIENT} flex items-center justify-center text-white font-bold ${text} ${border ? borderClass : ''} ${interactive} ${className}`}
    >
      {initial}
    </div>
  );

  if (ring) {
    return (
      <div className="p-[2px] rounded-full bg-gradient-to-tr from-blue-500 to-purple-600">
        <div className="bg-gray-900 p-[2px] rounded-full">{avatarContent}</div>
      </div>
    );
  }

  if (online) {
    return (
      <div className={`relative flex-shrink-0 ${className}`}>
        {avatarContent}
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900" />
      </div>
    );
  }

  return avatarContent;
};

export default Avatar;
