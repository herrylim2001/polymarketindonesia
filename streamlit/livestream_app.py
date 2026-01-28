import streamlit as st
import streamlit.components.v1 as components
import re
from urllib.parse import urlparse, parse_qs

def convert_to_embed_url(url: str) -> str:
    """
    Convert berbagai format URL video ke format embed yang benar.
    Supports: YouTube, Vimeo, Twitch, Facebook, Dailymotion
    """
    if not url:
        return ""

    url = url.strip()

    # YouTube patterns
    youtube_patterns = [
        # youtube.com/watch?v=VIDEO_ID
        r'(?:https?://)?(?:www\.)?youtube\.com/watch\?v=([a-zA-Z0-9_-]+)',
        # youtube.com/embed/VIDEO_ID (already embed)
        r'(?:https?://)?(?:www\.)?youtube\.com/embed/([a-zA-Z0-9_-]+)',
        # youtu.be/VIDEO_ID
        r'(?:https?://)?youtu\.be/([a-zA-Z0-9_-]+)',
        # youtube.com/v/VIDEO_ID
        r'(?:https?://)?(?:www\.)?youtube\.com/v/([a-zA-Z0-9_-]+)',
        # youtube.com/live/VIDEO_ID
        r'(?:https?://)?(?:www\.)?youtube\.com/live/([a-zA-Z0-9_-]+)',
    ]

    for pattern in youtube_patterns:
        match = re.search(pattern, url)
        if match:
            video_id = match.group(1)
            return f"https://www.youtube.com/embed/{video_id}?autoplay=1&mute=1"

    # Vimeo patterns
    vimeo_patterns = [
        # vimeo.com/VIDEO_ID
        r'(?:https?://)?(?:www\.)?vimeo\.com/(\d+)',
        # player.vimeo.com/video/VIDEO_ID (already embed)
        r'(?:https?://)?player\.vimeo\.com/video/(\d+)',
    ]

    for pattern in vimeo_patterns:
        match = re.search(pattern, url)
        if match:
            video_id = match.group(1)
            return f"https://player.vimeo.com/video/{video_id}"

    # Twitch patterns
    twitch_channel = re.search(r'(?:https?://)?(?:www\.)?twitch\.tv/([a-zA-Z0-9_]+)(?!/video)', url)
    if twitch_channel:
        channel = twitch_channel.group(1)
        return f"https://player.twitch.tv/?channel={channel}&parent=localhost&muted=true"

    twitch_video = re.search(r'(?:https?://)?(?:www\.)?twitch\.tv/videos/(\d+)', url)
    if twitch_video:
        video_id = twitch_video.group(1)
        return f"https://player.twitch.tv/?video={video_id}&parent=localhost&muted=true"

    # Facebook video
    fb_match = re.search(r'(?:https?://)?(?:www\.)?facebook\.com/.+/videos/(\d+)', url)
    if fb_match:
        return f"https://www.facebook.com/plugins/video.php?href={url}"

    # Dailymotion
    dm_match = re.search(r'(?:https?://)?(?:www\.)?dailymotion\.com/video/([a-zA-Z0-9]+)', url)
    if dm_match:
        video_id = dm_match.group(1)
        return f"https://www.dailymotion.com/embed/video/{video_id}"

    # If already an embed URL or unknown format, return as-is
    return url

def get_url_info(url: str) -> dict:
    """Get info about the URL for display"""
    if not url:
        return {"platform": "Unknown", "status": "No URL"}

    if "youtube.com" in url or "youtu.be" in url:
        return {"platform": "YouTube", "icon": "🎬"}
    elif "vimeo.com" in url:
        return {"platform": "Vimeo", "icon": "🎥"}
    elif "twitch.tv" in url:
        return {"platform": "Twitch", "icon": "🎮"}
    elif "facebook.com" in url:
        return {"platform": "Facebook", "icon": "📘"}
    elif "dailymotion.com" in url:
        return {"platform": "Dailymotion", "icon": "📺"}
    else:
        return {"platform": "Custom", "icon": "🔗"}

# Page config
st.set_page_config(
    page_title="Livestream Video Wireframe",
    page_icon="📺",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS untuk dark theme dan styling
st.markdown("""
<style>
    /* Dark theme */
    .stApp {
        background-color: #0a0a0f;
    }

    /* Header styling */
    .main-header {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        padding: 1.5rem 2rem;
        border-radius: 1rem;
        margin-bottom: 2rem;
        border: 1px solid #2a2a4a;
    }

    .main-header h1 {
        color: white;
        margin: 0;
        font-size: 1.8rem;
    }

    .main-header p {
        color: rgba(255,255,255,0.6);
        margin: 0.5rem 0 0 0;
    }

    /* Video container */
    .video-container {
        background: #1a1a2e;
        border-radius: 1rem;
        overflow: hidden;
        border: 1px solid #2a2a4a;
    }

    /* Live badge */
    .live-badge {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: #ef4444;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 9999px;
        font-size: 0.875rem;
        font-weight: bold;
    }

    .live-badge::before {
        content: '';
        width: 8px;
        height: 8px;
        background: white;
        border-radius: 50%;
        animation: pulse 1.5s infinite;
    }

    @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
    }

    /* Feature cards */
    .feature-card {
        background: #1a1a2e;
        padding: 1.5rem;
        border-radius: 1rem;
        border: 1px solid #2a2a4a;
        height: 100%;
    }

    .feature-card h3 {
        color: white;
        margin-top: 1rem;
    }

    .feature-card p {
        color: rgba(255,255,255,0.6);
        font-size: 0.9rem;
    }

    /* Browser frame */
    .browser-frame {
        background: #1e1e2e;
        border-radius: 0.75rem 0.75rem 0 0;
        padding: 0.5rem 1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .browser-dots {
        display: flex;
        gap: 6px;
    }

    .browser-dot {
        width: 12px;
        height: 12px;
        border-radius: 50%;
    }

    .browser-dot.red { background: #ef4444; }
    .browser-dot.yellow { background: #eab308; }
    .browser-dot.green { background: #22c55e; }

    .browser-url {
        flex: 1;
        background: #2a2a3e;
        padding: 0.25rem 0.75rem;
        border-radius: 0.25rem;
        color: rgba(255,255,255,0.4);
        font-size: 0.75rem;
        margin-left: 0.5rem;
    }

    /* Overlay controls */
    .video-overlay {
        position: relative;
    }

    .overlay-top {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        padding: 1rem;
        background: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .overlay-bottom {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 1rem;
        background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
    }

    /* Placeholder */
    .video-placeholder {
        background: linear-gradient(135deg, #1e1e2e 0%, #0a0a1a 100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        color: white;
        min-height: 300px;
    }

    .placeholder-icon {
        font-size: 4rem;
        margin-bottom: 1rem;
        animation: pulse 2s infinite;
    }

    /* Embed code */
    .embed-code {
        background: #0a0a1a;
        padding: 1rem;
        border-radius: 0.5rem;
        font-family: monospace;
        color: #22c55e;
        font-size: 0.85rem;
        overflow-x: auto;
        white-space: pre-wrap;
    }

    /* Viewer count */
    .viewer-count {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        color: rgba(255,255,255,0.8);
        font-size: 0.875rem;
    }

    /* Hide Streamlit branding */
    #MainMenu {visibility: hidden;}
    footer {visibility: hidden;}

    /* Sidebar styling */
    .css-1d391kg {
        background-color: #1a1a2e;
    }

    section[data-testid="stSidebar"] {
        background-color: #1a1a2e;
    }
</style>
""", unsafe_allow_html=True)

# Aspect ratio configurations
ASPECT_RATIOS = {
    "16:9 (Widescreen)": {"ratio": "16/9", "padding": "56.25%"},
    "4:3 (Standard)": {"ratio": "4/3", "padding": "75%"},
    "1:1 (Square)": {"ratio": "1/1", "padding": "100%"},
    "9:16 (Portrait)": {"ratio": "9/16", "padding": "177.78%"},
    "21:9 (Ultra Wide)": {"ratio": "21/9", "padding": "42.86%"},
}

DEVICE_WIDTHS = {
    "Desktop": "100%",
    "Tablet": "768px",
    "Mobile": "375px",
    "TV / Large Screen": "100%",
}

SAMPLE_URLS = {
    "YouTube Live (Lofi Girl)": "https://www.youtube.com/embed/jfKfPfyJRdk",
    "YouTube (Sample)": "https://www.youtube.com/embed/dQw4w9WgXcQ",
    "Vimeo (Sample)": "https://player.vimeo.com/video/824804225",
    "Custom URL": "",
}

def render_video_player(url: str, aspect_ratio: str, show_overlay: bool = True, viewer_count: int = 1250):
    """Render video player dengan iframe atau placeholder"""

    padding = ASPECT_RATIOS[aspect_ratio]["padding"]

    if url:
        # Render iframe
        iframe_html = f"""
        <div class="video-container" style="position: relative; width: 100%; padding-bottom: {padding}; background: #0a0a1a;">
            <iframe
                src="{url}"
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none;"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowfullscreen>
            </iframe>
            {"" if not show_overlay else f'''
            <div style="position: absolute; top: 0; left: 0; right: 0; padding: 1rem; background: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent); display: flex; justify-content: space-between; align-items: center; pointer-events: none;">
                <div style="display: flex; align-items: center; gap: 1rem;">
                    <span class="live-badge">LIVE</span>
                </div>
                <div class="viewer-count">
                    👁️ {viewer_count:,} viewers
                </div>
            </div>
            '''}
        </div>
        """
    else:
        # Render placeholder
        iframe_html = f"""
        <div class="video-container" style="position: relative; width: 100%; padding-bottom: {padding}; background: linear-gradient(135deg, #1e1e2e 0%, #0a0a1a 100%);">
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: white;">
                <div style="font-size: 4rem; animation: pulse 2s infinite;">📺</div>
                <p style="margin-top: 1rem; font-size: 1.1rem; font-weight: 500;">Menunggu Stream...</p>
                <p style="color: rgba(255,255,255,0.5); font-size: 0.9rem;">Masukkan URL video di sidebar</p>
            </div>
            {"" if not show_overlay else f'''
            <div style="position: absolute; top: 0; left: 0; right: 0; padding: 1rem; background: linear-gradient(to bottom, rgba(0,0,0,0.5), transparent); display: flex; justify-content: space-between; align-items: center;">
                <span class="live-badge">LIVE</span>
                <div class="viewer-count">👁️ -- viewers</div>
            </div>
            '''}
        </div>
        """

    return iframe_html

def render_browser_frame(url: str):
    """Render browser frame mockup"""
    display_url = url if url else "https://polymarket.id/livestream"
    return f"""
    <div class="browser-frame">
        <div class="browser-dots">
            <div class="browser-dot red"></div>
            <div class="browser-dot yellow"></div>
            <div class="browser-dot green"></div>
        </div>
        <div class="browser-url">{display_url[:50]}{'...' if len(display_url) > 50 else ''}</div>
    </div>
    """

def main():
    # Sidebar - Control Panel
    with st.sidebar:
        st.markdown("## 🎛️ Control Panel")
        st.markdown("---")

        # URL Input
        st.markdown("### 🔗 Video URL")
        url_option = st.selectbox(
            "Pilih Sample atau Custom",
            list(SAMPLE_URLS.keys()),
            index=3  # Default to Custom URL
        )

        # Help text for supported URLs
        with st.expander("📋 Format URL yang didukung"):
            st.markdown("""
            **YouTube:**
            - `youtube.com/watch?v=xxxxx`
            - `youtu.be/xxxxx`
            - `youtube.com/live/xxxxx`

            **Vimeo:**
            - `vimeo.com/xxxxx`

            **Twitch:**
            - `twitch.tv/channel_name`
            - `twitch.tv/videos/xxxxx`

            **Lainnya:**
            - Facebook Video
            - Dailymotion
            - Direct embed URL
            """)

        if url_option == "Custom URL":
            raw_url = st.text_input(
                "Masukkan URL video",
                placeholder="https://www.youtube.com/watch?v=... atau link lainnya"
            )
            video_url = convert_to_embed_url(raw_url)

            # Show URL conversion info
            if raw_url:
                url_info = get_url_info(raw_url)
                st.markdown(f"**Platform:** {url_info['icon']} {url_info['platform']}")

                if raw_url != video_url:
                    st.success("✅ URL berhasil dikonversi ke format embed!")
                    with st.expander("Lihat URL embed"):
                        st.code(video_url, language=None)
                else:
                    st.info("URL sudah dalam format embed")
        else:
            video_url = SAMPLE_URLS[url_option]
            if video_url:
                st.code(video_url, language=None)

        st.markdown("---")

        # Aspect Ratio
        st.markdown("### 📐 Aspect Ratio")
        aspect_ratio = st.selectbox(
            "Pilih ukuran video",
            list(ASPECT_RATIOS.keys()),
            index=0
        )

        st.markdown("---")

        # Device Preview
        st.markdown("### 📱 Device Preview")
        device = st.selectbox(
            "Simulasi perangkat",
            list(DEVICE_WIDTHS.keys()),
            index=0
        )

        st.markdown("---")

        # Layout Options
        st.markdown("### 🎨 Layout Options")
        show_overlay = st.checkbox("Tampilkan Overlay", value=True)
        show_browser_frame = st.checkbox("Tampilkan Browser Frame", value=True)
        viewer_count = st.slider("Jumlah Viewer (simulasi)", 0, 10000, 1250)

        st.markdown("---")

        # Multi-stream toggle
        st.markdown("### 📺 Multi-Stream Mode")
        multi_stream = st.checkbox("Aktifkan Multi-Stream", value=False)
        if multi_stream:
            num_streams = st.slider("Jumlah Stream", 2, 4, 2)

    # Main Content
    # Header
    st.markdown("""
    <div class="main-header">
        <h1>📺 Livestream Video Wireframe</h1>
        <p>Prototype Demo untuk Presentasi Client</p>
    </div>
    """, unsafe_allow_html=True)

    # Status indicators
    col1, col2, col3, col4 = st.columns(4)
    with col1:
        st.metric("Device", device)
    with col2:
        st.metric("Aspect Ratio", aspect_ratio.split(" ")[0])
    with col3:
        st.metric("Status", "🟢 Live" if video_url else "⚪ Offline")
    with col4:
        st.metric("Viewers", f"{viewer_count:,}" if video_url else "-")

    st.markdown("---")

    # Video Preview Section
    st.markdown("### 👁️ Live Preview")

    # Calculate container width based on device
    device_width = DEVICE_WIDTHS[device]

    if not multi_stream:
        # Single video mode
        if device in ["Tablet", "Mobile"]:
            # Center the video for mobile/tablet
            col1, col2, col3 = st.columns([1, 2, 1])
            with col2:
                if show_browser_frame:
                    st.markdown(render_browser_frame(video_url), unsafe_allow_html=True)

                video_html = render_video_player(video_url, aspect_ratio, show_overlay, viewer_count)
                components.html(f"""
                <div style="max-width: {device_width}; margin: 0 auto; background: #1e1e2e; border-radius: 0 0 1rem 1rem; padding: 1rem;">
                    {video_html}
                </div>
                """, height=500)
        else:
            # Full width for desktop/TV
            if show_browser_frame:
                st.markdown(render_browser_frame(video_url), unsafe_allow_html=True)

            video_html = render_video_player(video_url, aspect_ratio, show_overlay, viewer_count)
            components.html(f"""
            <div style="background: #1e1e2e; border-radius: 0 0 1rem 1rem; padding: 1rem;">
                {video_html}
            </div>
            """, height=600)
    else:
        # Multi-stream mode
        st.markdown(f"**Mode: {num_streams} Stream Grid**")

        if num_streams == 2:
            cols = st.columns(2)
            for i, col in enumerate(cols):
                with col:
                    st.markdown(f"**Stream {i+1}**")
                    video_html = render_video_player(
                        video_url if i == 0 else "",
                        "16:9 (Widescreen)",
                        show_overlay,
                        viewer_count if i == 0 else 0
                    )
                    components.html(f"""
                    <div style="background: #1e1e2e; border-radius: 1rem; padding: 0.5rem;">
                        {video_html}
                    </div>
                    """, height=300)
        else:
            # 2x2 grid for 3-4 streams
            for row in range(2):
                cols = st.columns(2)
                for col_idx, col in enumerate(cols):
                    stream_idx = row * 2 + col_idx
                    if stream_idx < num_streams:
                        with col:
                            st.markdown(f"**Stream {stream_idx + 1}**")
                            video_html = render_video_player(
                                video_url if stream_idx == 0 else "",
                                "16:9 (Widescreen)",
                                show_overlay,
                                viewer_count if stream_idx == 0 else 0
                            )
                            components.html(f"""
                            <div style="background: #1e1e2e; border-radius: 1rem; padding: 0.5rem;">
                                {video_html}
                            </div>
                            """, height=280)

    st.markdown("---")

    # Features Section
    st.markdown("### ✨ Fitur Utama")

    col1, col2, col3 = st.columns(3)

    with col1:
        st.markdown("""
        <div class="feature-card">
            <div style="font-size: 2.5rem;">📱</div>
            <h3>Responsive Design</h3>
            <p>Video player otomatis menyesuaikan dengan ukuran layar. Support mobile, tablet, dan desktop.</p>
        </div>
        """, unsafe_allow_html=True)

    with col2:
        st.markdown("""
        <div class="feature-card">
            <div style="font-size: 2.5rem;">▶️</div>
            <h3>Multiple Sources</h3>
            <p>Support berbagai sumber video: YouTube Live, Vimeo, Twitch, atau custom RTMP stream.</p>
        </div>
        """, unsafe_allow_html=True)

    with col3:
        st.markdown("""
        <div class="feature-card">
            <div style="font-size: 2.5rem;">🎨</div>
            <h3>Flexible Layout</h3>
            <p>Pilih layout yang sesuai: single video, multi-grid, atau picture-in-picture mode.</p>
        </div>
        """, unsafe_allow_html=True)

    st.markdown("---")

    # Embed Code Section
    st.markdown("### 📝 Embed Code")

    ratio_value = ASPECT_RATIOS[aspect_ratio]["ratio"]
    embed_code = f"""<iframe
  src="{video_url or 'YOUR_STREAM_URL'}"
  width="100%"
  style="aspect-ratio: {ratio_value};"
  frameborder="0"
  allowfullscreen
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
</iframe>"""

    st.code(embed_code, language="html")

    if st.button("📋 Copy Embed Code"):
        st.success("Embed code copied! (Use Ctrl+C from the code block above)")

    # Footer
    st.markdown("---")
    st.markdown("""
    <div style="text-align: center; color: rgba(255,255,255,0.4); padding: 1rem;">
        <p>Polymarket Indonesia - Livestream Video Wireframe Prototype</p>
    </div>
    """, unsafe_allow_html=True)

if __name__ == "__main__":
    main()
