import os
import time
from playwright.sync_api import sync_playwright

OUTPUT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "docs", "screenshots"))
os.makedirs(OUTPUT_DIR, exist_ok=True)

BASE_URL = "http://localhost:5173"

def capture_all():
    print(f"Saving responsive screenshots to: {OUTPUT_DIR}")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        
        # 1. Native Mobile View (iPhone 13/14 size: 390x844)
        mobile_context = browser.new_context(viewport={"width": 390, "height": 844}, device_scale_factor=2)
        page = mobile_context.new_page()

        screens = [
            {"name": "01_home_mobile.png", "url": "/home"},
            {"name": "02_login_empty_mobile.png", "url": "/login"},
            {"name": "03_register_mobile.png", "url": "/register"},
            {"name": "04_upload_hub_mobile.png", "url": "/upload"},
            {"name": "05_upload_form_mobile.png", "url": "/upload-form"},
            {"name": "06_search_mobile.png", "url": "/search"},
            {"name": "07_history_mobile.png", "url": "/history"},
            {"name": "08_article_detail_mobile.png", "url": "/article/1"},
        ]

        for s in screens:
            page.goto(f"{BASE_URL}{s['url']}", wait_until="networkidle")
            time.sleep(0.4)
            page.screenshot(path=os.path.join(OUTPUT_DIR, s['name']))
            print(f"Captured {s['name']}")

        # Capture Login Filled
        page.goto(f"{BASE_URL}/login", wait_until="networkidle")
        page.fill('input[placeholder="Enter your username"]', "Glen")
        page.fill('input[placeholder="Enter your password"]', "Besar123")
        time.sleep(0.3)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "02b_login_filled_mobile.png"))
        print("Captured 02b_login_filled_mobile.png")

        # Capture Register Filled
        page.goto(f"{BASE_URL}/register", wait_until="networkidle")
        page.fill('input[placeholder="Enter your username"]', "Glen")
        page.fill('input[placeholder="Enter your password"]', "Besar123")
        page.fill('input[placeholder="Re-enter your password"]', "Besar123")
        time.sleep(0.3)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "03b_register_filled_mobile.png"))
        print("Captured 03b_register_filled_mobile.png")

        # Capture Drawer opened on Upload Hub
        page.goto(f"{BASE_URL}/upload", wait_until="networkidle")
        page.click('button[title="Buka Menu Navigasi"]')
        time.sleep(0.5)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "04b_upload_drawer_mobile.png"))
        print("Captured 04b_upload_drawer_mobile.png")

        # Capture Upload Modal 1: Apakah ingin meringkas?
        page.goto(f"{BASE_URL}/upload-form", wait_until="networkidle")
        page.click('button:has-text("Upload Journal")')
        time.sleep(0.4)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "05b_upload_modal_confirm_mobile.png"))
        print("Captured 05b_upload_modal_confirm_mobile.png")

        # Capture Upload Modal 2: Jurnal sudah teringkas. Tampilkan?
        page.locator('.animate-modal button:text-is("Ya")').click()
        time.sleep(0.4)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "05c_upload_modal_result_mobile.png"))
        print("Captured 05c_upload_modal_result_mobile.png")

        # Capture Search Modal
        page.goto(f"{BASE_URL}/search", wait_until="networkidle")
        page.click('h3:has-text("Fundamental to sahrul")')
        time.sleep(0.4)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "06b_search_modal_confirm_mobile.png"))
        print("Captured 06b_search_modal_confirm_mobile.png")

        # Capture History Modal
        page.goto(f"{BASE_URL}/history", wait_until="networkidle")
        page.click('button[title="Unduh Jurnal"]')
        time.sleep(0.4)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "07b_history_modal_download_mobile.png"))
        print("Captured 07b_history_modal_download_mobile.png")

        # Capture History Modal Success
        page.locator('.animate-modal button:text-is("Ya")').click()
        time.sleep(0.4)
        page.screenshot(path=os.path.join(OUTPUT_DIR, "07c_history_modal_success_mobile.png"))
        print("Captured 07c_history_modal_success_mobile.png")

        mobile_context.close()

        # 2. Native Desktop Responsive View (1280x800)
        desktop_context = browser.new_context(viewport={"width": 1280, "height": 800}, device_scale_factor=1.5)
        d_page = desktop_context.new_page()

        desktop_screens = [
            {"name": "10_desktop_login.png", "url": "/login"},
            {"name": "11_desktop_upload_hub.png", "url": "/upload"},
            {"name": "12_desktop_search.png", "url": "/search"},
            {"name": "13_desktop_history.png", "url": "/history"},
            {"name": "14_desktop_home.png", "url": "/home"},
        ]

        for ds in desktop_screens:
            d_page.goto(f"{BASE_URL}{ds['url']}", wait_until="networkidle")
            time.sleep(0.4)
            d_page.screenshot(path=os.path.join(OUTPUT_DIR, ds['name']))
            print(f"Captured {ds['name']}")

        desktop_context.close()
        browser.close()
        print("All native responsive screenshots successfully captured!")

if __name__ == "__main__":
    capture_all()
