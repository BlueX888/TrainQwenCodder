class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.player = null;
    this.speed = 2;
  }

  preload() {
    // 无需预加载外部资源
  }

  create() {
    // 设置世界边界，让场景足够大以便移动
    this.physics.world.setBounds(0, 0, 2000, 2000);

    // 使用 Graphics 创建一个红色方块
    const graphics = this.add.graphics();
    graphics.fillStyle(0xff0000, 1);
    graphics.fillRect(0, 0, 40, 40);
    graphics.generateTexture('playerSquare', 40, 40);
    graphics.destroy();

    // 创建玩家对象（方块）
    this.player = this.add.rectangle(400, 300, 40, 40, 0xff0000);
    
    // 设置相机跟随玩家
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
    
    // 设置相机边界与世界边界一致
    this.cameras.main.setBounds(0, 0, 2000, 2000);

    // 添加背景网格以便观察移动效果
    this.createGrid();

    // 添加提示文本（固定在相机上）
    const text = this.add.text(10, 10, '红色方块自动向右上移动\n相机跟随中...', {
      fontSize: '16px',
      color: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });
    text.setScrollFactor(0); // 固定在相机上，不随场景滚动
  }

  update(time, delta) {
    // 让方块持续向右上移动
    this.player.x += this.speed;
    this.player.y -= this.speed;

    // 边界检测，到达边界后反向移动
    if (this.player.x >= 1980 || this.player.x <= 20) {
      this.speed = -this.speed;
    }
    if (this.player.y <= 20 || this.player.y >= 1980) {
      this.speed = -this.speed;
    }
  }

  createGrid() {
    // 创建网格背景以便观察相机移动
    const graphics = this.add.graphics();
    graphics.lineStyle(1, 0x00ff00, 0.3);

    // 绘制垂直线
    for (let x = 0; x <= 2000; x += 100) {
      graphics.lineBetween(x, 0, x, 2000);
    }

    // 绘制水平线
    for (let y = 0; y <= 2000; y += 100) {
      graphics.lineBetween(0, y, 2000, y);
    }

    // 添加坐标标记
    for (let x = 0; x <= 2000; x += 200) {
      for (let y = 0; y <= 2000; y += 200) {
        const label = this.add.text(x + 5, y + 5, `${x},${y}`, {
          fontSize: '12px',
          color: '#00ff00'
        });
      }
    }
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  scene: GameScene
};

new Phaser.Game(config);