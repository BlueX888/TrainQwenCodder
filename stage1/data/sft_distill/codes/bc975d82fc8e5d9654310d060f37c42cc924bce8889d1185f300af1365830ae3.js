// Phaser3 相机跟随示例 - 自动向右移动的矩形
class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.moveSpeed = 100; // 每秒移动的像素
  }

  preload() {
    // 不需要加载外部资源
  }

  create() {
    // 设置世界边界，使其比相机视口大，这样相机才能移动
    this.cameras.main.setBounds(0, 0, 2400, 600);
    this.physics.world.setBounds(0, 0, 2400, 600);

    // 创建一个矩形作为玩家对象
    // 使用 Graphics 生成纹理
    const graphics = this.add.graphics();
    graphics.fillStyle(0x00ff00, 1); // 绿色
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('playerRect', 40, 40);
    graphics.destroy();

    // 创建物理精灵对象
    this.player = this.physics.add.sprite(100, 300, 'playerRect');
    this.player.setCollideWorldBounds(true);

    // 设置相机跟随玩家对象，居中显示
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    
    // 可选：设置跟随偏移量（这里保持居中，所以偏移为0）
    this.cameras.main.setFollowOffset(0, 0);

    // 添加背景网格以便观察相机移动
    this.createBackgroundGrid();

    // 添加提示文本（固定在相机上）
    const text = this.add.text(10, 10, '相机跟随矩形移动', {
      fontSize: '16px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setScrollFactor(0); // 固定在相机上，不随世界移动
  }

  update(time, delta) {
    // 让玩家对象自动向右移动
    // delta 是毫秒，转换为秒
    const deltaSeconds = delta / 1000;
    this.player.x += this.moveSpeed * deltaSeconds;

    // 当到达世界边界时，可以选择停止或循环
    if (this.player.x >= 2360) {
      this.player.x = 2360; // 停在边界
      // 或者重置位置：this.player.x = 100;
    }
  }

  // 创建背景网格以便观察相机移动效果
  createBackgroundGrid() {
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x333333, 0.5);

    // 绘制垂直线
    for (let x = 0; x <= 2400; x += 100) {
      graphics.moveTo(x, 0);
      graphics.lineTo(x, 600);
    }

    // 绘制水平线
    for (let y = 0; y <= 600; y += 100) {
      graphics.moveTo(0, y);
      graphics.lineTo(2400, y);
    }

    graphics.strokePath();

    // 添加坐标标记
    for (let x = 0; x <= 2400; x += 200) {
      const label = this.add.text(x + 5, 5, `${x}`, {
        fontSize: '12px',
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
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: GameScene
};

// 创建游戏实例
new Phaser.Game(config);