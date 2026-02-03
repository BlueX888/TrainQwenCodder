const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局信号对象
window.__signals__ = {
  objectsCreated: 0,
  shakingStarted: false,
  shakingCompleted: false,
  completedObjects: 0,
  timestamp: Date.now()
};

function preload() {
  // 创建8个不同颜色的纹理
  const colors = [
    0xff0000, // 红色
    0x00ff00, // 绿色
    0x0000ff, // 蓝色
    0xffff00, // 黄色
    0xff00ff, // 品红
    0x00ffff, // 青色
    0xff8800, // 橙色
    0x8800ff  // 紫色
  ];

  colors.forEach((color, index) => {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillRect(0, 0, 64, 64);
    graphics.generateTexture(`box${index}`, 64, 64);
    graphics.destroy();
  });

  console.log('[PRELOAD] 8 textures generated');
}

function create() {
  const objects = [];
  const gridCols = 4;
  const gridRows = 2;
  const startX = 150;
  const startY = 200;
  const spacingX = 150;
  const spacingY = 150;

  // 创建8个物体
  for (let i = 0; i < 8; i++) {
    const col = i % gridCols;
    const row = Math.floor(i / gridCols);
    const x = startX + col * spacingX;
    const y = startY + row * spacingY;

    const sprite = this.add.sprite(x, y, `box${i}`);
    sprite.setOrigin(0.5);
    sprite.name = `object_${i}`;
    objects.push(sprite);

    window.__signals__.objectsCreated++;
  }

  console.log(`[CREATE] ${objects.length} objects created at positions`);

  // 添加文本提示
  const text = this.add.text(400, 50, 'Shaking Animation - 1 Second', {
    fontSize: '28px',
    color: '#ffffff',
    fontStyle: 'bold'
  });
  text.setOrigin(0.5);

  const statusText = this.add.text(400, 100, 'Status: Ready', {
    fontSize: '20px',
    color: '#00ff00'
  });
  statusText.setOrigin(0.5);

  // 延迟0.5秒后开始抖动动画
  this.time.delayedCall(500, () => {
    window.__signals__.shakingStarted = true;
    statusText.setText('Status: Shaking...');
    statusText.setColor('#ffff00');

    console.log('[ANIMATION] Shake animation started');

    // 为每个物体创建抖动动画
    objects.forEach((sprite, index) => {
      const originalX = sprite.x;
      const originalY = sprite.y;

      // 创建抖动 Tween
      const shakeTween = this.tweens.add({
        targets: sprite,
        x: {
          from: originalX - 10,
          to: originalX + 10
        },
        y: {
          from: originalY - 10,
          to: originalY + 10
        },
        duration: 50, // 每次抖动50ms
        yoyo: true,
        repeat: 9, // 重复9次，总共10次往返 = 1秒
        ease: 'Sine.easeInOut',
        onComplete: () => {
          // 恢复原始位置
          sprite.setPosition(originalX, originalY);
          window.__signals__.completedObjects++;

          console.log(`[ANIMATION] Object ${index} shake completed`);

          // 如果所有物体都完成了
          if (window.__signals__.completedObjects === 8) {
            window.__signals__.shakingCompleted = true;
            statusText.setText('Status: Completed');
            statusText.setColor('#00ff00');

            console.log('[ANIMATION] All objects shake completed');
            console.log('[SIGNALS]', JSON.stringify(window.__signals__, null, 2));
          }
        }
      });
    });
  });
}

function update(time, delta) {
  // 可以在这里添加实时状态更新逻辑
}

// 启动游戏
new Phaser.Game(config);

// 输出初始信号
console.log('[INIT] Game initialized with signals:', window.__signals__);