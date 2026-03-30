import streamlit as st
import streamlit.components.v1 as components
import re

def convert_to_embed_url(url: str) -> str:
    """Convert berbagai format URL video ke format embed yang benar."""
    if not url:
        return ""
    url = url.strip()

    # YouTube patterns
    youtube_patterns = [
        r'(?:https?://)?(?:www\.)?youtube\.com/watch\?v=([a-zA-Z0-9_-]+)',
        r'(?:https?://)?(?:www\.)?youtube\.com/embed/([a-zA-Z0-9_-]+)',
        r'(?:https?://)?youtu\.be/([a-zA-Z0-9_-]+)',
        r'(?:https?://)?(?:www\.)?youtube\.com/live/([a-zA-Z0-9_-]+)',
    ]
    for pattern in youtube_patterns:
        match = re.search(pattern, url)
        if match:
            video_id = match.group(1)
            return f"https://www.youtube.com/embed/{video_id}?autoplay=1&mute=1"

    # Vimeo
    vimeo_match = re.search(r'(?:https?://)?(?:www\.)?vimeo\.com/(\d+)', url)
    if vimeo_match:
        return f"https://player.vimeo.com/video/{vimeo_match.group(1)}"

    return url

# Page config
st.set_page_config(
    page_title="Live Stream - Stake Style",
    page_icon="📺",
    layout="wide",
    initial_sidebar_state="collapsed"
)

# Sample streams data
SAMPLE_STREAMS = [
    {"id": "1", "title": "ATP Tennis - Kasnikowski vs Engel", "category": "Tennis", "viewers": 1250, "url": "https://www.youtube.com/embed/jfKfPfyJRdk", "thumbnail": "🎾", "is_live": True},
    {"id": "2", "title": "UEFA Champions League", "category": "Football", "viewers": 45000, "url": "https://www.youtube.com/embed/jfKfPfyJRdk", "thumbnail": "⚽", "is_live": True},
    {"id": "3", "title": "NBA - Lakers vs Warriors", "category": "Basketball", "viewers": 32000, "url": "https://www.youtube.com/embed/jfKfPfyJRdk", "thumbnail": "🏀", "is_live": True},
    {"id": "4", "title": "eSports - Dota 2 Major", "category": "Gaming", "viewers": 89000, "url": "https://www.youtube.com/embed/jfKfPfyJRdk", "thumbnail": "🎮", "is_live": True},
    {"id": "5", "title": "F1 Grand Prix Monaco", "category": "Racing", "viewers": 125000, "url": "https://www.youtube.com/embed/jfKfPfyJRdk", "thumbnail": "🏎️", "is_live": True},
    {"id": "6", "title": "Boxing - Heavyweight Championship", "category": "Boxing", "viewers": 67000, "url": "https://www.youtube.com/embed/jfKfPfyJRdk", "thumbnail": "🥊", "is_live": False},
]

def render_stake_style_player():
    """Render the complete Stake-style floating player with HTML/CSS/JS"""

    # Build streams JSON for JavaScript
    streams_json = str(SAMPLE_STREAMS).replace("'", '"').replace("True", "true").replace("False", "false")

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
        <style>
            * {{
                margin: 0;
                padding: 0;
                box-sizing: border-box;
                font-family: 'Inter', sans-serif;
            }}

            body {{
                background: #0f1923;
                min-height: 100vh;
                color: white;
            }}

            /* Main Content Area - Simulated page content */
            .main-content {{
                padding: 20px;
                padding-bottom: 100px;
                min-height: 100vh;
            }}

            .content-header {{
                background: linear-gradient(135deg, #1a2c38 0%, #0f1923 100%);
                padding: 24px;
                border-radius: 12px;
                margin-bottom: 20px;
                border: 1px solid #2a3f4d;
            }}

            .content-header h1 {{
                font-size: 24px;
                margin-bottom: 8px;
            }}

            .content-header p {{
                color: #8b9caa;
                font-size: 14px;
            }}

            /* Category tabs */
            .category-tabs {{
                display: flex;
                gap: 8px;
                margin-bottom: 20px;
                overflow-x: auto;
                padding-bottom: 4px;
            }}

            .category-tab {{
                padding: 8px 18px;
                border-radius: 20px;
                border: none;
                font-size: 13px;
                font-weight: 500;
                cursor: pointer;
                white-space: nowrap;
                transition: all 0.2s;
                background: #1a2c38;
                color: #8b9caa;
            }}

            .category-tab:hover {{
                background: #243442;
                color: white;
            }}

            .category-tab.active {{
                background: #00d4aa;
                color: #0f1923;
            }}

            /* Game grid */
            .game-grid {{
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                gap: 14px;
            }}

            .game-card {{
                background: #1a2c38;
                border-radius: 12px;
                overflow: hidden;
                border: 1px solid #2a3f4d;
                transition: all 0.25s;
                cursor: pointer;
                position: relative;
            }}

            .game-card:hover {{
                border-color: #00d4aa;
                transform: translateY(-4px);
                box-shadow: 0 8px 25px rgba(0,0,0,0.4);
            }}

            .game-card:hover .game-overlay {{
                opacity: 1;
            }}

            .game-thumb {{
                width: 100%;
                aspect-ratio: 3/4;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 56px;
                position: relative;
            }}

            .game-overlay {{
                position: absolute;
                inset: 0;
                background: rgba(0,0,0,0.6);
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.25s;
            }}

            .play-btn {{
                background: #00d4aa;
                color: #0f1923;
                border: none;
                padding: 10px 24px;
                border-radius: 8px;
                font-weight: 700;
                font-size: 14px;
                cursor: pointer;
            }}

            .game-info {{
                padding: 10px 12px;
            }}

            .game-info h4 {{
                font-size: 13px;
                margin-bottom: 4px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }}

            .game-info .game-provider {{
                font-size: 11px;
                color: #8b9caa;
            }}

            .game-badges {{
                position: absolute;
                top: 8px;
                left: 8px;
                display: flex;
                flex-direction: column;
                gap: 4px;
            }}

            .game-badge {{
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 700;
            }}

            .badge-hot {{
                background: #ff4757;
                color: white;
            }}

            .badge-new {{
                background: #00d4aa;
                color: #0f1923;
            }}

            .badge-jackpot {{
                background: #ffa502;
                color: #0f1923;
            }}

            .rtp-bar {{
                display: flex;
                align-items: center;
                gap: 6px;
                margin-top: 6px;
            }}

            .rtp-track {{
                flex: 1;
                height: 4px;
                background: #2a3f4d;
                border-radius: 2px;
                overflow: hidden;
            }}

            .rtp-fill {{
                height: 100%;
                border-radius: 2px;
                background: #00d4aa;
            }}

            .rtp-label {{
                font-size: 10px;
                color: #00d4aa;
                font-weight: 600;
                min-width: 42px;
                text-align: right;
            }}

            /* Search bar */
            .search-bar {{
                display: flex;
                gap: 10px;
                margin-bottom: 20px;
            }}

            .search-input {{
                flex: 1;
                background: #1a2c38;
                border: 1px solid #2a3f4d;
                border-radius: 10px;
                padding: 12px 16px;
                color: white;
                font-size: 14px;
            }}

            .search-input:focus {{
                outline: none;
                border-color: #00d4aa;
            }}

            .search-input::placeholder {{
                color: #5a7080;
            }}

            /* Provider banner */
            .provider-banner {{
                background: linear-gradient(135deg, #1a1a2e 0%, #2d1b69 50%, #1a1a2e 100%);
                padding: 20px 24px;
                border-radius: 12px;
                margin-bottom: 20px;
                border: 1px solid #3d2b7a;
                display: flex;
                align-items: center;
                justify-content: space-between;
            }}

            .provider-banner h2 {{
                font-size: 20px;
            }}

            .provider-stats {{
                display: flex;
                gap: 24px;
            }}

            .provider-stat {{
                text-align: center;
            }}

            .provider-stat .val {{
                font-size: 18px;
                font-weight: 700;
                color: #00d4aa;
            }}

            .provider-stat .lbl {{
                font-size: 11px;
                color: #8b9caa;
            }}

            /* Floating Live Button */
            .floating-live-btn {{
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: linear-gradient(135deg, #00d4aa 0%, #00b894 100%);
                color: #0f1923;
                border: none;
                padding: 14px 24px;
                border-radius: 50px;
                font-weight: 600;
                font-size: 14px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 10px;
                box-shadow: 0 4px 20px rgba(0, 212, 170, 0.4);
                transition: all 0.3s;
                z-index: 1000;
            }}

            .floating-live-btn:hover {{
                transform: scale(1.05);
                box-shadow: 0 6px 30px rgba(0, 212, 170, 0.5);
            }}

            .floating-live-btn .live-dot {{
                width: 8px;
                height: 8px;
                background: #ff4757;
                border-radius: 50%;
                animation: pulse 1.5s infinite;
            }}

            .floating-live-btn.hidden {{
                display: none;
            }}

            @keyframes pulse {{
                0%, 100% {{ opacity: 1; transform: scale(1); }}
                50% {{ opacity: 0.6; transform: scale(1.2); }}
            }}

            /* Stream List Popup */
            .stream-list-popup {{
                position: fixed;
                bottom: 80px;
                right: 20px;
                width: 360px;
                max-height: 500px;
                background: #1a2c38;
                border-radius: 16px;
                border: 1px solid #2a3f4d;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                z-index: 1001;
                display: none;
                overflow: hidden;
            }}

            .stream-list-popup.show {{
                display: block;
                animation: slideUp 0.3s ease;
            }}

            @keyframes slideUp {{
                from {{ opacity: 0; transform: translateY(20px); }}
                to {{ opacity: 1; transform: translateY(0); }}
            }}

            .popup-header {{
                padding: 16px 20px;
                background: #0f1923;
                border-bottom: 1px solid #2a3f4d;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }}

            .popup-header h3 {{
                font-size: 16px;
                display: flex;
                align-items: center;
                gap: 8px;
            }}

            .popup-header .close-btn {{
                background: none;
                border: none;
                color: #8b9caa;
                font-size: 20px;
                cursor: pointer;
                padding: 4px;
                line-height: 1;
            }}

            .popup-header .close-btn:hover {{
                color: white;
            }}

            .stream-list {{
                max-height: 400px;
                overflow-y: auto;
            }}

            .stream-item {{
                padding: 14px 20px;
                display: flex;
                align-items: center;
                gap: 14px;
                cursor: pointer;
                transition: background 0.2s;
                border-bottom: 1px solid #2a3f4d;
            }}

            .stream-item:hover {{
                background: #243442;
            }}

            .stream-item:last-child {{
                border-bottom: none;
            }}

            .stream-thumb {{
                width: 50px;
                height: 50px;
                background: #0f1923;
                border-radius: 10px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
            }}

            .stream-info {{
                flex: 1;
            }}

            .stream-info h4 {{
                font-size: 14px;
                margin-bottom: 4px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }}

            .stream-meta {{
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 12px;
                color: #8b9caa;
            }}

            .stream-meta .live-badge {{
                background: #ff4757;
                color: white;
                padding: 2px 8px;
                border-radius: 4px;
                font-size: 10px;
                font-weight: 600;
            }}

            .stream-meta .viewers {{
                display: flex;
                align-items: center;
                gap: 4px;
            }}

            /* Floating Video Player */
            .floating-player {{
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 400px;
                background: #1a2c38;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.5);
                z-index: 1002;
                display: none;
                overflow: hidden;
                border: 1px solid #2a3f4d;
            }}

            .floating-player.show {{
                display: block;
                animation: slideUp 0.3s ease;
            }}

            .floating-player.expanded {{
                width: 600px;
            }}

            .floating-player.minimized {{
                width: 320px;
            }}

            .floating-player.minimized .video-container {{
                display: none;
            }}

            .floating-player.minimized .player-actions {{
                display: none;
            }}

            .player-header {{
                padding: 12px 16px;
                background: #0f1923;
                display: flex;
                justify-content: space-between;
                align-items: center;
                cursor: move;
            }}

            .player-title {{
                display: flex;
                align-items: center;
                gap: 10px;
                flex: 1;
                overflow: hidden;
            }}

            .player-title .icon {{
                font-size: 18px;
            }}

            .player-title span {{
                font-size: 14px;
                font-weight: 500;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }}

            .player-controls {{
                display: flex;
                gap: 8px;
            }}

            .player-controls button {{
                background: none;
                border: none;
                color: #8b9caa;
                font-size: 16px;
                cursor: pointer;
                padding: 6px;
                border-radius: 6px;
                transition: all 0.2s;
            }}

            .player-controls button:hover {{
                background: #243442;
                color: white;
            }}

            .video-container {{
                position: relative;
                width: 100%;
                padding-bottom: 56.25%;
                background: #000;
            }}

            .video-container iframe {{
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                border: none;
            }}

            .video-overlay {{
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                padding: 10px;
                background: linear-gradient(to bottom, rgba(0,0,0,0.6), transparent);
                display: flex;
                justify-content: space-between;
                align-items: center;
                pointer-events: none;
            }}

            .video-overlay .live-indicator {{
                background: #ff4757;
                color: white;
                padding: 4px 10px;
                border-radius: 4px;
                font-size: 11px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 6px;
            }}

            .video-overlay .live-indicator .dot {{
                width: 6px;
                height: 6px;
                background: white;
                border-radius: 50%;
                animation: pulse 1.5s infinite;
            }}

            .video-overlay .viewer-count {{
                color: white;
                font-size: 12px;
                display: flex;
                align-items: center;
                gap: 4px;
            }}

            /* Stream Info Bar */
            .stream-info-bar {{
                padding: 12px 16px;
                background: #0f1923;
                border-top: 1px solid #2a3f4d;
            }}

            .stream-info-bar h4 {{
                font-size: 14px;
                margin-bottom: 4px;
            }}

            .stream-info-bar .meta {{
                font-size: 12px;
                color: #8b9caa;
            }}

            /* Player Actions - Chat & Gift */
            .player-actions {{
                display: flex;
                gap: 10px;
                padding: 12px 16px;
                background: #0f1923;
                border-top: 1px solid #2a3f4d;
            }}

            .action-btn {{
                flex: 1;
                padding: 12px 16px;
                border: none;
                border-radius: 10px;
                font-size: 14px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                transition: all 0.2s;
            }}

            .action-btn.chat-btn {{
                background: #243442;
                color: white;
            }}

            .action-btn.chat-btn:hover {{
                background: #2d4553;
            }}

            .action-btn.gift-btn {{
                background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
                color: white;
            }}

            .action-btn.gift-btn:hover {{
                transform: scale(1.02);
            }}

            .action-btn .icon {{
                font-size: 18px;
            }}

            /* Chat Panel */
            .chat-panel {{
                display: none;
                padding: 16px;
                background: #0f1923;
                border-top: 1px solid #2a3f4d;
                max-height: 250px;
            }}

            .chat-panel.show {{
                display: block;
            }}

            .chat-messages {{
                height: 150px;
                overflow-y: auto;
                margin-bottom: 12px;
            }}

            .chat-message {{
                padding: 8px 0;
                border-bottom: 1px solid #1a2c38;
            }}

            .chat-message .username {{
                color: #00d4aa;
                font-weight: 600;
                font-size: 12px;
            }}

            .chat-message .text {{
                color: #ccc;
                font-size: 13px;
                margin-top: 2px;
            }}

            .chat-input-container {{
                display: flex;
                gap: 10px;
            }}

            .chat-input {{
                flex: 1;
                background: #1a2c38;
                border: 1px solid #2a3f4d;
                border-radius: 8px;
                padding: 10px 14px;
                color: white;
                font-size: 13px;
            }}

            .chat-input:focus {{
                outline: none;
                border-color: #00d4aa;
            }}

            .chat-send-btn {{
                background: #00d4aa;
                border: none;
                border-radius: 8px;
                padding: 10px 16px;
                color: #0f1923;
                font-weight: 600;
                cursor: pointer;
            }}

            /* Gift Panel */
            .gift-panel {{
                display: none;
                padding: 16px;
                background: #0f1923;
                border-top: 1px solid #2a3f4d;
            }}

            .gift-panel.show {{
                display: block;
            }}

            .gift-panel h4 {{
                font-size: 14px;
                margin-bottom: 12px;
            }}

            .gift-grid {{
                display: grid;
                grid-template-columns: repeat(4, 1fr);
                gap: 10px;
            }}

            .gift-item {{
                background: #1a2c38;
                border: 1px solid #2a3f4d;
                border-radius: 10px;
                padding: 12px;
                text-align: center;
                cursor: pointer;
                transition: all 0.2s;
            }}

            .gift-item:hover {{
                border-color: #00d4aa;
                transform: scale(1.05);
            }}

            .gift-item .emoji {{
                font-size: 28px;
                margin-bottom: 6px;
            }}

            .gift-item .price {{
                font-size: 11px;
                color: #00d4aa;
                font-weight: 600;
            }}

            /* Stream Selector Button in Player */
            .change-stream-btn {{
                width: 100%;
                padding: 10px;
                background: #243442;
                border: none;
                color: #8b9caa;
                font-size: 13px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 6px;
            }}

            .change-stream-btn:hover {{
                background: #2d4553;
                color: white;
            }}

            /* Scrollbar styling */
            ::-webkit-scrollbar {{
                width: 6px;
            }}

            ::-webkit-scrollbar-track {{
                background: #0f1923;
            }}

            ::-webkit-scrollbar-thumb {{
                background: #2a3f4d;
                border-radius: 3px;
            }}

            ::-webkit-scrollbar-thumb:hover {{
                background: #3a5060;
            }}

            /* ==========================================
               RESPONSIVE BREAKPOINTS
               ========================================== */

            /* Large Desktop (1400px+) */
            @media (min-width: 1400px) {{
                .main-content {{
                    max-width: 1400px;
                    margin: 0 auto;
                    padding: 30px 40px;
                    padding-bottom: 120px;
                }}

                .game-grid {{
                    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
                    gap: 18px;
                }}

                .game-thumb {{
                    font-size: 64px;
                }}

                .content-header h1 {{
                    font-size: 28px;
                }}

                .floating-player {{
                    width: 450px;
                }}

                .floating-player.expanded {{
                    width: 700px;
                }}
            }}

            /* Desktop (1024px - 1399px) */
            @media (min-width: 1024px) and (max-width: 1399px) {{
                .game-grid {{
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    gap: 14px;
                }}
            }}

            /* Tablet (768px - 1023px) */
            @media (min-width: 768px) and (max-width: 1023px) {{
                .main-content {{
                    padding: 16px;
                    padding-bottom: 100px;
                }}

                .content-header {{
                    padding: 20px;
                }}

                .content-header h1 {{
                    font-size: 22px;
                }}

                .provider-banner {{
                    padding: 16px 20px;
                }}

                .provider-banner h2 {{
                    font-size: 18px;
                }}

                .provider-stats {{
                    gap: 16px;
                }}

                .provider-stat .val {{
                    font-size: 16px;
                }}

                .game-grid {{
                    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
                    gap: 12px;
                }}

                .game-thumb {{
                    font-size: 48px;
                }}

                .game-info {{
                    padding: 8px 10px;
                }}

                .game-info h4 {{
                    font-size: 12px;
                }}

                .floating-player {{
                    width: 360px;
                }}

                .floating-player.expanded {{
                    width: 500px;
                }}

                .stream-list-popup {{
                    width: 340px;
                }}
            }}

            /* Mobile Large (480px - 767px) */
            @media (min-width: 480px) and (max-width: 767px) {{
                .main-content {{
                    padding: 12px;
                    padding-bottom: 90px;
                }}

                .content-header {{
                    padding: 16px;
                    margin-bottom: 14px;
                }}

                .content-header h1 {{
                    font-size: 20px;
                }}

                .content-header p {{
                    font-size: 13px;
                }}

                .provider-banner {{
                    flex-direction: column;
                    gap: 14px;
                    align-items: flex-start;
                    padding: 16px;
                }}

                .provider-stats {{
                    width: 100%;
                    justify-content: space-around;
                }}

                .category-tabs {{
                    gap: 6px;
                    margin-bottom: 14px;
                    -webkit-overflow-scrolling: touch;
                }}

                .category-tab {{
                    padding: 7px 14px;
                    font-size: 12px;
                }}

                .search-input {{
                    padding: 10px 14px;
                    font-size: 13px;
                }}

                .game-grid {{
                    grid-template-columns: repeat(3, 1fr);
                    gap: 10px;
                }}

                .game-thumb {{
                    font-size: 40px;
                    aspect-ratio: 1/1;
                }}

                .game-info {{
                    padding: 8px;
                }}

                .game-info h4 {{
                    font-size: 11px;
                }}

                .game-info .game-provider {{
                    font-size: 10px;
                }}

                .rtp-bar {{
                    margin-top: 4px;
                }}

                .rtp-label {{
                    font-size: 9px;
                    min-width: 36px;
                }}

                /* Floating player - full width on mobile */
                .floating-player {{
                    left: 10px;
                    right: 10px;
                    bottom: 10px;
                    width: auto;
                }}

                .floating-player.expanded {{
                    width: auto;
                }}

                .floating-player.minimized {{
                    width: auto;
                    left: auto;
                    right: 10px;
                    width: 260px;
                }}

                .stream-list-popup {{
                    left: 10px;
                    right: 10px;
                    width: auto;
                    bottom: 70px;
                }}

                .floating-live-btn {{
                    padding: 12px 20px;
                    font-size: 13px;
                }}

                .gift-grid {{
                    grid-template-columns: repeat(4, 1fr);
                    gap: 8px;
                }}

                .gift-item {{
                    padding: 10px 6px;
                }}

                .gift-item .emoji {{
                    font-size: 22px;
                }}

                .gift-item .price {{
                    font-size: 9px;
                }}

                .chat-messages {{
                    height: 120px;
                }}
            }}

            /* Mobile Small (< 480px) */
            @media (max-width: 479px) {{
                .main-content {{
                    padding: 10px;
                    padding-bottom: 80px;
                }}

                .content-header {{
                    padding: 14px;
                    margin-bottom: 12px;
                    border-radius: 10px;
                }}

                .content-header h1 {{
                    font-size: 18px;
                }}

                .content-header p {{
                    font-size: 12px;
                }}

                .provider-banner {{
                    flex-direction: column;
                    gap: 12px;
                    align-items: flex-start;
                    padding: 14px;
                    border-radius: 10px;
                    margin-bottom: 12px;
                }}

                .provider-banner h2 {{
                    font-size: 16px;
                }}

                .provider-stats {{
                    width: 100%;
                    justify-content: space-around;
                }}

                .provider-stat .val {{
                    font-size: 15px;
                }}

                .provider-stat .lbl {{
                    font-size: 10px;
                }}

                .search-bar {{
                    margin-bottom: 12px;
                }}

                .search-input {{
                    padding: 10px 12px;
                    font-size: 13px;
                    border-radius: 8px;
                }}

                .category-tabs {{
                    gap: 6px;
                    margin-bottom: 12px;
                    -webkit-overflow-scrolling: touch;
                }}

                .category-tab {{
                    padding: 6px 12px;
                    font-size: 11px;
                    border-radius: 16px;
                }}

                .game-grid {{
                    grid-template-columns: repeat(2, 1fr);
                    gap: 8px;
                }}

                .game-card {{
                    border-radius: 10px;
                }}

                .game-thumb {{
                    font-size: 36px;
                    aspect-ratio: 1/1;
                }}

                .game-overlay .play-btn {{
                    padding: 8px 18px;
                    font-size: 12px;
                }}

                .game-badges {{
                    top: 6px;
                    left: 6px;
                }}

                .game-badge {{
                    padding: 2px 6px;
                    font-size: 9px;
                }}

                .game-info {{
                    padding: 7px 8px;
                }}

                .game-info h4 {{
                    font-size: 11px;
                    margin-bottom: 2px;
                }}

                .game-info .game-provider {{
                    font-size: 9px;
                }}

                .rtp-bar {{
                    margin-top: 4px;
                    gap: 4px;
                }}

                .rtp-track {{
                    height: 3px;
                }}

                .rtp-label {{
                    font-size: 8px;
                    min-width: 32px;
                }}

                /* Floating elements - full width */
                .floating-player {{
                    left: 6px;
                    right: 6px;
                    bottom: 6px;
                    width: auto;
                    border-radius: 12px;
                }}

                .floating-player.expanded {{
                    width: auto;
                }}

                .floating-player.minimized {{
                    width: auto;
                    left: auto;
                    right: 6px;
                    width: 220px;
                }}

                .player-header {{
                    padding: 10px 12px;
                }}

                .player-title span {{
                    font-size: 13px;
                }}

                .player-controls {{
                    gap: 4px;
                }}

                .player-controls button {{
                    padding: 4px;
                    font-size: 14px;
                }}

                .stream-info-bar {{
                    padding: 10px 12px;
                }}

                .stream-info-bar h4 {{
                    font-size: 13px;
                }}

                .change-stream-btn {{
                    padding: 8px;
                    font-size: 12px;
                }}

                .player-actions {{
                    padding: 10px 12px;
                    gap: 8px;
                }}

                .action-btn {{
                    padding: 10px 12px;
                    font-size: 13px;
                    border-radius: 8px;
                }}

                .action-btn .icon {{
                    font-size: 16px;
                }}

                .stream-list-popup {{
                    left: 6px;
                    right: 6px;
                    bottom: 60px;
                    width: auto;
                    max-height: 400px;
                    border-radius: 12px;
                }}

                .popup-header {{
                    padding: 12px 16px;
                }}

                .popup-header h3 {{
                    font-size: 14px;
                }}

                .stream-item {{
                    padding: 10px 14px;
                    gap: 10px;
                }}

                .stream-thumb {{
                    width: 40px;
                    height: 40px;
                    font-size: 20px;
                    border-radius: 8px;
                }}

                .stream-info h4 {{
                    font-size: 13px;
                }}

                .stream-meta {{
                    font-size: 11px;
                }}

                .floating-live-btn {{
                    padding: 10px 16px;
                    font-size: 12px;
                    gap: 8px;
                    right: 10px;
                    bottom: 10px;
                    border-radius: 40px;
                }}

                .chat-panel {{
                    padding: 12px;
                }}

                .chat-messages {{
                    height: 100px;
                }}

                .chat-message .username {{
                    font-size: 11px;
                }}

                .chat-message .text {{
                    font-size: 12px;
                }}

                .chat-input {{
                    padding: 8px 10px;
                    font-size: 12px;
                }}

                .chat-send-btn {{
                    padding: 8px 12px;
                    font-size: 12px;
                }}

                .gift-panel {{
                    padding: 12px;
                }}

                .gift-panel h4 {{
                    font-size: 13px;
                    margin-bottom: 10px;
                }}

                .gift-grid {{
                    grid-template-columns: repeat(4, 1fr);
                    gap: 6px;
                }}

                .gift-item {{
                    padding: 8px 4px;
                    border-radius: 8px;
                }}

                .gift-item .emoji {{
                    font-size: 20px;
                    margin-bottom: 4px;
                }}

                .gift-item .price {{
                    font-size: 8px;
                }}
            }}

            /* Touch device optimizations */
            @media (hover: none) {{
                .game-card:hover {{
                    transform: none;
                    box-shadow: none;
                }}

                .game-overlay {{
                    opacity: 1;
                    background: rgba(0,0,0,0.3);
                }}

                .game-card:active {{
                    transform: scale(0.97);
                }}

                .floating-live-btn:hover {{
                    transform: none;
                }}

                .floating-live-btn:active {{
                    transform: scale(0.95);
                }}
            }}
        </style>
    </head>
    <body>
        <!-- Main Content - Pragmatic Play Games -->
        <div class="main-content">
            <div class="content-header">
                <h1>🎰 Pragmatic Play Games</h1>
                <p>Koleksi lengkap game slot dan live casino terpopuler dari Pragmatic Play</p>
            </div>

            <!-- Provider Banner -->
            <div class="provider-banner">
                <div>
                    <h2>⚡ Pragmatic Play</h2>
                    <p style="color:#8b9caa; font-size:13px; margin-top:4px;">Premium Game Provider</p>
                </div>
                <div class="provider-stats">
                    <div class="provider-stat">
                        <div class="val">300+</div>
                        <div class="lbl">Games</div>
                    </div>
                    <div class="provider-stat">
                        <div class="val">96.5%</div>
                        <div class="lbl">Avg RTP</div>
                    </div>
                    <div class="provider-stat">
                        <div class="val">🔥</div>
                        <div class="lbl">#1 Provider</div>
                    </div>
                </div>
            </div>

            <!-- Search -->
            <div class="search-bar">
                <input type="text" class="search-input" placeholder="🔍 Cari game Pragmatic Play..." id="gameSearch" oninput="filterGames()">
            </div>

            <!-- Category Tabs -->
            <div class="category-tabs">
                <button class="category-tab active" onclick="filterCategory('all', this)">🎮 Semua</button>
                <button class="category-tab" onclick="filterCategory('hot', this)">🔥 Popular</button>
                <button class="category-tab" onclick="filterCategory('new', this)">✨ Baru</button>
                <button class="category-tab" onclick="filterCategory('jackpot', this)">💰 Jackpot</button>
                <button class="category-tab" onclick="filterCategory('slot', this)">🎰 Slots</button>
                <button class="category-tab" onclick="filterCategory('live', this)">🎥 Live Casino</button>
                <button class="category-tab" onclick="filterCategory('table', this)">♠️ Table Games</button>
            </div>

            <!-- Game Grid -->
            <div class="game-grid" id="gameGrid">
            </div>
        </div>

        <!-- Floating Live Button -->
        <button class="floating-live-btn" id="liveBtn" onclick="toggleStreamList()">
            <span class="live-dot"></span>
            <span>📺 Live Stream</span>
            <span style="background: #0f1923; padding: 4px 8px; border-radius: 20px; font-size: 12px;">6</span>
        </button>

        <!-- Stream List Popup -->
        <div class="stream-list-popup" id="streamListPopup">
            <div class="popup-header">
                <h3><span>📺</span> Live Streams</h3>
                <button class="close-btn" onclick="toggleStreamList()">✕</button>
            </div>
            <div class="stream-list" id="streamList">
                <!-- Stream items will be inserted here -->
            </div>
        </div>

        <!-- Floating Video Player -->
        <div class="floating-player" id="floatingPlayer">
            <div class="player-header">
                <div class="player-title">
                    <span class="icon">📺</span>
                    <span id="playerTitle">Live Stream</span>
                </div>
                <div class="player-controls">
                    <button onclick="togglePlayerSize()" title="Resize">⬜</button>
                    <button onclick="minimizePlayer()" title="Minimize">➖</button>
                    <button onclick="closePlayer()" title="Close">✕</button>
                </div>
            </div>

            <div class="video-container" id="videoContainer">
                <iframe id="videoIframe" src="" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
                <div class="video-overlay">
                    <div class="live-indicator">
                        <span class="dot"></span>
                        LIVE
                    </div>
                    <div class="viewer-count" id="viewerCount">
                        👁 0 viewers
                    </div>
                </div>
            </div>

            <div class="stream-info-bar">
                <h4 id="streamTitle">Select a stream</h4>
                <div class="meta" id="streamMeta">Category • 0 watching</div>
            </div>

            <button class="change-stream-btn" onclick="showStreamSelector()">
                📋 Change Stream
            </button>

            <div class="player-actions">
                <button class="action-btn chat-btn" onclick="toggleChat()">
                    <span class="icon">💬</span>
                    Chat
                </button>
                <button class="action-btn gift-btn" onclick="toggleGift()">
                    <span class="icon">🎁</span>
                    Send Gift
                </button>
            </div>

            <!-- Chat Panel -->
            <div class="chat-panel" id="chatPanel">
                <div class="chat-messages" id="chatMessages">
                    <div class="chat-message">
                        <div class="username">@sportsfan123</div>
                        <div class="text">Great match! 🔥</div>
                    </div>
                    <div class="chat-message">
                        <div class="username">@betmaster</div>
                        <div class="text">Who's winning?</div>
                    </div>
                    <div class="chat-message">
                        <div class="username">@luckygamer</div>
                        <div class="text">Let's gooo! 🚀</div>
                    </div>
                </div>
                <div class="chat-input-container">
                    <input type="text" class="chat-input" placeholder="Type a message..." id="chatInput">
                    <button class="chat-send-btn" onclick="sendMessage()">Send</button>
                </div>
            </div>

            <!-- Gift Panel -->
            <div class="gift-panel" id="giftPanel">
                <h4>Send a Gift 🎁</h4>
                <div class="gift-grid">
                    <div class="gift-item" onclick="sendGift('❤️', 100)">
                        <div class="emoji">❤️</div>
                        <div class="price">100 coins</div>
                    </div>
                    <div class="gift-item" onclick="sendGift('⭐', 500)">
                        <div class="emoji">⭐</div>
                        <div class="price">500 coins</div>
                    </div>
                    <div class="gift-item" onclick="sendGift('🎉', 1000)">
                        <div class="emoji">🎉</div>
                        <div class="price">1K coins</div>
                    </div>
                    <div class="gift-item" onclick="sendGift('💎', 5000)">
                        <div class="emoji">💎</div>
                        <div class="price">5K coins</div>
                    </div>
                    <div class="gift-item" onclick="sendGift('🚀', 10000)">
                        <div class="emoji">🚀</div>
                        <div class="price">10K coins</div>
                    </div>
                    <div class="gift-item" onclick="sendGift('👑', 50000)">
                        <div class="emoji">👑</div>
                        <div class="price">50K coins</div>
                    </div>
                    <div class="gift-item" onclick="sendGift('🏆', 100000)">
                        <div class="emoji">🏆</div>
                        <div class="price">100K coins</div>
                    </div>
                    <div class="gift-item" onclick="sendGift('💰', 500000)">
                        <div class="emoji">💰</div>
                        <div class="price">500K coins</div>
                    </div>
                </div>
            </div>
        </div>

        <script>
            const streams = {streams_json};
            let currentStream = null;
            let isExpanded = false;
            let isMinimized = false;
            let currentCategory = 'all';

            // Pragmatic Play Games Data
            const games = [
                {{ id: 'g1',  name: 'Gates of Olympus',         emoji: '⚡', bg: 'linear-gradient(135deg,#4a1a8a,#7b2ff7)', rtp: 96.50, category: 'slot', badge: 'hot' }},
                {{ id: 'g2',  name: 'Sweet Bonanza',            emoji: '🍬', bg: 'linear-gradient(135deg,#e91e8c,#ff6bcb)', rtp: 96.48, category: 'slot', badge: 'hot' }},
                {{ id: 'g3',  name: 'Starlight Princess',       emoji: '👸', bg: 'linear-gradient(135deg,#1a3a8a,#5b8fff)', rtp: 96.50, category: 'slot', badge: 'hot' }},
                {{ id: 'g4',  name: 'Sugar Rush',               emoji: '🧁', bg: 'linear-gradient(135deg,#ff6b9d,#ff9a76)', rtp: 96.50, category: 'slot', badge: 'new' }},
                {{ id: 'g5',  name: 'The Dog House',            emoji: '🐕', bg: 'linear-gradient(135deg,#2e7d32,#66bb6a)', rtp: 96.51, category: 'slot', badge: '' }},
                {{ id: 'g6',  name: 'Big Bass Bonanza',         emoji: '🎣', bg: 'linear-gradient(135deg,#0277bd,#4fc3f7)', rtp: 96.71, category: 'slot', badge: 'hot' }},
                {{ id: 'g7',  name: 'Wolf Gold',                emoji: '🐺', bg: 'linear-gradient(135deg,#bf360c,#ff7043)', rtp: 96.01, category: 'slot', badge: 'jackpot' }},
                {{ id: 'g8',  name: 'Great Rhino Megaways',     emoji: '🦏', bg: 'linear-gradient(135deg,#8d6e00,#ffd54f)', rtp: 96.58, category: 'slot', badge: 'jackpot' }},
                {{ id: 'g9',  name: 'Madame Destiny Megaways',  emoji: '🔮', bg: 'linear-gradient(135deg,#4a148c,#ab47bc)', rtp: 96.56, category: 'slot', badge: '' }},
                {{ id: 'g10', name: 'Fruit Party',              emoji: '🍓', bg: 'linear-gradient(135deg,#ad1457,#ec407a)', rtp: 96.47, category: 'slot', badge: '' }},
                {{ id: 'g11', name: 'Gates of Olympus 1000',    emoji: '🏛️', bg: 'linear-gradient(135deg,#311b92,#7c4dff)', rtp: 96.50, category: 'slot', badge: 'new' }},
                {{ id: 'g12', name: 'Sweet Bonanza Xmas',       emoji: '🎄', bg: 'linear-gradient(135deg,#b71c1c,#ef5350)', rtp: 96.48, category: 'slot', badge: '' }},
                {{ id: 'g13', name: 'Gems Bonanza',             emoji: '💎', bg: 'linear-gradient(135deg,#0d47a1,#42a5f5)', rtp: 96.51, category: 'slot', badge: '' }},
                {{ id: 'g14', name: 'Wild West Gold',           emoji: '🤠', bg: 'linear-gradient(135deg,#e65100,#ff9800)', rtp: 96.51, category: 'slot', badge: '' }},
                {{ id: 'g15', name: 'Aztec Gems',               emoji: '🗿', bg: 'linear-gradient(135deg,#1b5e20,#4caf50)', rtp: 96.52, category: 'slot', badge: 'jackpot' }},
                {{ id: 'g16', name: 'Power of Thor Megaways',   emoji: '🔨', bg: 'linear-gradient(135deg,#1a237e,#536dfe)', rtp: 96.55, category: 'slot', badge: '' }},
                {{ id: 'g17', name: 'Lucky Lightning',          emoji: '⚡', bg: 'linear-gradient(135deg,#f57f17,#ffee58)', rtp: 96.45, category: 'slot', badge: '' }},
                {{ id: 'g18', name: 'Pyramid Bonanza',          emoji: '🏺', bg: 'linear-gradient(135deg,#bf8c00,#ffe082)', rtp: 96.50, category: 'slot', badge: 'new' }},
                {{ id: 'g19', name: 'Mega Sic Bo',              emoji: '🎲', bg: 'linear-gradient(135deg,#880e4f,#f06292)', rtp: 97.22, category: 'live', badge: 'hot' }},
                {{ id: 'g20', name: 'Live Roulette',            emoji: '🎡', bg: 'linear-gradient(135deg,#1b5e20,#43a047)', rtp: 97.30, category: 'live', badge: '' }},
                {{ id: 'g21', name: 'Speed Baccarat',           emoji: '🃏', bg: 'linear-gradient(135deg,#b71c1c,#e53935)', rtp: 98.76, category: 'live', badge: 'hot' }},
                {{ id: 'g22', name: 'Live Blackjack',           emoji: '♠️', bg: 'linear-gradient(135deg,#212121,#616161)', rtp: 99.28, category: 'live', badge: '' }},
                {{ id: 'g23', name: 'Dragon Tiger',             emoji: '🐉', bg: 'linear-gradient(135deg,#c62828,#ff5252)', rtp: 96.27, category: 'live', badge: '' }},
                {{ id: 'g24', name: 'Boom City',                emoji: '💥', bg: 'linear-gradient(135deg,#ff6f00,#ffa726)', rtp: 96.10, category: 'live', badge: 'new' }},
                {{ id: 'g25', name: 'Sweet Bonanza CandyLand',  emoji: '🍭', bg: 'linear-gradient(135deg,#d81b60,#f48fb1)', rtp: 96.53, category: 'live', badge: '' }},
                {{ id: 'g26', name: 'Baccarat',                 emoji: '💳', bg: 'linear-gradient(135deg,#4e342e,#8d6e63)', rtp: 98.76, category: 'table', badge: '' }},
                {{ id: 'g27', name: 'European Roulette',        emoji: '🟢', bg: 'linear-gradient(135deg,#2e7d32,#81c784)', rtp: 97.30, category: 'table', badge: '' }},
                {{ id: 'g28', name: 'Multihand Blackjack',      emoji: '🂡', bg: 'linear-gradient(135deg,#263238,#607d8b)', rtp: 99.54, category: 'table', badge: '' }},
                {{ id: 'g29', name: 'Spaceman',                 emoji: '🚀', bg: 'linear-gradient(135deg,#0d0d2b,#1a1a5e)', rtp: 96.50, category: 'slot', badge: 'hot' }},
                {{ id: 'g30', name: 'Cash Bonanza',             emoji: '💵', bg: 'linear-gradient(135deg,#1b5e20,#a5d6a7)', rtp: 96.50, category: 'slot', badge: '' }},
            ];

            // Render games
            function renderGames(filteredGames) {{
                const grid = document.getElementById('gameGrid');
                grid.innerHTML = filteredGames.map(game => `
                    <div class="game-card" data-category="${{game.category}}" data-badge="${{game.badge}}" data-name="${{game.name.toLowerCase()}}">
                        <div class="game-thumb" style="background: ${{game.bg}};">
                            <span>${{game.emoji}}</span>
                            ${{game.badge ? `
                            <div class="game-badges">
                                <span class="game-badge badge-${{game.badge}}">${{
                                    game.badge === 'hot' ? '🔥 HOT' :
                                    game.badge === 'new' ? '✨ NEW' :
                                    '💰 JACKPOT'
                                }}</span>
                            </div>` : ''}}
                            <div class="game-overlay">
                                <button class="play-btn">▶ PLAY</button>
                            </div>
                        </div>
                        <div class="game-info">
                            <h4>${{game.name}}</h4>
                            <div class="game-provider">Pragmatic Play</div>
                            <div class="rtp-bar">
                                <div class="rtp-track">
                                    <div class="rtp-fill" style="width: ${{game.rtp}}%;"></div>
                                </div>
                                <span class="rtp-label">${{game.rtp.toFixed(2)}}%</span>
                            </div>
                        </div>
                    </div>
                `).join('');
            }}

            function filterCategory(category, el) {{
                currentCategory = category;
                document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
                if (el) el.classList.add('active');
                applyFilters();
            }}

            function filterGames() {{
                applyFilters();
            }}

            function applyFilters() {{
                const search = document.getElementById('gameSearch').value.toLowerCase();
                let filtered = games;

                if (currentCategory !== 'all') {{
                    if (['slot','live','table'].includes(currentCategory)) {{
                        filtered = filtered.filter(g => g.category === currentCategory);
                    }} else {{
                        filtered = filtered.filter(g => g.badge === currentCategory);
                    }}
                }}

                if (search) {{
                    filtered = filtered.filter(g => g.name.toLowerCase().includes(search));
                }}

                renderGames(filtered);
            }}

            // Initialize stream list
            function initStreamList() {{
                const listContainer = document.getElementById('streamList');
                listContainer.innerHTML = streams.map(stream => `
                    <div class="stream-item" onclick="selectStream('${{stream.id}}')">
                        <div class="stream-thumb">${{stream.thumbnail}}</div>
                        <div class="stream-info">
                            <h4>${{stream.title}}</h4>
                            <div class="stream-meta">
                                ${{stream.is_live ? '<span class="live-badge">LIVE</span>' : ''}}
                                <span class="viewers">👁 ${{stream.viewers.toLocaleString()}}</span>
                                <span>${{stream.category}}</span>
                            </div>
                        </div>
                    </div>
                `).join('');
            }}

            function toggleStreamList() {{
                const popup = document.getElementById('streamListPopup');
                const btn = document.getElementById('liveBtn');
                popup.classList.toggle('show');
            }}

            function selectStream(streamId) {{
                const stream = streams.find(s => s.id === streamId);
                if (!stream) return;

                currentStream = stream;

                // Update player
                document.getElementById('videoIframe').src = stream.url;
                document.getElementById('playerTitle').textContent = stream.title;
                document.getElementById('streamTitle').textContent = stream.title;
                document.getElementById('streamMeta').textContent = `${{stream.category}} • ${{stream.viewers.toLocaleString()}} watching`;
                document.getElementById('viewerCount').textContent = `👁 ${{stream.viewers.toLocaleString()}} viewers`;

                // Show player, hide list
                document.getElementById('floatingPlayer').classList.add('show');
                document.getElementById('streamListPopup').classList.remove('show');
                document.getElementById('liveBtn').classList.add('hidden');

                // Reset panels
                document.getElementById('chatPanel').classList.remove('show');
                document.getElementById('giftPanel').classList.remove('show');
            }}

            function showStreamSelector() {{
                document.getElementById('streamListPopup').classList.add('show');
            }}

            function closePlayer() {{
                document.getElementById('floatingPlayer').classList.remove('show');
                document.getElementById('liveBtn').classList.remove('hidden');
                document.getElementById('videoIframe').src = '';
                currentStream = null;
            }}

            function minimizePlayer() {{
                const player = document.getElementById('floatingPlayer');
                isMinimized = !isMinimized;
                player.classList.toggle('minimized', isMinimized);
            }}

            function togglePlayerSize() {{
                const player = document.getElementById('floatingPlayer');
                isExpanded = !isExpanded;
                player.classList.toggle('expanded', isExpanded);
            }}

            function toggleChat() {{
                const chatPanel = document.getElementById('chatPanel');
                const giftPanel = document.getElementById('giftPanel');
                giftPanel.classList.remove('show');
                chatPanel.classList.toggle('show');
            }}

            function toggleGift() {{
                const chatPanel = document.getElementById('chatPanel');
                const giftPanel = document.getElementById('giftPanel');
                chatPanel.classList.remove('show');
                giftPanel.classList.toggle('show');
            }}

            function sendMessage() {{
                const input = document.getElementById('chatInput');
                const message = input.value.trim();
                if (!message) return;

                const messagesContainer = document.getElementById('chatMessages');
                const newMessage = document.createElement('div');
                newMessage.className = 'chat-message';
                newMessage.innerHTML = `
                    <div class="username">@you</div>
                    <div class="text">${{message}}</div>
                `;
                messagesContainer.appendChild(newMessage);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                input.value = '';
            }}

            function sendGift(emoji, amount) {{
                alert(`Gift sent: ${{emoji}} (${{amount.toLocaleString()}} coins)`);

                // Add to chat
                const messagesContainer = document.getElementById('chatMessages');
                const newMessage = document.createElement('div');
                newMessage.className = 'chat-message';
                newMessage.innerHTML = `
                    <div class="username" style="color: #ff6b6b;">@you sent a gift!</div>
                    <div class="text" style="font-size: 24px;">${{emoji}}</div>
                `;
                messagesContainer.appendChild(newMessage);

                // Show chat panel
                document.getElementById('giftPanel').classList.remove('show');
                document.getElementById('chatPanel').classList.add('show');
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }}

            // Handle enter key for chat
            document.addEventListener('DOMContentLoaded', function() {{
                initStreamList();
                renderGames(games);

                document.getElementById('chatInput').addEventListener('keypress', function(e) {{
                    if (e.key === 'Enter') {{
                        sendMessage();
                    }}
                }});
            }});
        </script>
    </body>
    </html>
    """

    return html_content

def main():
    # Hide Streamlit UI elements
    st.markdown("""
        <style>
            #MainMenu {visibility: hidden;}
            footer {visibility: hidden;}
            .stApp > header {visibility: hidden;}
            .block-container {
                padding: 0 !important;
                max-width: 100% !important;
            }
            iframe {
                border: none !important;
            }
        </style>
    """, unsafe_allow_html=True)

    # Render the full-page Stake-style interface
    components.html(render_stake_style_player(), height=900, scrolling=True)

if __name__ == "__main__":
    main()
