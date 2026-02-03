class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.star = null;
    this.speed = 100; // 每秒移动的像素数
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置世界边界，使其足够大以便星形移动
    this.cameras.main.setBounds(0, 0, 2000, 600);
    this.physics.world.setBounds(0, 0, 2000, 600);

    // 使用 Graphics 绘制星形并生成纹理
    const graphics = this.add.graphics();
    
    // 绘制黄色星形
    graphics.fillStyle(0xffff00, 1);
    graphics.lineStyle(2, 0xffa500, 1);
    
    // 绘制五角星
    const points = [];
    const outerRadius = 30;
    const innerRadius = 15;
    const numPoints = 5;
    
    for (let i = 0; i < numPoints * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (i * Math.PI) / numPoints - Math.PI / 2;
      points.push({
        x: 40 + Math.cos(angle) * radius,
        y: 40 + Math.sin(angle) * radius
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
    graphics.generateTexture('starTexture', 80, 80);
    graphics.destroy();

    // 创建星形精灵，初始位置在世界中央偏右
    this.star = this.add.sprite(1000, 300, 'starTexture');
    this.star.setOrigin(0.5, 0.5);

    // 设置相机跟随星形
    this.cameras.main.startFollow(this.star, true, 0.1, 0.1);
    
    // 可选：设置相机跟随的偏移量（这里保持居中，所以偏移为0）
    this.cameras.main.setFollowOffset(0, 0);

    // 添加背景网格以便观察移动效果
    this.createBackgroundGrid();

    // 添加提示文本（固定在相机上）
    const text = this.add.text(10, 10, '星形自动向左移动\n相机跟随居中', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setScrollFactor(0); // 固定在相机上，不随世界移动
  }

  update(time, delta) {
    // 星形向左移动
    this.star.x -= this.speed * (delta / 1000);

    // 如果星形移出左边界，循环到右边
    if (this.star.x < -40) {
      this.star.x = 2040;
    }

    // 如果星形移出右边界，循环到左边
    if (this.star.x > 2040) {
      this.star.x = -40;
    }
  }

  createBackgroundGrid() {
    // 创建网格背景以便观察相机移动
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);

    // 绘制垂直线
    for (let x = 0; x <= 2000; x += 100) {
      graphics.lineTo(x, 0);
      graphics.lineTo(x, 600);
      graphics.moveTo(x + 100, 0);
    }

    // 绘制水平线
    for (let y = 0; y <= 600; y += 100) {
      graphics.moveTo(0, y);
      graphics.lineTo(2000, y);
    }

    graphics.strokePath();

    // 添加坐标标记
    for (let x = 0; x <= 2000; x += 200) {
      const label = this.add.text(x + 5, 5, `${x}`, {
        fontSize: '12px',
        fill: '#666666'
      });
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
  scene: GameScene,
  physics: {
    default: 'arcade',
    arcade: {
      debug: false
    }
  }
};

new Phaser.Game(config);