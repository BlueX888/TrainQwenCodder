class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.triangle = null;
    this.moveSpeed = 100; // 每秒移动的像素数
  }

  preload() {
    // 无需加载外部资源
  }

  create() {
    // 创建背景网格以便观察相机移动
    this.createBackgroundGrid();

    // 使用 Graphics 创建三角形
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    
    // 绘制一个等边三角形（中心点在 0,0）
    const triangleSize = 30;
    graphics.beginPath();
    graphics.moveTo(0, -triangleSize);
    graphics.lineTo(-triangleSize, triangleSize);
    graphics.lineTo(triangleSize, triangleSize);
    graphics.closePath();
    graphics.fillPath();

    // 生成纹理供 Sprite 使用
    graphics.generateTexture('triangleTex', triangleSize * 2, triangleSize * 2);
    graphics.destroy();

    // 创建三角形精灵对象，初始位置在场景中央
    this.triangle = this.add.sprite(400, 300, 'triangleTex');

    // 设置相机跟随三角形，保持居中
    this.cameras.main.startFollow(this.triangle, true, 0.1, 0.1);

    // 设置相机边界（可选，让场景更大以观察效果）
    this.cameras.main.setBounds(0, 0, 3200, 600);

    // 添加提示文本（固定在相机上）
    const text = this.add.text(10, 10, '相机跟随三角形移动', {
      fontSize: '20px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setScrollFactor(0); // 固定在相机上，不随场景滚动
  }

  update(time, delta) {
    // 让三角形持续向右移动
    // delta 是毫秒，转换为秒
    const deltaSeconds = delta / 1000;
    this.triangle.x += this.moveSpeed * deltaSeconds;

    // 可选：当三角形移动到一定距离后重置位置（循环演示）
    if (this.triangle.x > 3000) {
      this.triangle.x = 200;
    }
  }

  createBackgroundGrid() {
    // 创建网格背景以便观察相机移动效果
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x333333, 0.5);

    const gridSize = 100;
    const worldWidth = 3200;
    const worldHeight = 600;

    // 绘制垂直线
    for (let x = 0; x <= worldWidth; x += gridSize) {
      gridGraphics.lineBetween(x, 0, x, worldHeight);
    }

    // 绘制水平线
    for (let y = 0; y <= worldHeight; y += gridSize) {
      gridGraphics.lineBetween(0, y, worldWidth, y);
    }

    // 添加网格坐标标记
    for (let x = 0; x <= worldWidth; x += gridSize) {
      for (let y = 0; y <= worldHeight; y += gridSize) {
        if (x % 200 === 0 && y % 200 === 0) {
          const coordText = this.add.text(x + 5, y + 5, `${x},${y}`, {
            fontSize: '12px',
            color: '#666666'
          });
        }
      }
    }
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  scene: GameScene,
  parent: 'game-container' // 可选：指定父容器
};

// 创建游戏实例
new Phaser.Game(config);