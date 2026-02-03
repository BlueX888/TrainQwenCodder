class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 创建背景网格以便观察相机移动
    this.createBackground();

    // 使用 Graphics 绘制六边形纹理
    this.createHexagonTexture();

    // 创建六边形精灵（位于场景中心）
    this.hexagon = this.physics.add.sprite(400, 300, 'hexagon');
    this.hexagon.setScale(1.5);

    // 设置六边形向左上方向移动
    // 左上方向：x 为负，y 为负
    const speed = 150;
    const angle = -135; // 左上方向（-135度）
    const velocityX = Math.cos(Phaser.Math.DegToRad(angle)) * speed;
    const velocityY = Math.sin(Phaser.Math.DegToRad(angle)) * speed;
    
    this.hexagon.setVelocity(velocityX, velocityY);

    // 设置相机跟随六边形
    this.cameras.main.startFollow(this.hexagon, true, 0.1, 0.1);
    
    // 设置相机边界（可选，让相机在更大的世界中移动）
    this.cameras.main.setBounds(-2000, -2000, 4000, 4000);
    this.physics.world.setBounds(-2000, -2000, 4000, 4000);

    // 添加说明文字（固定在相机上）
    const text = this.add.text(10, 10, '六边形向左上移动\n相机跟随并保持居中', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setScrollFactor(0); // 固定在相机上，不随世界移动
  }

  createBackground() {
    // 创建网格背景以便观察相机移动
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);

    // 绘制更大范围的网格
    const gridSize = 50;
    const startX = -2000;
    const startY = -2000;
    const endX = 2000;
    const endY = 2000;

    // 垂直线
    for (let x = startX; x <= endX; x += gridSize) {
      graphics.lineBetween(x, startY, x, endY);
    }

    // 水平线
    for (let y = startY; y <= endY; y += gridSize) {
      graphics.lineBetween(startX, y, endX, y);
    }

    // 绘制中心十字标记
    graphics.lineStyle(2, 0xff0000, 1);
    graphics.lineBetween(-100, 0, 100, 0);
    graphics.lineBetween(0, -100, 0, 100);
  }

  createHexagonTexture() {
    // 创建六边形纹理
    const graphics = this.add.graphics();
    
    // 计算六边形顶点
    const radius = 30;
    const points = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2; // 从顶部开始
      const x = radius + Math.cos(angle) * radius;
      const y = radius + Math.sin(angle) * radius;
      points.push(new Phaser.Geom.Point(x, y));
    }

    // 绘制填充的六边形
    graphics.fillStyle(0x00ff00, 1);
    graphics.fillPoints(points, true);

    // 绘制边框
    graphics.lineStyle(3, 0x00aa00, 1);
    graphics.strokePoints(points, true);

    // 生成纹理
    graphics.generateTexture('hexagon', radius * 2, radius * 2);
    graphics.destroy();
  }

  update(time, delta) {
    // 可选：如果需要其他更新逻辑可以在这里添加
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
      gravity: { y: 0 }, // 无重力
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);