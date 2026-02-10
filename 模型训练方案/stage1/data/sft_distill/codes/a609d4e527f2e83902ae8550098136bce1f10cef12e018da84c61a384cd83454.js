const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: { preload, create, update }
};

// 全局信号对象
window.__signals__ = {
  animationStarted: false,
  animationCompleted: false,
  objectCount: 8,
  shakeDuration: 1000,
  activeObjects: []
};

function preload() {
  // 使用 Graphics 创建8个不同颜色的圆形纹理
  const colors = [
    0xff0000, // 红
    0x00ff00, // 绿
    0x0000ff, // 蓝
    0xffff00, // 黄
    0xff00ff, // 品红
    0x00ffff, // 青
    0xff8800, // 橙
    0x8800ff  // 紫
  ];

  colors.forEach((color, index) => {
    const graphics = this.add.graphics();
    graphics.fillStyle(color, 1);
    graphics.fillCircle(25, 25, 25);
    graphics.generateTexture(`circle${index}`, 50, 50);
    graphics.destroy();
  });
}

function create() {
  const objects = [];
  const startX = 200;
  const startY = 200;
  const spacingX = 120;
  const spacingY = 120;

  // 创建8个物体，排列成2行4列
  for (let i = 0; i < 8; i++) {
    const row = Math.floor(i / 4);
    const col = i % 4;
    const x = startX + col * spacingX;
    const y = startY + row * spacingY;

    const sprite = this.add.sprite(x, y, `circle${i}`);
    sprite.setData('originalX', x);
    sprite.setData('originalY', y);
    sprite.setData('index', i);
    
    objects.push(sprite);
    
    // 记录到信号对象
    window.__signals__.activeObjects.push({
      index: i,
      x: x,
      y: y,
      color: `circle${i}`
    });
  }

  // 添加标题文本
  const title = this.add.text(400, 50, '8 Objects Synchronized Shake', {
    fontSize: '28px',
    fontFamily: 'Arial',
    color: '#ffffff'
  });
  title.setOrigin(0.5);

  // 状态文本
  const statusText = this.add.text(400, 500, 'Animation will start in 0.5s...', {
    fontSize: '20px',
    fontFamily: 'Arial',
    color: '#ffff00'
  });
  statusText.setOrigin(0.5);

  // 延迟0.5秒后开始抖动动画
  this.time.delayedCall(500, () => {
    window.__signals__.animationStarted = true;
    window.__signals__.startTime = Date.now();
    statusText.setText('Shaking...');
    
    console.log(JSON.stringify({
      event: 'animation_started',
      timestamp: Date.now(),
      objectCount: 8
    }));

    // 为所有物体创建同步抖动动画
    objects.forEach((sprite, index) => {
      const originalX = sprite.getData('originalX');
      const originalY = sprite.getData('originalY');

      // 创建抖动时间轴
      this.tweens.timeline({
        targets: sprite,
        duration: 1000,
        ease: 'Linear',
        repeat: 0,
        tweens: [
          {
            x: originalX + Phaser.Math.Between(-15, 15),
            y: originalY + Phaser.Math.Between(-15, 15),
            duration: 50
          },
          {
            x: originalX + Phaser.Math.Between(-15, 15),
            y: originalY + Phaser.Math.Between(-15, 15),
            duration: 50
          },
          {
            x: originalX + Phaser.Math.Between(-15, 15),
            y: originalY + Phaser.Math.Between(-15, 15),
            duration: 50
          },
          {
            x: originalX + Phaser.Math.Between(-15, 15),
            y: originalY + Phaser.Math.Between(-15, 15),
            duration: 50
          },
          {
            x: originalX + Phaser.Math.Between(-15, 15),
            y: originalY + Phaser.Math.Between(-15, 15),
            duration: 50
          },
          {
            x: originalX + Phaser.Math.Between(-15, 15),
            y: originalY + Phaser.Math.Between(-15, 15),
            duration: 50
          },
          {
            x: originalX + Phaser.Math.Between(-15, 15),
            y: originalY + Phaser.Math.Between(-15, 15),
            duration: 50
          },
          {
            x: originalX + Phaser.Math.Between(-15, 15),
            y: originalY + Phaser.Math.Between(-15, 15),
            duration: 50
          },
          {
            x: originalX + Phaser.Math.Between(-15, 15),
            y: originalY + Phaser.Math.Between(-15, 15),
            duration: 50
          },
          {
            x: originalX + Phaser.Math.Between(-15, 15),
            y: originalY + Phaser.Math.Between(-15, 15),
            duration: 50
          },
          {
            x: originalX + Phaser.Math.Between(-15, 15),
            y: originalY + Phaser.Math.Between(-15, 15),
            duration: 50
          },
          {
            x: originalX + Phaser.Math.Between(-15, 15),
            y: originalY + Phaser.Math.Between(-15, 15),
            duration: 50
          },
          {
            x: originalX + Phaser.Math.Between(-15, 15),
            y: originalY + Phaser.Math.Between(-15, 15),
            duration: 50
          },
          {
            x: originalX + Phaser.Math.Between(-15, 15),
            y: originalY + Phaser.Math.Between(-15, 15),
            duration: 50
          },
          {
            x: originalX + Phaser.Math.Between(-15, 15),
            y: originalY + Phaser.Math.Between(-15, 15),
            duration: 50
          },
          {
            x: originalX + Phaser.Math.Between(-15, 15),
            y: originalY + Phaser.Math.Between(-15, 15),
            duration: 50
          },
          {
            x: originalX + Phaser.Math.Between(-15, 15),
            y: originalY + Phaser.Math.Between(-15, 15),
            duration: 50
          },
          {
            x: originalX + Phaser.Math.Between(-15, 15),
            y: originalY + Phaser.Math.Between(-15, 15),
            duration: 50
          },
          {
            x: originalX + Phaser.Math.Between(-15, 15),
            y: originalY + Phaser.Math.Between(-15, 15),
            duration: 50
          },
          {
            // 最后回到原位
            x: originalX,
            y: originalY,
            duration: 50
          }
        ],
        onComplete: () => {
          // 只在第一个物体完成时触发
          if (index === 0) {
            window.__signals__.animationCompleted = true;
            window.__signals__.endTime = Date.now();
            window.__signals__.actualDuration = window.__signals__.endTime - window.__signals__.startTime;
            
            statusText.setText('Animation Completed!');
            statusText.setColor('#00ff00');
            
            console.log(JSON.stringify({
              event: 'animation_completed',
              timestamp: Date.now(),
              duration: window.__signals__.actualDuration,
              objectCount: 8
            }));
          }
        }
      });
    });
  });
}

function update(time, delta) {
  // 可选：更新逻辑
}

new Phaser.Game(config);