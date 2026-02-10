const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: {
    preload: preload,
    create: create
  }
};

let rectangleCount = 0;
const MAX_RECTANGLES = 20;

function preload() {
  // 无需预加载资源
}

function create() {
  // 添加标题文字
  this.add.text(10, 10, '每隔3秒生成青色矩形 (最多20个)', {
    fontSize: '18px',
    color: '#ffffff'
  });

  // 显示计数器文字
  const counterText = this.add.text(10, 40, `已生成: 0 / ${MAX_RECTANGLES}`, {
    fontSize: '16px',
    color: '#00ffff'
  });

  // 创建定时器事件，每3秒触发一次
  this.time.addEvent({
    delay: 3000,                    // 3秒间隔
    callback: () => {
      // 生成随机位置（留出边距避免矩形超出边界）
      const x = Phaser.Math.Between(30, 770);
      const y = Phaser.Math.Between(80, 570);
      
      // 使用 Graphics 绘制青色矩形
      const graphics = this.add.graphics();
      graphics.fillStyle(0x00ffff, 1);  // 青色 (cyan)
      graphics.fillRect(x - 25, y - 25, 50, 50);  // 50x50 的矩形，居中绘制
      
      // 添加矩形边框
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeRect(x - 25, y - 25, 50, 50);
      
      // 更新计数器
      rectangleCount++;
      counterText.setText(`已生成: ${rectangleCount} / ${MAX_RECTANGLES}`);
      
      // 添加生成动画效果（可选）
      graphics.setAlpha(0);
      this.tweens.add({
        targets: graphics,
        alpha: 1,
        duration: 300,
        ease: 'Power2'
      });
    },
    callbackScope: this,
    repeat: MAX_RECTANGLES - 1      // 重复19次，加上第一次共20次
  });

  // 添加提示信息
  this.add.text(400, 580, '矩形将每3秒自动生成', {
    fontSize: '14px',
    color: '#888888'
  }).setOrigin(0.5);
}

// 创建游戏实例
new Phaser.Game(config);