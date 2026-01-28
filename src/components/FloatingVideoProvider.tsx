'use client';

import FloatingVideoButton from './FloatingVideoButton';
import VideoListModal from './VideoListModal';
import FloatingVideoPlayer from './FloatingVideoPlayer';

export default function FloatingVideoProvider() {
  return (
    <>
      <FloatingVideoButton />
      <VideoListModal />
      <FloatingVideoPlayer />
    </>
  );
}
