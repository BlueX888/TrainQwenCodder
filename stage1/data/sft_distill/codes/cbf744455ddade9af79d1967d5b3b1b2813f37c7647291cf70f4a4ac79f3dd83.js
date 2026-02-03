class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.moveSpeed = 100; // 每秒向下移动的像素
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 创建一个大的世界边界，让相机有足够的移动空间
    this.cameras.main.setBounds(0, 0, 800, 2000);
    this.physics.world.setBounds(0, 0, 800, 2000);

    // 绘制背景网格以便观察相机移动
    this.createBackgroundGrid();

    // 使用 Graphics 创建圆形纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1); // 绿色圆形
    graphics.fillCircle(25, 25, 25); // 半径25的圆
    graphics.generateTexture('playerCircle', 50, 50);
    graphics.destroy();

    // 创建玩家精灵（圆形）
    this.player = this.add.sprite(400, 100, 'playerCircle');

    // 设置相机跟随玩家对象
    // startFollow(target, roundPixels, lerpX, lerpY, offsetX, offsetY)
    // roundPixels: true 可以避免像素模糊
    // lerpX/lerpY: 0.1 表示平滑跟随（值越小越平滑，1表示立即跟随）
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // 添加文字提示
    const text = this.add.text(400, 50, '圆形自动向下移动\n相机跟随并居中', {
      fontSize: '20px',
      fill: '#ffffff',
      align: 'center',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setOrigin(0.5);
    text.setScrollFactor(0); // 让文字固定在屏幕上，不随相机移动
  }

  update(time, delta) {
    // 让圆形对象自动向下移动
    // delta 是上一帧到这一帧的时间间隔（毫秒）
    const moveDistance = (this.moveSpeed * delta) / 1000;
    this.player.y += moveDistance;

    // 当圆形移动到世界底部时，重置到顶部
    if (this.player.y > 1950) {
      this.player.y = 50;
    }
  }

  createBackgroundGrid() {
    // 创建网格背景以便观察相机移动
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);

    // 绘制垂直线
    for (let x = 0; x <= 800; x += 50) {
      graphics.lineBetween(x, 0, x, 2000);
    }

    // 绘制水平线
    for (let y = 0; y <= 2000; y += 50) {
      graphics.lineBetween(0, y, 800, y);
    }

    // 添加坐标标记
    for (let y = 0; y <= 2000; y += 200) {
      const label = this.add.text(10, y + 5, `Y: ${y}`, {
        fontSize: '14px',
        fill: '#666666'
      });
    }
  }
}

// Phaser 游戏配置
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#222222',
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