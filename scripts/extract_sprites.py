from PIL import Image
import numpy as np
from collections import deque

img = Image.open('C:/dev/project/Hopit/토끼와 거북이.jpg').convert('RGB')
arr = np.array(img)

def extract_sprite(arr, x1, y1, x2, y2, tolerance=35, padding=8):
    """BFS flood fill로 배경 제거 후 투명 PNG 반환"""
    crop = arr[y1:y2, x1:x2].copy()
    h, w = crop.shape[:2]
    alpha = np.full((h, w), 255, dtype=np.uint8)

    # 네 모서리 색상을 배경 seed로 사용
    seeds = [
        crop[0, 0].astype(int),
        crop[0, w-1].astype(int),
        crop[h-1, 0].astype(int),
        crop[h-1, w-1].astype(int),
    ]

    visited = np.zeros((h, w), dtype=bool)
    queue = deque()

    # 모든 테두리 픽셀을 시작점으로
    for x in range(w):
        queue.append((0, x))
        queue.append((h-1, x))
    for y in range(1, h-1):
        queue.append((y, 0))
        queue.append((y, w-1))

    while queue:
        y, x = queue.popleft()
        if x < 0 or x >= w or y < 0 or y >= h:
            continue
        if visited[y, x]:
            continue
        visited[y, x] = True

        pixel = crop[y, x].astype(int)

        # seed 색상과 유사하면 배경으로 판단
        is_bg = any(np.max(np.abs(pixel - s)) <= tolerance for s in seeds)

        if is_bg:
            alpha[y, x] = 0
            for dy, dx in [(-1,0),(1,0),(0,-1),(0,1)]:
                ny, nx = y+dy, x+dx
                if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                    queue.append((ny, nx))

    rgba = np.dstack([crop, alpha])
    return Image.fromarray(rgba.astype(np.uint8), 'RGBA')


# ── 토끼 추출 ─────────────────────────────
rabbit = extract_sprite(arr, x1=115, y1=375, x2=235, y2=465, tolerance=38)
rabbit.save('C:/dev/project/Hopit/assets/rabbit.png')
print(f'토끼 저장 완료: {rabbit.size}')

# ── 거북이 추출 ───────────────────────────
turtle = extract_sprite(arr, x1=447, y1=387, x2=575, y2=467, tolerance=38)
turtle.save('C:/dev/project/Hopit/assets/turtle.png')
print(f'거북이 저장 완료: {turtle.size}')

# ── 트랙 배경만 추출 (캐릭터 없는 영역) ──
print('완료!')
