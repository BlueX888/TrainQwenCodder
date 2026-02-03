class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.star = null;
    this.speed = 100; // 移动速度（像素/秒）
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 1. 创建背景网格以便观察相机移动
    this.createBackgroundGrid();

    // 2. 使用 Graphics 创建星形纹理
    this.createStarTexture();

    // 3. 创建星形精灵并放置在起始位置
    this.star = this.add.sprite(400, 300, 'starTexture');
    this.star.setScale(2); // 放大星形以便观察

    // 4. 设置相机跟随星形对象，保持居中
    this.cameras.main.startFollow(this.star, true, 0.1, 0.1);
    
    // 可选：设置相机边界，让星形可以在更大的世界中移动
    this.cameras.main.setBounds(0, 0, 2000, 2000);
    
    // 设置世界边界
    this.physics.world.setBounds(0, 0, 2000, 2000);

    // 添加提示文本（固定在相机上）
    const infoText = this.add.text(10, 10, '星形自动向右下移动\n相机跟随并保持居中', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    infoText.setScrollFactor(0); // 固定在相机上，不随世界移动
  }

  update(time, delta) {
    // 让星形自动向右下移动
    // delta 是毫秒，转换为秒
    const deltaSeconds = delta / 1000;
    
    // 向右下方向移动（45度角）
    const moveX = this.speed * deltaSeconds;
    const moveY = this.speed * deltaSeconds;
    
    this.star.x += moveX;
    this.star.y += moveY;

    // 可选：当星形超出世界边界时重置位置
    if (this.star.x > 1900 || this.star.y > 1900) {
      this.star.x = 100;
      this.star.y = 100;
    }
  }

  // 创建星形纹理
  createStarTexture() {
    const graphics = this.make.graphics({ x: 0, y: 0, add: false });
    
    // 绘制黄色星形
    graphics.fillStyle(0xffff00, 1);
    graphics.lineStyle(2, 0xffa500, 1);
    
    // 绘制五角星
    const centerX = 32;
    const centerY = 32;
    const outerRadius = 30;
    const innerRadius = 12;
    const points = 5;
    
    graphics.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / points - Math.PI / 2;
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
    graphics.generateTexture('starTexture', 64, 64);
    graphics.destroy();
  }

  // 创建背景网格以便观察相机移动
  createBackgroundGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);
    
    // 绘制网格
    const gridSize = 100;
    const worldWidth = 2000;
    const worldHeight = 2000;
    
    // 垂直线
    for (let x = 0; x <= worldWidth; x += gridSize) {
      graphics.lineBetween(x, 0, x, worldHeight);
    }
    
    // 水平线
    for (let y = 0; y <= worldHeight; y += gridSize) {
      graphics.lineBetween(0, y, worldWidth, y);
    }
    
    // 添加坐标标记
    for (let x = 0; x <= worldWidth; x += 200) {
      for (let y = 0; y <= worldHeight; y += 200) {
        const text = this.add.text(x + 5, y + 5, `${x},${y}`, {
          fontSize: '12px',
          fill: '#666666'
        });
      }
    }
  }
}

// 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);