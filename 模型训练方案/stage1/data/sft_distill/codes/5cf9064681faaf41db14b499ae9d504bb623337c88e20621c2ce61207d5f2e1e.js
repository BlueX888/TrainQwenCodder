class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.star = null;
    this.speed = 100; // 每秒向上移动的像素数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置世界边界，让世界比相机视图大很多
    this.cameras.main.setBounds(0, 0, 800, 3000);
    this.physics.world.setBounds(0, 0, 800, 3000);

    // 创建星形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1); // 黄色
    graphics.lineStyle(2, 0xff6600, 1); // 橙色边框
    
    // 绘制星形
    const points = 5;
    const outerRadius = 30;
    const innerRadius = 15;
    const centerX = 40;
    const centerY = 40;
    
    graphics.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      
      if (i === 0) {
        graphics.moveTo(x, y);
      } else {
        graphics.lineTo(x, y);
      }
    }
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    
    // 生成纹理
    graphics.generateTexture('star', 80, 80);
    graphics.destroy();

    // 创建星形精灵，初始位置在底部中央
    this.star = this.add.sprite(400, 2800, 'star');
    
    // 设置相机跟随星形，保持居中
    this.cameras.main.startFollow(this.star, true, 0.1, 0.1);
    
    // 可选：设置相机跟随的偏移量（这里设置为0,0表示居中）
    this.cameras.main.setFollowOffset(0, 0);

    // 添加背景网格以便观察移动效果
    this.createBackgroundGrid();

    // 添加提示文本（固定在相机上）
    const text = this.add.text(10, 10, '星形自动向上移动\n相机跟随并保持居中', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setScrollFactor(0); // 固定在相机上，不随世界移动
  }

  update(time, delta) {
    // 让星形持续向上移动
    if (this.star) {
      this.star.y -= (this.speed * delta) / 1000;
      
      // 如果星形移动到世界顶部，重置到底部
      if (this.star.y < 50) {
        this.star.y = 2950;
      }
    }
  }

  createBackgroundGrid() {
    // 创建网格背景以便观察相机移动
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x333333, 0.5);
    
    const gridSize = 100;
    const worldHeight = 3000;
    const worldWidth = 800;
    
    // 绘制垂直线
    for (let x = 0; x <= worldWidth; x += gridSize) {
      gridGraphics.lineBetween(x, 0, x, worldHeight);
    }
    
    // 绘制水平线
    for (let y = 0; y <= worldHeight; y += gridSize) {
      gridGraphics.lineBetween(0, y, worldWidth, y);
    }
    
    // 添加坐标标记
    for (let y = 0; y <= worldHeight; y += 200) {
      const label = this.add.text(10, y, `Y: ${y}`, {
        fontSize: '14px',
        fill: '#666666'
      });
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a2e',
  scene: GameScene,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  }
};

// 创建游戏实例
new Phaser.Game(config);