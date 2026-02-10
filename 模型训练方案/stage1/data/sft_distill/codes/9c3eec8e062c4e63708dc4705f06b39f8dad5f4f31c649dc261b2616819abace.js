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

let diamondCount = 0;
const MAX_DIAMONDS = 12;

function preload() {
  // 不需要预加载外部资源
}

function create() {
  // 使用 Graphics 绘制橙色菱形并生成纹理
  const graphics = this.add.graphics();
  graphics.fillStyle(0xFF8C00, 1); // 橙色
  
  // 绘制菱形（四个点连接成菱形）
  const size = 30;
  graphics.beginPath();
  graphics.moveTo(size, 0);        // 上顶点
  graphics.lineTo(size * 2, size); // 右顶点
  graphics.lineTo(size, size * 2); // 下顶点
  graphics.lineTo(0, size);        // 左顶点
  graphics.closePath();
  graphics.fillPath();
  
  // 生成纹理
  graphics.generateTexture('diamond', size * 2, size * 2);
  graphics.destroy();
  
  // 添加标题文本
  this.add.text(400, 30, 'Orange Diamonds Generator', {
    fontSize: '24px',
    color: '#ffffff'
  }).setOrigin(0.5);
  
  // 添加计数器文本
  const counterText = this.add.text(400, 70, `Diamonds: ${diamondCount}/${MAX_DIAMONDS}`, {
    fontSize: '20px',
    color: '#FFD700'
  }).setOrigin(0.5);
  
  // 创建定时器事件，每 0.5 秒生成一个菱形
  const timerEvent = this.time.addEvent({
    delay: 500,                    // 0.5 秒 = 500 毫秒
    callback: spawnDiamond,
    callbackScope: this,
    loop: true,
    args: [counterText, timerEvent]
  });
  
  // 生成菱形的函数
  function spawnDiamond(counterText, timerEvent) {
    if (diamondCount >= MAX_DIAMONDS) {
      // 达到最大数量，停止定时器
      timerEvent.remove();
      
      // 显示完成消息
      this.add.text(400, 550, 'All diamonds generated!', {
        fontSize: '22px',
        color: '#00FF00'
      }).setOrigin(0.5);
      
      return;
    }
    
    // 生成随机位置（避免边缘，留出菱形大小的空间）
    const margin = 40;
    const randomX = Phaser.Math.Between(margin, config.width - margin);
    const randomY = Phaser.Math.Between(120, config.height - margin);
    
    // 创建菱形精灵
    const diamond = this.add.image(randomX, randomY, 'diamond');
    
    // 添加简单的缩放动画效果
    diamond.setScale(0);
    this.tweens.add({
      targets: diamond,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut'
    });
    
    // 增加计数器
    diamondCount++;
    
    // 更新计数器文本
    counterText.setText(`Diamonds: ${diamondCount}/${MAX_DIAMONDS}`);
  }
}

// 启动游戏
new Phaser.Game(config);