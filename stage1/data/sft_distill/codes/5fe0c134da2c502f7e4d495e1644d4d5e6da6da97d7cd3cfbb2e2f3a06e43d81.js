class CollectionGame extends Phaser.Scene {
  constructor() {
    super('CollectionGame');
    this.collectedCount = 0; // 可验证的状态信号
    this.totalItems = 12;
  }

  preload() {
    // 使用Graphics创建纹理，无需外部资源
  }

  create() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建收集物纹理（椭圆形）
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillEllipse(15, 10, 30, 20);
    itemGraphics.generateTexture('item', 30, 20);
    itemGraphics.destroy();

    // 创建玩家精灵
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建收集物物理组
    this.items = this.physics.add.group();

    // 随机生成12个椭圆收集物
    for (let i = 0; i < this.totalItems; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const item = this.items.create(x, y, 'item');
      item.setCircle(10); // 设置碰撞体积
    }

    // 添加碰撞检测
    this.physics.add.overlap(
      this.player,
      this.items,
      this.collectItem,
      null,
      this
    );

    // 创建键盘控制
    this.cursors = this.input.keyboard.createCursorKeys();

    // 创建计数文本
    this.scoreText = this.add.text(16, 16, '收集进度: 0/12', {
      fontSize: '24px',
      fill: '#ffffff'
    });

    // 创建通关文本（初始隐藏）
    this.winText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '48px',
      fill: '#00ff00',
      fontStyle: 'bold'
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);
  }

  update() {
    // 玩家移动控制
    const speed = 200;

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-speed);
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(speed);
    } else {
      this.player.setVelocityX(0);
    }

    if (this.cursors.up.isDown) {
      this.player.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.setVelocityY(speed);
    } else {
      this.player.setVelocityY(0);
    }
  }

  collectItem(player, item) {
    // 销毁收集物
    item.destroy();

    // 增加收集计数
    this.collectedCount++;

    // 更新计数文本
    this.scoreText.setText(`收集进度: ${this.collectedCount}/${this.totalItems}`);

    // 检查是否收集完成
    if (this.collectedCount >= this.totalItems) {
      this.winGame();
    }
  }

  winGame() {
    // 显示通关文本
    this.winText.setVisible(true);

    // 停止玩家移动
    this.player.setVelocity(0, 0);

    // 禁用键盘输入
    this.input.keyboard.enabled = false;

    // 添加闪烁效果
    this.tweens.add({
      targets: this.winText,
      alpha: { from: 1, to: 0.3 },
      duration: 500,
      yoyo: true,
      repeat: -1
    });

    console.log('游戏通关！收集物数量:', this.collectedCount);
  }
}

const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#2d2d2d',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false
    }
  },
  scene: CollectionGame
};

new Phaser.Game(config);