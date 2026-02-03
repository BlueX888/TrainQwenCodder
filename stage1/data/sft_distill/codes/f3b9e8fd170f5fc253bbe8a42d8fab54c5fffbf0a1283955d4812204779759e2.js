class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
    this.collectedCount = 0; // 可验证的状态信号
    this.totalItems = 10;
  }

  preload() {
    // 创建玩家纹理
    const playerGraphics = this.add.graphics();
    playerGraphics.fillStyle(0x00ff00, 1);
    playerGraphics.fillCircle(16, 16, 16);
    playerGraphics.generateTexture('player', 32, 32);
    playerGraphics.destroy();

    // 创建椭圆收集物纹理
    const itemGraphics = this.add.graphics();
    itemGraphics.fillStyle(0xffff00, 1);
    itemGraphics.fillEllipse(15, 10, 30, 20);
    itemGraphics.lineStyle(2, 0xff9900, 1);
    itemGraphics.strokeEllipse(15, 10, 30, 20);
    itemGraphics.generateTexture('item', 30, 20);
    itemGraphics.destroy();
  }

  create() {
    // 创建玩家
    this.player = this.physics.add.sprite(400, 300, 'player');
    this.player.setCollideWorldBounds(true);

    // 创建收集物组
    this.items = this.physics.add.group();

    // 随机生成10个椭圆收集物
    for (let i = 0; i < this.totalItems; i++) {
      const x = Phaser.Math.Between(50, 750);
      const y = Phaser.Math.Between(50, 550);
      const item = this.items.create(x, y, 'item');
      item.setScale(1);
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
    this.scoreText = this.add.text(16, 16, `收集: ${this.collectedCount}/${this.totalItems}`, {
      fontSize: '24px',
      fill: '#ffffff',
      backgroundColor: '#000000',
      padding: { x: 10, y: 5 }
    });

    // 创建通关文本（初始隐藏）
    this.winText = this.add.text(400, 300, '恭喜通关！', {
      fontSize: '48px',
      fill: '#ffff00',
      stroke: '#000000',
      strokeThickness: 6
    });
    this.winText.setOrigin(0.5);
    this.winText.setVisible(false);

    // 添加提示文本
    this.add.text(400, 580, '使用方向键移动收集黄色椭圆', {
      fontSize: '18px',
      fill: '#ffffff'
    }).setOrigin(0.5);
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

    // 增加计数
    this.collectedCount++;

    // 更新文本
    this.scoreText.setText(`收集: ${this.collectedCount}/${this.totalItems}`);

    // 检查是否收集完成
    if (this.collectedCount >= this.totalItems) {
      this.winText.setVisible(true);
      // 停止玩家移动
      this.player.setVelocity(0, 0);
      // 禁用输入
      this.cursors.left.enabled = false;
      this.cursors.right.enabled = false;
      this.cursors.up.enabled = false;
      this.cursors.down.enabled = false;

      // 添加闪烁效果
      this.tweens.add({
        targets: this.winText,
        alpha: 0.3,
        duration: 500,
        yoyo: true,
        repeat: -1
      });
    }
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
  scene: GameScene
};

new Phaser.Game(config);