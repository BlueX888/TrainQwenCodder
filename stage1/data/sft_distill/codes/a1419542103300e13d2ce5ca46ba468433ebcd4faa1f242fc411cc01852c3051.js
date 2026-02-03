class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.star = null;
    this.speed = 100; // 每秒移动像素
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建背景网格，用于观察相机移动效果
    this.createBackgroundGrid();

    // 使用 Graphics 创建星形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0xffff00, 1);
    graphics.strokeStyle(0xff8800, 2);
    
    // 绘制五角星
    const points = [];
    const outerRadius = 30;
    const innerRadius = 15;
    for (let i = 0; i < 10; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / 5 - Math.PI / 2;
      points.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      });
    }
    
    graphics.beginPath();
    graphics.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      graphics.lineTo(points[i].x, points[i].y);
    }
    graphics.closePath();
    graphics.fillPath();
    graphics.strokePath();
    
    // 生成纹理
    graphics.generateTexture('star', 64, 64);
    graphics.destroy();

    // 创建星形精灵，初始位置在屏幕中央上方
    this.star = this.add.sprite(400, 100, 'star');
    this.star.setOrigin(0.5, 0.5);

    // 设置相机跟随星形对象
    this.cameras.main.startFollow(this.star, true, 0.1, 0.1);
    
    // 可选：设置相机边界（让星形可以移动到更大的区域）
    this.cameras.main.setBounds(0, 0, 800, 2000);

    // 添加提示文字（固定在相机视图中）
    const text = this.add.text(10, 10, '星形自动向下移动\n相机跟随中...', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setScrollFactor(0); // 固定在相机视图，不随相机移动
  }

  update(time, delta) {
    // 让星形持续向下移动
    if (this.star) {
      // delta 是毫秒，转换为秒
      this.star.y += this.speed * (delta / 1000);

      // 可选：到达底部后重置位置（循环效果）
      if (this.star.y > 1900) {
        this.star.y = 100;
      }
    }
  }

  createBackgroundGrid() {
    // 创建网格背景，方便观察相机移动
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);

    const gridSize = 50;
    const worldHeight = 2000;
    const worldWidth = 800;

    // 绘制垂直线
    for (let x = 0; x <= worldWidth; x += gridSize) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, worldHeight);
    }

    // 绘制水平线
    for (let y = 0; y <= worldHeight; y += gridSize) {
      graphics.moveTo(0, y);
      graphics.lineTo(worldWidth, y);
    }

    graphics.strokePath();

    // 添加坐标标记
    for (let y = 0; y <= worldHeight; y += 200) {
      const label = this.add.text(10, y, `Y: ${y}`, {
        fontSize: '14px',
        color: '#00ff00',
        backgroundColor: '#000000'
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
  parent: 'game-container'
};

// 创建游戏实例
new Phaser.Game(config);