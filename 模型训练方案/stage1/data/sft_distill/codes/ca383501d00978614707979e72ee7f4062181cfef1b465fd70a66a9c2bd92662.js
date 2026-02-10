class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.diamond = null;
    this.moveSpeed = 100; // 每秒移动像素
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 设置世界边界，使其足够大以便菱形移动
    this.cameras.main.setBounds(0, 0, 800, 2000);
    this.physics.world.setBounds(0, 0, 800, 2000);

    // 使用 Graphics 绘制菱形并生成纹理
    const graphics = this.add.graphics();
    
    // 绘制菱形（中心点在 32, 32）
    graphics.fillStyle(0xff6b6b, 1);
    graphics.beginPath();
    graphics.moveTo(32, 0);    // 上顶点
    graphics.lineTo(64, 32);   // 右顶点
    graphics.lineTo(32, 64);   // 下顶点
    graphics.lineTo(0, 32);    // 左顶点
    graphics.closePath();
    graphics.fillPath();

    // 生成纹理
    graphics.generateTexture('diamondTexture', 64, 64);
    graphics.destroy(); // 销毁 graphics 对象，纹理已生成

    // 创建菱形精灵，初始位置在屏幕中央偏下
    this.diamond = this.add.sprite(400, 1800, 'diamondTexture');

    // 设置相机跟随菱形对象，居中显示
    this.cameras.main.startFollow(this.diamond, true, 0.1, 0.1);

    // 添加一些参考背景网格以便观察移动
    this.createBackgroundGrid();

    // 添加提示文本（固定在相机上）
    const text = this.add.text(10, 10, '菱形自动向上移动\n相机跟随居中', {
      fontSize: '18px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setScrollFactor(0); // 固定在相机上，不随世界移动
  }

  update(time, delta) {
    // 让菱形持续向上移动
    if (this.diamond) {
      this.diamond.y -= this.moveSpeed * (delta / 1000);

      // 如果菱形移动到世界顶部，重置到底部
      if (this.diamond.y < 0) {
        this.diamond.y = 2000;
      }
    }
  }

  createBackgroundGrid() {
    // 创建背景网格以便观察相机移动
    const gridGraphics = this.add.graphics();
    gridGraphics.lineStyle(1, 0x333333, 0.5);

    // 绘制水平线
    for (let y = 0; y <= 2000; y += 100) {
      gridGraphics.moveTo(0, y);
      gridGraphics.lineTo(800, y);
    }

    // 绘制垂直线
    for (let x = 0; x <= 800; x += 100) {
      gridGraphics.moveTo(x, 0);
      gridGraphics.lineTo(x, 2000);
    }

    gridGraphics.strokePath();

    // 添加坐标标记
    for (let y = 0; y <= 2000; y += 200) {
      const label = this.add.text(10, y, `Y: ${y}`, {
        fontSize: '14px',
        fill: '#666666'
      });
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#1a1a1a',
  scene: GameScene
};

new Phaser.Game(config);